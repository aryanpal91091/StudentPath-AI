import { Router } from 'express';
import {
  recommendOpportunities,
  careerRecommendation,
  getSkillGap,
  getCareerRoadmap,
  aiAssistantChat
} from '../controllers/ai.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/recommend-opportunities', recommendOpportunities);
router.post('/career-recommendation', careerRecommendation);
router.post('/skill-gap', getSkillGap);
router.post('/career-roadmap', getCareerRoadmap);
router.post('/chat', aiAssistantChat);

export default router;
