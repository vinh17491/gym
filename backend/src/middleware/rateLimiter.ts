import rateLimit from 'express-rate-limit';
import { config } from '../config/config';

// Rate limiters use memory store (Redis optional for distributed limits)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown',
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((15 * 60 * 1000) / 1000),
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: config.nodeEnv === 'test' || config.db.database.startsWith('GYMFIT_DB_AUTH_RBAC_ACCEPTANCE_') ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => req.ip || req.connection?.remoteAddress || 'unknown',
  message: {
    success: false,
    error: 'Too many login attempts, please try again later.',
    retryAfter: 60,
  },
});

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many file uploads, please try again later.',
  },
});
