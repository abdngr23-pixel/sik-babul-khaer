'use client';

import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  Sparkles,
  Users,
  HeartHandshake,
  Calendar,
  Package,
  BarChart3,
  ShieldCheck,
  Database,
  LogOut,
} from 'lucide-react';
import { AppNavTab } from '@/types/navigation';

interface ModuleTabSelectorProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  canAccessTab: (tab: AppNavTab) => boolean;
  lettersCount: number;
  jamaahCount: number;
  donorsCount: number;
  assetsCount: number;
  pendingApprovalsCount: number;
  onSelectStatus: (status: string) => void;
  onLogout: () => void;
  onOpenAuditLogs?: () => void;
  isAuditRole?: boolean;
}

export function ModuleTabSelector({
  activeTab,
  setActiveTab,
  canAccessTab,
  lettersCount,
  jamaahCount,
  donorsCount,
  assetsCount,
  pendingApprovalsCount,
  onSelectStatus,
  onLogout,
  onOpenAuditLogs,
  isAuditRole,
}: ModuleTabSelectorProps) {
  return (
    <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center gap-1.5 shadow-2xs">
      {/* Dashboard Pill */}
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
          activeTab === 'dashboard'
            ? 'bg-white text-emerald-900 shadow-soft-sm ring-1 ring-emerald-500/20'
            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
        }`}
      >
        <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
        <span>Pusat Kendali (Dashboard)</span>
      </button>

      {/* Administrasi & Persuratan */}
      {canAccessTab('archive') && (
        <button
          onClick={() => setActiveTab('archive')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'archive'
              ? 'bg-white text-emerald-900 shadow-soft-sm ring-1 ring-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Inbox className="w-3.5 h-3.5 text-emerald-600" />
          <span>E-Arsip Surat ({lettersCount})</span>
        </button>
      )}

      {canAccessTab('minutes') && (
        <button
          onClick={() => setActiveTab('minutes')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'minutes'
              ? 'bg-white text-emerald-900 shadow-soft-sm ring-1 ring-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Notulensi Rapat AI</span>
        </button>
      )}

      {/* Database Jamaah & Sosial */}
      {canAccessTab('jamaah') && (
        <button
          onClick={() => {
            setActiveTab('jamaah');
            onSelectStatus('ALL');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'jamaah'
              ? 'bg-white text-teal-900 shadow-soft-sm ring-1 ring-teal-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-teal-600" />
          <span>Basis Data Warga ({jamaahCount})</span>
        </button>
      )}

      {canAccessTab('mustahiq') && (
        <button
          onClick={() => {
            setActiveTab('mustahiq');
            onSelectStatus('MUSTAHIQ_ALL');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'mustahiq'
              ? 'bg-white text-teal-900 shadow-soft-sm ring-1 ring-teal-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
          <span>Mustahiq ZISWAF</span>
        </button>
      )}

      {canAccessTab('dakwah') && (
        <button
          onClick={() => setActiveTab('dakwah')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'dakwah'
              ? 'bg-white text-teal-900 shadow-soft-sm ring-1 ring-teal-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-teal-600" />
          <span>Dakwah & Peribadatan</span>
        </button>
      )}

      {/* Keuangan & Swadaya */}
      {canAccessTab('finance') && (
        <button
          onClick={() => setActiveTab('finance')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'finance'
              ? 'bg-white text-amber-900 shadow-soft-sm ring-1 ring-amber-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span className="font-bold text-amber-600">Rp</span>
          <span>Buku Kas Satu Pintu</span>
        </button>
      )}

      {canAccessTab('donors') && (
        <button
          onClick={() => setActiveTab('donors')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'donors'
              ? 'bg-white text-teal-900 shadow-soft-sm ring-1 ring-teal-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
          <span>Donatur Rutin ({donorsCount})</span>
        </button>
      )}

      {/* Sarpras Fisik */}
      {canAccessTab('assets') && (
        <button
          onClick={() => setActiveTab('assets')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'assets'
              ? 'bg-white text-emerald-900 shadow-soft-sm ring-1 ring-emerald-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-emerald-600" />
          <span>Inventaris Sarpras ({assetsCount})</span>
        </button>
      )}

      {/* Laporan & Pengesahan */}
      {canAccessTab('reports') && (
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-white text-indigo-900 shadow-soft-sm ring-1 ring-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Evaluasi & LPJ</span>
        </button>
      )}

      {canAccessTab('approvals') && (
        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'approvals'
              ? 'bg-white text-indigo-900 shadow-soft-sm ring-1 ring-indigo-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
          <span>Pengesahan Satu Pintu ({pendingApprovalsCount})</span>
        </button>
      )}

      {/* Super Admin & Database */}
      {canAccessTab('superadmin') && (
        <button
          onClick={() => setActiveTab('superadmin')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'superadmin'
              ? 'bg-slate-900 text-teal-300 shadow-soft-sm ring-1 ring-teal-500/20'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-teal-500" />
          <span>Super Admin</span>
        </button>
      )}

      {/* Akses & Keamanan */}
      <div className="ml-auto flex items-center gap-1.5 pl-2">
        <button
          onClick={onLogout}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border border-rose-200/60 transition-all cursor-pointer flex items-center gap-1.5"
          title="Keluar dari sesi akun saat ini"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>

        {isAuditRole && onOpenAuditLogs && (
          <button
            onClick={onOpenAuditLogs}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Lihat Log Audit Aktivitas Sistem"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Log Audit</span>
          </button>
        )}
      </div>
    </div>
  );
}
