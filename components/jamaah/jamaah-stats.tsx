'use client';

import React from 'react';
import { JamaahStats } from '@/types/jamaah';
import { Users, Home, HeartHandshake, Sparkles, MapPin } from 'lucide-react';

interface JamaahStatsProps {
  stats: JamaahStats | null;
  selectedRT: string;
  onSelectRT: (rt: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
}

export default function JamaahStatsCards({
  stats,
  selectedRT,
  onSelectRT,
  selectedStatus,
  onSelectStatus,
}: JamaahStatsProps) {
  if (!stats) return null;

  return (
    <div className="space-y-4">
      {/* 4 Main Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Warga */}
        <div
          onClick={() => {
            onSelectRT('ALL');
            onSelectStatus('ALL');
          }}
          className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Jiwa Terdata
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalJamaah}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
              Warga BTP Blok AE
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Kepala Keluarga (KK) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kepala Keluarga (KK)
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalKK}
            </p>
            <p className="text-[11px] text-blue-600 font-medium mt-0.5">
              Rumah Tangga Aktif
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
            <Home className="w-5 h-5" />
          </div>
        </div>

        {/* Mustahiq & Dhuafa */}
        <div
          onClick={() => onSelectStatus('MUSTAHIQ_ALL')}
          className={`bg-white rounded-xl p-4 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
            selectedStatus === 'MUSTAHIQ_ALL'
              ? 'border-amber-500 ring-2 ring-amber-200 bg-amber-50/20'
              : 'border-slate-200 hover:border-amber-400'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Mustahiq & Dhuafa
              </p>
              <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded">
                Bansos
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-700 mt-1">
              {stats.totalMustahiq}
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5">
              Prioritas ZISWAF & Bantuan
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        {/* Remaja Masjid (IRMA) */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Remaja & Kader Dakwah
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {stats.totalYouth}
            </p>
            <p className="text-[11px] text-teal-600 font-medium mt-0.5">
              Anggota IRMA Babul Khaer
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* RT Quick Filter Pills */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600 font-semibold">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Sebaran Wilayah BTP Blok AE:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onSelectRT('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedRT === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Semua ({stats.totalJamaah})
          </button>

          {Object.entries(stats.byRT).map(([rtName, count]) => (
            <button
              key={rtName}
              onClick={() => onSelectRT(rtName)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedRT === rtName
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>{rtName}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                  selectedRT === rtName
                    ? 'bg-emerald-700 text-emerald-100'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
