import { jwtDecode } from 'jwt-decode';
import type { AccessTokenClaims, TokenResponse } from '../types';

const REFRESH_TOKEN_KEY = 'refresh_token';

let accessToken: string | null = null;
let onChangeCallback: (() => void) | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  onChangeCallback?.();
}

export function clearTokens(): void {
  accessToken = null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  onChangeCallback?.();
}

export function onTokensChanged(callback: () => void): () => void {
  onChangeCallback = callback;
  return () => {
    if (onChangeCallback === callback) {
      onChangeCallback = null;
    }
  };
}

export function decodeAccessToken(): AccessTokenClaims | null {
  if (!accessToken) return null;
  try {
    return jwtDecode<AccessTokenClaims>(accessToken);
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(): boolean {
  const claims = decodeAccessToken();
  if (!claims) return true;
  return claims.exp * 1000 <= Date.now();
}

let refreshPromise: Promise<TokenResponse> | null = null;

export async function refreshTokens(): Promise<TokenResponse> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = performRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function performRefresh(): Promise<TokenResponse> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    clearTokens();
    const code = data?.error?.code || 'REFRESH_FAILED';
    const message = data?.error?.message || 'Session expired. Please sign in again.';
    const error = new Error(message);
    (error as Error & { code: string }).code = code;
    throw error;
  }

  const data: TokenResponse = await response.json();
  setTokens(data.access_token, data.refresh_token);
  return data;
}
