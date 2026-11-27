import { Router } from 'express';
import { signIn, refresh, signOut } from '../services/auth-service.js';

const router = Router();

router.post('/signin', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Email and password are required.',
        fields: {
          ...(!email ? { email: 'Email is required' } : {}),
          ...(!password ? { password: 'Password is required' } : {}),
        },
      },
    });
    return;
  }

  const result = signIn(email, password);

  if ('error' in result) {
    res.status(result.error.status).json({ error: { code: result.error.code, message: result.error.message } });
    return;
  }

  res.json({ user: result.user, ...result.tokens });
});

router.post('/refresh', (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    res.status(401).json({
      error: { code: 'TOKEN_INVALID', message: 'Refresh token is required.' },
    });
    return;
  }

  const result = refresh(refresh_token);

  if ('error' in result) {
    res.status(result.error.status).json({ error: { code: result.error.code, message: result.error.message } });
    return;
  }

  res.json(result.tokens);
});

router.post('/signout', (req, res) => {
  const { refresh_token } = req.body;
  if (refresh_token) {
    signOut(refresh_token);
  }
  res.status(204).send();
});

export default router;
