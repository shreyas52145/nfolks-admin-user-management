# Authentication Flow

## Sign In

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Mock Server

    U->>FE: Enter email + password
    FE->>API: POST /api/auth/signin
    API-->>FE: 200 { user, access_token, refresh_token }
    FE->>FE: Store access_token in memory
    FE->>FE: Store refresh_token in localStorage
    FE->>FE: Decode JWT → set user + role in AuthContext
    FE->>U: Navigate to dashboard
```

## Sign Out

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant API as Mock Server

    U->>FE: Click Sign Out
    FE->>API: POST /api/auth/signout { refresh_token }
    API-->>FE: 204
    FE->>FE: Clear access_token from memory
    FE->>FE: Clear refresh_token from localStorage
    FE->>FE: Clear AuthContext state
    FE->>U: Navigate to sign-in page
```

## Session Restore (Page Reload)

When the page loads, AuthContext checks for a refresh token in localStorage:

```mermaid
sequenceDiagram
    participant FE as Frontend (mount)
    participant API as Mock Server

    FE->>FE: Check localStorage for refresh_token
    alt No refresh token
        FE->>FE: Mark as unauthenticated, show sign-in
    else Has refresh token
        FE->>API: POST /api/auth/refresh { refresh_token }
        alt Refresh succeeds
            API-->>FE: 200 { new access_token, new refresh_token }
            FE->>API: GET /api/users/me
            API-->>FE: 200 User
            FE->>FE: Restore session with user data
        else Refresh fails
            API-->>FE: 401
            FE->>FE: Clear tokens, show sign-in
        end
    end
```

## Token Refresh (on API request)

```mermaid
sequenceDiagram
    participant C as Component
    participant AX as Axios Interceptor
    participant TM as Token Manager
    participant API as Mock Server

    C->>AX: API request
    AX->>TM: Check if access token expired
    alt Token expired (pre-send check)
        AX->>TM: refreshTokens() [single-flight]
        TM->>API: POST /api/auth/refresh
        API-->>TM: New tokens
        TM->>AX: Updated token
    end
    AX->>API: Request with Bearer token
    alt 401 TOKEN_EXPIRED
        AX->>TM: refreshTokens() [single-flight]
        TM->>API: POST /api/auth/refresh
        API-->>TM: New tokens
        AX->>API: Retry original request
    end
    AX-->>C: Response
```

## Deactivation

When an admin deactivates another user:

1. Server revokes all of the deactivated user's refresh tokens
2. The deactivated user's next refresh attempt returns 401 ACCOUNT_DEACTIVATED
3. The frontend clears their session and redirects to sign-in with a message
4. If the deactivated user tries to sign in, they get 403 ACCOUNT_DEACTIVATED

## Role Change

When an admin changes another user's role:

1. The change is stored server-side immediately
2. The affected user's current access token still carries the old role
3. At the next token refresh (within 60 seconds), the new access token carries the new role
4. AuthContext compares the new token's role with the current state
5. If different: AuthContext updates, navigation re-renders, unauthorized pages redirect
