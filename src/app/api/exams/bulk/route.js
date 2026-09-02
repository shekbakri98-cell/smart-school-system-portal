import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';

export async function POST(req) {
  try {
    const { title, gradeSection, subject, rawCsvData } = await req.json();

    if (!title || !gradeSection || !rawCsvData) {
      return NextResponse.json({ error: "Missing required meta parameters or CSV payload content." }, { status: 400 });
    }

    const db = await connectToDatabase();

    // Step A: Insert global exam parameters to generate an operational ID
    const [examResult] = await db.query(
      'INSERT INTO school_exams (title, grade_section, subject) VALUES (?, ?, ?)',
      [title, gradeSection, subject || 'ICT']
    );
    const newExamId = examResult.insertId;

    // Step B: Cleanly parse raw string entries row by row line breaks
    const rows = rawCsvData.split('\n');
    let questionsCommitted = 0;

    for (let i = 0; i < rows.length; i++) {
      const line = rows[i].trim();
      if (!line) continue; // Skip blank layout lines

      // Split row values by comma delimiters
      const columns = line.split(',');
      
      // Expected Schema Format: Question Text, Option A, Option B, Option C, Option D, Correct Key
      if (columns.length >= 4) {
        const questionText = columns[0].trim();
        const optionA = columns[1].trim();
        const optionB = columns[2].trim();
        const optionC = columns[3] ? columns[3].trim() : '';
        const optionD = columns[4] ? columns[4].trim() : '';
        const correctOption = columns[5] ? columns[5].trim().toUpperCase() : 'A';

        await db.query(
          'INSERT INTO exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [newExamId, questionText, optionA, optionB, optionC, optionD, correctOption]
        );
        questionsCommitted++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Bulk deployment successful! Imported ${questionsCommitted} question nodes seamlessly.` 
    });
  } catch (error) {
    return NextResponse.json({ error: "Bulk data insertion failure: " + error.message }, { status: 500 });
  }
}
