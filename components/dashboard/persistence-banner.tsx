'use client';

import React, { useState, useEffect } from 'react';
import { Database, CloudCheck, AlertTriangle, Download, X } from 'lucide-react';

interface PersistenceBannerProps {
  onOpenBackupModal?: () => void;
}

export default function PersistenceBanner({ onOpenBackupModal }: PersistenceBannerProps) {
  const [engine, setEngine] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchDbStats() {
      try {
        const res = await fetch('/api/database/backup?type=stats');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.stats && isMounted) {
            setEngine(json.stats.engine || 'local_sqlite');
          }
        }
      } catch {
        if (isMounted) setEngine('local_sqlite');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDbStats();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading || isDismissed) return null;

  const isTursoCloud = engine === 'turso_cloud';
  const isVercelTmp = engine === 'vercel_tmp';

  if (isTursoCloud) {
    return (
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 rounded-2xl p-3.5 px-4.5 mb-6 text-white shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
            <CloudCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Turso Cloud LibSQL Aktif</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-semibold">
                Persisten AWS Tokyo
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Seluruh 10 modul basis data tersinkronisasi persisten di cloud. Data tidak akan hilang saat cold start atau redeploy Vercel.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onOpenBackupModal && (
            <button
              onClick={onOpenBackupModal}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>Unduh Snapshot</span>
            </button>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Sembunyikan pemberitahuan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Jika berjalan di mode ephemeral / tmp tanpa kredensial Turso
  if (isVercelTmp) {
    return (
      <div className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/40 rounded-2xl p-4 mb-6 text-white shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-300">Peringatan Penyimpanan Ephemeral (Vercel /tmp)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                Perlu Backup Berkala
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
              Basis data saat ini tersimpan sementara di filesystem Vercel. Segera hubungkan TURSO_DATABASE_URL di environment variables Vercel atau unduh cadangan snapshot JSON secara berkala.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onOpenBackupModal && (
            <button
              onClick={onOpenBackupModal}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Cadangkan Sekarang</span>
            </button>
          )}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Sembunyikan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Mode lokal standard (development)
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 px-4 mb-6 text-white shadow-soft-sm flex items-center justify-between text-xs">
      <div className="flex items-center gap-2.5">
        <Database className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-slate-300">
          Mode Basis Data Lokal: <span className="font-mono text-emerald-400 font-semibold">SQLite Wal Mode</span> (data/babul_khaer.sqlite)
        </span>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="text-slate-400 hover:text-white p-1 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
