import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth.js';

export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (req.userRole !== 'admin') {
    res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Admin access required.' },
    });
    return;
  }
  next();
}
