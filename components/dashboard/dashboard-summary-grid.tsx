'use client';

import React from 'react';
import { FileText, Users, Wallet, Package, ArrowUpRight } from 'lucide-react';
import { formatRupiah } from '@/components/finance/finance-stats';
import { FinanceSummary } from '@/types/finance';
import { JamaahStats } from '@/types/jamaah';
import { AssetStats } from '@/types/asset';
import { AppNavTab } from '@/components/layout/sidebar';
import { useAuth } from '@/lib/auth-context';

interface DashboardSummaryGridProps {
  totalLetters: number;
  approvedCount: number;
  invitationCount: number;
  totalJamaah: number;
  jamaahStats: JamaahStats | null;
  financeSummary: FinanceSummary | null;
  totalAssets: number;
  assetStats: AssetStats | null;
  overallScore: number | null;
  onNavigateTab: (tab: AppNavTab) => void;
}

export default function DashboardSummaryGrid({
  totalLetters,
  approvedCount,
  invitationCount,
  totalJamaah,
  jamaahStats,
  financeSummary,
  totalAssets,
  assetStats,
  overallScore,
  onNavigateTab,
}: DashboardSummaryGridProps) {
  const { canAccessTab } = useAuth();

  const showLetters = canAccessTab('archive');
  const showJamaah = canAccessTab('jamaah');
  const showFinance = canAccessTab('finance');
  const showAssets = canAccessTab('assets');
  const showReports = canAccessTab('reports');

  // Hitung jumlah kartu yang aktif untuk grid layout yang proporsional
  const activeCardsCount = [showLetters, showJamaah, showFinance, showAssets].filter(Boolean).length;

  const gridColsClass =
    activeCardsCount === 1
      ? 'grid-cols-1 w-full max-w-xl'
      : activeCardsCount === 2
      ? 'grid-cols-1 sm:grid-cols-2'
      : activeCardsCount === 3
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  return (
    <>
      {/* ======================================================== */}
      {/* 1. MOBILE VIEW (< md): MyTelkomsel / By.U Inspired Hero  */}
      {/* ======================================================== */}
      <div className="md:hidden space-y-4">
        {/* Hero Card: Saldo Kas Utama Masjid (Mirip Pulsa Rp0 MyTelkomsel) */}
        {showFinance && (
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-3xl p-5 shadow-lg relative overflow-hidden border border-emerald-700/60">
            {/* Soft Ambient Glow */}
            <div className="absolute -right-8 -top-8 w-44 h-44 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5" /> Total Saldo Kas Masjid
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700/60 text-emerald-100 border border-emerald-500/30">
                  BTP Blok AE
                </span>
              </div>

              {/* Big Prominent Balance */}
              <div className="text-3xl font-black text-white tracking-tight my-2">
                {financeSummary ? formatRupiah(financeSummary.totalBalance) : 'Rp 0'}
              </div>

              {/* Sub-Metrics */}
              <div className="flex items-center gap-2.5 text-xs text-emerald-200/90 pt-1 pb-3 border-b border-emerald-700/50 flex-wrap">
                <div>
                  <span className="text-emerald-400">Pos PHBI:</span>{' '}
                  <span className="font-bold text-white">
                    {financeSummary ? formatRupiah(financeSummary.phbiBalance) : 'Rp 0'}
                  </span>
                </div>
                <span className="text-emerald-600">•</span>
                <div>
                  <span className="text-emerald-400">Kas Operasional:</span>{' '}
                  <span className="font-bold text-white">
                    {financeSummary ? formatRupiah(financeSummary.operationalBalance) : 'Rp 0'}
                  </span>
                </div>
              </div>

              {/* Integrated Touch-Friendly Action Buttons (>=44px height) */}
              <div className="grid grid-cols-2 gap-2.5 mt-3.5">
                <button
                  type="button"
                  onClick={() => onNavigateTab('finance')}
                  className="min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-white text-emerald-950 font-bold text-xs shadow-md hover:bg-emerald-50 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4 text-emerald-700" />
                  <span>Buku Kas Terpadu</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('archive')}
                  className="min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-emerald-700/70 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-500/40 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-emerald-200" />
                  <span>E-Arsip Surat</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Horizontal Scroll Carousel: Kartu-kartu Layanan (Mirip Kartu Paket Super Seru) */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2.5">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 tracking-tight">
              Ringkasan Layanan & Warga
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
              Geser modul &rarr;
            </span>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-2 -mx-3.5 px-3.5 no-scrollbar overscroll-x-contain">
            {/* Card 1: Administrasi & Surat */}
            {showLetters && (
              <div
                onClick={() => onNavigateTab('archive')}
                className="snap-start shrink-0 w-[260px] bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm active:scale-98 transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Administrasi & Surat
                    </p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {totalLetters} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Surat</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                      {approvedCount} Disahkan • {invitationCount} Undangan
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/60 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span>Buka E-Arsip</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Card 2: Kependudukan Jamaah */}
            {showJamaah && (
              <div
                onClick={() => onNavigateTab('jamaah')}
                className="snap-start shrink-0 w-[260px] bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm active:scale-98 transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Kependudukan Warga
                    </p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {totalJamaah} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jiwa</span>
                    </p>
                    <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                      {jamaahStats?.totalKK || 0} KK • {jamaahStats?.totalMustahiq || 0} Mustahiq
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-800/60 shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                  <span>Sensus Jamaah RT 01–05</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Card 3: Sarana & Prasarana */}
            {showAssets && (
              <div
                onClick={() => onNavigateTab('assets')}
                className="snap-start shrink-0 w-[260px] bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm active:scale-98 transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Sarana & Prasarana
                    </p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {totalAssets} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unit</span>
                    </p>
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold mt-0.5">
                      {assetStats?.maintenanceDueCount || 0} Perlu Servis Berkala
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/60 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
                  <span>Katalog Aset & Fisik</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Card 4: Evaluasi & LPJ */}
            {showReports && (
              <div
                onClick={() => onNavigateTab('reports')}
                className="snap-start shrink-0 w-[260px] bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/90 dark:border-slate-800 shadow-soft-sm active:scale-98 transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                      Evaluasi Kinerja 4 Pilar
                    </p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {overallScore !== null ? `${overallScore}%` : <span className="animate-pulse text-purple-400">...</span>}
                    </p>
                    <p className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold mt-0.5">
                      Pengawasan Syariah & AD/ART
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800/60 shrink-0">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-2.5 mt-2 border-t border-purple-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-purple-700 dark:text-purple-400">
                  <span>Tinjau LPJ & Evaluasi</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. DESKTOP VIEW (>= md): 100% Identik dengan Sebelumnya  */}
      {/* ======================================================== */}
      <div className={`hidden md:grid ${gridColsClass} gap-4`}>
        {/* 1. Administrasi & Surat */}
        {showLetters && (
        <div
          onClick={() => onNavigateTab('archive')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Administrasi & Surat
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                {totalLetters} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Surat</span>
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                {approvedCount} Disahkan • {invitationCount} Undangan
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-100 dark:border-emerald-800/60 group-hover:scale-105 transition-transform shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <span>Buka E-Arsip Surat</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
        )}

        {/* 2. Kependudukan Jamaah */}
        {showJamaah && (
        <div
          onClick={() => onNavigateTab('jamaah')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Kependudukan Jamaah
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                {totalJamaah} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Jiwa</span>
              </p>
              <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold mt-0.5">
                {jamaahStats?.totalKK || 0} KK • {jamaahStats?.totalMustahiq || 0} Mustahiq ZISWAF
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-800/60 group-hover:scale-105 transition-transform shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-teal-700 dark:text-teal-400">
            <span>Kelola Data Warga</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
        )}

        {/* 3. Keuangan & Swadaya Kas */}
        {showFinance && (
        <div
          onClick={() => onNavigateTab('finance')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Keuangan & Swadaya Kas
              </p>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors truncate">
                {financeSummary ? formatRupiah(financeSummary.totalBalance) : 'Rp 0'}
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold mt-0.5">
                PHBI: {financeSummary ? formatRupiah(financeSummary.phbiBalance) : 'Rp 0'}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60 group-hover:scale-105 transition-transform shadow-2xs">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-amber-800 dark:text-amber-400">
            <span>Buku Kas & Pos PHBI</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
        )}

        {/* 4. Sarpras & Fasilitas */}
        {showAssets && (
        <div
          onClick={() => onNavigateTab('assets')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Sarana & Prasarana
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                {totalAssets} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Unit</span>
              </p>
              <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-semibold mt-0.5">
                {assetStats?.maintenanceDueCount || 0} Perlu Servis • Indeks:{' '}
                {overallScore !== null ? `${overallScore}%` : <span className="animate-pulse text-indigo-400">...</span>}
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-800/60 group-hover:scale-105 transition-transform shadow-2xs">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
            <span>Inventaris & Pemeliharaan</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
        )}

        {/* 5. Khusus Dewan Pengawas: Evaluasi & Audit */}
        {activeCardsCount === 0 && showReports && (
          <div
            onClick={() => onNavigateTab('reports')}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-purple-200 dark:border-purple-800/60 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                  Evaluasi Kinerja 4 Pilar
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                  {overallScore !== null ? `${overallScore}%` : <span className="animate-pulse text-purple-400">...</span>}
                </p>
                <p className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold mt-0.5">
                  Pengawasan Syariah & LPJ AD/ART 2020
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center border border-purple-100 dark:border-purple-800/60 group-hover:scale-105 transition-transform shadow-2xs">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-purple-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold text-purple-700 dark:text-purple-400">
              <span>Buka Evaluasi Kinerja & LPJ</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
