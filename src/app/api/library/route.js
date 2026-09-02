import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

/**
 * 1. GET METHOD: Fetches textbook resources from the database catalog.
 * Supports dynamic filtering by grade section to isolate study content.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade');
    const db = await connectToDatabase();
    
    let query = 'SELECT * FROM library_books';
    let params = [];
    
    if (grade) {
      query += ' WHERE grade_section = ?';
      params.push(grade);
    }
    
    // Returns book entries sorted alphabetically by title
    const [rows] = await db.query(query + ' ORDER BY title ASC', params);
    return NextResponse.json({ success: true, books: rows });
  } catch (error) {
    return NextResponse.json(
      { error: "Library database catalog retrieval failed: " + error.message }, 
      { status: 500 }
    );
  }
}

/**
 * 2. POST METHOD: Processes the "Catalog School Textbook" form submissions.
 * Confirms integrity constraints and appends download file credentials securely.
 */
export async function POST(req) {
  try {
    const { title, author, gradeSection, downloadUrl } = await req.json();
    
    // Global parameters validation check
    if (!title || !author || !gradeSection || !downloadUrl) {
      return NextResponse.json(
        { error: "Missing required textbook catalog fields." }, 
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Commit textbook resource metadata cleanly inside the MySQL schema table
    await db.query(
      'INSERT INTO library_books (title, author, grade_section, download_url) VALUES (?, ?, ?, ?)',
      [title, author, gradeSection, downloadUrl]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Textbook catalog media asset committed successfully!" 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Library database transactional write error: " + error.message }, 
      { status: 500 }
    );
  }
}
