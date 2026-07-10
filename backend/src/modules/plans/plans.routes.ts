import { Router } from 'express';
import { getPlans, createPlan, updatePlan, deletePlan, subscribe, cancelMembership, getMyMembership } from './plans.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';
import { UserRole } from '../../types';

const router = Router();

const planSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  duration_days: z.number().int().positive(),
  type: z.enum(['monthly', 'yearly']),
  features: z.array(z.string()).optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

const subscribeSchema = z.object({
  plan_id: z.number().int().positive(),
});

router.get('/', getPlans);
router.get('/my-membership', authenticate, getMyMembership);
router.post('/subscribe', authenticate, validate(subscribeSchema), subscribe);
router.post('/cancel', authenticate, cancelMembership);

router.post('/', authenticate, authorize(UserRole.ADMIN), validate(planSchema), createPlan);
router.put('/:id', authenticate, authorize(UserRole.ADMIN), validate(planSchema), updatePlan);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deletePlan);

export default router;
