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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96vh] my-auto text-slate-800 print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 border border-indigo-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Image
                src="/logo-babul-khaer.png"
                alt="Logo Masjid Babul Khaer"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Pratinjau Dokumen Resmi LPJ (Format Cetak A4)
              </h2>
              <p className="text-[11px] text-slate-400">{report.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Printable A4 Content) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 print:p-0 print:overflow-visible font-serif bg-slate-100/50 print:bg-white flex justify-center">
          <div className="w-full max-w-[210mm] bg-white p-8 md:p-12 shadow-md print:shadow-none print:p-4 text-slate-900 leading-relaxed border border-slate-200 print:border-none">
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
                LAPORAN PERTANGGUNGJAWABAN (LPJ) TAHUNAN
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
                    <tr>
                      <td className="py-2 px-3 font-semibold border-r border-slate-300 bg-slate-50/50">
                        I. Kesekretariatan & Administrasi
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
                    <tr>
                      <td className="py-2 px-3 font-semibold border-r border-slate-300 bg-slate-50/50">
                        II. Dakwah & Kependudukan Jamaah
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
                    <tr>
                      <td className="py-2 px-3 font-semibold border-r border-slate-300 bg-slate-50/50">
                        III. Keuangan & Dana Swadaya PHBI
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
                    <tr>
                      <td className="py-2 px-3 font-semibold border-r border-slate-300 bg-slate-50/50">
                        IV. Sarana Prasarana & Pemeliharaan
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

            {/* Lembar Tanda Tangan Tiga Pimpinan */}
            <div className="mt-8 pt-4 font-sans text-xs break-inside-avoid">
              <div className="text-right text-slate-700 mb-4">
                Makassar, 4 September 2026
              </div>

              <div className="text-center font-bold text-slate-800 mb-8">
                PENGURUS HARIAN DEWAN KEMAKMURAN MASJID BABUL KHAER
                <br />
                KOMPLEKS BTP BLOK AE MAKASSAR
              </div>

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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
