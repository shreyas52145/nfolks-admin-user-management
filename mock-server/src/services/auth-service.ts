import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { config } from '../config.js';
import { users, refreshTokens } from '../data/seed.js';
import type { StoredUser, StoredRefreshToken } from '../data/seed.js';
import type { User, TokenResponse } from '../data/types.js';

function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
  };
}

function createAccessToken(user: StoredUser): string {
  return jwt.sign(
    { sub: user.id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: config.ACCESS_TOKEN_LIFETIME },
  );
}

function createRefreshToken(userId: string, family?: string): string {
  const token = uuid();
  const tokenFamily = family || uuid();

  refreshTokens.push({
    token,
    user_id: userId,
    expires_at: Date.now() + config.REFRESH_TOKEN_LIFETIME * 1000,
    used: false,
    family: tokenFamily,
  });

  return token;
}

function createTokenResponse(user: StoredUser, family?: string): TokenResponse {
  return {
    access_token: createAccessToken(user),
    refresh_token: createRefreshToken(user.id, family),
    token_type: 'Bearer',
    expires_in: config.ACCESS_TOKEN_LIFETIME,
  };
}

export function signIn(email: string, password: string): { user: User; tokens: TokenResponse } | { error: { code: string; message: string; status: number } } {
  const user = users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.', status: 401 } };
  }

  if (user.status === 'deactivated') {
    return { error: { code: 'ACCOUNT_DEACTIVATED', message: 'Your account has been deactivated.', status: 403 } };
  }

  const tokens = createTokenResponse(user);
  return { user: toPublicUser(user), tokens };
}

export function refresh(refreshToken: string): { tokens: TokenResponse } | { error: { code: string; message: string; status: number } } {
  const stored = refreshTokens.find((rt) => rt.token === refreshToken);

  if (!stored) {
    return { error: { code: 'TOKEN_INVALID', message: 'Invalid refresh token.', status: 401 } };
  }

  if (stored.used) {
    revokeFamily(stored.family);
    return { error: { code: 'REFRESH_TOKEN_REUSED', message: 'Refresh token reuse detected. Session revoked.', status: 401 } };
  }

  if (stored.expires_at < Date.now()) {
    return { error: { code: 'REFRESH_TOKEN_EXPIRED', message: 'Refresh token has expired.', status: 401 } };
  }

  const user = users.find((u) => u.id === stored.user_id);
  if (!user) {
    return { error: { code: 'TOKEN_INVALID', message: 'User not found.', status: 401 } };
  }

  if (user.status === 'deactivated') {
    return { error: { code: 'ACCOUNT_DEACTIVATED', message: 'Your account has been deactivated.', status: 401 } };
  }

  stored.used = true;
  const tokens = createTokenResponse(user, stored.family);
  return { tokens };
}

export function signOut(refreshToken: string): void {
  const stored = refreshTokens.find((rt) => rt.token === refreshToken);
  if (stored) {
    stored.used = true;
  }
}

export function revokeFamily(family: string): void {
  for (const rt of refreshTokens) {
    if (rt.family === family) {
      rt.used = true;
    }
  }
}

export function revokeAllForUser(userId: string): void {
  for (const rt of refreshTokens) {
    if (rt.user_id === userId) {
      rt.used = true;
    }
  }
}

export function verifyAccessToken(token: string): { sub: string; role: string } | null {
  try {
    const payload = jwt.verify(token, config.JWT_SECRET) as { sub: string; role: string };
    return payload;
  } catch {
    return null;
  }
}

export function decodeAccessToken(token: string): { sub: string; role: string; exp: number } | null {
  try {
    const payload = jwt.decode(token) as { sub: string; role: string; exp: number } | null;
    return payload;
  } catch {
    return null;
  }
}

export { toPublicUser, createTokenResponse };
