'use client';

import React, { useState } from 'react';
import { Hammer, Package, Wrench, Building2 } from 'lucide-react';
import PhysicalProjectsTracker from './physical-projects-tracker';
import AssetTable from './asset-table';
import SarprasMaintenanceView from './sarpras-maintenance-view';
import { AssetItem } from '@/types/asset';
import { useAuth } from '@/lib/auth-context';

interface SarprasViewProps {
  assets: AssetItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedCondition: string;
  onSelectCondition: (cond: string) => void;
  onlyDue: boolean;
  onToggleOnlyDue: (val: boolean) => void;
  onOpenCreate: () => void;
  onEdit: (asset: AssetItem) => void;
  onDelete: (id: string, name: string) => void;
  onRecordMaintenance: (asset: AssetItem) => void;
  isReadOnly?: boolean;
  externalSearchTerm?: string;
}

export default function SarprasView({
  assets,
  selectedCategory,
  onSelectCategory,
  selectedCondition,
  onSelectCondition,
  onlyDue,
  onToggleOnlyDue,
  onOpenCreate,
  onEdit,
  onDelete,
  onRecordMaintenance,
  isReadOnly = false,
  externalSearchTerm = '',
}: SarprasViewProps) {
  const { permissions } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'inventory' | 'maintenance'>('projects');
  const isInventoryReadOnly = isReadOnly || !permissions.canMutateAssets;

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setActiveSubTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'projects'
                ? 'bg-emerald-800 text-white shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-amber-300" />
            <span>Tracker Proyek Fisik (Raker 2026)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeSubTab === 'projects' ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-200 text-slate-700'
            }`}>
              5 Proyek
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'inventory'
                ? 'bg-emerald-800 text-white shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Package className="w-3.5 h-3.5 text-emerald-300" />
            <span>Katalog Aset & Inventaris</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeSubTab === 'inventory' ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {assets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('maintenance')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'maintenance'
                ? 'bg-emerald-800 text-white shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-300" />
            <span>Jadwal Servis Berkala</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-700 font-medium px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Bidang II Sarana & Prasarana DKM</span>
        </div>
      </div>

      {/* Sub-tab Contents */}
      {activeSubTab === 'projects' && (
        <PhysicalProjectsTracker />
      )}

      {activeSubTab === 'inventory' && (
        <AssetTable
          assets={assets}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          selectedCondition={selectedCondition}
          onSelectCondition={onSelectCondition}
          onlyDue={onlyDue}
          onToggleOnlyDue={onToggleOnlyDue}
          onOpenCreate={onOpenCreate}
          onEdit={onEdit}
          onDelete={onDelete}
          onRecordMaintenance={onRecordMaintenance}
          isReadOnly={isInventoryReadOnly}
          externalSearchTerm={externalSearchTerm}
        />
      )}

      {activeSubTab === 'maintenance' && (
        <SarprasMaintenanceView />
      )}
    </div>
  );
}
