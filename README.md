# SIK-MBH — Sistem Informasi DKM Masjid Babul Khaer

Aplikasi Sistem Informasi Manajemen Terpadu Dewan Kemakmuran Masjid (DKM) Babul Khaer, Kompleks BTP Blok AE, Kelurahan Tamalanrea, Kecamatan Tamalanrea, Kota Makassar, Sulawesi Selatan.

Deployment Produksi: [https://sik-babul-khaer.vercel.app](https://sik-babul-khaer.vercel.app)

---

## 📌 Kebijakan Repositori & Keamanan Data

> [!IMPORTANT]
> **Repositori Private GitHub:**
> Repositori `abdngr23-pixel/sik-babul-khaer` wajib diatur ke **Private** di pengaturan GitHub (`Settings -> Danger Zone -> Change repository visibility -> Make private`) untuk melindungi data struktur pengurus, sensus jamaah, dan pembukuan keuangan DKM.
> Seluruh standar penanganan privasi, hashing kredensial Bcrypt, dan batasan rate limiting diatur dalam [SECURITY.md](file:///c:/Users/Lenovo/Documents/aplikasi-babul-khaer/SECURITY.md).

---

## 🌟 Modul & Fitur Utama (4 Pilar DKM MBH)

1. **Kesekretariatan & Administrasi Persuratan (Fase 1)**:
   - Penomoran surat resmi otomatis standar DKM Babul Khaer format `[No]/DKM-MBH/[Kategori]/[Bulan]/[Tahun]`.
   - E-Arsip surat dinas keluar dan masuk lengkap dengan pratinjau format cetak kertas A4 siap tanda tangan.
   - Generator draf surat dinas Islami berbantuan **Google Gemini 2.5 Flash AI**.
   - Ekstraksi notulensi rapat pleno menjadi daftar penugasan (action items) terstruktur otomatis via AI.

2. **Kependudukan Jamaah & ZISWAF Sosial (Fase 2)**:
   - Pemetaan sensus warga Kompleks BTP Blok AE (RT 01 s.d RT 05).
   - Klasifikasi mustahiq dhuafa, lansia tanggungan, dan anak yatim penerima manfaat santunan.
   - Impor massal data sensus dari lembar kerja Excel (`.xlsx`) dan ekspor laporan kependudukan.

3. **Transparansi Keuangan & Kas Satu Pintu (Fase 3)**:
   - Pembukuan kas harian dengan pemisahan tegas antara **Kas Operasional Rutin**, **Dana Swadaya PHBI** (satu pintu), dan **ZISWAF**.
   - Manajemen donatur tetap bulanan terintegrasi fitur 1-klik setor kas masjid.
   - Generator otomatis pengumuman saldo kas Mimbar Shalat Jumat format cetak siap baca.

4. **Inventarisasi Sarana & Prasarana Fisik (Fase 3)**:
   - Katalog aset masjid (AC duduk Daikin, genset cadangan silent 5500W, sound system, karpet shaf).
   - Pemantauan otomatis siklus pemeliharaan berkala dengan peringatan status jatuh tempo servis.

5. **Pusat Eksekutif, LPJ & Pengesahan Satu Pintu (Fase 4 & 5)**:
   - Generator Laporan Pertanggungjawaban (LPJ) tahunan terkompilasi dari 4 pilar bidang format cetak resmi A4.
   - Dewan Pengawas: Hak akses inspeksi Read-Only untuk evaluasi Indeks Kesehatan DKM dan Log Audit Aktivitas.
   - Alur Pengesahan Satu Pintu (Disposisi & Approval) khusus Ketua Umum DKM.

---

## 🛠️ Arsitektur Teknologi

- **Framework**: [Next.js 16.3.4](https://nextjs.org) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), [Lucide React](https://lucide.dev)
- **Kecerdasan Buatan**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Gemini 2.5 Flash)
- **Basis Data**: Dual-Engine Persisten
  - **Cloud Produksi**: [Turso LibSQL Cloud](https://turso.tech) (AWS Tokyo Region, zero cold-start loss)
  - **Lokal Dev**: Node Native SQLite (`data/babul_khaer.sqlite`) dalam WAL mode
- **Keamanan**: Bcrypt (`bcryptjs`), HMAC-SHA256 Signed Session Cookies (`httpOnly`), In-Memory Rate Limiting (5x/15min).

---

## 🚀 Panduan Menjalankan di Lingkungan Lokal

### Prasyarat
- Node.js versi `22.5.0` atau lebih tinggi
- NPM versi `10.0.0` atau lebih baru

### 1. Kloning & Pemasangan Dependensi
```bash
git clone https://github.com/abdngr23-pixel/sik-babul-khaer.git
cd sik-babul-khaer
npm install
```

### 2. Konfigurasi Environment Variables
Salin berkas `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan variabel berikut di `.env.local`:
```env
# Google Gemini AI API Key
GEMINI_API_KEY=AIzaSy...

# Kredensial Turso LibSQL Cloud (Persistensi Vercel)
TURSO_DATABASE_URL=libsql://sik-babul-khaer-abdngr23-pixel.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGci...

# Keamanan Sesi & Cron
AUTH_SECRET=sik-babul-khaer-secure-hmac-key-2026-btp-ae-makassar
CRON_SECRET=sik-mbh-cron-backup-secret-2026
```

### 3. Menjalankan Server Development
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

### 4. Perintah Tambahan
```bash
# Pemeriksaan Linter ESLint
npm run lint

# Kompilasi Build Produksi
npm run build

# Sinkronisasi Skema & Data ke Turso Cloud
npm run db:turso:push
```

---

## 📖 Referensi Dokumentasi Proyek

- [prd.md](file:///c:/Users/Lenovo/Documents/aplikasi-babul-khaer/prd.md): Dokumen Kebutuhan Produk (Product Requirements Document) SIK-MBH.
- [ui-style.md](file:///c:/Users/Lenovo/Documents/aplikasi-babul-khaer/ui-style.md): Pedoman Desain Visual & Standar Antarmuka SIK-MBH.
- [DEPLOYMENT.md](file:///c:/Users/Lenovo/Documents/aplikasi-babul-khaer/DEPLOYMENT.md): Panduan Lengkap Deployment Produksi di Vercel & Sinkronisasi Cloud.
- [SECURITY.md](file:///c:/Users/Lenovo/Documents/aplikasi-babul-khaer/SECURITY.md): Kebijakan Keamanan, Bcrypt Hashing, dan Privasi Data Jamaah.
