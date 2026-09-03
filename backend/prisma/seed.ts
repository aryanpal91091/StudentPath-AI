/// <reference types="node" />
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function parseCSV(filePath: string): any[] {
  console.log(`Parsing CSV: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    console.warn(`CSV file not found at ${filePath}, skipping...`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  if (lines.length === 0) return [];
  
  const headers = lines[0].trim().split(',');
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values: string[] = [];
    let insideQuote = false;
    let currentValue = '';
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue);
    
    const obj: any = {};
    headers.forEach((header: string, index: number) => {
      let val = values[index] ? values[index].trim() : '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      obj[header] = val;
    });
    results.push(obj);
  }
  return results;
}

async function main() {
  console.log('Starting seed process...');
  
  // Clear existing database tables in correct order (children before parents)
  console.log('Clearing old data...');
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.verificationDocument.deleteMany({});
  await prisma.counsellingReport.deleteMany({});
  await prisma.counsellingSession.deleteMany({});
  await prisma.counsellorAvailability.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.roadmapStep.deleteMany({});
  await prisma.roadmap.deleteMany({});
  await prisma.careerRecommendation.deleteMany({});
  await prisma.careerAssessment.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.savedOpportunity.deleteMany({});
  await prisma.opportunitySkill.deleteMany({});
  await prisma.opportunity.deleteMany({});
  await prisma.course.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.scholarship.deleteMany({});
  await prisma.careerSkill.deleteMany({});
  await prisma.userSkill.deleteMany({});
  await prisma.career.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.counsellorProfile.deleteMany({});
  await prisma.adminProfile.deleteMany({});
  await prisma.user.deleteMany({});

  let datasetsDir = path.join(__dirname, '../../datasets');
  if (!fs.existsSync(datasetsDir)) {
    datasetsDir = path.join(__dirname, '../datasets');
  }
  if (!fs.existsSync(datasetsDir)) {
    datasetsDir = path.join(process.cwd(), 'datasets');
  }
  if (!fs.existsSync(datasetsDir)) {
    datasetsDir = path.join(process.cwd(), '../datasets');
  }

  // 1. Seed Skills
  console.log('Seeding Skills...');
  const skillsData = parseCSV(path.join(datasetsDir, 'skills.csv'));
  for (const s of skillsData) {
    await prisma.skill.upsert({
      where: { name: s.skill },
      update: { category: s.category },
      create: {
        id: parseInt(s.id),
        name: s.skill,
        category: s.category
      }
    });
  }

  // 2. Seed Careers
  console.log('Seeding Careers...');
  const careersData = parseCSV(path.join(datasetsDir, 'careers.csv'));
  for (const c of careersData) {
    await prisma.career.upsert({
      where: { id: parseInt(c.id) },
      update: {},
      create: {
        id: parseInt(c.id),
        careerKey: c.career,
        title: c.title,
        description: c.description,
        education: c.education,
        interests: c.interests,
        subjects: c.subjects,
        careerType: c.career_type
      }
    });
  }

  // 3. Seed Career Skills
  console.log('Seeding Career Skills...');
  const careerSkillsData = parseCSV(path.join(datasetsDir, 'career_skills.csv'));
  for (const cs of careerSkillsData) {
    await prisma.careerSkill.upsert({
      where: { careerId_skillId: { careerId: parseInt(cs.career_id), skillId: parseInt(cs.skill_id) } },
      update: { importance: cs.importance },
      create: {
        careerId: parseInt(cs.career_id),
        skillId: parseInt(cs.skill_id),
        importance: cs.importance
      }
    }).catch(() => {}); // ignore if career/skill ref missing
  }

  // 4. Seed Courses
  console.log('Seeding Courses...');
  const coursesData = parseCSV(path.join(datasetsDir, 'courses.csv'));
  for (const c of coursesData) {
    await prisma.course.upsert({
      where: { id: parseInt(c.id) },
      update: {},
      create: {
        id: parseInt(c.id),
        title: c.title,
        provider: c.provider,
        career: c.career,
        skills: c.skills,
        duration: parseInt(c.duration) || 8,
        level: c.level
      }
    });
  }

  // 5. Seed Exams
  console.log('Seeding Exams...');
  const examsData = parseCSV(path.join(datasetsDir, 'exams.csv'));
  for (const e of examsData) {
    const startStr = e.application_start;
    const deadlineStr = e.deadline;
    await prisma.exam.upsert({
      where: { id: parseInt(e.id) },
      update: {},
      create: {
        id: parseInt(e.id),
        name: e.name,
        conductingBody: e.conducting_body,
        eligibility: e.eligibility,
        education: e.education,
        branches: e.branches,
        applicationStart: startStr ? new Date(startStr.split('-').reverse().join('-')) : null,
        deadline: deadlineStr ? new Date(deadlineStr.split('-').reverse().join('-')) : null,
        officialUrl: e.official_url
      }
    });
  }

  // 6. Seed Scholarships
  console.log('Seeding Scholarships...');
  const scholarshipsData = parseCSV(path.join(datasetsDir, 'scholarships.csv'));
  for (const s of scholarshipsData) {
    const deadlineStr = s.deadline;
    await prisma.scholarship.upsert({
      where: { id: parseInt(s.id) },
      update: {},
      create: {
        id: parseInt(s.id),
        name: s.name,
        provider: s.provider,
        eligibility: s.eligibility,
        education: s.education,
        category: s.category,
        amount: s.amount,
        deadline: deadlineStr ? new Date(deadlineStr.split('-').reverse().join('-')) : null,
        officialUrl: s.official_url
      }
    });
  }

  // 7. Seed Opportunities
  console.log('Seeding Opportunities (limited to 300)...');
  const opportunitiesData = parseCSV(path.join(datasetsDir, 'opportunities.csv'));
  const slicedOpps = opportunitiesData.slice(0, 300);
  for (const o of slicedOpps) {
    const deadlineStr = o.deadline;
    const opp = await prisma.opportunity.upsert({
      where: { id: parseInt(o.id) },
      update: {},
      create: {
        id: parseInt(o.id),
        title: o.title,
        organization: o.organization,
        category: o.category,
        description: o.description,
        education: o.education,
        minYear: parseInt(o.min_year) || 1,
        maxYear: parseInt(o.max_year) || 5,
        branch: o.branch,
        skills: o.skills,
        location: o.location,
        mode: o.mode,
        deadline: deadlineStr ? new Date(deadlineStr) : null,
        prize: o.prize,
        stipend: o.stipend,
        fee: parseFloat(o.fee) || 0.0,
        url: o.url,
        source: o.source,
        lastVerified: new Date(o.last_verified),
        status: o.status
      }
    });
    
    // Link opportunity to skills
    if (o.skills) {
      const skillNames = o.skills.split(',').map((s: string) => s.trim());
      for (const sn of skillNames) {
        const skillRecord = await prisma.skill.findUnique({ where: { name: sn } });
        if (skillRecord) {
          await prisma.opportunitySkill.create({
            data: { opportunityId: opp.id, skillId: skillRecord.id }
          }).catch(() => {}); // ignore duplicates
        }
      }
    }
  }

  // 8. Seed Default Users
  console.log('Seeding Default Users...');
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const studentPassword = await bcrypt.hash('Student@123', salt);
  const counsellorPassword = await bcrypt.hash('Counsellor@123', salt);

  // A. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@studentpath.ai' },
    update: { passwordHash: adminPassword },
    create: { email: 'admin@studentpath.ai', passwordHash: adminPassword, role: 'ADMIN' }
  });
  await prisma.adminProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id, name: 'Super Admin' }
  });

  // B. Free Student User
  const studentFree = await prisma.user.upsert({
    where: { email: 'student@studentpath.ai' },
    update: { passwordHash: studentPassword },
    create: { email: 'student@studentpath.ai', passwordHash: studentPassword, role: 'STUDENT' }
  });
  const studentProfileFree = await prisma.studentProfile.create({
    data: {
      userId: studentFree.id,
      name: 'Aarav Patel',
      classLevel: 'Undergraduate',
      board: 'CBSE',
      stream: 'PCM Stream',
      branch: 'Computer Science',
      year: 2,
      cgpa: 8.2,
      location: 'Mumbai',
      onlinePreference: true,
      opportunityPreference: 'Internships, Hackathons',
      timeAvailability: 'Part-time',
      careerInterests: 'Technology, AI/ML',
      careerReadinessScore: 55.0,
      premiumStatus: false,
      currentCareerMatch: 'Software Engineer'
    }
  });

  // Add some skills for the free student
  const freeSkills = ['Python', 'HTML', 'CSS', 'JavaScript'];
  for (const sname of freeSkills) {
    const srec = await prisma.skill.findUnique({ where: { name: sname } });
    if (srec) {
      await prisma.userSkill.create({
        data: { studentProfileId: studentProfileFree.id, skillId: srec.id, proficiency: 'BEGINNER' }
      }).catch(() => {});
    }
  }

  // C. Premium Student User
  const studentPrem = await prisma.user.upsert({
    where: { email: 'premium@studentpath.ai' },
    update: { passwordHash: studentPassword },
    create: { email: 'premium@studentpath.ai', passwordHash: studentPassword, role: 'STUDENT' }
  });
  const studentProfilePrem = await prisma.studentProfile.create({
    data: {
      userId: studentPrem.id,
      name: 'Diya Sharma',
      classLevel: 'Undergraduate',
      board: 'CBSE',
      stream: 'PCM Stream',
      branch: 'Computer Science',
      year: 3,
      cgpa: 9.1,
      location: 'Bangalore',
      onlinePreference: true,
      opportunityPreference: 'Internships, Research',
      timeAvailability: 'Weekends',
      careerInterests: 'Technology, AI/ML, Research',
      careerReadinessScore: 78.0,
      premiumStatus: true,
      currentCareerMatch: 'AI/ML Engineer'
    }
  });

  // Add skills for premium student
  const premSkills = ['Python', 'JavaScript', 'React', 'Data Structures', 'Algorithms', 'Machine Learning'];
  for (const sname of premSkills) {
    const srec = await prisma.skill.findUnique({ where: { name: sname } });
    if (srec) {
      await prisma.userSkill.create({
        data: { studentProfileId: studentProfilePrem.id, skillId: srec.id, proficiency: 'INTERMEDIATE' }
      }).catch(() => {});
    }
  }

  // Create premium subscription record
  await prisma.subscription.create({
    data: {
      studentProfileId: studentProfilePrem.id,
      plan: 'PREMIUM',
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    }
  });

  // D. Counsellor User
  const counsellorUser = await prisma.user.upsert({
    where: { email: 'counsellor@studentpath.ai' },
    update: { passwordHash: counsellorPassword },
    create: { email: 'counsellor@studentpath.ai', passwordHash: counsellorPassword, role: 'COUNSELLOR' }
  });
  const counsellorProfile = await prisma.counsellorProfile.create({
    data: {
      userId: counsellorUser.id,
      name: 'Dr. Ramesh Sharma',
      qualification: 'M.Tech, Ph.D (IIT Bombay)',
      experience: '12 years',
      specialization: 'Engineering & Tech Careers',
      languages: 'English, Hindi, Marathi',
      rating: 4.8,
      sessionPrice: 1000.0,
      availability: 'Mon-Fri (4PM-8PM), Sat (10AM-4PM)',
      isVerified: true
    }
  });

  // Create default availability slots
  for (let i = 1; i <= 5; i++) {
    await prisma.counsellorAvailability.create({
      data: {
        counsellorProfileId: counsellorProfile.id,
        dayOfWeek: i,
        startTime: '16:00',
        endTime: '20:00'
      }
    });
  }
  await prisma.counsellorAvailability.create({
    data: {
      counsellorProfileId: counsellorProfile.id,
      dayOfWeek: 6,
      startTime: '10:00',
      endTime: '16:00'
    }
  });

  // Upload verification document
  await prisma.verificationDocument.create({
    data: {
      counsellorProfileId: counsellorProfile.id,
      documentType: 'DEGREE',
      documentUrl: 'https://example.com/ramesh_phd.pdf',
      verificationStatus: 'APPROVED',
      verifiedAt: new Date(),
      notes: 'Doctoral degree verified from IIT Bombay registry.'
    }
  });

  // E. 10 Sample Counsellors from CSV
  console.log('Seeding sample Counsellors from CSV...');
  const counsellorsCSV = parseCSV(path.join(datasetsDir, 'counsellors.csv'));
  const sampleCounsellors = counsellorsCSV.slice(0, 10);
  for (const c of sampleCounsellors) {
    const cPassword = await bcrypt.hash('Counsellor@123', salt);
    const emailKey = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cEmail = `${emailKey}@studentpath.ai`;

    // Skip if email already exists (e.g. from previous partial seed)
    const existing = await prisma.user.findUnique({ where: { email: cEmail } });
    if (existing) continue;

    const cUser = await prisma.user.create({
      data: { email: cEmail, passwordHash: cPassword, role: 'COUNSELLOR' }
    });
    const cp = await prisma.counsellorProfile.create({
      data: {
        userId: cUser.id,
        name: c.name,
        qualification: c.qualification,
        experience: c.experience,
        specialization: c.specialization,
        languages: c.languages,
        rating: parseFloat(c.rating) || 4.5,
        sessionPrice: parseFloat(c.session_price) || 800.0,
        availability: c.availability,
        isVerified: c.is_verified === 'True'
      }
    });
    
    // Add verification document
    await prisma.verificationDocument.create({
      data: {
        counsellorProfileId: cp.id,
        documentType: 'DEGREE',
        documentUrl: `https://example.com/docs/${emailKey}_degree.pdf`,
        verificationStatus: cp.isVerified ? 'APPROVED' : 'PENDING',
        verifiedAt: cp.isVerified ? new Date() : null,
        notes: cp.isVerified ? 'Verified.' : 'Awaiting review.'
      }
    });
  }

  console.log('\n✅ Seed complete! Default accounts:');
  console.log('   Admin:     admin@studentpath.ai     / Admin@123');
  console.log('   Student:   student@studentpath.ai   / Student@123');
  console.log('   Premium:   premium@studentpath.ai   / Student@123');
  console.log('   Counsellor: counsellor@studentpath.ai / Counsellor@123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
