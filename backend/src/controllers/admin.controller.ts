import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// GET /api/admin/analytics
export const getAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const [
      totalStudents,
      premiumStudents,
      totalCounsellors,
      verifiedCounsellors,
      totalOpportunities,
      totalApplications,
      totalSessions,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.studentProfile.count({ where: { premiumStatus: true } }),
      prisma.counsellorProfile.count(),
      prisma.counsellorProfile.count({ where: { isVerified: true } }),
      prisma.opportunity.count(),
      prisma.application.count(),
      prisma.counsellingSession.count(),
    ]);

    // Avg career readiness
    const avgResult = await prisma.studentProfile.aggregate({
      _avg: { careerReadinessScore: true },
    });
    const avgCareerReadiness = avgResult._avg?.careerReadinessScore ?? 0;

    // Opportunities by category
    const oppsByCategory = await prisma.opportunity.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    // Monthly student growth (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const recentStudents = await prisma.studentProfile.findMany({
      where: { user: { createdAt: { gte: sixMonthsAgo } } },
      select: { user: { select: { createdAt: true } } },
    });

    // Group by month
    const monthMap: Record<string, number> = {};
    recentStudents.forEach((s) => {
      const m = new Date(s.user.createdAt).toLocaleString('en-US', { month: 'short' });
      monthMap[m] = (monthMap[m] || 0) + 1;
    });
    const studentGrowth = Object.entries(monthMap).map(([month, students]) => ({ month, students }));

    res.json({
      totalStudents,
      premiumStudents,
      totalCounsellors,
      verifiedCounsellors,
      totalOpportunities,
      totalApplications,
      totalSessions,
      avgCareerReadiness: Math.round(avgCareerReadiness),
      opportunitiesByCategory: oppsByCategory.map((o) => ({
        category: o.category,
        count: o._count.id,
      })),
      studentGrowth,
    });
  } catch (error: any) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/counsellors/pending
export const getPendingCounsellors = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const counsellors = await prisma.counsellorProfile.findMany({
      where: { isVerified: false },
      orderBy: { id: 'asc' },
    });
    res.json({ counsellors });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/admin/counsellors/:id/verify
export const verifyCounsellor = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { isVerified } = req.body;

    const updated = await prisma.counsellorProfile.update({
      where: { id },
      data: { isVerified: Boolean(isVerified) },
    });
    res.json({ success: true, counsellor: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/students
export const getAllStudents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const students = await prisma.studentProfile.findMany({
      include: { skills: { include: { skill: true } } },
      orderBy: { id: 'desc' },
      take: 50,
    });
    res.json({ students });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/admin/payments/pending
export const getPendingPayments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { purpose: 'SUBSCRIPTION', status: 'PENDING', screenshotUrl: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    
    // Fetch student info manually since relation isn't direct
    const userIds = payments.map(p => p.userId);
    const students = await prisma.studentProfile.findMany({
      where: { userId: { in: userIds } }
    });
    
    const enrichedPayments = payments.map(p => {
      const student = students.find(s => s.userId === p.userId);
      return {
        ...p,
        studentName: student?.name || 'Unknown Student',
        studentEmail: '...', // We don't have user email easily here, name is fine
      };
    });

    res.json({ payments: enrichedPayments });
  } catch (error: any) {
    console.error('Pending payments error:', error);
    res.status(500).json({ error: error.message });
  }
};

// PATCH /api/admin/payments/:id/verify
export const verifyPayment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { approve } = req.body; // boolean

    if (!approve) {
      const updated = await prisma.payment.update({
        where: { id },
        data: { status: 'FAILED' }
      });
      return res.json({ success: true, payment: updated });
    }

    // Approve the payment
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    await prisma.$transaction(async (tx) => {
      // 1. Update Payment status
      await tx.payment.update({
        where: { id },
        data: { status: 'SUCCESS' }
      });

      // 2. Find StudentProfile
      const student = await tx.studentProfile.findUnique({
        where: { userId: payment.userId }
      });

      if (student) {
        // 3. Update student to Premium
        await tx.studentProfile.update({
          where: { id: student.id },
          data: { premiumStatus: true }
        });

        // 4. Create Subscription
        const sub = await tx.subscription.create({
          data: {
            studentProfileId: student.id,
            plan: 'PREMIUM',
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          }
        });

        // 5. Link Subscription to Payment
        await tx.payment.update({
          where: { id: payment.id },
          data: { subscriptionId: sub.id }
        });
      }
    });

    res.json({ success: true, message: 'Payment approved and Premium activated' });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
};
