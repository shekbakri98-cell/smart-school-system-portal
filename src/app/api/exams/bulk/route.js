import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';

export async function POST(req) {
  let db;
  try {
    // MATCH THE FRONTEND: Extract the parsed questions array directly
    const { title, gradeSection, subject, questions } = await req.json();

    if (!title || !gradeSection || !questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: "Missing required parameters or questions payload matrix." }, { status: 400 });
    }

    db = await connectToDatabase();
    
    // Step A: Start transaction to ensure atomic execution
    await db.beginTransaction();

    // Step B: Insert global exam parameters to generate an operational ID
    const [examResult] = await db.query(
      'INSERT INTO school_exams (title, grade_section, subject) VALUES (?, ?, ?)',
      [title, gradeSection, subject || 'ICT']
    );
    const newExamId = examResult.insertId;

    let questionsCommitted = 0;

    // Step C: Loop through the already parsed questions array from the frontend
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      // Safe protection fallback checks
      const questionText = q.text || 'Missing Question Text';
      const optionA = q.a || '';
      const optionB = q.b || '';
      const optionC = q.c || '';
      const optionD = q.d || '';
      const correctOption = (q.correct || 'A').toUpperCase();

      // Insert question node elements
      await db.query(
        'INSERT INTO exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newExamId, questionText, optionA, optionB, optionC, optionD, correctOption]
      );
      questionsCommitted++;
    }

    // Commit all entries only if no rows failed
    await db.commit();

    return NextResponse.json({ 
      success: true, 
      message: `Bulk deployment successful! Imported ${questionsCommitted} question nodes seamlessly.` 
    });

  } catch (error) {
    // Roll back open actions completely if any single internal failure occurs
    if (db) {
      try {
        await db.rollback();
      } catch (rbErr) {
        console.error("Rollback error state encountered:", rbErr);
      }
    }
    
    return NextResponse.json({ error: "Bulk data insertion failure: " + error.message }, { status: 500 });
  }
}
