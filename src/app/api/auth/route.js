import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'FALLBACK_SECRET_KEY';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const db = await connectToDatabase();
    
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return NextResponse.json({ error: "Maqaan seensaa ykn Jechi icciitii sirrii miti!" }, { status: 401 });
    }
    
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password).catch(() => user.password === password);
    
    if (!passwordMatch && user.password !== password) {
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
