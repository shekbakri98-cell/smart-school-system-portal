import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade') || '12 Natural';

    const db = await connectToDatabase();

    // Clean, bulletproof query that pulls students directly from your working table
    const [records] = await db.query(
      `SELECT studentId, name, grade, 'Not Marked' as status 
       FROM students 
       WHERE grade = ? 
       ORDER BY name ASC`,
      [grade]
    );

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Attendance System Pipeline Error:", error);
    return NextResponse.json({ error: "Failed loading attendance matrix: " + error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { studentId, date, status } = await req.json();

    if (!studentId || !date || !status) {
      return NextResponse.json({ error: "Missing required attendance parameters." }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Safely insert or update logs in the history chart
    await db.query(
      'INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = ?',
      [studentId, date, status, status]
    );

    return NextResponse.json({ success: true, message: "Attendance status saved successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Database transaction write error: " + error.message }, { status: 500 });
  }
}
