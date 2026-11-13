import { Router } from 'express';

import {
  submitApplication,
  myApplication,
  listApplications,
  reviewApplication,
  getPublicProviderPackages,
  getProviderDirectory,
  getProviderProfile,
} from '../controllers/providerController.js';

import { protect, allowRoles } from '../middleware/auth.js';

const router = Router();

// Provider application
router.get('/application', protect, myApplication);
router.post('/application', protect, submitApplication);

// Public provider directory — all approved providers
router.get('/directory', getProviderDirectory);

// Public provider profile and packages
router.get('/:providerId/profile', getProviderProfile);

// Public provider packages
router.get('/:providerId/packages', getPublicProviderPackages);

// Admin application management
router.get('/applications', protect, allowRoles('admin'), listApplications);
router.patch('/applications/:id', protect, allowRoles('admin'), reviewApplication);

export default router;
