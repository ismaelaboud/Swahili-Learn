import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that are publicly accessible
const publicPaths = [
  '/login',
  '/register',
  '/browse',
  '/',
  '/about',
  '/contact'
];

// List of paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/learning',
  '/progress',
  '/instructor',
  '/courses',
  '/settings'
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Allow access to public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check if the current path requires authentication
  const requiresAuth = protectedPaths.some(path => pathname.startsWith(path));
  
  if (requiresAuth && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
