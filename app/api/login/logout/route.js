import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: "Session terminated successfully. Secure connection broken."
    }, { status: 200 });

    // Wipe out the HTTP-Only cookie parameter entirely
    response.cookies.set('portal_session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(0), // Sets expiration to the distant past (1970)
      path: '/'
    });

    return response;
  } catch (error) {
    console.error("Logout execution failed:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
