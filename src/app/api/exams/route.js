import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET METHOD: Pulls registered test records matching the target filtered grade context
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade') || '12 Natural';

    const exams = await prisma.exam.findMany({
      where: { grade_section: grade }
    });

    return NextResponse.json({ success: true, exams });
  } catch (error) {
    return NextResponse.json({ error: "Exams collection fetch failed: " + error.message }, { status: 500 });
  }
}

// 2. POST METHOD: Commits new multi-question test blueprints dynamically to storage matrices
export async function POST(req) {
  try {
    const body = await req.json();
    
    if (!body.title || !body.grade_section || !body.questions) {
      return NextResponse.json({ error: "Missing core test payload parameter items." }, { status: 400 });
    }

    const newExam = await prisma.exam.create({
      data: {
        title: body.title,
        subject: body.subject || 'ICT',
        grade_section: body.grade_section,
        questions_count: body.questions.length,
        questions: body.questions // Commits standard structured arrays directly to your MySQL Json schema field
      }
    });
    
    return NextResponse.json({ success: true, exam: newExam });
  } catch (error) {
    return NextResponse.json({ error: "Failed compiling test blueprint pipeline: " + error.message }, { status: 500 });
  }
}
