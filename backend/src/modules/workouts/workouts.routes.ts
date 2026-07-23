import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth';
import { UserRole } from '../../types';
import * as workoutsController from './workouts.controller';

const router = Router();

// Get member's assigned workouts — MUST be before /:workoutId to avoid param capture
router.get('/assigned', authenticate, authorize(UserRole.MEMBER), workoutsController.getMyAssignedWorkouts);

// Coach getting a specific member's assigned workouts
router.get('/member/:memberId/assigned', authenticate, authorize(UserRole.COACH, UserRole.ADMIN), workoutsController.getMemberAssignedWorkouts);

// Coach & Admin creating a workout program
router.post('/', authenticate, authorize(UserRole.COACH, UserRole.ADMIN), workoutsController.createWorkout);

// Coach & Admin listing their workout programs
router.get('/', authenticate, authorize(UserRole.COACH, UserRole.ADMIN), workoutsController.getWorkouts);

// Get workout details (including exercises)
router.get('/:workoutId', authenticate, authorize(UserRole.MEMBER, UserRole.COACH, UserRole.ADMIN), workoutsController.getWorkoutDetails);

// Coach & Admin adding exercises to a workout program
router.post('/:workoutId/exercises', authenticate, authorize(UserRole.COACH, UserRole.ADMIN), workoutsController.addWorkoutExercise);

// Coach assigning a workout to a member
router.post('/:workoutId/assign', authenticate, authorize(UserRole.COACH, UserRole.ADMIN), workoutsController.assignWorkout);

// Coach cancelling a workout assignment
router.post('/assignments/:assignmentId/cancel', authenticate, authorize(UserRole.COACH, UserRole.ADMIN), workoutsController.cancelAssignment);

export default router;

