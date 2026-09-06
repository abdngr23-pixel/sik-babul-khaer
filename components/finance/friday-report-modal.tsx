'use client';

import React from 'react';
import Image from 'next/image';
import { FinanceTransaction } from '@/types/finance';
import { formatRupiah } from './finance-stats';
import { X, Printer } from 'lucide-react';

interface FridayReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: FinanceTransaction[];
}

export default function FridayReportModal({
  isOpen,
  onClose,
  transactions,
}: FridayReportModalProps) {
  if (!isOpen) return null;

  // Calculate Friday period statistics
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((acc, t) => acc + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Breakdown by key categories
  const operasionalIncome = transactions
    .filter((t) => t.category === 'KAS_OPERASIONAL' && t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const swadayaPHBIIncome = transactions
    .filter((t) => t.category === 'SWADAYA_PHBI' && t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const ziswafIncome = transactions
    .filter((t) => (t.category === 'ZISWAF_ZAKAT' || t.category === 'ZISWAF_INFAQ' || t.category === 'INFAQ_JUMAT') && t.type === 'INCOME')
    .reduce((acc, t) => acc + t.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 overflow-hidden print:p-0 print:bg-white animate-in fade-in duration-150">
      <div className="bg-white w-full md:max-w-4xl rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[96dvh] text-slate-800 print:max-h-none print:shadow-none print:border-none print:rounded-none animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0 print:hidden" />

        {/* Top Control Bar (Hidden on Print) */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white p-1 border border-emerald-300 flex items-center justify-center shrink-0 shadow-2xs">
              <Image
                src="/logo-babul-khaer.png"
                alt="Logo Masjid Babul Khaer"
                width={28}
                height={28}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider leading-tight">
                Laporan Kas Keuangan Mingguan Sholat Jumat
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">
                Format Standar Cetak Pengumuman Mimbar Jumat & Papan Bicara
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="min-h-[44px] flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold transition-all cursor-pointer shadow-soft-sm active:scale-95 shrink-0"
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

        {/* Printable Document Canvas */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-3 sm:p-6 md:p-12 print:p-0 print:overflow-visible font-serif bg-slate-100/50 print:bg-white flex justify-center overscroll-contain">
          <div className="w-full max-w-[210mm] bg-white p-4 sm:p-8 md:p-12 shadow-md print:shadow-none print:p-4 text-slate-900 leading-relaxed border border-slate-200 print:border-none">
            {/* Kop Resmi DKM */}
            <div className="text-center border-b-2 border-slate-900 pb-4 mb-6 relative">
              <div className="flex items-center justify-center gap-4 mb-2">
                <Image
                  src="/logo-babul-khaer.png"
                  alt="Logo Resmi DKM Babul Khaer"
                  width={76}
                  height={76}
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
                    Bidang Perbendaharaan & Keuangan • Sistem Informasi: SIK-MBH
                  </p>
                </div>
              </div>
              <div className="h-0.5 bg-slate-900 w-full mt-2"></div>
              <div className="h-[1px] bg-slate-900 w-full mt-[2px]"></div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-6 font-sans">
              <h2 className="text-base md:text-lg font-extrabold uppercase tracking-wide text-slate-900">
                LAPORAN KAS MINGGUAN SHOLAT JUMAT
              </h2>
              <p className="text-xs font-bold text-emerald-900 uppercase tracking-wider mt-0.5">
                Periode: 5 September 2026 / 23 Rabiul Awal 1448 H
              </p>
              <p className="text-[11px] text-slate-500 italic mt-1">
                Disampaikan untuk Keterbukaan & Akuntabilitas Jamaah BTP Blok AE
              </p>
            </div>

            {/* Rekap Saldo Kas Ringkas */}
            <div className="grid grid-cols-3 gap-3 font-sans text-xs mb-6 text-center">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Penerimaan</span>
                <span className="text-base font-black text-emerald-700 block mt-1">
                  +{formatRupiah(totalIncome)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Pengeluaran</span>
                <span className="text-base font-black text-rose-700 block mt-1">
                  -{formatRupiah(totalExpense)}
                </span>
              </div>
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">Saldo Kas Berjalan</span>
                <span className="text-base font-black text-emerald-900 block mt-1">
                  {formatRupiah(netBalance)}
                </span>
              </div>
            </div>

            {/* Rincian Pos Dana Satu Pintu */}
            <div className="mb-6 font-sans text-xs space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                I. POSISI SALDO BERDASARKAN POS DANA (SATU PINTU)
              </h3>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3 border-r border-slate-300">Pos Anggaran / Rekening</th>
                    <th className="py-2 px-3 border-r border-slate-300">Peruntukan</th>
                    <th className="py-2 px-3 text-right">Penerimaan Tercatat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-semibold border-r border-slate-300">Kas Operasional Rutin</td>
                    <td className="py-2 px-3 border-r border-slate-300 text-slate-600">Kotak infaq Jumat, listrik, air, operasional harian</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">+{formatRupiah(operasionalIncome)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold border-r border-slate-300">Dana Swadaya PHBI (Satu Pintu)</td>
                    <td className="py-2 px-3 border-r border-slate-300 text-slate-600">Peringatan Hari Besar Islam terpisah (Maulid/Isra Mi&apos;raj)</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">+{formatRupiah(swadayaPHBIIncome)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold border-r border-slate-300">Rekapitulasi ZISWAF Umat</td>
                    <td className="py-2 px-3 border-r border-slate-300 text-slate-600">Zakat Maal, Fitrah, dan Infaq Terikat Bansos Dhuafa</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-700">+{formatRupiah(ziswafIncome)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Rincian Transaksi Berjalan */}
            <div className="mb-6 font-sans text-xs space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                II. MUTASI KAS TERAKHIR ({transactions.length} Transaksi)
              </h3>
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3 border-r border-slate-300">Tanggal</th>
                    <th className="py-2 px-3 border-r border-slate-300">Keterangan Transaksi</th>
                    <th className="py-2 px-3 border-r border-slate-300">Pihak / No. Bukti</th>
                    <th className="py-2 px-3 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {transactions.slice(0, 10).map((t) => (
                    <tr key={t.id}>
                      <td className="py-1.5 px-3 border-r border-slate-300 text-slate-600 font-mono text-[11px]">
                        {t.date}
                      </td>
                      <td className="py-1.5 px-3 border-r border-slate-300 font-medium">
                        {t.description}
                      </td>
                      <td className="py-1.5 px-3 border-r border-slate-300 text-slate-500 text-[11px]">
                        {t.payerOrPayee || t.receiptNumber || '-'}
                      </td>
                      <td
                        className={`py-1.5 px-3 text-right font-bold font-mono ${
                          t.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {t.type === 'INCOME' ? '+' : '-'}
                        {formatRupiah(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Lembar Tanda Tangan */}
            <div className="mt-8 pt-4 border-t border-slate-300 font-sans text-xs">
              <div className="grid grid-cols-2 text-center">
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold text-slate-900 mt-0.5">Ketua Umum DKM Babul Khaer</p>
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">Disahkan Digital</span>
                  </div>
                  <p className="font-bold text-slate-900 underline">Drs. Muhammad Hasri, M. Hum.</p>
                  <p className="text-[10px] text-slate-500">ID Pengurus: DKM-MBH-KETUA</p>
                </div>
                <div>
                  <p className="text-slate-600">Makassar, 5 September 2026</p>
                  <p className="font-bold text-slate-900 mt-0.5">Bendahara Umum</p>
                  <div className="h-20 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 italic">Penanggung Jawab Kas</span>
                  </div>
                  <p className="font-bold text-slate-900 underline">H. Sahali</p>
                  <p className="text-[10px] text-slate-500">ID Pengurus: DKM-MBH-BENDAHARA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
