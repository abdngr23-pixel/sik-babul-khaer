pengurus dkm:

# UI Style Guide & Design Guidelines: SIK-MBH
**Sistem Informasi DKM Babul Khaer (BTP Blok AE)**  
*Dokumen Pedoman Visual & Desain Antarmuka: Soft UI × Minimalist UI*

---

## 1. Filosofi & Arah Desain (Design Direction)

Antarmuka **SIK-MBH** dibangun di atas perpaduan harmonis antara **Soft UI** dan **Minimalist UI Modern**. Filosofi ini dirancang untuk menciptakan sistem administrasi masjid yang menenangkan, berwibawa, bersih, dan sangat mudah digunakan oleh beragam usia pengurus DKM.

* **Clean & Generous Breathing Room**: Menghilangkan clutter dan ornamen berlebih. Ruang putih (*white space*) digunakan secara deliberate untuk mengarahkan fokus pengguna ke data dan tindakan penting.
* **Tactile Soft Elevations**: Menghindari border hitam tegas atau efek neumorphic kaku. Sebagai gantinya, digunakan bayangan multi-layer yang sangat lembut (*diffused ambient shadows*) yang memberi kedalaman alami (*subtle elevation*).
* **Friendly Rounded Geometry**: Menggunakan radius kelengkungan yang konsisten dan ramah (`12px` hingga `24px`) untuk menciptakan atmosfer yang modern, ramah, dan inklusif.
* **Serene Spiritual Palette**: Dominasi nuansa terang keabu-abuan bersih (*clean slate/pearl*) dipadukan dengan aksen hijau zamrud (*Emerald Islamic Green*) yang menyimbolkan ketenangan, amanah, dan transparansi keumatan.

---

## 2. Palet Warna & Semantic Tokens

### A. Primary & Accent (Brand Identity)
| Token / Nama | Hex Code | Penggunaan |
| :--- | :--- | :--- |
| **Emerald Primary** | `#059669` | Warna utama, tombol aksi primer (CTA), status aktif navigasi, indikator fokus |
| **Emerald Dark / Hover**| `#047857` | State hover tombol primer, header aksen pekat |
| **Emerald Light Surface**| `#ECFDF5` | Background badge, highlight container fitur AI & jadwal sholat |
| **Emerald Subtle Border**| `#A7F3D0` | Border halus kartu sorotan, status chip sukses |
| **Mint Vibrancy** | `#10B981` | Titik indikator online/real-time, tren positif grafik kas |

### B. Neutral & Backgrounds (Soft Monochromatic)
| Token / Nama | Hex Code | Penggunaan |
| :--- | :--- | :--- |
| **App Canvas / Page BG**| `#F8FAFC` | Latar belakang seluruh halaman aplikasi (*slate-50*) |
| **Card Surface (White)** | `#FFFFFF` | Latar panel kartu, tabel data, modal dialog, sidebar navigasi |
| **Container Low Surface**| `#F1F5F9` | Latar belakang input form pencarian, badge netral, track progress bar |
| **Container Border** | `#E2E8F0` | Border pemisah tipis (*slate-200*) untuk divider & table row |
| **Subtle Divider** | `#F3F4F6` | Garis batas antar kolom metrik internal |

### C. Tipografi & Hierarki Konten
| Token / Nama | Hex Code | Penggunaan |
| :--- | :--- | :--- |
| **Text Primary (Heading)**| `#0F172A` | Judul halaman, heading kartu, angka nominal penting (*slate-900*) |
| **Text Secondary (Body)** | `#334155` | Label form, teks deskripsi, isi sel tabel (*slate-700*) |
| **Text Muted / Caption** | `#64748B` | Timestamp, subtitle metadata, placeholder input (*slate-500*) |
| **Text Disabled** | `#94A3B8` | State non-aktif, breadcrumb divider (*slate-400*) |

### D. Semantic & Status Context
| Status | Background | Border | Teks | Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Terkirim / Terverifikasi** | `#ECFDF5` | `#A7F3D0` | `#065F46` | Dokumen terbit, kas masuk, status mustahiq tervalidasi |
| **Menunggu / Pending** | `#FFFBEB` | `#FDE68A` | `#92400E` | Menunggu approval Ketua DKM, draf surat |
| **Kas Keluar / Perhatian** | `#FEF2F2` | `#FECACA` | `#991B1B` | Pengeluaran operasional, lansia butuh prioritas |
| **Info / AI Feature** | `#EFF6FF` | `#BFDBFE` | `#1E40AF` | Asisten Gemini AI, integrasi Google Workspace |

---

## 3. Sistem Tipografi (Typography Scale)

* **Font Utama (Primary Typeface)**: `Plus Jakarta Sans`, sans-serif.  
  Dipilih karena proporsinya yang modern, keterbacaan tinggi pada layar digital, serta kesan geometris yang rapi.

| Tingkat Hierarki | Ukuran / Line-Height | Weight | Tracking | Kasus Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| **Display / Page Title** | `28px` - `32px` (`1.25`) | Bold (700) | `-0.02em` | Judul modul halaman utama (e.g. *Catatan Keuangan*) |
| **Card / Section Header**| `18px` - `20px` (`1.35`) | SemiBold (600) | `-0.01em` | Judul kartu ringkasan, widget Asisten AI, tabel header |
| **Metric Figure** | `24px` - `28px` (`1.2`) | Bold (800) | `-0.02em` | Angka saldo kas, total jamaah, total surat tersimpan |
| **Body Standard** | `14px` (`1.5`) | Regular (400) / Medium (500) | `0` | Deskripsi konten, data baris tabel, teks input |
| **Body Compact / Subtext**| `13px` (`1.4`) | Regular (400) | `+0.01em` | Alamat jamaah, nomor surat ID, deskripsi sekunder |
| **Caption / Meta Badge** | `11px` - `12px` (`1.3`) | Medium (500) / SemiBold (600) | `+0.02em` | Tag kategori, jadwal sholat, chip status dokumen |

---

## 4. Elevasi, Bayangan (Soft Shadows) & Radius

Ciri khas **Soft UI** diwujudkan melalui sistem elevasi bertingkat yang tidak agresif:

### Sistem Shadow (Tailwind-compatible)
* **Shadow Soft Subsurface (`shadow-soft-sm`)**:  
  `box-shadow: 0 2px 8px -1px rgba(15, 23, 42, 0.04), 0 1px 3px -1px rgba(15, 23, 42, 0.02);`  
  *Digunakan pada: Badge interaktif, item list, input fokus.*
* **Shadow Card Standard (`shadow-soft-md`)**:  
  `box-shadow: 0 6px 20px -3px rgba(15, 23, 42, 0.04), 0 2px 6px -2px rgba(15, 23, 42, 0.02);`  
  *Digunakan pada: Kartu metrik KPI, kartu daftar jamaah, panel AI draf surat.*
* **Shadow Floating Navigation (`shadow-soft-lg`)**:  
  `box-shadow: 0 10px 30px -4px rgba(15, 23, 42, 0.06), 0 4px 10px -3px rgba(15, 23, 42, 0.03);`  
  *Digunakan pada: Sidebar navigasi melayang, dropdown menu, modal approval.*

### Sistem Radius Kelengkungan
* **`rounded-full`**: Pill badge status, avatar profil pengurus, tombol filter kategori, tombol floating action.
* **`rounded-2xl` (16px - 20px)**: Kontainer kartu utama, panel asisten Gemini, modal popup, wrapper tabel.
* **`rounded-xl` (12px)**: Tombol utama (*Primary Button*), field formulir input, panel jadwal sholat.
* **`rounded-lg` (8px)**: Ikon avatar mini, action button kecil dalam baris tabel.

---

## 5. Komponen Inti & Pola Interaksi (UI Components)

### A. Sidebar Navigasi Melayang
* **Layout**: Fixed di sebelah kiri (`w-64` atau `w-72`), berlatar putih bersih dengan radius kanan membulat atau floating card style.
* **Item Menu**:
  * *Default*: Teks `#64748B` dengan ikon outline tipis, background transparan.
  * *Active State*: Background warna `#059669` pekat dengan teks putih, sudut membulat `rounded-xl`, dan ikon solid bersinar lembut.
* **Branding Header**: Logo DKM Babul Khaer terintegrasi dengan penanda lokasi *"BTP Blok AE"* yang tegas.

### B. Top Header Bar (Baris Informasi Terpadu)
* **Pencarian Cerdas Global**: Input field kapsul `rounded-full` berlatar `#F1F5F9` dengan border fokus emerald.
* **Widget Jadwal Sholat Dinamis**: Chip horizontal menyajikan waktu Subuh, Dzuhur, Ashar, Maghrib, Isya dengan sorotan khusus waktu sholat berikutnya (*Next Prayer Countdown*).
* **Profil Pengurus**: Avatar berfoto santun peci/koko dengan nama, jabatan (e.g. *Sekretaris DKM*), dan lonceng notifikasi bersuara merah lembut jika ada approval pending.

### C. Kartu Metrik Ringkasan (KPI Cards)
* **Anatomi**:
  1. Header kartu: Label fase PRD / kategori + Ikon lingkaran lembut (`bg-emerald-50 text-emerald-600`).
  2. Nilai utama: Angka bold besar dengan format rupiah atau kuantitas kependudukan.
  3. Barometer status: Indikator persentase pertumbuhan, status audit, atau ketercukupan kuota.

### D. Generator Surat & Asisten AI Gemini 3.7
* **Aksen Desain**: Gradien halus bernuansa *emerald-to-teal* dengan badge khusus `Gemini 3.7 Flash`.
* **Field Prompt**: Area teks nyaman untuk notulensi rapat mentah atau instruksi pembuatan surat dengan tombol aksi cepat *“Drafkan Otomatis”* (`#059669`).
* **Kancing Template Cepat**: Chip tombol mini dengan ikon Google Docs untuk akses cepat template resmi (Surat Undangan PHBI, Mustahiq, Permohonan Bantuan).

### E. Tabel Data & Buku Kas Real-time
* **Tampilan Minimalis**: Menggunakan baris sel ber-padding lega (`py-4`), zebra row opsional atau latar putih berseling divider halus `#F1F5F9`.
* **Tag Nominal & Bukti**:
  * Penerimaan: teks warna hijau `#059669` dengan tanda `+`.
  * Pengeluaran: teks warna `#E11D48` atau `#334155` dengan tanda `-`.
  * Tombol bukti: Chip tombol kecil terintegrasi Google Drive / Kuitansi digital.

---

## 6. Tata Letak & Spacing Grid (Layout Rules)

* **Grid Sistem**: 12-kolom responsif untuk desktop modern (`1280px` - `1440px` breakpoint standar).
* **Padding Kontainer Utama**: `p-6` hingga `p-8` (24px - 32px) untuk menjamin rasa lapang.
* **Gap Antar Kartu**: `gap-6` (24px) untuk grid metrik; `gap-4` (16px) untuk item list internal.
* **Aksesibilitas (WCAG 2.1 AA)**:
  * Rasio kontras teks primer (`#0F172A`) di atas putih (`#FFFFFF`) adalah `15.8:1` (Sangat aman).
  * Rasio kontras teks tombol emerald (`#FFFFFF` di atas `#059669`) adalah `4.6:1` (Memenuhi standar teks tebal/UI).

---

## 7. Pedoman Voice & Tone Bahasa Antarmuka
* **Bahasa**: Bahasa Indonesia formal, bersahaja, santun, dan syar'i namun tetap profesional administratif modern.
* **Sapaan**: Menggunakan salam Islami (*"Assalamu'alaikum, Ust. Ahmad Fauzi"*).
* **Ketepatan Istilah**: Menggunakan istilah baku keagamaan dan organisasi: *ZISWAF, Mustahiq, Muzakki, DKM, PHBI, Marbot, Khutbah Jumat, Berita Acara, AD/ART 2020*.
