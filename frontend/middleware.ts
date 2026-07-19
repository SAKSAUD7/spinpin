import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const host = request.headers.get('host') || '';
    const url = request.nextUrl.clone();
    
    // Skip redirecting static assets, images, dynamic next routes, or API calls
    const pathname = url.pathname;
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }
    // --- Admin Authentication Check ---
    // If accessing any /admin route (except login), check for admin_token
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
        const adminToken = request.cookies.get('admin_token')?.value;
        if (!adminToken) {
            const loginUrl = new URL('/admin/login', request.url);
            return NextResponse.redirect(loginUrl, 302); // 302 Temporary Redirect
        }
    }
    
    // Create a new response and modify REQUEST headers so server components can read it
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-current-path', pathname);
    
    // We must pass the modified headers into the Next request object
    let response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
    
    // Retrieve target site URL from environment variable
    const targetSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.spinpin.uk';
    const targetHost = targetSiteUrl.replace(/^https?:\/\//, '').split('/')[0];
    
    const lowercaseHost = host.toLowerCase();

    // Case 1: The user is accessing the site via the default Azure domain
    // (e.g., spinpin-frontend-d7ftbvf8h8cxe9g5.centralus-01.azurewebsites.net)
    if (lowercaseHost.includes('.azurewebsites.net')) {
        const redirectUrl = new URL(pathname + url.search, targetSiteUrl);
        response = NextResponse.redirect(redirectUrl, 301);
    }
    
    // Case 2: The user is accessing the site via the apex/root domain (non-www)
    // (e.g., spinpin.uk or spinpin.co.uk)
    // We redirect to the www subdomain for consistent canonical indexing.
    const isApexDomain = !lowercaseHost.startsWith('www.') && 
                         (lowercaseHost.includes('spinpin.uk') || 
                          lowercaseHost.includes('spinpin.co.uk') ||
                          lowercaseHost === targetHost.replace(/^www\./i, ''));
                          
    if (isApexDomain) {
        // Enforce www prefix
        const protocol = targetSiteUrl.startsWith('https') ? 'https' : 'http';
        const redirectUrl = new URL(`${protocol}://www.${lowercaseHost}${pathname}${url.search}`);
        return NextResponse.redirect(redirectUrl, 301);
    }
    
    // Case 3: If NEXT_PUBLIC_SITE_URL is explicitly set and host doesn't match it (excluding localhost/127.0.0.1)
    const isLocalhost = lowercaseHost.startsWith('localhost') || lowercaseHost.startsWith('127.0.0.1');
    if (!isLocalhost && targetHost && lowercaseHost !== targetHost.toLowerCase()) {
        const redirectUrl = new URL(pathname + url.search, targetSiteUrl);
        return NextResponse.redirect(redirectUrl, 301);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
