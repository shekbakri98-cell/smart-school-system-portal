import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

// FETCH ATTENDANCE BY GRADE & DATE
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!grade) {
      return NextResponse.json({ error: "Grade parameter is required." }, { status: 400 });
    }

    const db = await connectToDatabase();

    // Query combines students list with their attendance status token if it exists for that date
    const query = `
      SELECT s.studentId, s.name, s.grade, COALESCE(a.status, 'Not Marked') as status
      FROM students s
      LEFT JOIN student_attendance a ON s.studentId = a.studentId AND a.date = ?
      WHERE s.grade = ?
      ORDER BY s.name ASC
    `;
    const [rows] = await db.query(query, [date, grade]);

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ error: "Attendance fetch failure: " + error.message }, { status: 500 });
  }
}

// COMMIT OR UPDATE ATTENDANCE STATE
export async function POST(req) {
  try {
    const { studentId, date, status } = await req.json();

    if (!studentId || !date || !status) {
      return NextResponse.json({ error: "Missing required tracking parameters." }, { status: 400 });
    }

    const db = await connectToDatabase();

    // Safely insert or overwrite attendance status on duplicate key match entries
    const query = `
      INSERT INTO student_attendance (studentId, date, status) 
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE status = VALUES(status)
    `;
    await db.query(query, [studentId, date, status]);

    return NextResponse.json({ success: true, message: "Attendance record synchronized successfully." });
  } catch (error) {
    return NextResponse.json({ error: "Database writing failure: " + error.message }, { status: 500 });
  }
}
