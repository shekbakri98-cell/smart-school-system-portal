import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST METHOD: Handles interactive exam answer evaluation and automated grading matrix syncs
export async function POST(req) {
  try {
    // Extract the incoming browser request payloads mapping user choice tokens
    const { studentId, examId, answers } = await req.json(); // 'answers' maps to: { "0": "A", "1": "B" }

    if (!studentId || !examId || !answers) {
      return NextResponse.json({ error: "Missing submission parameters matrix." }, { status: 400 });
    }

    // 1. Retrieve the atomic exam configuration model from AlwaysData MySQL using Prisma
    const examRecord = await prisma.exam.findUnique({
      where: { id: parseInt(examId) }
    });

    if (!examRecord) {
      return NextResponse.json({ error: "No target test blueprint records found matching this ID parameter." }, { status: 404 });
    }

    // Safely extract the structural array items directly out of your native JSON column field
    const questionNodes = Array.isArray(examRecord.questions) ? examRecord.questions : [];
    const totalQuestions = questionNodes.length;

    if (totalQuestions === 0) {
      return NextResponse.json({ error: "Target test blueprint contains zero questions entries." }, { status: 400 });
    }

    let correctCount = 0;

    // 2. Automated evaluation cross-matching loop against the cached JSON index keys
    questionNodes.forEach((q, index) => {
      // Your front-end maps answers by index strings (e.g. index 0, index 1) matching active quiz components
      const studentChoice = answers[index] || answers[String(index)];
      const correctChoice = q.correct || q.correct_option;

      if (studentChoice && correctChoice && studentChoice.toUpperCase() === correctChoice.toUpperCase()) {
        correctCount++;
      }
    });

    // 3. Compute the final percentage evaluation grade weight scalar
    const finalScore = Math.round((correctCount / totalQuestions) * 100);

    // 4. Update the individual scholar record marks parameters automatically via type-safe Prisma updates
    await prisma.student.update({
      where: { studentId: studentId },
      data: {
        finalExam: parseFloat(finalScore)
        // Note: totalScore is calculated on-the-fly dynamically inside your interactive front-end page dashboard loops 
        // using the expression: (student.test1 + student.test2 + student.assignment + student.finalExam)
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Scholar responses evaluated and committed cleanly to ledger matrices!", 
      score: finalScore, 
      correct: correctCount, 
      total: totalQuestions 
    });

  } catch (error) {
    console.error("Grading engine processing failure context map:", error);
    return NextResponse.json({ error: "Grading system failure: " + error.message }, { status: 500 });
  }
}
