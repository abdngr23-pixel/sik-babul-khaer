'use client';

import React from 'react';
import Image from 'next/image';
import { LPJReport } from '@/types/reports';
import { formatRupiah } from '@/components/finance/finance-stats';
import { X, Printer } from 'lucide-react';

interface LPJPreviewModalProps {
  report: LPJReport | null;
  onClose: () => void;
}

export default function LPJPreviewModal({ report, onClose }: LPJPreviewModalProps) {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 overflow-hidden print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white w-full md:max-w-4xl rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[96dvh] text-slate-800 print:max-h-none print:shadow-none print:border-none print:rounded-none animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0 print:hidden" />

        {/* Modal Top Bar (Hidden in Print) */}
        <div className="px-3 sm:px-6 py-3 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white p-1 border border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Image
                src="/logo-babul-khaer.png"
                alt="Logo Masjid Babul Khaer"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider truncate">
                Pratinjau Dokumen LPJ A4
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">{report.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="min-h-[44px] flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable A4 Content) */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-6 md:p-12 print:p-0 print:overflow-visible font-serif bg-slate-100/50 print:bg-white flex justify-center overscroll-contain">
          <div className="w-full max-w-[210mm] bg-white p-4 sm:p-8 md:p-12 shadow-md print:shadow-none print:p-4 text-slate-900 leading-relaxed border border-slate-200 print:border-none">
            {/* Kop Surat Resmi */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6 relative">
              <div className="flex items-center justify-center gap-4 mb-2">
                <Image
                  src="/logo-babul-khaer.png"
                  alt="Logo Resmi DKM Babul Khaer"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-contain shrink-0"
                  priority
                />
                <div>
                  <h1 className="text-lg md:text-xl font-bold uppercase tracking-wider font-sans text-slate-900 leading-tight">
                    DEWAN KEMAKMURAN MASJID (DKM) BABUL KHAER
                  </h1>
                  <p className="text-xs font-sans text-slate-700 font-semibold mt-0.5">
                    KOMPLEKS BUMI TAMALANREA PERMAI (BTP) BLOK AE
                  </p>
                  <p className="text-[11px] font-sans text-slate-600">
                    Kelurahan Tamalanrea, Kecamatan Tamalanrea, Kota Makassar, Sulawesi Selatan 90245
                  </p>
                  <p className="text-[10px] font-sans text-emerald-800 font-medium">
                    Surel: dkm.babulkhaer.btp@gmail.com • Sistem Informasi Administrasi: SIK-MBH
                  </p>
                </div>
              </div>
              <div className="h-0.5 bg-slate-900 w-full mt-2"></div>
              <div className="h-[1px] bg-slate-900 w-full mt-[2px]"></div>
            </div>

            {/* Document Header */}
            <div className="text-center mb-6 font-sans">
              <h2 className="text-base md:text-lg font-extrabold uppercase tracking-wide text-slate-900">
                {report.divisionScope && report.divisionScope !== 'ALL'
                  ? report.title
                  : 'LAPORAN PERTANGGUNGJAWABAN (LPJ) TAHUNAN'}
              </h2>
              <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mt-0.5">
                {report.period}
              </p>
              <p className="text-[11px] text-slate-500 italic mt-1">
                Landasan Referensi: AD/ART MBH 2020 & Hasil Rapat Kerja DKM Periode 2026-2029
              </p>
            </div>

            {/* Bab I: Mukadimah */}
            <div className="mb-6 font-sans text-xs space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                BAB I: MUKADIMAH & TINJAUAN UMUM
              </h3>
              <p className="text-justify text-slate-700 leading-relaxed indent-6">
                {report.executiveSummary}
              </p>
            </div>

            {/* Bab II: Realisasi Kinerja 4 Pilar (Tabel Statistik Agregat) */}
            <div className="mb-6 font-sans text-xs space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                BAB II: REKAPITULASI CAPAIAN LINTAS MODUL DKM
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2 px-3 border-r border-slate-300">Pilar Bidang Kerja</th>
                      <th className="py-2 px-3 border-r border-slate-300">Indikator Utama</th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center">Realisasi</th>
                      <th className="py-2 px-3">Status Tata Kelola</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr className={report.divisionScope === 'KESEKRETARIATAN' ? 'bg-emerald-50/80 font-semibold' : ''}>
                      <td className="py-2 px-3 font-semibold border-r border-slate-300">
                        I. Kesekretariatan & Administrasi
                        {report.divisionScope === 'KESEKRETARIATAN' && (
                          <span className="ml-1.5 text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">Fokus LPJ</span>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300">
                        Surat Terbit & Tugas Pleno Selesai
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-300 font-bold">
                        {report.metrics.totalLetters} Surat ({report.metrics.actionItemsCompleted}/{report.metrics.actionItemsTotal} Tugas)
                      </td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">
                        100% E-Arsip Digital
                      </td>
                    </tr>
                    <tr className={report.divisionScope === 'KEMASJIDAN_JAMAAH' ? 'bg-teal-50/80 font-semibold' : ''}>
                      <td className="py-2 px-3 font-semibold border-r border-slate-300">
                        II. Dakwah & Kependudukan Jamaah
                        {report.divisionScope === 'KEMASJIDAN_JAMAAH' && (
                          <span className="ml-1.5 text-[9px] bg-teal-200 text-teal-900 px-1.5 py-0.5 rounded font-bold">Fokus LPJ</span>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300">
                        Sensus Warga BTP Blok AE & Mustahiq
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-300 font-bold">
                        {report.metrics.totalJamaah} Warga ({report.metrics.totalFamilies} KK)
                      </td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">
                        {report.metrics.mustahiqCount} Mustahiq Terverifikasi
                      </td>
                    </tr>
                    <tr className={report.divisionScope === 'KEUANGAN_PERBENDAHARAAN' ? 'bg-amber-50/80 font-semibold' : ''}>
                      <td className="py-2 px-3 font-semibold border-r border-slate-300">
                        III. Keuangan & Dana Swadaya PHBI
                        {report.divisionScope === 'KEUANGAN_PERBENDAHARAAN' && (
                          <span className="ml-1.5 text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-bold">Fokus LPJ</span>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300">
                        Saldo Kas Berjalan & Swadaya Satu Pintu
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-300 font-bold">
                        {formatRupiah(report.metrics.netBalance)}
                      </td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">
                        Swadaya PHBI: {formatRupiah(report.metrics.phbiBalance)}
                      </td>
                    </tr>
                    <tr className={report.divisionScope === 'SARANA_PRASARANA' ? 'bg-blue-50/80 font-semibold' : ''}>
                      <td className="py-2 px-3 font-semibold border-r border-slate-300">
                        IV. Sarana Prasarana & Pemeliharaan
                        {report.divisionScope === 'SARANA_PRASARANA' && (
                          <span className="ml-1.5 text-[9px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-bold">Fokus LPJ</span>
                        )}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300">
                        Kesiapan Aset AC, Genset & Sound
                      </td>
                      <td className="py-2 px-3 text-center border-r border-slate-300 font-bold">
                        {report.metrics.totalAssetsCount} Unit ({formatRupiah(report.metrics.totalAssetsEstimatedValue)})
                      </td>
                      <td className="py-2 px-3 text-emerald-700 font-bold">
                        {report.metrics.maintenanceCompliancePercent}% Siap Pakai
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bab III: Capaian Utama */}
            <div className="mb-6 font-sans text-xs space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                BAB III: CAPAIAN UTAMA PROGRAM KERJA
              </h3>
              <ol className="list-decimal pl-5 space-y-1 text-slate-700 text-justify">
                {report.keyAchievements.map((ach, i) => (
                  <li key={i}>{ach}</li>
                ))}
              </ol>
            </div>

            {/* Bab IV: Kendala & Solusi */}
            <div className="mb-6 font-sans text-xs space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                BAB IV: KENDALA LAPANGAN & SOLUSI
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 text-justify">
                {report.challengesAndSolutions.map((chal, i) => (
                  <li key={i}>{chal}</li>
                ))}
              </ul>
            </div>

            {/* Bab V: Rekomendasi Strategis */}
            <div className="mb-8 font-sans text-xs space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                BAB V: REKOMENDASI UNTUK KEPENGURUSAN MASA DEPAN
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 text-justify">
                {report.strategicRecommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            {/* Lembar Tanda Tangan */}
            <div className="mt-8 pt-4 font-sans text-xs break-inside-avoid">
              <div className="text-right text-slate-700 mb-4">
                Makassar, 4 September 2026
              </div>

              <div className="text-center font-bold text-slate-800 mb-8">
                PENGURUS HARIAN DEWAN KEMAKMURAN MASJID BABUL KHAER
                <br />
                KOMPLEKS BTP BLOK AE MAKASSAR
              </div>

              {/* Tanda tangan dinamis sesuai cakupan bidang */}
              {!report.divisionScope || report.divisionScope === 'ALL' ? (
                <div className="grid grid-cols-3 gap-4 text-center">
                  {/* Sekretaris */}
                  <div>
                    <p className="text-slate-600 mb-16">Sekretaris Umum,</p>
                    <p className="font-bold text-slate-900 underline">
                      {report.signatories.sekretarisUmum.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      NIA: DKM-MBH-2026-002
                    </p>
                  </div>

                  {/* Bendahara */}
                  <div>
                    <p className="text-slate-600 mb-16">Bendahara Umum,</p>
                    <p className="font-bold text-slate-900 underline">
                      {report.signatories.bendaharaUmum.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      NIA: DKM-MBH-2026-003
                    </p>
                  </div>

                  {/* Ketua Umum */}
                  <div>
                    <p className="text-slate-600 mb-16">Mengetahui,<br />Ketua Umum DKM,</p>
                    <p className="font-bold text-slate-900 underline">
                      {report.signatories.ketuaUmum.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      NIA: DKM-MBH-2026-001
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-8 text-center max-w-lg mx-auto">
                  {/* Pelapor / Koordinator Bidang Terkait */}
                  <div>
                    <p className="text-slate-600 mb-16">
                      {report.divisionScope === 'KEUANGAN_PERBENDAHARAAN' && 'Bendahara Umum DKM (Pelapor),'}
                      {report.divisionScope === 'SARANA_PRASARANA' && 'Koordinator Seksi Sarpras (Pelapor),'}
                      {report.divisionScope === 'KEMASJIDAN_JAMAAH' && 'Koordinator Peribadatan & Dakwah (Pelapor),'}
                      {report.divisionScope === 'KESEKRETARIATAN' && 'Sekretaris Umum DKM (Pelapor),'}
                    </p>
                    <p className="font-bold text-slate-900 underline">
                      {report.divisionScope === 'KEUANGAN_PERBENDAHARAAN' && report.signatories.bendaharaUmum.name}
                      {report.divisionScope === 'SARANA_PRASARANA' && 'Faisal T. Parussengi, S.S.'}
                      {report.divisionScope === 'KEMASJIDAN_JAMAAH' && 'Drs. Manai, M.M.'}
                      {report.divisionScope === 'KESEKRETARIATAN' && report.signatories.sekretarisUmum.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {report.divisionScope === 'KEUANGAN_PERBENDAHARAAN' && 'NIA: DKM-MBH-2026-003'}
                      {report.divisionScope === 'SARANA_PRASARANA' && 'NIA: DKM-MBH-2026-004'}
                      {report.divisionScope === 'KEMASJIDAN_JAMAAH' && 'NIA: DKM-MBH-2026-005'}
                      {report.divisionScope === 'KESEKRETARIATAN' && 'NIA: DKM-MBH-2026-002'}
                    </p>
                  </div>

                  {/* Ketua Umum */}
                  <div>
                    <p className="text-slate-600 mb-16">Mengetahui,<br />Ketua Umum DKM,</p>
                    <p className="font-bold text-slate-900 underline">
                      {report.signatories.ketuaUmum.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      NIA: DKM-MBH-2026-001
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
