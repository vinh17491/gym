import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../types';
import { list, getById, generate, sendEmail } from './invoice.controller';

const router = Router();
router.get('/', authenticate, list);
router.get('/:id', authenticate, getById);
router.post('/generate', authenticate, generate);
router.post('/:id/send-email', authenticate, authorize(UserRole.ADMIN), sendEmail);
export default router;
