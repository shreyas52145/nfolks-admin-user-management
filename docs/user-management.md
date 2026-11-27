# User Management

## Features (Admin Only)

### User List Table

- Server-side pagination (10 users per page)
- Search by first name, last name, or email
- Sort by name, email, or created date (ascending/descending)
- Filter by status (all, active, deactivated)

### Edit User

- Modal dialog with form
- Edit first name, last name, and role
- Role dropdown disabled when editing own user (cannot change own role)
- Zod validation on all fields

### Deactivate User

- Inline button on each user row
- Not shown for the current user (cannot deactivate self)
- Server revokes all refresh tokens for the deactivated user
- Deactivated user is signed out at their next token refresh

### Reactivate User

- Inline button shown only for deactivated users
- Restores account to active status
- User can sign in again after reactivation

## Implementation

### Components

| Component | File | Purpose |
|-----------|------|---------|
| UserListPage | `src/features/users/UserListPage.tsx` | Main page with table, search, filter, pagination |
| EditUserDialog | `src/features/users/EditUserDialog.tsx` | Modal form for editing user details |

### Hooks (`src/features/users/hooks.ts`)

| Hook | Query Key | API Call |
|------|-----------|---------|
| `useUsers(params)` | `['users', params]` | `GET /api/users` |
| `useUpdateUser()` | — | `PATCH /api/users/:id` |
| `useDeactivateUser()` | — | `POST /api/users/:id/deactivate` |
| `useReactivateUser()` | — | `POST /api/users/:id/reactivate` |

All mutations invalidate the `['users']` query key on success, so the table refreshes automatically.
