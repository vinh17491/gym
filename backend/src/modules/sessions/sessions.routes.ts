import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../types';
import * as sessionsController from './sessions.controller';

const router = Router();

// Member starting a new session from an assigned workout
router.post('/start', authenticate, authorize(UserRole.MEMBER), sessionsController.startSession);

// Member logging a set
router.post('/:sessionId/sets', authenticate, authorize(UserRole.MEMBER), sessionsController.logSet);

// Member finishing a session
router.put('/:sessionId/finish', authenticate, authorize(UserRole.MEMBER), sessionsController.finishSession);

// Get member's sessions
router.get('/', authenticate, authorize(UserRole.MEMBER, UserRole.COACH, UserRole.ADMIN), sessionsController.getSessions);

export default router;
