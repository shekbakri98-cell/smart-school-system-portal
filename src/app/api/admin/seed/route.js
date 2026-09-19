import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    console.log("🔄 Purging pre-existing database datasets...");
    await prisma.attendanceRecord.deleteMany({});
    await prisma.student.deleteMany({});
    await prisma.exam.deleteMany({});
    await prisma.financeLedger.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("🌱 Injecting Security User Roles...");
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    await prisma.user.createMany({
      data: [
        { username: "Admin User", email: "admin@school.edu", password: passwordHash, role: "Director" },
        { username: "Instructor Bob", email: "bob@school.edu", password: passwordHash, role: "Instructor" },
        { username: "Chala Alemu", email: "chala@school.edu", password: passwordHash, role: "Student" },
      ]
    });

    console.log("🌱 Populating Student Roster Data Matrix...");
    await prisma.student.createMany({
      data: [
        { studentId: "SMS/001", name: "Chala Alemu", grade: "12 Natural", subject: "ICT", test1: 9, test2: 8, assignment: 18, finalExam: 52 },
        { studentId: "SMS/002", name: "Gadaa Barraq", grade: "12 Natural", subject: "ICT", test1: 8, test2: 7, assignment: 15, finalExam: 48 },
      ]
    });

    console.log("🌱 Injecting Liabilities Finance Logs...");
    await prisma.financeLedger.createMany({
      data: [
        { studentId: "SMS/001", fee_type: "Tuition Q1", amount_due: 3500, amount_paid: 3500, payment_status: "Paid" },
      ]
    });

    return NextResponse.json({ 
      success: true, 
      message: "Database system matrices successfully populated over remote network context!" 
    });
  } catch (error) {
    return NextResponse.json({ error: "Remote seed mapping runtime drop: " + error.message }, { status: 500 });
  }
}
