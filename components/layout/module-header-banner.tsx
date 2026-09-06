'use client';

import React from 'react';
import Image from 'next/image';
import {
  Sparkles,
  Eye,
  Plus,
  Wrench,
  HeartHandshake,
  Archive,
} from 'lucide-react';
import { AppNavTab } from '@/types/navigation';

interface ModuleHeaderBannerProps {
  activeTab: AppNavTab;
  isReadOnly: boolean;
  canMutateTab: (tab: AppNavTab) => boolean;
  onOpenCreateLetter: () => void;
  onOpenCreateJamaah: () => void;
  onOpenCreateTransaction: () => void;
  onOpenCreateDonor: () => void;
  onOpenCreateAsset: () => void;
  onOpenArchiveLetterModal: () => void;
  onOpenFridayReport: () => void;
  onOpenMustahiq: () => void;
  onOpenMinutes: () => void;
  assetStats?: { maintenanceDueCount?: number } | null;
  onFilterAssetOnlyDue: () => void;
}

export function ModuleHeaderBanner({
  activeTab,
  isReadOnly,
  canMutateTab,
  onOpenCreateLetter,
  onOpenCreateJamaah,
  onOpenCreateTransaction,
  onOpenCreateDonor,
  onOpenCreateAsset,
  onOpenArchiveLetterModal,
  onOpenFridayReport,
  onOpenMustahiq,
  onOpenMinutes,
  assetStats,
  onFilterAssetOnlyDue,
}: ModuleHeaderBannerProps) {
  const isDashboardTab = activeTab === 'dashboard';
  const isReportsTab = activeTab === 'reports';
  const isApprovalsTab = activeTab === 'approvals';
  const isFinanceTab = activeTab === 'finance';
  const isDonorsTab = activeTab === 'donors';
  const isAssetTab = activeTab === 'assets';
  const isDakwahTab = activeTab === 'dakwah';
  const isJamaahTab = activeTab === 'jamaah' || activeTab === 'mustahiq';

  return (
    <div
      className={`text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden transition-all duration-300 ${
        isReportsTab || isApprovalsTab
          ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 shadow-indigo-950/20'
          : isFinanceTab || isDonorsTab
          ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 shadow-amber-950/20'
          : isAssetTab
          ? 'bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 shadow-slate-950/20'
          : isDakwahTab
          ? 'bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 shadow-teal-950/20'
          : isJamaahTab
          ? 'bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 shadow-teal-950/20'
          : 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 shadow-emerald-950/20'
      }`}
    >
      {/* Watermark Logo */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden md:block select-none">
        <Image
          src="/logo-babul-khaer.png"
          alt="Watermark Logo Masjid Babul Khaer"
          width={240}
          height={240}
          className="object-contain filter brightness-150"
        />
      </div>

      <div className="relative z-10 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-3 border border-white/20 backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>
            {isDashboardTab
              ? 'Pusat Kendali Operasional & Informasi Terpadu'
              : isReportsTab
              ? 'Modul Laporan Pertanggungjawaban (LPJ) & Evaluasi 4 Pilar'
              : isApprovalsTab
              ? 'Alur Pengesahan Satu Pintu (Approval & Disposisi Ketua Umum)'
              : isFinanceTab
              ? 'Pengelolaan Keuangan & Swadaya PHBI Satu Pintu'
              : isDonorsTab
              ? 'Kelola Infaq & Donatur Rutin Masjid Babul Khaer'
              : isDakwahTab
              ? 'Seksi Peribadatan & Dakwah: Khatib Jumat, Imam Rawatib Rp1.5jt, Kajian, & Ramadhan'
              : isAssetTab
              ? 'Inventarisasi Sarana Prasarana & Peringatan Servis Berkala'
              : isJamaahTab
              ? 'Sistem Basis Data Kependudukan & Jamaah Blok AE'
              : 'Administrasi Persuratan Resmi & Kesekretariatan DKM'}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-white/95 p-1 shadow-soft-sm border border-white/40 flex items-center justify-center shrink-0">
            <Image
              src="/logo-babul-khaer.png"
              alt="Logo Masjid Babul Khaer"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white leading-tight">
              {isDashboardTab
                ? 'Selamat Datang, Pengurus DKM Babul Khaer'
                : 'Dewan Kemakmuran Masjid Babul Khaer'}
            </h1>
            <p className="text-xs text-emerald-200 font-medium">
              Kompleks BTP Blok AE, Tamalanrea, Makassar • SIK-MBH Terpadu
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-100/90 leading-relaxed">
          {isDashboardTab
            ? 'Pusat kendali operasional Masjid Babul Khaer BTP Blok AE Tamalanrea Makassar. Mengintegrasikan otomasi administrasi surat dinas, basis data sensus jamaah, transparansi kas & swadaya PHBI, hingga jadwal pemeliharaan inventaris fisik sarpras.'
            : isReportsTab
            ? 'Kompilasi otomatis data pertanggungjawaban tahunan dari 4 pilar bidang DKM, evaluasi kinerja oleh Dewan Penasehat, serta draf dokumen resmi siap cetak format A4.'
            : isApprovalsTab
            ? 'Alur disposisi dan pengesahan resmi oleh Ketua Umum untuk penerbitan surat dinas keluar, pencairan anggaran swadaya PHBI, pengadaan sarpras, dan draf LPJ.'
            : isFinanceTab
            ? 'Transparansi mutasi kas DKM Kompleks BTP Blok AE: Pemisahan tegas antara Kas Operasional Rutin, Dana Swadaya Kegiatan PHBI (satu pintu), dan Rekapitulasi ZISWAF umat.'
            : isDonorsTab
            ? 'Manajemen donatur tetap bulanan (infaq operasional, beasiswa yatim, zakat mal, PHBI) dengan integrasi 1-klik setor kas masjid dan pemantauan tertib komitmen donasi.'
            : isDakwahTab
            ? 'Pengelolaan peribadatan resmi Masjid Babul Khaer BTP Blok AE: Jadwal Khatib Jumat, 3 Imam Rawatib sholat fardhu (standar insentif Rp1.5jt hasil Raker 2026), agenda kajian pekanan mandiri, dan perencanaan Semarak Ramadhan 1448 H.'
            : isAssetTab
            ? 'Katalog sarana & prasarana fisik masjid (AC duduk Daikin, genset silent 5500W, sound system, karpet shaf) lengkap dengan pemantauan otomatis jadwal servis berkala.'
            : isJamaahTab
            ? 'Basis data terpadu warga Kompleks BTP Blok AE untuk pemetaan jamaah, pendataan mustahiq zakat, penyaluran bantuan sosial darurat, dan koordinasi dakwah keumatan.'
            : 'Kelola penomoran surat resmi secara otomatis, telusuri e-arsip dokumen kesekretariatan, susun draf dinas Islami via Gemini AI, dan ekstrak notulensi rapat jadi daftar tugas terstruktur.'}
        </p>

        {/* Banner Action Buttons */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {isReadOnly ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900/60 border border-purple-400/40 text-purple-200 text-xs font-semibold shadow-md">
              <Eye className="w-4 h-4 text-purple-300" />
              <span>Mode Pengawas: Akses Khusus Tinjauan Independen & Pengawasan Sistem</span>
            </div>
          ) : isDashboardTab ? (
            <>
              {canMutateTab('archive') && (
                <button
                  onClick={onOpenCreateLetter}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4 text-emerald-700" />
                  <span>Buat Surat Dinas</span>
                </button>
              )}
              {canMutateTab('jamaah') && (
                <button
                  onClick={onOpenCreateJamaah}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-teal-950" />
                  <span>Registrasi Warga</span>
                </button>
              )}
              {canMutateTab('finance') && (
                <button
                  onClick={onOpenCreateTransaction}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-950" />
                  <span>Catat Kas Masuk/Keluar</span>
                </button>
              )}
              {canMutateTab('assets') && (
                <button
                  onClick={onOpenCreateAsset}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-emerald-950" />
                  <span>Daftarkan Aset</span>
                </button>
              )}
            </>
          ) : isFinanceTab ? (
            <>
              <button
                onClick={onOpenCreateTransaction}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Mutasi Kas Baru</span>
              </button>
              <button
                onClick={onOpenFridayReport}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all cursor-pointer"
              >
                <span>Laporan Kas Jumat</span>
              </button>
            </>
          ) : isDonorsTab ? (
            <>
              <button
                onClick={onOpenCreateDonor}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Daftarkan Donatur Tetap</span>
              </button>
            </>
          ) : isAssetTab ? (
            <>
              <button
                onClick={onOpenCreateAsset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Daftarkan Aset Baru</span>
              </button>
              <button
                onClick={onFilterAssetOnlyDue}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all cursor-pointer"
              >
                <Wrench className="w-4 h-4 text-amber-300" />
                <span>Jatuh Tempo Servis ({assetStats?.maintenanceDueCount || 0})</span>
              </button>
            </>
          ) : isJamaahTab ? (
            <>
              <button
                onClick={onOpenCreateJamaah}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrasi Warga Baru</span>
              </button>
              <button
                onClick={onOpenMustahiq}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800/80 hover:bg-teal-700/80 text-white border border-teal-600/50 font-semibold text-xs transition-all cursor-pointer"
              >
                <HeartHandshake className="w-4 h-4 text-amber-300" />
                <span>Data Mustahiq & Bansos</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenCreateLetter}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Buat Surat Resmi Baru</span>
              </button>
              <button
                onClick={onOpenArchiveLetterModal}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Archive className="w-4 h-4" />
                <span>Catat Arsip Keluar</span>
              </button>
              <button
                onClick={onOpenMinutes}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-white border border-emerald-600/50 font-semibold text-xs transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ekstraksi Notulensi AI</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
