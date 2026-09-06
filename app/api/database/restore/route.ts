import { NextRequest, NextResponse } from 'next/server';
import { restoreDatabaseSnapshot } from '@/lib/db';
import { store } from '@/lib/store';
import { authorizeMutation } from '@/lib/auth-session';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['KETUA_UMUM'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const snapshot = body.data ? body : (body.snapshot && body.snapshot.data ? body.snapshot : null);

    if (!snapshot || !snapshot.data || typeof snapshot.data !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Format berkas cadangan tidak valid (objek data tidak ditemukan)' },
        { status: 400 }
      );
    }

    // Perform database restoration
    const result = await restoreDatabaseSnapshot(snapshot);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 500 }
      );
    }

    // Refresh store in-memory state
    await store.reloadFromDatabase();

    // Log this restore action
    await store.addAuditLog({
      userId: 'usr-pimpinan',
      userName: 'Pengurus DKM (Pusat Kendali)',
      userRole: 'DEWAN_PENGAWAS',
      userRoleLabel: 'Pimpinan & Pengawas',
      action: 'RESTORE_DATABASE',
      actionLabel: 'Pemulihan Basis Data',
      module: 'SISTEM',
      description: `Memulihkan seluruh basis data SQLite SIK-MBH dari berkas cadangan snapshot (${body.version || 'v1'}).`,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error restoring database from snapshot:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat memulihkan basis data' },
      { status: 500 }
    );
  }
}
