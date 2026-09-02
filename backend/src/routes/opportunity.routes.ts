import { Router } from 'express';
import {
  getOpportunities,
  getOpportunityById,
  getExams,
  getScholarships,
  getCareers,
  getCareerById,
  getCourses
} from '../controllers/opportunity.controller';

const router = Router();

// Opportunity, Exam, Scholarship, Career, Course listings
router.get('/', getOpportunities);
router.get('/exams', getExams);
router.get('/scholarships', getScholarships);
router.get('/careers', getCareers);
router.get('/careers/:id', getCareerById);
router.get('/courses', getCourses);
router.get('/:id', getOpportunityById);

export default router;
