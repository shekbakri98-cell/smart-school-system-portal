import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';
import { generatePaymentReceipt } from '../../../lib/notifications'; // Imported template engine hook

/**
 * 1. GET METHOD: Fetches all transaction invoices from the ledger table
 * Joins the 'students' table to resolve names dynamically for the layout grid.
 */
export async function GET(req) {
  try {
    const db = await connectToDatabase();
    const query = `
      SELECT t.fee_id, t.studentId, s.name, t.fee_type, t.amount_due, t.amount_paid, t.payment_status 
      FROM tuition_ledger t
      JOIN students s ON t.studentId = s.studentId
      ORDER BY t.updated_at DESC
    `;
    const [rows] = await db.query(query);
    return NextResponse.json({ success: true, ledger: rows });
  } catch (error) {
    return NextResponse.json({ error: "Finance ledger fetch failed: " + error.message }, { status: 500 });
  }
}

/**
 * 2. POST METHOD: Processes the "Log Payment Allocation" frontend form submissions
 * Computes payment status bounds, saves records to MySQL, and generates automated alert payloads.
 */
export async function POST(req) {
  try {
    const { studentId, feeType, amountDue, amountPaid } = await req.json();
    
    // Field integrity verification checks
    if (!studentId || !feeType || !amountDue) {
      return NextResponse.json({ error: "Missing required financial record parameters." }, { status: 400 });
    }
    
    const db = await connectToDatabase();
    const paidVal = Number(amountPaid || 0);
    const dueVal = Number(amountDue);
    
    // Determine payment matrix status parameters dynamically
    const status = paidVal >= dueVal ? 'Paid' : paidVal > 0 ? 'Partial' : 'Pending';
    
    // Step A: Commit the tracking metrics safely inside alwaysdata MySQL table instances
    await db.query(
      'INSERT INTO tuition_ledger (studentId, fee_type, amount_due, amount_paid, payment_status) VALUES (?, ?, ?, ?, ?)',
      [studentId, feeType, dueVal, paidVal, status]
    );

    // Step B: Instantly fetch the student's legal name for clean verification matching records
    const [studentRows] = await db.query('SELECT name FROM students WHERE studentId = ?', [studentId]);
    const studentName = studentRows.length > 0 ? studentRows[0].name : "Unknown Student";

    // Step C: Dispatch data arrays directly straight into the template layout compiler
    const { smsText, htmlEmail } = generatePaymentReceipt({
      studentName,
      studentId,
      feeType,
      amountPaid: paidVal,
      paymentStatus: status
    });

    // Step D: Trace transmission logs inside your container build stream environment console
    console.log("================= AUTOMATED SYSTEM ALERTS DISPATCHED =================");
    console.log("TARGET DEVICE SMS OUTBOX PAYLOAD:\n", smsText);
    console.log("TARGET SMTP DISPATCH EMAIL PAYLOAD:\n", htmlEmail);
    console.log("======================================================================");

    return NextResponse.json({ 
      success: true, 
      message: "Financial transaction logged! Systemic alerts packed for dispatch loops.",
      alertsGenerated: { smsText, htmlEmail }
    });
  } catch (error) {
    return NextResponse.json({ error: "Finance database writing failed: " + error.message }, { status: 500 });
  }
}
