import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade');
    const db = await connectToDatabase();
    
    let query = 'SELECT * FROM students';
    let params = [];
    if (grade) {
      query += ' WHERE grade = ?';
      params.push(grade);
    }
    
    const [rows] = await db.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { studentId, name, grade, subject } = await req.json();
    if (!studentId || !name || !grade || !subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const db = await connectToDatabase();
    
    await db.query(
      'INSERT INTO students (studentId, name, grade, subject) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name), grade = VALUES(grade)',
      [studentId, name, grade, subject]
    );
    return NextResponse.json({ success: true, message: "Barataan milkiin galmaa'era!" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
