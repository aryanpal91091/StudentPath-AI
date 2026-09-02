import { Router } from 'express';
import {
  getDashboardData,
  updateProfile,
  getSavedOpportunities,
  toggleSaveOpportunity,
  getApplications,
  updateApplicationStatus
} from '../controllers/student.controller';
import { authenticateJWT, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Protect all routes to only STUDENTS
router.use(authenticateJWT);
router.use(requireRole(['STUDENT']));

router.get('/dashboard', getDashboardData);
router.put('/profile', updateProfile);
router.get('/saved', getSavedOpportunities);
router.post('/saved', toggleSaveOpportunity);
router.get('/applications', getApplications);
router.post('/applications', updateApplicationStatus);

export default router;
