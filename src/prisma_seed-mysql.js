const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Purging database tables...");
  await prisma.attendanceRecord.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.financeLedger.deleteMany({});
  await prisma.user.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);

  await prisma.user.createMany({
    data: [
      { username: "Admin User", email: "admin@school.edu", password: passwordHash, role: "Director" },
      { username: "Instructor Bob", email: "bob@school.edu", password: passwordHash, role: "Instructor" },
    ]
  });

  await prisma.student.createMany({
    data: [
      { studentId: "SMS/001", name: "Chala Alemu", grade: "12 Natural", subject: "ICT", test1: 9, test2: 8, assignment: 18, finalExam: 52 },
      { studentId: "SMS/002", name: "Gadaa Barraq", grade: "12 Natural", subject: "ICT", test1: 8, test2: 7, assignment: 15, finalExam: 48 }
    ]
  });

  console.log("🌱 Seed execution complete.");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());