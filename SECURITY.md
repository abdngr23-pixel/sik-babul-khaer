# Kebijakan Keamanan Sistem Informasi DKM Masjid Babul Khaer (SIK-MBH)

Dokumen ini mendefinisikan standar keamanan data dan privasi untuk aplikasi SIK-MBH (`sik-babul-khaer`).

---

## 1. Status Privasi Repositori GitHub

> [!IMPORTANT]
> Repositori GitHub `abdngr23-pixel/sik-babul-khaer` **WAJIB DIATUR SEBAGAI REPOSITORI PRIVATE**.
> Sistem informasi ini memuat struktur internal kepengurusan, tata kelola keuangan perbendaharaan, dan data sensus warga jamaah. Mengubah repositori menjadi Publik adalah pelanggaran kepatuhan privasi data jamaah.

---

## 2. Pengamanan Kredensial & Autentikasi Pengurus

1. **Bcrypt PIN Hashing**:
   - Seluruh PIN 6 digit akun pengurus **WAJIB di-hash menggunakan algoritma Bcrypt** (cost factor minimal 10).
   - Dilarang keras menyimpan PIN plaintext, kata sandi, ataupun kunci sesi di dalam repositori git atau source code (`lib/mock-*.ts`, database seeds, dsb.).
2. **Kredensial Unik per Pengurus**:
   - Setiap jabatan/akun pengurus memiliki PIN 6 digit unik yang terpisah satu sama lain.
   - Daftar PIN awal dicatat secara terpisah di luar git (`credentials-pengurus.local.txt` yang diabaikan oleh `.gitignore`) dan diserahkan secara manual oleh Ketua Umum DKM kepada pengurus terkait.
3. **Perlindungan Anti-Brute Force (Rate Limiting)**:
   - Endpoint `POST /api/auth` dilindungi batas maksimal 5 kali percobaan gagal per akun dalam 15 menit.
   - Jika batas 5 kali terlampaui, akun secara otomatis terkunci sementara (HTTP 429 Too Many Requests) selama 15 menit dan dicatat dalam audit log.
4. **Cookie Sesi Bertanda Tangan Cryptographic (`httpOnly`)**:
   - Sesi autentikasi pengurus diterbitkan melalui cookie `sik_session` bertanda tangan HMAC-SHA256 dengan bendera `httpOnly: true`, `sameSite: 'lax'`, dan `secure: true` pada environment produksi.
   - Klien browser tidak diperkenankan memalsukan atau memanipulasi identitas sesi dari console/localStorage.
5. **Otorisasi Mutasi Data Berbasis Peran**:
   - Semua rute API yang melakukan mutasi data (`POST`, `PUT`, `DELETE`, `PATCH`) wajib melewati middleware/pemeriksaan `authorizeMutation`.
   - Dewan Pengawas dan akun Read-Only secara mutlak diblokir dari seluruh aksi penulisan data.

---

## 3. Perlindungan Data Pribadi (Privasi Jamaah & Donatur)

1. **Penyamaran Data Sensitif (Data Masking)**:
   - Nomor Induk Kependudukan (NIK) warga pada data bawaan di-masking (contoh: `737111******0001`).
   - Nomor telepon pada data contoh menggunakan format penomoran dummy resmi institusi masjid (`0812-4000-xxxx` / `0812-0001-xxxx`).
   - Kontak surel menggunakan alias domain resmi (`@babulkhaer.or.id`), bukan alamat email pribadi publik.
2. **Prinsip Minimisasi Data Publik**:
   - Rute publik seperti `GET /api/auth` hanya mengembalikan data non-sensitif (`id`, `name`, `title`, `role`, `roleLabel`, `department`, `avatarUrl`).
   - Field sensitif seperti `pinHash`, nomor telepon, dan email pribadi tidak pernah dikirim ke respon publik.

---

## 4. Pelaporan Celah Keamanan (Vulnerability Disclosure)

Jika Anda menemukan celah keamanan atau potensi kebocoran data pada sistem SIK-MBH:
1. Hubungi Tim Administrator / Ketua Umum DKM Masjid Babul Khaer secara langsung.
2. Jangan mempublikasikan isu celah keamanan secara terbuka sebelum perbaikan dirilis dan diterapkan pada sistem produksi.
