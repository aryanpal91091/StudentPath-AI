import { Request, Response } from 'express';
import prisma from '../utils/db';

export const getOpportunities = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      education,
      branch,
      mode,
      location,
      status,
      page = '1',
      limit = '10'
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build Prisma query filter
    const filter: any = {};

    if (search) {
      filter.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { organization: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (category) {
      filter.category = { contains: category as string, mode: 'insensitive' };
    }

    if (education) {
      filter.education = { contains: education as string, mode: 'insensitive' };
    }

    if (branch && branch !== 'All Branches') {
      filter.OR = [
        { branch: { contains: branch as string, mode: 'insensitive' } },
        { branch: { equals: 'All Branches', mode: 'insensitive' } }
      ];
    }

    if (mode) {
      filter.mode = mode as string;
    }

    if (location && location !== 'Remote') {
      filter.location = { contains: location as string, mode: 'insensitive' };
    } else if (location === 'Remote') {
      filter.location = { equals: 'Remote', mode: 'insensitive' };
    }

    if (status) {
      filter.status = status as string;
    } else {
      // Default to active opportunities unless specified otherwise
      filter.status = { in: ['ACTIVE', 'CLOSING_SOON', 'UPCOMING'] };
    }

    const [opportunities, total] = await prisma.$transaction([
      prisma.opportunity.findMany({
        where: filter,
        skip,
        take: limitNum,
        orderBy: { deadline: 'asc' }
      }),
      prisma.opportunity.count({ where: filter })
    ]);

    res.status(200).json({
      opportunities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error: any) {
    console.error('Get opportunities error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getOpportunityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const opp = await prisma.opportunity.findUnique({
      where: { id: parseInt(id) },
      include: {
        skillsNeeded: {
          include: { skill: true }
        }
      }
    });

    if (!opp) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.status(200).json({ opportunity: opp });
  } catch (error: any) {
    console.error('Get opportunity by ID error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getExams = async (req: Request, res: Response) => {
  try {
    const { search, education } = req.query;
    const filter: any = {};

    if (search) {
      filter.name = { contains: search as string, mode: 'insensitive' };
    }
    if (education) {
      filter.education = { contains: education as string, mode: 'insensitive' };
    }

    const exams = await prisma.exam.findMany({
      where: filter,
      orderBy: { deadline: 'asc' }
    });

    res.status(200).json({ exams });
  } catch (error: any) {
    console.error('Get exams error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getScholarships = async (req: Request, res: Response) => {
  try {
    const { search, category } = req.query;
    const filter: any = {};

    if (search) {
      filter.name = { contains: search as string, mode: 'insensitive' };
    }
    if (category) {
      filter.category = { contains: category as string, mode: 'insensitive' };
    }

    const scholarships = await prisma.scholarship.findMany({
      where: filter,
      orderBy: { deadline: 'asc' }
    });

    res.status(200).json({ scholarships });
  } catch (error: any) {
    console.error('Get scholarships error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCareers = async (req: Request, res: Response) => {
  try {
    const { search, type } = req.query;
    const filter: any = {};

    if (search) {
      filter.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } }
      ];
    }
    if (type) {
      filter.careerType = type as string;
    }

    const careers = await prisma.career.findMany({
      where: filter,
      orderBy: { title: 'asc' }
    });

    res.status(200).json({ careers });
  } catch (error: any) {
    console.error('Get careers error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCareerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const career = await prisma.career.findUnique({
      where: { id: parseInt(id) },
      include: {
        careerSkills: {
          include: { skill: true }
        }
      }
    });

    if (!career) {
      return res.status(404).json({ error: 'Career not found' });
    }

    // Fetch matching courses for this career
    const courses = await prisma.course.findMany({
      where: { career: { equals: career.title, mode: 'insensitive' } },
      take: 5
    });

    res.status(200).json({ career, courses });
  } catch (error: any) {
    console.error('Get career by ID error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getCourses = async (req: Request, res: Response) => {
  try {
    const { search, career } = req.query;
    const filter: any = {};

    if (search) {
      filter.title = { contains: search as string, mode: 'insensitive' };
    }
    if (career) {
      filter.career = { contains: career as string, mode: 'insensitive' };
    }

    const courses = await prisma.course.findMany({
      where: filter,
      orderBy: { title: 'asc' }
    });

    res.status(200).json({ courses });
  } catch (error: any) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
