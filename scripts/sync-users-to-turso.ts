/**
 * Skrip Migrasi Idempoten: Sinkronisasi Akun Role Baru ke Turso Cloud LibSQL
 * 
 * Aturan:
 * - Jika ID belum ada di database Turso -> INSERT akun baru dari OFFICIAL_USERS.
 * - Jika ID sudah ada di database Turso -> JANGAN ditimpa/diubah sama sekali (PIN & profil aman).
 * 
 * Penggunaan:
 *   npx tsx scripts/sync-users-to-turso.ts
 *   atau
 *   node scripts/sync-users-to-turso.js
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';
import { OFFICIAL_USERS } from '../lib/mock-auth';

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
  console.log('\n===============================================================');
  console.log('   SIK-MBH: Sinkronisasi Idempoten Akun Pengurus ke Turso Cloud  ');
  console.log('===============================================================\n');

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl) {
    console.error('❌ ERROR: TURSO_DATABASE_URL tidak ditemukan di .env.local atau environment!');
    process.exit(1);
  }

  console.log(`📡 Menghubungkan ke Turso Cloud: ${tursoUrl.replace(/(libsql:\/\/[^.]+)\..*/, '$1.turso.io')}...`);
  const client = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });

  // 1. Ambil daftar akun yang sudah ada di tabel users Turso
  const existingRes = await client.execute('SELECT id, name, role, roleLabel FROM users ORDER BY id ASC');
  const existingMap = new Map<string, { name: string; role: string; roleLabel: string }>();
  for (const r of existingRes.rows) {
    existingMap.set(String(r.id), {
      name: String(r.name),
      role: String(r.role),
      roleLabel: String(r.roleLabel),
    });
  }

  console.log(`📊 Ditemukan ${existingMap.size} akun yang saat ini terdaftar di database Turso.\n`);

  let insertedCount = 0;
  let skippedCount = 0;
  const now = new Date().toISOString();

  console.log('🔄 Memeriksa 16 akun resmi dari kode (lib/mock-auth.ts):');
  console.log('---------------------------------------------------------------');

  for (const u of OFFICIAL_USERS) {
    if (!existingMap.has(u.id)) {
      // Akun belum ada di database -> INSERT baru
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
      console.log(`✨ [BARU - DITAMBAHKAN]  ${u.id.padEnd(22)} | ${u.role.padEnd(30)} | ${u.name}`);
      insertedCount++;
    } else {
      // Akun sudah ada di database -> LEWATI (jangan timpa data atau PIN)
      console.log(`🔒 [ADA - DILEWATI]      ${u.id.padEnd(22)} | ${u.role.padEnd(30)} | ${u.name}`);
      skippedCount++;
    }
  }

  console.log('---------------------------------------------------------------');
  console.log('\n📈 RINGKASAN HASIL SINKRONISASI:');
  console.log(`   - Akun baru ditambahkan ke Turso : ${insertedCount}`);
  console.log(`   - Akun sudah ada (data tidak diubah): ${skippedCount}`);
  console.log(`   - Total akun resmi dalam kode    : ${OFFICIAL_USERS.length}`);

  // Tampilkan daftar mutakhir akun di Turso
  const finalRes = await client.execute('SELECT id, name, role, roleLabel FROM users ORDER BY id ASC');
  console.log(`\n📋 TOTAL AKUN DI TURSO SETELAH SINKRONISASI: ${finalRes.rows.length} akun`);
  finalRes.rows.forEach((r, idx) => {
    console.log(`   ${(idx + 1).toString().padStart(2, ' ')}. [${r.id}] ${r.name} (${r.role}) - ${r.roleLabel}`);
  });

  console.log('\n✅ Selesai! Sinkronisasi bersifat idempoten dan aman dijalankan berkali-kali.\n');
}

main().catch((err) => {
  console.error('❌ Gagal menjalankan sinkronisasi:', err);
  process.exit(1);
});
