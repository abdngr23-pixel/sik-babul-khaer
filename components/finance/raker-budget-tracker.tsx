'use client';

import React, { useState } from 'react';
import { Layers, Search, Filter } from 'lucide-react';
import { OFFICIAL_RAKER_BUDGETS } from '@/lib/raker-budget-data';

export default function RakerBudgetTracker() {
  const [selectedKomisi, setSelectedKomisi] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBudgets = OFFICIAL_RAKER_BUDGETS.filter((item) => {
    const matchesKomisi = selectedKomisi === 'ALL' || item.komisi === selectedKomisi;
    const matchesSearch =
      item.programName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seksiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesKomisi && matchesSearch;
  });

  // Calculate totals
  const totalAllocated = OFFICIAL_RAKER_BUDGETS.reduce((sum, b) => sum + b.allocatedBudget, 0);
  const totalDisbursed = OFFICIAL_RAKER_BUDGETS.reduce((sum, b) => sum + b.disbursedAmount, 0);
  const overallPercent = Math.round((totalDisbursed / (totalAllocated || 1)) * 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden mb-8">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monitoring Pagu Anggaran Raker 2026–2029
              </h3>
              <p className="text-xs text-slate-500">
                Rekapitulasi Program Kerja Resmi — Berita Acara Raker No. 006/A/DKM-BK-VIII/2026
              </p>
            </div>
          </div>
        </div>

        {/* Total Absorption Summary Badge */}
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs self-start md:self-auto">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Total Pagu Disahkan:</span>
            <span className="text-xs font-bold text-slate-800">
              Rp {totalAllocated.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="h-7 w-px bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Terserap ({overallPercent}%):</span>
            <span className="text-xs font-extrabold text-emerald-700">
              Rp {totalDisbursed.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
          {[
            { key: 'ALL', label: 'Semua Komisi' },
            { key: 'KOMISI_I', label: 'Komisi I (Peribadatan/Dakwah)' },
            { key: 'KOMISI_II', label: 'Komisi II (Pembangunan/Sarpras)' },
            { key: 'SOSIAL_HUMAS', label: 'Sosial & ZISWAF' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedKomisi(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedKomisi === tab.key
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari program kerja..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-slate-50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
            <tr>
              <th className="px-5 py-3">Program / Kegiatan</th>
              <th className="px-4 py-3">Seksi Penanggung Jawab</th>
              <th className="px-4 py-3 text-right">Pagu Raker</th>
              <th className="px-4 py-3 text-right">Realisasi</th>
              <th className="px-4 py-3 text-center">Serapan</th>
              <th className="px-4 py-3">Sumber Dana & Kebijakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredBudgets.map((item) => {
              const percent = Math.min(
                Math.round((item.disbursedAmount / (item.allocatedBudget || 1)) * 100),
                100
              );
              return (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{item.programName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {item.notes}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-medium text-slate-700 block">{item.seksiName}</span>
                    <span className="text-[10px] text-slate-400">{item.komisiLabel}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                    Rp {item.allocatedBudget.toLocaleString('id-ID')}
                    <span className="text-[10px] text-slate-400 font-normal block">/{item.unit}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-semibold text-emerald-700 whitespace-nowrap">
                    Rp {item.disbursedAmount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-bold text-slate-700 text-[11px]">{percent}%</span>
                      <div className="w-16 bg-slate-200 h-1.5 rounded-full mt-1 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          item.fundingSource === 'KAS_MASJID'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : item.fundingSource === 'SWADAYA_JAMAAH'
                            ? 'bg-teal-50 text-teal-800 border-teal-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {item.fundingSource === 'KAS_MASJID'
                          ? 'Kas Masjid'
                          : item.fundingSource === 'SWADAYA_JAMAAH'
                          ? 'Swadaya Jamaah'
                          : 'Donatur Khusus'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.statusRaker === 'DISETUJUI'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.statusRaker === 'DIREVISI'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.statusRaker}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
