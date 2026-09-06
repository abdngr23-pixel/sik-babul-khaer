import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { AuditLogEntry } from '@/types/auth';

export async function GET(req: Request) {
  try {
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
    const body = await req.json();
    const {
      userId,
      userName,
      userRole,
      userRoleLabel,
      action,
      actionLabel,
      module: logModule,
      description,
      status = 'SUCCESS',
    } = body as Partial<AuditLogEntry>;

    if (!userId || !userName || !userRole || !action || !logModule || !description) {
      return NextResponse.json(
        { success: false, error: 'Informasi jejak audit tidak lengkap' },
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
      ipAddress: '180.252.12.9',
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
