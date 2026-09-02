import { Router } from 'express';
import {
  getAnalytics,
  getPendingCounsellors,
  verifyCounsellor,
  getAllStudents,
  getPendingPayments,
  verifyPayment,
} from '../controllers/admin.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

// All admin routes require auth + ADMIN role
router.use(authenticateJWT);
router.use(requireRole(['ADMIN']));

router.get('/analytics', getAnalytics);
router.get('/students', getAllStudents);
router.get('/counsellors/pending', getPendingCounsellors);
router.patch('/counsellors/:id/verify', verifyCounsellor);
router.get('/payments/pending', getPendingPayments);
router.patch('/payments/:id/verify', verifyPayment);

export default router;
