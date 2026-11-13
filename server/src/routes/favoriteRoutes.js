import { Router } from 'express';
import { getFavorites, addFavorite, removeFavorite } from '../controllers/favoriteController.js';
import { protect, allowRoles } from '../middleware/auth.js';
const router = Router();
router.get('/', protect, allowRoles('traveler'), getFavorites);
router.post('/:listingId', protect, allowRoles('traveler'), addFavorite);
router.delete('/:listingId', protect, allowRoles('traveler'), removeFavorite);
export default router;
