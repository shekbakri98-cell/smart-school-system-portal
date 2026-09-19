import { NextResponse } from 'next/server';

// Explicitly provision open network paths that do not require valid crypto headers 
const publicRoutes = ['/login', '/api/auth'];

// Protect mutating API write nodes from unauthorized student execution vectors
const teacherRestrictedRoutes = ['/api/students', '/api/attendance', '/api/exams', '/api/finance'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // 1. Immediately drop static next compilation dependencies to maximize connection speeds
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 2. Grant free entry pass if request context maps directly to public login routes
  if (publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))) {
    return NextResponse.next();
  }

  // 3. Extract active verification tokens directly out of standard network header cookies array streams
  const token = req.cookies.get('token')?.value;
  const userRole = req.cookies.get('userRole')?.value;

  // 4. Force immediate terminal session lock out if user drops connection signatures completely
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Intercept logged in node traffic requesting sign-in pages to loop them forward onto safe dashboards
  if (pathname === '/login' || pathname === '/') {
    const dashboardUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 6. Enforce strict role validation constraints over administrative operational runlevels
  if (userRole === 'Student' && teacherRestrictedRoutes.some(route => pathname.startsWith(route))) {
    return new NextResponse(
      JSON.stringify({ error: "Dhowwameera! Aangoo gahaa hin qabdu hojii kanaaf." }),
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return NextResponse.next();
}

// Intercept matching framework route contexts selectively across run levels
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
