import { Router } from 'express';
import { getCoaches, getCoachById } from './coach.controller';

const router = Router();

// Public - List all coaches
router.get('/', getCoaches);

// Public - Get coach by ID
router.get('/:id', getCoachById);

export default router;
