# Role-Based Access

## Roles

| Role | Capabilities |
|------|-------------|
| **Admin** | All features: user list, edit users, deactivate/reactivate, invite users, manage invitations, own profile, change password |
| **Member** | Own profile, change password only |

## Frontend Route Protection

Three route guard components in `src/auth/`:

| Component | Purpose | Redirects to |
|-----------|---------|-------------|
| `ProtectedRoute` | Requires authentication | `/signin` |
| `AdminRoute` | Requires admin role | `/` (home) |
| `GuestRoute` | Blocks authenticated users | `/` (home) |

### How They Work

Each guard reads from `AuthContext`:
- `isLoading` → show spinner (prevents flash of wrong content)
- `isAuthenticated` → check if signed in
- `role` → check if admin

**Direct URL protection**: Typing `/users` in the address bar goes through the same route guards. A member navigating to `/users` is redirected to `/`.

### Why Frontend Guards Are Not Security

Frontend route guards improve UX but provide zero security. Any user can:
- Open browser DevTools and modify JavaScript
- Call API endpoints directly with curl or Postman
- Forge a fake role in a modified JWT (but the server verifies the signature)

**Real security happens on the server**: the mock server's `adminMiddleware` checks the JWT `role` claim on every request. Frontend guards are just UX conveniences.

## Role Changes

When an admin changes another user's role:

1. The server updates the user record immediately
2. The affected user's **current access token still carries the old role**
3. Within 60 seconds, the access token expires
4. The Axios interceptor triggers a refresh
5. The new access token carries the **new role**
6. `token-manager.ts` calls `onTokensChanged`
7. `AuthContext` compares new role with current state
8. If different → updates state → React re-renders
9. Navigation hides/shows admin links automatically
10. `AdminRoute` redirects if the user is on an admin page

## 401 vs 403 Handling

| Status | Meaning | Frontend Action |
|--------|---------|-----------------|
| 401 TOKEN_EXPIRED | Access token expired | Refresh tokens, retry request |
| 401 ACCOUNT_DEACTIVATED | Account disabled | Clear session, show message |
| 401 SESSION_REVOKED | Refresh token reuse detected | Clear session, redirect to sign-in |
| 403 FORBIDDEN | Not an admin | Show error (component handles it) |
| 403 ACCOUNT_DEACTIVATED | Deactivated user tried to sign in | Show deactivation message |

## Admin Self-Protection

The server enforces:
- **Cannot change own role** → 409 CANNOT_CHANGE_OWN_ROLE
- **Cannot deactivate self** → 409 CANNOT_DEACTIVATE_SELF

The frontend also disables the role dropdown and hides the deactivate button for the current user.
