import { Router } from 'express';
import { getVideos, getVideoById, createVideo, updateVideo, deleteVideo, getVideoCategories } from './videos.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/auth';
import { UserRole } from '../../types';

const router = Router();

// Public routes - no authentication required
router.get('/public', getVideos);

// Admin/coach routes - require authentication and authorization
router.post('/', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), createVideo);
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), updateVideo);
router.delete('/:id', authenticate, authorize(UserRole.ADMIN), deleteVideo);

// All other routes require admin/coach permissions
router.get('/categories', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), getVideoCategories);
router.get('/', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), getVideos);
router.get('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), getVideoById);

export default router;
