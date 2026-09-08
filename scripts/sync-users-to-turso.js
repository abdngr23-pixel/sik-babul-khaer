/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * SIK-MBH: Skrip Migrasi Idempoten Sinkronisasi Akun Pengurus ke Turso Cloud LibSQL
 * 
 * Aturan:
 * - Cek apakah ID user sudah ada di Turso.
 * - Jika BELUM ADA -> INSERT sebagai akun baru dengan PIN default.
 * - Jika SUDAH ADA -> JANGAN TIMPA sama sekali (PIN & data tersimpan di Turso tetap aman).
 * 
 * Penggunaan:
 *   node scripts/sync-users-to-turso.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// 1. Muat environment variables (.env.local / .env)
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

// 2. Daftar 16 Akun Resmi DKM Babul Khaer Periode 2026-2029 (Sesuai lib/mock-auth.ts)
const OFFICIAL_USERS = [
  {
    id: 'usr-admin',
    name: 'Administrator TI & Sistem DKM',
    title: 'Super Administrator & Operator IT',
    role: 'SUPER_ADMIN',
    roleLabel: 'Super Admin Sistem',
    email: 'admin@babulkhaer.or.id',
    phone: '0812-4000-0000',
    department: 'Pusat Data & Infrastruktur TI Masjid',
    isReadOnly: false,
    pinHash: '$2b$10$EBga.R2ZSbhc8Qx0CdJq8ewRaoCUc8UOY4Ifs/YCIY6p09hVi7Le2',
    bio: 'Pengelola teknis database cloud Turso, pencadangan dan pemulihan data, otorisasi akun pengguna, dan pengaturan PIN keamanan DKM.',
    status: 'AKTIF',
  },
  {
    id: 'usr-ketua',
    name: 'Drs. Muhammad Hasri, M. Hum.',
    title: 'Ketua Umum DKM',
    role: 'KETUA_UMUM',
    roleLabel: 'Ketua Umum DKM',
    email: 'ketua@babulkhaer.or.id',
    phone: '0812-4000-0001',
    department: 'Badan Pimpinan Harian (Eksekutif)',
    isReadOnly: false,
    pinHash: '$2b$10$EELfAlg0AdLrq9rdzEIsfuMCCmKN/WtsaC1UC8f5dYkcHI2v0lS16',
    bio: 'Pimpinan tertinggi operasional DKM Babul Khaer BTP Blok AE periode 2026-2029 (SK PC DMI Biringkanaya No. 13/2026). Penanggung jawab umum kegiatan kemasjidan, pemegang hak otorisasi pengesahan surat dinas, dan disposisi pencairan kas satu pintu sesuai ART Bagian Ketiga Pasal 3.',
    status: 'AKTIF',
  },
  {
    id: 'usr-sekretaris',
    name: 'Ir. Muhammad Natsir, S.T.',
    title: 'Sekretaris Umum DKM',
    role: 'SEKRETARIS',
    roleLabel: 'Sekretaris Umum',
    email: 'sekretaris@babulkhaer.or.id',
    phone: '0812-4000-0002',
    department: 'Bidang Kesekretariatan & Tata Usaha',
    isReadOnly: false,
    pinHash: '$2b$10$IWF8mlc8SgItEpCLT8eEsOafOu9sAgOhOtJgvpqcZ7PHoL/wy34LO',
    bio: 'Penanggung jawab administrasi umum dan tata usaha kemasjidan DKM Babul Khaer periode 2026-2029 (ART Bagian Kelima Pasal 6). Mengelola persuratan dinas resmi, e-arsip berkas digital, persiapan rapat pleno, notulensi AI, serta memaraf SK kepanitiaan sebelum ditandatangani Ketua Umum.',
    status: 'AKTIF',
  },
  {
    id: 'usr-bendahara',
    name: 'H. Sahali',
    title: 'Bendahara Umum DKM',
    role: 'BENDAHARA',
    roleLabel: 'Bendahara Umum',
    email: 'bendahara@babulkhaer.or.id',
    phone: '0812-4000-0003',
    department: 'Bidang Keuangan & Perbendaharaan',
    isReadOnly: false,
    pinHash: '$2b$10$qPB9.0KGvx2MKyHUC.LF9.M5iMegQVEj8UeiIZ.vW8qkEKdSXcyBC',
    bio: 'Penata dan pengelola administrasi keuangan dan perbendaharaan DKM Babul Khaer periode 2026-2029 (ART Bagian Keenam Pasal 7). Bertanggung jawab atas pembukuan kas harian, laporan berkala mimbar Jumat, pengelolaan pos dana swadaya PHBI satu pintu hasil Raker 2026, dan penerimaan ZISWAF/donatur.',
    status: 'AKTIF',
  },
  {
    id: 'usr-sarpras',
    name: 'Faisal T. Parussengi, S.S.',
    title: 'Koordinator Sarana & Prasarana',
    role: 'SEKSI_SARPRAS',
    roleLabel: 'Koordinator Sarpras',
    email: 'sarpras@babulkhaer.or.id',
    phone: '0812-4000-0004',
    department: 'Bidang Pembangunan, Sarana & Prasarana (Ketua II)',
    isReadOnly: false,
    pinHash: '$2b$10$ILisYBrKnqb86HEIe1nlBOOb71J/NrFCKxHYZSNz0CWnPR8/PCX0S',
    bio: 'Koordinator Seksi Sarana dan Prasarana di bawah naungan Ketua II (H. Muh. Nancha Pattanang, S.E.) periode 2026-2029 (ART Pasal 9). Bertanggung jawab atas inventarisasi kekayaan fisik masjid, pemeliharaan AC Daikin, relokasi modul otomatis genset hasil Raker 2026, sound system, dan fasilitas fisik ibadah.',
    status: 'AKTIF',
  },
  {
    id: 'usr-kemasjidan',
    name: 'Drs. Manai, M.M.',
    title: 'Koordinator Peribadatan & Dakwah',
    role: 'SEKSI_PERIBADATAN_DAKWAH',
    roleLabel: 'Peribadatan & Dakwah',
    email: 'dakwah@babulkhaer.or.id',
    phone: '0812-4000-0005',
    department: 'Bidang Keagamaan, Pendidikan & Organisasi (Ketua I)',
    isReadOnly: false,
    pinHash: '$2b$10$vlgpOVTZlgVX0sqHWgX4NOK7/Xh7uwQmZIdxoGxBCwpmM9AHsva7S',
    bio: 'Koordinator Seksi Peribadatan dan Dakwah di bawah naungan Ketua I (Drs. H. Suardi, M.Pd.) periode 2026-2029 (ART Pasal 8 poin a). Mengelola jadwal sholat fardhu/Jumat, penetapan insentif imam rawatib Rp1.500.000 hasil Raker 2026, kalender kajian dakwah, dan koordinasi asatidz muballigh.',
    status: 'AKTIF',
  },
  {
    id: 'usr-ketua-1',
    name: 'Drs. H. Suardi, M. Pd.',
    title: 'Ketua I DKM (Bidang Keagamaan, Pendidikan & Organisasi)',
    role: 'KETUA_I',
    roleLabel: 'Ketua I',
    email: 'ketua1@babulkhaer.or.id',
    phone: '0812-4000-0011',
    department: 'Membawahi Seksi Peribadatan-Dakwah, Organisasi-Pendidikan-Remaja, Humas-Sosial, Pemberdayaan Perempuan (ART Pasal 4)',
    isReadOnly: false,
    pinHash: '$2b$10$EBga.R2ZSbhc8Qx0CdJq8ewRaoCUc8UOY4Ifs/YCIY6p09hVi7Le2',
    bio: 'Membawahi dan mengoordinasikan Seksi Peribadatan dan Dakwah, Seksi Organisasi Pendidikan dan Pembinaan Remaja, Seksi Humas dan Sosial Kemasyarakatan, serta Seksi Pemberdayaan Perempuan sesuai ART Pasal 4.',
    status: 'AKTIF',
  },
  {
    id: 'usr-ketua-2',
    name: 'H. Muh. Nancha Pattanang, S. E.',
    title: 'Ketua II DKM (Bidang Pembangunan, Sarana & Prasarana)',
    role: 'KETUA_II',
    roleLabel: 'Ketua II',
    email: 'ketua2@babulkhaer.or.id',
    phone: '0812-4000-0012',
    department: 'Membawahi Seksi Pembangunan, Sarana-Prasarana, Keamanan-Kebersihan (ART Pasal 4)',
    isReadOnly: false,
    pinHash: '$2b$10$EBga.R2ZSbhc8Qx0CdJq8ewRaoCUc8UOY4Ifs/YCIY6p09hVi7Le2',
    bio: 'Membawahi dan mengoordinasikan Seksi Pembangunan, Seksi Sarana dan Prasarana, serta Seksi Keamanan dan Kebersihan sesuai ART Pasal 4.',
    status: 'AKTIF',
  },
  {
    id: 'usr-wakil-sekretaris',
    name: 'Abdi Negara, S. Kom.',
    title: 'Wakil Sekretaris DKM',
    role: 'WAKIL_SEKRETARIS',
    roleLabel: 'Wakil Sekretaris',
    email: 'wakil.sekretaris@babulkhaer.or.id',
    phone: '0812-4000-0013',
    department: 'Bidang Kesekretariatan & Tata Usaha',
    isReadOnly: false,
    pinHash: '$2b$10$EBga.R2ZSbhc8Qx0CdJq8ewRaoCUc8UOY4Ifs/YCIY6p09hVi7Le2',
    bio: 'Membantu Sekretaris Umum dalam tata kelola administrasi surat dinas resmi, e-arsip berkas digital, notulensi rapat pleno AI, dan kepanitiaan ad-hoc DKM Babul Khaer.',
    status: 'AKTIF',
  },
  {
    id: 'usr-wakil-bendahara',
    name: 'Jumadil Rachmat, S. T.',
    title: 'Wakil Bendahara DKM',
    role: 'WAKIL_BENDAHARA',
    roleLabel: 'Wakil Bendahara',
    email: 'wakil.bendahara@babulkhaer.or.id',
    phone: '0812-4000-0014',
    department: 'Bidang Keuangan & Perbendaharaan',
    isReadOnly: false,
    pinHash: '$2b$10$EBga.R2ZSbhc8Qx0CdJq8ewRaoCUc8UOY4Ifs/YCIY6p09hVi7Le2',
    bio: 'Membantu Bendahara Umum dalam penatausahaan kas umum masjid, pembukuan PHBI satu pintu, dan rekonsiliasi donatur tetap bulanan.',
    status: 'AKTIF',
  },
  {
    id: 'usr-seksi-organisasi',
    name: 'Arjun, S. H.',
    title: 'Koordinator Seksi Organisasi, Pendidikan & Pembinaan Remaja Masjid',
    role: 'SEKSI_ORGANISASI_PENDIDIKAN_REMAJA',
    roleLabel: 'Organisasi & Pendidikan Remaja',
    email: 'remaja@babulkhaer.or.id',
    phone: '0812-4000-0015',
    department: 'Bidang Keagamaan, Pendidikan & Organisasi (Ketua I)',
    isReadOnly: false,
    pinHash: '$2b$10$EBga.R2ZSbhc8Qx0CdJq8ewRaoCUc8UOY4Ifs/YCIY6p09hVi7Le2',
    bio: 'Koordinator Seksi Organisasi, Pendidikan dan Pembinaan Remaja Masjid (Seksi b) sesuai ART Pasal 8 poin b. Mengelola pembinaan generasi muda, santri TPA, dan kaderisasi remaja masjid.',
    status: 'AKTIF',
  },
  {
    id: 'usr-seksi-humas',
    name: 'Drs. H. Muh. Rusdi Lahajji, M. Pd.',
    title: 'Koordinator Seksi Humas dan Sosial Kemasyarakatan',
    role: 'SEKSI_HUMAS_SOSIAL',
    roleLabel: 'Humas & Sosial (ZISWAF)',
    email: 'sosial@babulkhaer.or.id',
    phone: '0812-4000-0016',
    department: 'Bidang Keagamaan, Pendidikan & Organisasi (Ketua I)',
    isReadOnly: false,
    pinHash: '$2b$10$EBga.R2ZSbhc8Qx0CdJq8ewRaoCUc8UOY4Ifs/YCIY6p09hVi7Le2',
    bio: 'Koordinator penggalangan dan pendistribusian ZISWAF (zakat, infaq, shadaqah, waqaf), ATM Beras, dan Lelang Infaq sesuai ART Pasal 8 poin c.',
    status: 'AKTIF',
  },
  {
    id: 'usr-seksi-perempuan',
    name: 'Andi Waru Paluseri, S. Pd., M. Si.',
    title: 'Koordinator Seksi Pemberdayaan Perempuan',
    role: 'SEKSI_PEMBERDAYAAN_PEREMPUAN',
    roleLabel: 'Pemberdayaan Perempuan',
    email: 'perempuan@babulkhaer.or.id',
    phone: '0812-4000-0017',
    department: 'Bidang Keagamaan, Pendidikan & Organisasi (Ketua I)',
    isReadOnly: false,
    pinHash: '$2b$10$EBga.R2ZSbhc8Qx0CdJq8ewRaoCUc8UOY4Ifs/YCIY6p09hVi7Le2',
    bio: 'Koordinator Seksi Pemberdayaan Perempuan (Seksi d) sesuai ART Pasal 8 poin d, menaungi program pembinaan muslimah, majelis ta\'lim wanita, serta pemberdayaan UMKM dan Gerai Muslimah hasil Raker 2026.',
    status: 'AKTIF',
  },
  {
    id: 'usr-seksi-pembangunan',
    name: 'Kaharuddin, S. Pd.',
    title: 'Koordinator Seksi Pembangunan',
    role: 'SEKSI_PEMBANGUNAN',
    roleLabel: 'Pembangunan',
    email: 'pembangunan@babulkhaer.or.id',
    phone: '0812-4000-0018',
    department: 'Bidang Pembangunan, Sarana & Prasarana (Ketua II)',
    isReadOnly: false,
    pinHash: '$2b$10$EBga.R2ZSbhc8Qx0CdJq8ewRaoCUc8UOY4Ifs/YCIY6p09hVi7Le2',
    bio: 'Koordinator proyek pembangunan fisik masjid (menara, plafon, drainase, dll) sesuai ART Pasal 8 poin a bagian Ketua II — terpisah dari Seksi Sarana dan Prasarana yang menangani pemeliharaan rutin.',
    status: 'AKTIF',
  },
  {
    id: 'usr-seksi-keamanan',
    name: 'Firdaus Ramlan',
    title: 'Koordinator Seksi Keamanan dan Kebersihan',
    role: 'SEKSI_KEAMANAN_KEBERSIHAN',
    roleLabel: 'Keamanan & Kebersihan',
    email: 'keamanan@babulkhaer.or.id',
    phone: '0812-4000-0019',
    department: 'Bidang Pembangunan, Sarana & Prasarana (Ketua II)',
    isReadOnly: false,
    pinHash: '$2b$10$EBga.R2ZSbhc8Qx0CdJq8ewRaoCUc8UOY4Ifs/YCIY6p09hVi7Le2',
    bio: 'Koordinator Seksi Keamanan dan Kebersihan (Seksi g) sesuai ART Pasal 8 poin c bagian Ketua II. Bertanggung jawab atas ketertiban lingkungan dan kenyamanan ibadah jamaah.',
    status: 'AKTIF',
  },
  {
    id: 'usr-pengawas',
    name: 'Dr. Andi Fiptar Abdi Alam, M. Si.',
    title: 'Koordinator Dewan Pengawas & Pemeriksa',
    role: 'DEWAN_PENGAWAS',
    roleLabel: 'Dewan Pengawas & Pemeriksa',
    email: 'pengawas@babulkhaer.or.id',
    phone: '0812-4000-0006',
    department: 'Badan Pengawas & Pemeriksa Keuangan DKM',
    isReadOnly: true,
    pinHash: '$2b$10$9oUuPw9MYw6YEWYpfnRo5uTEI2puiSLEUVPrrkrO7kCMidpFyQpOi',
    bio: 'Koordinator Dewan Pengawas dan Pemeriksa DKM Babul Khaer periode 2026-2029 (SK PC DMI No. 13/2026 & ART Bagian Kedua Pasal 2 ayat 3). Menjalankan amanah independen pengawasan dan pemeriksaan penggunaan dana kas masjid, evaluasi pencapaian kinerja 4 pilar DKM, dan audit kepatuhan AD/ART (Mode Akses Read-Only).',
    status: 'AKTIF',
  },
];

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

  // 1. Ambil daftar akun yang saat ini ada di tabel users Turso
  const existingRes = await client.execute('SELECT id, name, role, roleLabel FROM users ORDER BY id ASC');
  const existingMap = new Map();
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

  console.log('🔄 Memeriksa 16 akun resmi dari kode:');
  console.log('--------------------------------------------------------------------------------------');

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
      console.log(`✨ [BARU - DITAMBAHKAN]  ${u.id.padEnd(23)} | ${u.role.padEnd(35)} | ${u.name}`);
      insertedCount++;
    } else {
      // Akun sudah ada di database -> LEWATI (jangan timpa data atau PIN)
      console.log(`🔒 [ADA - DILEWATI]      ${u.id.padEnd(23)} | ${u.role.padEnd(35)} | ${u.name}`);
      skippedCount++;
    }
  }

  console.log('--------------------------------------------------------------------------------------');
  console.log('\n📈 RINGKASAN HASIL SINKRONISASI:');
  console.log(`   - Akun baru ditambahkan ke Turso    : ${insertedCount}`);
  console.log(`   - Akun sudah ada (data tidak diubah): ${skippedCount}`);
  console.log(`   - Total akun resmi dalam kode       : ${OFFICIAL_USERS.length}`);

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
