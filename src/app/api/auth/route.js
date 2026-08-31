import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db'; // Corrected relative path import style
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'FALLBACK_SECRET_KEY';

// 1. GET METHOD: Fetches all registered users for the Admin Ledger Grid
export async function GET(req) {
  try {
    const db = await connectToDatabase();
    
    // Select users while completely withholding hash passwords for safety
    const [rows] = await db.query('SELECT username, email, role FROM users ORDER BY username ASC');
    
    return NextResponse.json({ success: true, users: rows });
  } catch (error) {
    return NextResponse.json({ error: "Failed fetching user records: " + error.message }, { status: 500 });
  }
}

// 2. PUT METHOD: Processes the "Generate Profile Access" form submissions to create new accounts
export async function PUT(req) {
  try {
    const { username, email, password, role } = await req.json();

    // Field integrity verification checks
    if (!username || !email || !password || !role) {
      return NextResponse.json({ error: "All account fields are required parameters." }, { status: 400 });
    }

    const db = await connectToDatabase();

    // Encrypt the teacher's password string using standard secure bcrypt hashing parameters
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the profile metadata cleanly inside your users database table structure
    await db.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    return NextResponse.json({ success: true, message: "User account profile generated successfully!" });
  } catch (error) {
    // Handle unique parameter constraint collisions gracefully (e.g. duplicate username or email)
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: "Username or Email address has already been registered." }, { status: 400 });
    }
    return NextResponse.json({ error: "Database profile writing runtime crash: " + error.message }, { status: 500 });
  }
}

// 3. POST METHOD: Handles standard core user log-in validation checks (Your existing login routine)
export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const db = await connectToDatabase();
    
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Maqaan seensaa ykn Jechi icciitii sirrii miti!" }, { status: 401 });
    }
    
    const user = rows[0];
    
    // Compare password string against standard hash value patterns
    const passwordMatch = await bcrypt.compare(password, user.password).catch(() => user.password === password);
    
    if (!passwordMatch) {
      return NextResponse.json({ error: "Maqaan seensaa ykn Jechi icciitii sirrii miti!" }, { status: 401 });
    }
    
    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    
    const response = NextResponse.json({ 
      success: true, 
      role: user.role, 
      username: user.username 
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 43200, 
      path: '/',
    });

    response.cookies.set('userRole', user.role, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 43200,
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: "System node failure: " + error.message }, { status: 500 });
  }
}
