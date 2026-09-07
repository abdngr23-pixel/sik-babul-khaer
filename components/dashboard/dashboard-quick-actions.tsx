'use client';

import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { AppNavTab } from '@/components/layout/sidebar';
import { LPJReport } from '@/types/reports';
import { useAuth } from '@/lib/auth-context';

interface DashboardQuickActionsProps {
  onOpenCreateLetter: () => void;
  onOpenCreateJamaah: () => void;
  onOpenCreateTransaction: () => void;
  onOpenFridayReport: () => void;
  onOpenArchiveLetterModal: () => void;
  onNavigateTab: (tab: AppNavTab) => void;
  lpjReport: LPJReport | null;
  onPreviewLPJ: (report: LPJReport) => void;
}

export default function DashboardQuickActions({
  onOpenCreateLetter,
  onOpenCreateJamaah,
  onOpenCreateTransaction,
  onOpenFridayReport,
  onOpenArchiveLetterModal,
  onNavigateTab,
  lpjReport,
  onPreviewLPJ,
}: DashboardQuickActionsProps) {
  const { canAccessTab, canMutateTab, isReadOnly, currentUser } = useAuth();

  const showLetterActions = canMutateTab('archive') && !isReadOnly;
  const showJamaahActions = canMutateTab('jamaah') && !isReadOnly;
  const showFinanceActions = canMutateTab('finance') && !isReadOnly;
  const showDonorAction = canAccessTab('donors');
  const showLpjAction = canAccessTab('reports');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft-sm p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
            Pusat Aksi Cepat
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {currentUser.roleLabel}
        </span>
      </div>

      <div className="space-y-2">
        {showLetterActions && (
          <button
            onClick={onOpenCreateLetter}
            className="w-full p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                ✉️
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block group-hover:text-emerald-900 dark:group-hover:text-emerald-300">
                  Buat Draf Surat Dinas
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Template cepat & bantuan AI
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors" />
          </button>
        )}

        {showJamaahActions && (
          <button
            onClick={onOpenCreateJamaah}
            className="w-full p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100/80 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                👥
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block group-hover:text-teal-900 dark:group-hover:text-teal-300">
                  Registrasi Warga Baru
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Input profil sensus jamaah RT 01-06
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors" />
          </button>
        )}

        {showFinanceActions && (
          <button
            onClick={onOpenCreateTransaction}
            className="w-full p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/60 border border-amber-200/80 dark:border-amber-800/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                💰
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block group-hover:text-amber-900 dark:group-hover:text-amber-300">
                  Catat Mutasi Kas Masuk/Keluar
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Input transaksi buku kas harian
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors" />
          </button>
        )}

        {showFinanceActions && (
          <button
            onClick={onOpenFridayReport}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-700 dark:bg-slate-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                🕌
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block">
                  Laporan Kas Mimbar Jumat
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Format siap cetak A4 & PDF
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors" />
          </button>
        )}

        {showLpjAction && (
          <button
            onClick={() => {
              if (lpjReport) onPreviewLPJ(lpjReport);
              else onNavigateTab('reports');
            }}
            className="w-full p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                📑
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block group-hover:text-indigo-900 dark:group-hover:text-indigo-300">
                  Draf Dokumen LPJ Tahunan
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Kompilasi 4 pilar bidang A4
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors" />
          </button>
        )}

        {showLetterActions && (
          <button
            onClick={onOpenArchiveLetterModal}
            className="w-full p-3 rounded-xl bg-orange-50/80 dark:bg-orange-950/40 hover:bg-orange-100/80 dark:hover:bg-orange-900/60 border border-orange-200/80 dark:border-orange-800/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                📁
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block group-hover:text-amber-900 dark:group-hover:text-amber-300">
                  Catat Arsip Keluar (Fisik)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Rekam surat lampau ke E-Arsip
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors" />
          </button>
        )}

        {showDonorAction && (
          <button
            onClick={() => onNavigateTab('donors')}
            className="w-full p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 hover:bg-teal-100/80 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                🤝
              </div>
              <div>
                <span className="font-bold text-xs text-slate-900 dark:text-slate-100 block group-hover:text-teal-900 dark:group-hover:text-teal-300">
                  Kelola Donatur Tetap
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  Infaq rutin & 1-klik setor kas
                </span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors" />
          </button>
        )}

        {isReadOnly && (
          <div className="p-3.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/80 text-purple-900 dark:text-purple-200 text-xs">
            <span className="font-bold block">Mode Pengawas Terverifikasi</span>
            <span className="text-[11px] text-purple-700 dark:text-purple-300 mt-0.5 block">
              Akun Anda memiliki kewenangan inspeksi independen, evaluasi KPI, dan audit transparansi DKM.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
