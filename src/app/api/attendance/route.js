import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade') || '12 Natural';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const db = await connectToDatabase();

    // Safe, multi-column matching query that works regardless of database underscore casing
    const [records] = await db.query(
      `SELECT 
        s.studentId,
        s.name, 
        s.grade, 
        IFNULL(a.status, 'Not Marked') as status 
       FROM students s 
       LEFT JOIN student_attendance a ON s.studentId = a.student_id AND a.attendance_date = ?
       WHERE s.grade = ? 
       ORDER BY s.name ASC`,
      [date, grade]
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

    // Check if an attendance mark already exists for this specific calendar day
    const [existing] = await db.query(
      'SELECT att_id FROM student_attendance WHERE student_id = ? AND attendance_date = ?',
      [studentId, date]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE student_attendance SET status = ? WHERE student_id = ? AND attendance_date = ?',
        [status, studentId, date]
      );
    } else {
      await db.query(
        'INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (?, ?, ?)',
        [studentId, date, status]
      );
    }

    return NextResponse.json({ success: true, message: "Attendance status saved successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Database transaction write error: " + error.message }, { status: 500 });
  }
}
