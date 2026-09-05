'use client';

import React from 'react';
import Image from 'next/image';
import { OfficialLetter } from '@/types/letter';
import { DKM_INFO, formatIndonesianDate } from '@/lib/letter-numbering';
import { Printer, X, Copy, Check, FileCheck2 } from 'lucide-react';

interface LetterPreviewProps {
  letter: OfficialLetter | null;
  onClose: () => void;
}

export default function OfficialLetterPreview({ letter, onClose }: LetterPreviewProps) {
  const [copied, setCopied] = React.useState(false);

  if (!letter) return null;

  const handleCopyText = () => {
    const fullText = `
${DKM_INFO.name}
${DKM_INFO.address}
${DKM_INFO.contact}
===================================================

Nomor   : ${letter.letterNumber}
Lampiran: ${letter.attachmentCount || '-'}
Perihal : ${letter.subject}

Makassar, ${formatIndonesianDate(letter.letterDate)}

Kepada Yth.
${letter.recipientTitle ? `${letter.recipientTitle}\n` : ''}${letter.recipientName}
di ${letter.recipientAddress || 'Tempat'}

${letter.content}

Pengurus Dewan Kemakmuran Masjid (DKM) Babul Khaer

Ketua Umum,                             Sekretaris Umum,


${letter.signatory1.name}               ${letter.signatory2.name}
    `.trim();

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      {/* Container Dialog */}
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-semibold text-sm">
                Pratinjau Dokumen Surat Resmi
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                {letter.letterNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Naskah'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Letter Document Canvas */}
        <div className="p-6 md:p-10 overflow-y-auto bg-slate-100/70 flex justify-center flex-1">
          {/* A4 Paper Mockup */}
          <div
            id="printable-official-letter"
            className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-10 md:p-14 shadow-md rounded-sm border border-slate-200 relative flex flex-col justify-between"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {/* Draft Watermark */}
            {letter.status === 'DRAFT' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
                <div className="text-7xl font-bold tracking-widest text-slate-200 -rotate-45 uppercase border-4 border-dashed border-slate-200 px-12 py-4">
                  DRAF RESMI
                </div>
              </div>
            )}

            <div className="relative z-10">
              {/* KOP SURAT RESMI */}
              <div className="text-center relative pb-3 border-b-4 border-double border-slate-900 mb-6">
                <div className="flex items-center justify-center gap-4">
                  <Image
                    src="/logo-babul-khaer.png"
                    alt="Logo Resmi Masjid Babul Khaer"
                    width={80}
                    height={80}
                    className="w-20 h-20 object-contain shrink-0"
                    priority
                  />
                  <div>
                    <h2 className="text-lg md:text-xl font-bold uppercase tracking-wider text-slate-900 leading-snug">
                      {DKM_INFO.name}
                    </h2>
                    <h3 className="text-base md:text-lg font-bold uppercase text-emerald-800 leading-snug">
                      MASJID BABUL KHAER
                    </h3>
                    <p className="text-xs text-slate-700 leading-tight mt-1">
                      {DKM_INFO.address}
                    </p>
                    <p className="text-[11px] text-slate-600 italic">
                      {DKM_INFO.contact}
                    </p>
                  </div>
                </div>
              </div>

              {/* METADATA SURAT */}
              <div className="flex justify-between items-start text-sm mb-6 leading-relaxed">
                <div className="space-y-1">
                  <div className="grid grid-cols-[80px_10px_1fr]">
                    <span>Nomor</span>
                    <span>:</span>
                    <span className="font-bold">{letter.letterNumber}</span>
                  </div>
                  <div className="grid grid-cols-[80px_10px_1fr]">
                    <span>Lampiran</span>
                    <span>:</span>
                    <span>{letter.attachmentCount || '-'}</span>
                  </div>
                  <div className="grid grid-cols-[80px_10px_1fr]">
                    <span>Perihal</span>
                    <span>:</span>
                    <span className="font-semibold underline">{letter.subject}</span>
                  </div>
                </div>

                <div className="text-right">
                  <p>Makassar, {formatIndonesianDate(letter.letterDate)}</p>
                </div>
              </div>

              {/* TUJUAN SURAT */}
              <div className="text-sm mb-6 leading-relaxed">
                <p>Kepada Yang Terhormat,</p>
                {letter.recipientTitle && <p className="font-semibold">{letter.recipientTitle}</p>}
                <p className="font-bold text-base">{letter.recipientName}</p>
                <p className="text-slate-700">di -</p>
                <p className="font-semibold pl-4">{letter.recipientAddress || 'Tempat'}</p>
              </div>

              {/* ISI SURAT */}
              <div className="text-sm leading-relaxed whitespace-pre-line text-justify mb-8 text-slate-800">
                {letter.content}
              </div>
            </div>

            {/* TANDA TANGAN RESMI */}
            <div className="relative z-10 mt-8 pt-4">
              <p className="text-center text-sm font-semibold mb-6">
                DEWAN KEMAKMURAN MASJID (DKM) BABUL KHAER
              </p>

              <div className="grid grid-cols-2 text-center text-sm">
                {/* Ketua */}
                <div className="flex flex-col items-center">
                  <p className="font-semibold">{letter.signatory1.role}</p>
                  <div className="h-20 flex items-center justify-center">
                    {letter.status !== 'DRAFT' && (
                      <span className="text-xs text-emerald-700 font-sans italic border border-emerald-400 bg-emerald-50 px-2 py-0.5 rounded">
                        [Tertanda Digital]
                      </span>
                    )}
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {letter.signatory1.name}
                  </p>
                </div>

                {/* Sekretaris */}
                <div className="flex flex-col items-center">
                  <p className="font-semibold">{letter.signatory2.role}</p>
                  <div className="h-20 flex items-center justify-center">
                    {letter.status !== 'DRAFT' && (
                      <span className="text-xs text-emerald-700 font-sans italic border border-emerald-400 bg-emerald-50 px-2 py-0.5 rounded">
                        [Tertanda Digital]
                      </span>
                    )}
                  </div>
                  <p className="font-bold underline text-slate-900">
                    {letter.signatory2.name}
                  </p>
                </div>
              </div>

              <div className="text-center mt-6 pt-3 border-t border-slate-200 text-[10px] text-slate-400 font-sans">
                Dokumen ini resmi diterbitkan melalui Sistem Informasi DKM Babul Khaer (SIK-MBH)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
