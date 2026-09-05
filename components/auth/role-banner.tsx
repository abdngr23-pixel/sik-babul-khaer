'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Eye, ArrowRightLeft, ShieldCheck } from 'lucide-react';

interface RoleBannerProps {
  onOpenSwitchRole: () => void;
  onOpenAuditLogs: () => void;
}

export default function RoleBanner({ onOpenSwitchRole, onOpenAuditLogs }: RoleBannerProps) {
  const { currentUser, isReadOnly } = useAuth();

  if (!isReadOnly) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-300/60 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
          <Eye className="w-3.5 h-3.5" />
        </div>
        <div>
          <span className="font-bold text-amber-900 tracking-wide uppercase text-[11px] bg-amber-100 px-2 py-0.5 rounded border border-amber-300 mr-2">
            Mode Pengawas (Read-Only)
          </span>
          <span className="font-medium text-slate-700">
            Anda login sebagai <strong>{currentUser.name}</strong> ({currentUser.title}). Seluruh aksi penambahan, perubahan, dan disposisi data dinonaktifkan untuk tujuan audit & evaluasi independen.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenAuditLogs}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-semibold text-[11px] transition-all cursor-pointer shadow-2xs"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
          <span>Buka Log Audit</span>
        </button>
        <button
          onClick={onOpenSwitchRole}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-700 hover:bg-amber-800 text-white font-semibold text-[11px] transition-all cursor-pointer shadow-2xs"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Ganti Peran Pengurus</span>
        </button>
      </div>
    </div>
  );
}
