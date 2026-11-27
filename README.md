# NFolks Admin User Management

An admin user management single-page application built with React and TypeScript, featuring JWT-based authentication with refresh-token rotation and role-based access control.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript, Vite, React Router, TanStack Query, Axios, React Hook Form + Zod, TanStack Table, Tailwind CSS |
| Mock Backend | Express.js, jsonwebtoken, in-memory storage |
| Testing | Vitest, React Testing Library |

## Features

- **Authentication** — Sign in / sign out with JWT access and refresh tokens
- **Token Management** — Automatic refresh with rotation, single-flight concurrent handling
- **Role-Based Access** — Admin and Member roles with protected routes
- **User Management** (Admin) — List, search, sort, filter, edit, deactivate/reactivate users
- **Profile** — View and edit own profile, change password
- **Invitations** (Admin) — Invite users, manage pending invitations, accept invitation flow

## Prerequisites

- Node.js 18+
- npm 9+

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd nfolks-admin-user-management

# 2. Install all dependencies (root + frontend + mock-server)
npm run install:all

# 3. Start both frontend and mock server
npm run dev
```

The frontend runs at **http://localhost:5173** and the mock API at **http://localhost:3001**.

## Seeded Credentials

| Email | Password | Role |
|-------|----------|------|
| `admin@nfolks.dev` | `Admin123` | Admin |
| `admin2@nfolks.dev` | `Admin123` | Admin |
| `member1@nfolks.dev` | `Member123` | Member |
| `member2@nfolks.dev` | `Member123` | Member |
| ... (30 members total, 5 deactivated) | | |

## Environment Variables

### Mock Server

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `ACCESS_TOKEN_LIFETIME` | `60` | Access token lifetime in seconds |
| `REFRESH_TOKEN_LIFETIME` | `600` | Refresh token lifetime in seconds |
| `JWT_SECRET` | `dev-secret-...` | JWT signing secret (dev only) |

## Project Structure

```
nfolks-admin-user-management/
├── frontend/              # React SPA
│   └── src/
│       ├── app/           # App shell: providers, routes, layout
│       ├── api/           # Typed API client and endpoint functions
│       ├── auth/          # AuthContext, token manager, route guards
│       ├── features/      # Feature modules with barrel exports
│       ├── shared/        # Reusable UI components (Spinner, etc.)
│       └── types/         # TypeScript type definitions
├── mock-server/           # Express mock API
│   └── src/
│       ├── routes/        # API route handlers
│       ├── services/      # Business logic
│       ├── middleware/     # Auth, admin, delay middleware
│       └── data/          # Seed data
└── docs/                  # Detailed technical documentation
```

## Token and Role Handling Design

### Storage

- **Access token**: Kept in JavaScript memory (variable in `token-manager.ts`). Never written to localStorage or cookies. Lost on page reload by design.
- **Refresh token**: Stored in `localStorage`. Survives page reload so the session can be restored.

### Why This Storage Strategy

The access token is short-lived (60s) and used on every request — keeping it in memory means XSS cannot read it from storage APIs. The refresh token must survive page reloads, so it goes in localStorage. In production with a real backend, both tokens would be delivered as HttpOnly, Secure, SameSite cookies — the server sets them, the browser sends them automatically, and JavaScript never sees them.

**Why hiding admin UI on the frontend is not a security control**: Any user can open browser DevTools, modify JavaScript, or call API endpoints directly. Frontend route guards and hidden navigation improve UX but provide zero security. The real authorization happens on the server, which checks the JWT role claim on every request. The mock server enforces this.

### Refresh Strategy

Reactive refresh: when a request receives a 401 TOKEN_EXPIRED response, the interceptor triggers a refresh. As an optimization, the request interceptor also checks the access token's `exp` claim before sending — if it's already expired, it refreshes proactively to avoid a wasted round trip.

### Concurrent Request Handling

If multiple requests fail with 401 at the same time, only one refresh call is made. The others wait for the same Promise (single-flight pattern). After the refresh succeeds, all waiting requests retry with the new token.

### Role Changes

When an admin changes another user's role, the change takes effect at that user's next token refresh. The frontend compares the `role` claim in each new access token with the current state. If it changed, the AuthContext updates, navigation re-renders, and any unauthorized page redirects automatically.

### Deactivation

Deactivating a user revokes all their refresh tokens server-side. Their next refresh attempt fails with 401 ACCOUNT_DEACTIVATED, and the UI signs them out with a clear message.

## Documentation

See [docs/](docs/) for detailed technical documentation including architecture, authentication flows, API contract, and design decisions.

## AI Assistant

This project was built with Claude Code as the AI coding assistant. The instruction file is [CLAUDE.md](CLAUDE.md).

### What the AI Got Wrong and How It Was Corrected

_To be completed after development._

### What I Would Improve With More Time

_To be completed after development._
