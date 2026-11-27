# Setup and Configuration

## Prerequisites

- Node.js 18+
- npm 9+

## Installation

```bash
# Install root, frontend, and mock-server dependencies in one command
npm run install:all
```

## Running Locally

```bash
# Start both frontend and mock server concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Mock API: http://localhost:3001

## Available Scripts

### Root

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend + mock server concurrently |
| `npm run dev:client` | Start frontend only |
| `npm run dev:server` | Start mock server only |
| `npm run install:all` | Install all dependencies |
| `npm run build` | Build frontend for production |
| `npm run test` | Run frontend tests |

### Frontend (`cd frontend`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run test` | Run Vitest tests |
| `npm run test:watch` | Run Vitest in watch mode |

### Mock Server (`cd mock-server`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with tsx watch (auto-reload) |
| `npm start` | Start without watch |

## Environment Variables

### Mock Server

Set these before starting the mock server to override defaults:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `JWT_SECRET` | `dev-secret-do-not-use-in-production` | JWT signing secret |
| `ACCESS_TOKEN_LIFETIME` | `60` | Access token lifetime in seconds |
| `REFRESH_TOKEN_LIFETIME` | `600` | Refresh token lifetime in seconds |
| `API_DELAY_MIN` | `300` | Minimum simulated latency (ms) |
| `API_DELAY_MAX` | `800` | Maximum simulated latency (ms) |
