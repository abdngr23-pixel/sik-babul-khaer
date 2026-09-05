import { NextRequest, NextResponse } from 'next/server';
import { exportDatabaseSnapshot, getDatabaseStats } from '@/lib/db';
import { store } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isDownload = searchParams.get('download') === 'true';

    if (type === 'stats') {
      const stats = getDatabaseStats();
      return NextResponse.json({
        success: true,
        stats,
      });
    }

    // Full export
    const snapshot = exportDatabaseSnapshot();

    // Log this backup action
    store.addAuditLog({
      userId: 'usr-pimpinan',
      userName: 'Pengurus DKM (Pusat Kendali)',
      userRole: 'DEWAN_PENGAWAS',
      userRoleLabel: 'Pimpinan & Pengawas',
      action: 'BACKUP_DATABASE',
      actionLabel: 'Pencadangan Basis Data',
      module: 'SISTEM',
      description: `Mengunduh cadangan lengkap basis data SQLite SIK-MBH (${Object.keys(snapshot.data).length} modul).`,
      status: 'SUCCESS',
    });

    if (isDownload) {
      const filename = `cadangan_sik_mbh_${new Date().toISOString().slice(0, 10)}.json`;
      return new NextResponse(JSON.stringify(snapshot, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      snapshot,
    });
  } catch (error) {
    console.error('Error in database backup API:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat cadangan basis data' },
      { status: 500 }
    );
  }
}
