# Technology Stack

## Frontend

| Library | Version | Purpose | Why This One |
|---------|---------|---------|-------------|
| React | 19 | UI framework | Assignment requirement |
| TypeScript | 7 | Type safety | Assignment requirement, catches bugs at compile time |
| Vite | 8 | Build tool, dev server | Fast HMR, built-in proxy for API routing, modern defaults |
| React Router | 7 | Client-side routing | Standard React routing, supports loaders and protected routes |
| TanStack Query | 5 | Server state management | Handles caching, refetching, loading/error states automatically. Eliminates manual useEffect + useState for API calls |
| Axios | 1.9 | HTTP client | Interceptors for attaching tokens and handling 401 refresh. fetch() lacks interceptor support |
| React Hook Form | 7 | Form state management | Minimal re-renders, uncontrolled inputs by default, easy validation integration |
| Zod | 3 | Schema validation | TypeScript-first; define the shape once, get both runtime validation and TS types |
| @hookform/resolvers | 5 | Bridges Zod with React Hook Form | Standard integration glue |
| TanStack Table | 8 | Data table | Headless — full control over rendering while getting sort, pagination, and filter logic |
| jwt-decode | 4 | Decode JWT claims | Read exp, sub, role from access tokens client-side (server does verification) |
| Tailwind CSS | 4 | Utility-first CSS | Fast to build with, no separate CSS files, consistent design system |
| Lucide React | 0.515 | Icons | Small, tree-shakeable SVG icon library |

## Mock Server

| Library | Version | Purpose |
|---------|---------|---------|
| Express.js | 5 | HTTP server framework |
| jsonwebtoken | 9 | Sign and verify JWTs with HS256 |
| uuid | 11 | Generate unique IDs for users, invitations, refresh tokens |
| cors | 2.8 | CORS headers for direct API testing |
| tsx | 4 | Run TypeScript directly without build step |

## Testing

| Library | Purpose |
|---------|---------|
| Vitest | Test runner, same config ecosystem as Vite |
| @testing-library/react | Render components and query the DOM like a real user |
| @testing-library/jest-dom | Custom matchers (toBeInTheDocument, toBeDisabled, etc.) |
| @testing-library/user-event | Simulate realistic user interactions (click, type, etc.) |
| jsdom | Browser-like environment for running tests in Node |

## Libraries Explicitly Not Used

| Library | Why Not |
|---------|---------|
| Redux / Zustand | Auth state is small enough for React Context; server state is handled by TanStack Query |
| MSW (Mock Service Worker) | Runs per-tab; a shared Express server supports cross-tab data visibility |
| Styled Components / CSS Modules | Tailwind is sufficient and faster to iterate with |
| Formik | React Hook Form has better performance and TypeScript support |
