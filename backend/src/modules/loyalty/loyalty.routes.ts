import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { UserRole } from '../../types';
import { z } from 'zod';
import { getPoints, getHistory, getRewardsCatalog, redeemReward, loginDailyPoints } from './loyalty.controller';
import { query } from '../../config/database';

const router = Router();
router.get('/points', authenticate, getPoints);
router.get('/history', authenticate, getHistory);
router.get('/rewards', authenticate, getRewardsCatalog);
router.post('/redeem', authenticate, validate(z.object({ reward_id: z.number().int().positive() })), redeemReward);
router.post('/daily-login', authenticate, loginDailyPoints);
router.post('/add', authenticate, authorize(UserRole.ADMIN), validate(z.object({ user_id: z.number().int(), points: z.number().int(), source: z.string() })), async (req, res, next) => {
  try { await query('UPDATE Points SET balance=balance+@p, lifetime_earned=lifetime_earned+@p, updated_at=GETDATE() WHERE user_id=@uid', { p: req.body.points, uid: req.body.user_id }); res.json({ success: true, message: 'Points added' }); } catch (e) { next(e); }
});
export default router;
