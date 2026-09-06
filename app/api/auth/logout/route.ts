import { NextResponse } from 'next/server';
import { clearSessionCookie, getSessionUser } from '@/lib/auth-session';
import { store } from '@/lib/store';

/**
 * POST /api/auth/logout
 * Menghapus cookie sesi httpOnly dan mencatat audit log keluar sistem.
 */
export async function POST(req: Request) {
  try {
    const user = await getSessionUser(req);

    if (user) {
      try {
        await store.addAuditLog({
          userId: user.id,
          userName: user.name,
          userRole: user.role,
          userRoleLabel: user.roleLabel,
          action: 'LOGOUT',
          actionLabel: 'Keluar Sesi Pengurus',
          module: 'AUTENTIKASI',
          description: `Pengguna ${user.title} (${user.name}) telah keluar dari sistem SIK-MBH`,
          ipAddress: '180.252.12.9',
          status: 'SUCCESS',
        });
      } catch (logErr) {
        console.warn('Gagal mencatat audit log logout:', logErr);
      }
    }

    const res = NextResponse.json({
      success: true,
      message: 'Sesi pengurus berhasil diakhiri.',
    });

    clearSessionCookie(res);
    return res;
  } catch (error) {
    console.error('Error logging out user:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses keluar sesi' },
      { status: 500 }
    );
  }
}
