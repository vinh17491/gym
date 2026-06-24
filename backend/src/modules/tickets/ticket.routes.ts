import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { UserRole } from '../../types';
import { createTicketSchema, replyTicketSchema } from './ticket.validation';
import { create, list, getById, reply, updateStatus } from './ticket.controller';
import { z } from 'zod';

const router = Router();
router.post('/', authenticate, validate(createTicketSchema), create);
router.get('/', authenticate, list);
router.get('/:id', authenticate, getById);
router.post('/:id/reply', authenticate, validate(replyTicketSchema), reply);
router.patch('/:id/status', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), validate(z.object({ status: z.enum(['open','pending','resolved','closed']) })), updateStatus);
export default router;
