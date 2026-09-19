import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET_TOKEN = process.env.JWT_SECRET || 'sb_portal_cryptographic_fallback_secret_key_matrix_2.1';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Security execution parameters incomplete. Missing credentials payload.' },
        { status: 400 }
      );
    }

    // Dynamic relational lookup targeting system tokens matching user handles
    const systemUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ]
      }
    });

    if (!systemUser) {
      return NextResponse.json(
        { error: 'Authentication execution rejected. Terminal access denied.' },
        { status: 401 }
      );
    }

    // Secure cryptographic password cross-verification handshake
    const isKeyMatch = await bcrypt.compare(password, systemUser.password);
    if (!isKeyMatch) {
      return NextResponse.json(
        { error: 'Invalid authentication credentials context signature.' },
        { status: 401 }
      );
    }

    // Compile secure cryptographic state payload fields
    const sessionTokenPayload = {
      userId: systemUser.id,
      username: systemUser.username,
      role: systemUser.role,
      runlevel: 'authenticated_portal_node'
    };

    // Encrypt structural context tokens cleanly using JWT parameters
    const encodedToken = jwt.sign(sessionTokenPayload, JWT_SECRET_TOKEN, { expiresIn: '12h' });

    // Initialize next-generation proxy response object configuration matrices
    const responseStream = NextResponse.json({
      success: true,
      message: 'Cryptographic data connection established safely.',
      user: {
        id: systemUser.id,
        username: systemUser.username,
        email: systemUser.email,
        role: systemUser.role
      }
    });

    // Commit secure server-side HTTP-Only cookie parameter arrays to network headers
    responseStream.cookies.set({
      name: 'sb_portal_token',
      value: encodedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 12, // Synchronized 12-hour session timeout lifecycle
      path: '/'
    });

    return responseStream;

  } catch (error) {
    console.error('Fatal authorization handshake breakdown:', error);
    return NextResponse.json(
      { error: 'Internal system architecture error during connection parsing routine.' },
      { status: 500 }
    );
  }
}
