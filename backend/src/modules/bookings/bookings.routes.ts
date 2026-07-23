import { Router } from 'express';
import { getCoaches, getCoachAvailability, createBooking, getMyBookings, updateBookingStatus, rateBooking, getMyCoach } from './bookings.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/auth';
import { UserRole } from '../../types';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

router.get('/coaches', getCoaches);
const id = z.object({ id: z.coerce.number().int().positive() });
const booking = z.object({ coach_id: z.number().int().positive(), booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/), notes: z.string().trim().max(500).optional() }).strict();
const statusSchema = z.object({ status: z.enum(['confirmed', 'completed', 'cancelled', 'no_show']), coach_notes: z.string().trim().max(1000).optional(), cancel_reason: z.string().trim().max(500).optional() });
const ratingSchema = z.object({ rating: z.coerce.number().int().min(1).max(5), review: z.string().trim().max(1000).optional() });

router.get('/coaches/:id/availability', validate(id, 'params'), getCoachAvailability);
router.get('/my-coach', authenticate, authorize(UserRole.MEMBER), getMyCoach);

router.post('/', authenticate, authorize(UserRole.MEMBER), validate(booking), createBooking);
router.get('/', authenticate, getMyBookings);
router.put('/:id/status', authenticate, validate(id, 'params'), validate(statusSchema), updateBookingStatus);
router.post('/:id/rating', authenticate, authorize(UserRole.MEMBER), validate(id, 'params'), validate(ratingSchema), rateBooking);

export default router;

