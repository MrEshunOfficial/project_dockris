import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AuthUtils } from "@/lib/auth";

// Define your route configurations
const routeConfig = {
  public: [
    '/api/auth/login',
    '/api/auth/register',
    '/authclient/Login',
    '/authclient/Register',
    '/Info/about',
    '/Info/contact',
    '/Info/location',
    '/Info/support',
    '/favicon.ico',
  ],
  roleAccess: {
    '/admin': ['admin'],
    '/api/profile': ['admin', 'user'],
    '/Profile': ['admin', 'user'],
  }
} as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is public
  if (routeConfig.public.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  try {
    const user = await AuthUtils.getCurrentUser(request);
    
    if (!user) {
      // For API routes, return a JSON response
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      // For client-side routes, redirect to login
      return redirectToLogin(request);
    }

    // Check for role-based access
    for (const [route, roles] of Object.entries(routeConfig.roleAccess)) {
      if (pathname.startsWith(route) && !roles.includes(user.role)) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        // For client-side routes, you might want to redirect to an error page or home
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // Append user info to request headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('userId', user.id);
    requestHeaders.set('userRole', user.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Middleware error:', error);
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/authclient/Login', request.url);
  loginUrl.searchParams.set('returnUrl', request.url);
  return NextResponse.redirect(loginUrl);
}

// Matcher configuration
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*',
    '/Features/:path*', 
    '/Profile',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};