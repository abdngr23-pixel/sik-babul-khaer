'use client';

import React from 'react';
import { Wallet, Printer } from 'lucide-react';
import { formatRupiah } from '@/components/finance/finance-stats';
import { FinanceSummary } from '@/types/finance';

interface DashboardKeuanganCardProps {
  financeSummary: FinanceSummary | null;
  onOpenFridayReport: () => void;
}

export default function DashboardKeuanganCard({
  financeSummary,
  onOpenFridayReport,
}: DashboardKeuanganCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 leading-tight">
              Pemisahan Pos Kas Keuangan (Satu Pintu)
            </h3>
            <p className="text-[11px] text-slate-500">
              Rekapitulasi saldo kas operasional, swadaya PHBI, dan ZISWAF
            </p>
          </div>
        </div>
        <button
          onClick={onOpenFridayReport}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Pengumuman Jumat</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Kas Operasional Rutin
          </span>
          <span className="text-base font-bold text-slate-900 block mt-1">
            {financeSummary ? formatRupiah(financeSummary.operationalBalance) : 'Rp 0'}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Listrik, air, marbot & harian
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            Dana Swadaya PHBI
          </span>
          <span className="text-base font-bold text-amber-900 block mt-1">
            {financeSummary ? formatRupiah(financeSummary.phbiBalance) : 'Rp 0'}
          </span>
          <span className="text-[10px] text-amber-700 mt-1 block">
            Pos terpisah kegiatan hari besar
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80">
          <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider block">
            Rekapitulasi ZISWAF
          </span>
          <span className="text-base font-bold text-purple-900 block mt-1">
            {financeSummary ? formatRupiah(financeSummary.ziswafBalance) : 'Rp 0'}
          </span>
          <span className="text-[10px] text-purple-700 mt-1 block">
            Zakat & infaq terikat mustahiq
          </span>
        </div>
      </div>
    </div>
  );
}
