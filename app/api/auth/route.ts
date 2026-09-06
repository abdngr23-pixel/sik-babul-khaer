import { NextResponse } from 'next/server';
import { OFFICIAL_USERS, ROLE_PERMISSIONS } from '@/lib/mock-auth';
import { store } from '@/lib/store';
import { UserRole } from '@/types/auth';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      users: OFFICIAL_USERS,
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, role, action } = body as {
      userId?: string;
      role?: UserRole;
      action?: 'LOGIN' | 'SWITCH_ROLE';
    };

    let matchedUser = OFFICIAL_USERS.find((u) => u.id === userId);
    if (!matchedUser && role) {
      matchedUser = OFFICIAL_USERS.find((u) => u.role === role);
    }

    if (!matchedUser) {
      return NextResponse.json(
        { success: false, error: 'Akun pengurus tidak ditemukan' },
        { status: 404 }
      );
    }

    // Record an audit log for this session action
    const actionType = action === 'SWITCH_ROLE' ? 'SWITCH_ROLE' : 'LOGIN';
    const actionLabel = action === 'SWITCH_ROLE' ? 'Beralih Peran Pengurus' : 'Masuk Sesi Pengurus';
    const desc =
      action === 'SWITCH_ROLE'
        ? `Pengguna beralih peran aktif ke ${matchedUser.title} (${matchedUser.name})`
        : `Masuk ke akun ${matchedUser.title} (${matchedUser.name}) dari perangkat pimpinan`;

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

    return NextResponse.json({
      success: true,
      user: matchedUser,
      permissions: ROLE_PERMISSIONS[matchedUser.role],
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses otentikasi pengurus' },
      { status: 500 }
    );
  }
}
