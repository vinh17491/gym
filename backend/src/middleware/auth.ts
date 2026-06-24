import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { IJwtPayload, UserRole } from '../types';
import { sendError } from '../utils/response';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return sendError(res, 'Authentication required', 401);
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, config.jwt.accessSecret) as IJwtPayload;
    next();
  } catch { return sendError(res, 'Invalid or expired token', 401); }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, 'Authentication required', 401);
    if (roles.length > 0 && !roles.includes(req.user.role as UserRole)) return sendError(res, 'Forbidden', 403);
    next();
  };
}
