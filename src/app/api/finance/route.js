import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const ledger = await prisma.financeLedger.findMany({});
    return NextResponse.json({ success: true, ledger });
  } catch (error) {
    return NextResponse.json({ error: "Ledger reading breakdown: " + error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { studentId, feeType, amountDue, amountPaid } = await req.json();

    const due = parseFloat(amountDue);
    const paid = parseFloat(amountPaid || 0);
    const status = paid >= due ? "Paid" : paid > 0 ? "Partial" : "Unpaid";

    const entry = await prisma.financeLedger.create({
      data: {
        studentId: studentId.trim(),
        fee_type: feeType,
        amount_due: due,
        amount_paid: paid,
        payment_status: status
      }
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    return NextResponse.json({ error: "Financial transaction mapping dropped: " + error.message }, { status: 500 });
  }
}
