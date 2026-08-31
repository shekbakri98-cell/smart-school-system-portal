import { NextResponse } from 'next/server'; // Fixed typo here
import { connectToDatabase } from '../../../../lib/db'; 

export async function PATCH(req) {
  try {
    const { studentId, subject, fieldName, score } = await req.json();

    const validFields = ['test1', 'test2', 'assignment', 'finalExam'];
    if (!validFields.includes(fieldName)) {
      return NextResponse.json({ error: "Invalid grade field modification request." }, { status: 400 });
    }

    const numericScore = Number(score);
    if (isNaN(numericScore) || numericScore < 0) {
      return NextResponse.json({ error: "Score must be a valid positive integer." }, { status: 400 });
    }

    const db = await connectToDatabase();

    const query = `UPDATE students SET ${fieldName} = ? WHERE studentId = ? AND subject = ?`;
    const [result] = await db.query(query, [numericScore, studentId, subject]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Target student record or subject context missing." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Qabxiin barataa milkiin jijjiurameera!" });
  } catch (error) {
    return NextResponse.json({ error: "Grade sync engine failure: " + error.message }, { status: 500 });
  }
}
