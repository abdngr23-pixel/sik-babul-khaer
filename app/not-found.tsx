import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mx-auto shadow-xs">
          <Compass className="w-8 h-8" />
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
          <span className="text-4xl font-extrabold text-slate-900 tracking-tight">404</span>
          <h1 className="text-base font-bold text-slate-900 mt-1">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            Tautan atau rute yang Anda tuju tidak terdaftar pada modul Sistem Informasi DKM Babul Khaer.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Pusat Kendali</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
