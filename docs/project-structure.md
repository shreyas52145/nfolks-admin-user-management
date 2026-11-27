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
├── App.tsx                         # Root component, router setup
├── index.css                       # Tailwind CSS import
├── test-setup.ts                   # Vitest setup (jest-dom matchers)
│
├── api/                            # API communication layer
│   ├── client.ts                   # Axios instance + interceptors
│   ├── auth.ts                     # signIn, signOut, refresh API calls
│   ├── users.ts                    # User CRUD API calls
│   └── invitations.ts              # Invitation API calls
│
├── auth/                           # Authentication system
│   ├── AuthContext.tsx              # React Context for auth state
│   ├── token-manager.ts            # Token storage, decode, refresh
│   ├── ProtectedRoute.tsx          # Requires authenticated user
│   ├── AdminRoute.tsx              # Requires admin role
│   └── GuestRoute.tsx              # Redirects if already signed in
│
├── features/                       # Feature-based pages
│   ├── sign-in/
│   │   └── SignInPage.tsx
│   ├── users/                      # Admin user management
│   │   ├── UserListPage.tsx
│   │   ├── UserTable.tsx
│   │   ├── EditUserDialog.tsx
│   │   └── hooks.ts
│   ├── profile/
│   │   ├── ProfilePage.tsx
│   │   └── ChangePasswordPage.tsx
│   └── invitations/
│       ├── InviteUserPage.tsx
│       ├── PendingInvitationsPage.tsx
│       ├── AcceptInvitationPage.tsx
│       └── hooks.ts
│
├── components/                     # Shared UI components
│   ├── Layout.tsx
│   ├── Spinner.tsx
│   ├── ErrorMessage.tsx
│   ├── Pagination.tsx
│   ├── StatusBadge.tsx
│   └── DevPanel.tsx
│
└── types/
    └── index.ts                    # All TypeScript types and interfaces
```

### Where to Add New Features

- New pages → `src/features/<feature-name>/`
- New shared components → `src/components/`
- New API endpoints → `src/api/<domain>.ts`
- New types → `src/types/index.ts`

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
