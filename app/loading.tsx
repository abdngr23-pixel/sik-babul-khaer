import React from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white p-2 border border-slate-200 shadow-md flex items-center justify-center">
          <Image
            src="/logo-babul-khaer.png"
            alt="Logo Masjid Babul Khaer"
            width={48}
            height={48}
            className="w-full h-full object-contain animate-pulse"
            priority
          />
        </div>

        <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memuat Sistem Informasi DKM Babul Khaer...</span>
        </div>

        <p className="text-[11px] text-slate-400">
          Sinkronisasi modul e-arsip, keuangan satu pintu & sensus jamaah
        </p>
      </div>
    </div>
  );
}
