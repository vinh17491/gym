import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config/config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import authRoutes from './modules/auth/auth.routes';
import referralRoutes from './modules/referral/referral.routes';
import couponRoutes from './modules/coupon/coupon.routes';
import loyaltyRoutes from './modules/loyalty/loyalty.routes';
import auditRoutes from './modules/audit/audit.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import crmRoutes from './modules/crm/crm.routes';
import ticketRoutes from './modules/tickets/ticket.routes';
import invoiceRoutes from './modules/invoices/invoice.routes';
import backupRoutes from './modules/backup/backup.routes';
import revenueRoutes from './modules/revenue/revenue.routes';
import coachRoutes from './modules/coaches/coach.routes';
import { logger } from './utils/logger';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);
if (config.nodeEnv === 'development') app.use(morgan('dev'));

app.get('/api/health', (_req, res) => res.json({ success: true, message: 'Gymer API running', timestamp: new Date().toISOString() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/crm', crmRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/coaches', coachRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
