'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Wallet,
  FileText,
  Wrench,
  Users,
  ShieldCheck,
  BarChart3,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Database,
  BookOpen,
  Layers,
  PenTool,
  ArrowRightLeft,
  GraduationCap,
  HeartHandshake,
  Store,
  Hammer,
  Shield,
  Search,
  X,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useModalBackHandler } from '@/lib/back-button-handler';
import { UserRole } from '@/types/auth';

type PortalCategory =
  | 'ALL'
  | 'EKSEKUTIF'
  | 'SEKRETARIAT_KEUANGAN'
  | 'BIDANG_I'
  | 'BIDANG_II'
  | 'PENGAWAS';

interface FeaturePortalConfig {
  id: string;
  roleId: string;
  role: UserRole;
  category: Exclude<PortalCategory, 'ALL'>;
  title: string;
  roleTitle: string;
  officerName: string;
  icon: React.ElementType;
  themeColor: {
    bg: string;
    border: string;
    iconBg: string;
    iconColor: string;
    badgeBg: string;
    badgeText: string;
    btnBg: string;
    btnHover: string;
  };
  badge: string;
  description: string;
  features: string[];
}

const BASE_FEATURE_PORTALS: FeaturePortalConfig[] = [
  // 1. Super Admin
  {
    id: 'superadmin-portal',
    roleId: 'usr-admin',
    role: 'SUPER_ADMIN',
    category: 'EKSEKUTIF',
    title: 'Pusat Data & Super Admin',
    roleTitle: 'Administrator TI & Sistem DKM',
    officerName: 'Administrator Sistem (IT DKM)',
    icon: Database,
    themeColor: {
      bg: 'hover:bg-slate-900/5',
      border: 'hover:border-slate-800',
      iconBg: 'bg-slate-900 text-teal-300',
      iconColor: 'text-teal-400',
      badgeBg: 'bg-slate-900 border-slate-700 text-teal-300',
      badgeText: 'text-teal-300',
      btnBg: 'bg-slate-900 hover:bg-slate-800',
      btnHover: 'hover:bg-slate-800',
    },
    badge: 'Turso, Backup & Pengguna',
    description: 'Hak akses administratif penuh: sinkronisasi database cloud Turso, pencadangan/pemulihan SQLite, manajemen akun pengurus, dan pengaturan PIN keamanan.',
    features: [
      'Sinkronisasi Database Cloud Turso LibSQL',
      'Pencadangan & Pemulihan (Backup/Restore)',
      'Manajemen Pengguna & Tambah Akun',
      'Pengaturan & Reset PIN Pengurus',
    ],
  },

  // 2. Ketua Umum
  {
    id: 'leader-portal',
    roleId: 'usr-ketua',
    role: 'KETUA_UMUM',
    category: 'EKSEKUTIF',
    title: 'Pusat Kendali & Pimpinan',
    roleTitle: 'Ketua Umum DKM',
    officerName: 'Drs. Muhammad Hasri, M. Hum.',
    icon: ShieldCheck,
    themeColor: {
      bg: 'hover:bg-blue-50/40',
      border: 'hover:border-blue-300',
      iconBg: 'bg-blue-100 text-blue-800',
      iconColor: 'text-blue-800',
      badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
      badgeText: 'text-blue-800',
      btnBg: 'bg-blue-700 hover:bg-blue-800',
      btnHover: 'hover:bg-blue-800',
    },
    badge: 'Pimpinan & Disposisi',
    description: 'Pusat pimpinan eksekutif, penanggung jawab umum, otorisasi pengesahan surat dinas, disposisi pencairan kas satu pintu, dan agregasi LPJ (ART Pasal 3).',
    features: [
      'Disposisi & Pengesahan Surat Satu Pintu',
      'Supervisi Kendali Seluruh Divisi',
      'Penyusunan & Agregasi LPJ Tahunan',
      'Monitoring Granular 74 Program Kerja',
    ],
  },

  // 3. Ketua I
  {
    id: 'ketua-1-portal',
    roleId: 'usr-ketua-1',
    role: 'KETUA_I',
    category: 'EKSEKUTIF',
    title: 'Bidang I: Keagamaan, Pendidikan & Organisasi',
    roleTitle: 'Ketua I DKM (Bidang I)',
    officerName: 'Drs. H. Suardi, M. Pd.',
    icon: BookOpen,
    themeColor: {
      bg: 'hover:bg-sky-50/40',
      border: 'hover:border-sky-300',
      iconBg: 'bg-sky-100 text-sky-800',
      iconColor: 'text-sky-800',
      badgeBg: 'bg-sky-50 border-sky-200 text-sky-800',
      badgeText: 'text-sky-800',
      btnBg: 'bg-sky-700 hover:bg-sky-800',
      btnHover: 'hover:bg-sky-800',
    },
    badge: 'Supervisi Dakwah & Pendidikan',
    description: 'Membawahi dan mengoordinasikan Seksi Peribadatan-Dakwah, Organisasi-Pendidikan-Remaja, Humas-Sosial/ZISWAF, dan Pemberdayaan Perempuan (ART Pasal 4).',
    features: [
      'Supervisi Seksi Peribadatan & Dakwah (Seksi a)',
      'Koordinasi Modul TPA & Remaja Masjid (Seksi b)',
      'Pengawasan ZISWAF, SSS & Mustahiq (Seksi c)',
      'Pembinaan UMKM & Majelis Ta\'lim (Seksi d)',
    ],
  },

  // 4. Ketua II
  {
    id: 'ketua-2-portal',
    roleId: 'usr-ketua-2',
    role: 'KETUA_II',
    category: 'EKSEKUTIF',
    title: 'Bidang II: Pembangunan & Sarana Prasarana',
    roleTitle: 'Ketua II DKM (Bidang II)',
    officerName: 'H. Muh. Nancha Pattanang, S. E.',
    icon: Layers,
    themeColor: {
      bg: 'hover:bg-amber-50/40',
      border: 'hover:border-amber-300',
      iconBg: 'bg-amber-100 text-amber-800',
      iconColor: 'text-amber-800',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
      badgeText: 'text-amber-800',
      btnBg: 'bg-amber-700 hover:bg-amber-800',
      btnHover: 'hover:bg-amber-800',
    },
    badge: 'Supervisi Sarpras & Proyek',
    description: 'Membawahi dan mengoordinasikan Seksi Pembangunan, Seksi Sarana dan Prasarana, serta Seksi Keamanan dan Kebersihan sesuai ART Pasal 4.',
    features: [
      'Supervisi Tracker Proyek Fisik (Seksi e)',
      'Pengawasan Inventarisasi & Servis Sarpras (Seksi f)',
      'Monitoring Keamanan & Kebersihan (Seksi g)',
      'Verifikasi Kebutuhan Pengadaan Sarana Ibadah',
    ],
  },

  // 5. Sekretaris Umum
  {
    id: 'secretariat-portal',
    roleId: 'usr-sekretaris',
    role: 'SEKRETARIS',
    category: 'SEKRETARIAT_KEUANGAN',
    title: 'Kesekretariatan & Tata Usaha',
    roleTitle: 'Sekretaris Umum DKM',
    officerName: 'Ir. Muhammad Natsir, S.T.',
    icon: FileText,
    themeColor: {
      bg: 'hover:bg-indigo-50/40',
      border: 'hover:border-indigo-300',
      iconBg: 'bg-indigo-100 text-indigo-700',
      iconColor: 'text-indigo-700',
      badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      badgeText: 'text-indigo-700',
      btnBg: 'bg-indigo-600 hover:bg-indigo-700',
      btnHover: 'hover:bg-indigo-700',
    },
    badge: 'Persuratan & Notulensi',
    description: 'Tata kelola persuratan dinas resmi, e-arsip digital, ekstraksi notulensi rapat pleno AI, dan paraf SK sebelum diteken Ketua Umum (ART Bagian Kelima Pasal 6).',
    features: [
      'E-Arsip Surat Keluar & Lampau',
      'Generator Draf Surat Resmi AI (Gemini)',
      'Ekstraksi Notulensi & Rapat Terpadu AI',
      'Penerbitan SK Kepanitiaan Ad-hoc',
    ],
  },

  // 6. Wakil Sekretaris
  {
    id: 'wakil-sekretaris-portal',
    roleId: 'usr-wakil-sekretaris',
    role: 'WAKIL_SEKRETARIS',
    category: 'SEKRETARIAT_KEUANGAN',
    title: 'Wakil Kesekretariatan',
    roleTitle: 'Wakil Sekretaris DKM',
    officerName: 'Abdi Negara, S. Kom.',
    icon: PenTool,
    themeColor: {
      bg: 'hover:bg-cyan-50/40',
      border: 'hover:border-cyan-300',
      iconBg: 'bg-cyan-100 text-cyan-700',
      iconColor: 'text-cyan-700',
      badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
      badgeText: 'text-cyan-700',
      btnBg: 'bg-cyan-600 hover:bg-cyan-700',
      btnHover: 'hover:bg-cyan-700',
    },
    badge: 'Administrasi Surat & Notulensi',
    description: 'Membantu Sekretaris Umum dalam tata kelola administrasi surat dinas resmi, e-arsip berkas digital, notulensi AI, dan kepanitiaan ad-hoc.',
    features: [
      'Pendampingan Administrasi Surat Dinas',
      'Digitalisasi E-Arsip Dokumen Digital',
      'Pencatatan Presensi Rapat & Notulensi',
      'Pengelolaan Pengumuman & Dokumen Resmi',
    ],
  },

  // 7. Bendahara Umum
  {
    id: 'finance-portal',
    roleId: 'usr-bendahara',
    role: 'BENDAHARA',
    category: 'SEKRETARIAT_KEUANGAN',
    title: 'Perbendaharaan & Kas Utama',
    roleTitle: 'Bendahara Umum DKM',
    officerName: 'H. Sahali',
    icon: Wallet,
    themeColor: {
      bg: 'hover:bg-emerald-50/40',
      border: 'hover:border-emerald-300',
      iconBg: 'bg-emerald-100 text-emerald-700',
      iconColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      badgeText: 'text-emerald-700',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700',
      btnHover: 'hover:bg-emerald-700',
    },
    badge: 'Buku Kas Satu Pintu',
    description: 'Pengelolaan kas operasional masjid, rekening satu pintu dana swadaya PHBI hasil Raker 2026, penerimaan ZISWAF, dan donatur rutin (ART Bagian Keenam Pasal 7).',
    features: [
      'Buku Kas Masuk & Kas Keluar Satu Pintu',
      'Manajemen Donatur Rutin Bulanan',
      'Laporan Kas Mingguan Sholat Jumat',
      'Rekonsiliasi Swadaya PHBI Raker 2026',
    ],
  },

  // 8. Wakil Bendahara
  {
    id: 'wakil-bendahara-portal',
    roleId: 'usr-wakil-bendahara',
    role: 'WAKIL_BENDAHARA',
    category: 'SEKRETARIAT_KEUANGAN',
    title: 'Wakil Perbendaharaan',
    roleTitle: 'Wakil Bendahara DKM',
    officerName: 'Jumadil Rachmat, S. T.',
    icon: ArrowRightLeft,
    themeColor: {
      bg: 'hover:bg-teal-50/40',
      border: 'hover:border-teal-300',
      iconBg: 'bg-teal-100 text-teal-700',
      iconColor: 'text-teal-700',
      badgeBg: 'bg-teal-50 border-teal-200 text-teal-800',
      badgeText: 'text-teal-700',
      btnBg: 'bg-teal-600 hover:bg-teal-700',
      btnHover: 'hover:bg-teal-700',
    },
    badge: 'Kas Operasional & Donatur',
    description: 'Membantu Bendahara Umum dalam penatausahaan kas umum masjid, pencatatan mutasi transaksi harian, dan rekonsiliasi donatur tetap bulanan.',
    features: [
      'Pencatatan Transaksi Kas Masuk & Keluar',
      'Pendampingan Rekonsiliasi Kas Bank & Tunai',
      'Monitoring Penerimaan Donatur Rutin',
      'Penyusunan Draf Laporan Kas Berkala',
    ],
  },

  // 9. Seksi Peribadatan & Dakwah
  {
    id: 'jamaah-portal',
    roleId: 'usr-kemasjidan',
    role: 'SEKSI_PERIBADATAN_DAKWAH',
    category: 'BIDANG_I',
    title: 'Peribadatan & Dakwah',
    roleTitle: 'Koordinator Seksi Peribadatan & Dakwah',
    officerName: 'Drs. Manai, M.M.',
    icon: Users,
    themeColor: {
      bg: 'hover:bg-teal-50/40',
      border: 'hover:border-teal-300',
      iconBg: 'bg-teal-100 text-teal-700',
      iconColor: 'text-teal-700',
      badgeBg: 'bg-teal-50 border-teal-200 text-teal-800',
      badgeText: 'text-teal-700',
      btnBg: 'bg-teal-600 hover:bg-teal-700',
      btnHover: 'hover:bg-teal-700',
    },
    badge: 'Jadwal Sholat, Khatib & Sensus',
    description: 'Pengelolaan jadwal sholat fardhu/Jumat, imam rawatib Rp1.5jt hasil Raker 2026, sensus kependudukan jamaah Blok AE RT 01-05, dan dakwah (ART Pasal 8 poin a).',
    features: [
      'Jadwal Sholat Fardhu & Petugas Jumat',
      'Kalender Kajian Rutin & Ramadhan',
      'Basis Data Sensus Warga RT 01 - RT 05',
      'Database Asatidz & Muballigh Makassar',
    ],
  },

  // 10. Seksi Organisasi, Pendidikan & Remaja
  {
    id: 'organisasi-portal',
    roleId: 'usr-seksi-organisasi',
    role: 'SEKSI_ORGANISASI_PENDIDIKAN_REMAJA',
    category: 'BIDANG_I',
    title: 'Organisasi, TPA & Remaja Masjid',
    roleTitle: 'Koordinator Seksi Organisasi, Pendidikan & Remaja',
    officerName: 'Arjun, S. H.',
    icon: GraduationCap,
    themeColor: {
      bg: 'hover:bg-lime-50/40',
      border: 'hover:border-lime-300',
      iconBg: 'bg-lime-100 text-lime-800',
      iconColor: 'text-lime-800',
      badgeBg: 'bg-lime-50 border-lime-200 text-lime-800',
      badgeText: 'text-lime-800',
      btnBg: 'bg-lime-700 hover:bg-lime-800',
      btnHover: 'hover:bg-lime-800',
    },
    badge: 'TPA Santri & Kaderisasi',
    description: 'Pengelolaan pembinaan generasi muda, database santri TPA, monitoring pembayaran SPP, jadwal wisuda, dan kaderisasi remaja masjid (ART Pasal 8 poin b).',
    features: [
      'Database Santri TPA & Ustadz/Ustadzah',
      'Pencatatan Pembayaran SPP Syahriah Santri',
      'Jadwal Ujian Munaqasyah & Wisuda Santri',
      'Kaderisasi Remaja Masjid & Pembinaan Pemuda',
    ],
  },

  // 11. Seksi Humas & Sosial (ZISWAF)
  {
    id: 'humas-portal',
    roleId: 'usr-seksi-humas',
    role: 'SEKSI_HUMAS_SOSIAL',
    category: 'BIDANG_I',
    title: 'Humas & Sosial Kemasyarakatan',
    roleTitle: 'Koordinator Seksi Humas & Sosial (ZISWAF)',
    officerName: 'Drs. H. Muh. Rusdi Lahajji, M. Pd.',
    icon: HeartHandshake,
    themeColor: {
      bg: 'hover:bg-rose-50/40',
      border: 'hover:border-rose-300',
      iconBg: 'bg-rose-100 text-rose-700',
      iconColor: 'text-rose-700',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
      badgeText: 'text-rose-700',
      btnBg: 'bg-rose-600 hover:bg-rose-700',
      btnHover: 'hover:bg-rose-700',
    },
    badge: 'ZISWAF, SSS & ATM Beras',
    description: 'Penggalangan dan penyaluran ZISWAF (zakat, infaq, shadaqah, waqaf), kaleng Sedekah Subuh (SSS), ATM Beras dhuafa, dan lelang infaq (ART Pasal 8 poin c).',
    features: [
      'Penyaluran Zakat, Infaq & Shadaqah (ZISWAF)',
      'Pengelolaan Kaleng Sedekah Subuh (SSS)',
      'Distribusi ATM Beras untuk Kaum Dhuafa',
      'Lelang Infaq Barakah & Kemitraan UPZ BAZNAS',
    ],
  },

  // 12. Seksi Pemberdayaan Perempuan & UMKM
  {
    id: 'perempuan-portal',
    roleId: 'usr-seksi-perempuan',
    role: 'SEKSI_PEMBERDAYAAN_PEREMPUAN',
    category: 'BIDANG_I',
    title: 'Pemberdayaan Perempuan & UMKM',
    roleTitle: 'Koordinator Seksi Pemberdayaan Perempuan',
    officerName: 'Andi Waru Paluseri, S. Pd., M. Si.',
    icon: Store,
    themeColor: {
      bg: 'hover:bg-fuchsia-50/40',
      border: 'hover:border-fuchsia-300',
      iconBg: 'bg-fuchsia-100 text-fuchsia-800',
      iconColor: 'text-fuchsia-800',
      badgeBg: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800',
      badgeText: 'text-fuchsia-800',
      btnBg: 'bg-fuchsia-700 hover:bg-fuchsia-800',
      btnHover: 'hover:bg-fuchsia-800',
    },
    badge: 'Gerai Muslimah & Majelis Ta\'lim',
    description: 'Pemberdayaan muslimah, majelis ta\'lim wanita, pembinaan usaha mandiri warga melalui Gerai Muslimah dan pinjaman bergulir Qardhul Hasan (ART Pasal 8 poin d).',
    features: [
      'Gerai Muslimah & Binaan UMKM Warga',
      'Pengelolaan Pinjaman Bergulir Qardhul Hasan',
      'Jadwal Pengajian Majelis Ta\'lim Muslimah',
      'Pelatihan Keterampilan & Wirausaha Muslimah',
    ],
  },

  // 13. Seksi Pembangunan
  {
    id: 'pembangunan-portal',
    roleId: 'usr-seksi-pembangunan',
    role: 'SEKSI_PEMBANGUNAN',
    category: 'BIDANG_II',
    title: 'Pembangunan Fisik Masjid',
    roleTitle: 'Koordinator Seksi Pembangunan',
    officerName: 'Kaharuddin, S. Pd.',
    icon: Hammer,
    themeColor: {
      bg: 'hover:bg-orange-50/40',
      border: 'hover:border-orange-300',
      iconBg: 'bg-orange-100 text-orange-800',
      iconColor: 'text-orange-800',
      badgeBg: 'bg-orange-50 border-orange-200 text-orange-800',
      badgeText: 'text-orange-800',
      btnBg: 'bg-orange-600 hover:bg-orange-700',
      btnHover: 'hover:bg-orange-700',
    },
    badge: 'Tracker Proyek & Renovasi',
    description: 'Perencanaan dan pelaksanaan proyek fisik (menara masjid, plafon, kanopi, drainase) sesuai ART Pasal 8 poin a bagian Ketua II.',
    features: [
      'Tracking Proyek Renovasi (Menara, Plafon, dll)',
      'Realisasi Anggaran vs Alokasi Biaya Fisik',
      'Manajemen Kontraktor & Vendor Lapangan',
      'Milestone Target Penyelesaian Fisik',
    ],
  },

  // 14. Seksi Sarana & Prasarana
  {
    id: 'sarpras-portal',
    roleId: 'usr-sarpras',
    role: 'SEKSI_SARPRAS',
    category: 'BIDANG_II',
    title: 'Sarana & Prasarana',
    roleTitle: 'Koordinator Sarana & Prasarana',
    officerName: 'Faisal T. Parussengi, S.S.',
    icon: Wrench,
    themeColor: {
      bg: 'hover:bg-amber-50/40',
      border: 'hover:border-amber-300',
      iconBg: 'bg-amber-100 text-amber-800',
      iconColor: 'text-amber-800',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
      badgeText: 'text-amber-800',
      btnBg: 'bg-amber-600 hover:bg-amber-700',
      btnHover: 'hover:bg-amber-700',
    },
    badge: 'Inventaris & Pemeliharaan',
    description: 'Inventarisasi fisik fasilitas masjid, pemeliharaan AC Daikin, relokasi modul otomatis genset hasil Raker 2026, dan sarana ibadah (ART Bagian Ketujuh Pasal 9).',
    features: [
      'Katalog Aset (AC Daikin, Sound, Genset, Karpet)',
      'Labelisasi Kodefikasi & Lokasi Aset',
      'Peringatan Jadwal Servis Jatuh Tempo',
      'Catatan Riwayat Pemeliharaan Berkala',
    ],
  },

  // 15. Seksi Keamanan & Kebersihan
  {
    id: 'keamanan-portal',
    roleId: 'usr-seksi-keamanan',
    role: 'SEKSI_KEAMANAN_KEBERSIHAN',
    category: 'BIDANG_II',
    title: 'Keamanan & Kebersihan',
    roleTitle: 'Koordinator Seksi Keamanan & Kebersihan',
    officerName: 'Firdaus Ramlan',
    icon: Shield,
    themeColor: {
      bg: 'hover:bg-slate-100/50',
      border: 'hover:border-slate-400',
      iconBg: 'bg-slate-200 text-slate-800',
      iconColor: 'text-slate-800',
      badgeBg: 'bg-slate-100 border-slate-300 text-slate-800',
      badgeText: 'text-slate-800',
      btnBg: 'bg-slate-700 hover:bg-slate-800',
      btnHover: 'hover:bg-slate-800',
    },
    badge: 'Ketertiban & Dokumentasi',
    description: 'Pengawasan ketertiban lingkungan masjid, kenyamanan ibadah jamaah, inspeksi kebersihan fasilitas wudhu, dan galeri dokumentasi (ART Pasal 8 poin c).',
    features: [
      'Jadwal Pengawasan Ketertiban Lingkungan',
      'Inspeksi Kebersihan Area Wudhu & Sholat',
      'Galeri Dokumentasi Foto Kegiatan Masjid',
      'Protokol Keamanan & Sarana Penunjang',
    ],
  },

  // 16. Dewan Pengawas
  {
    id: 'audit-portal',
    roleId: 'usr-pengawas',
    role: 'DEWAN_PENGAWAS',
    category: 'PENGAWAS',
    title: 'Dewan Pengawas & Pemeriksa',
    roleTitle: 'Koordinator Dewan Pengawas & Pemeriksa',
    officerName: 'Dr. Andi Fiptar Abdi Alam, M. Si.',
    icon: BarChart3,
    themeColor: {
      bg: 'hover:bg-purple-50/40',
      border: 'hover:border-purple-300',
      iconBg: 'bg-purple-100 text-purple-800',
      iconColor: 'text-purple-800',
      badgeBg: 'bg-purple-50 border-purple-200 text-purple-800',
      badgeText: 'text-purple-800',
      btnBg: 'bg-purple-700 hover:bg-purple-800',
      btnHover: 'hover:bg-purple-800',
    },
    badge: 'Pengawasan & Audit (Read-Only)',
    description: 'Pengawasan dan pemeriksaan independen atas penggunaan dana keuangan kas masjid, evaluasi capaian KPI 4 pilar, dan audit AD/ART (ART Bagian Kedua Pasal 2 ayat 3).',
    features: [
      'Evaluasi Kinerja 4 Pilar (KPI Scorecard)',
      'Pratinjau Dokumen LPJ Resmi Cetak A4',
      'Inspeksi Log Audit Aktivitas Sistem',
      'Akses Terlindungi Read-Only Independen',
    ],
  },
];

interface FeatureLoginPortalProps {
  onLoginSuccess?: () => void;
}

export default function FeatureLoginPortal({ onLoginSuccess }: FeatureLoginPortalProps) {
  const { users, loginWithPin } = useAuth();

  const [activeCategory, setActiveCategory] = useState<PortalCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPortal, setSelectedPortal] = useState<FeaturePortalConfig | null>(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  // Hardware Back Button handler on Android / PWA mobile
  useModalBackHandler(Boolean(selectedPortal), () => setSelectedPortal(null), 'login-pin-modal');

  // Dynamically enrich portal configs with live users list from server
  const portals = useMemo(() => {
    const list: FeaturePortalConfig[] = BASE_FEATURE_PORTALS.map((base) => {
      const liveUser = users.find((u) => u.id === base.roleId);
      if (liveUser) {
        return {
          ...base,
          officerName: liveUser.name || base.officerName,
          roleTitle: liveUser.title || base.roleTitle,
        };
      }
      return base;
    });

    // Check if there are any non-official custom accounts created in DB
    const baseIds = new Set(BASE_FEATURE_PORTALS.map((p) => p.roleId));
    users.forEach((extraUser) => {
      if (!baseIds.has(extraUser.id)) {
        list.push({
          id: `custom-portal-${extraUser.id}`,
          roleId: extraUser.id,
          role: extraUser.role,
          category: 'BIDANG_I',
          title: extraUser.title || extraUser.name,
          roleTitle: extraUser.roleLabel || extraUser.role,
          officerName: extraUser.name,
          icon: Users,
          themeColor: {
            bg: 'hover:bg-slate-50',
            border: 'hover:border-slate-300',
            iconBg: 'bg-slate-100 text-slate-700',
            iconColor: 'text-slate-700',
            badgeBg: 'bg-slate-100 border-slate-200 text-slate-700',
            badgeText: 'text-slate-700',
            btnBg: 'bg-slate-800 hover:bg-slate-900',
            btnHover: 'hover:bg-slate-900',
          },
          badge: extraUser.department || 'Pengurus Staf',
          description: extraUser.bio || `Akun staf khusus pengurus DKM Babul Khaer: ${extraUser.name}.`,
          features: ['Akses Ruang Kerja Terisolasi', 'Pencatatan Aktivitas Berdasarkan Peran'],
        });
      }
    });

    return list;
  }, [users]);

  // Filter portals by activeCategory and searchQuery
  const filteredPortals = useMemo(() => {
    return portals.filter((p) => {
      const matchCat = activeCategory === 'ALL' || p.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.roleTitle.toLowerCase().includes(q) ||
        p.officerName.toLowerCase().includes(q) ||
        p.badge.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [portals, activeCategory, searchQuery]);

  const categoryTabs = [
    { id: 'ALL', label: `Semua Divisi (${portals.length})` },
    { id: 'EKSEKUTIF', label: 'Pimpinan & Pengarah' },
    { id: 'SEKRETARIAT_KEUANGAN', label: 'Kesekretariatan & Keuangan' },
    { id: 'BIDANG_I', label: 'Bidang I (Dakwah, TPA & Sosial)' },
    { id: 'BIDANG_II', label: 'Bidang II (Pembangunan & Sarpras)' },
    { id: 'PENGAWAS', label: 'Dewan Pengawas' },
  ];

  const handleSelectPortal = (portal: FeaturePortalConfig) => {
    setSelectedPortal(portal);
    setPin('');
    setErrorMessage(null);
    setLockoutSeconds(null);
  };

  const handleCloseModal = () => {
    if (isLoading) return;
    setSelectedPortal(null);
    setPin('');
    setErrorMessage(null);
    setLockoutSeconds(null);
  };

  const handleSubmitPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortal) return;

    if (pin.trim().length !== 6) {
      setErrorMessage('PIN harus tepat 6 digit angka');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await loginWithPin(selectedPortal.roleId, pin);

      if (result.success) {
        setSelectedPortal(null);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        if (result.remainingSeconds) {
          setLockoutSeconds(result.remainingSeconds);
          setErrorMessage(
            `Terlalu banyak percobaan salah. Akun dikunci sementara. Silakan tunggu ${result.remainingSeconds} detik.`
          );
        } else if (result.remainingAttempts !== undefined) {
          setErrorMessage(
            `PIN tidak sesuai. Sisa kesempatan: ${result.remainingAttempts} kali sebelum akun dikunci.`
          );
        } else {
          setErrorMessage(result.error || 'PIN otentikasi tidak valid');
        }
      }
    } catch {
      setErrorMessage('Terjadi kendala saat menghubungi server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Header Branding */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-20 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 border border-emerald-200/80 shadow-soft-sm flex items-center justify-center shrink-0">
              <Image
                src="/logo-babul-khaer.png"
                alt="Logo Masjid Babul Khaer"
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-slate-900">
                  SIK-MBH
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Portal Resmi Pengurus DKM
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                Masjid Babul Khaer BTP Blok AE Makassar (Periode 2026–2029)
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium text-slate-700">Tamalanrea, Kota Makassar</span>
          </div>
        </div>
      </header>

      {/* Main Feature Gateway Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 flex-1 w-full">
        {/* Title & Introduction Banner */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sistem Informasi Terpadu Berdasarkan AD/ART 2020 & SK PC DMI No. 13/2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Pilih Divisi & Masuk ke Fitur Kerja Anda
          </h1>
          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Tersedia <strong>{portals.length} ruang kerja resmi</strong> dengan wewenang yang terisolasi. Silakan pilih jabatan tugas Anda di bawah ini dan masukkan PIN otentikasi 6 digit.
          </p>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="max-w-4xl mx-auto mb-8 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pejabat, divisi, jabatan, atau kata kunci..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white border border-slate-200 shadow-soft-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {categoryTabs.map((tab) => {
              const isActive = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategory(tab.id as PortalCategory)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-soft-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feature Cards Grid (16 Divisi Resmi) */}
        {filteredPortals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto shadow-soft-sm">
            <Filter className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">Divisi Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 mt-1">
              Tidak ada akun pengurus yang sesuai dengan kata kunci pencarian &quot;{searchQuery}&quot;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredPortals.map((portal) => {
              const Icon = portal.icon;
              return (
                <div
                  key={portal.id}
                  onClick={() => handleSelectPortal(portal)}
                  className={`group bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${portal.themeColor.border} ${portal.themeColor.bg}`}
                >
                  {/* Top Badge & Icon */}
                  <div>
                    <div className="flex items-start justify-between gap-2.5 mb-3.5">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-soft-sm transition-transform duration-200 group-hover:scale-105 ${portal.themeColor.iconBg}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs truncate max-w-[160px] ${portal.themeColor.badgeBg}`}
                        title={portal.badge}
                      >
                        {portal.badge}
                      </span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                      {portal.title}
                    </h2>
                    <div className="mt-1 flex items-baseline gap-1.5 text-xs text-slate-500 font-medium">
                      <span className="shrink-0">Amanah:</span>
                      <span className="font-semibold text-slate-800 truncate" title={portal.roleTitle}>
                        {portal.roleTitle}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium truncate mt-0.5" title={portal.officerName}>
                      PJ: <strong>{portal.officerName}</strong>
                    </p>

                    <p className="mt-2.5 text-xs text-slate-500 leading-relaxed line-clamp-2">
                      {portal.description}
                    </p>

                    {/* Bullet Highlights */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
                      {portal.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Button */}
                  <div className="mt-5 pt-3">
                    <div
                      className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-white text-center flex items-center justify-center gap-2 transition-all shadow-soft-sm ${portal.themeColor.btnBg}`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Masuk ke Fitur Ini</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer Credentials Info */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700">
              SIK-MBH v1.6 — Sistem Informasi DKM Masjid Babul Khaer
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Dilindungi Otentikasi Bcrypt, Session Cookie HttpOnly, dan Pangkalan Data Turso LibSQL Cloud.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>PIN Pengurus bersifat pribadi & rahasia</span>
          </div>
        </div>
      </footer>

      {/* ----------------------------------------------------------- */}
      {/* Modal Input PIN untuk Divisi yang Dipilih                    */}
      {/* ----------------------------------------------------------- */}
      {selectedPortal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-hidden">
          <div
            className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-soft-xl border border-slate-200 overflow-hidden animate-slide-up md:animate-none flex flex-col max-h-[92dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft-sm shrink-0 ${selectedPortal.themeColor.iconBg}`}
                >
                  <selectedPortal.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedPortal.themeColor.badgeBg}`}
                  >
                    {selectedPortal.badge}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5 truncate">
                    {selectedPortal.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium truncate">
                    {selectedPortal.officerName} ({selectedPortal.roleTitle})
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitPin} className="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Masukkan PIN 6 Digit Pengurus
                </label>
                <div className="relative">
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoFocus
                    disabled={isLoading || lockoutSeconds !== null}
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPin(val);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="Contoh: 123456"
                    className="w-full tracking-widest text-center text-xl font-bold px-4 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white disabled:bg-slate-100 text-slate-900"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 text-center">
                  PIN otentikasi unik 6 digit terdaftar pada sistem DKM
                </p>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col-reverse md:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleCloseModal}
                  className="w-full md:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-center flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || pin.length !== 6 || lockoutSeconds !== null}
                  className={`w-full md:w-auto px-5 py-2.5 min-h-[44px] rounded-xl text-xs font-bold text-white shadow-soft-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center ${selectedPortal.themeColor.btnBg}`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Masuk ke Fitur</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
