'use client';

import React from 'react';
import { AlertTriangle, TrendingDown, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { CURRENT_RUNWAY_METRICS } from '@/lib/raker-budget-data';

export default function CashflowRunwayAlert() {
  const data = CURRENT_RUNWAY_METRICS;
  const isWarning = data.healthStatus === 'WARNING';
  const isCritical = data.healthStatus === 'CRITICAL';

  // Persentase runway terhadap target aman 3 bulan
  const runwayPercent = Math.min(Math.round((data.runwayMonths / 3.0) * 100), 100);

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 transition-all shadow-soft-sm relative overflow-hidden mb-6 ${
        isCritical
          ? 'bg-rose-50/70 border-rose-200 text-rose-950'
          : isWarning
          ? 'bg-amber-50/60 border-amber-200/90 text-amber-950'
          : 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
      }`}
    >
      {/* Decorative subtle background badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-amber-200/60">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-soft-sm ${
              isCritical
                ? 'bg-rose-600 text-white'
                : isWarning
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {isCritical ? (
              <ShieldAlert className="w-6 h-6" />
            ) : isWarning ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                Catatan Raker 2026 — Bendahara Umum (H. Sahali)
              </span>
              <span className="text-xs font-semibold text-slate-600">
                Peringatan Proyeksi Defisit Kas Operasional
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
              Ketahanan Kas Operasional Saat Ini: {data.runwayMonths} Bulan
            </h3>
          </div>
        </div>

        {/* Highlight Score Pill */}
        <div className="flex items-center gap-2 self-start lg:self-center bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-amber-200 shadow-2xs">
          <TrendingDown className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="text-right text-xs">
            <span className="text-slate-500 block text-[10px] font-medium">Batas Aman DKM:</span>
            <span className="font-bold text-slate-800">Minimal 3.0 Bulan Cadangan</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 py-4">
        <div className="bg-white/90 rounded-xl p-3.5 border border-slate-200/70 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Kebutuhan Operasional Bulanan</p>
          <p className="text-base font-extrabold text-slate-900 mt-0.5">
            Rp {data.monthlyOperationalTarget.toLocaleString('id-ID')}
            <span className="text-[10px] font-normal text-slate-500">/bulan</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Listrik, imam, kebersihan & servis rutin</p>
        </div>

        <div className="bg-white/90 rounded-xl p-3.5 border border-slate-200/70 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Estimasi Penerimaan Mingguan</p>
          <p className="text-base font-extrabold text-amber-700 mt-0.5">
            Rp 2.000.000 – Rp 3.000.000
            <span className="text-[10px] font-normal text-slate-500">/pekan</span>
          </p>
          <p className="text-[10px] text-amber-800 mt-1">Total ±Rp 8-12 Juta/bulan (Fluktuatif)</p>
        </div>

        <div className="bg-white/90 rounded-xl p-3.5 border border-slate-200/70 shadow-2xs">
          <p className="text-[11px] font-medium text-slate-500">Rasio Ketahanan Saldo</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-base font-extrabold text-slate-900">
              {data.runwayMonths} Bulan
            </span>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
              {runwayPercent}% Target
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCritical ? 'bg-rose-500' : 'bg-amber-500'
              }`}
              style={{ width: `${runwayPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bullet Recommendations from Bendahara / Raker */}
      <div className="mt-2 pt-3 border-t border-amber-200/60 bg-amber-100/30 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:p-5 rounded-b-2xl">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>Langkah Pengendalian Anggaran (Mandat Sidang Pleno):</span>
        </div>
        <ul className="space-y-1.5 text-xs text-amber-950 font-normal">
          {data.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-600 font-bold">•</span>
              <span className="leading-relaxed">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
