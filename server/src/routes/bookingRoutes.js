import { Router } from 'express';
import {
  createBooking,
  myBookings,
  providerBookings,
  updateBookingStatus,
  cancelMyBooking,
} from '../controllers/bookingController.js';
import { protect, allowRoles } from '../middleware/auth.js';
const router = Router();
router.post('/', protect, allowRoles('traveler'), createBooking);
router.get('/my', protect, myBookings);
router.get('/provider', protect, allowRoles('provider'), providerBookings);
router.patch('/:id/status', protect, allowRoles('provider', 'admin'), updateBookingStatus);
router.patch('/:id/cancel', protect, cancelMyBooking);
export default router;
