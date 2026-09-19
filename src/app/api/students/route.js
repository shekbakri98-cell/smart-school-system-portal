import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade') || '12 Natural';

    const data = await prisma.student.findMany({
      where: { grade: grade }
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: "Roster fetch failed: " + error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { studentId, name, grade } = await req.json();

    if (!studentId || !name || !grade) {
      return NextResponse.json({ error: "Missing required student matrix fields." }, { status: 400 });
    }

    const newStudent = await prisma.student.create({
      data: {
        studentId: studentId.trim(),
        name: name.trim(),
        grade: grade,
        test1: 0,
        test2: 0,
        assignment: 0,
        finalExam: 0
      }
    });

    return NextResponse.json({ success: true, data: newStudent });
  } catch (error) {
    return NextResponse.json({ error: "Student enrollment write failed: " + error.message }, { status: 500 });
  }
}
