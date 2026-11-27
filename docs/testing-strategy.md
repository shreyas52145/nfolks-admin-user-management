# Testing Strategy

## Tools

| Tool | Purpose |
|------|---------|
| Vitest | Test runner, compatible with Vite's config |
| @testing-library/react | Render components and query the DOM |
| @testing-library/jest-dom | Custom matchers for DOM assertions |
| @testing-library/user-event | Simulate user interactions |
| jsdom | Browser-like environment in Node |

## Running Tests

```bash
# Run all tests once
cd frontend && npm run test

# Run in watch mode
cd frontend && npm run test:watch
```

## Test Focus Areas

### Token Manager (`token-manager.test.ts`)

| Test | What It Verifies |
|------|-----------------|
| setTokens stores correctly | Access token in memory, refresh token in localStorage |
| clearTokens removes both | Memory and localStorage both cleared |
| decodeAccessToken reads claims | sub, role extracted from JWT |
| isAccessTokenExpired checks exp | Expired/valid/missing tokens handled |
| refreshTokens calls API | New tokens stored after refresh |
| **Concurrent refresh (single-flight)** | 3 simultaneous calls produce 1 HTTP request |
| Refresh failure clears tokens | Session cleaned up on 401 |
| No refresh token throws | Explicit error when localStorage is empty |

### Route Guards (`AuthContext.test.tsx`)

| Test | What It Verifies |
|------|-----------------|
| ProtectedRoute redirects unauthenticated | Sign-in page shown when no session |
| ProtectedRoute shows loading | Spinner while session is being restored |
| AdminRoute redirects unauthenticated | Sign-in page shown for non-logged-in users |

## What These Tests Cover

The tests prioritize **authentication edge cases** over UI snapshot tests:

1. **Token storage isolation** — access token never touches localStorage
2. **Single-flight refresh** — the thundering-herd guard works correctly
3. **Failure cleanup** — session is properly destroyed on refresh failure
4. **Route protection** — unauthenticated access is blocked

## Test Architecture

Tests use:
- Real token-manager module (not mocked)
- Mock JWT creation via `btoa` (base64-encoded JSON, no real signing)
- `vi.stubGlobal('fetch')` for refresh API calls
- React Testing Library for component rendering with MemoryRouter
