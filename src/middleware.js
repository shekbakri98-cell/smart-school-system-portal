import { NextResponse } from 'next/server';

// ✅ FIX: Opens up both exact and trailing path scopes for the signing gateway paths
const publicRoutes = ['/login', '/api/auth', '/api/admin/seed', '/'];

const teacherRestrictedRoutes = ['/api/students', '/api/attendance', '/api/exams'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')) {
    return NextResponse.next();
  }

  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  const userRole = req.cookies.get('userRole')?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' || pathname === '/') {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Strictly block students from hitting the exam deployment configurations path endpoints
  if (userRole === 'Student' && teacherRestrictedRoutes.some(route => pathname.startsWith(route))) {
    // Exception: Allow students to transmit quiz submission responses into the sub-route mapping node
    if (pathname === '/api/exams/submit') {
      return NextResponse.next();
    }
    return new NextResponse(
      JSON.stringify({ error: "Dhowwameera! Aangoo gahaa hin qabdu hojii kanaaf." }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
