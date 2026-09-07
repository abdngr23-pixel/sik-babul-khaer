'use client';

import React from 'react';
import { Wrench } from 'lucide-react';
import { AssetItem, AssetStats } from '@/types/asset';
import { AppNavTab } from '@/components/layout/sidebar';

interface DashboardSarprasCardProps {
  assets: AssetItem[];
  assetStats: AssetStats | null;
  onNavigateTab: (tab: AppNavTab) => void;
}

export default function DashboardSarprasCard({
  assets,
  assetStats,
  onNavigateTab,
}: DashboardSarprasCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Servis Sarpras Berkala
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
          {assetStats?.maintenanceDueCount || 0} Terjadwal
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {assets.slice(0, 3).map((a) => (
          <div
            key={a.id}
            className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                {a.name}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                Lokasi: {a.location} • Servis: {a.nextMaintenanceDate}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                a.isMaintenanceDue
                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
              }`}
            >
              {a.isMaintenanceDue ? 'Jatuh Tempo' : 'Optimal'}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onNavigateTab('assets')}
        className="w-full mt-3 py-2 text-center text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors cursor-pointer block"
      >
        Lihat Seluruh Inventaris Sarpras →
      </button>
    </div>
  );
}
