import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../types';
import { getDashboard, getMemberGrowth, getMonthlyStatement } from './coach.controller';
const router = Router();
router.get('/dashboard', authenticate, authorize(UserRole.COACH), getDashboard);
router.get('/member-growth', authenticate, authorize(UserRole.COACH), getMemberGrowth);
router.get('/statement', authenticate, authorize(UserRole.COACH), getMonthlyStatement);
export default router;
