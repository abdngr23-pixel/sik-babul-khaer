import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { User, UserRole, AuthSessionPayload } from '@/types/auth';
import { OFFICIAL_USERS } from '@/lib/mock-auth';

export const SESSION_COOKIE_NAME = 'sik_session';
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60; // 7 hari

let ephemeralDevSecret: string | null = null;

/**
 * Mendapatkan kunci rahasia HMAC session dari environment.
 * Jika AUTH_SECRET atau NEXTAUTH_SECRET belum disetel di hosting (misal Vercel Environment Variables),
 * sistem menggunakan kunci turunan runtime darurat (ephemeral/derived) dengan peringatan keras di konsol,
 * alih-alih melempar exception fatal yang melumpuhkan login pengurus DKM.
 */
export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret && secret.trim().length > 0) {
    return secret;
  }

  // Fallback aman: derive dari runtime environment unik atau random memory
  if (!ephemeralDevSecret) {
    const runtimeSeed =
      process.env.TURSO_AUTH_TOKEN ||
      process.env.TURSO_DATABASE_URL ||
      crypto.randomBytes(32).toString('hex');

    ephemeralDevSecret = crypto
      .createHash('sha256')
      .update(runtimeSeed + '::sik-babul-khaer-runtime-session-guard')
      .digest('hex');

    console.warn(
      '\n================================================================================\n' +
      '[PERINGATAN KEAMANAN SISTEM DKM]\n' +
      'Variabel environment AUTH_SECRET belum disetel pada hosting / Vercel!\n' +
      'Sistem menggunakan runtime secret darurat agar otentikasi pengurus tetap berjalan.\n' +
      'SANGAT DISARANKAN: Tambahkan AUTH_SECRET di Vercel Dashboard (Project Settings > Environment Variables).\n' +
      '================================================================================\n'
    );
  }

  return ephemeralDevSecret;
}

/**
 * Membuat token sesi bertanda tangan cryptographic (HMAC-SHA256).
 */
export function createSessionToken(
  user: Pick<User, 'id' | 'role' | 'name' | 'roleLabel'>,
  expiresInSeconds = SESSION_DURATION_SECONDS
): string {
  const secretKey = getAuthSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthSessionPayload = {
    userId: user.id,
    name: user.name,
    role: user.role,
    roleLabel: user.roleLabel,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
}

/**
 * Memverifikasi token sesi dan mengembalikan payload jika valid dan belum kedaluwarsa.
 */
export function verifySessionToken(token: string): AuthSessionPayload | null {
  try {
    if (!token || !token.includes('.')) return null;

    const [payloadBase64, signature] = token.split('.');
    if (!payloadBase64 || !signature) return null;

    const secretKey = getAuthSecret();
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(payloadBase64)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSignature);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const jsonStr = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonStr) as AuthSessionPayload;

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Mengekstrak token sesi dari header cookie atau Authorization Bearer.
 */
export function extractTokenFromRequest(req: Request): string | null {
  // 1. Coba dari Cookie header
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]+)`));
  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  // 2. Coba dari Authorization header (Bearer token)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Mengambil data User lengkap yang sedang login dari request.
 */
export async function getSessionUser(req: Request): Promise<User | null> {
  const token = extractTokenFromRequest(req);
  if (!token) return null;

  const payload = verifySessionToken(token);
  if (!payload) return null;

  const found = OFFICIAL_USERS.find((u) => u.id === payload.userId);
  return found || null;
}

/**
 * Menetapkan cookie sesi pada NextResponse.
 */
export function setSessionCookie(res: NextResponse, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Menghapus cookie sesi saat logout.
 */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

/**
 * Helper otorisasi untuk rute API mutasi (POST/PUT/DELETE).
 * Mengembalikan objek `{ user }` jika berwenang, atau `NextResponse` error jika ditolak.
 */
export async function authorizeMutation(
  req: Request,
  options?: {
    allowedRoles?: UserRole[];
    allowReadOnly?: boolean;
  }
): Promise<{ user: User } | NextResponse> {
  const user = await getSessionUser(req);

  if (!user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Sesi autentikasi tidak ditemukan atau telah kedaluwarsa. Silakan masuk terlebih dahulu dengan PIN resmi pengurus.',
      },
      { status: 401 }
    );
  }

  // Dewan Pengawas atau user Read-Only dilarang melakukan mutasi
  if (user.isReadOnly && !options?.allowReadOnly) {
    return NextResponse.json(
      {
        success: false,
        error: 'Akses Ditolak: Akun Anda memiliki wewenang Pengawas (Read-Only) dan tidak diizinkan mengubah data.',
      },
      { status: 403 }
    );
  }

  // Ketua Umum selalu memiliki hak eksekutif penuh, kecuali dibatasi secara spesifik
  if (user.role === 'KETUA_UMUM') {
    return { user };
  }

  // Periksa kesesuaian role
  if (options?.allowedRoles && options.allowedRoles.length > 0) {
    if (!options.allowedRoles.includes(user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: `Akses Ditolak: Jabatan ${user.title} tidak berwenang untuk memodifikasi modul ini.`,
        },
        { status: 403 }
      );
    }
  }

  return { user };
}
