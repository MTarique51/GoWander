import { Router } from 'express';

import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
  myListings,
  getNearbyProviders,
  searchPackageLocations,
  getMapLocations,
} from '../controllers/listingController.js';

import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();

// Public listing routes
router.get('/', getListings);

// Map locations — all published packages with GPS coordinates
router.get('/map/locations', getMapLocations);

// Nearby provider search
router.get('/nearby/providers', getNearbyProviders);

// Search package locations
router.get('/locations/search', searchPackageLocations);

// Provider routes
router.get('/mine', protect, allowRoles('provider'), myListings);

router.post('/', protect, allowRoles('provider'), createListing);
router.patch('/:id', protect, allowRoles('provider'), updateListing);
router.delete('/:id', protect, allowRoles('provider'), deleteListing);

// Listing details — keep this after specific routes
router.get('/:id', getListing);

export default router;
