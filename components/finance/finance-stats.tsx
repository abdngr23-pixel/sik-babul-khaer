'use client';

import React from 'react';
import { FinanceSummary } from '@/types/finance';
import { Wallet, Landmark, Sparkles, HeartHandshake, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface FinanceStatsProps {
  summary: FinanceSummary | null;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function FinanceStatsCards({
  summary,
  selectedCategory,
  onSelectCategory,
}: FinanceStatsProps) {
  if (!summary) return null;

  return (
    <div className="space-y-4">
      {/* 4 Main Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo Gabungan */}
        <div
          onClick={() => onSelectCategory('ALL')}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Saldo Kas DKM
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {formatRupiah(summary.totalBalance)}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-600 font-medium">
              <span>Seluruh Rekening & Brankas</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        {/* Kas Operasional Rutin */}
        <div
          onClick={() => onSelectCategory('KAS_OPERASIONAL')}
          className={`bg-white rounded-xl p-4 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            selectedCategory === 'KAS_OPERASIONAL'
              ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50/20'
              : 'border-slate-200 hover:border-blue-400'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kas Operasional Rutin
            </p>
            <p className="text-xl font-extrabold text-blue-800 mt-1">
              {formatRupiah(summary.operationalBalance)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Infaq Jumat, Listrik, Marbot
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Landmark className="w-5 h-5" />
          </div>
        </div>

        {/* Dana Swadaya PHBI Satu Pintu */}
        <div
          onClick={() => onSelectCategory('SWADAYA_PHBI')}
          className={`bg-white rounded-xl p-4 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            selectedCategory === 'SWADAYA_PHBI'
              ? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50/20'
              : 'border-slate-200 hover:border-amber-400'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Dana Swadaya PHBI
              </p>
              <span className="text-[9px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded">
                Satu Pintu
              </span>
            </div>
            <p className="text-xl font-extrabold text-amber-800 mt-1">
              {formatRupiah(summary.phbiBalance)}
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              Khusus Kegiatan Hari Besar
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        </div>

        {/* Pos ZISWAF */}
        <div
          onClick={() => onSelectCategory('ZISWAF_ZAKAT')}
          className={`bg-white rounded-xl p-4 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            selectedCategory === 'ZISWAF_ZAKAT'
              ? 'border-purple-500 ring-2 ring-purple-200 bg-purple-50/20'
              : 'border-slate-200 hover:border-purple-400'
          }`}
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Rekapitulasi ZISWAF
            </p>
            <p className="text-xl font-extrabold text-purple-800 mt-1">
              {formatRupiah(summary.ziswafBalance)}
            </p>
            <p className="text-[11px] text-purple-700 font-medium mt-1">
              Zakat Mal, Fitrah & Santunan
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Monthly Cashflow Bar */}
      <div className="bg-slate-900 text-white rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">Arus Kas Masuk & Keluar Bulan Berjalan:</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Penerimaan: {formatRupiah(summary.monthlyIncome)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <ArrowDownLeft className="w-4 h-4 text-rose-400" />
            <span>Pengeluaran: {formatRupiah(summary.monthlyExpense)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
