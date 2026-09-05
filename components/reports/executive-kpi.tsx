'use client';

import React from 'react';
import { FieldKPI } from '@/types/reports';
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  Users,
  Wallet,
  Wrench,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ExecutiveKPIProps {
  kpis: FieldKPI[];
  overallScore: number;
  overallGrade: string;
  onOpenLPJGenerator: () => void;
}

export default function ExecutiveKPI({
  kpis,
  overallScore,
  overallGrade,
  onOpenLPJGenerator,
}: ExecutiveKPIProps) {
  const getFieldIcon = (field: string) => {
    switch (field) {
      case 'KESEKRETARIATAN':
        return <FileCheck2 className="w-5 h-5 text-emerald-600" />;
      case 'KEMASJIDAN_JAMAAH':
        return <Users className="w-5 h-5 text-teal-600" />;
      case 'KEUANGAN_PERBENDAHARAAN':
        return <Wallet className="w-5 h-5 text-amber-600" />;
      case 'SARANA_PRASARANA':
        return <Wrench className="w-5 h-5 text-blue-600" />;
      default:
        return <Building2 className="w-5 h-5 text-slate-600" />;
    }
  };

  const getScoreBadge = (status: string) => {
    switch (status) {
      case 'SANGAT_BAIK':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Sangat Baik
          </span>
        );
      case 'BAIK':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
            Baik
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            Perlu Perhatian
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Health Score Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 shadow-inner">
            <ShieldCheck className="w-7 h-7 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Dewan Penasehat & Pengawas DKM
              </span>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full font-semibold">
                Periode 2026-2029
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1">
              Indeks Kesehatan Tata Kelola & Kinerja Organisasi
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
              Agregasi evaluasi performa 4 pilar bidang: ketertiban persuratan, jangkauan sensus jamaah BTP Blok AE, kepatuhan rekening kas satu pintu PHBI, dan keandalan sarpras.
            </p>
          </div>
        </div>

        {/* Big Score Card */}
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/15 shrink-0 self-end md:self-center">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-indigo-200">
              Skor Agregat DKM
            </p>
            <p className="text-3xl font-black text-white">{overallScore}<span className="text-sm font-normal text-indigo-200">/100</span></p>
          </div>
          <div className="h-10 w-[1px] bg-white/20"></div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-indigo-200">
              Predikat Kinerja
            </p>
            <p className="text-sm font-bold text-emerald-300">{overallGrade}</p>
          </div>
        </div>
      </div>

      {/* 4 Field KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.field}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {getFieldIcon(kpi.field)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {kpi.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {kpi.leaderName}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-lg font-black text-slate-900">{kpi.score}%</div>
                  {getScoreBadge(kpi.status)}
                </div>
              </div>

              {/* Summary Text */}
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {kpi.summary}
              </p>

              {/* Progress Indicators */}
              <div className="mt-4 space-y-2.5">
                {kpi.indicators.map((ind, i) => (
                  <div key={i} className="text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-700">{ind.label}</span>
                      <span className="text-slate-500 font-mono">
                        {ind.current} / {ind.target} {ind.unit} ({ind.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          ind.percent >= 100
                            ? 'bg-emerald-500'
                            : ind.percent >= 85
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(ind.percent, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Notes Accordion / Footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/60 -mx-5 -mb-5 p-3 px-5 rounded-b-xl">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Catatan Capaian Dewan Penasehat:
              </p>
              <ul className="text-[11px] text-slate-600 space-y-1 pl-4 list-disc marker:text-emerald-500">
                {kpi.keyNotes.map((note, nIdx) => (
                  <li key={nIdx}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Footer */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Seluruh indikator kinerja ini dihitung secara real-time dari aktivitas operasional 4 pilar bidang DKM Babul Khaer.</span>
        </div>

        <button
          onClick={onOpenLPJGenerator}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
        >
          <span>Susun Draf LPJ Tahunan</span>
        </button>
      </div>
    </div>
  );
}
