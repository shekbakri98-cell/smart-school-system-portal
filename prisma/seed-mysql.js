const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Cleaning up active database entities...');
  await prisma.attendanceRecord.deleteMany({});
  await prisma.financeLedger.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('👥 Seeding default security framework credentials accounts...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = [
    { username: 'admin', email: 'admin@school.edu', password: hashedPassword, role: 'Director' },
    { username: 'instructor_bakri', email: 'bakri@school.edu', password: hashedPassword, role: 'Instructor' },
    { username: 'chala_student', email: 'chala@school.edu', password: hashedPassword, role: 'Student' },
    { username: 'parent_monitor', email: 'parent@school.edu', password: hashedPassword, role: 'Parent' },
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  console.log('📝 Seeding global student roster columns metrics...');
  const studentData = [
    { studentId: 'SMS/001', name: 'Chala Alemu', grade: '12 Natural', subject: 'ICT', test1: 8, test2: 9, assignment: 18, finalExam: 52, totalScore: 87 },
    { studentId: 'SMS/002', name: 'Gadaa Barraq', grade: '12 Natural', subject: 'ICT', test1: 7, test2: 8, assignment: 16, finalExam: 48, totalScore: 79 },
    { studentId: 'SMS/003', name: 'Hawwi Bonsa', grade: '12 Social', subject: 'ICT', test1: 9, test2: 9, assignment: 19, finalExam: 55, totalScore: 92 },
  ];

  for (const s of studentData) {
    await prisma.student.create({ data: s });
  }

  console.log('📅 Seeding baseline daily attendance logs matrix data...');
  const today = new Date().toISOString().split('T')[0];
  await prisma.attendanceRecord.createMany({
    data: [
      { studentId: 'SMS/001', date: today, status: 'Present' },
      { studentId: 'SMS/002', date: today, status: 'Absent' },
      { studentId: 'SMS/003', date: today, status: 'Present' },
    ]
  });

  console.log('💵 Seeding institutional ledger accounts tuition balances...');
  await prisma.financeLedger.createMany({
    data: [
      { studentId: 'SMS/001', name: 'Chala Alemu', fee_type: 'Tuition Q1', amount_due: 3500, amount_paid: 3500, payment_status: 'Paid' },
      { studentId: 'SMS/002', name: 'Gadaa Barraq', fee_type: 'Lab Access Asset', amount_due: 1500, amount_paid: 0, payment_status: 'Pending' },
      { studentId: 'SMS/003', name: 'Hawwi Bonsa', fee_type: 'Tuition Q1', amount_due: 3500, amount_paid: 3500, payment_status: 'Paid' },
    ]
  });

  console.log('🛠️ Seeding assessment blueprint items architecture streams...');
  await prisma.exam.create({
    data: {
      title: 'ICT Chapter 1 Network Quiz',
      subject: 'ICT',
      grade_section: '12 Natural',
      questions_count: 2,
      questions: [
        { text: 'Which storage paradigm handles global scope state context?', a: 'Client React Hooks Storage', b: 'Server Side Core Database Store', correct: 'B' },
        { text: 'What file name patterns execute route pathways inside NextJS?', a: 'route.js endpoints', b: 'index.html layouts', correct: 'A' }
      ]
    }
  });

  console.log('🚀 Database seeding pipeline operations finalized smoothly!');
}

main()
  .catch((e) => {
    console.error('❌ Critical error staging seeding configuration payload:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
