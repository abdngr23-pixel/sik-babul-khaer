# Product Requirements Document (PRD)
## Sistem Informasi DKM Babul Khaer (SIK-MBH)

**Tanggal Pembuatan:** 4 September 2026
**Dokumen Referensi:** AD/ART MBH 2020, Hasil Raker DKM 2026-2029, Skema Mindmap Perencanaan

---

## 1. Ringkasan Produk (Executive Summary)
Sistem Informasi DKM Babul Khaer (SIK-MBH) adalah sebuah web application tanpa server (serverless) yang dirancang untuk mengotomatisasi administrasi umum, keuangan, pendataan jamaah, dan manajemen aset masjid. Sistem ini mengoptimalkan ekosistem Google Workspace (Google Apps Script, Spreadsheets, dan Drive) yang dipadukan dengan kecerdasan buatan (Gemini AI Studio API) untuk menciptakan alur kerja yang efisien, transparan, dan terpusat bagi seluruh jajaran pengurus.

## 2. Ruang Lingkup & Fase Pengembangan (Phasing)
Berdasarkan skema perencanaan strategis, pengembangan SIK-MBH akan dieksekusi dalam 5 (lima) fase utama:

*   **Fase 1: Surat Resmi** (Fokus Kesekretariatan)
*   **Fase 2: Data Jamaah** (Fokus Pendataan Umat)
*   **Fase 3: Catatan Keuangan & Inventaris Aset** (Fokus Perbendaharaan & Sarpras)
*   **Fase 4: Laporan dan Pantauan** (Fokus Eksekutif & LPJ)
*   **Fase 5: Hak Akses Pengguna** (Fokus Keamanan & Role-Based Access)

---

## 3. Spesifikasi Detail Fitur Utama

### FASE 1: Surat Resmi (Modul Kesekretariatan)
Mengotomatisasi tugas tata usaha dan persuratan pengurus.
*   **Lihat Daftar Surat (E-Arsip):** Dashboard pencarian berbasis web dengan filter cerdas (nomor surat, tanggal, kategori) yang terhubung langsung ke arsip fisik (PDF) di Google Drive.
*   **Buat Surat Baru (AI & Template Integration):** Formulir input yang langsung menyuntikkan data ke template Google Docs dan mengonversinya menjadi PDF secara otomatis. Terintegrasi dengan Gemini 3.7 Flash API untuk pembuatan draf surat instan via prompt.
*   **Nomor Surat Otomatis:** Sistem mendeteksi nomor urut terakhir pada database Spreadsheets dan merangkai nomor surat baru (termasuk kode bulan dan tahun) tanpa intervensi manual.
*   **Ekstraksi Notulensi AI (Sub-fitur Tambahan):** Kemampuan mengubah teks notulensi rapat mentah menjadi daftar tugas (actionable items) menggunakan analitik Gemini.

### FASE 2: Data Jamaah
Mencapai target program kerja untuk memiliki basis informasi jamaah yang cepat dan akurat.
*   **Tambah & Ubah Data Jamaah:** Formulir digital untuk registrasi dan pemutakhiran profil jamaah (demografi, alamat di BTP Blok AE, kontak).
*   **Cari Jamaah:** Mesin pencari internal untuk memanggil data jamaah secara instan saat dibutuhkan (misal: untuk pendataan mustahiq zakat atau penyaluran bantuan sosial darurat).

### FASE 3: Catatan Keuangan & Inventaris Aset
**Catatan Keuangan (Modul Bendahara)**
Pemantauan cashflow yang lebih transparan dan pencatatan dana spesifik.
*   **Catat Kas Harian:** Pencatatan arus kas operasional (masuk/keluar) secara real-time untuk memitigasi risiko defisit anggaran.
*   **Zakat dan Infaq:** Modul terpisah untuk rekapitulasi penerimaan dan penyaluran dana ZISWAF.
*   **Kategori Transaksi:** Klasifikasi dana berdasarkan sumber dan peruntukannya, termasuk pemisahan pencatatan Dana Swadaya Jamaah yang khusus digunakan untuk kegiatan Peringatan Hari Besar Islam (PHBI) satu pintu.

**Inventaris Aset (Modul Sarana Prasarana)**
*   **Tambah & Perbarui Aset:** Pencatatan barang masuk baru (misal: mikrofon nirkabel, AC duduk, komputer) dan pemutakhiran status kelayakan barang inventaris lama.
*   **Cari Aset & Pengingat Pemeliharaan:** Database pelacakan aset fisik yang dilengkapi notifikasi jadwal pemeliharaan rutin (contoh: servis AC berkala per 3 bulan, pemeliharaan genset, dan sound system).

### FASE 4: Laporan dan Pantauan (Modul Eksekutif)
*   **Buat Laporan Tahunan (Generator LPJ):** Fitur yang mengagregasi seluruh data kegiatan, surat menyurat, dan keuangan menjadi draf Laporan Pertanggungjawaban (LPJ) akhir masa jabatan.
*   **Ringkasan Bidang:** Visualisasi capaian program kerja untuk memfasilitasi evaluasi kinerja oleh Dewan Penasehat.
*   **Persetujuan Laporan (Approval System):** Alur validasi satu pintu untuk Ketua Umum dalam mengesahkan dokumen atau pengeluaran dana.

### FASE 5: Hak Akses Pengguna (Security & Routing)
*   **Masuk Akun & Menu Sesuai Peran (Role-Based Access):** Penerapan otentikasi dimana antarmuka menyesuaikan dengan jabatan pengguna. (Sekretaris melihat modul persuratan, Bendahara melihat keuangan).
*   **Mode Pengawas:** Akses read-only khusus bagi Dewan Pengawas untuk meninjau log aktivitas dan arus keuangan.

---

## 4. Kebutuhan Teknis (Tech Stack)
*   **Front-End:** HTML, CSS, JavaScript (Dirender via Google Apps Script `doGet()`).
*   **Back-End & Database:** Google Apps Script (`.gs`) dengan Google Spreadsheets terproteksi sebagai basis data relasional.
*   **Storage:** Hierarki folder Google Drive untuk penyimpanan dokumen PDF.
*   **AI Integration:** Google AI Studio API (Gemini 3.7 Flash).

## 5. Fitur yang Dieliminasi (Out of Scope)
Untuk menjaga agar sistem tetap ringan dan fokus pada prioritas, fitur berikut *tidak dimasukkan* dalam lingkup pengembangan saat ini:
1.  Integrasi TV Dashboard Digital (Ditunda).
2.  Sistem Penggajian/Insentif harian untuk Imam dan Penceramah.
3.  Checklist Kebersihan Harian (Marbot/Cleaning Service).
4.  Pelacakan Serapan Anggaran Proyek Konstruksi Fisik.
5.  Pelacakan Barang Hilang/Tertinggal (Dialihkan ke pengumuman papan bicara/medsos).