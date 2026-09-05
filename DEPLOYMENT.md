# Buku Panduan Deployment SIK-MBH
## Sistem Informasi Kemasjidan Masjid Babul Khaer
**Kompleks BTP Blok AE, Kelurahan Tamalanrea, Kota Makassar**

Dokumen ini memuat panduan lengkap langkah-demi-langkah untuk menyebarkan (*deploy*) aplikasi **SIK-MBH** ke lingkungan produksi online agar dapat diakses oleh jajaran pengurus DKM melalui laptop, tablet, maupun smartphone dari mana saja.

---

## 1. Pilihan Metode Deployment

Anda dapat memilih salah satu dari dua metode yang paling sesuai dengan kebutuhan dan anggaran DKM:

| Fitur / Parameter | Opsi 1: Vercel (Cloud Serverless) | Opsi 2: VPS / Cloud (Docker Compose) |
|---|---|---|
| **Biaya Server** | **Gratis** (Hobby Plan Vercel) | ~Rp 50.000 - Rp 100.000 / bulan |
| **Keahlian Teknis** | Pemula (Tinggal klik di web) | Menengah (Perintah terminal Linux) |
| **Persistensi Data** | Memori `/tmp` + Unduh Berkas Cadangan JSON | **Permanen 100% di Harddisk Server** |
| **Kecepatan Akses** | Sangat Cepat (CDN Global Singapura `sin1`) | Cepat (Server Indonesia / Singapura) |
| **Rekomendasi Penggunaan** | Uji coba online, demo, operasional ringan | **Produksi Jangka Panjang Resmi DKM** |

---

## 2. Opsi 1: Panduan Deploy ke Vercel (Gratis & 1-Klik)

Vercel adalah platform cloud terbaik untuk aplikasi Next.js. Sangat cocok jika DKM ingin aplikasi langsung online tanpa perlu menyewa VPS.

### Langkah 1: Unggah Kode ke GitHub
1. Buat repositori baru di akun [GitHub](https://github.com) pengurus (misalnya: `sik-babul-khaer`).
2. Di komputer lokal, buka terminal di folder proyek dan jalankan:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi SIK-MBH dengan SQLite & konfigurasi deployment"
   git branch -M main
   git remote add origin https://github.com/USERNAME_ANDA/sik-babul-khaer.git
   git push -u origin main
   ```

### Langkah 2: Impor ke Vercel
1. Buka [vercel.com](https://vercel.com) dan masuk menggunakan akun GitHub Anda.
2. Klik tombol **Add New...** -> **Project**.
3. Pilih repositori `sik-babul-khaer` dari daftar, lalu klik **Import**.

### Langkah 3: Konfigurasi Environment Variables
1. Pada menu **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_APP_URL` = `https://nama-proyek-anda.vercel.app`
   - `GEMINI_API_KEY` = `(Kunci API Google Gemini Anda dari https://aistudio.google.com)`
2. Pengaturan **Framework Preset** otomatis terpilih: **Next.js**.
3. Pengaturan **Node.js Version**: Masuk ke *Project Settings* -> *General* -> *Node.js Version* -> Pilih **22.x**.

### Langkah 4: Klik Deploy
- Klik tombol **Deploy**.
- Tunggu proses build selesai (~1-2 menit).
- Aplikasi Anda kini aktif dan memiliki alamat web resmi, contoh: `https://sik-babul-khaer.vercel.app`.

> [!TIP]
> **Manajemen Data di Vercel:**  
> Karena Vercel menggunakan serverless compute di mana filesystem bersifat sementara (*ephemeral*), pengurus disarankan mengunduh berkas cadangan secara berkala melalui menu **Sidebar -> Akses & Keamanan -> Cadangan Data (Backup)** -> simpan berkas `.json` ke Google Drive DKM.

---

## 3. Opsi 2: Panduan Deploy ke VPS / Cloud (Docker Compose - Disarankan untuk Permanen)

Metode ini sangat disarankan untuk kepengurusan DKM periode 2026-2029 karena menjamin data SQLite tersimpan di harddisk server secara permanen dan tidak akan pernah terhapus.

### Penyedia VPS yang Direkomendasikan:
- **IDCloudHost** (Server Jakarta, mulai Rp 50.000/bln)
- **Niagahoster / Hostinger KVM 1** (Mulai Rp 75.000/bln)
- **DigitalOcean / Linode** (Droplet $4-$6/bln)

### Langkah 1: Masuk ke VPS dan Pasang Docker
Masuk ke terminal VPS via SSH:
```bash
ssh root@IP_SERVER_ANDA
```

Perbarui paket dan pasang Docker & Docker Compose:
```bash
# Update Ubuntu/Debian
apt update && apt upgrade -y

# Pasang Docker & Docker Compose Plugin
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verifikasi pemasangan
docker --version
docker compose version
```

### Langkah 2: Unduh Kode SIK-MBH ke VPS
```bash
# Buat folder aplikasi
mkdir -p /var/www/sik-babul-khaer
cd /var/www/sik-babul-khaer

# Clone repositori Anda
git clone https://github.com/USERNAME_ANDA/sik-babul-khaer.git .

# Salin file konfigurasi environment
cp .env.example .env
nano .env
```
*(Sesuaikan isi `.env` terutama `GEMINI_API_KEY` dan `NEXT_PUBLIC_APP_URL`, lalu simpan dengan menekan `Ctrl + O` -> `Enter` -> `Ctrl + X`)*.

### Langkah 3: Jalankan Kontainer dengan Docker Compose
Cukup jalankan satu perintah:
```bash
docker compose up -d --build
```
Docker akan:
1. Mengunduh image `node:22-alpine`.
2. Mengompilasi aplikasi ke format *standalone* berkinerja tinggi.
3. Menjalankan container `sik_mbh_masjid` di port `3000`.
4. Menyambungkan folder `./data` di VPS ke dalam container sehingga berkas `data/sik_mbh.sqlite` tersimpan permanen di VPS.

Untuk memeriksa status aplikasi:
```bash
docker compose ps
docker compose logs -f
```

---

## 4. Menghubungkan Domain Kustom Masjid & SSL HTTPS

Agar aplikasi memiliki alamat web yang elegan (contoh: `https://sik.babulkhaer.or.id`), ikuti langkah berikut:

### Langkah 1: Atur DNS Domain
Masuk ke panel domain masjid (misal: Rumahweb, Niagahoster, Cloudflare):
- **Jika memakai Vercel**:
  - Tambahkan DNS record: `CNAME` -> `sik` -> `cname.vercel-dns.com`
- **Jika memakai VPS**:
  - Tambahkan DNS record: `A Record` -> `sik` -> `IP_SERVER_VPS_ANDA`

### Langkah 2: Konfigurasi Nginx & SSL Gratis di VPS (Hanya untuk Opsi VPS)
Pasang Nginx dan Certbot di VPS:
```bash
apt install -y nginx certbot python3-certbot-nginx
```

Buat konfigurasi virtual host Nginx:
```bash
nano /etc/nginx/sites-available/sik-babul-khaer
```

Isi dengan konfigurasi berikut:
```nginx
server {
    server_name sik.babulkhaer.or.id;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan konfigurasi dan pasang SSL HTTPS gratis:
```bash
ln -s /etc/nginx/sites-available/sik-babul-khaer /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Pasang sertifikat SSL gratis Let's Encrypt
certbot --nginx -d sik.babulkhaer.or.id
```
Selesai! Website SIK-MBH kini dapat diakses dengan protokol gembok hijau aman: `https://sik.babulkhaer.or.id`.

---

## 5. Prosedur Pencadangan & Pemulihan (Disaster Recovery)

Untuk menjamin keamanan data masjid dari segala risiko insiden perangkat keras:

### Cara 1: Menggunakan Antarmuka SIK-MBH (Paling Mudah)
1. Masuk ke SIK-MBH.
2. Di Sidebar, klik menu **Akses & Keamanan** -> **Cadangan Data (Backup)**.
3. Klik tombol hijau **Unduh Berkas Cadangan (.json)**.
4. Simpan berkas hasil unduhan ke Google Drive resmi DKM.

### Cara 2: Salin Berkas Database Langsung dari VPS
Berkas database SQLite berada di:
`/var/www/sik-babul-khaer/data/sik_mbh.sqlite`

Anda dapat menyalin berkas ini sewaktu-waktu menggunakan aplikasi **FileZilla / WinSCP** atau perintah `scp`:
```bash
scp root@IP_SERVER_ANDA:/var/www/sik-babul-khaer/data/sik_mbh.sqlite ./cadangan_lokal.sqlite
```

---

## 6. Pembaruan Aplikasi di Kemudian Hari (Update Code)

Bila ada pembaruan fitur pada kode aplikasi di GitHub:

### Di Vercel:
Pembaruan berjalan otomatis (*Auto-deploy*) setiap kali Anda melakukan `git push` ke branch `main`.

### Di VPS:
Cukup masuk ke folder proyek dan jalankan perintah:
```bash
cd /var/www/sik-babul-khaer
git pull origin main
docker compose up -d --build
```
Data di dalam folder `data/sik_mbh.sqlite` akan tetap aman dan tidak akan terpengaruh oleh proses update!
