import { Router } from 'express';
import {
  getCounsellors,
  getCounsellorById,
  bookSession,
  getCounsellorDashboard,
  updateAvailability,
  uploadDocuments,
  getCounsellingStudents,
  getStudentSummaryReport,
  createCounsellingReport
} from '../controllers/counsellor.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Authenticated routes
router.use(authenticateJWT);

router.get('/', getCounsellors);
router.get('/dashboard', getCounsellorDashboard);
router.put('/availability', updateAvailability);
router.post('/documents', uploadDocuments);
router.get('/students', getCounsellingStudents);
router.get('/students/:studentId', getStudentSummaryReport);
router.post('/reports', createCounsellingReport);
router.post('/book', bookSession);
router.get('/:id', getCounsellorById);

export default router;
