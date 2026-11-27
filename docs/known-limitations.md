# Known Limitations

_To be completed as development progresses._

## Planned Limitations

- **No persistent storage**: Mock server keeps data in memory. Restarting the server resets all data.
- **No real email**: Invitations are exposed via console log or a dev panel, not sent via email.
- **No HTTPS**: Local development uses HTTP only.
- **Frontend-only role checks are not security**: The mock server enforces authorization, but a real attacker could bypass frontend checks entirely.
