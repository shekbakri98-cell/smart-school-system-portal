import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. POST METHOD: Handles atomic bulk exam and question array payload commits
export async function POST(req) {
  try {
    // Extract the parsed parameters array directly from the frontend request signature
    const { title, gradeSection, subject, questions } = await req.json();

    // Integrity constraint evaluation checks
    if (!title || !gradeSection || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Missing required parameters or questions payload matrix configuration." }, 
        { status: 400 }
      );
    }

    // Map and sanitize the incoming question object arrays into uniform structures
    const sanitizedQuestions = questions.map((q, idx) => ({
      text: q.text || `Missing Question Node String at index ${idx}`,
      a: q.a || '',
      b: q.b || '',
      c: q.c || '',
      d: q.d || '',
      correct: (q.correct || 'A').toUpperCase()
    }));

    // Save the record cleanly inside your MySQL database model mapping layer using Prisma
    const newExam = await prisma.exam.create({
      data: {
        title: title.trim(),
        subject: subject || 'ICT',
        grade_section: gradeSection, // Aligns camelCase request data to snake_case schema columns
        questions_count: sanitizedQuestions.length,
        questions: sanitizedQuestions // Commits the standard parsed array natively into your MySQL JSON type field
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Bulk deployment successful! Imported ${newExam.questions_count} question nodes seamlessly.`,
      examId: newExam.id
    });

  } catch (error) {
    console.error("Bulk exam transaction mapping runtime crash:", error);
    return NextResponse.json(
      { error: "Bulk data insertion failure inside serverless runlevel: " + error.message }, 
      { status: 500 }
    );
  }
}

// 2. GET METHOD: Pulls active testing pipelines matching the chosen grade parameter context
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade') || '12 Natural';

    const exams = await prisma.exam.findMany({
      where: { grade_section: grade },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, exams });
  } catch (error) {
    return NextResponse.json({ error: "Exams collection fetch failed: " + error.message }, { status: 500 });
  }
}
