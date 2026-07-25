import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { getNotifications, markAsRead, markAllAsRead } from './notifications.controller';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

export default router;
