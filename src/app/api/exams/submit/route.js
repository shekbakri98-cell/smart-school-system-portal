import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';

export async function POST(req) {
  try {
    const { studentId, examId, answers } = await req.json(); // 'answers' is an object like { questionId: 'A', ... }

    if (!studentId || !examId || !answers) {
      return NextResponse.json({ error: "Missing submission parameters." }, { status: 400 });
    }

    const db = await connectToDatabase();

    // 1. Fetch the correct answers from the database
    const [questions] = await db.query('SELECT q_id, correct_option FROM exam_questions WHERE exam_id = ?', [examId]);
    
    let correctCount = 0;
    const totalQuestions = questions.length;

    if (totalQuestions === 0) {
      return NextResponse.json({ error: "No questions found for this exam." }, { status: 400 });
    }

    // 2. Grade the student's choices
    questions.forEach((q) => {
      if (answers[q.q_id] && answers[q.q_id].toUpperCase() === q.correct_option.toUpperCase()) {
        correctCount++;
      }
    });

    const finalScore = Math.round((correctCount / totalQuestions) * 100);

    // 3. Automatically push the computed score to the student's finalExam grade column
    const [examInfo] = await db.query('SELECT subject FROM school_exams WHERE exam_id = ?', [examId]);
    const subject = examInfo.length > 0 ? examInfo[0].subject : 'ICT';

    await db.query(
      'UPDATE students SET finalExam = ?, totalScore = (test1 + test2 + assignment + ?) WHERE studentId = ? AND subject = ?',
      [finalScore, finalScore, studentId, subject]
    );

    return NextResponse.json({ 
      success: true, 
      message: "Exam submitted and graded successfully!", 
      score: finalScore, 
      correct: correctCount, 
      total: totalQuestions 
    });
  } catch (error) {
    return NextResponse.json({ error: "Grading system failure: " + error.message }, { status: 500 });
  }
}
