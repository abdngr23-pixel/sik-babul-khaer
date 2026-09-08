import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { AuditLogEntry } from '@/types/auth';
import { getSessionUser } from '@/lib/auth-session';
import { getClientIp } from '@/lib/rate-limit';

export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Autentikasi diperlukan untuk melihat riwayat audit sistem.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const moduleFilter = searchParams.get('module') || 'ALL';
    const role = searchParams.get('role') || 'ALL';
    const search = searchParams.get('search') || '';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const logs = await store.getAuditLogs({
      module: moduleFilter,
      role,
      search,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: logs,
      total: logs.length,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data log audit sistem' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Autentikasi diperlukan untuk mencatat jejak audit.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      userId = sessionUser.id,
      userName = sessionUser.name,
      userRole = sessionUser.role,
      userRoleLabel = sessionUser.roleLabel,
      action,
      actionLabel,
      module: logModule,
      description,
      status = 'SUCCESS',
    } = body as Partial<AuditLogEntry>;

    if (!action || !logModule || !description) {
      return NextResponse.json(
        { success: false, error: 'Informasi jejak audit tidak lengkap (action, module, dan description wajib diisi)' },
        { status: 400 }
      );
    }

    const newLog = await store.addAuditLog({
      userId,
      userName,
      userRole,
      userRoleLabel: userRoleLabel || userRole,
      action,
      actionLabel: actionLabel || action,
      module: logModule,
      description,
      ipAddress: getClientIp(req),
      status: status || 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      data: newLog,
    });
  } catch (error) {
    console.error('Error saving audit log:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mencatat jejak audit sistem' },
      { status: 500 }
    );
  }
}
