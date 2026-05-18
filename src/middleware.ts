import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── external-share security ───────────────────────────────────────────────
  if (pathname.startsWith('/external-share/')) {
    const albumId = pathname.split('/')[2] ?? '';

    // Reject non-UUID paths immediately — no need to hit Supabase
    if (!UUID_RE.test(albumId)) {
      return new NextResponse('Not found', { status: 404 });
    }

    const res = NextResponse.next();

    // Prevent framing (clickjacking)
    res.headers.set('X-Frame-Options', 'DENY');

    // Strict CSP — only our own assets + Supabase API, no inline scripts beyond Next.js
    res.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? '*'}`,
        "frame-ancestors 'none'",
        "form-action 'none'",   // no form submissions possible
        "base-uri 'self'",
      ].join('; ')
    );

    // No indexing of share pages
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');

    // Prevent MIME sniffing
    res.headers.set('X-Content-Type-Options', 'nosniff');

    // No referrer leak when leaving the page
    res.headers.set('Referrer-Policy', 'no-referrer');

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/external-share/:path*'],
};
