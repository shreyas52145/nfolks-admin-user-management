import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAccessTokenExpired,
  decodeAccessToken,
  refreshTokens,
} from '../token-manager';

function createMockJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload));
  return `${header}.${body}.fake-signature`;
}

beforeEach(() => {
  clearTokens();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('token-manager', () => {
  describe('setTokens / getAccessToken / getRefreshToken', () => {
    it('stores access token in memory and refresh token in localStorage', () => {
      setTokens('access-123', 'refresh-456');

      expect(getAccessToken()).toBe('access-123');
      expect(getRefreshToken()).toBe('refresh-456');
      expect(localStorage.getItem('refresh_token')).toBe('refresh-456');
    });
  });

  describe('clearTokens', () => {
    it('removes both tokens', () => {
      setTokens('access', 'refresh');
      clearTokens();

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('decodeAccessToken', () => {
    it('decodes claims from a JWT', () => {
      const jwt = createMockJwt({ sub: 'user-1', role: 'admin', exp: 9999999999 });
      setTokens(jwt, 'refresh');

      const claims = decodeAccessToken();
      expect(claims).toMatchObject({ sub: 'user-1', role: 'admin' });
    });

    it('returns null when no access token exists', () => {
      expect(decodeAccessToken()).toBeNull();
    });
  });

  describe('isAccessTokenExpired', () => {
    it('returns true when token is expired', () => {
      const jwt = createMockJwt({ sub: 'user-1', role: 'admin', exp: 1000 });
      setTokens(jwt, 'refresh');

      expect(isAccessTokenExpired()).toBe(true);
    });

    it('returns false when token is valid', () => {
      const jwt = createMockJwt({ sub: 'user-1', role: 'admin', exp: 9999999999 });
      setTokens(jwt, 'refresh');

      expect(isAccessTokenExpired()).toBe(false);
    });

    it('returns true when no token exists', () => {
      expect(isAccessTokenExpired()).toBe(true);
    });
  });

  describe('refreshTokens (single-flight)', () => {
    it('calls refresh API and stores new tokens', async () => {
      const newAccessJwt = createMockJwt({ sub: 'user-1', role: 'admin', exp: 9999999999 });

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          access_token: newAccessJwt,
          refresh_token: 'new-refresh',
          token_type: 'Bearer',
          expires_in: 60,
        }),
      }));

      setTokens('old-access', 'old-refresh');
      const result = await refreshTokens();

      expect(result.access_token).toBe(newAccessJwt);
      expect(getRefreshToken()).toBe('new-refresh');
    });

    it('concurrent calls share one request (single-flight)', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          access_token: createMockJwt({ sub: 'u', role: 'admin', exp: 9999999999 }),
          refresh_token: 'new-refresh',
          token_type: 'Bearer',
          expires_in: 60,
        }),
      });

      vi.stubGlobal('fetch', fetchMock);
      setTokens('old-access', 'old-refresh');

      const [r1, r2, r3] = await Promise.all([
        refreshTokens(),
        refreshTokens(),
        refreshTokens(),
      ]);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(r1).toBe(r2);
      expect(r2).toBe(r3);
    });

    it('clears tokens on refresh failure', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({
          error: { code: 'REFRESH_TOKEN_EXPIRED', message: 'Expired' },
        }),
      }));

      setTokens('old-access', 'old-refresh');

      await expect(refreshTokens()).rejects.toThrow();
      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });

    it('throws when no refresh token exists', async () => {
      await expect(refreshTokens()).rejects.toThrow('No refresh token available');
    });
  });
});
