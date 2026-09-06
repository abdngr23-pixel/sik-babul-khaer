'use client';

import React from 'react';
import { FileText, Users, Wallet, Package, ArrowUpRight } from 'lucide-react';
import { formatRupiah } from '@/components/finance/finance-stats';
import { FinanceSummary } from '@/types/finance';
import { JamaahStats } from '@/types/jamaah';
import { AssetStats } from '@/types/asset';
import { AppNavTab } from '@/components/layout/sidebar';

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Administrasi & Surat */}
      <div
        onClick={() => onNavigateTab('archive')}
        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Administrasi & Surat
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 group-hover:text-emerald-700 transition-colors">
              {totalLetters} <span className="text-xs font-semibold text-slate-500">Surat</span>
            </p>
            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
              {approvedCount} Disahkan • {invitationCount} Undangan
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform shadow-2xs">
            <FileText className="w-5 h-5" />
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
          <span>Buka E-Arsip Surat</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 2. Kependudukan Jamaah */}
      <div
        onClick={() => onNavigateTab('jamaah')}
        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Kependudukan Jamaah
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 group-hover:text-teal-700 transition-colors">
              {totalJamaah} <span className="text-xs font-semibold text-slate-500">Jiwa</span>
            </p>
            <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
              {jamaahStats?.totalKK || 0} KK • {jamaahStats?.totalMustahiq || 0} Mustahiq ZISWAF
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition-transform shadow-2xs">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-teal-700">
          <span>Kelola Data Warga</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 3. Keuangan & Swadaya Kas */}
      <div
        onClick={() => onNavigateTab('finance')}
        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Keuangan & Swadaya Kas
            </p>
            <p className="text-xl font-black text-slate-900 mt-1 group-hover:text-amber-700 transition-colors truncate">
              {financeSummary ? formatRupiah(financeSummary.totalBalance) : 'Rp 0'}
            </p>
            <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
              PHBI: {financeSummary ? formatRupiah(financeSummary.phbiBalance) : 'Rp 0'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform shadow-2xs">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-amber-800">
          <span>Buku Kas & Pos PHBI</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>

      {/* 4. Sarpras & Kinerja DKM */}
      <div
        onClick={() => onNavigateTab('assets')}
        className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Sarpras & Kinerja DKM
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 group-hover:text-indigo-700 transition-colors">
              {totalAssets} <span className="text-xs font-semibold text-slate-500">Unit</span>
            </p>
            <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
              {assetStats?.maintenanceDueCount || 0} Perlu Servis • Indeks:{' '}
              {overallScore !== null ? `${overallScore}%` : <span className="animate-pulse text-indigo-400">...</span>}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform shadow-2xs">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-indigo-700">
          <span>Inventaris & Pemeliharaan</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
