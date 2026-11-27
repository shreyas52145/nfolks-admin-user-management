# API Contract

All requests and responses use JSON. Endpoints marked with 🔒 require `Authorization: Bearer <access_token>`. Endpoints marked with 🛡 additionally require the `admin` role.

## Token Response

Returned by sign in, invitation acceptance, and refresh:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "uuid-string",
  "token_type": "Bearer",
  "expires_in": 60
}
```

## Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message.",
    "fields": { "field_name": "Error for this field" }
  }
}
```

`fields` is optional and only present for validation errors.

## Authentication Endpoints

| Method | Endpoint | Body | Success | Errors |
|--------|----------|------|---------|--------|
| POST | `/api/auth/signin` | `{ email, password }` | 200 `{ user, ...token }` | 401 invalid, 403 deactivated |
| POST | `/api/auth/refresh` | `{ refresh_token }` | 200 token response | 401 expired/invalid/reused/revoked/deactivated |
| POST | `/api/auth/signout` | `{ refresh_token }` | 204 | — |

## Current User Endpoints

| Method | Endpoint | Body | Success | Errors |
|--------|----------|------|---------|--------|
| GET 🔒 | `/api/users/me` | — | 200 User | 401 |
| PATCH 🔒 | `/api/users/me` | `{ first_name?, last_name? }` | 200 User | 401, 422 |
| POST 🔒 | `/api/users/me/password` | `{ current_password, new_password }` | 204 | 400, 401, 422 |

## Admin Endpoints

| Method | Endpoint | Body/Query | Success | Errors |
|--------|----------|------------|---------|--------|
| GET 🛡 | `/api/users` | Query: page, page_size, search, sort, order, status | 200 paginated | 401, 403 |
| GET 🛡 | `/api/users/:id` | — | 200 User | 401, 403, 404 |
| PATCH 🛡 | `/api/users/:id` | `{ first_name?, last_name?, role? }` | 200 User | 401, 403, 404, 409, 422 |
| POST 🛡 | `/api/users/:id/deactivate` | — | 200 User | 401, 403, 404, 409 |
| POST 🛡 | `/api/users/:id/reactivate` | — | 200 User | 401, 403, 404 |

## Invitation Endpoints

| Method | Endpoint | Body/Query | Success | Errors |
|--------|----------|------------|---------|--------|
| GET | `/api/invitations/lookup?token=...` | — | 200 `{ email, role }` | 404, 410 |
| POST | `/api/invitations/accept` | `{ token, first_name, last_name, password }` | 201 `{ user, ...token }` | 404, 410, 422 |
| GET 🛡 | `/api/invitations` | — | 200 Invitation[] | 401, 403 |
| POST 🛡 | `/api/invitations` | `{ email, role }` | 201 Invitation | 401, 403, 409, 422 |
| DELETE 🛡 | `/api/invitations/:id` | — | 204 | 401, 403, 404 |

## Error Codes

### 401 Codes
TOKEN_EXPIRED, TOKEN_INVALID, REFRESH_TOKEN_EXPIRED, REFRESH_TOKEN_REUSED, SESSION_REVOKED, ACCOUNT_DEACTIVATED

### 403 Codes
FORBIDDEN, ACCOUNT_DEACTIVATED

### 409 Codes
CANNOT_CHANGE_OWN_ROLE, CANNOT_DEACTIVATE_SELF, EMAIL_TAKEN, INVITATION_PENDING
