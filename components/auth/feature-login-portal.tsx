'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface FeaturePortalConfig {
  id: string;
  roleId: string;
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

const FEATURE_PORTALS: FeaturePortalConfig[] = [
  {
    id: 'superadmin-portal',
    roleId: 'usr-admin',
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
  {
    id: 'finance-portal',
    roleId: 'usr-bendahara',
    title: 'Perbendaharaan & Kas',
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
    badge: 'Buku Kas & Donatur',
    description: 'Pengelolaan kas operasional masjid, rekening satu pintu dana swadaya PHBI hasil Raker 2026, penerimaan ZISWAF, dan donatur rutin (ART Bagian Keenam Pasal 7).',
    features: [
      'Buku Kas Masuk & Kas Keluar',
      'Manajemen Donatur Rutin Bulanan',
      'Laporan Kas Mingguan Sholat Jumat',
      'Rekapitulasi Saldo Rekening Bank & Tunai',
    ],
  },
  {
    id: 'secretariat-portal',
    roleId: 'usr-sekretaris',
    title: 'Kesekretariatan & Surat',
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
      'Ekstraksi Notulensi & Action Items AI',
      'Format Cetak Standar Kop Surat Resmi A4',
    ],
  },
  {
    id: 'sarpras-portal',
    roleId: 'usr-sarpras',
    title: 'Sarana & Prasarana',
    roleTitle: 'Koordinator Sarpras (Bidang Ketua II)',
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
    badge: 'Inventaris Sarpras',
    description: 'Inventarisasi fisik fasilitas masjid, pemeliharaan AC Daikin, relokasi modul otomatis genset hasil Raker 2026, dan sarana ibadah (ART Bagian Ketujuh Pasal 9).',
    features: [
      'Katalog Aset (AC, Sound, Genset, Karpet)',
      'Labelisasi Kodefikasi & Lokasi Aset',
      'Peringatan Jadwal Servis Jatuh Tempo',
      'Catatan Riwayat Pemeliharaan Berkala',
    ],
  },
  {
    id: 'jamaah-portal',
    roleId: 'usr-kemasjidan',
    title: 'Peribadatan & Dakwah',
    roleTitle: 'Koordinator Peribadatan & Dakwah (Bidang Ketua I)',
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
    badge: 'Jadwal Sholat & Sensus',
    description: 'Pengelolaan jadwal sholat fardhu/Jumat, imam rawatib Rp1.5jt hasil Raker 2026, sensus kependudukan jamaah Blok AE RT 01-05, dan dakwah (ART Bagian Ketujuh Pasal 8).',
    features: [
      'Basis Data Sensus Warga RT 01 - RT 05',
      'Kategori Mustahiq, Lansia & Anak Yatim',
      'Impor & Ekspor Format Sensus Excel',
      'Integrasi Data Penerima Manfaat ZISWAF',
    ],
  },
  {
    id: 'leader-portal',
    roleId: 'usr-ketua',
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
    description: 'Pusat pimpinan eksekutif, penanggung jawab umum, otorisasi pengesahan surat dinas, disposisi kas satu pintu, dan LPJ tahunan (ART Bagian Ketiga Pasal 3).',
    features: [
      'Disposisi & Pengesahan Surat Satu Pintu',
      'Supervisi Kendali Seluruh Divisi',
      'Penyusunan & Agregasi LPJ Tahunan',
      'Kompilasi Evaluasi Kinerja 4 Pilar',
    ],
  },
  {
    id: 'audit-portal',
    roleId: 'usr-pengawas',
    title: 'Pengawasan & Pemeriksa',
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
    badge: 'Pengawasan & Audit',
    description: 'Pengawasan dan pemeriksaan independen atas penggunaan dana keuangan kas masjid, evaluasi capaian KPI 4 pilar, dan audit AD/ART (ART Bagian Kedua Pasal 2 ayat 3, Read-Only).',
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
  const { loginWithPin } = useAuth();

  const [selectedPortal, setSelectedPortal] = useState<FeaturePortalConfig | null>(null);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

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
                <span className="font-extrabold text-slate-900 text-base tracking-tight leading-none">
                  SIK-MBH
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Portal Layanan Divisi
                </span>
              </div>
              <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                Masjid Babul Khaer BTP Blok AE
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Title & Introduction Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sistem Informasi Terpadu & Terisolasi Berdasarkan Fitur Kerja</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Pilih Divisi & Masuk ke Fitur Kerja Anda
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Setiap pengurus memiliki ruang kerja khusus yang terisolasi. Pilih divisi tugas Anda di bawah ini dan masukkan PIN 6 digit untuk mengakses fitur yang sesuai.
          </p>
        </div>

        {/* Feature Cards Grid (6 Divisi) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURE_PORTALS.map((portal) => {
            const Icon = portal.icon;
            return (
              <div
                key={portal.id}
                onClick={() => handleSelectPortal(portal)}
                className={`group bg-white rounded-2xl p-6 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${portal.themeColor.border} ${portal.themeColor.bg}`}
              >
                {/* Top Badge & Icon */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft-sm transition-transform duration-200 group-hover:scale-105 ${portal.themeColor.iconBg}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs ${portal.themeColor.badgeBg}`}
                    >
                      {portal.badge}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {portal.title}
                  </h2>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <span>Amanah:</span>
                    <span className="font-semibold text-slate-800">{portal.roleTitle}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-normal">
                    PJ: {portal.officerName}
                  </p>

                  <p className="mt-3.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {portal.description}
                  </p>

                  {/* Bullet Highlights */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-1.5">
                    {portal.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="mt-6 pt-3">
                  <div
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white text-center flex items-center justify-center gap-2 transition-all shadow-soft-sm ${portal.themeColor.btnBg}`}
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
      </main>

      {/* Footer Credentials Info */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700">
              SIK-MBH v1.5 — Sistem Informasi DKM Masjid Babul Khaer
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
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-soft-lg border border-slate-200 overflow-hidden animate-slide-up sm:animate-none flex flex-col max-h-[92dvh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/70 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-soft-sm ${selectedPortal.themeColor.iconBg}`}
                >
                  <selectedPortal.icon className="w-6 h-6" />
                </div>
                <div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedPortal.themeColor.badgeBg}`}
                  >
                    {selectedPortal.badge}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedPortal.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {selectedPortal.officerName} ({selectedPortal.roleTitle})
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitPin} className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto overscroll-contain pb-[max(1rem,env(safe-area-inset-bottom))]">
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
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || pin.length !== 6 || lockoutSeconds !== null}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-soft-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-center ${selectedPortal.themeColor.btnBg}`}
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
