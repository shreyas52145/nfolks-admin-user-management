# Architecture

## Overview

The application is a monorepo with two independent processes:

- **Frontend** — A React single-page application served by Vite's dev server (port 5173)
- **Mock Server** — An Express.js API server with in-memory data (port 3001)

Vite's dev server proxies all `/api/*` requests to the mock server, so the frontend uses relative URLs (`/api/auth/signin`) without worrying about CORS or ports.

## System Diagram

```mermaid
graph LR
    subgraph Browser
        A[React SPA<br/>port 5173]
    end

    subgraph Vite Dev Server
        B[Static files + HMR]
        C[Proxy /api/*]
    end

    subgraph Mock Server
        D[Express.js<br/>port 3001]
        E[In-Memory Store]
    end

    A --> B
    A -->|/api/*| C
    C -->|proxy| D
    D --> E
```

## Why a Separate Server Instead of MSW

The assignment requires that changes made by an admin are visible to other users in another tab or browser profile. MSW (Mock Service Worker) runs inside each browser tab's service worker — data changes in tab A are invisible to tab B. A standalone Express server shares one in-memory store across all clients.

## Frontend Architecture

```mermaid
graph TD
    subgraph "React Application"
        Router[React Router]
        Auth[AuthContext + TokenManager]
        API[Axios Client + Interceptors]
        
        subgraph Features
            SignIn[Sign In]
            Users[User Management]
            Profile[Profile]
            Invitations[Invitations]
        end
        
        subgraph Shared
            Components[UI Components]
            Types[TypeScript Types]
        end
    end

    Router --> Auth
    Auth --> API
    Features --> API
    Features --> Auth
    Features --> Components
    API -->|HTTP| MockServer[Mock Server]
```

### Data Flow

1. **User actions** trigger feature components
2. Feature components call **API functions** (typed wrappers around Axios)
3. The **Axios interceptor** attaches the access token and handles 401 refresh
4. **TanStack Query** manages caching, loading states, and refetching
5. **AuthContext** holds the current user and role, updated when tokens change

## Mock Server Architecture

```mermaid
graph TD
    Request[Incoming Request] --> Delay[Delay Middleware<br/>300-800ms]
    Delay --> AuthMW{Auth Required?}
    AuthMW -->|No| Handler[Route Handler]
    AuthMW -->|Yes| Verify[Verify JWT]
    Verify -->|Valid| AdminMW{Admin Required?}
    Verify -->|Invalid| E401[401 Response]
    AdminMW -->|No| Handler
    AdminMW -->|Yes| CheckRole{role == admin?}
    CheckRole -->|Yes| Handler
    CheckRole -->|No| E403[403 Response]
    Handler --> Service[Service Layer]
    Service --> Store[In-Memory Data]
```
