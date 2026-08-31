iimport { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db'; // Fixed path import

export async function PATCH(req) {
  try {
    const { studentId, subject, fieldName, score } = await req.json();
    
    const allowedFields = ['test1', 'test2', 'assignment', 'finalExam'];
    if (!allowedFields.includes(fieldName)) {
      return NextResponse.json({ error: "Invalid field modification update" }, { status: 400 });
    }
    
    const db = await connectToDatabase();
    const query = `UPDATE students SET ${fieldName} = ? WHERE studentId = ? AND subject = ?`;
    await db.query(query, [score, studentId, subject]);
    
    return NextResponse.json({ success: true, message: "Qabxiin barataa milkiin haaromfameera!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
