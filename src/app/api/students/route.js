import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db'; 

// 1. GET ROUTE: Queries the MySQL server and maps columns cleanly for the frontend UI
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade');
    const db = await connectToDatabase();
    
    // Maps database column fields to match your frontend roster expectations exactly
    let query = 'SELECT barataa_id AS studentId, maqaa AS name, kutaa AS grade FROM students';
    let params = [];
    
    if (grade) {
      query += ' WHERE LOWER(kutaa) = LOWER(?)';
      params.push(grade);
    }
    
    query += ' ORDER BY maqaa ASC';
    
    const [rows] = await db.query(query, params);
    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    console.error("MySQL GET query crashed:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// 2. POST ROUTE: Captures incoming frontend keys and normalizes them for the 14-field database record
export async function POST(req) {
  try {
    const body = await request.json();
    
    // Normalization Layer: Accepts both frontend layout names AND native DB column names
    const barataa_id = body.studentId || body.barataa_id;
    const maqaa = body.name || body.maqaa;
    const kutaa = body.grade || body.kutaa;

    // Strict validation safety checks using the normalized identifiers
    if (!barataa_id || !maqaa || !kutaa) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required enrollment keys (studentId/barataa_id, name/maqaa, or grade/kutaa)" 
      }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    const queryText = `
      INSERT INTO students (
        barataa_id, maqaa, maqaa_abbaa, maqaa_akaaka, saala, umrii, bilbila_wabii,
        kutaa, sadarkaa_kutaa, bara_galmee, aradaa, ganda, bilbila_barataa, fan_fayda_aliansn
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        maqaa = VALUES(maqaa), 
        kutaa = VALUES(kutaa),
        sadarkaa_kutaa = VALUES(sadarkaa_kutaa),
        bilbila_barataa = VALUES(bilbila_barataa);
    `;

    await db.query(queryText, [
      barataa_id, 
      maqaa, 
      body.maqaa_abbaa || null, 
      body.maqaa_akaaka || null, 
      body.saala || 'Dhiira', 
      body.umrii ? parseInt(body.umrii) : null, 
      body.bilbila_wabii || null, 
      kutaa, 
      body.sadarkaa_kutaa || null, 
      body.bara_galmee || null, 
      body.aradaa || null, 
      body.ganda || null, 
      body.bilbila_barataa || null, 
      body.fan_fayda_aliansn || null
    ]);

    return NextResponse.json({ success: true, message: "Barataan milkiin galmaa'era!" }, { status: 201 });
  } catch (error) {
    console.error("MySQL POST transaction crashed:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
