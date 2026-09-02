import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function POST(req) {
  try {
    const { message, userRole } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message content cannot be blank." }, { status: 400 });
    }

    const lowerMessage = message.toLowerCase();
    let reply = "I am processing your request. As an AI School Assistant, I can help you navigate grading sheets, log attendance metrics, publish online examinations, check tuition balances, and catalog library books.";
    const db = await connectToDatabase();

    // DYNAMIC AUTOMATED BALANCE CHECKER LOGIC BLOCK
    if (lowerMessage.includes('balance')) {
      // Regex pattern looks for standard student ID codes like STU-001 or stu0012
      const idMatch = lowerMessage.match(/stu[-_]?\d+/);
      
      if (idMatch) {
        const targetedStudentId = idMatch[0].toUpperCase();
        
        // Query the latest tuition billing logs for the matching identifier
        const [financeRows] = await db.query(
          'SELECT t.*, s.name FROM tuition_ledger t JOIN students s ON t.studentId = s.studentId WHERE t.studentId = ? ORDER BY t.updated_at DESC LIMIT 1', 
          [targetedStudentId]
        );

        if (financeRows && financeRows.length > 0) {
          const entry = financeRows[0];
          const due = Number(entry.amount_due || 0);
          const paid = Number(entry.amount_paid || 0);
          const remainingBalance = due - paid;

          reply = `[FINANCIAL METRICS REPORT] Student Row Located: ${entry.name} (${targetedStudentId}). Category tracked: ${entry.fee_type}. Total Due: ETB ${due}, Total Settled: ETB ${paid}. The remaining outstanding collection balance is exactly ETB ${remainingBalance}. Status: ${entry.payment_status}.`;
        } else {
          reply = `System Data Node Lookup complete for identifier "${targetedStudentId}". No financial ledger invoice line was found in the database. Please confirm the Student ID is active inside the registry maps.`;
        }
      } else {
        reply = "To check an automated balance parameter, please supply a valid Student ID matching the system configuration format (e.g., type 'check balance for STU-001').";
      }
      return NextResponse.json({ success: true, reply });
    }

    // STANDARD KNOWLEDGE BASE ROUTERS
    if (lowerMessage.includes('exam') || lowerMessage.includes('test')) {
      reply = "To manage online examinations, navigate to the 'Exams' tab. Administrators can construct dynamic question matrices, while student panels automatically evaluate scores and percentages upon test submission.";
    } else if (lowerMessage.includes('attendance') || lowerMessage.includes('guyyaa')) {
      reply = "The 'Daily Attendance Matrix' tab allows real-time session tracking. You can switch student rows dynamically between Present (Argameera), Absent (Hafee), or Late (Sifameera) to synchronize directly with the cloud database.";
    } else if (lowerMessage.includes('finance') || lowerMessage.includes('tuition') || lowerMessage.includes('fee')) {
      reply = "The 'Finance Dues' ledger tracks financial health. Administrators can log registration dues and assign values for amounts paid. The database automatically computes whether a status is 'Paid', 'Partial', or 'Pending'. Type 'balance [ID]' to scan individual details.";
    } else if (lowerMessage.includes('library') || lowerMessage.includes('book')) {
      reply = "The 'Library' tab distributes digital resources. Instructors can log textbooks by grade and supply downloadable file links, which load on student views for convenient offline reference access.";
    }

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    return NextResponse.json({ error: "AI Engine terminal error: " + error.message }, { status: 500 });
  }
}
