import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db';

/**
 * 1. GET METHOD: Fetches textbook resources from the database catalog.
 * Aligns perfectly with your live frontend tab tracking states.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade');
    const db = await connectToDatabase();
    
    let query = 'SELECT book_id, title, author, grade_section, download_url FROM library_books';
    let params = [];
    
    if (grade) {
      query += ' WHERE grade_section = ?';
      params.push(grade);
    }
    
    const [rows] = await db.query(query + ' ORDER BY title ASC', params);
    
    // Returns clean data blocks to populate your school textbook list cards
    return NextResponse.json({ success: true, books: rows });
  } catch (error) {
    console.error("Library Catalog GET Pipeline Failure:", error);
    return NextResponse.json(
      { error: "Library database catalog retrieval failed: " + error.message }, 
      { status: 500 }
    );
  }
}

/**
 * 2. POST METHOD: Processes the "Catalog School Textbook" form submissions.
 * Securely writes new textbook resource metadata row nodes.
 */
export async function POST(req) {
  try {
    const { title, author, gradeSection, downloadUrl } = await req.json();
    
    if (!title || !author || !gradeSection || !downloadUrl) {
      return NextResponse.json(
        { error: "Missing required textbook catalog fields." }, 
        { status: 400 }
      );
    }
    
    const db = await connectToDatabase();
    
    // Commit row entries cleanly with explicit matching layout params
    await db.query(
      'INSERT INTO library_books (title, author, grade_section, download_url) VALUES (?, ?, ?, ?)',
      [title, author, gradeSection, downloadUrl]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Textbook catalog media asset committed successfully!" 
    });
  } catch (error) {
    console.error("Library Catalog POST Pipeline Failure:", error);
    return NextResponse.json(
      { error: "Library database transactional write error: " + error.message }, 
      { status: 500 }
    );
  }
}
