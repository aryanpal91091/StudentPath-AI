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

  // 1. Seed Default Users FIRST to ensure login works immediately
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
  await prisma.studentProfile.upsert({
    where: { userId: studentFree.id },
    update: {},
    create: {
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

  // C. Premium Student User
  const studentPrem = await prisma.user.upsert({
    where: { email: 'premium@studentpath.ai' },
    update: { passwordHash: studentPassword },
    create: { email: 'premium@studentpath.ai', passwordHash: studentPassword, role: 'STUDENT' }
  });
  await prisma.studentProfile.upsert({
    where: { userId: studentPrem.id },
    update: {},
    create: {
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

  // D. Counsellor User
  const counsellorUser = await prisma.user.upsert({
    where: { email: 'counsellor@studentpath.ai' },
    update: { passwordHash: counsellorPassword },
    create: { email: 'counsellor@studentpath.ai', passwordHash: counsellorPassword, role: 'COUNSELLOR' }
  });
  await prisma.counsellorProfile.upsert({
    where: { userId: counsellorUser.id },
    update: {},
    create: {
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

  // 2. Seed Skills
  console.log('Seeding Skills...');
  const skillsData = parseCSV(path.join(datasetsDir, 'skills.csv'));
  const validSkills = skillsData
    .filter(s => s.id && s.skill)
    .map(s => ({
      id: parseInt(s.id),
      name: s.skill,
      category: s.category || 'General'
    }));
  await prisma.skill.createMany({ data: validSkills, skipDuplicates: true });

  // 3. Seed Careers
  console.log('Seeding Careers...');
  const careersData = parseCSV(path.join(datasetsDir, 'careers.csv'));
  const validCareers = careersData
    .filter(c => c.id && c.title)
    .map(c => ({
      id: parseInt(c.id),
      careerKey: c.career || `career_${c.id}`,
      title: c.title,
      description: c.description || '',
      education: c.education || '',
      interests: c.interests || '',
      subjects: c.subjects || '',
      careerType: c.career_type || 'General'
    }));
  await prisma.career.createMany({ data: validCareers, skipDuplicates: true });

  // 4. Seed Courses
  console.log('Seeding Courses...');
  const coursesData = parseCSV(path.join(datasetsDir, 'courses.csv')).slice(0, 100);
  const validCourses = coursesData
    .filter(c => c.id && c.title)
    .map(c => ({
      id: parseInt(c.id),
      title: c.title,
      provider: c.provider || '',
      career: c.career || '',
      skills: c.skills || '',
      duration: parseInt(c.duration) || 8,
      level: c.level || 'Intermediate'
    }));
  await prisma.course.createMany({ data: validCourses, skipDuplicates: true });

  // 5. Seed Exams
  console.log('Seeding Exams...');
  const examsData = parseCSV(path.join(datasetsDir, 'exams.csv'));
  const validExams = examsData
    .filter(e => e.id && e.name)
    .map(e => {
      const startStr = e.application_start;
      const deadlineStr = e.deadline;
      return {
        id: parseInt(e.id),
        name: e.name,
        conductingBody: e.conducting_body || '',
        eligibility: e.eligibility || '',
        education: e.education || '',
        branches: e.branches || '',
        applicationStart: startStr ? new Date(startStr.split('-').reverse().join('-')) : null,
        deadline: deadlineStr ? new Date(deadlineStr.split('-').reverse().join('-')) : null,
        officialUrl: e.official_url || null
      };
    });
  await prisma.exam.createMany({ data: validExams, skipDuplicates: true });

  // 6. Seed Scholarships
  console.log('Seeding Scholarships...');
  const scholarshipsData = parseCSV(path.join(datasetsDir, 'scholarships.csv'));
  const validScholarships = scholarshipsData
    .filter(s => s.id && s.name)
    .map(s => {
      const deadlineStr = s.deadline;
      return {
        id: parseInt(s.id),
        name: s.name,
        provider: s.provider || '',
        eligibility: s.eligibility || '',
        education: s.education || '',
        category: s.category || '',
        amount: s.amount || '',
        deadline: deadlineStr ? new Date(deadlineStr.split('-').reverse().join('-')) : null,
        officialUrl: s.official_url || null
      };
    });
  await prisma.scholarship.createMany({ data: validScholarships, skipDuplicates: true });

  // 7. Seed Opportunities
  console.log('Seeding Opportunities (300 items)...');
  const opportunitiesData = parseCSV(path.join(datasetsDir, 'opportunities.csv'));
  const slicedOpps = opportunitiesData.slice(0, 300);
  const validOpps = slicedOpps
    .filter(o => o.id && o.title)
    .map(o => {
      const deadlineStr = o.deadline;
      return {
        id: parseInt(o.id),
        title: o.title,
        organization: o.organization || 'Various',
        category: o.category || 'Internship',
        description: o.description || '',
        education: o.education || 'All Streams',
        minYear: parseInt(o.min_year) || 1,
        maxYear: parseInt(o.max_year) || 5,
        branch: o.branch || 'All Branches',
        skills: o.skills || '',
        location: o.location || 'Remote',
        mode: o.mode || 'ONLINE',
        deadline: deadlineStr ? new Date(deadlineStr) : null,
        prize: o.prize || null,
        stipend: o.stipend || null,
        fee: parseFloat(o.fee) || 0.0,
        url: o.url || null,
        source: o.source || 'Official',
        lastVerified: o.last_verified ? new Date(o.last_verified) : new Date(),
        status: o.status || 'ACTIVE'
      };
    });
  await prisma.opportunity.createMany({ data: validOpps, skipDuplicates: true });

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

