# Known Limitations

## Mock Backend

- **No persistent storage**: Data is kept in memory. Restarting the server resets everything to seed data.
- **No real email**: Invitation tokens are returned to admins so the UI can copy invite links. There is no outbound email.
- **No password hashing**: Passwords are stored as plain text in the mock. A real backend would use bcrypt or argon2.
- **Single-process**: The mock server runs in one Node.js process. No horizontal scaling or clustering.

## Security

- **Frontend role checks are not security controls**: Hiding admin navigation and using route guards improves UX but provides no actual security. The mock server enforces authorization via JWT claims.
- **XSS exposure**: The refresh token is stored in localStorage, which is readable by any JavaScript on the page. In production, tokens should be delivered as HttpOnly cookies.
- **No HTTPS**: Local development uses HTTP. Production must use HTTPS.
- **Hardcoded JWT secret**: The signing secret is a dev-only placeholder. Production must use a strong, externally-managed secret.

## Frontend

- **No optimistic updates**: Mutations wait for the server response before updating the UI. This adds 300-800ms of perceived latency.
- **No offline support**: The app requires an active connection to the mock server.
- **No cross-tab token sync**: Sign-out propagates across tabs via the `storage` event, but token refresh does not. Each tab refreshes independently, which is safe but could lead to slightly different token states between tabs.
- **No i18n**: All text is hardcoded in English.

## Testing

- Tests focus on authentication edge cases. Component rendering tests are limited to route guards.
- No end-to-end tests (Playwright/Cypress).
- No visual regression tests.
