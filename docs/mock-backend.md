# Mock Backend

## Architecture

The mock backend is a standalone Express.js server (`mock-server/`) with in-memory data storage. It runs as a separate process on port 3001.

### Why Not MSW

MSW (Mock Service Worker) runs inside each browser tab's service worker. Data changes in one tab are invisible to another. The assignment requires cross-tab data visibility, so we use a shared Express server.

## In-Memory Data Stores

```typescript
// Users (including password — never returned in API responses)
users: StoredUser[]

// Refresh tokens (tracked for rotation and reuse detection)
refreshTokens: StoredRefreshToken[]
  // { token, user_id, expires_at, used, family }

// Invitations
invitations: StoredInvitation[]
  // { id, email, role, token, expires_at, used, revoked }
```

## JWT Implementation

- Algorithm: HS256
- Secret: `dev-secret-do-not-use-in-production` (configurable via `JWT_SECRET` env var)
- Access token claims: `{ sub: userId, role: "admin"|"member", iat, exp }`
- Signed with `jsonwebtoken` library

## Refresh Token Rotation

Each refresh token belongs to a **family** (a UUID assigned at sign-in). When a token is refreshed:

1. Mark the old refresh token as `used`
2. Create a new refresh token in the same family
3. Return the new token pair

### Reuse Detection

If a client presents a refresh token that has already been `used`:

1. **This is potential token theft** — an attacker might have stolen a previous token
2. Revoke ALL tokens in that family (every token created since the user signed in)
3. Return 401 REFRESH_TOKEN_REUSED
4. The user must sign in again

## Seed Data

| User | Email | Password | Role | Status |
|------|-------|----------|------|--------|
| Admin User | admin@nfolks.dev | Admin123 | admin | active |
| Admin Two | admin2@nfolks.dev | Admin123 | admin | active |
| Members 1-25 | member{n}@nfolks.dev | Member123 | member | active |
| Members 26-30 | member{n}@nfolks.dev | Member123 | member | deactivated |

30 members with generated first/last names, 5 of them deactivated.

## API Latency

Every `/api/*` request is delayed by 300-800ms (random) to simulate real network conditions. Configurable via `API_DELAY_MIN` and `API_DELAY_MAX` environment variables.

## Middleware Stack

1. `express.json()` — parse JSON request bodies
2. `cors()` — CORS headers
3. `delayMiddleware` — simulated latency on /api/* routes
4. `authMiddleware` — verify JWT, extract userId and role (on protected routes)
5. `adminMiddleware` — check role === 'admin' (on admin routes)

## Configurable Settings

All in `mock-server/src/config.ts`, overridable via environment variables:

| Setting | Default | Env Var |
|---------|---------|---------|
| Port | 3001 | `PORT` |
| JWT secret | dev-secret-... | `JWT_SECRET` |
| Access token lifetime | 60s | `ACCESS_TOKEN_LIFETIME` |
| Refresh token lifetime | 600s (10min) | `REFRESH_TOKEN_LIFETIME` |
| Min API delay | 300ms | `API_DELAY_MIN` |
| Max API delay | 800ms | `API_DELAY_MAX` |
