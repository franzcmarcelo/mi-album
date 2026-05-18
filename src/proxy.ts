import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── external-share security ───────────────────────────────────────────────
  if (pathname.startsWith('/external-share/')) {
    const albumId = pathname.split('/')[2] ?? '';

    if (!UUID_RE.test(albumId)) {
      return new NextResponse('Not found', { status: 404 });
    }

    const res = NextResponse.next({ request });

    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data:",
        `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? '*'}`,
        "frame-ancestors 'none'",
        "form-action 'none'",
        "base-uri 'self'",
      ].join('; ')
    );
    res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'no-referrer');

    return res;
  }

  // ── Supabase auth cookie refresh (all other routes) ───────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ── Protected routes: redirect to /login if unauthenticated ──────────────
  const isProtected =
    pathname === '/' ||
    pathname.startsWith('/album/') ||
    pathname.startsWith('/share/');

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Redirect /login to / if already authenticated ─────────────────────────
  if (pathname.startsWith('/login') && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
