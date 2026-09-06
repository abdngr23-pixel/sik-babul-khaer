'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled runtime application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="flex items-center justify-center gap-2">
          <Image
            src="/logo-babul-khaer.png"
            alt="Logo DKM Babul Khaer"
            width={28}
            height={28}
            className="w-7 h-7 object-contain"
          />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            SIK-MBH BTP Blok AE
          </span>
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Terjadi Kendala Teknis Sementara
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Sistem informasi DKM menghadapi anomali saat memproses data. Silakan coba muat ulang komponen ini.
          </p>
          {error?.message && (
            <div className="mt-3 p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-mono text-slate-700 text-left overflow-x-auto">
              {error.message}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Muat Ulang</span>
          </button>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
