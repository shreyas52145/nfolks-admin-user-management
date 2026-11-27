# CLAUDE.md — AI Development Instructions

## Project Overview

Admin User Management SPA for NFolks Data Solutions. Two roles (admin, member) with JWT authentication, refresh-token rotation, and role-based access control.

## Monorepo Layout

- `frontend/` — Vite + React 19 + TypeScript SPA
- `mock-server/` — Express.js mock API with in-memory data
- `docs/` — Detailed technical documentation

## Tech Stack

### Frontend
React 19, TypeScript, Vite, React Router v7, TanStack Query, Axios, React Hook Form + Zod, TanStack Table, jwt-decode, Tailwind CSS v4, Lucide React

### Mock Server
Express.js, jsonwebtoken, uuid, in-memory storage

### Testing
Vitest, React Testing Library

## Key Conventions

### Architecture
- Feature-based folder structure under `src/features/`
- Shared types in `src/types/`
- API layer in `src/api/` — thin typed functions, no logic in components
- Auth logic in `src/auth/` — context, token manager, route guards

### State Management
- React Context for auth state only — no Redux or Zustand
- TanStack Query for all server state (users, invitations, profile)
- No duplicated state between Context and Query

### Authentication Rules
- Access token stored in memory (JS variable in token-manager.ts)
- Refresh token stored in localStorage
- Single-flight refresh: only one refresh request in flight at a time
- Reactive refresh strategy: refresh on 401 TOKEN_EXPIRED
- Pre-check exp in request interceptor to avoid obviously expired requests
- Never retry a request more than once
- On refresh failure: clear tokens, redirect to sign-in with message

### API Communication
- All API calls go through the Axios instance in `src/api/client.ts`
- Request interceptor attaches Bearer token
- Response interceptor handles 401 refresh + retry
- Never call axios directly from components

### Mock Server
- Express on port 3001, Vite proxies /api/* to it
- Real JWTs with sub, role, exp claims
- Refresh token rotation with reuse detection
- 300-800ms simulated latency
- Shared in-memory store across all clients

## Before Modifying Existing Features

Read the relevant documentation in `docs/` first:
- Auth changes → `docs/authentication-flow.md`, `docs/token-management.md`
- API changes → `docs/api-contract.md`
- Role/access changes → `docs/role-based-access.md`
- Architecture changes → `docs/architecture.md`, `docs/project-structure.md`

## Coding Standards

- TypeScript strict mode
- No `any` — use proper types
- Small focused functions
- No unnecessary abstractions
- Loading, error, empty states for all data-fetching components
- Accessible forms and tables
