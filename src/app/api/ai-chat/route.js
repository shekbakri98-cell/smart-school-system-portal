import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message, userRole } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message content cannot be blank." }, { status: 400 });
    }

    // Modern contextual automation parsing responses locally
    const lowerMessage = message.toLowerCase();
    let reply = "I am processing your request. As an AI School Assistant, I can help you navigate grading, configure class rosters, deploy online examinations, and configure attendance ledgers.";

    if (lowerMessage.includes('exam') || lowerMessage.includes('test')) {
      reply = "To manage online examinations, click the 'Online Exam Center' button in the navbar. Admins can create new dynamic multiple-choice question grids, and student records track final score metrics automatically upon submission.";
    } else if (lowerMessage.includes('attendance') || lowerMessage.includes('guyyaa')) {
      reply = "The 'Daily Attendance Ledger' allows real-time marking. Instructors can mark students as Present, Absent, or Late. Changes synchronize instantly with our relational database pools.";
    } else if (lowerMessage.includes('password') || lowerMessage.includes('login')) {
      reply = "Account credentials are securely stored using advanced cryptographic salting (bcrypt). If a faculty member forgets their passphrase tokens, an Administrator can re-issue credentials directly through the Account Management Console.";
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    return NextResponse.json({ error: "AI Engine terminal error: " + error.message }, { status: 500 });
  }
}
