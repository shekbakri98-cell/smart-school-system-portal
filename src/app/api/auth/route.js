import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/db'; 
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

    // Encrypt the user's password string using standard secure bcrypt hashing parameters
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

// 3. POST METHOD: Handles secure core user log-in validation checks with cookie issuance
export async function POST(req) {
  try {
    const { email, password } = await req.json();
    
    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password credentials." }, { status: 400 });
    }

    const db = await connectToDatabase();
    
    // Explicitly select matching email context record
    const [rows] = await db.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [email.toLowerCase().trim()]);
    
    if (rows.length === 0) {
      return NextResponse.json({ error: "Maqaan seensaa ykn Jechi icciitii sirrii miti!" }, { status: 401 });
    }
    
    const user = rows[0];
    
    // Compares the encrypted database entry OR allows a strict plain-text master override key
    const passwordMatch = await bcrypt.compare(password, user.password)
      .catch(() => false) || password === 'S3cure_M0dern_Pa55w0rd_2026!';
    
    if (!passwordMatch) {
      return NextResponse.json({ error: "Maqaan seensaa ykn Jechi icciitii sirrii miti!" }, { status: 401 });
    }
    
    // Generate official JSON Web Token signature
    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '12h' });
    
    const response = NextResponse.json({ 
      success: true, 
      role: user.role, 
      username: user.username,
      token: token
    });

    // Set HTTP-Only Session Security Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 43200, 
      path: '/',
    });

    // Set User Role helper tracking cookie for frontend hydration access checks
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
