import { NextResponse, type NextRequest } from 'next/server';

type Locale = 'en' | 'id';

const LOCALE_COOKIE = 'NEXT_LOCALE';
const ONE_YEAR = 60 * 60 * 24 * 365;

function isLocale(value: string | undefined): value is Locale {
  return value === 'en' || value === 'id';
}

/**
 * Picks the language for a visitor who lands on `/` without one in the URL.
 *
 * 1. A language they already chose (remembered in a cookie) always wins.
 * 2. Otherwise, the country Vercel resolves from their IP: Indonesia gets
 *    Indonesian, everyone else gets English.
 * 3. Where there is no IP country (localhost, non-Vercel hosts), the browser's
 *    Accept-Language is used instead: an Indonesian language or an `-ID`
 *    region gets Indonesian, anything else English.
 */
function detectLocale(request: NextRequest): Locale {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;

  const country = request.headers.get('x-vercel-ip-country');
  if (country) return country.toUpperCase() === 'ID' ? 'id' : 'en';

  const acceptLanguage = request.headers.get('accept-language') ?? '';
  const prefersIndonesia = acceptLanguage
    .split(',')
    .map((part) => part.split(';')[0].trim().toLowerCase())
    .some((tag) => tag === 'id' || tag === 'in' || tag.startsWith('id-') || tag.endsWith('-id'));

  return prefersIndonesia ? 'id' : 'en';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${detectLocale(request)}/`;
    return NextResponse.redirect(url);
  }

  // Remember the language of any localized page the visitor opens, so picking
  // a language in the header sticks the next time they come in through `/`.
  const segment = pathname.split('/')[1];
  const response = NextResponse.next();
  if (isLocale(segment) && request.cookies.get(LOCALE_COOKIE)?.value !== segment) {
    response.cookies.set(LOCALE_COOKIE, segment, {
      path: '/',
      maxAge: ONE_YEAR,
      sameSite: 'lax',
    });
  }
  return response;
}

export const config = {
  matcher: ['/', '/(en|id)/:path*'],
};
