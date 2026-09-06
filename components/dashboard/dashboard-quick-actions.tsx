'use client';

import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { AppNavTab } from '@/components/layout/sidebar';
import { LPJReport } from '@/types/reports';

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
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-amber-500" />
        <h3 className="font-bold text-sm text-slate-900">
          Pusat Aksi Cepat Pengurus
        </h3>
      </div>

      <div className="space-y-2">
        <button
          onClick={onOpenCreateLetter}
          className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              ✉️
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-900">
                Buat Draf Surat Dinas
              </span>
              <span className="text-[11px] text-slate-500 block">
                Template cepat & bantuan AI
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
        </button>

        <button
          onClick={onOpenCreateJamaah}
          className="w-full p-3 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              👥
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block group-hover:text-teal-900">
                Registrasi Warga Baru
              </span>
              <span className="text-[11px] text-slate-500 block">
                Input profil sensus jamaah RT 01-06
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 transition-colors" />
        </button>

        <button
          onClick={onOpenCreateTransaction}
          className="w-full p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              💰
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block group-hover:text-amber-900">
                Catat Mutasi Kas Masuk/Keluar
              </span>
              <span className="text-[11px] text-slate-500 block">
                Input transaksi buku kas harian
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
        </button>

        <button
          onClick={onOpenFridayReport}
          className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              🕌
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block">
                Laporan Kas Mimbar Jumat
              </span>
              <span className="text-[11px] text-slate-500 block">
                Format siap cetak A4 & PDF
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
        </button>

        <button
          onClick={() => {
            if (lpjReport) onPreviewLPJ(lpjReport);
            else onNavigateTab('reports');
          }}
          className="w-full p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              📑
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block group-hover:text-indigo-900">
                Draf Dokumen LPJ Tahunan
              </span>
              <span className="text-[11px] text-slate-500 block">
                Kompilasi 4 pilar bidang A4
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 transition-colors" />
        </button>

        <button
          onClick={onOpenArchiveLetterModal}
          className="w-full p-3 rounded-xl bg-orange-50/80 hover:bg-orange-100/80 border border-orange-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              📁
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block group-hover:text-amber-900">
                Catat Arsip Keluar (Fisik)
              </span>
              <span className="text-[11px] text-slate-500 block">
                Rekam surat lampau ke E-Arsip
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
        </button>

        <button
          onClick={() => onNavigateTab('donors')}
          className="w-full p-3 rounded-xl bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              🤝
            </div>
            <div>
              <span className="font-bold text-xs text-slate-900 block group-hover:text-teal-900">
                Kelola Donatur Tetap
              </span>
              <span className="text-[11px] text-slate-500 block">
                Infaq rutin & 1-klik setor kas
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 transition-colors" />
        </button>
      </div>
    </div>
  );
}
