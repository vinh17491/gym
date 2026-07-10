import { Router } from 'express';
import { getCoaches, getCoachAvailability, createBooking, getMyBookings, updateBookingStatus } from './bookings.controller';
import { authenticate } from '../../middleware/auth';
import { authorize } from '../../middleware/auth';
import { UserRole } from '../../types';

const router = Router();

router.get('/coaches', getCoaches);
router.get('/coaches/:id/availability', getCoachAvailability);

router.post('/', authenticate, createBooking);
router.get('/', authenticate, getMyBookings);
router.put('/:id/status', authenticate, authorize(UserRole.ADMIN, UserRole.COACH), updateBookingStatus);

export default router;
