'use client';

import React, { useState, useMemo } from 'react';
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
  Plus,
  Sun,
  Moon,
  Award,
  BookOpen,
  Store,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { AppNavTab } from '@/types/navigation';
import { useModalBackHandler } from '@/lib/back-button-handler';

interface BottomNavBarProps {
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

interface NavSlotItem {
  id: AppNavTab | 'more';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
  isMore?: boolean;
}

export default function BottomNavBar({
  activeTab,
  setActiveTab,
  onOpenCreateLetter,
  onOpenCreateJamaah,
  onOpenCreateTransaction,
  onOpenSwitchRole,
  onOpenAuditLogs,
  onOpenBackupModal,
  pendingApprovalsCount = 0,
}: BottomNavBarProps) {
  const { currentUser, isReadOnly, canAccessTab, logout } = useAuth();
  const { theme, toggleTheme, isLargeText, toggleTextSize } = useTheme();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Bind the "Lainnya" bottom sheet drawer to mobile hardware back button
  useModalBackHandler(isMoreOpen, () => setIsMoreOpen(false), 'bottom-nav-more-drawer');

  // --------------------------------------------------------------------------
  // Dynamic 5-Slot Navigation Builder based on User Role & Permissions
  // --------------------------------------------------------------------------
  const navSlots = useMemo<NavSlotItem[]>(() => {
    // Slot 1 is always Beranda (Dashboard)
    const slots: NavSlotItem[] = [
      {
        id: 'dashboard',
        label: 'Beranda',
        icon: LayoutDashboard,
      },
    ];

    // Candidate modules in order of preference for standard operational flow
    const candidateModules: Array<{
      id: AppNavTab;
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      badgeCount?: number;
    }> = [
      { id: 'archive', label: 'Surat', icon: Inbox },
      { id: 'finance', label: 'Kas', icon: Wallet },
      { id: 'jamaah', label: 'Jamaah', icon: Users },
      { id: 'assets', label: 'Sarpras', icon: Wrench },
      { id: 'dakwah', label: 'Dakwah', icon: Calendar },
      {
        id: 'approvals',
        label: 'Pengesahan',
        icon: CheckSquare,
        badgeCount: pendingApprovalsCount,
      },
      { id: 'reports', label: 'Laporan', icon: BarChart3 },
      { id: 'donors', label: 'Donatur', icon: HeartHandshake },
    ];

    // Pick 3 accessible candidate modules for slots 2, 3, 4
    for (const mod of candidateModules) {
      if (slots.length >= 4) break;
      if (canAccessTab(mod.id)) {
        slots.push(mod);
      }
    }

    // Slot 5 is always "Lainnya" (Opens Bottom Sheet Drawer)
    slots.push({
      id: 'more',
      label: 'Lainnya',
      icon: Layers,
      isMore: true,
      badgeCount: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    });

    return slots;
  }, [canAccessTab, pendingApprovalsCount]);

  // Tab grouping checks
  const isSuratGroup = activeTab === 'archive' || activeTab === 'create' || activeTab === 'minutes';
  const isKasGroup = activeTab === 'finance' || activeTab === 'donors';
  const isJamaahGroup = activeTab === 'jamaah' || activeTab === 'mustahiq';

  const checkIsSlotActive = (slotId: AppNavTab | 'more') => {
    if (slotId === 'more') return false;
    if (slotId === activeTab) return true;
    if (slotId === 'archive' && isSuratGroup) return true;
    if (slotId === 'finance' && isKasGroup) return true;
    if (slotId === 'jamaah' && isJamaahGroup) return true;
    return false;
  };

  // Check if current active tab is not in one of the primary 4 slots
  const isCurrentTabInMore = useMemo(() => {
    const primaryIds = navSlots.filter((s) => !s.isMore).map((s) => s.id);
    if (primaryIds.includes(activeTab)) return false;
    if (isSuratGroup && primaryIds.includes('archive')) return false;
    if (isKasGroup && primaryIds.includes('finance')) return false;
    if (isJamaahGroup && primaryIds.includes('jamaah')) return false;
    return true;
  }, [navSlots, activeTab, isSuratGroup, isKasGroup, isJamaahGroup]);

  const handleSelectTab = (tab: AppNavTab) => {
    setActiveTab(tab);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* -------------------------------------------------------------------- */}
      {/* 1. FIXED BOTTOM NAVIGATION BAR FOR MOBILE (< md)                     */}
      {/* -------------------------------------------------------------------- */}
      <nav
        aria-label="Navigasi Bawah Ponsel"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/90 dark:border-slate-800 md:hidden pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] transition-colors"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto items-center px-1">
          {navSlots.map((slot) => {
            const isSlotActive = slot.isMore
              ? isMoreOpen || isCurrentTabInMore
              : checkIsSlotActive(slot.id as AppNavTab);
            const Icon = slot.icon;

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => {
                  if (slot.isMore) {
                    setIsMoreOpen((prev) => !prev);
                  } else {
                    handleSelectTab(slot.id as AppNavTab);
                  }
                }}
                className={`relative min-h-[56px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer rounded-xl mx-0.5 active:scale-95 ${
                  isSlotActive
                    ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
                }`}
              >
                {/* Active Indicator Bar on Top (Gaya Telkomsel / By.U) */}
                {isSlotActive && (
                  <span className="absolute top-0 w-8 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-in fade-in zoom-in-75 duration-150" />
                )}

                {/* Icon Container with Notification Badge */}
                <div
                  className={`p-1.5 rounded-xl transition-all relative ${
                    isSlotActive
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 scale-105 shadow-2xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />

                  {/* Notification Badge */}
                  {slot.badgeCount && slot.badgeCount > 0 ? (
                    <span className="absolute -top-1 -right-1.5 px-1.5 py-0.2 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 shadow-2xs">
                      {slot.badgeCount > 99 ? '99+' : slot.badgeCount}
                    </span>
                  ) : null}
                </div>

                {/* Label */}
                <span className="text-[10px] leading-none tracking-tight">
                  {slot.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* -------------------------------------------------------------------- */}
      {/* 2. BOTTOM SHEET DRAWER: "LAINNYA" (Quick-Access Menu)               */}
      {/* -------------------------------------------------------------------- */}
      {isMoreOpen && (
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMoreOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 md:hidden animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Bottom Sheet Modal Body */}
          <div
            className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl max-h-[88dvh] flex flex-col md:hidden shadow-2xl border-t border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-up pb-[max(1.5rem,env(safe-area-inset-bottom))] transition-colors"
            role="dialog"
            aria-label="Menu Lengkap SIK-MBH"
          >
            {/* Mobile Drag Handle Bar */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 shrink-0" />

            {/* Header Drawer */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/70 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Menu & Modul Lainnya
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Akses cepat seluruh modul DKM Babul Khaer
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMoreOpen(false)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 space-y-4 overflow-y-auto overscroll-contain flex-1">
              {/* User Profile Capsule */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-soft-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-slate-900 truncate">
                      {currentUser.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-700 text-white">
                        {currentUser.roleLabel || currentUser.title}
                      </span>
                      {isReadOnly && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span>Pengawas</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {onOpenSwitchRole && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenSwitchRole();
                    }}
                    className="min-h-[40px] px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 text-[11px] font-bold shadow-2xs hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Ganti</span>
                  </button>
                )}
              </div>

              {/* Grid of Other Modules */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                  Daftar Modul Operasional
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {/* Sarpras */}
                  {canAccessTab('assets') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('assets')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'assets'
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-100 text-slate-700 shrink-0">
                        <Wrench className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          Sarana & Sarpras
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Aset & Servis
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Dakwah */}
                  {canAccessTab('dakwah') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('dakwah')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'dakwah'
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-teal-100 text-teal-800 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          Dakwah & Khatib
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Jumat & Kajian
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Pengesahan Satu Pintu */}
                  {canAccessTab('approvals') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('approvals')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer relative ${
                        activeTab === 'approvals'
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800 shrink-0 relative">
                        <CheckSquare className="w-4 h-4" />
                        {pendingApprovalsCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            Pengesahan
                          </p>
                          {pendingApprovalsCount > 0 && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-rose-500 text-white rounded-full">
                              {pendingApprovalsCount}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 truncate">
                          Disposisi Ketua
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Evaluasi & LPJ */}
                  {canAccessTab('reports') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('reports')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'reports'
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-800 shrink-0">
                        <BarChart3 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          Laporan LPJ
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Evaluasi 4 Pilar
                        </p>
                      </div>
                    </button>
                  )}

                  {/* ZISWAF & Bansos SSS */}
                  {canAccessTab('mustahiq') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('mustahiq')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'mustahiq'
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          ZISWAF & SSS
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Mustahiq & Sedekah
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Donatur Rutin */}
                  {canAccessTab('donors') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('donors')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'donors'
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shrink-0">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          Donatur Tetap
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Infaq & Donasi
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Notulensi AI */}
                  {canAccessTab('minutes') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('minutes')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'minutes'
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-800 shrink-0">
                        <PenTool className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          Notulensi Rapat
                        </p>
                        <p className="text-[10px] text-slate-500 truncate">
                          Ekstraksi AI Gemini
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Super Admin Pusat IT */}
                  {canAccessTab('superadmin') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('superadmin')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'superadmin'
                          ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-slate-900 text-white shrink-0">
                        <Shield className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Pusat Data IT
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Super Admin
                        </p>
                      </div>
                    </button>
                  )}

                  {/* 74 Program Raker */}
                  {canAccessTab('program-kerja') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('program-kerja')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'program-kerja'
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          74 Program Raker
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Monitoring Seksi
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Rapat & Presensi */}
                  {canAccessTab('meetings') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('meetings')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'meetings'
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Rapat Terpadu
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Presensi & Notulen
                        </p>
                      </div>
                    </button>
                  )}

                  {/* Panitia Ad-hoc & SK */}
                  {canAccessTab('adhoc') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('adhoc')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'adhoc'
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Panitia Ad-hoc
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Generator SK DKM
                        </p>
                      </div>
                    </button>
                  )}

                  {/* TPA & Santri */}
                  {canAccessTab('tpa') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('tpa')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'tpa'
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          TPA & Santri
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Hafalan & SPP
                        </p>
                      </div>
                    </button>
                  )}

                  {/* UMKM & Gerai Muslimah */}
                  {canAccessTab('umkm') && (
                    <button
                      type="button"
                      onClick={() => handleSelectTab('umkm')}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'umkm'
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          Sentra UMKM
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          Gerai & Qardh
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Actions Bar */}
              {!isReadOnly && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
                    Aksi Cepat
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {onOpenCreateTransaction && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreOpen(false);
                          onOpenCreateTransaction();
                        }}
                        className="min-h-[44px] p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold flex flex-col items-center justify-center text-center border border-emerald-200/70 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-emerald-700 mb-0.5" />
                        <span>Catat Kas</span>
                      </button>
                    )}

                    {onOpenCreateLetter && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreOpen(false);
                          onOpenCreateLetter();
                        }}
                        className="min-h-[44px] p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 text-[11px] font-bold flex flex-col items-center justify-center text-center border border-teal-200/70 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-teal-700 mb-0.5" />
                        <span>Buat Surat</span>
                      </button>
                    )}

                    {onOpenCreateJamaah && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsMoreOpen(false);
                          onOpenCreateJamaah();
                        }}
                        className="min-h-[44px] p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex flex-col items-center justify-center text-center border border-slate-200 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4 text-slate-700 mb-0.5" />
                        <span>Data Warga</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* System & Security Actions */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                {/* Dark Mode Switcher */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? (
                       <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-600" />
                    )}
                    <span>{theme === 'dark' ? 'Mode Gelap (Ubah ke Terang)' : 'Mode Terang (Ubah ke Gelap)'}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {theme === 'dark' ? 'Gelap' : 'Terang'}
                  </span>
                </button>

                {/* Mode Teks Besar Switcher (A+) */}
                <button
                  type="button"
                  onClick={toggleTextSize}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-black text-[11px]">
                      A+
                    </span>
                    <span>{isLargeText ? 'Mode Teks Besar (Aktif)' : 'Mode Teks Besar (Mudah Dibaca)'}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isLargeText
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {isLargeText ? 'Aktif' : 'Standar'}
                  </span>
                </button>

                {onOpenAuditLogs && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenAuditLogs();
                    }}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span>Log Audit & Keamanan DKM</span>
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
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Cadangkan & Pulihkan Basis Data</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsMoreOpen(false);
                    logout();
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center justify-between border border-rose-100 dark:border-rose-900/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Keluar dari Sesi</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-rose-300" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
