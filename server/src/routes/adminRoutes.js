import { Router } from 'express';
import {
  overview,
  listUsers,
  updateUser,
  listAllListings,
  moderateListing,
  listAllBookings,
  auditLogs,
} from '../controllers/adminController.js';
import { protect, allowRoles } from '../middleware/auth.js';
const router = Router();
router.use(protect, allowRoles('admin'));
router.get('/overview', overview);
router.get('/users', listUsers);
router.patch('/users/:id', updateUser);
router.get('/listings', listAllListings);
router.patch('/listings/:id', moderateListing);
router.get('/bookings', listAllBookings);
router.get('/audit-logs', auditLogs);
export default router;
