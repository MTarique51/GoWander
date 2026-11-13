import { Router } from 'express';
import {
  createReview,
  listingReviews,
  adminReviews,
  moderateReview,
} from '../controllers/reviewController.js';
import { protect, allowRoles } from '../middleware/auth.js';
const router = Router();
router.get('/listing/:listingId', listingReviews);
router.post('/', protect, allowRoles('traveler'), createReview);
router.get('/admin', protect, allowRoles('admin'), adminReviews);
router.patch('/:id/moderate', protect, allowRoles('admin'), moderateReview);
export default router;
