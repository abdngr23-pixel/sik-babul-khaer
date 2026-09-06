'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Wallet,
  Users,
  Layers,
  Wrench,
  Calendar,
  CheckSquare,
  BarChart3,
  HeartHandshake,
  PenTool,
  Database,
  ArrowRightLeft,
  ShieldCheck,
  LogOut,
  X,
  ChevronRight,
  Shield,
  Eye,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { AppNavTab } from '@/types/navigation';

interface BottomNavProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  onOpenCreateLetter?: () => void;
  onOpenCreateJamaah?: () => void;
  onOpenCreateTransaction?: () => void;
  onOpenCreateAsset?: () => void;
  onOpenSwitchRole?: () => void;
  onOpenAuditLogs?: () => void;
  onOpenBackupModal?: () => void;
  pendingApprovalsCount?: number;
}

export default function BottomNav({
  activeTab,
  setActiveTab,
  onOpenCreateLetter,
  onOpenCreateJamaah,
  onOpenCreateTransaction,
  onOpenCreateAsset,
  onOpenSwitchRole,
  onOpenAuditLogs,
  onOpenBackupModal,
  pendingApprovalsCount = 0,
}: BottomNavProps) {
  const { currentUser, isReadOnly, canAccessTab, logout } = useAuth();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Tab grouping
  const isDashboardActive = activeTab === 'dashboard';
  const isSuratActive = activeTab === 'archive' || activeTab === 'create' || activeTab === 'minutes';
  const isKasActive = activeTab === 'finance' || activeTab === 'donors';
  const isWargaActive = activeTab === 'jamaah' || activeTab === 'mustahiq';
  const isOtherActive =
    activeTab === 'assets' ||
    activeTab === 'dakwah' ||
    activeTab === 'reports' ||
    activeTab === 'approvals' ||
    activeTab === 'superadmin';

  const handleSelectTab = (tab: AppNavTab) => {
    setActiveTab(tab);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* 1. Fixed Bottom Navigation Bar for Mobile (< md) */}
      <nav
        aria-label="Navigasi Bawah Ponsel"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
          {/* Tab 1: Beranda */}
          <button
            type="button"
            onClick={() => handleSelectTab('dashboard')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer rounded-xl mx-0.5 active:scale-95 ${
              isDashboardActive
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isDashboardActive
                  ? 'bg-emerald-100 text-emerald-800 scale-105'
                  : 'hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] leading-none tracking-tight">Beranda</span>
          </button>

          {/* Tab 2: Surat */}
          <button
            type="button"
            onClick={() => handleSelectTab('archive')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer rounded-xl mx-0.5 active:scale-95 ${
              isSuratActive
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isSuratActive
                  ? 'bg-emerald-100 text-emerald-800 scale-105'
                  : 'hover:bg-slate-100'
              }`}
            >
              <Inbox className="w-5 h-5" />
            </div>
            <span className="text-[10px] leading-none tracking-tight">Surat</span>
          </button>

          {/* Tab 3: Kas */}
          <button
            type="button"
            onClick={() => handleSelectTab('finance')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer rounded-xl mx-0.5 active:scale-95 ${
              isKasActive
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isKasActive
                  ? 'bg-emerald-100 text-emerald-800 scale-105'
                  : 'hover:bg-slate-100'
              }`}
            >
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-[10px] leading-none tracking-tight">Kas</span>
          </button>

          {/* Tab 4: Warga */}
          <button
            type="button"
            onClick={() => handleSelectTab('jamaah')}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer rounded-xl mx-0.5 active:scale-95 ${
              isWargaActive
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isWargaActive
                  ? 'bg-emerald-100 text-emerald-800 scale-105'
                  : 'hover:bg-slate-100'
              }`}
            >
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] leading-none tracking-tight">Warga</span>
          </button>

          {/* Tab 5: Lainnya */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(true)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer rounded-xl mx-0.5 relative active:scale-95 ${
              isOtherActive || isMoreOpen
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800 font-medium'
            }`}
          >
            <div
              className={`p-1.5 rounded-xl transition-all relative ${
                isOtherActive || isMoreOpen
                  ? 'bg-emerald-100 text-emerald-800 scale-105'
                  : 'hover:bg-slate-100'
              }`}
            >
              <Layers className="w-5 h-5" />
              {pendingApprovalsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </div>
            <span className="text-[10px] leading-none tracking-tight">Lainnya</span>
          </button>
        </div>
      </nav>

      {/* 2. Bottom Sheet "Lainnya" Drawer (Mobile Only) */}
      {isMoreOpen && (
        <>
          <div
            onClick={() => setIsMoreOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu Layanan Tambahan"
            className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-3xl border-t border-slate-200 shadow-2xl flex flex-col max-h-[85dvh] text-slate-800 animate-in slide-in-from-bottom duration-300 md:hidden"
          >
            {/* Drag Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0" />

            {/* Header */}
            <div className="px-5 py-2.5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                  Semua Fitur SIK-MBH
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Akses modul operasional, dakwah, & sarpras
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 overscroll-contain">
              {/* Seksi Operasional Tambahan */}
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2 px-1">
                  Modul Pendukung
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  {canAccessTab('assets') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('assets')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all min-h-[56px] active:scale-98 ${
                        activeTab === 'assets'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-orange-100 text-orange-800 shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs leading-tight truncate">Sarpras & Aset</p>
                        <p className="text-[10px] text-slate-500 truncate">Jadwal Servis AC/Genset</p>
                      </div>
                    </button>
                  )}

                  {canAccessTab('dakwah') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('dakwah')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all min-h-[56px] active:scale-98 ${
                        activeTab === 'dakwah'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-teal-100 text-teal-800 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs leading-tight truncate">Dakwah & Ibadah</p>
                        <p className="text-[10px] text-slate-500 truncate">Khatib & Imam Rawatib</p>
                      </div>
                    </button>
                  )}

                  {canAccessTab('mustahiq') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('mustahiq')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all min-h-[56px] active:scale-98 ${
                        activeTab === 'mustahiq'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs leading-tight truncate">Mustahiq ZISWAF</p>
                        <p className="text-[10px] text-slate-500 truncate">Penyaluran Bantuan</p>
                      </div>
                    </button>
                  )}

                  {canAccessTab('donors') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('donors')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all min-h-[56px] active:scale-98 ${
                        activeTab === 'donors'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs leading-tight truncate">Donatur Rutin</p>
                        <p className="text-[10px] text-slate-500 truncate">Kelola Infaq Bulanan</p>
                      </div>
                    </button>
                  )}

                  {canAccessTab('minutes') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('minutes')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all min-h-[56px] active:scale-98 ${
                        activeTab === 'minutes'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800 shrink-0">
                        <PenTool className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs leading-tight truncate">Notulensi Rapat AI</p>
                        <p className="text-[10px] text-slate-500 truncate">Ekstraksi Notula</p>
                      </div>
                    </button>
                  )}

                  {canAccessTab('reports') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('reports')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all min-h-[56px] active:scale-98 ${
                        activeTab === 'reports'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800 shrink-0">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs leading-tight truncate">Evaluasi & LPJ</p>
                        <p className="text-[10px] text-slate-500 truncate">Laporan 4 Pilar</p>
                      </div>
                    </button>
                  )}

                  {canAccessTab('approvals') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('approvals')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all min-h-[56px] active:scale-98 ${
                        activeTab === 'approvals'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-800 shrink-0 relative">
                        <CheckSquare className="w-4 h-4" />
                        {pendingApprovalsCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs leading-tight truncate">Pengesahan</p>
                        <p className="text-[10px] text-slate-500 truncate">Disposisi Ketua</p>
                      </div>
                    </button>
                  )}

                  {canAccessTab('superadmin') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('superadmin')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all min-h-[56px] active:scale-98 ${
                        activeTab === 'superadmin'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                          : 'bg-slate-50/80 hover:bg-slate-100 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-200 text-slate-800 shrink-0">
                        <Database className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs leading-tight truncate">Super Admin</p>
                        <p className="text-[10px] text-slate-500 truncate">Pusat Data SIK</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Seksi Otoritas & Keamanan */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2 px-1">
                  Pengaturan & Otoritas
                </p>

                {onOpenSwitchRole && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenSwitchRole();
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl text-purple-900 bg-purple-50/80 hover:bg-purple-100 border border-purple-200/70 transition-all font-semibold text-xs min-h-[48px] active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-purple-200/60 text-purple-800">
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <span>Ganti Akun Pengurus (Multi-Role)</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-purple-400" />
                  </button>
                )}

                {onOpenAuditLogs &&
                  (currentUser.role === 'DEWAN_PENGAWAS' ||
                    currentUser.role === 'KETUA_UMUM' ||
                    currentUser.role === 'SUPER_ADMIN') && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreOpen(false);
                        onOpenAuditLogs();
                      }}
                      className="w-full flex items-center justify-between p-3.5 rounded-2xl text-slate-800 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 transition-all font-semibold text-xs min-h-[48px] active:scale-98 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-slate-200 text-slate-700">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span>Log Audit Aktivitas Pengurus</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  )}

                {onOpenBackupModal && currentUser.role === 'SUPER_ADMIN' && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenBackupModal();
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl text-slate-800 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 transition-all font-semibold text-xs min-h-[48px] active:scale-98 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-slate-200 text-slate-700">
                        <Database className="w-4 h-4" />
                      </div>
                      <span>Cadangan & Pemulihan Basis Data</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Footer: User Profile & Logout */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 pb-[max(1rem,env(safe-area-inset-bottom))] shrink-0">
              <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-xs shrink-0">
                    {isReadOnly ? (
                      <Eye className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Shield className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-slate-900 leading-tight truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold truncate">
                      {currentUser.title}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
                  title="Keluar Divisi"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
