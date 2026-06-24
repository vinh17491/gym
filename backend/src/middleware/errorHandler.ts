import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { sendError } from '../utils/response';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) { super(message); this.name = 'AppError'; }
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) return sendError(res, err.message, err.statusCode);
  console.error('ERROR:', err);
  logger.error('Unhandled:', { error: err.message, stack: err.stack });
  return sendError(res, 'Internal Server Error', 500);
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `${req.method} ${req.path} not found`));
}
