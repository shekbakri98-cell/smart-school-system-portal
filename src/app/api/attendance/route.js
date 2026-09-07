import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

// 1. GET METHOD: Fetches students and their attendance status for a specific date and grade
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade') || '12 Natural';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const db = await connectToDatabase();

    // Pull students in this grade, joining any existing attendance record for this specific day
    const [records] = await db.query(
      `SELECT s.studentId, s.name, s.grade, a.status 
       FROM students s 
       LEFT JOIN student_attendance a ON s.studentId = a.student_id AND a.attendance_date = ?
       WHERE s.grade = ? 
       ORDER BY s.name ASC`,
      [date, grade]
    );

    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Attendance GET Error:", error);
    return NextResponse.json({ error: "Failed loading attendance records: " + error.message }, { status: 500 });
  }
}
// 2. POST METHOD: Creates or updates an attendance log status entry row node
export async function POST(req) {
  try {
    const { studentId, date, status } = await req.json();

    if (!studentId || !date || !status) {
      return NextResponse.json({ error: "Missing studentId, date, or status fields." }, { status: 400 });
    }

    const db = await connectToDatabase();

    // Check if an attendance mark already exists for this student on this day
    const [existing] = await db.query(
      'SELECT att_id FROM student_attendance WHERE student_id = ? AND attendance_date = ?',
      [studentId, date]
    );

    if (existing.length > 0) {
      // Record exists -> Change the status
      await db.query(
        'UPDATE student_attendance SET status = ? WHERE student_id = ? AND attendance_date = ?',
        [status, studentId, date]
      );
    } else {
      // No record yet -> Insert a brand new row entry parameter
      await db.query(
        'INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (?, ?, ?)',
        [studentId, date, status]
      );
    }

    return NextResponse.json({ success: true, message: "Attendance log synchronized successfully!" });
  } catch (error) {
    console.error("Attendance POST Error:", error);
    return NextResponse.json({ error: "Attendance database transaction write failure: " + error.message }, { status: 500 });
  }
}
