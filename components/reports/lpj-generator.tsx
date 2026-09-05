'use client';

import React, { useState } from 'react';
import { LPJReport } from '@/types/reports';
import { formatRupiah } from '@/components/finance/finance-stats';
import {
  FileText,
  Sparkles,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  Calendar,
  Users,
  Wallet,
  Wrench
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface LPJGeneratorProps {
  initialReport: LPJReport | null;
  onPreviewLPJ: (report: LPJReport) => void;
  onRefreshData?: (period: string) => void;
}

export default function LPJGenerator({
  initialReport,
  onPreviewLPJ,
  onRefreshData,
}: LPJGeneratorProps) {
  const [period, setPeriod] = useState(initialReport?.period || 'Tahun Anggaran 2026');
  const [executiveSummary, setExecutiveSummary] = useState(
    initialReport?.executiveSummary || ''
  );
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

  // Local state for lists
  const [achievements, setAchievements] = useState<string[]>(
    initialReport?.keyAchievements || []
  );
  const [challenges, setChallenges] = useState<string[]>(
    initialReport?.challengesAndSolutions || []
  );
  const [recommendations, setRecommendations] = useState<string[]>(
    initialReport?.strategicRecommendations || []
  );

  if (!initialReport) return null;

  const currentReport: LPJReport = {
    ...initialReport,
    period,
    executiveSummary,
    keyAchievements: achievements,
    challengesAndSolutions: challenges,
    strategicRecommendations: recommendations,
  };

  const handleGenerateAI = async () => {
    setIsAiLoading(true);
    setAiSuccessMessage('');

    try {
      const res = await fetch('/api/ai/draft-lpj', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          totalLetters: initialReport.metrics.totalLetters,
          totalJamaah: initialReport.metrics.totalJamaah,
          totalIncome: initialReport.metrics.totalIncome,
          totalExpense: initialReport.metrics.totalExpense,
          netBalance: initialReport.metrics.netBalance,
          phbiBalance: initialReport.metrics.phbiBalance,
          totalAssetsCount: initialReport.metrics.totalAssetsCount,
          maintenanceCompliancePercent: initialReport.metrics.maintenanceCompliancePercent,
          userPrompt: aiPrompt.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.executiveSummary) setExecutiveSummary(data.data.executiveSummary);
        if (data.data.achievements?.length) setAchievements(data.data.achievements);
        if (data.data.challenges?.length) setChallenges(data.data.challenges);
        if (data.data.recommendations?.length) setRecommendations(data.data.recommendations);
        setAiSuccessMessage('Narasi pertanggungjawaban berhasil disintesis oleh Gemini AI!');
      }
    } catch (err) {
      console.error('Failed to generate AI LPJ:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportExcel = () => {
    const metricsData = [
      { Indikator: 'Periode Laporan', Nilai: period },
      { Indikator: 'Total Surat Resmi Terbit', Nilai: initialReport.metrics.totalLetters },
      { Indikator: 'Surat Undangan Kegiatan', Nilai: initialReport.metrics.invitationsCount },
      { Indikator: 'Tugas Rapat (Action Items) Tuntas', Nilai: `${initialReport.metrics.actionItemsCompleted} dari ${initialReport.metrics.actionItemsTotal}` },
      { Indikator: 'Total Sensus Jamaah BTP Blok AE', Nilai: initialReport.metrics.totalJamaah },
      { Indikator: 'Kepala Keluarga (KK) Terdata', Nilai: initialReport.metrics.totalFamilies },
      { Indikator: 'Warga Mustahiq / Penerima Bansos', Nilai: initialReport.metrics.mustahiqCount },
      { Indikator: 'Kader Remaja Masjid (IRMBH)', Nilai: initialReport.metrics.youthMembersCount },
      { Indikator: 'Total Saldo Kas DKM Berjalan (Rp)', Nilai: initialReport.metrics.netBalance },
      { Indikator: 'Saldo Dana Swadaya PHBI Satu Pintu (Rp)', Nilai: initialReport.metrics.phbiBalance },
      { Indikator: 'Penyaluran ZISWAF Mustahiq (Rp)', Nilai: initialReport.metrics.ziswafDisbursed },
      { Indikator: 'Total Aset Terinventarisir', Nilai: initialReport.metrics.totalAssetsCount },
      { Indikator: 'Taksiran Nilai Sarpras (Rp)', Nilai: initialReport.metrics.totalAssetsEstimatedValue },
      { Indikator: 'Tingkat Kesiapan Aset Prima (%)', Nilai: `${initialReport.metrics.maintenanceCompliancePercent}%` },
    ];

    const worksheet = XLSX.utils.json_to_sheet(metricsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ringkasan LPJ MBH');

    worksheet['!cols'] = [{ wch: 45 }, { wch: 30 }];
    const todayStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Rekapitulasi_LPJ_DKM_Babul_Khaer_${todayStr}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Period Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              Modul Eksekutif: Generator LPJ Tahunan & Berkala
            </span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold border border-indigo-200">
              Otomatis & Terintegrasi
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Kompilasi Laporan Pertanggungjawaban (LPJ) Akhir Periode
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Data statistik secara otomatis teragregasi dari modul Persuratan, Jamaah, Kas PHBI, dan Sarpras.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                if (onRefreshData) onRefreshData(e.target.value);
              }}
              className="text-xs py-2 px-3 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Tahun Anggaran 2026">Tahun Anggaran 2026 (Penuh)</option>
              <option value="Semester I (Jan - Jun 2026)">Semester I (Jan - Jun 2026)</option>
              <option value="Semester II (Jul - Des 2026)">Semester II (Jul - Des 2026)</option>
              <option value="Triwulan III 2026">Triwulan III (Jul - Sep 2026)</option>
            </select>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ekspor Data</span>
          </button>

          <button
            onClick={() => onPreviewLPJ(currentReport)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Pratinjau Dokumen A4</span>
          </button>
        </div>
      </div>

      {/* 4 Pillars Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pilar 1: Kesekretariatan */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Pilar I: Persuratan</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {initialReport.metrics.totalLetters}{' '}
            <span className="text-xs font-normal text-slate-500">Surat Terbit</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">
            {initialReport.metrics.actionItemsCompleted}/{initialReport.metrics.actionItemsTotal} Tindak Lanjut Rapat Selesai
          </div>
        </div>

        {/* Pilar 2: Data Jamaah */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Pilar II: Umat & Sensus</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {initialReport.metrics.totalJamaah}{' '}
            <span className="text-xs font-normal text-slate-500">Warga Terdata</span>
          </div>
          <div className="text-[11px] text-teal-700 font-medium mt-1">
            {initialReport.metrics.mustahiqCount} Mustahiq • {initialReport.metrics.totalFamilies} KK Blok AE
          </div>
        </div>

        {/* Pilar 3: Keuangan & PHBI */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Pilar III: Kas & Swadaya</span>
            <Wallet className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {formatRupiah(initialReport.metrics.netBalance)}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Swadaya PHBI: {formatRupiah(initialReport.metrics.phbiBalance)}
          </div>
        </div>

        {/* Pilar 4: Sarana Prasarana */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Pilar IV: Aset Sarpras</span>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {initialReport.metrics.totalAssetsCount}{' '}
            <span className="text-xs font-normal text-slate-500">Unit Terkelola</span>
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">
            Kesiapan {initialReport.metrics.maintenanceCompliancePercent}% • {formatRupiah(initialReport.metrics.totalAssetsEstimatedValue)}
          </div>
        </div>
      </div>

      {/* Gemini AI Narration Assistant Card */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md border border-indigo-800/60">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                Asisten Sintesis Narasi LPJ (Gemini 2.5 Flash AI)
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5 max-w-2xl">
                Otomatiskan perumusan narasi mukadimah, evaluasi program kerja, dan poin rekomendasi strategis kelembagaan Islam yang fasih dan terstruktur.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row items-stretch gap-2.5">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Instruksi penekanan khusus (misal: 'Soroti keberhasilan rekening satu pintu Maulid Nabi dan digitalisasi e-arsip')..."
            className="flex-1 text-xs px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-indigo-300/60 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
          />

          <button
            onClick={handleGenerateAI}
            disabled={isAiLoading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer shrink-0"
          >
            {isAiLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Menyusun Narasi...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Susun Narasi via AI</span>
              </>
            )}
          </button>
        </div>

        {aiSuccessMessage && (
          <div className="mt-3 text-xs text-emerald-300 flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{aiSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* Editable LPJ Sections Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
        {/* Section 1: Executive Summary */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Bab I: Mukadimah & Ringkasan Eksekutif Kepengurusan
          </label>
          <textarea
            value={executiveSummary}
            onChange={(e) => setExecutiveSummary(e.target.value)}
            rows={5}
            placeholder="Tuliskan mukadimah dan tinjauan umum pelaksanaan program..."
            className="w-full text-xs p-3.5 rounded-xl border border-slate-300 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Section 2: Key Achievements */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Bab II: Capaian Utama Program Kerja (Poin Per Poin)
          </label>
          <div className="space-y-2">
            {achievements.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-xs font-bold text-indigo-700 mt-2">{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...achievements];
                    updated[idx] = e.target.value;
                    setAchievements(updated);
                  }}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Challenges and Solutions */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Bab III: Kendala Lapangan & Solusi yang Telah Diterapkan
          </label>
          <div className="space-y-2">
            {challenges.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-xs font-bold text-amber-700 mt-2">{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...challenges];
                    updated[idx] = e.target.value;
                    setChallenges(updated);
                  }}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Strategic Recommendations */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Bab IV: Rekomendasi Strategis untuk Kepengurusan Mendatang
          </label>
          <div className="space-y-2">
            {recommendations.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-xs font-bold text-emerald-700 mt-2">{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...recommendations];
                    updated[idx] = e.target.value;
                    setRecommendations(updated);
                  }}
                  className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={() => onPreviewLPJ(currentReport)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Buka Dokumen Format Cetak A4</span>
          </button>
        </div>
      </div>
    </div>
  );
}
