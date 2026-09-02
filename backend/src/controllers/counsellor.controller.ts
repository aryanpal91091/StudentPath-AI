import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getCounsellors = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { specialization, search } = req.query;
    const filter: any = { isVerified: true }; // Only return verified counsellors to students

    if (specialization) {
      filter.specialization = specialization as string;
    }

    if (search) {
      filter.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { qualification: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const counsellors = await prisma.counsellorProfile.findMany({
      where: filter,
      orderBy: { rating: 'desc' }
    });

    res.status(200).json({ counsellors });
  } catch (error: any) {
    console.error('Get counsellors error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCounsellorById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const counsellor = await prisma.counsellorProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        weeklyAvailability: true,
        reviews: {
          include: {
            studentProfile: true
          }
        }
      }
    });

    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    res.status(200).json({ counsellor });
  } catch (error: any) {
    console.error('Get counsellor by ID error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const bookSession = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only students can book counselling sessions' });
    }

    const { counsellorId, date, timeSlot } = req.body;

    if (!counsellorId || !date || !timeSlot) {
      return res.status(400).json({ error: 'Counsellor ID, date, and time slot are required' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    const counsellor = await prisma.counsellorProfile.findUnique({
      where: { id: parseInt(counsellorId) }
    });

    if (!student || !counsellor) {
      return res.status(404).json({ error: 'Student or Counsellor profile not found' });
    }

    // Create session in PENDING state
    const session = await prisma.counsellingSession.create({
      data: {
        studentProfileId: student.id,
        counsellorProfileId: counsellor.id,
        date: new Date(date),
        timeSlot,
        status: 'PENDING',
        price: counsellor.sessionPrice,
        paymentStatus: 'PENDING',
        videoRoomId: `room-${student.id}-${counsellor.id}-${Date.now()}`
      }
    });

    res.status(201).json({
      message: 'Booking created. Awaiting payment.',
      session
    });

  } catch (error: any) {
    console.error('Book session error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getCounsellorDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'COUNSELLOR') {
      return res.status(403).json({ error: 'Only counsellors can access counsellor dashboards' });
    }

    const counsellor = await prisma.counsellorProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        sessions: {
          include: {
            studentProfile: true
          }
        }
      }
    });

    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = counsellor.sessions.filter(s => {
      const sDate = new Date(s.date);
      sDate.setHours(0, 0, 0, 0);
      return sDate.getTime() === today.getTime() && s.status === 'CONFIRMED';
    });

    const upcomingSessions = counsellor.sessions.filter(s => {
      return new Date(s.date) > new Date() && s.status === 'CONFIRMED';
    });

    const activeStudents = Array.from(new Set(counsellor.sessions.map(s => s.studentProfileId))).length;
    const completedSessions = counsellor.sessions.filter(s => s.status === 'COMPLETED');
    const earnings = completedSessions.reduce((acc, s) => acc + s.price, 0);

    res.status(200).json({
      todaySessions,
      upcomingSessions,
      activeStudentsCount: activeStudents,
      earnings,
      rating: counsellor.rating,
      isVerified: counsellor.isVerified,
      sessions: counsellor.sessions
    });

  } catch (error: any) {
    console.error('Counsellor dashboard error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateAvailability = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'COUNSELLOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { availability, weeklySlots } = req.body; // weeklySlots = [{ dayOfWeek: 1, startTime: "16:00", endTime: "20:00" }]

    const counsellor = await prisma.counsellorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.counsellorProfile.update({
        where: { id: counsellor.id },
        data: { availability }
      });

      if (weeklySlots && Array.isArray(weeklySlots)) {
        await tx.counsellorAvailability.deleteMany({
          where: { counsellorProfileId: counsellor.id }
        });

        for (const slot of weeklySlots) {
          await tx.counsellorAvailability.create({
            data: {
              counsellorProfileId: counsellor.id,
              dayOfWeek: parseInt(slot.dayOfWeek),
              startTime: slot.startTime,
              endTime: slot.endTime
            }
          });
        }
      }
    });

    res.status(200).json({ message: 'Availability updated successfully' });
  } catch (error: any) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const uploadDocuments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'COUNSELLOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { documentType, documentUrl } = req.body;
    if (!documentType || !documentUrl) {
      return res.status(400).json({ error: 'Document type and URL are required' });
    }

    const counsellor = await prisma.counsellorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    const doc = await prisma.verificationDocument.create({
      data: {
        counsellorProfileId: counsellor.id,
        documentType,
        documentUrl,
        verificationStatus: 'PENDING'
      }
    });

    res.status(201).json({ message: 'Document uploaded for admin verification', document: doc });
  } catch (error: any) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCounsellingStudents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'COUNSELLOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const counsellor = await prisma.counsellorProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!counsellor) {
      return res.status(404).json({ error: 'Counsellor profile not found' });
    }

    // Get unique students that have booked sessions
    const sessions = await prisma.counsellingSession.findMany({
      where: { counsellorProfileId: counsellor.id },
      include: {
        studentProfile: {
          include: {
            skills: { include: { skill: true } }
          }
        }
      }
    });

    const studentsMap = new Map();
    sessions.forEach(s => {
      if (!studentsMap.has(s.studentProfileId)) {
        studentsMap.set(s.studentProfileId, s.studentProfile);
      }
    });

    res.status(200).json({ students: Array.from(studentsMap.values()) });
  } catch (error: any) {
    console.error('Get counselling students error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getStudentSummaryReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'COUNSELLOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { studentId } = req.params;

    const student = await prisma.studentProfile.findUnique({
      where: { id: parseInt(studentId) },
      include: {
        skills: { include: { skill: true } },
        roadmaps: { include: { steps: true } },
        assessments: {
          include: { recommendations: true }
        }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Construct AI student summary report for counsellor
    const topCareerMatch = student.currentCareerMatch || 'Not Specified';
    const lastAssessment = student.assessments[0] || null;
    
    // Build profile concerns mock / summary
    const aiSummary = {
      name: student.name,
      education: `${student.classLevel || 'N/A'} - ${student.branch || student.stream || 'N/A'}`,
      cgpa: student.cgpa || student.percentage || 'N/A',
      skills: student.skills.map(s => `${s.skill.name} (${s.proficiency})`),
      interests: student.careerInterests ? student.careerInterests.split(',') : [],
      currentMatch: topCareerMatch,
      concerns: `Student is seeking opportunities in ${student.opportunityPreference || 'opportunities'}. Their target career is ${topCareerMatch}. They have completed ${student.skills.length} skill registrations.`,
      aiRecommendations: lastAssessment ? lastAssessment.recommendations.map(r => ({
        careerId: r.careerId,
        score: r.matchScore
      })) : [
        { career: topCareerMatch, score: 85 },
        { career: 'Secondary Alternative', score: 70 }
      ]
    };

    res.status(200).json({ aiSummary, student });
  } catch (error: any) {
    console.error('Get student summary report error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createCounsellingReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'COUNSELLOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const {
      counsellingSessionId,
      studentSituation,
      assessment,
      recommendedCareer,
      recommendedCourse,
      recommendedExams,
      skillsToDevelop,
      actionPlan,
      followUpDate
    } = req.body;

    if (!counsellingSessionId || !recommendedCareer || !actionPlan) {
      return res.status(400).json({ error: 'Session ID, recommended career, and action plan are required' });
    }

    const counsellor = await prisma.counsellorProfile.findUnique({
      where: { userId: req.user.id }
    });

    const session = await prisma.counsellingSession.findUnique({
      where: { id: parseInt(counsellingSessionId) }
    });

    if (!counsellor || !session) {
      return res.status(404).json({ error: 'Counsellor profile or session not found' });
    }

    const report = await prisma.$transaction(async (tx) => {
      // Create report
      const rep = await tx.counsellingReport.create({
        data: {
          counsellingSessionId: session.id,
          counsellorProfileId: counsellor.id,
          studentSituation: studentSituation || '',
          assessment: assessment || '',
          recommendedCareer,
          recommendedCourse: recommendedCourse || '',
          recommendedExams: recommendedExams || '',
          skillsToDevelop: skillsToDevelop || '',
          actionPlan,
          followUpDate: followUpDate ? new Date(followUpDate) : null
        }
      });

      // Mark session as completed
      await tx.counsellingSession.update({
        where: { id: session.id },
        data: { status: 'COMPLETED' }
      });

      // Update student profile matching career recommendations
      await tx.studentProfile.update({
        where: { id: session.studentProfileId },
        data: { currentCareerMatch: recommendedCareer }
      });

      return rep;
    });

    res.status(201).json({ message: 'Counselling report submitted successfully', report });
  } catch (error: any) {
    console.error('Create counselling report error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
