import { NextRequest, NextResponse } from 'next/server';
import { exportDatabaseSnapshot } from '@/lib/db';
import { store } from '@/lib/store';
import { getSessionUser } from '@/lib/auth-session';

/**
 * POST /api/backup/auto
 * Endpoint pencadangan otomatis (Automated Daily Database Dump).
 * Dapat dipicu oleh:
 * 1. Vercel Cron / GitHub Actions menggunakan header: `Authorization: Bearer <CRON_SECRET>`
 * 2. Pengurus DKM yang sedang login (Ketua / Sekretaris / Bendahara)
 */
export async function POST(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET || 'sik-mbh-cron-backup-secret-2026';
    const authHeader = request.headers.get('authorization');
    const isCronAuthorized =
      authHeader &&
      (authHeader === `Bearer ${cronSecret}` || authHeader === `Bearer ${process.env.AUTH_SECRET}`);

    let user = null;
    if (!isCronAuthorized) {
      user = await getSessionUser(request);
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: 'Akses ditolak: Diperlukan token CRON_SECRET atau sesi login pengurus yang sah.',
          },
          { status: 401 }
        );
      }

      if (user.isReadOnly) {
        return NextResponse.json(
          { success: false, error: 'Akun Pengawas Read-Only tidak dapat memicu pencadangan otomatis.' },
          { status: 403 }
        );
      }
    }

    // Lakukan dump seluruh 10 tabel basis data
    const snapshot = await exportDatabaseSnapshot();

    // Catat log audit sistem
    const triggeredBy = isCronAuthorized
      ? 'Vercel Cron Scheduler (Terjadwal)'
      : `${user?.title} (${user?.name})`;

    try {
      await store.addAuditLog({
        userId: user?.id || 'sys-cron-backup',
        userName: triggeredBy,
        userRole: user?.role || 'KETUA_UMUM',
        userRoleLabel: user?.roleLabel || 'Sistem Terjadwal',
        action: 'BACKUP_DATABASE',
        actionLabel: 'Pencadangan Otomatis Cloud',
        module: 'SISTEM',
        description: `Dump basis data SIK-MBH otomatis berhasil (${Object.keys(snapshot.data).length} tabel terdata).`,
        ipAddress: '127.0.0.1',
        status: 'SUCCESS',
      });
    } catch (logErr) {
      console.warn('Gagal mencatat audit log pencadangan:', logErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Pencadangan otomatis basis data berhasil dilakukan.',
      timestamp: new Date().toISOString(),
      triggeredBy,
      tableCount: Object.keys(snapshot.data).length,
      totalRecords: Object.values(snapshot.data).reduce(
        (acc: number, arr: unknown) => acc + (Array.isArray(arr) ? arr.length : 0),
        0
      ),
      snapshot,
    });
  } catch (error) {
    console.error('Error during automated backup:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses pencadangan otomatis basis data' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/backup/auto
 * Memeriksa status kesehatan dan konfigurasi pencadangan otomatis
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET || 'sik-mbh-cron-backup-secret-2026';
  const authHeader = request.headers.get('authorization');
  const isCronAuthorized =
    authHeader &&
    (authHeader === `Bearer ${cronSecret}` || authHeader === `Bearer ${process.env.AUTH_SECRET}`);

  const isTursoActive = Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);

  return NextResponse.json({
    success: true,
    service: 'SIK-MBH Automated Backup Service',
    databasePersistence: isTursoActive ? 'TURSO_CLOUD_LIBSQL' : 'LOCAL_SQLITE_OR_TMP',
    cronConfigured: Boolean(process.env.CRON_SECRET),
    isAuthorized: Boolean(isCronAuthorized),
  });
}
