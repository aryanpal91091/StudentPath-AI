// Core entity types matching the backend Prisma schema

export interface User {
  id: number;
  email: string;
  role: 'STUDENT' | 'COUNSELLOR' | 'ADMIN';
  studentProfile?: StudentProfile;
  counsellorProfile?: CounsellorProfile;
  adminProfile?: AdminProfile;
}

export interface StudentProfile {
  id: number;
  name: string;
  classLevel?: string;
  board?: string;
  stream?: string;
  branch?: string;
  year?: number;
  cgpa?: number;
  location?: string;
  careerInterests?: string;
  opportunityPreference?: string;
  timeAvailability?: string;
  onlinePreference?: boolean;
  currentCareerMatch?: string;
  careerReadinessScore?: number;
  premiumStatus?: boolean;
  skills?: UserSkill[];
}

export interface UserSkill {
  skillId: number;
  proficiencyLevel?: number;
  skill?: Skill;
}

export interface Skill {
  id: number;
  name: string;
  category?: string;
}

export interface CounsellorProfile {
  id: number;
  name: string;
  qualification?: string;
  specialization?: string;
  experience?: string;
  languages?: string;
  availability?: string;
  sessionPrice?: number;
  rating?: number;
  isVerified?: boolean;
  bio?: string;
}

export interface AdminProfile {
  id: number;
  name: string;
  permissions?: string;
}

export interface Opportunity {
  id: number;
  title: string;
  organization: string;
  category: string;
  description: string;
  deadline?: string;
  location?: string;
  mode: string;
  status: string;
  stipend?: string;
  prize?: string;
  fee?: number;
  url?: string;
  skills?: string;
  branch?: string;
  education?: string;
  minYear?: number;
  maxYear?: number;
}

export interface Application {
  id: number;
  opportunityId: number;
  status: string;
  applicationDate?: string;
  opportunity?: Opportunity;
}

export interface Roadmap {
  id: number;
  title: string;
  progress: number;
  steps?: RoadmapStep[];
}

export interface RoadmapStep {
  id: number;
  title: string;
  description?: string;
  status: string;
  order: number;
  targetDate?: string;
}

export interface CareerRecommendation {
  career?: {
    id: number;
    title: string;
    description?: string;
    careerType?: string;
  };
  matchScore?: number;
  reasoning?: {
    rationale?: string;
    matchingSkills?: string[];
    missingSkills?: string[];
  };
}

export interface DashboardData {
  profile?: StudentProfile;
  careerReadinessScore?: number;
  recommendedOpportunities?: Opportunity[];
  appliedCount?: number;
  savedCount?: number;
  activeRoadmap?: Roadmap;
  upcomingDeadlines?: Opportunity[];
}
