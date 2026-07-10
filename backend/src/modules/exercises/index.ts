import { Router } from 'express';
import { exercisesController } from './exercises.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/auth';
import { UserRole } from '../../types';

const router = Router();

// Public routes
router.get('/', exercisesController.list);
router.get('/categories', exercisesController.getCategories);
router.get('/difficulties', exercisesController.getDifficulties);
router.get('/bodyParts', exercisesController.getBodyParts);
router.get('/muscles', exercisesController.getMuscles);
router.get('/equipment', exercisesController.getEquipment);
router.get('/:id', exercisesController.getById);

// Admin/Coach routes
router.put('/:id', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), exercisesController.update);

export default router;