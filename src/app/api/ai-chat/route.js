import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { message, userRole } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message content cannot be blank." }, { status: 400 });
    }

    const lowerMessage = message.toLowerCase();
    let reply = "I am processing your request. As an AI School Assistant, I can help you navigate grading sheets, log attendance metrics, publish online examinations, check tuition balances, and catalog library books.";

    if (lowerMessage.includes('exam') || lowerMessage.includes('test')) {
      reply = "To manage online examinations, navigate to the 'Online Exams' tab. Administrators can construct dynamic question matrices, while student panels automatically evaluate scores and percentages upon test submission.";
    } else if (lowerMessage.includes('attendance') || lowerMessage.includes('guyyaa') || lowerMessage.includes('hordoffii')) {
      reply = "The 'Daily Attendance Ledger' tab allows real-time session tracking. You can switch student rows dynamically between Present (Argameera), Absent (Hafee), or Late (Sifameera) to synchronize directly with the cloud database.";
    } else if (lowerMessage.includes('password') || lowerMessage.includes('login') || lowerMessage.includes('account')) {
      reply = "Credentials are encrypted using secure cryptographic hashing (bcrypt). Administrators can manage access privileges or create new instructor profiles via the 'Account Console' layout panel.";
    } else if (lowerMessage.includes('finance') || lowerMessage.includes('tuition') || lowerMessage.includes('fee') || lowerMessage.includes('qarshii')) {
      reply = "The 'Finance Dues' ledger tracks financial health. Administrators can log registration dues and assign values for amounts paid. The database automatically computes whether a status is 'Paid', 'Partial', or 'Pending'.";
    } else if (lowerMessage.includes('library') || lowerMessage.includes('book') || lowerMessage.includes('kitaba') || lowerMessage.includes('catalog')) {
      reply = "The 'Catalog Library' tab distributes digital resources. Instructors can log textbooks by grade and supply downloadable file links, which load on student views for convenient offline reference access.";
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    return NextResponse.json({ error: "AI Engine terminal error: " + error.message }, { status: 500 });
  }
}
