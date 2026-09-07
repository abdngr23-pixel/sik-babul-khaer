'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  ArrowRightLeft,
  ShieldCheck,
  Eye,
  Shield,
  Search,
  Bell,
  ArrowLeft,
  Sun,
  Moon,
  Compass,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { UserRole } from '@/types/auth';
import { AppNavTab } from '@/types/navigation';
import PrayerWidget from './prayer-widget';

interface NavbarProps {
  onOpenCreate: () => void;
  createButtonLabel?: string;
  onOpenSwitchRole?: () => void;
  onOpenAuditLogs?: () => void;
  hideCreateButton?: boolean;
  pendingApprovalsCount?: number;
  globalSearchQuery?: string;
  onGlobalSearchChange?: (q: string) => void;
  onToggleMobileMenu?: () => void;
  activeTab?: AppNavTab;
  onGoBack?: () => void;
  previousTabLabel?: string;
}

export default function Navbar({
  onOpenCreate,
  createButtonLabel = 'Buat Baru',
  onOpenSwitchRole,
  onOpenAuditLogs,
  hideCreateButton = false,
  pendingApprovalsCount = 0,
  globalSearchQuery = '',
  onGlobalSearchChange,
  activeTab = 'dashboard',
  onGoBack,
  previousTabLabel,
}: NavbarProps) {
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Lazy initializer to format date
  const [currentDateStr] = useState(() => {
    try {
      const today = new Date();
      return today.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Sabtu, 5 September 2026';
    }
  });

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'KETUA_UMUM':
        return 'bg-indigo-50 text-indigo-900 border-indigo-200/80';
      case 'SEKRETARIS':
        return 'bg-emerald-50 text-emerald-900 border-emerald-200/80';
      case 'BENDAHARA':
        return 'bg-amber-50 text-amber-900 border-amber-200/80';
      case 'SARPRAS':
        return 'bg-orange-50 text-orange-900 border-orange-200/80';
      case 'KEMASJIDAN':
        return 'bg-teal-50 text-teal-900 border-teal-200/80';
      case 'DEWAN_PENGAWAS':
        return 'bg-purple-50 text-purple-900 border-purple-300';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    if (role === 'DEWAN_PENGAWAS') return <Eye className="w-3.5 h-3.5 text-purple-600" />;
    return <Shield className="w-3.5 h-3.5 text-emerald-600" />;
  };

  return (
    <header className="h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-2.5 sm:px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-soft-sm gap-1.5 sm:gap-3 max-w-full overflow-hidden transition-colors">
      {/* Left: Islamic Greeting & Title */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink min-w-0 overflow-hidden">
        {/* Mobile: Logo DKM (Gaya App Konsumen) */}
        <div className="md:hidden w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 p-1 flex items-center justify-center shrink-0">
          <Image
            src="/logo-babul-khaer.png"
            alt="Logo Masjid Babul Khaer"
            width={28}
            height={28}
            className="object-contain"
          />
        </div>

        {/* Back Button (Navbar) */}
        {onGoBack && activeTab !== 'dashboard' && (
          <button
            type="button"
            onClick={onGoBack}
            className="inline-flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 active:bg-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-200/90 dark:border-emerald-800 shadow-2xs transition-all cursor-pointer group shrink-0"
            title={`Kembali ke ${previousTabLabel || 'Menu Sebelumnya'}`}
            aria-label={`Kembali ke ${previousTabLabel || 'Menu Sebelumnya'}`}
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-emerald-700 dark:text-emerald-400" />
            <span className="hidden sm:inline">Kembali</span>
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap hidden sm:inline">Assalamu&apos;alaikum,</span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[90px] xs:max-w-[120px] sm:max-w-[180px] xl:max-w-xs block">
              {currentUser.name}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold truncate hidden sm:block">
            SIK-MBH • Kompleks BTP Blok AE Makassar
          </p>
        </div>
      </div>

      {/* Center: Global Smart Search Capsule */}
      <div className="relative hidden md:block max-w-[200px] lg:max-w-[240px] w-full mx-1 shrink">
        <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={globalSearchQuery}
          onChange={(e) => onGlobalSearchChange?.(e.target.value)}
          placeholder="Cari surat, jamaah, kas..."
          className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#F1F5F9] dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-transparent focus:border-[#059669] focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all shadow-2xs"
        />
      </div>

      {/* Right: Prayer Schedule, Theme Toggle & Control Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Dynamic Prayer Schedule Widget (Makassar WITA) */}
        <PrayerWidget />

        {/* Dark Mode Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          aria-label={theme === 'dark' ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Gelap'}
          className="p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer shrink-0"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-spin-once" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Link Portal Publik & QRIS */}
        <Link
          href="/publik"
          target="_blank"
          title="Buka Portal Publik & Donasi QRIS"
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800 text-[11px] font-bold transition-colors shrink-0"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Portal Publik</span>
        </Link>


        {/* Date Display (Visible on 2xl screens to prevent navbar crowding) */}
        <div className="hidden 2xl:flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200/70 dark:border-slate-700 shadow-2xs">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[11px] font-semibold whitespace-nowrap">{currentDateStr}</span>
        </div>

        {/* Notification Bell (Pemberitahuan Disposisi Pending) */}
        {pendingApprovalsCount > 0 && (
          <button
            onClick={onOpenAuditLogs}
            title={`${pendingApprovalsCount} pengajuan menunggu disposisi Ketua Umum`}
            className="relative p-1.5 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>
        )}

        {/* Audit Log button for Pengawas & Ketua */}
        {onOpenAuditLogs && (currentUser.role === 'DEWAN_PENGAWAS' || currentUser.role === 'KETUA_UMUM') && (
          <button
            onClick={onOpenAuditLogs}
            title="Buka Log Audit Aktivitas Sistem"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition-all cursor-pointer shadow-soft-sm shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Log Audit</span>
          </button>
        )}

        {/* Active Role Card & Switch Button */}
        <div
          onClick={onOpenSwitchRole}
          title={`Klik untuk beralih akun: ${currentUser.roleLabel}`}
          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl border text-xs cursor-pointer hover:shadow-soft-sm transition-all shrink-0 ${getRoleBadgeStyle(
            currentUser.role
          )}`}
        >
          {getRoleIcon(currentUser.role)}
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-bold text-[11px] leading-tight whitespace-nowrap">
              {currentUser.roleLabel}
            </span>
          </div>
          <ArrowRightLeft className="w-3 h-3 text-slate-400 hover:text-slate-600 ml-0.5 sm:ml-1" />
        </div>

        {/* Action Button (Dynamic per module) */}
        {!hideCreateButton && (
          <button
            onClick={onOpenCreate}
            title={createButtonLabel}
            className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline whitespace-nowrap">{createButtonLabel}</span>
          </button>
        )}
      </div>
    </header>
  );
}
