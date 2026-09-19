// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Cleaning up active database execution logs...');
  await prisma.attendance.deleteMany({});
  await prisma.finance.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('👥 Provisioning security tokens & credentials profiles...');
  
  // Hash passwords safely before writing allocations
  const hashedAdminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const hashedTeacherPassword = await bcrypt.hash('TeacherPassword123!', 10);

  const admin = await prisma.user.create({
    data: {
      username: 'admin_root',
      email: 'admin@school.edu',
      password: hashedAdminPassword,
      role: 'Admin',
    },
  });

  const teacher = await prisma.user.create({
    data: {
      username: 'ict_principal',
      email: 'ict-dept@school.edu',
      password: hashedTeacherPassword,
      role: 'Teacher',
    },
  });

  console.log('📝 Registering student marks roster maps...');
  const student1 = await prisma.student.create({
    data: {
      studentId: 'SMS/001',
      name: 'Chala Alemu',
      grade: '12 Natural',
      subject: 'ICT',
      test1: 8,
      test2: 9,
      assignment: 18,
      finalExam: 52,
      totalScore: 87,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      studentId: 'SMS/002',
      name: 'Aster Mamo',
      grade: '12 Natural',
      subject: 'ICT',
      test1: 9,
      test2: 7,
      assignment: 16,
      finalExam: 55,
      totalScore: 87,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      studentId: 'SMS/003',
      name: 'Benti Tolossa',
      grade: '12 Natural',
      subject: 'ICT',
      test1: 6,
      test2: 8,
      assignment: 14,
      finalExam: 48,
      totalScore: 76,
    },
  });

  console.log('💵 Recalculating finance cashflow distributions...');
  await prisma.finance.createMany({
    data: [
      {
        studentId: student1.studentId,
        feeType: 'Tuition Q1',
        amountDue: 3500,
        amountPaid: 3500,
        paymentStatus: 'Paid',
      },
      {
        studentId: student2.studentId,
        feeType: 'Tuition Q1',
        amountDue: 3500,
        amountPaid: 2000,
        paymentStatus: 'Partial',
      },
    ],
  });

  console.log('📅 Logging historical presence tracker reference strings...');
  await prisma.attendance.createMany({
    data: [
      {
        studentId: student1.studentId,
        date: '2026-09-19',
        status: 'Present',
      },
      {
        studentId: student2.studentId,
        date: '2026-09-19',
        status: 'Absent',
      },
      {
        studentId: student3.studentId,
        date: '2026-09-19',
        status: 'Present',
      },
    ],
  });

  console.log('🛠️ Broadcasting online examination architecture blueprints...');
  await prisma.exam.create({
    data: {
      examId: 'EXAM-ALPHA',
      title: 'ICT Chapter 1 Digital Network Quiz',
      subject: 'ICT',
      gradeSection: '12 Natural',
      questions: [
        {
          text: 'Which storage paradigm handles global scope state context?',
          a: 'Client React Hooks Storage',
          b: 'Server Side Core Database Store',
          correct: 'B',
        },
        {
          text: 'What file name patterns execute route pathways inside NextJS?',
          a: 'route.js endpoints',
          b: 'index.html layouts',
          correct: 'A',
        },
      ],
    },
  });

  console.log('🚀 Database initialization execution complete.');
}

main()
  .catch((e) => {
    console.error('❌ Script execution failure:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });