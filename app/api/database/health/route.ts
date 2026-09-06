import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth-session';
import { isTursoConfigured, getTursoClient, tursoGetDatabaseStats } from '@/lib/turso';
import { getDatabaseStats as getLocalDatabaseStats } from '@/lib/db';

/**
 * GET /api/database/health
 * Endpoint diagnostik untuk membandingkan row count antara Turso Cloud dan SQLite Lokal
 * pada seluruh 19 tabel SIK-MBH. Hanya dapat diakses oleh SUPER_ADMIN dan KETUA_UMUM.
 */
export async function GET(request: NextRequest) {
  try {
    // Otorisasi: hanya Super Admin dan Ketua Umum
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Sesi autentikasi diperlukan.' },
        { status: 401 }
      );
    }
    if (!['SUPER_ADMIN', 'KETUA_UMUM', 'DEWAN_PENGAWAS'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Hanya Super Admin, Ketua Umum, atau Dewan Pengawas yang dapat mengakses diagnostik ini.' },
        { status: 403 }
      );
    }

    const TABLE_NAMES = [
      'letters',
      'minutes',
      'jamaah',
      'transactions',
      'donors',
      'assets',
      'approvals',
      'field_kpis',
      'audit_logs',
      'meta_kv',
      'khatib_database',
      'friday_schedules',
      'ramadhan_schedules',
      'kajian_schedules',
      'physical_projects',
      'sss_cans',
      'sss_records',
      'ziswaf_aids',
      'users',
    ];

    const TABLE_LABELS: Record<string, string> = {
      letters: 'Surat Dinas',
      minutes: 'Notulen Rapat',
      jamaah: 'Data Jamaah',
      transactions: 'Transaksi Keuangan',
      donors: 'Donatur Tetap',
      assets: 'Inventaris Aset',
      approvals: 'Disposisi & Persetujuan',
      field_kpis: 'KPI 4 Pilar',
      audit_logs: 'Log Audit',
      meta_kv: 'Metadata Sistem',
      khatib_database: 'Database Khatib',
      friday_schedules: 'Jadwal Jumat',
      ramadhan_schedules: 'Jadwal Ramadhan',
      kajian_schedules: 'Jadwal Kajian',
      physical_projects: 'Proyek Fisik',
      sss_cans: 'Kaleng SSS',
      sss_records: 'Catatan SSS',
      ziswaf_aids: 'Bantuan ZISWAF',
      users: 'Akun Pengurus',
    };

    let tursoStats: Record<string, number> | null = null;
    let tursoConnected = false;
    let tursoEngine = '';

    // 1. Ambil statistik dari Turso Cloud (jika terkonfigurasi)
    if (isTursoConfigured()) {
      try {
        const client = getTursoClient();
        if (client) {
          const stats = await tursoGetDatabaseStats(client);
          tursoConnected = stats.cloudConnected;
          tursoEngine = stats.engineLabel;
          tursoStats = {
            letters: stats.totalLetters,
            minutes: stats.totalMinutes,
            jamaah: stats.totalJamaah,
            transactions: stats.totalTransactions,
            donors: stats.totalDonors,
            assets: stats.totalAssets,
            approvals: stats.totalApprovals,
            audit_logs: stats.totalAuditLogs,
            khatib_database: stats.totalKhatib || 0,
            friday_schedules: stats.totalFridaySchedules || 0,
            ramadhan_schedules: stats.totalRamadhanSchedules || 0,
            kajian_schedules: stats.totalKajianSchedules || 0,
            physical_projects: stats.totalPhysicalProjects || 0,
            sss_cans: stats.totalSssCans || 0,
            sss_records: stats.totalSssRecords || 0,
            ziswaf_aids: stats.totalZiswafAids || 0,
            users: stats.totalUsers || 0,
            field_kpis: 0,
            meta_kv: 0,
          };

          // Get field_kpis and meta_kv counts separately
          try {
            const kpiRes = await client.execute('SELECT COUNT(*) as count FROM field_kpis');
            tursoStats.field_kpis = Number(kpiRes.rows[0]?.count || 0);
          } catch { /* table might not exist yet */ }

          try {
            const metaRes = await client.execute('SELECT COUNT(*) as count FROM meta_kv');
            tursoStats.meta_kv = Number(metaRes.rows[0]?.count || 0);
          } catch { /* table might not exist yet */ }
        }
      } catch (err) {
        console.error('Health check: Turso Cloud error:', err);
      }
    }

    // 2. Ambil statistik dari SQLite Lokal
    let localStats: Record<string, number> | null = null;
    let localEngine = '';
    try {
      const stats = await getLocalDatabaseStats();
      // Only use local stats if NOT using Turso (otherwise local is the same as turso via proxy)
      if (!isTursoConfigured() || !tursoConnected) {
        localEngine = stats.engineLabel;
        localStats = {
          letters: stats.totalLetters,
          minutes: stats.totalMinutes,
          jamaah: stats.totalJamaah,
          transactions: stats.totalTransactions,
          donors: stats.totalDonors,
          assets: stats.totalAssets,
          approvals: stats.totalApprovals,
          audit_logs: stats.totalAuditLogs,
          khatib_database: stats.totalKhatib || 0,
          friday_schedules: stats.totalFridaySchedules || 0,
          ramadhan_schedules: stats.totalRamadhanSchedules || 0,
          kajian_schedules: stats.totalKajianSchedules || 0,
          physical_projects: stats.totalPhysicalProjects || 0,
          sss_cans: stats.totalSssCans || 0,
          sss_records: stats.totalSssRecords || 0,
          ziswaf_aids: stats.totalZiswafAids || 0,
          users: stats.totalUsers || 0,
          field_kpis: 0,
          meta_kv: 0,
        };
      }
    } catch (err) {
      console.error('Health check: Local SQLite error:', err);
    }

    // 3. Bandingkan dan buat laporan per tabel
    const tableReports = TABLE_NAMES.map((table) => {
      const tursoCount = tursoStats?.[table] ?? null;
      const localCount = localStats?.[table] ?? null;
      const label = TABLE_LABELS[table] || table;

      let status: 'SYNCED' | 'DRIFT_DETECTED' | 'SINGLE_ENGINE' | 'UNAVAILABLE';
      let drift = 0;

      if (tursoCount !== null && localCount !== null) {
        drift = Math.abs(tursoCount - localCount);
        status = drift === 0 ? 'SYNCED' : 'DRIFT_DETECTED';
      } else if (tursoCount !== null || localCount !== null) {
        status = 'SINGLE_ENGINE';
      } else {
        status = 'UNAVAILABLE';
      }

      return {
        table,
        label,
        tursoCount,
        localCount,
        drift,
        status,
      };
    });

    const totalTables = tableReports.length;
    const syncedTables = tableReports.filter((r) => r.status === 'SYNCED').length;
    const singleEngineTables = tableReports.filter((r) => r.status === 'SINGLE_ENGINE').length;
    const driftTables = tableReports.filter((r) => r.status === 'DRIFT_DETECTED').length;
    const healthScore =
      totalTables > 0
        ? Math.round(((syncedTables + singleEngineTables) / totalTables) * 100)
        : 0;

    const overallStatus =
      driftTables > 0
        ? 'DRIFT_DETECTED'
        : tursoConnected
          ? 'HEALTHY'
          : 'SINGLE_ENGINE';

    return NextResponse.json({
      success: true,
      health: {
        overallStatus,
        healthScore,
        checkedAt: new Date().toISOString(),
        tursoConnected,
        tursoEngine: tursoEngine || null,
        localEngine: localEngine || null,
        dualEngineActive: tursoConnected && localStats !== null,
        summary: {
          totalTables,
          syncedTables,
          singleEngineTables,
          driftTables,
        },
        tables: tableReports,
      },
    });
  } catch (error) {
    console.error('Error in database health check:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal melakukan pemeriksaan kesehatan basis data' },
      { status: 500 }
    );
  }
}
