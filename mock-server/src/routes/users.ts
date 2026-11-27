import { Router } from 'express';
import { authMiddleware, type AuthenticatedRequest } from '../middleware/auth.js';
import { adminMiddleware } from '../middleware/admin.js';
import {
  listUsers,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  updateProfile,
  changePassword,
} from '../services/user-service.js';
import type { Status } from '../data/types.js';

const router = Router();

function validateName(value: unknown, field: string): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) return `${field} is required`;
  if (value.trim().length > 50) return `${field} must be at most 50 characters`;
  return null;
}

function validatePassword(value: unknown): string | null {
  if (typeof value !== 'string') return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-zA-Z]/.test(value)) return 'Password must contain at least one letter';
  if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
  return null;
}

// GET /api/users/me
router.get('/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = getUserById(req.userId!);
  if (!user) {
    res.status(401).json({ error: { code: 'TOKEN_INVALID', message: 'User not found.' } });
    return;
  }
  res.json(user);
});

// PATCH /api/users/me
router.patch('/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { first_name, last_name } = req.body;
  const fields: Record<string, string> = {};

  if (first_name !== undefined) {
    const err = validateName(first_name, 'First name');
    if (err) fields.first_name = err;
  }
  if (last_name !== undefined) {
    const err = validateName(last_name, 'Last name');
    if (err) fields.last_name = err;
  }

  if (Object.keys(fields).length > 0) {
    res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields },
    });
    return;
  }

  const user = updateProfile(req.userId!, { first_name, last_name });
  if (!user) {
    res.status(401).json({ error: { code: 'TOKEN_INVALID', message: 'User not found.' } });
    return;
  }
  res.json(user);
});

// POST /api/users/me/password
router.post('/me/password', authMiddleware, (req: AuthenticatedRequest, res) => {
  const { current_password, new_password } = req.body;
  const fields: Record<string, string> = {};

  if (!current_password) fields.current_password = 'Current password is required';
  const pwErr = validatePassword(new_password);
  if (pwErr) fields.new_password = pwErr;

  if (Object.keys(fields).length > 0) {
    res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields },
    });
    return;
  }

  const result = changePassword(req.userId!, current_password, new_password);
  if (!result.success) {
    res.status(400).json({
      error: { code: 'INCORRECT_PASSWORD', message: result.error! },
    });
    return;
  }

  res.status(204).send();
});

// GET /api/users (admin)
router.get('/', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const page_size = Math.min(100, Math.max(1, parseInt(req.query.page_size as string) || 10));
  const search = req.query.search as string | undefined;
  const sort = req.query.sort as 'name' | 'email' | 'created_at' | undefined;
  const order = req.query.order as 'asc' | 'desc' | undefined;
  const status = req.query.status as Status | undefined;

  const result = listUsers({ page, page_size, search, sort, order, status });
  res.json(result);
});

// GET /api/users/:id (admin)
router.get('/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res) => {
  const user = getUserById(req.params.id);
  if (!user) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
    return;
  }
  res.json(user);
});

// PATCH /api/users/:id (admin)
router.patch('/:id', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res) => {
  const { first_name, last_name, role } = req.body;
  const fields: Record<string, string> = {};

  if (first_name !== undefined) {
    const err = validateName(first_name, 'First name');
    if (err) fields.first_name = err;
  }
  if (last_name !== undefined) {
    const err = validateName(last_name, 'Last name');
    if (err) fields.last_name = err;
  }
  if (role !== undefined && role !== 'admin' && role !== 'member') {
    fields.role = 'Role must be admin or member';
  }

  if (Object.keys(fields).length > 0) {
    res.status(422).json({
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed.', fields },
    });
    return;
  }

  if (role !== undefined && req.params.id === req.userId) {
    res.status(409).json({
      error: { code: 'CANNOT_CHANGE_OWN_ROLE', message: 'You cannot change your own role.' },
    });
    return;
  }

  const existing = getUserById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
    return;
  }

  const user = updateUser(req.params.id, { first_name, last_name, role });
  res.json(user);
});

// POST /api/users/:id/deactivate (admin)
router.post('/:id/deactivate', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res) => {
  if (req.params.id === req.userId) {
    res.status(409).json({
      error: { code: 'CANNOT_DEACTIVATE_SELF', message: 'You cannot deactivate your own account.' },
    });
    return;
  }

  const existing = getUserById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
    return;
  }

  const user = deactivateUser(req.params.id);
  res.json(user);
});

// POST /api/users/:id/reactivate (admin)
router.post('/:id/reactivate', authMiddleware, adminMiddleware, (req: AuthenticatedRequest, res) => {
  const existing = getUserById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found.' } });
    return;
  }

  const user = reactivateUser(req.params.id);
  res.json(user);
});

export default router;
