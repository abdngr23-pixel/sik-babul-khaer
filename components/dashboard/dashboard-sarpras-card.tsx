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
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">
            Servis Sarpras Berkala
          </h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
          {assetStats?.maintenanceDueCount || 0} Terjadwal
        </span>
      </div>

      <div className="space-y-2 text-xs">
        {assets.slice(0, 3).map((a) => (
          <div
            key={a.id}
            className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-2"
          >
            <div className="min-w-0">
              <span className="font-semibold text-slate-800 block truncate">
                {a.name}
              </span>
              <span className="text-[10px] text-slate-500 block truncate">
                Lokasi: {a.location} • Servis: {a.nextMaintenanceDate}
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                a.isMaintenanceDue
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {a.isMaintenanceDue ? 'Jatuh Tempo' : 'Optimal'}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onNavigateTab('assets')}
        className="w-full mt-3 py-2 text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer block"
      >
        Lihat Seluruh Inventaris Sarpras →
      </button>
    </div>
  );
}
