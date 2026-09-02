import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

/**
 * 1. GET METHOD: Fetches available exams from the database container.
 * Supports grade-level parameter matching to isolate student tests.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade');
    const examId = searchParams.get('examId'); // New precise targeted ID query parameter interceptor
    const db = await connectToDatabase();
    
    // If an examId parameter is specifically supplied, download the inner questions list
    if (examId) {
      const [questions] = await db.query(
        'SELECT * FROM exam_questions WHERE exam_id = ? ORDER BY q_id ASC',
        [examId]
      );
      return NextResponse.json({ success: true, questions });
    }

    if (grade) {
      const [exams] = await db.query(
        'SELECT * FROM school_exams WHERE grade_section = ? ORDER BY created_at DESC', 
        [grade]
      );
      return NextResponse.json({ success: true, exams });
    }
    
    const [allExams] = await db.query('SELECT * FROM school_exams ORDER BY created_at DESC');
    return NextResponse.json({ success: true, exams: allExams });
  } catch (error) {
    return NextResponse.json({ error: "Failed loading examination matrix records: " + error.message }, { status: 500 });
  }
}


/**
 * 2. POST METHOD: Handles the "Publish Automated Exam" builder form actions.
 * Authenticates input arrays and performs relational multi-table database seeding.
 */
export async function POST(req) {
  try {
    const { title, gradeSection, subject, questions } = await req.json();
    
    // Integrity check ensuring text forms and dynamic question arrays exist 
    if (!title || !gradeSection || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Missing required examination title or valid question nodes layout." }, 
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Step A: Insert global exam container parameters to generate an operational ID
    const [examResult] = await db.query(
      'INSERT INTO school_exams (title, grade_section, subject) VALUES (?, ?, ?)',
      [title, gradeSection, subject || 'ICT']
    );
    
    const newExamId = examResult.insertId;
    
    // Step B: Loop through questions array, anchoring each row key to the generated exam ID
    for (const q of questions) {
      // Validates individual question properties before row write commits
      if (!q.text || !q.a || !q.b || !q.correct) continue;
      
      await db.query(
        'INSERT INTO exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          newExamId, 
          q.text, 
          q.a, 
          q.b, 
          q.c || '', 
          q.d || '', 
          q.correct.toUpperCase()
        ]
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: "Online examination module generated and synchronized successfully!" 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Examination transaction database write failure: " + error.message }, 
      { status: 500 }
    );
  }
}
