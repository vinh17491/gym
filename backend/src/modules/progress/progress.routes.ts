import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../types';
import * as progressController from './progress.controller';

const router = Router();

// Get member's progress summary (volume, completion rate, streak)
router.get('/summary', authenticate, authorize(UserRole.MEMBER, UserRole.COACH, UserRole.ADMIN), progressController.getSummary);

// Get member's progress history for charts
router.get('/history', authenticate, authorize(UserRole.MEMBER, UserRole.COACH, UserRole.ADMIN), progressController.getHistory);

export default router;
