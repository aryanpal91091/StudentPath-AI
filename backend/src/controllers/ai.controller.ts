import { Response } from 'express';
import prisma from '../utils/db';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const recommendOpportunities = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'STUDENT') {
      return res.status(403).json({ error: 'Only student accounts can request recommendations' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        skills: { include: { skill: true } }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Call ML Service
    try {
      const response = await fetch(`${ML_SERVICE_URL}/recommend-opportunities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          education: student.classLevel || 'Undergraduate',
          branch: student.branch || 'All Branches',
          year: student.year || 1,
          skills: student.skills.map(s => s.skill.name).join(','),
          interests: student.careerInterests || '',
          location: student.location || 'Remote',
          mode: student.onlinePreference ? 'ONLINE' : 'OFFLINE'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }
    } catch (mlError) {
      console.warn('ML Service offline, using DB fallback matcher...');
    }

    // Fallback: Match opportunities using basic SQL search
    const matchingOpps = await prisma.opportunity.findMany({
      where: {
        status: 'ACTIVE',
        education: { contains: student.classLevel || 'Undergraduate', mode: 'insensitive' }
      },
      take: 10
    });

    const recommendations = matchingOpps.map((o, idx) => {
      // Calculate a basic matching score
      let score = 70;
      if (student.branch && (o.branch.toLowerCase().includes(student.branch.toLowerCase()) || o.branch.toLowerCase() === 'all branches')) score += 10;
      if (student.onlinePreference && o.mode === 'ONLINE') score += 10;
      
      // Look for overlapping skills
      const studentSkillNames = student.skills.map(s => s.skill.name.toLowerCase());
      const oppSkills = o.skills.split(',').map(s => s.trim().toLowerCase());
      const common = oppSkills.filter(s => studentSkillNames.includes(s));
      score += common.length * 5;

      return {
        id: o.id,
        title: o.title,
        organization: o.organization,
        category: o.category,
        education: o.education,
        deadline: o.deadline,
        mode: o.mode,
        location: o.location,
        matchPercentage: Math.min(score, 99),
        reasoning: `Recommended because you are a ${student.classLevel} student with interests in ${student.careerInterests || 'opportunities'}.`
      };
    });

    // Sort by match percentage
    recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.status(200).json({ recommendations });

  } catch (error: any) {
    console.error('Recommend opportunities error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const careerRecommendation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { answers } = req.body; // JSON object of assessment answers
    if (!answers) {
      return res.status(400).json({ error: 'Assessment answers are required' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Save CareerAssessment
    const assessment = await prisma.careerAssessment.create({
      data: {
        studentProfileId: student.id,
        answers: JSON.stringify(answers)
      }
    });

    // Call ML Service
    let mlRecommendations: any = null;
    try {
      const response = await fetch(`${ML_SERVICE_URL}/career-recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      if (response.ok) {
        mlRecommendations = await response.json();
      }
    } catch (mlError) {
      console.warn('ML Service offline, using fallback career recommender...');
    }

    let recommendations = [];

    if (mlRecommendations && mlRecommendations.recommendations) {
      recommendations = mlRecommendations.recommendations;
    } else {
      // Fallback matching
      // Handle both string answers (from frontend wizard) and arrays
      const toStr = (val: any) => Array.isArray(val) ? val.join(',') : (val || '');
      const interestsStr = toStr(answers.interests).toLowerCase();
      const subjectsStr = toStr(answers.skills || answers.subjects).toLowerCase();
      const valuesStr = toStr(answers.values).toLowerCase();
      const educationStr = toStr(answers.education).toLowerCase();

      const allCareers = await prisma.career.findMany({ take: 50 });
      const scored = allCareers.map(c => {
        let score = 40;

        // Match interests
        const careerInterests = (c.interests || '').split(',').map((x: string) => x.trim().toLowerCase());
        careerInterests.forEach((i: string) => {
          if (i && interestsStr.includes(i)) score += 12;
        });

        // Match subjects/skills
        const careerSubjects = (c.subjects || '').split(',').map((x: string) => x.trim().toLowerCase());
        careerSubjects.forEach((s: string) => {
          if (s && subjectsStr.includes(s)) score += 10;
        });

        // Match education level
        if (educationStr && c.education && c.education.toLowerCase().includes(educationStr.split(' ')[0])) {
          score += 8;
        }

        // Match student profile
        if (student?.careerInterests) {
          const profileInterests = student.careerInterests.toLowerCase();
          careerInterests.forEach((i: string) => {
            if (i && profileInterests.includes(i)) score += 6;
          });
        }

        const matching = careerInterests.filter((i: string) => i && interestsStr.includes(i));
        return {
          career: {
            id: c.id,
            title: c.title,
            description: c.description,
            careerType: c.careerType,
          },
          matchScore: Math.min(score, 96) / 100,
          reasoning: {
            rationale: `This career aligns with your interests in ${c.interests || 'various fields'} and background in ${c.subjects || 'related subjects'}.`,
            matchingSkills: matching.slice(0, 4),
            missingSkills: careerSubjects.filter((s: string) => s && !subjectsStr.includes(s)).slice(0, 3),
          },
          // Legacy fields for backward compat
          careerId: c.id,
          careerKey: c.careerKey,
          title: c.title,
          description: c.description,
          matchPercentage: Math.min(score, 96),
        };
      });

      recommendations = scored.sort((a: any, b: any) => b.matchScore - a.matchScore).slice(0, 8);
    }

    // Save recommendations to DB
    for (const r of recommendations) {
      await prisma.careerRecommendation.create({
        data: {
          careerAssessmentId: assessment.id,
          careerId: r.careerId || r.career?.id,
          matchScore: r.matchPercentage || Math.round((r.matchScore || 0) * 100),
          reasoning: JSON.stringify(r.reasoning)
        }
      });
    }

    // Update student's target career match to the highest scoring one
    if (recommendations.length > 0) {
      await prisma.studentProfile.update({
        where: { id: student.id },
        data: { currentCareerMatch: recommendations[0].title }
      });
    }

    res.status(200).json({
      assessmentId: assessment.id,
      recommendations
    });

  } catch (error: any) {
    console.error('Career recommendation error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getSkillGap = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { careerId } = req.body;
    if (!careerId) {
      return res.status(400).json({ error: 'Career ID is required' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        skills: { include: { skill: true } }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Call ML Service
    try {
      const response = await fetch(`${ML_SERVICE_URL}/skill-gap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          career_id: parseInt(careerId),
          student_skills: student.skills.map(s => s.skill.name).join(',')
        })
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }
    } catch (mlError) {
      console.warn('ML Service offline, using DB fallback skill gap...');
    }

    // Fallback: Query CareerSkills and compare
    const career = await prisma.career.findUnique({
      where: { id: parseInt(careerId) },
      include: {
        careerSkills: { include: { skill: true } }
      }
    });

    if (!career) {
      return res.status(404).json({ error: 'Career not found' });
    }

    const skillsHave: string[] = [];
    const skillsNeed: string[] = [];
    const skillList = career.careerSkills.map(cs => {
      const hasSkill = student.skills.find(sk => sk.skillId === cs.skillId);
      if (hasSkill) {
        skillsHave.push(cs.skill.name);
      } else {
        skillsNeed.push(cs.skill.name);
      }
      return {
        name: cs.skill.name,
        importance: cs.importance,
        status: hasSkill ? 'HAVE' : 'NEED'
      };
    });

    res.status(200).json({
      career: career.title,
      skillsHave,
      skillsNeed,
      skillList,
      prioritySequence: skillsNeed
    });

  } catch (error: any) {
    console.error('Get skill gap error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getCareerRoadmap = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { careerId } = req.body;
    if (!careerId) {
      return res.status(400).json({ error: 'Career ID is required' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Call ML Service
    try {
      const response = await fetch(`${ML_SERVICE_URL}/career-roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          career_id: parseInt(careerId),
          education: student.classLevel || 'Undergraduate'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data);
      }
    } catch (mlError) {
      console.warn('ML Service offline, using fallback roadmap...');
    }

    const career = await prisma.career.findUnique({
      where: { id: parseInt(careerId) }
    });

    if (!career) {
      return res.status(404).json({ error: 'Career not found' });
    }

    // Fallback: Generate structured steps
    const steps = [
      { order: 1, title: 'Learn Fundamentals', description: `Master basic skills required for ${career.title}, starting with ${career.subjects.split(',')[0] || 'core subjects'}.` },
      { order: 2, title: 'Build Practical Projects', description: 'Apply concepts in real-world personal projects. Build a strong portfolio.' },
      { order: 3, title: 'Prepare for Entrance Exams', description: 'Register and practice mocks for relevant entrance examinations.' },
      { order: 4, title: 'Seek Internships', description: 'Participate in college competitions and apply for internships in the field.' },
      { order: 5, title: 'Target Job Roles', description: 'Refine resume, prepare for coding/design challenges, and apply to corporate roles.' }
    ];

    res.status(200).json({
      career: career.title,
      steps
    });

  } catch (error: any) {
    console.error('Get career roadmap error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const aiAssistantChat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { message, chatHistory } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user.id },
      include: {
        skills: { include: { skill: true } }
      }
    });

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const studentContext = {
      name: student.name,
      education: `${student.classLevel || 'N/A'} in ${student.branch || student.stream || 'N/A'}`,
      skills: student.skills.map(s => s.skill.name).join(', '),
      interests: student.careerInterests || 'None chosen',
      targetCareer: student.currentCareerMatch || 'None chosen'
    };

    // Smart contextual mock chat replies mapping
    let reply = `Hello ${student.name}! As your StudentPath AI Assistant, I'm analyzing your profile: you are pursuing **${studentContext.education}** and have skills in **${studentContext.skills || 'basic areas'}**. How can I guide you today?`;

    const m = message.toLowerCase();
    if (m.includes('cse') || m.includes('bca') || m.includes('b.tech') || m.includes('btech')) {
      reply = `Choosing between B.Tech CSE and BCA depends on your career goals and timelines:
- **B.Tech CSE (4 years)**: Focuses deeply on engineering, hardware, and algorithms. Highly valued for core R&D, product engineering, and global placements.
- **BCA (3 years)**: Focuses more on software applications, development, and database administration. It's a faster route to software roles, but usually requires an MCA to align with B.Tech CSE starting salary brackets.
Since your profile lists target career as **${studentContext.targetCareer}**, a B.Tech or BCA followed by practical projects is a great fit.`;
    } else if (m.includes('ai') || m.includes('machine learning') || m.includes('ml')) {
      reply = `To excel in AI/ML engineering, here is a recommended progression:
1. **Mathematics & Stats**: Linear Algebra, Calculus, and Probability are essential.
2. **Programming**: Master **Python** and libraries like **Pandas**, **NumPy**, and **scikit-learn**.
3. **Data Structures**: Build solid DSA skills to write optimized code.
4. **Deep Learning**: Explore neural networks using **PyTorch** or **TensorFlow**.
I recommend check out courses under our Opportunity Hub, or speaking with a verified counsellor to plan projects!`;
    } else if (m.includes('gate') || m.includes('exam')) {
      reply = `For **GATE** or other competitive exams, consider this blueprint:
- **Syllabus**: Complete 80%+ of the technical syllabus by October.
- **Mocks**: Take weekly mock exams starting in November.
- **Reference**: Refer to IISc/IIT official portals (e.g. gate2027) which we track in our Opportunities section.
Would you like me to show matching exam schedules?`;
    } else if (m.includes('scholarship') || m.includes('funding')) {
      reply = `Based on your profile, you may be eligible for:
- **Reliance Foundation Undergraduate Scholarships**: Up to Rs. 2,00,000 for UG students.
- **NSP Central Sector Scheme**: Up to Rs. 20,000 per year.
Check the **Scholarship Hub** in the sidebar to review eligibility and deadline alerts!`;
    } else if (m.includes('internship') || m.includes('skills')) {
      reply = `For software development internships, focus on:
1. **GitHub Profile**: Version control is a must. Upload your project repositories.
2. **Core Tech**: Depending on front/back preferences, master React or Node.js.
3. **Portfolio**: Build 2 robust full-stack projects instead of 10 basic ones.
Let's update your roadmap to track these milestones!`;
    }

    res.status(200).json({
      reply,
      studentContext
    });

  } catch (error: any) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
