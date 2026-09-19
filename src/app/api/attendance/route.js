import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');
    const grade = searchParams.get('grade');

    const data = await prisma.attendanceRecord.findMany({
      where: {
        date: date,
        student: { grade: grade }
      }
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Failed loading attendance checkmarks: " + error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { studentId, date, status } = await req.json();

    const record = await prisma.attendanceRecord.upsert({
      where: {
        studentId_date: { studentId, date }
      },
      update: { status },
      create: { studentId, date, status }
    });

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return NextResponse.json({ error: "Attendance index state write failed: " + error.message }, { status: 500 });
  }
}
