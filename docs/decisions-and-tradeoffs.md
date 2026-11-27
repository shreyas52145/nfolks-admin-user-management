# Decisions and Tradeoffs

## Separate Express Server vs MSW

**Decision**: Use a standalone Express.js server instead of MSW.

**Why**: The assignment requires cross-tab data visibility — changes by one admin should be visible to another user in a different tab. MSW runs inside each tab's service worker with its own data. Express shares one in-memory store.

**Tradeoff**: Requires running a second process. Mitigated by the `concurrently` package and the `npm run dev` root script.

## Token Storage: Memory + localStorage

**Decision**: Access token in JS memory, refresh token in localStorage.

**Why**: The access token is used on every request and is short-lived (60s). Keeping it in memory means XSS attacks cannot read it from browser storage APIs. The refresh token must survive page reloads, so it goes in localStorage.

**Tradeoff**: localStorage is readable by any JavaScript on the page (XSS risk). In production, tokens would be delivered as HttpOnly, Secure, SameSite cookies set by the server.

## Reactive vs Proactive Token Refresh

**Decision**: Primarily reactive (refresh on 401), with a pre-send expiry check.

**Why**: Reactive is simpler — no timers to manage, no race conditions with timer cleanup. The pre-send check avoids sending requests we know will fail (by checking the token's `exp` claim), which is a minor optimization.

**Tradeoff**: The first request after token expiry will fail and be retried. With a 60-second token lifetime and the pre-send check, this rarely happens in practice.

## React Context vs Redux/Zustand for Auth

**Decision**: React Context for auth state only.

**Why**: Auth state is small (user, role, isAuthenticated) and changes infrequently (sign in, sign out, role change). Context re-renders are not a performance concern at this scale. TanStack Query handles all server-state caching.

**Tradeoff**: None meaningful at this scale. Redux would add boilerplate without benefit.

## Axios vs fetch

**Decision**: Axios.

**Why**: Built-in interceptors for attaching tokens and handling 401 refresh/retry. With fetch, you'd need to wrap every call or build a custom interceptor system.

**Tradeoff**: Additional dependency (~15KB). Worth it for the interceptor architecture.

_More decisions will be documented as implementation progresses._
