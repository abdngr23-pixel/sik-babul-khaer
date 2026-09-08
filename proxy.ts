import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkIpRateLimit, getClientIp, RateLimitTier } from '@/lib/rate-limit';
import { verifySessionTokenEdge } from '@/lib/edge-auth';

// Maksimal panjang query URL (mencegah buffer overflow / URI ReDoS)
const MAX_QUERY_LENGTH = 2048;

// Batas ukuran payload body dalam bytes
const MAX_BODY_SIZE_GENERAL = 1 * 1024 * 1024; // 1MB untuk endpoint JSON umum
const MAX_BODY_SIZE_UPLOAD = 10 * 1024 * 1024;  // 10MB untuk upload file

// Daftar rute API publik yang tidak memerlukan sesi login
const PUBLIC_API_PATHS = new Set([
  '/api/auth',
  '/api/public',
]);

/**
 * Memeriksa apakah suatu origin diizinkan (CORS & CSRF protection).
 */
function isAllowedOrigin(origin: string, host: string): boolean {
  if (!origin) return true; // Direct navigation or non-browser client

  try {
    const originUrl = new URL(origin);
    const hostName = host.split(':')[0];
    const originHost = originUrl.hostname;

    // Same host / localhost
    if (originHost === hostName || originHost === 'localhost' || originHost === '127.0.0.1') {
      return true;
    }

    // Additional allowed origins from environment
    const extraAllowed = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()) || [];
    return extraAllowed.includes(origin) || extraAllowed.includes(originUrl.origin);
  } catch {
    return false;
  }
}

/**
 * Next.js 16 Proxy Function (Menggantikan konvensi deprecated middleware.ts)
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const host = request.headers.get('host') || 'localhost:3000';
  const origin = request.headers.get('origin') || '';
  const clientIp = getClientIp(request);

  // ---------------------------------------------------------------------------
  // 1. CEKLIS 8: Batasi Panjang Query String (Max 2048 karakter)
  // ---------------------------------------------------------------------------
  if (search && search.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: 'URI Terlalu Panjang: Parameter query melebihi batas 2048 karakter.',
      },
      { status: 414 }
    );
  }

  // ---------------------------------------------------------------------------
  // 2. CEKLIS 8: Batasi Ukuran Body Payload via Content-Length
  // ---------------------------------------------------------------------------
  const contentLengthHeader = request.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = parseInt(contentLengthHeader, 10);
    const isUploadRoute = pathname === '/api/upload';
    const limit = isUploadRoute ? MAX_BODY_SIZE_UPLOAD : MAX_BODY_SIZE_GENERAL;

    if (!isNaN(contentLength) && contentLength > limit) {
      return NextResponse.json(
        {
          success: false,
          error: `Ukuran Payload Terlalu Besar: Maksimal ${limit / (1024 * 1024)}MB diperbolehkan.`,
        },
        { status: 413 }
      );
    }
  }

  // ---------------------------------------------------------------------------
  // 3. CEKLIS 6: CORS Restrictions & Preflight Handling
  // ---------------------------------------------------------------------------
  if (method === 'OPTIONS') {
    if (origin && !isAllowedOrigin(origin, host)) {
      return new NextResponse(null, { status: 403, statusText: 'Forbidden Origin' });
    }

    const response = new NextResponse(null, { status: 204 });
    response.headers.set('Access-Control-Allow-Origin', origin || '*');
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    );
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
    return response;
  }

  if (origin && !isAllowedOrigin(origin, host)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Akses CORS Ditolak: Asal permintaan tidak diizinkan oleh sistem SIK-MBH.',
      },
      { status: 403 }
    );
  }

  // ---------------------------------------------------------------------------
  // 4. CEKLIS 3: CSRF Protection untuk Permintaan Mutasi (POST/PUT/DELETE/PATCH)
  // ---------------------------------------------------------------------------
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  const isAuthRoute = pathname === '/api/auth';
  const isCronBackup = pathname === '/api/backup/auto';

  if (isMutation && !isAuthRoute && !isCronBackup) {
    // Periksa Sec-Fetch-Site (Browser modern)
    const secFetchSite = request.headers.get('sec-fetch-site');
    if (secFetchSite === 'cross-site') {
      return NextResponse.json(
        {
          success: false,
          error: 'Proteksi CSRF: Permintaan mutasi lintas situs (cross-site) ditolak.',
        },
        { status: 403 }
      );
    }

    // Periksa Referer header jika ada
    const referer = request.headers.get('referer');
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        const hostName = host.split(':')[0];
        if (
          refererUrl.hostname !== hostName &&
          refererUrl.hostname !== 'localhost' &&
          refererUrl.hostname !== '127.0.0.1'
        ) {
          return NextResponse.json(
            {
              success: false,
              error: 'Proteksi CSRF: Header referer tidak sesuai dengan host aplikasi.',
            },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Proteksi CSRF: Header referer tidak valid.' },
          { status: 403 }
        );
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 5. CEKLIS 1: Global IP-Based Rate Limiting
  // ---------------------------------------------------------------------------
  let rateLimitTier: RateLimitTier = 'GENERAL';
  if (pathname.startsWith('/api/ai/')) {
    rateLimitTier = 'AI'; // 15 req/menit
  } else if (pathname === '/api/auth') {
    rateLimitTier = 'AUTH'; // 20 req/menit
  }

  const rateCheck = checkIpRateLimit(clientIp, rateLimitTier);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Batas laju permintaan terlampaui (${rateLimitTier}). Silakan coba kembali dalam ${rateCheck.resetInSeconds} detik.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateCheck.resetInSeconds),
          'X-RateLimit-Limit': String(rateCheck.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateCheck.resetInSeconds),
        },
      }
    );
  }

  // ---------------------------------------------------------------------------
  // 6. CEKLIS 2: Authentication Middleware (Verifikasi Sesi Pengurus)
  // ---------------------------------------------------------------------------
  const isPublicPath =
    PUBLIC_API_PATHS.has(pathname) ||
    pathname.startsWith('/api/public') ||
    (isCronBackup &&
      request.headers.get('authorization')?.startsWith('Bearer '));

  if (!isPublicPath) {
    // Ekstrak token dari Cookie atau Authorization Bearer
    const sessionCookie = request.cookies.get('sik_session')?.value;
    let token = sessionCookie || null;

    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Autentikasi Diperlukan: Anda harus login dengan PIN resmi pengurus untuk mengakses API ini.',
        },
        { status: 401 }
      );
    }

    const payload = await verifySessionTokenEdge(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: 'Sesi Kedaluwarsa: Kredensial autentikasi tidak valid atau telah habis masa berlakunya.',
        },
        { status: 401 }
      );
    }
  }

  // Lanjutkan permintaan dengan header CORS yang aman
  const response = NextResponse.next();
  if (origin && isAllowedOrigin(origin, host)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  // Tambahkan info rate limit di header respon
  response.headers.set('X-RateLimit-Limit', String(rateCheck.limit));
  response.headers.set('X-RateLimit-Remaining', String(rateCheck.remaining));

  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
