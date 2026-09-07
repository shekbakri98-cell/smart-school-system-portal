import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade') || '12 Natural';
    let rawDate = searchParams.get('date');

    // SMART DATE CONVERTER: Always forces date strings to match database YYYY-MM-DD
    let formattedDate = new Date().toISOString().split('T')[0];
    if (rawDate) {
      try {
        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
          formattedDate = parsedDate.toISOString().split('T')[0];
        }
      } catch (dateErr) {
        console.warn("Date normalization fallback triggered:", dateErr);
      }
    }

    const db = await connectToDatabase();

    // Secure database query utilizing our clean normalized date parameter string
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
      [formattedDate, grade]
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

    // Aligns dates safely during saving actions too
    let formattedDate = new Date(date).toISOString().split('T')[0];

    const db = await connectToDatabase();

    const [existing] = await db.query(
      'SELECT att_id FROM student_attendance WHERE student_id = ? AND attendance_date = ?',
      [studentId, formattedDate]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE student_attendance SET status = ? WHERE student_id = ? AND attendance_date = ?',
        [status, studentId, formattedDate]
      );
    } else {
      await db.query(
        'INSERT INTO student_attendance (student_id, attendance_date, status) VALUES (?, ?, ?)',
        [studentId, formattedDate, status]
      );
    }

    return NextResponse.json({ success: true, message: "Attendance status saved successfully!" });
  } catch (error) {
    return NextResponse.json({ error: "Database transaction write error: " + error.message }, { status: 500 });
  }
}
