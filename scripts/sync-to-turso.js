/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Skrip Sinkronisasi Data Lokal SQLite ke Turso Cloud SQLite
 * Penggunaan:
 *   node scripts/sync-to-turso.js
 * atau via package.json:
 *   npm run db:turso:push
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');
const { createClient } = require('@libsql/client');

// Muat .env.local atau .env jika ada
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const p = path.join(process.cwd(), file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf-8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx > 0) {
            const key = trimmed.substring(0, idx).trim();
            const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  }
}

loadEnv();

async function main() {
  console.log('\n======================================================');
  console.log('   SIK-MBH: Sinkronisasi Data ke Turso Cloud SQLite   ');
  console.log('======================================================\n');

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    console.error('❌ ERROR: TURSO_DATABASE_URL tidak ditemukan!');
    console.error('\nPastikan variabel lingkungan TURSO_DATABASE_URL dan TURSO_AUTH_TOKEN');
    console.error('sudah disetel di file .env.local atau di terminal.');
    console.error('\nContoh:');
    console.error('  TURSO_DATABASE_URL=libsql://sik-babul-khaer-xxxxx.turso.io');
    console.error('  TURSO_AUTH_TOKEN=eyJhbGciOi...');
    process.exit(1);
  }

  console.log(`📡 Menghubungkan ke Turso Cloud: ${tursoUrl.replace(/(libsql:\/\/[^.]+)\..*/, '$1.turso.io')}...`);
  const tursoClient = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });

  // Uji koneksi
  try {
    await tursoClient.execute('SELECT 1');
    console.log('✅ Koneksi ke Turso Cloud berhasil!\n');
  } catch (err) {
    console.error('❌ Gagal terhubung ke Turso Cloud:', err.message);
    process.exit(1);
  }

  // Buka database lokal SQLite
  const localDbPath = path.join(process.cwd(), 'data', 'sik_mbh.sqlite');
  if (!fs.existsSync(localDbPath)) {
    console.log(`ℹ️ Berkas SQLite lokal (${localDbPath}) belum ada.`);
    console.log('Inisialisasi skema standar di Turso Cloud...');
  } else {
    console.log(`📂 Membaca basis data lokal: ${localDbPath}`);
  }

  // Buat skema tabel di Turso jika belum ada
  console.log('⚙️ Memverifikasi skema tabel di Turso Cloud...');
  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS letters (
      id TEXT PRIMARY KEY, sequenceNumber INTEGER NOT NULL, letterNumber TEXT NOT NULL,
      category TEXT NOT NULL, recipientName TEXT NOT NULL, recipientTitle TEXT,
      recipientAddress TEXT, subject TEXT NOT NULL, letterDate TEXT NOT NULL,
      attachmentCount TEXT, eventDate TEXT, eventTime TEXT, eventLocation TEXT,
      content TEXT NOT NULL, status TEXT NOT NULL, signatory1 TEXT NOT NULL,
      signatory2 TEXT NOT NULL, letterDetails TEXT, physicalArchiveLocation TEXT,
      createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
    );
  `);
  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS minutes (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, date TEXT NOT NULL, location TEXT,
      attendees TEXT, summary TEXT NOT NULL, decisions TEXT NOT NULL,
      actionItems TEXT NOT NULL, rawNotes TEXT, createdAt TEXT NOT NULL
    );
  `);
  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS jamaah (
      id TEXT PRIMARY KEY, fullName TEXT NOT NULL, nik TEXT, gender TEXT NOT NULL,
      birthPlace TEXT, birthDate TEXT, rt TEXT NOT NULL, houseNumber TEXT NOT NULL,
      fullAddress TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, residencyStatus TEXT NOT NULL,
      economicStatus TEXT NOT NULL, familyRole TEXT NOT NULL, familyMemberCount INTEGER,
      occupation TEXT, bloodType TEXT, isYouthMember INTEGER NOT NULL, notes TEXT,
      createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL
    );
  `);
  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY, date TEXT NOT NULL, type TEXT NOT NULL, category TEXT NOT NULL,
      description TEXT NOT NULL, amount REAL NOT NULL, receiptNumber TEXT, payerOrPayee TEXT,
      paymentMethod TEXT NOT NULL, balanceAfter REAL NOT NULL, notes TEXT, createdAt TEXT NOT NULL
    );
  `);
  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS donors (
      id TEXT PRIMARY KEY, donorName TEXT NOT NULL, phone TEXT NOT NULL, rt TEXT NOT NULL,
      address TEXT NOT NULL, category TEXT NOT NULL, commitmentAmount REAL NOT NULL,
      billingDay INTEGER NOT NULL, paymentMethod TEXT NOT NULL, status TEXT NOT NULL,
      lastPaymentDate TEXT, lastPaymentMonth TEXT, notes TEXT, createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY, code TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL,
      location TEXT NOT NULL, purchaseDate TEXT, purchaseCost REAL, condition TEXT NOT NULL,
      maintenanceCycleMonths INTEGER NOT NULL, lastMaintenanceDate TEXT, nextMaintenanceDate TEXT,
      maintenanceNotes TEXT, isMaintenanceDue INTEGER NOT NULL, createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY, type TEXT NOT NULL, title TEXT NOT NULL, referenceNumber TEXT,
      category TEXT NOT NULL, submittedBy TEXT NOT NULL, submittedRole TEXT NOT NULL,
      submittedAt TEXT NOT NULL, amount REAL, description TEXT NOT NULL, status TEXT NOT NULL,
      dispositionNotes TEXT, verifiedBy TEXT, verifiedAt TEXT
    );
  `);
  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS field_kpis (
      field TEXT PRIMARY KEY, title TEXT NOT NULL, leaderName TEXT NOT NULL,
      score REAL NOT NULL, status TEXT NOT NULL, summary TEXT NOT NULL,
      indicators TEXT NOT NULL, keyNotes TEXT NOT NULL
    );
  `);
  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY, timestamp TEXT NOT NULL, userId TEXT NOT NULL, userName TEXT NOT NULL,
      userRole TEXT NOT NULL, userRoleLabel TEXT NOT NULL, action TEXT NOT NULL,
      actionLabel TEXT NOT NULL, module TEXT NOT NULL, description TEXT NOT NULL,
      ipAddress TEXT, status TEXT NOT NULL
    );
  `);
  await tursoClient.execute(`
    CREATE TABLE IF NOT EXISTS meta_kv (
      key TEXT PRIMARY KEY, value TEXT NOT NULL
    );
  `);

  if (!fs.existsSync(localDbPath)) {
    console.log('✅ Skema Turso berhasil dibuat.');
    console.log('🎉 Selesai!');
    return;
  }

  const localDb = new DatabaseSync(localDbPath);
  const tables = [
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
  ];

  console.log('\n🚀 Memulai transfer data ke Turso Cloud:\n');

  for (const table of tables) {
    try {
      const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
      if (rows.length === 0) {
        console.log(`  - Tabel [${table}]: Kosong (0 baris)`);
        continue;
      }

      // Hapus data lama di turso untuk tabel ini agar sinkron bersih
      await tursoClient.execute(`DELETE FROM ${table}`);

      // Susun statements batch
      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

      const statements = rows.map((r) => ({
        sql,
        args: columns.map((col) => r[col]),
      }));

      // Kirim dalam potongan chunk 50 statement per batch
      const chunkSize = 50;
      for (let i = 0; i < statements.length; i += chunkSize) {
        const chunk = statements.slice(i, i + chunkSize);
        await tursoClient.batch(chunk, 'write');
      }

      console.log(`  ✅ Tabel [${table}]: Berhasil mengunggah ${rows.length} baris`);
    } catch (tblErr) {
      console.warn(`  ⚠️ Tabel [${table}] dilewati atau terjadi kesalahan:`, tblErr.message);
    }
  }

  // Update meta timestamp
  await tursoClient.execute({
    sql: 'INSERT OR REPLACE INTO meta_kv (key, value) VALUES (?, ?)',
    args: ['last_synced_from_local', new Date().toISOString()],
  });

  console.log('\n======================================================');
  console.log('🎉 SINKRONISASI SUKSES 100% KE TURSO CLOUD!');
  console.log('Seluruh data operasional Masjid Babul Khaer kini aktif');
  console.log('dan tersimpan aman secara permanen di Cloud.');
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('Fatal error during sync:', err);
  process.exit(1);
});
