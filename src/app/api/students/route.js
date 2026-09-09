import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db'; // Maintained your library helper import

// 1. GET ROUTE: Queries the Alwaysdata MySQL server using your column mappings
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const grade = searchParams.get('grade');
    const db = await connectToDatabase();
    
    // Maps database column fields to match your frontend roster expectations
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 2. POST ROUTE: Captures the 14-field data payload stream and saves it securely
export async function POST(req) {
  try {
    const body = await req.json();
    const { barataa_id, maqaa, kutaa } = body;

    // Strict safety checks for your mandatory primary identification descriptors
    if (!barataa_id || !maqaa || !kutaa) {
      return NextResponse.json({ error: "Missing required core keys (barataa_id, maqaa, or kutaa)" }, { status: 400 });
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
      body.barataa_id, 
      body.maqaa, 
      body.maqaa_abbaa || null, 
      body.maqaa_akaaka || null, 
      body.saala || 'Dhiira', 
      body.umrii ? parseInt(body.umrii) : null, 
      body.bilbila_wabii || null, 
      body.kutaa, 
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
