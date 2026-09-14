import { NextResponse } from 'next/server';

// Static system user database for terminal credentials verification
const PRE_PROVISIONED_USERS = [
  {
    email: 'admin@school.edu',
    password: 'password123',
    username: 'Sheek Bakri Admin',
    role: 'Admin'
  },
  {
    email: 'ict-dept@school.edu',
    password: 'password123',
    username: 'ICT Principal Faculty',
    role: 'Teacher'
  },
  {
    email: 'student@school.edu',
    password: 'password123',
    username: 'Chala Alemu',
    role: 'Student'
  }
];

// 1. POST: Process authentication keys and issue authorization tokens
export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate that required input items are present
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing security credentials payload.' },
        { status: 400 }
      );
    }

    // Search for a matching credential signature inside the repository
    const matchedUser = PRE_PROVISIONED_USERS.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    // Error response check 1: Invalid email check
    if (!matchedUser) {
      return NextResponse.json(
        { error: 'Authorization key or node signature not found.' },
        { status: 401 }
      );
    }

    // Error response check 2: Password mismatch protection check
    if (matchedUser.password !== password) {
      return NextResponse.json(
        { error: 'Cryptographic authentication challenge failed.' },
        { status: 401 }
      );
    }

    // Generate simulated web session token matching the dashboard layout expectations
    const simulatedToken = `sb_portal_token_${btoa(matchedUser.email)}_${Date.now()}`;

    // Return the successful login package
    return NextResponse.json(
      {
        success: true,
        message: 'Secure system session connection established.',
        token: simulatedToken,
        role: matchedUser.role,
        username: matchedUser.username
      },
      { status: 200 }
    );

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal gatekeeper terminal routing exception.', details: error.message },
      { status: 500 }
    );
  }
}

// 2. GET: Expose active faculty listings to populate the dashboard metrics view tab
export async function GET() {
  try {
    // Strip sensitive passwords before broadcasting user profile records logs
    const sanitizedUsers = PRE_PROVISIONED_USERS.map(({ email, username, role }) => ({
      email,
      username,
      role
    }));

    return NextResponse.json(
      { success: true, users: sanitizedUsers },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to extract portal user register data metrics.' },
      { status: 500 }
    );
  }
}
