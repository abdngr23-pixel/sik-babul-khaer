'use client';

import React from 'react';
import { ZiswafAidItem } from '@/types/ziswaf';
import { formatRupiah } from '@/components/finance/finance-stats';
import { Printer, X, ShieldCheck } from 'lucide-react';
import Image from 'next/image';

interface AidReceiptModalProps {
  aid: ZiswafAidItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AidReceiptModal({
  aid,
  isOpen,
  onClose,
}: AidReceiptModalProps) {
  if (!isOpen || !aid) return null;

  const handlePrint = () => {
    window.print();
  };

  const getAidTypeLabel = (type: string) => {
    switch (type) {
      case 'PAKET_SEMBAKO':
        return 'Paket Sembako Lengkap Dhuafa';
      case 'BERAS_ZAKAT':
        return 'Beras Cadangan Logistik ZISWAF';
      case 'SANTUNAN_TUNAI':
        return 'Santunan Tunai Biaya Hidup Mustahiq';
      case 'BEASISWA_PENDIDIKAN':
        return 'Beasiswa Pendidikan Anak Yatim / Dhuafa';
      case 'BANTUAN_KESEHATAN':
        return 'Bantuan Pengobatan & Medis Darurat';
      default:
        return 'Bantuan Sosial Kemasyarakatan';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/70 backdrop-blur-xs p-0 md:p-4 overflow-hidden animate-in fade-in print:p-0 print:bg-transparent print:static">
      <div className="bg-white w-full md:max-w-2xl rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] animate-in slide-in-from-bottom duration-300 md:zoom-in-95 print:shadow-none print:border-none print:h-auto print:max-h-none print:rounded-none">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0 print:hidden" />

        {/* Top Control Bar (Hidden on print) */}
        <div className="px-4 sm:px-6 py-3 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs font-bold truncate">Kwitansi ZISWAF Resmi</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Cetak Bukti</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Container (Pan-scrollable on mobile) */}
        <div className="flex-1 overflow-y-auto overscroll-contain overflow-x-auto p-2 sm:p-6 bg-slate-100/60 print:p-0 print:bg-white print:overflow-visible">
          <div className="p-5 sm:p-8 space-y-6 text-slate-900 bg-white rounded-2xl border border-slate-200/80 shadow-sm min-w-[520px] sm:min-w-0 mx-auto print:border-none print:shadow-none print:p-0 print:min-w-0 print:rounded-none" id="printable-aid-receipt">
            {/* Kop Surat Resmi */}
            <div className="border-b-2 border-slate-900 pb-4 text-center relative">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="w-12 h-12 relative rounded-full overflow-hidden bg-emerald-50 border border-emerald-300 flex items-center justify-center shrink-0">
                  <Image
                    src="/logo-babul-khaer.png"
                    alt="Logo DKM"
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-extrabold tracking-wider text-slate-900 uppercase">
                    Dewan Kemakmuran Masjid Babul Khaer
                  </h2>
                  <h3 className="text-xs font-bold text-emerald-800">
                    Bidang III: Sosial, Kemasyarakatan & Unit Pengumpul Zakat (UPZ)
                  </h3>
                  <p className="text-[10px] text-slate-600">
                    Kompleks Bumi Tamalanrea Permai (BTP) Blok AE, Kel. Tamalanrea, Kec. Tamalanrea, Kota Makassar 90245
                  </p>
                </div>
              </div>
            </div>

            {/* Judul Kwitansi */}
            <div className="text-center space-y-1">
              <h1 className="text-base font-extrabold tracking-wider uppercase underline decoration-emerald-600 decoration-2">
              Tanda Terima Penyaluran Bantuan Sosial / ZISWAF
            </h1>
            <p className="text-xs font-mono font-bold text-slate-700">
              Nomor: {aid.receiptNumber || aid.aidNumber}
            </p>
          </div>

          {/* Rincian Penyaluran */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-2.5 text-xs bg-slate-50/50">
            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-600">Nama Penerima Manfaat:</span>
              <span className="col-span-2 font-bold text-slate-900 text-sm">{aid.recipientName}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-600">Kategori Mustahiq:</span>
              <span className="col-span-2 font-bold text-emerald-800">
                {aid.recipientCategory.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-600">Alamat Domisili / RT:</span>
              <span className="col-span-2 font-medium text-slate-800">
                {aid.address} ({aid.rt} Blok AE)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-600">Jenis Bantuan:</span>
              <span className="col-span-2 font-bold text-slate-900">{getAidTypeLabel(aid.aidType)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-600">Rincian Barang / Bantuan:</span>
              <span className="col-span-2 font-medium text-slate-800 italic">
                {aid.goodsDescription || '-'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-200">
              <span className="font-semibold text-slate-600">Estimasi Nilai / Nominal:</span>
              <span className="col-span-2 font-mono font-extrabold text-emerald-800 text-sm">
                {formatRupiah(aid.amountValue)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <span className="font-semibold text-slate-600">Tanggal Penyerahan:</span>
              <span className="col-span-2 font-medium text-slate-800 font-mono">
                {new Date(aid.distributionDate).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Keterangan Tambahan */}
          {aid.notes && (
            <p className="text-[11px] text-slate-500 italic">
              *Catatan Penyerahan: {aid.notes}
            </p>
          )}

          {/* Kolom Tanda Tangan */}
          <div className="pt-6 grid grid-cols-3 gap-4 text-center text-xs">
            <div className="space-y-16">
              <p className="font-semibold text-slate-600">Yang Menerima,</p>
              <div>
                <p className="font-bold underline text-slate-900">{aid.recipientName}</p>
                <p className="text-[10px] text-slate-500">Penerima Manfaat ({aid.rt})</p>
              </div>
            </div>

            <div className="space-y-16">
              <p className="font-semibold text-slate-600">Yang Menyerahkan,</p>
              <div>
                <p className="font-bold underline text-slate-900">{aid.disbursedBy}</p>
                <p className="text-[10px] text-slate-500">Seksi Sosial & UPZ DKM</p>
              </div>
            </div>

            <div className="space-y-16">
              <p className="font-semibold text-slate-600">Mengetahui,</p>
              <div>
                <p className="font-bold underline text-slate-900">Drs. H. M. Arifin, M.Pd.I</p>
                <p className="text-[10px] text-slate-500">Ketua Umum DKM Babul Khaer</p>
              </div>
            </div>
          </div>

          {/* Footer Validasi Resmi */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>SIK-MBH Sistem Informasi Kemasjidan Terpadu DKM Masjid Babul Khaer BTP Blok AE</span>
            <span className="font-mono">Tervalidasi Digital • {aid.aidNumber}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
