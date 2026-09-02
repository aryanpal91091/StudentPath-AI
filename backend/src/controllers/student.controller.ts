import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getDashboardData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only student accounts can access student dashboards' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        skills: {
          include: { skill: true }
        },
        savedOpportunities: {
          include: { opportunity: true }
        },
        applications: {
          include: { opportunity: true }
        },
        roadmaps: {
          include: { steps: true }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // 1. Determine time greeting
    const hours = new Date().getHours();
    let greeting = 'Good morning';
    if (hours >= 12 && hours < 17) greeting = 'Good afternoon';
    else if (hours >= 17) greeting = 'Good evening';

    // 2. Break down Career Readiness Score
    const totalSkills = student.skills.length;
    const cgpaScore = student.cgpa ? Math.min(student.cgpa * 10, 100) : 0;
    const projectsCount = student.applications.filter(a => a.status === 'SELECTED').length;
    
    const readinessBreakdown = {
      skills: Math.min(totalSkills * 15, 100),
      education: student.classLevel ? 100 : 0,
      projects: Math.min(projectsCount * 30 + 40, 100), // base score of 40 if no projects
      experience: student.cgpa ? 80 : 30,
      certifications: student.premiumStatus ? 90 : 30,
      opportunities: Math.min(student.savedOpportunities.length * 20, 100),
      careerClarity: student.currentCareerMatch ? 90 : 20
    };

    // 3. Upcoming Deadlines (within next 30 days)
    const upcomingDeadlines: any[] = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Get deadlines from saved opportunities
    student.savedOpportunities.forEach(so => {
      if (so.opportunity.deadline) {
        const dDate = new Date(so.opportunity.deadline);
        if (dDate >= today && dDate <= thirtyDaysFromNow) {
          const daysLeft = Math.ceil((dDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          upcomingDeadlines.push({
            id: so.opportunity.id,
            title: so.opportunity.title,
            organization: so.opportunity.organization,
            type: so.opportunity.category,
            deadline: so.opportunity.deadline,
            daysLeft
          });
        }
      }
    });

    // Sort deadlines by ascending date
    upcomingDeadlines.sort((a, b) => a.daysLeft - b.daysLeft);

    // 4. Default Skill Gap & Target skills based on currentCareerMatch
    let skillGap: any[] = [];
    if (student.currentCareerMatch) {
      // Find career
      const career = await prisma.career.findFirst({
        where: { title: { equals: student.currentCareerMatch, mode: 'insensitive' } },
        include: {
          careerSkills: {
            include: { skill: true }
          }
        }
      });

      if (career) {
        skillGap = career.careerSkills.map(cs => {
          // Check if student has this skill
          const hasSkill = student.skills.find(sk => sk.skillId === cs.skillId);
          const currentLevel = hasSkill ? (hasSkill.proficiency === 'ADVANCED' ? 80 : hasSkill.proficiency === 'INTERMEDIATE' ? 50 : 25) : 0;
          const targetLevel = cs.importance === 'HIGH' ? 90 : cs.importance === 'MEDIUM' ? 65 : 40;
          return {
            skill: cs.skill.name,
            current: currentLevel,
            target: targetLevel,
            missing: currentLevel < targetLevel
          };
        });
      }
    }

    // 5. Default matching opportunities (Top 5 basic fallback)
    const recommendedOpps = await prisma.opportunity.findMany({
      where: {
        status: 'ACTIVE',
        education: { contains: student.classLevel || 'Undergraduate', mode: 'insensitive' }
      },
      take: 5
    });

    res.status(200).json({
      greeting: `${greeting}, ${student.name} 👋`,
      careerReadinessScore: Math.round(student.careerReadinessScore),
      readinessBreakdown,
      upcomingDeadlines,
      currentCareerMatch: student.currentCareerMatch || 'Not Chosen',
      skillGap: skillGap.length > 0 ? skillGap : [
        { skill: 'Python', current: 75, target: 90, missing: true },
        { skill: 'Statistics', current: 20, target: 70, missing: true },
        { skill: 'Machine Learning', current: 10, target: 80, missing: true },
        { skill: 'Data Structures', current: 40, target: 75, missing: true }
      ],
      recommendedOpportunities: recommendedOpps.map(o => ({
        id: o.id,
        title: o.title,
        organization: o.organization,
        category: o.category,
        education: o.education,
        deadline: o.deadline,
        mode: o.mode,
        location: o.location,
        matchPercentage: Math.floor(Math.random() * 20) + 75 // Random match score 75-95% for fallback
      })),
      roadmap: student.roadmaps[0] || null
    });

  } catch (error: any) {
    console.error('Get student dashboard error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const { name, classLevel, branch, cgpa, location, currentCareerMatch, skills } = req.body;

    await prisma.$transaction(async (tx) => {
      await tx.studentProfile.update({
        where: { id: student.id },
        data: {
          name: name || student.name,
          classLevel: classLevel !== undefined ? classLevel : student.classLevel,
          branch: branch !== undefined ? branch : student.branch,
          cgpa: cgpa !== undefined ? parseFloat(cgpa) : student.cgpa,
          location: location !== undefined ? location : student.location,
          currentCareerMatch: currentCareerMatch !== undefined ? currentCareerMatch : student.currentCareerMatch
        }
      });

      if (skills && Array.isArray(skills)) {
        await tx.userSkill.deleteMany({
          where: { studentProfileId: student.id }
        });

        for (const s of skills) {
          let skillRecord = await tx.skill.findFirst({
            where: { name: { equals: s.name, mode: 'insensitive' } }
          });

          if (!skillRecord) {
            skillRecord = await tx.skill.create({
              data: { name: s.name, category: 'Other' }
            });
          }

          await tx.userSkill.create({
            data: {
              studentProfileId: student.id,
              skillId: skillRecord.id,
              proficiency: s.proficiency || 'BEGINNER'
            }
          });
        }
      }
    });

    const updated = await prisma.studentProfile.findUnique({
      where: { id: student.id },
      include: {
        skills: {
          include: { skill: true }
        }
      }
    });

    res.status(200).json({ message: 'Profile updated successfully', profile: updated });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getSavedOpportunities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const saved = await prisma.savedOpportunity.findMany({
      where: { studentProfileId: student.id },
      include: {
        opportunity: true
      }
    });

    res.status(200).json({ saved: saved.map(s => s.opportunity) });
  } catch (error: any) {
    console.error('Get saved opportunities error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const toggleSaveOpportunity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { opportunityId } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ error: 'Opportunity ID is required' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Check if already saved
    const existing = await prisma.savedOpportunity.findUnique({
      where: {
        studentProfileId_opportunityId: {
          studentProfileId: student.id,
          opportunityId: parseInt(opportunityId)
        }
      }
    });

    if (existing) {
      // Unsave
      await prisma.savedOpportunity.delete({
        where: { id: existing.id }
      });
      return res.status(200).json({ saved: false, message: 'Opportunity unsaved' });
    } else {
      // Save
      await prisma.savedOpportunity.create({
        data: {
          studentProfileId: student.id,
          opportunityId: parseInt(opportunityId)
        }
      });
      return res.status(200).json({ saved: true, message: 'Opportunity saved successfully' });
    }

  } catch (error: any) {
    console.error('Toggle save opportunity error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const applications = await prisma.application.findMany({
      where: { studentProfileId: student.id },
      include: {
        opportunity: true
      }
    });

    res.status(200).json({ applications });
  } catch (error: any) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateApplicationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { opportunityId, status, notes } = req.body;

    if (!opportunityId || !status) {
      return res.status(400).json({ error: 'Opportunity ID and status are required' });
    }

    const validStatuses = ['SAVED', 'PLANNING_TO_APPLY', 'APPLIED', 'SHORTLISTED', 'SELECTED', 'REJECTED', 'WITHDRAWN'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const app = await prisma.application.upsert({
      where: {
        studentProfileId_opportunityId: {
          studentProfileId: student.id,
          opportunityId: parseInt(opportunityId)
        }
      },
      update: {
        status,
        notes: notes !== undefined ? notes : undefined
      },
      create: {
        studentProfileId: student.id,
        opportunityId: parseInt(opportunityId),
        status,
        notes: notes || ''
      },
      include: {
        opportunity: true
      }
    });

    res.status(200).json({ message: 'Application status updated successfully', application: app });

  } catch (error: any) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
