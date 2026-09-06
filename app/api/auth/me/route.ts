import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-session';
import { ROLE_PERMISSIONS } from '@/lib/mock-auth';
import { SafeUser } from '@/types/auth';

/**
 * GET /api/auth/me
 * Mengembalikan data pengurus yang saat ini sedang aktif dalam sesi login.
 */
export async function GET(req: Request) {
  try {
    const user = await getSessionUser(req);

    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Sesi tidak aktif atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      title: user.title,
      role: user.role,
      roleLabel: user.roleLabel,
      avatarUrl: user.avatarUrl,
      department: user.department,
      isReadOnly: user.isReadOnly,
      bio: user.bio,
    };

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: safeUser,
      permissions: ROLE_PERMISSIONS[user.role],
    });
  } catch (error) {
    console.error('Error fetching session user:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memeriksa sesi pengguna' },
      { status: 500 }
    );
  }
}
