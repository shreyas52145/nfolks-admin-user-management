# Token Management

## Token Storage

| Token | Storage | Rationale |
|-------|---------|-----------|
| Access token | JavaScript variable (`token-manager.ts`) | Never persisted. Invisible to `localStorage`/`document.cookie` reads from XSS |
| Refresh token | `localStorage` | Must survive page reloads for session restoration |

### Production Recommendation

In production with a real backend, both tokens should be delivered as `HttpOnly`, `Secure`, `SameSite=Strict` cookies set by the server. JavaScript never sees them. The browser sends them automatically.

## Token Manager (`src/auth/token-manager.ts`)

Centralized module with private state. All token operations go through this module.

### Responsibilities

- `setTokens(access, refresh)` — store new token pair
- `clearTokens()` — clear both tokens (sign out / failure)
- `getAccessToken()` / `getRefreshToken()` — read tokens
- `decodeAccessToken()` — decode JWT claims without verification
- `isAccessTokenExpired()` — check the `exp` claim
- `refreshTokens()` — single-flight refresh orchestration
- `onTokensChanged(callback)` — notify AuthContext when tokens change

### Single-Flight Refresh

The most critical pattern in the codebase. Prevents refresh token reuse when multiple requests fail simultaneously.

```typescript
let refreshPromise: Promise<TokenResponse> | null = null;

function refreshTokens(): Promise<TokenResponse> {
  if (refreshPromise) return refreshPromise;  // Piggyback on in-flight request

  refreshPromise = performRefresh()
    .finally(() => { refreshPromise = null; });

  return refreshPromise;
}
```

**How it works:**
1. Request A fails with 401 TOKEN_EXPIRED → calls `refreshTokens()`
2. `refreshPromise` is null → creates new Promise, starts refresh
3. Request B fails with 401 → calls `refreshTokens()`
4. `refreshPromise` is NOT null → returns the same Promise (no second HTTP call)
5. Refresh completes → both A and B get the result, retry with new token
6. `refreshPromise` is set back to null in `.finally()`

## Axios Interceptors (`src/api/client.ts`)

### Request Interceptor

1. If `Skip-Auth` header is set, remove it and skip auth (used for public endpoints)
2. Get access token from memory
3. If token exists and is expired, trigger proactive refresh before sending
4. Attach `Authorization: Bearer <token>` header

### Response Interceptor

1. If response is 2xx → pass through
2. If 401 TOKEN_EXPIRED and not already retried:
   - Mark request as `_retried` (prevents infinite loops)
   - Call `refreshTokens()` (single-flight)
   - On success → retry original request with new token
   - On failure → reject (triggers sign-out)
3. If 401 with fatal code (REFRESH_TOKEN_REUSED, SESSION_REVOKED, ACCOUNT_DEACTIVATED):
   - Clear tokens immediately
4. All other errors → reject normally

### Retry Safety

- Each request is retried at most once (`_retried` flag)
- Refresh failure during retry → original error propagates
- No infinite loops possible

## Refresh Failure Scenarios

| Scenario | Server Response | Frontend Action |
|----------|----------------|-----------------|
| Refresh token expired | 401 REFRESH_TOKEN_EXPIRED | Clear session, redirect to sign-in |
| Refresh token reused | 401 REFRESH_TOKEN_REUSED | Clear session, redirect to sign-in |
| Session revoked | 401 SESSION_REVOKED | Clear session, redirect to sign-in |
| Account deactivated | 401 ACCOUNT_DEACTIVATED | Clear session, show deactivation message |
| No refresh token | (local check) | Redirect to sign-in |
