import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

// FETCH ALL EXAMS OR SPECIFIC STUDENT RESULTS
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade');

    const db = await connectToDatabase();
    
    if (grade) {
      // Fetch available exams for a specific grade level
      const [exams] = await db.query('SELECT * FROM school_exams WHERE grade_section = ?', [grade]);
      return NextResponse.json({ success: true, exams });
    }

    // Default: Return overall testing parameters
    const [allExams] = await db.query('SELECT * FROM school_exams ORDER BY created_at DESC');
    return NextResponse.json({ success: true, exams: allExams });
  } catch (error) {
    return NextResponse.json({ error: "Failed loading exam nodes: " + error.message }, { status: 500 });
  }
}

// CREATE A SMART ONLINE EXAM WITH QUESTIONS GRID
export async function POST(req) {
  try {
    const { title, gradeSection, subject, questions } = await req.json();

    if (!title || !gradeSection || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Missing required exam metadata or question nodes." }, { status: 400 });
    }

    const db = await connectToDatabase();

    // 1. Insert global exam metadata container
    const [examResult] = await db.query(
      'INSERT INTO school_exams (title, grade_section, subject) VALUES (?, ?, ?)',
      [title, gradeSection, subject || 'ICT']
    );
    const newExamId = examResult.insertId;

    // 2. Insert batch questions recursively into the matrix
    for (const q of questions) {
      await db.query(
        'INSERT INTO exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newExamId, q.text, q.a, q.b, q.c, q.d, q.correct.toUpperCase()]
      );
    }

    return NextResponse.json({ success: true, message: "Exam module generated and synchronized successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Database transaction failure: " + error.message }, { status: 500 });
  }
}
