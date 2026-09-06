'use client';

import React, { useState } from 'react';
import { Jamaah } from '@/types/jamaah';
import {
  X,
  Phone,
  MapPin,
  HeartHandshake,
  Users,
  Briefcase,
  Droplet,
  ExternalLink,
  Edit2,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';

interface JamaahDetailModalProps {
  jamaah: Jamaah | null;
  onClose: () => void;
  onEdit: (jamaah: Jamaah) => void;
}

export default function JamaahDetailModal({
  jamaah,
  onClose,
  onEdit,
}: JamaahDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!jamaah) return null;

  const cleanPhoneForWa = (phoneStr: string) => {
    let clean = phoneStr.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return clean;
  };

  const handleCopySummary = () => {
    const text = `
DATA JAMAAH MASJID BABUL KHAER
======================================
Nama Lengkap : ${jamaah.fullName}
Alamat       : ${jamaah.houseNumber} (${jamaah.rt}), BTP Blok AE
Kontak (WA)  : ${jamaah.phone}
Peran        : ${jamaah.familyRole} (${jamaah.familyMemberCount || 1} jiwa)
Status ZIS   : ${jamaah.economicStatus}
Domisili     : ${jamaah.residencyStatus}
Pekerjaan    : ${jamaah.occupation || '-'}
Catatan      : ${jamaah.notes || '-'}
======================================
DKM Babul Khaer Periode 2026-2029
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMustahiq =
    jamaah.economicStatus === 'MUSTAHIQ_DHUAFA' ||
    jamaah.economicStatus === 'YATIM_PIATU' ||
    jamaah.economicStatus === 'LANSIA_DHUAFA';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 overflow-hidden flex flex-col h-[90dvh] sm:h-auto sm:max-h-[90dvh] text-slate-800 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              {jamaah.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base leading-tight truncate">
                {jamaah.fullName}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
                <span>{jamaah.houseNumber}</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{jamaah.rt} RW 08</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={() => onEdit(jamaah)}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Ubah Profil"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-xs overscroll-contain flex-1">
          {/* Status Tags Banner */}
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
            <span className="px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-800 border border-slate-200">
              {jamaah.residencyStatus === 'TETAP' ? 'Warga Tetap' : jamaah.residencyStatus === 'KONTRAK' ? 'Warga Kontrak' : 'Kost'}
            </span>

            <span
              className={`px-2.5 py-1 rounded-full font-bold border ${
                jamaah.economicStatus === 'MUZAKKI'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : isMustahiq
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Kategori: {jamaah.economicStatus.replace('_', ' ')}
            </span>

            {jamaah.isYouthMember && (
              <span className="px-2.5 py-1 rounded-full font-bold bg-teal-100 text-teal-800 border border-teal-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Anggota IRMA Babul Khaer
              </span>
            )}
          </div>

          {/* Mustahiq Alert Card if Applicable */}
          {isMustahiq && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 text-amber-900">
              <div className="flex items-center gap-2 font-bold text-xs">
                <HeartHandshake className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Status Kelayakan Penerima Manfaat (Mustahiq DKM)</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Warga ini terdaftar dalam basis data penerima zakat fitrah, paket sembako dhuafa, dan santunan sosial darurat DKM Babul Khaer.
              </p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Alamat */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Domisili & Alamat</span>
              </span>
              <p className="font-bold text-slate-900 text-sm">{jamaah.houseNumber}</p>
              <p className="text-slate-600 text-[11px]">{jamaah.fullAddress}</p>
              <p className="text-slate-500 text-[10px]">{jamaah.rt} RW 08, Kompleks BTP Tamalanrea</p>
            </div>

            {/* Kontak & WhatsApp */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Kontak Langsung</span>
                </span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                  {jamaah.phone || '-'}
                </p>
                {jamaah.email && (
                  <p className="text-slate-500 text-[11px] truncate">{jamaah.email}</p>
                )}
              </div>

              {jamaah.phone && (
                <a
                  href={`https://wa.me/${cleanPhoneForWa(jamaah.phone)}?text=${encodeURIComponent(
                    `Assalamu'alaikum Warahmatullahi Wabarakatuh Bapak/Ibu ${jamaah.fullName}, salam dari Pengurus DKM Babul Khaer BTP Blok AE.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Hubungi via WhatsApp</span>
                  <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              )}
            </div>

            {/* Susunan Keluarga */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                <span>Peran Keluarga & Jiwa</span>
              </span>
              <p className="font-bold text-slate-900">
                {jamaah.familyRole === 'KEPALA_KELUARGA'
                  ? 'Kepala Keluarga'
                  : jamaah.familyRole === 'ISTRI'
                  ? 'Istri'
                  : jamaah.familyRole === 'ANAK'
                  ? 'Anak'
                  : 'Lansia / Tanggungan'}
              </p>
              <p className="text-slate-600 text-[11px]">
                Jumlah Tanggungan: <strong>{jamaah.familyMemberCount || 1} Jiwa</strong>
              </p>
            </div>

            {/* Pekerjaan & Darah */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-teal-600" />
                <span>Pekerjaan & Data Medis</span>
              </span>
              <p className="font-bold text-slate-900">{jamaah.occupation || '-'}</p>
              <p className="text-slate-600 text-[11px] flex items-center gap-1">
                <Droplet className="w-3 h-3 text-rose-500" />
                <span>Golongan Darah: <strong>{jamaah.bloodType || '-'}</strong></span>
              </p>
            </div>
          </div>

          {/* Catatan Khusus */}
          {jamaah.notes && (
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase text-slate-500">
                Catatan Pengurus DKM:
              </span>
              <p className="text-slate-800 italic leading-relaxed">{jamaah.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            onClick={handleCopySummary}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin Data'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(jamaah)}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              Ubah Profil
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
