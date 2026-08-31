import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db'; // Corrected four-level deep relative import

export async function POST(req) {
  try {
    const { examId, studentId, answers } = await req.json(); // answers: { question_id: 'A', ... }

    if (!examId || !studentId || !answers) {
      return NextResponse.json({ error: "Missing exam submission parameters." }, { status: 400 });
    }

    const db = await connectToDatabase();

    // 1. Fetch correct answer keys for verification
    const [questions] = await db.query(
      'SELECT question_id, correct_option FROM exam_questions WHERE exam_id = ?',
      [examId]
    );

    if (questions.length === 0) {
      return NextResponse.json({ error: "Target exam questions matrix not found." }, { status: 404 });
    }

    // 2. Automatically compute scoring metrics
    let scoreObtained = 0;
    const totalQuestions = questions.length;

    questions.forEach((q) => {
      const studentAnswer = answers[q.question_id];
      if (studentAnswer && studentAnswer.toUpperCase() === q.correct_option.toUpperCase()) {
        scoreObtained++;
      }
    });

    // 3. Write results to log ledger
    await db.query(
      'INSERT INTO student_exam_submissions (exam_id, studentId, score_obtained, total_questions) VALUES (?, ?, ?, ?)',
      [examId, studentId, scoreObtained, totalQuestions]
    );

    return NextResponse.json({
      success: true,
      message: "Exam processed successfully!",
      score: scoreObtained,
      total: totalQuestions,
      percentage: ((scoreObtained / totalQuestions) * 100).toFixed(1)
    });
  } catch (error) {
    return NextResponse.json({ error: "Grading system transaction failure: " + error.message }, { status: 500 });
  }
}
