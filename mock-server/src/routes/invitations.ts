import { Router } from 'express';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import {
  listPendingInvitations,
  createInvitation,
  revokeInvitation,
  lookupInvitation,
  acceptInvitation,
} from '../services/invitation-service.js';

const router = Router();

function validateName(value: unknown, field: string): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return `${field} is required`;
  if (value.trim().length > 50) return `${field} must be at most 50 characters`;
  return null;
}

function validateEmail(value: unknown): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
  return null;
}

function validatePassword(value: unknown): string | null {
  if (typeof value !== 'string') return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-zA-Z]/.test(value)) return 'Password must contain at least one letter';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
  return null;
}

// GET /api/invitations/lookup?token=...
router.get('/lookup', (req, res) => {
  const token = req.query.token as string;
  if (!token) {
    res.status(404).json({ error: { code: 'INVITATION_NOT_FOUND', message: 'Token is required.' } });
    return;
  }

  const result = lookupInvitation(token);
  if ('error' in result) {
    res.status(result.error.status).json({ error: { code: result.error.code, message: result.error.message } });
    return;
  }

  res.json(result);
});

// POST /api/invitations/accept
router.post('/accept', (req, res) => {
  const { token, first_name, last_name, password } = req.body;
  const fields: Record<string, string> = {};

  if (!token) fields.token = 'Token is required';
  const fnErr = validateName(first_name, 'First name');
  if (fnErr) fields.first_name = fnErr;
  const lnErr = validateName(last_name, 'Last name');
  if (lnErr) fields.last_name = lnErr;
  const pwErr = validatePassword(password);
  if (pwErr) fields.password = pwErr;

  if (Object.keys(fields).length > 0) {
    res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields },
    });
    return;
  }

  const result = acceptInvitation(token, first_name, last_name, password);
  if ('error' in result) {
    res.status(result.error.status).json({ error: { code: result.error.code, message: result.error.message } });
    return;
  }

  res.status(201).json({ user: result.user, ...result.tokens });
});

// GET /api/invitations (admin - list pending)
router.get('/', authMiddleware, adminMiddleware, (_req: AuthenticatedRequest, res) => {
  const pending = listPendingInvitations();
  res.json(pending);
});

// POST /api/invitations (admin - create)
router.post('/', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res) => {
  const { email, role } = req.body;
  const fields: Record<string, string> = {};

  const emailErr = validateEmail(email);
  if (emailErr) fields.email = emailErr;
  if (role !== 'admin' && role !== 'member') fields.role = 'Role must be admin or member';

  if (Object.keys(fields).length > 0) {
    res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields },
    });
    return;
  }

  const result = createInvitation(email, role);
  if ('error' in result) {
    res.status(result.error.status).json({ error: { code: result.error.code, message: result.error.message } });
    return;
  }

  console.log(`[INVITATION] Invite link: /invite?token=${result.inviteToken} (for ${email})`);
  res.status(201).json(result.invitation);
});

// DELETE /api/invitations/:id (admin - revoke)
router.delete('/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res) => {
  const success = revokeInvitation(req.params.id);
  if (!success) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Invitation not found.' } });
    return;
  }
  res.status(204).send();
});

export default router;
