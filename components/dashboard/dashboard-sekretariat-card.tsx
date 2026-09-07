'use client';

import React from 'react';
import { Inbox, ListTodo, ArrowUpRight } from 'lucide-react';
import { OfficialLetter, MeetingMinutes } from '@/types/letter';
import { AppNavTab } from '@/components/layout/sidebar';

interface DashboardSekretariatCardProps {
  letters: OfficialLetter[];
  minutes: MeetingMinutes[];
  onNavigateTab: (tab: AppNavTab) => void;
  onPreviewLetter: (letter: OfficialLetter) => void;
}

export default function DashboardSekretariatCard({
  letters,
  minutes,
  onNavigateTab,
  onPreviewLetter,
}: DashboardSekretariatCardProps) {
  return (
    <div className="space-y-6">
      {/* 1. Surat Dinas & Persuratan Terbaru */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60">
              <Inbox className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                Surat Dinas & Persuratan Terbaru
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                E-Arsip dokumen dinas terbit & riwayat pengesahan
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('archive')}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Buka E-Arsip</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {letters.slice(0, 4).map((l) => (
            <div
              key={l.id}
              className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                    {l.letterNumber}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      l.status === 'APPROVED' || l.status === 'SENT'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                        : l.status === 'ARCHIVED'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    {l.status === 'APPROVED'
                      ? 'Disetujui'
                      : l.status === 'SENT'
                      ? 'Terkirim'
                      : l.status === 'ARCHIVED'
                      ? 'Diarsipkan'
                      : 'Draf'}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                    {l.letterDate}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {l.subject}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  Tujuan: {l.recipientName} ({l.recipientTitle || l.recipientAddress || 'Jamaah'})
                </p>
              </div>

              <button
                onClick={() => onPreviewLetter(l)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all cursor-pointer shrink-0"
              >
                Lihat A4
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Agenda Rapat & Tindak Lanjut Berjalan */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800/60">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                Agenda & Tindak Lanjut Rapat DKM
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ekstraksi butir tugas terstruktur dari notulensi rapat AI
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('minutes')}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Kelola Notulensi</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-2.5">
          {minutes.length > 0 && minutes[0].actionItems && minutes[0].actionItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                    {item.task}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      PIC: {item.pic}
                    </span>
                    <span>•</span>
                    <span className="text-amber-700 dark:text-amber-400 font-medium">
                      Tenggat: {item.deadline}
                    </span>
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
