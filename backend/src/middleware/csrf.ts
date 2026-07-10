import * as crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function generateCsrfToken(req: Request): string {
  const token = crypto.randomBytes(32).toString('hex');
  (req as any).session = (req as any).session || {};
  (req as any).session.csrfToken = token;
  return token;
}

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const token = req.headers['x-csrf-token'] as string || req.body?._csrf;
  const sessionToken = (req as any).session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ success: false, error: 'Invalid CSRF token' });
  }
  next();
}
