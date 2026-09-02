import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

// JWT settings
const JWT_SECRET = process.env.JWT_SECRET || 'studentpath_jwt_secret_token_key_2026_growth';
const JWT_EXPIRES_IN = '7d';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, role, name, extraData } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: 'Email, password, role, and name are required' });
    }

    if (!['STUDENT', 'COUNSELLOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be STUDENT, COUNSELLOR, or ADMIN' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user and profile in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          role
        }
      });

      let profile;
      if (role === 'STUDENT') {
        profile = await tx.studentProfile.create({
          data: {
            userId: user.id,
            name,
            premiumStatus: false,
            careerReadinessScore: 10.0 // Base score for registration
          }
        });
      } else if (role === 'COUNSELLOR') {
        const { qualification, experience, specialization, languages, sessionPrice, availability } = extraData || {};
        profile = await tx.counsellorProfile.create({
          data: {
            userId: user.id,
            name,
            qualification: qualification || 'Not Specified',
            experience: experience || 'Not Specified',
            specialization: specialization || 'General Guidance',
            languages: languages || 'English',
            sessionPrice: parseFloat(sessionPrice) || 0.0,
            availability: availability || 'By Appointment',
            isVerified: false // Admin must verify
          }
        });
      } else if (role === 'ADMIN') {
        profile = await tx.adminProfile.create({
          data: {
            userId: user.id,
            name
          }
        });
      }

      return { user, profile };
    });

    // Create token
    const token = jwt.sign(
      { id: result.user.id, email: result.user.email, role: result.user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        counsellorProfile: true,
        adminProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    let name = 'User';
    if (user.role === 'STUDENT' && user.studentProfile) name = user.studentProfile.name;
    else if (user.role === 'COUNSELLOR' && user.counsellorProfile) name = user.counsellorProfile.name;
    else if (user.role === 'ADMIN' && user.adminProfile) name = user.adminProfile.name;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        studentProfile: {
          include: {
            skills: {
              include: {
                skill: true
              }
            }
          }
        },
        counsellorProfile: true,
        adminProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error: any) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const onboardStudent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only student accounts can complete onboarding' });
    }

    const {
      classLevel,
      board,
      stream,
      branch,
      year,
      percentage,
      cgpa,
      subjects,
      location,
      onlinePreference,
      opportunityPreference,
      timeAvailability,
      careerInterests,
      skills // Array of { name: string, proficiency: 'BEGINNER'|'INTERMEDIATE'|'ADVANCED' }
    } = req.body;

    // Find student profile
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Save profile data in transaction
    await prisma.$transaction(async (tx: any) => {
      // 1. Update StudentProfile core details
      // Calculate career readiness score based on profile completion
      let score = 20.0; // Base score
      if (classLevel) score += 10.0;
      if (branch || stream) score += 10.0;
      if (percentage || cgpa) score += 10.0;
      if (location) score += 5.0;
      if (careerInterests && careerInterests.length > 0) score += 15.0;
      if (skills && skills.length > 0) score += 20.0;

      await tx.studentProfile.update({
        where: { id: student.id },
        data: {
          classLevel,
          board,
          stream,
          branch,
          year: parseInt(year) || null,
          percentage: parseFloat(percentage) || null,
          cgpa: parseFloat(cgpa) || null,
          subjects: Array.isArray(subjects) ? subjects.join(',') : subjects,
          location,
          onlinePreference: onlinePreference !== undefined ? onlinePreference : true,
          opportunityPreference,
          timeAvailability,
          careerInterests: Array.isArray(careerInterests) ? careerInterests.join(',') : careerInterests,
          careerReadinessScore: Math.min(score, 100.0)
        }
      });

      // 2. Clear current user skills and re-populate
      await tx.userSkill.deleteMany({
        where: { studentProfileId: student.id }
      });

      if (skills && Array.isArray(skills)) {
        for (const s of skills) {
          // Find or create skill
          let skillRecord = await tx.skill.findFirst({
            where: { name: { equals: s.name, mode: 'insensitive' } }
          });

          if (!skillRecord) {
            skillRecord = await tx.skill.create({
              data: {
                name: s.name,
                category: 'Other'
              }
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

    const updatedProfile = await prisma.studentProfile.findUnique({
      where: { id: student.id },
      include: {
        skills: {
          include: {
            skill: true
          }
        }
      }
    });

    res.status(200).json({
      message: 'Onboarding completed successfully',
      profile: updatedProfile
    });

  } catch (error: any) {
    console.error('Onboarding error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
