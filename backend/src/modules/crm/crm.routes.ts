import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../types';
import { listCustomers, getCustomer, addNote, createTask } from './crm.controller';

const router = Router();
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), listCustomers);
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), getCustomer);
router.post('/:id/notes', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), addNote);
router.post('/:id/tasks', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), createTask);
export default router;
