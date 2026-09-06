'use client';

import React from 'react';
import Image from 'next/image';
import {
  Users,
  Wallet,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Inbox,
  PenTool,
  CheckSquare,
  HeartHandshake,
  Wrench,
  ArrowRightLeft,
  Eye,
  Shield,
  MapPin,
  LayoutDashboard,
  Database,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export type AppNavTab =
  | 'dashboard'
  | 'archive'
  | 'create'
  | 'minutes'
  | 'jamaah'
  | 'mustahiq'
  | 'finance'
  | 'donors'
  | 'assets'
  | 'reports'
  | 'approvals';

interface SidebarProps {
  activeTab: AppNavTab;
  setActiveTab: (tab: AppNavTab) => void;
  onOpenCreateLetter: () => void;
  onOpenCreateJamaah: () => void;
  onOpenCreateTransaction?: () => void;
  onOpenCreateAsset?: () => void;
  onOpenLPJModal?: () => void;
  onOpenSwitchRole?: () => void;
  onOpenAuditLogs?: () => void;
  onOpenBackupModal?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onOpenCreateLetter,
  onOpenCreateJamaah,
  onOpenCreateTransaction,
  onOpenCreateAsset,
  onOpenSwitchRole,
  onOpenAuditLogs,
  onOpenBackupModal,
}: SidebarProps) {
  const { currentUser, isReadOnly, canAccessTab, canMutateTab, logout } = useAuth();

  // Role visibility checks
  const showPhase1 =
    canAccessTab('archive') || canAccessTab('create') || canAccessTab('minutes');
  const showPhase2 = canAccessTab('jamaah') || canAccessTab('mustahiq');
  const showKeuangan = canAccessTab('finance') || canAccessTab('donors');
  const showSarpras = canAccessTab('assets');
  const showPhase4 = canAccessTab('reports') || canAccessTab('approvals');

  return (
    <aside className="w-72 bg-white text-slate-800 flex flex-col border-r border-slate-200/80 shrink-0 h-screen sticky top-0 overflow-y-auto shadow-soft-sm z-30">
      {/* Brand Header: Official Logo + Mosque Identity */}
      <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-emerald-50/50 via-white to-white">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl bg-white p-1.5 shadow-soft-md border border-emerald-100 flex items-center justify-center shrink-0">
            <Image
              src="/logo-babul-khaer.png"
              alt="Logo Resmi Masjid Babul Khaer"
              width={44}
              height={44}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900 leading-tight">
                SIK-MBH
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                v1.5
              </span>
            </div>
            <p className="text-xs text-emerald-800 font-bold truncate">
              DKM Masjid Babul Khaer
            </p>
          </div>
        </div>

        {/* Location Subtext Badge */}
        <div className="mt-3 text-[11px] text-slate-600 bg-slate-50/90 rounded-xl px-2.5 py-1.5 flex items-center justify-between border border-slate-200/70 shadow-2xs">
          <div className="flex items-center gap-1 text-emerald-700 font-medium truncate">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-800">BTP Blok AE</span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Tamalanrea, Makassar</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3.5 py-4 space-y-5">
        {/* Menu Utama (Pusat Kendali) */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Menu Utama
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              Utama
            </span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#059669] text-white shadow-soft-md'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Pusat Kendali (Dashboard)</span>
            </button>
          </nav>
        </div>

        {/* Administrasi & Persuratan */}
        {showPhase1 && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Administrasi & Surat
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Resmi
              </span>
            </div>

            <nav className="space-y-1">
              {canAccessTab('archive') && (
                <button
                  onClick={() => setActiveTab('archive')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'archive'
                      ? 'bg-[#059669] text-white shadow-soft-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Inbox className="w-4 h-4" />
                  <span>E-Arsip Surat Dinas</span>
                </button>
              )}

              {canMutateTab('archive') && !isReadOnly && (
                <button
                  onClick={() => onOpenCreateLetter()}
                  className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-all cursor-pointer"
                >
                  <PenTool className="w-4 h-4 text-emerald-600" />
                  <span>Buat Surat Baru</span>
                  <Sparkles className="w-3.5 h-3.5 ml-auto text-amber-500" />
                </button>
              )}

              {canAccessTab('minutes') && (
                <button
                  onClick={() => setActiveTab('minutes')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'minutes'
                      ? 'bg-[#059669] text-white shadow-soft-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Notulensi Rapat AI</span>
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                    Gemini
                  </span>
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Database Jamaah & Sosial */}
        {showPhase2 && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Database Jamaah
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200/60">
                Sensus
              </span>
            </div>

            <nav className="space-y-1">
              {canAccessTab('jamaah') && (
                <button
                  onClick={() => setActiveTab('jamaah')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'jamaah'
                      ? 'bg-[#059669] text-white shadow-soft-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Basis Data Warga</span>
                </button>
              )}

              {canAccessTab('mustahiq') && (
                <button
                  onClick={() => setActiveTab('mustahiq')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'mustahiq'
                      ? 'bg-[#059669] text-white shadow-soft-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  <span>Mustahiq & Bansos</span>
                  <span className="ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800">
                    ZISWAF
                  </span>
                </button>
              )}

              {canMutateTab('jamaah') && !isReadOnly && (
                <button
                  onClick={() => onOpenCreateJamaah()}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-semibold text-teal-700 bg-teal-50/70 border border-teal-200/50 hover:bg-teal-100/70 hover:text-teal-900 transition-all cursor-pointer mt-1"
                >
                  <span>+ Registrasi Warga Baru</span>
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Keuangan & Perbendaharaan */}
        {showKeuangan && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Keuangan & Kas
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                Amanah
              </span>
            </div>

            <nav className="space-y-1">
              {canAccessTab('finance') && (
                <button
                  onClick={() => setActiveTab('finance')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'finance'
                      ? 'bg-[#059669] text-white shadow-soft-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Buku Kas & PHBI</span>
                </button>
              )}

              {canAccessTab('donors') && (
                <button
                  onClick={() => setActiveTab('donors')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'donors'
                      ? 'bg-[#059669] text-white shadow-soft-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4" />
                  <span>Donatur Tetap</span>
                  <span
                    className={`ml-auto text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      activeTab === 'donors'
                        ? 'bg-white/20 text-white'
                        : 'bg-teal-100 text-teal-800'
                    }`}
                  >
                    Rutin
                  </span>
                </button>
              )}

              {canMutateTab('finance') && !isReadOnly && onOpenCreateTransaction && (
                <button
                  onClick={() => onOpenCreateTransaction()}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-semibold text-amber-800 bg-amber-50/70 border border-amber-200/60 hover:bg-amber-100/70 transition-all cursor-pointer mt-1"
                >
                  <span>+ Catat Transaksi Kas</span>
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Sarana & Prasarana Fisik */}
        {showSarpras && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Sarana & Prasarana
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Fasilitas
              </span>
            </div>

            <nav className="space-y-1">
              {canAccessTab('assets') && (
                <button
                  onClick={() => setActiveTab('assets')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'assets'
                      ? 'bg-[#059669] text-white shadow-soft-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>Inventaris Sarpras</span>
                </button>
              )}

              {canMutateTab('assets') && !isReadOnly && onOpenCreateAsset && (
                <button
                  onClick={() => onOpenCreateAsset()}
                  className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-semibold text-emerald-800 bg-emerald-50/70 border border-emerald-200/60 hover:bg-emerald-100/70 transition-all cursor-pointer mt-1"
                >
                  <span>+ Daftarkan Aset Baru</span>
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Laporan & Pengesahan */}
        {showPhase4 && (
          <div>
            <div className="px-3 mb-2 flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Laporan & Pengesahan
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                Pilar
              </span>
            </div>

            <nav className="space-y-1">
              {canAccessTab('reports') && (
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'reports'
                      ? 'bg-[#059669] text-white shadow-soft-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Evaluasi & Dokumen LPJ</span>
                </button>
              )}

              {canAccessTab('approvals') && (
                <button
                  onClick={() => setActiveTab('approvals')}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'approvals'
                      ? 'bg-[#059669] text-white shadow-soft-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pengesahan Satu Pintu</span>
                </button>
              )}
            </nav>
          </div>
        )}

        {/* Akses & Keamanan */}
        <div>
          <div className="px-3 mb-2 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Akses & Keamanan
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
              Aman
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            {onOpenSwitchRole && (
              <button
                onClick={onOpenSwitchRole}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-purple-800 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60 transition-all cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <ArrowRightLeft className="w-4 h-4 text-purple-600" />
                  <span>Ganti Akun Pengurus</span>
                </div>
                <span className="text-[10px] bg-purple-200/70 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
                  Multi-Role
                </span>
              </button>
            )}

            {onOpenAuditLogs && (currentUser.role === 'DEWAN_PENGAWAS' || currentUser.role === 'KETUA_UMUM') && (
              <button
                onClick={onOpenAuditLogs}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-slate-700 bg-slate-100/70 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Log Audit Aktivitas</span>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                  Audit
                </span>
              </button>
            )}

            {onOpenBackupModal && (
              <button
                onClick={onOpenBackupModal}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-emerald-800 bg-emerald-50/90 hover:bg-emerald-100/80 border border-emerald-200/70 transition-all cursor-pointer font-medium"
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 text-emerald-700" />
                  <span>Cadangan Data (Backup)</span>
                </div>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                  SQLite
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Profile in Footer - Soft Tactile Elevation */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 text-xs mt-auto">
        <div className="p-2.5 bg-white rounded-2xl border border-slate-200/70 shadow-soft-sm flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {isReadOnly ? <Eye className="w-4 h-4 text-purple-600" /> : <Shield className="w-4 h-4 text-emerald-600" />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 leading-tight truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold truncate">
                {currentUser.title}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout()}
            title="Keluar / Ganti Divisi Fitur"
            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer shrink-0 ml-1.5 border border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
          </button>
        </div>

        <div className="pt-2 px-1 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span>SIK-MBH Babul Khaer</span>
          <button
            onClick={() => logout()}
            className="text-rose-600 hover:text-rose-700 font-semibold hover:underline cursor-pointer"
          >
            Keluar Divisi
          </button>
        </div>
      </div>
    </aside>
  );
}
