import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ROLE_PERMISSIONS } from '@/lib/mock-auth';
import { store } from '@/lib/store';
import { UserRole, SafeUser } from '@/types/auth';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/lib/rate-limit';
import { createSessionToken, setSessionCookie } from '@/lib/auth-session';
import { getActiveUsersList } from './users/route';

/**
 * GET /api/auth
 * Mengembalikan daftar akun pengurus NON-SENSITIF (id, name, title, role, roleLabel, avatarUrl)
 * untuk keperluan pemilih profil di antarmuka.
 * TIDAK AKAN PERNAH mengembalikan pinHash, email, atau phone.
 */
export async function GET() {
  try {
    const allActive = getActiveUsersList();
    const safeUsers: SafeUser[] = allActive.map((u) => ({
      id: u.id,
      name: u.name,
      title: u.title,
      role: u.role,
      roleLabel: u.roleLabel,
      avatarUrl: u.avatarUrl,
      department: u.department,
      isReadOnly: u.isReadOnly,
      bio: u.bio,
      status: u.status || 'AKTIF',
    }));

    return NextResponse.json({
      success: true,
      users: safeUsers,
      permissions: ROLE_PERMISSIONS,
    });
  } catch (error) {
    console.error('Error fetching auth users:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data akun pengurus' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/auth
 * Memverifikasi userId dan pin menggunakan bcrypt.
 * Menerapkan rate limiting (maksimal 5 percobaan gagal per akun per 15 menit).
 * Menghasilkan cookie sesi httpOnly (sik_session).
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { userId, role, pin, action } = body as {
      userId?: string;
      role?: UserRole;
      pin?: string;
      action?: 'LOGIN' | 'SWITCH_ROLE';
    };

    // 1. Validasi keberadaan input
    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'PIN 6 digit wajib diisi untuk otentikasi.' },
        { status: 400 }
      );
    }

    if (!userId && !role) {
      return NextResponse.json(
        { success: false, error: 'Identitas akun pengurus (userId atau role) wajib disertakan.' },
        { status: 400 }
      );
    }

    // Cari target akun dari daftar aktif
    const activeList = getActiveUsersList();
    let matchedUser = activeList.find((u) => u.id === userId);
    if (!matchedUser && role) {
      matchedUser = activeList.find((u) => u.role === role);
    }

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, error: 'Akun pengurus tidak ditemukan dalam sistem DKM.' },
        { status: 404 }
      );
    }

    const rateLimitKey = matchedUser.id;

    // 2. Periksa status rate limiting
    const rateStatus = checkRateLimit(rateLimitKey);
    if (rateStatus.isBlocked) {
      const remainingMinutes = Math.ceil(rateStatus.remainingSeconds / 60);
      return NextResponse.json(
        {
          success: false,
          error: `Akun dikunci sementara demi keamanan karena 5 kali percobaan PIN gagal. Coba lagi dalam ${remainingMinutes} menit.`,
          remainingSeconds: rateStatus.remainingSeconds,
        },
        { status: 429 }
      );
    }

    // 3. Verifikasi PIN dengan bcrypt terhadap pinHash
    if (!matchedUser.pinHash) {
      return NextResponse.json(
        { success: false, error: 'Akun belum memiliki kredensial keamanan aktif.' },
        { status: 500 }
      );
    }

    const isPinValid = await bcrypt.compare(pin, matchedUser.pinHash);

    if (!isPinValid) {
      // Catat kegagalan ke rate limiter
      const failResult = recordFailedAttempt(rateLimitKey);

      // Catat log audit kegagalan otentikasi
      try {
        await store.addAuditLog({
          userId: matchedUser.id,
          userName: matchedUser.name,
          userRole: matchedUser.role,
          userRoleLabel: matchedUser.roleLabel,
          action: 'LOGIN',
          actionLabel: 'Percobaan Masuk Ditolak',
          module: 'AUTENTIKASI',
          description: failResult.isBlocked
            ? `Percobaan PIN salah berulang kali mencapai batas (5 kali). Akun terkunci selama 15 menit.`
            : `Percobaan masuk dengan PIN yang tidak sesuai. Sisa kesempatan: ${failResult.remainingAttempts} kali.`,
          ipAddress: '180.252.12.9',
          status: failResult.isBlocked ? 'FAILED' : 'WARNING',
        });
      } catch (logErr) {
        console.warn('Gagal mencatat audit log:', logErr);
      }

      if (failResult.isBlocked) {
        const remainingMinutes = Math.ceil(failResult.remainingSeconds / 60);
        return NextResponse.json(
          {
            success: false,
            error: `PIN tidak sesuai. Batas 5 percobaan gagal telah tercapai! Akun dikunci selama ${remainingMinutes} menit.`,
            remainingSeconds: failResult.remainingSeconds,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `PIN salah. Sisa kesempatan mencoba: ${failResult.remainingAttempts} kali.`,
          remainingAttempts: failResult.remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 4. Autentikasi Berhasil -> Reset catatan percobaan gagal
    resetRateLimit(rateLimitKey);

    // Siapkan SafeUser tanpa data sensitif
    const safeUser: SafeUser = {
      id: matchedUser.id,
      name: matchedUser.name,
      title: matchedUser.title,
      role: matchedUser.role,
      roleLabel: matchedUser.roleLabel,
      avatarUrl: matchedUser.avatarUrl,
      department: matchedUser.department,
      isReadOnly: matchedUser.isReadOnly,
      bio: matchedUser.bio,
    };

    // Buat token sesi bertanda tangan HMAC
    const sessionToken = createSessionToken(matchedUser);

    // Catat log audit keberhasilan
    const actionType = action === 'SWITCH_ROLE' ? 'SWITCH_ROLE' : 'LOGIN';
    const actionLabel = action === 'SWITCH_ROLE' ? 'Beralih Peran Pengurus' : 'Masuk Sesi Pengurus';
    const desc =
      action === 'SWITCH_ROLE'
        ? `Pengguna berhasil beralih peran ke ${matchedUser.title} (${matchedUser.name}) melalui verifikasi PIN aman`
        : `Masuk ke akun ${matchedUser.title} (${matchedUser.name}) dengan verifikasi PIN resmi`;

    try {
      await store.addAuditLog({
        userId: matchedUser.id,
        userName: matchedUser.name,
        userRole: matchedUser.role,
        userRoleLabel: matchedUser.roleLabel,
        action: actionType,
        actionLabel,
        module: 'AUTENTIKASI',
        description: desc,
        ipAddress: '180.252.12.9',
        status: 'SUCCESS',
      });
    } catch (logErr) {
      console.warn('Gagal mencatat audit log:', logErr);
    }

    // Siapkan response dan set httpOnly cookie
    const response = NextResponse.json({
      success: true,
      user: safeUser,
      permissions: ROLE_PERMISSIONS[matchedUser.role],
      token: sessionToken,
    });

    setSessionCookie(response, sessionToken);

    return response;
  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses otentikasi pengurus' },
      { status: 500 }
    );
  }
}
