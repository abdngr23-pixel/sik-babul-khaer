import { NextResponse } from 'next/server';
import { extractTokenFromRequest, verifySessionToken } from '@/lib/auth-session';
import { OFFICIAL_USERS } from '@/lib/mock-auth';
import { isTursoConfigured, getTursoClient } from '@/lib/turso';
import { getDb, dbInsertUser } from '@/lib/db';
import { store } from '@/lib/store';

/**
 * POST /api/admin/sync-roles
 * 
 * Sinkronisasi satu arah (idempoten) dari OFFICIAL_USERS (kode) ke basis data (Turso / SQLite).
 * Aturan:
 * - Jika id belum ada di database -> INSERT akun baru dari kode.
 * - Jika id sudah ada di database -> JANGAN ditimpa/diubah sama sekali (PIN & profil tetap aman).
 * 
 * Khusus Super Admin yang terotentikasi.
 */
export async function POST(req: Request) {
  try {
    // 1. Verifikasi Sesi Super Admin
    const token = extractTokenFromRequest(req);
    const session = token ? verifySessionToken(token) : null;

    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak: Hanya Super Administrator yang berwenang menjalankan sinkronisasi akun.',
        },
        { status: 403 }
      );
    }

    let insertedCount = 0;
    let skippedCount = 0;
    const insertedUsers: { id: string; name: string; role: string }[] = [];
    const skippedUsers: { id: string; name: string; role: string }[] = [];
    const now = new Date().toISOString();

    // 2. Sinkronisasi ke Turso Cloud jika terkonfigurasi
    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (!client) {
        return NextResponse.json(
          { success: false, error: 'Gagal menghubungkan ke Turso Cloud LibSQL' },
          { status: 500 }
        );
      }

      // Ambil daftar seluruh ID user yang sudah ada di Turso
      const res = await client.execute('SELECT id, name, role FROM users');
      const existingIds = new Set(res.rows.map((r) => String(r.id)));

      for (const u of OFFICIAL_USERS) {
        if (!existingIds.has(u.id)) {
          // Belum ada -> Insert sebagai akun baru
          await client.execute({
            sql: `
              INSERT INTO users (
                id, name, title, role, roleLabel, email, phone, department,
                isReadOnly, pinHash, status, bio, avatarUrl, createdAt, updatedAt
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
              u.id,
              u.name,
              u.title,
              u.role,
              u.roleLabel,
              u.email,
              u.phone,
              u.department,
              u.isReadOnly ? 1 : 0,
              u.pinHash || '',
              u.status || 'AKTIF',
              u.bio || null,
              u.avatarUrl || null,
              now,
              now,
            ],
          });
          insertedCount++;
          insertedUsers.push({ id: u.id, name: u.name, role: u.role });
        } else {
          // Sudah ada -> Jangan ditimpa sama sekali
          skippedCount++;
          skippedUsers.push({ id: u.id, name: u.name, role: u.role });
        }
      }
    }

    // 3. Sinkronisasi juga ke Local SQLite (agar konsisten)
    try {
      const localDb = getDb();
      const localRows = localDb.prepare('SELECT id FROM users').all() as { id: string }[];
      const localExistingIds = new Set(localRows.map((r) => r.id));

      for (const u of OFFICIAL_USERS) {
        if (!localExistingIds.has(u.id)) {
          dbInsertUser(u);
        }
      }
    } catch (localErr) {
      console.warn('Pemberitahuan sinkronisasi local SQLite:', localErr);
    }

    // 4. Perbarui cache DataStore di memori
    await store.getUsers();

    return NextResponse.json({
      success: true,
      inserted: insertedCount,
      skipped: skippedCount,
      total: OFFICIAL_USERS.length,
      insertedUsers,
      skippedUsers,
      message: `Alhamdulillah, sinkronisasi selesai: ${insertedCount} akun baru berhasil ditambahkan, ${skippedCount} akun yang sudah ada dilewati (data tidak diubah).`,
    });
  } catch (error) {
    console.error('Error in /api/admin/sync-roles:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Terjadi kesalahan sistem saat sinkronisasi akun.',
      },
      { status: 500 }
    );
  }
}
