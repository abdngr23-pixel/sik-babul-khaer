'use client';

import React from 'react';

interface DashboardKpiCardProps {
  overallScore: number | null;
  overallGrade: string;
}

export default function DashboardKpiCard({ overallScore, overallGrade }: DashboardKpiCardProps) {
  const isLoaded = overallScore !== null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Indeks Kesehatan DKM
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
          {isLoaded ? overallGrade : 'Memuat KPI...'}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        {isLoaded ? (
          <>
            <span className="text-3xl font-black text-slate-900">
              {overallScore}%
            </span>
            <span className="text-xs text-emerald-600 font-semibold">
              Kinerja Terukur
            </span>
          </>
        ) : (
          <div className="flex items-center gap-2 py-1">
            <span className="text-3xl font-black text-slate-300 animate-pulse">...</span>
            <span className="text-xs text-slate-400">Menghitung agregat 4 pilar...</span>
          </div>
        )}
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            isLoaded ? 'bg-emerald-500' : 'bg-slate-300 animate-pulse'
          }`}
          style={{ width: `${overallScore || 0}%` }}
        />
      </div>

      <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
        Penilaian agregat otomatis berdasarkan ketercapaian target dakwah, kedisiplinan pencatatan kas, dan pemeliharaan fasilitas ibadah.
      </p>
    </div>
  );
}
