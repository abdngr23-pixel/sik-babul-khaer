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
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 overflow-hidden print:p-0 print:bg-white">
      {/* Container Dialog */}
      <div className="bg-white w-full sm:max-w-4xl rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 overflow-hidden flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92dvh] text-slate-800 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden bg-slate-900 text-white px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm truncate">
                Pratinjau Dokumen Surat Resmi
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-mono truncate">
                {letter.letterNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Tersalin' : 'Salin Naskah'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak / Simpan PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Letter Document Canvas */}
        <div className="p-3 sm:p-6 md:p-10 overflow-y-auto overflow-x-auto bg-slate-100/70 flex justify-center flex-1 overscroll-contain">
          {/* A4 Paper Mockup */}
          <div
            id="printable-official-letter"
            className="bg-white text-slate-900 w-full max-w-[210mm] min-h-[297mm] p-6 sm:p-10 md:p-14 shadow-md rounded-sm border border-slate-200 relative flex flex-col justify-between"
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

            {/* TANDA TANGAN RESMI & STEMPEL */}
            <div className="relative z-10 mt-8 pt-4">
              <p className="text-center text-sm font-semibold mb-6">
                DEWAN KEMAKMURAN MASJID (DKM) BABUL KHAER
              </p>

              <div className="relative grid grid-cols-2 text-center text-sm">
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

                {/* Stempel Digital DKM di tengah antara Ketua & Sekretaris */}
                {letter.status !== 'DRAFT' && <DkmOfficialStamp />}

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

              {/* Baris Bawah: QR Code Verifikasi & Catatan Penerbitan */}
              <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <OfficialQrCode
                  letterNumber={letter.letterNumber}
                  verificationCode={letter.verificationCode}
                />
                <div className="text-right text-[10px] text-slate-500 font-sans space-y-0.5">
                  <p className="font-semibold text-slate-700">Sistem Informasi DKM Babul Khaer (SIK-MBH)</p>
                  <p>Kompleks BTP Blok AE, Tamalanrea, Kota Makassar</p>
                  <p className="text-[9px] text-slate-400">Arsip Digital & Tata Usaha Sekretariat Resmi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DkmOfficialStamp() {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-4 pointer-events-none select-none opacity-85 -rotate-6 z-20">
      <svg width="115" height="115" viewBox="0 0 120 120" className="text-emerald-700">
        {/* Outer Ring */}
        <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="4 2" />
        <circle cx="60" cy="60" r="51" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Inner Ring */}
        <circle cx="60" cy="60" r="34" fill="none" stroke="currentColor" strokeWidth="1.5" />
        {/* Text Top */}
        <path id="stamp-top" d="M 18,60 A 42,42 0 0,1 102,60" fill="none" />
        <text fontSize="7.5" fontWeight="bold" fill="currentColor" letterSpacing="0.8">
          <textPath href="#stamp-top" startOffset="50%" textAnchor="middle">
            DKM MASJID BABUL KHAER
          </textPath>
        </text>
        {/* Text Bottom */}
        <path id="stamp-bottom" d="M 102,60 A 42,42 0 0,1 18,60" fill="none" />
        <text fontSize="7" fontWeight="bold" fill="currentColor" letterSpacing="0.6">
          <textPath href="#stamp-bottom" startOffset="50%" textAnchor="middle">
            BTP BLOK AE MAKASSAR
          </textPath>
        </text>
        {/* Center Emblem */}
        <g transform="translate(60, 60) scale(0.9)">
          <text x="0" y="-3" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">
            SEKRETARIAT
          </text>
          <text x="0" y="7" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="currentColor">
            TERVERIFIKASI
          </text>
          <circle cx="-20" cy="0" r="1.5" fill="currentColor" />
          <circle cx="20" cy="0" r="1.5" fill="currentColor" />
        </g>
      </svg>
    </div>
  );
}

function OfficialQrCode({ letterNumber, verificationCode }: { letterNumber: string; verificationCode?: string }) {
  return (
    <div className="flex items-center gap-3 border border-slate-200 bg-slate-50/70 p-2.5 rounded-xl max-w-[300px]">
      <svg width="56" height="56" viewBox="0 0 29 29" className="text-slate-900 shrink-0 bg-white p-0.5 rounded shadow-2xs">
        {/* Finder Pattern Top-Left */}
        <rect x="1" y="1" width="7" height="7" fill="currentColor" />
        <rect x="2" y="2" width="5" height="5" fill="white" />
        <rect x="3" y="3" width="3" height="3" fill="currentColor" />
        {/* Finder Pattern Top-Right */}
        <rect x="21" y="1" width="7" height="7" fill="currentColor" />
        <rect x="22" y="2" width="5" height="5" fill="white" />
        <rect x="23" y="3" width="3" height="3" fill="currentColor" />
        {/* Finder Pattern Bottom-Left */}
        <rect x="1" y="21" width="7" height="7" fill="currentColor" />
        <rect x="2" y="22" width="5" height="5" fill="white" />
        <rect x="3" y="23" width="3" height="3" fill="currentColor" />
        {/* Timing Patterns */}
        <rect x="9" y="4" width="1" height="1" fill="currentColor" />
        <rect x="11" y="4" width="1" height="1" fill="currentColor" />
        <rect x="13" y="4" width="1" height="1" fill="currentColor" />
        <rect x="15" y="4" width="1" height="1" fill="currentColor" />
        <rect x="17" y="4" width="1" height="1" fill="currentColor" />
        <rect x="19" y="4" width="1" height="1" fill="currentColor" />
        <rect x="4" y="9" width="1" height="1" fill="currentColor" />
        <rect x="4" y="11" width="1" height="1" fill="currentColor" />
        <rect x="4" y="13" width="1" height="1" fill="currentColor" />
        <rect x="4" y="15" width="1" height="1" fill="currentColor" />
        <rect x="4" y="17" width="1" height="1" fill="currentColor" />
        <rect x="4" y="19" width="1" height="1" fill="currentColor" />
        {/* Data Matrix Dots */}
        <rect x="10" y="10" width="2" height="2" fill="currentColor" />
        <rect x="14" y="10" width="1" height="2" fill="currentColor" />
        <rect x="17" y="11" width="2" height="1" fill="currentColor" />
        <rect x="10" y="14" width="3" height="1" fill="currentColor" />
        <rect x="15" y="14" width="2" height="2" fill="currentColor" />
        <rect x="11" y="17" width="2" height="2" fill="currentColor" />
        <rect x="15" y="18" width="3" height="1" fill="currentColor" />
        <rect x="22" y="10" width="2" height="1" fill="currentColor" />
        <rect x="25" y="11" width="2" height="2" fill="currentColor" />
        <rect x="21" y="15" width="2" height="2" fill="currentColor" />
        <rect x="24" y="16" width="3" height="1" fill="currentColor" />
        <rect x="10" y="22" width="2" height="2" fill="currentColor" />
        <rect x="14" y="23" width="2" height="1" fill="currentColor" />
        <rect x="18" y="22" width="1" height="3" fill="currentColor" />
        <rect x="22" y="22" width="3" height="1" fill="currentColor" />
        <rect x="24" y="25" width="2" height="2" fill="currentColor" />
      </svg>
      <div className="text-[9.5px] leading-tight font-sans text-slate-600">
        <div className="font-bold text-slate-900 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
          Verifikasi Dokumen Resmi
        </div>
        <div className="font-mono text-[9px] text-teal-800 mt-0.5 truncate">{verificationCode || letterNumber}</div>
        <div className="text-[8px] text-slate-500 mt-0.5">Pindai untuk verifikasi portal resmi DKM Babul Khaer</div>
      </div>
    </div>
  );
}
