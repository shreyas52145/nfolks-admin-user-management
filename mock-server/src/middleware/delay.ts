import type { Request, Response, NextFunction } from 'express';
import { config } from '../config.js';

export function delayMiddleware(_req: Request, _res: Response, next: NextFunction): void {
  const delay = config.API_DELAY_MIN + Math.random() * (config.API_DELAY_MAX - config.API_DELAY_MIN);
  setTimeout(next, delay);
}
