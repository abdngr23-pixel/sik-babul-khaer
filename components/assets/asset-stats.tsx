'use client';

import React from 'react';
import { AssetStats, AssetItem } from '@/types/asset';
import {
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Package,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { formatRupiah } from '@/components/finance/finance-stats';

interface AssetStatsProps {
  stats: AssetStats | null;
  dueAssets?: AssetItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onFilterDueOnly: () => void;
  onRecordMaintenance?: (asset: AssetItem) => void;
}

export default function AssetStatsCards({
  stats,
  dueAssets = [],
  onFilterDueOnly,
  onRecordMaintenance,
}: AssetStatsProps) {
  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* 4 Main Asset Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Nilai Aset */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Nilai Taksiran Aset
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">
              {formatRupiah(stats.totalEstimatedValue)}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Inventaris Sarpras DKM
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Total Unit Terinventarisir */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Unit Sarpras
            </p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalAssets}{' '}
              <span className="text-xs font-normal text-slate-500">Unit</span>
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              5 Kategori Operasional
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Kondisi Prima / Baik */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kondisi Prima
            </p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">
              {stats.goodCount}{' '}
              <span className="text-xs font-normal text-slate-500">
                ({Math.round((stats.goodCount / (stats.totalAssets || 1)) * 100)}%)
              </span>
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Siap untuk Ibadah & Kegiatan
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Jatuh Tempo Servis / Butuh Servis */}
        <div
          onClick={onFilterDueOnly}
          className={`rounded-xl p-4 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            stats.maintenanceDueCount > 0
              ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-200/60 hover:bg-amber-100/60'
              : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Jatuh Tempo Servis
              </p>
              {stats.maintenanceDueCount > 0 && (
                <span className="text-[9px] font-bold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full animate-pulse">
                  Penting
                </span>
              )}
            </div>
            <p className="text-2xl font-extrabold text-amber-900 mt-1">
              {stats.maintenanceDueCount}{' '}
              <span className="text-xs font-normal text-amber-700">Aset</span>
            </p>
            <p className="text-[11px] text-amber-700 font-medium mt-1">
              {stats.needRepairCount > 0
                ? `${stats.needRepairCount} perlu perbaikan fisik`
                : 'Servis rutin berkala'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center border border-amber-300">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>

      {/* Routine Maintenance Due Alert Banner (Special PRD feature: AC, Genset, Sound periodic reminder) */}
      {stats.maintenanceDueCount > 0 && dueAssets.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white rounded-xl p-4 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center shrink-0 mt-0.5">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                <span>Pengingat Servis Rutin & Pemeliharaan Sarpras:</span>
                <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                  {dueAssets.length} Aset Perlu Tindakan
                </span>
              </h3>
              <p className="text-xs text-amber-100 mt-0.5 leading-relaxed">
                Aset berikut telah melewati siklus servis berkala (misal AC duduk per 3 bulan, genset oli/aki, sound system).
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {dueAssets.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="inline-flex items-center gap-1.5 text-[11px] bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-md border border-white/10"
                  >
                    <span className="font-bold text-amber-200">{item.code}:</span>
                    <span className="text-white truncate max-w-[200px]">{item.name}</span>
                    {onRecordMaintenance && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecordMaintenance(item);
                        }}
                        className="ml-1 text-[10px] font-bold bg-white text-amber-900 px-1.5 py-0.5 rounded hover:bg-amber-100 transition-colors"
                      >
                        Tandai Selesai
                      </button>
                    )}
                  </div>
                ))}
                {dueAssets.length > 3 && (
                  <span className="text-[11px] text-amber-200 self-center font-medium">
                    +{dueAssets.length - 3} lainnya
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onFilterDueOnly}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-amber-900 hover:bg-amber-50 font-bold text-xs shadow-xs shrink-0 self-end md:self-center transition-all cursor-pointer"
          >
            <span>Lihat Semua Jadwal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
