'use client';

import React, { useState } from 'react';
import { LPJReport, FieldArea } from '@/types/reports';
import { formatRupiah } from '@/components/finance/finance-stats';
import { useAuth } from '@/lib/auth-context';
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
  Wrench,
  Lock,
  Layers,
  Filter
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
  const { currentUser } = useAuth();

  // Role checking for division scoping
  const canAssembleAll = ['SUPER_ADMIN', 'KETUA_UMUM', 'SEKRETARIS', 'DEWAN_PENGAWAS'].includes(currentUser.role);
  
  const roleToDivision: Record<string, FieldArea> = {
    BENDAHARA: 'KEUANGAN_PERBENDAHARAAN',
    SARPRAS: 'SARANA_PRASARANA',
    KEMASJIDAN: 'KEMASJIDAN_JAMAAH',
    SEKRETARIS: 'KESEKRETARIATAN',
  };

  const initialScope: 'ALL' | FieldArea = canAssembleAll
    ? (initialReport?.divisionScope || 'ALL')
    : (roleToDivision[currentUser.role] || 'ALL');

  const [divisionScope, setDivisionScope] = useState<'ALL' | FieldArea>(initialScope);
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

  const getScopeTitle = () => {
    switch (divisionScope) {
      case 'KEUANGAN_PERBENDAHARAAN':
        return 'Laporan Pertanggungjawaban (LPJ) Bidang Keuangan & Perbendaharaan';
      case 'SARANA_PRASARANA':
        return 'Laporan Pertanggungjawaban (LPJ) Bidang Sarana & Prasarana';
      case 'KEMASJIDAN_JAMAAH':
        return 'Laporan Pertanggungjawaban (LPJ) Bidang Dakwah & Sensus Jamaah';
      case 'KESEKRETARIATAN':
        return 'Laporan Pertanggungjawaban (LPJ) Bidang Kesekretariatan & Persuratan';
      default:
        return 'Kompilasi Laporan Pertanggungjawaban (LPJ) Pleno Gabungan';
    }
  };

  const currentReport: LPJReport = {
    ...initialReport,
    title: getScopeTitle(),
    period,
    divisionScope,
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
          divisionScope,
          authorRole: currentUser.roleLabel || currentUser.title,
          authorName: currentUser.name,
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
        setAiSuccessMessage(
          divisionScope === 'ALL'
            ? 'Narasi pertanggungjawaban pleno gabungan berhasil disintesis oleh Gemini AI!'
            : `Narasi pertanggungjawaban khusus ${getScopeTitle()} berhasil disintesis oleh Gemini AI!`
        );
      }
    } catch (err) {
      console.error('Failed to generate AI LPJ:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportExcel = () => {
    const metricsData = [
      { Indikator: 'Judul Laporan', Nilai: getScopeTitle() },
      { Indikator: 'Cakupan Bidang', Nilai: divisionScope },
      { Indikator: 'Periode Laporan', Nilai: period },
      { Indikator: 'Penyusun / Akun Login', Nilai: `${currentUser.name} (${currentUser.roleLabel})` },
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
    const scopeSlug = divisionScope.toLowerCase().replace(/_/g, '-');
    XLSX.writeFile(workbook, `LPJ_DKM_Babul_Khaer_${scopeSlug}_${todayStr}.xlsx`);
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
            {!canAssembleAll ? (
              <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-bold border border-amber-200 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-amber-600" />
                Lingkup Koordinator Terpilih
              </span>
            ) : (
              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                <Layers className="w-2.5 h-2.5 text-emerald-600" />
                Hak Rakit Pleno Gabungan
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            {getScopeTitle()}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {divisionScope === 'ALL'
              ? 'Data statistik teragregasi lengkap dari 4 pilar tata pamong DKM Babul Khaer BTP Blok AE.'
              : `Laporan terfokus pada mandat operasional dan pertanggungjawaban ${getScopeTitle()}.`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Division Scope Selector */}
          {canAssembleAll ? (
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={divisionScope}
                onChange={(e) => setDivisionScope(e.target.value as 'ALL' | FieldArea)}
                className="text-xs py-2 px-3 rounded-lg border border-indigo-300 bg-indigo-50/50 font-bold text-indigo-900 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">📑 Semua Bidang (Pleno Gabungan)</option>
                <option value="KESEKRETARIATAN">✉️ Bidang Kesekretariatan</option>
                <option value="KEMASJIDAN_JAMAAH">👥 Bidang Dakwah & Jamaah</option>
                <option value="KEUANGAN_PERBENDAHARAAN">💰 Bidang Keuangan & Kas</option>
                <option value="SARANA_PRASARANA">🔧 Bidang Sarana & Prasarana</option>
              </select>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-slate-500" />
              <span>{getScopeTitle().replace('Laporan Pertanggungjawaban (LPJ) ', '')}</span>
            </div>
          )}

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
        <div
          onClick={() => canAssembleAll && setDivisionScope('KESEKRETARIATAN')}
          className={`bg-white rounded-xl p-4 border transition-all ${
            divisionScope === 'KESEKRETARIATAN'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md scale-[1.01]'
              : divisionScope !== 'ALL'
              ? 'border-slate-200 opacity-60 hover:opacity-100'
              : 'border-slate-200 shadow-xs hover:border-slate-300'
          } ${canAssembleAll ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Pilar I: Persuratan</span>
            <div className="flex items-center gap-1.5">
              {divisionScope === 'KESEKRETARIATAN' && (
                <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Aktif</span>
              )}
              <FileText className="w-4 h-4 text-emerald-600" />
            </div>
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
        <div
          onClick={() => canAssembleAll && setDivisionScope('KEMASJIDAN_JAMAAH')}
          className={`bg-white rounded-xl p-4 border transition-all ${
            divisionScope === 'KEMASJIDAN_JAMAAH'
              ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md scale-[1.01]'
              : divisionScope !== 'ALL'
              ? 'border-slate-200 opacity-60 hover:opacity-100'
              : 'border-slate-200 shadow-xs hover:border-slate-300'
          } ${canAssembleAll ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Pilar II: Umat & Sensus</span>
            <div className="flex items-center gap-1.5">
              {divisionScope === 'KEMASJIDAN_JAMAAH' && (
                <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold">Aktif</span>
              )}
              <Users className="w-4 h-4 text-teal-600" />
            </div>
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
        <div
          onClick={() => canAssembleAll && setDivisionScope('KEUANGAN_PERBENDAHARAAN')}
          className={`bg-white rounded-xl p-4 border transition-all ${
            divisionScope === 'KEUANGAN_PERBENDAHARAAN'
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md scale-[1.01]'
              : divisionScope !== 'ALL'
              ? 'border-slate-200 opacity-60 hover:opacity-100'
              : 'border-slate-200 shadow-xs hover:border-slate-300'
          } ${canAssembleAll ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Pilar III: Kas & Swadaya</span>
            <div className="flex items-center gap-1.5">
              {divisionScope === 'KEUANGAN_PERBENDAHARAAN' && (
                <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold">Aktif</span>
              )}
              <Wallet className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-2">
            {formatRupiah(initialReport.metrics.netBalance)}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Swadaya PHBI: {formatRupiah(initialReport.metrics.phbiBalance)}
          </div>
        </div>

        {/* Pilar 4: Sarana Prasarana */}
        <div
          onClick={() => canAssembleAll && setDivisionScope('SARANA_PRASARANA')}
          className={`bg-white rounded-xl p-4 border transition-all ${
            divisionScope === 'SARANA_PRASARANA'
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md scale-[1.01]'
              : divisionScope !== 'ALL'
              ? 'border-slate-200 opacity-60 hover:opacity-100'
              : 'border-slate-200 shadow-xs hover:border-slate-300'
          } ${canAssembleAll ? 'cursor-pointer' : ''}`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[10px]">Pilar IV: Aset Sarpras</span>
            <div className="flex items-center gap-1.5">
              {divisionScope === 'SARANA_PRASARANA' && (
                <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Aktif</span>
              )}
              <Wrench className="w-4 h-4 text-blue-600" />
            </div>
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
