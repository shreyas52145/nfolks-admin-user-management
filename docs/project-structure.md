# Project Structure

## Root

```
nfolks-admin-user-management/
├── frontend/           # React SPA
├── mock-server/        # Express mock API
├── docs/               # Technical documentation
├── CLAUDE.md           # AI assistant instructions
├── README.md           # Project introduction and setup
├── package.json        # Root scripts (dev, install:all, etc.)
└── .gitignore
```

## Frontend (`frontend/src/`)

```
src/
├── main.tsx                        # Entry point, renders App
├── index.css                       # Tailwind CSS import
├── test-setup.ts                   # Vitest setup (jest-dom matchers)
│
├── app/                            # Application shell and wiring
│   ├── App.tsx                     # Slim root: Providers + AppRoutes
│   ├── providers.tsx               # QueryClient, BrowserRouter, AuthProvider
│   ├── routes.tsx                  # All route definitions
│   └── Layout.tsx                  # Sidebar, navigation, Outlet
│
├── api/                            # API communication layer
│   ├── client.ts                   # Axios instance + interceptors
│   ├── auth.ts                     # signIn, signOut, fetchCurrentUser
│   ├── users.ts                    # User CRUD + profile API calls
│   └── invitations.ts              # Invitation API calls
│
├── auth/                           # Shared authentication kernel
│   ├── AuthContext.tsx              # React Context for auth state
│   ├── token-manager.ts            # Token storage, decode, refresh
│   ├── ProtectedRoute.tsx          # Requires authenticated user
│   ├── AdminRoute.tsx              # Requires admin role
│   ├── GuestRoute.tsx              # Redirects if already signed in
│   └── __tests__/                  # Auth unit tests
│       ├── token-manager.test.ts
│       └── AuthContext.test.tsx
│
├── features/                       # Feature modules (barrel-exported)
│   ├── sign-in/
│   │   ├── SignInPage.tsx
│   │   └── index.ts
│   ├── users/
│   │   ├── UserListPage.tsx
│   │   ├── EditUserDialog.tsx
│   │   ├── hooks.ts
│   │   └── index.ts
│   ├── profile/
│   │   ├── ProfilePage.tsx
│   │   ├── ChangePasswordPage.tsx
│   │   └── index.ts
│   └── invitations/
│       ├── InvitationsPage.tsx
│       ├── AcceptInvitationPage.tsx
│       ├── hooks.ts
│       └── index.ts
│
├── shared/components/              # Reusable UI components
│   └── Spinner.tsx
│
└── types/
    └── index.ts                    # All TypeScript types and interfaces
```

### Where to Add New Features

- New pages → `src/features/<feature-name>/` with an `index.ts` barrel export
- New shared components → `src/shared/components/`
- New API endpoints → `src/api/<domain>.ts`
- New types → `src/types/index.ts`
- App-level wiring (providers, routes) → `src/app/`

## Mock Server (`mock-server/src/`)

```
src/
├── index.ts                        # Express app bootstrap
├── config.ts                       # Configurable settings
├── middleware/
│   ├── auth.ts                     # JWT verification
│   ├── admin.ts                    # Admin role check
│   └── delay.ts                    # Simulated API latency
├── routes/
│   ├── auth.ts                     # /api/auth/* endpoints
│   ├── users.ts                    # /api/users/* endpoints
│   └── invitations.ts              # /api/invitations/* endpoints
├── services/
│   ├── auth-service.ts             # JWT generation, refresh rotation
│   ├── user-service.ts             # User CRUD operations
│   └── invitation-service.ts       # Invitation CRUD operations
└── data/
    └── seed.ts                     # Initial users and data
```
