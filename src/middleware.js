import { NextResponse } from 'next/server';

const publicRoutes = ['/login', '/api/auth'];
const teacherRestrictedRoutes = ['/api/roster/update-mark', '/api/students'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/static') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;
  const userRole = req.cookies.get('userRole')?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (userRole === 'Student' && teacherRestrictedRoutes.some(route => pathname.startsWith(route))) {
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
