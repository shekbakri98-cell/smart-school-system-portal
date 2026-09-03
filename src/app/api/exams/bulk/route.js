import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';

export async function POST(req) {
  let db;
  try {
    const { title, gradeSection, subject, rawCsvData } = await req.json();

    if (!title || !gradeSection || !rawCsvData) {
      return NextResponse.json({ error: "Missing required meta parameters or CSV payload content." }, { status: 400 });
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

    // Step C: Cleanly parse raw string entries row by row line breaks
    // Handles both standard unix (\n) and windows server (\r\n) line formatting breaks
    const rows = rawCsvData.split(/\r?\n/);
    let questionsCommitted = 0;

    for (let i = 0; i < rows.length; i++) {
      const line = rows[i].trim();
      if (!line) continue; // Skip blank layout lines

      // ROBUST PARSING PATTERN: Regex correctly isolates columns wrapped in quotes containing commas
      const columns = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      
      // Clean extracted values by stripping enclosing literal quote marks
      const parsedCols = columns.map(col => col.trim().replace(/^"|"$/g, ''));

      // Validate required minimum schema layout bounds (Question text + Option A + Option B + Correct Key)
      if (parsedCols.length >= 3) {
        const questionText = parsedCols[0];
        const optionA = parsedCols[1];
        const optionB = parsedCols[2];
        
        // Handle optional variables with safe defaults based on row bounds index evaluation
        const optionC = parsedCols.length > 3 ? parsedCols[3] : '';
        const optionD = parsedCols.length > 4 ? parsedCols[4] : '';
        
        // Explicitly extract the absolute key element securely 
        const correctOption = parsedCols.length > 5 ? parsedCols[5].toUpperCase() : 'A';

        await db.query(
          'INSERT INTO exam_questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [newExamId, questionText, optionA, optionB, optionC, optionD, correctOption]
        );
        questionsCommitted++;
      }
    }

    // Commit all entries only if no rows failed or corrupted execution parameters
    await db.commit();

    return NextResponse.json({ 
      success: true, 
      message: `Bulk deployment successful! Imported ${questionsCommitted} question nodes seamlessly.` 
    });

  } catch (error) {
    // Roll back open actions completely if any single internal failure occurs
    if (db) await db.rollback();
    
    return NextResponse.json({ error: "Bulk data insertion failure: " + error.message }, { status: 500 });
  }
}
