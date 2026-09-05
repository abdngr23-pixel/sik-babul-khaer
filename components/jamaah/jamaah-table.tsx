'use client';

import React, { useState } from 'react';
import { Jamaah, EconomicStatus, FamilyRole } from '@/types/jamaah';
import {
  Search,
  Filter,
  User,
  Phone,
  Eye,
  Edit2,
  ExternalLink,
  HeartHandshake,
  Sparkles,
  MapPin,
  Download,
  Upload,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { downloadJamaahTemplate } from '@/lib/excel-helper';

interface JamaahTableProps {
  jamaahList: Jamaah[];
  selectedRT: string;
  onSelectRT: (rt: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  onViewDetail: (jamaah: Jamaah) => void;
  onEdit: (jamaah: Jamaah) => void;
  onOpenCreate: () => void;
  onOpenExcelModal: () => void;
  isReadOnly?: boolean;
  externalSearchTerm?: string;
}

export default function JamaahTable({
  jamaahList,
  selectedRT,
  onSelectRT,
  selectedStatus,
  onSelectStatus,
  onViewDetail,
  onEdit,
  onOpenCreate,
  onOpenExcelModal,
  isReadOnly = false,
  externalSearchTerm = '',
}: JamaahTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResidency, setSelectedResidency] = useState('ALL');

  // Filtered list
  const effectiveTerm = (externalSearchTerm || searchTerm).toLowerCase().trim();
  const filteredList = jamaahList.filter((j) => {
    const matchesSearch =
      !effectiveTerm ||
      j.fullName.toLowerCase().includes(effectiveTerm) ||
      j.houseNumber.toLowerCase().includes(effectiveTerm) ||
      j.phone.includes(effectiveTerm) ||
      (j.occupation && j.occupation.toLowerCase().includes(effectiveTerm)) ||
      (j.notes && j.notes.toLowerCase().includes(effectiveTerm));

    const matchesRT = selectedRT === 'ALL' || j.rt === selectedRT;

    let matchesEconomic = true;
    if (selectedStatus === 'MUSTAHIQ_ALL') {
      matchesEconomic =
        j.economicStatus === 'MUSTAHIQ_DHUAFA' ||
        j.economicStatus === 'YATIM_PIATU' ||
        j.economicStatus === 'LANSIA_DHUAFA';
    } else if (selectedStatus !== 'ALL') {
      matchesEconomic = j.economicStatus === selectedStatus;
    }

    const matchesResidency =
      selectedResidency === 'ALL' || j.residencyStatus === selectedResidency;

    return matchesSearch && matchesRT && matchesEconomic && matchesResidency;
  });

  const getEconomicBadge = (status: EconomicStatus) => {
    switch (status) {
      case 'MUZAKKI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Muzakki
          </span>
        );
      case 'MAMPU':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Mampu
          </span>
        );
      case 'MUSTAHIQ_DHUAFA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <HeartHandshake className="w-3 h-3 text-amber-700" />
            Mustahiq Dhuafa
          </span>
        );
      case 'YATIM_PIATU':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300">
            Yatim / Piatu
          </span>
        );
      case 'LANSIA_DHUAFA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
            Lansia Dhuafa
          </span>
        );
    }
  };

  const getFamilyRoleBadge = (role: FamilyRole, isYouth?: boolean) => {
    switch (role) {
      case 'KEPALA_KELUARGA':
        return (
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
            Kepala Keluarga
          </span>
        );
      case 'ISTRI':
        return (
          <span className="text-[10px] font-medium text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded border border-pink-200">
            Istri
          </span>
        );
      case 'ANAK':
        return isYouth ? (
          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 inline-flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            Remaja IRMA
          </span>
        ) : (
          <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            Anak
          </span>
        );
      case 'LANSIA_TANGGUNGAN':
        return (
          <span className="text-[10px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            Lansia
          </span>
        );
    }
  };

  const cleanPhoneForWa = (phoneStr: string) => {
    let clean = phoneStr.replace(/\D/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return clean;
  };

  return (
    <div className="space-y-4">
      {/* Banner Jaminan Privasi Data Jamaah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white border border-emerald-200/90 rounded-2xl px-4 py-3 text-xs text-emerald-950 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block">Pangkalan Data Jamaah Dilindungi & Bersifat Internal</span>
            <span className="text-[11px] text-emerald-800">
              Data warga hanya digunakan untuk ukhuwah, silaturahmi, syiar dakwah, dan bantuan sosial warga BTP Blok AE
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 self-start sm:self-auto">
          Terproteksi DKM
        </span>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama jamaah, nomor rumah di Blok AE, pekerjaan, atau catatan..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all text-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* RT Select */}
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedRT}
              onChange={(e) => onSelectRT(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="ALL">Semua RT (Blok AE)</option>
              <option value="RT 01">RT 01</option>
              <option value="RT 02">RT 02</option>
              <option value="RT 03">RT 03</option>
              <option value="RT 04">RT 04</option>
              <option value="RT 05">RT 05</option>
            </select>
          </div>

          {/* Social/Economic Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="ALL">Semua Status Sosial</option>
            <option value="MUSTAHIQ_ALL">Semua Mustahiq & Bansos</option>
            <option value="MUSTAHIQ_DHUAFA">Mustahiq Dhuafa</option>
            <option value="LANSIA_DHUAFA">Lansia Dhuafa</option>
            <option value="YATIM_PIATU">Yatim / Piatu</option>
            <option value="MUZAKKI">Muzakki</option>
            <option value="MAMPU">Mampu</option>
          </select>

          {/* Domisili */}
          <select
            value={selectedResidency}
            onChange={(e) => setSelectedResidency(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            <option value="ALL">Semua Domisili</option>
            <option value="TETAP">Warga Tetap</option>
            <option value="KONTRAK">Kontrak</option>
            <option value="KOST">Kost</option>
          </select>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={downloadJamaahTemplate}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer"
              title="Unduh format file Excel untuk input massal"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>

            {!isReadOnly && (
              <>
                <button
                  type="button"
                  onClick={onOpenExcelModal}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  title="Upload berkas Excel atau XLS untuk input massal"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Excel / XLS</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenCreate}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manual</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick Mustahiq Filter Notification Banner */}
      {selectedStatus === 'MUSTAHIQ_ALL' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Menampilkan filter khusus: <strong>Daftar Mustahiq, Yatim, & Lansia Dhuafa</strong> untuk kemudahan penyaluran ZISWAF dan Bantuan Sosial Darurat DKM Babul Khaer.
            </span>
          </div>
          <button
            onClick={() => onSelectStatus('ALL')}
            className="text-[11px] font-bold text-amber-800 underline hover:text-amber-950 shrink-0 cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Nama Lengkap & Status</th>
                <th className="py-3 px-4">Alamat Blok AE</th>
                <th className="py-3 px-4">Status ZISWAF / Bansos</th>
                <th className="py-3 px-4">Kontak WhatsApp</th>
                <th className="py-3 px-4">Pekerjaan & Domisili</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <User className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-sm text-slate-700">
                      Tidak ada data jamaah yang sesuai
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Coba sesuaikan kata kunci pencarian atau bersihkan filter di atas.
                    </p>
                    <button
                      onClick={onOpenCreate}
                      className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      <span>+ Tambah Jamaah Baru</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredList.map((j) => (
                  <tr
                    key={j.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Nama & Peran */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            j.gender === 'L'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-pink-100 text-pink-800'
                          }`}
                        >
                          {j.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {j.fullName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {getFamilyRoleBadge(j.familyRole, j.isYouthMember)}
                            {j.familyMemberCount && j.familyRole === 'KEPALA_KELUARGA' && (
                              <span className="text-[10px] text-slate-500">
                                ({j.familyMemberCount} jiwa)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Alamat */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{j.houseNumber}</span>
                      </div>
                      <div className="mt-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {j.rt}
                        </span>
                      </div>
                    </td>

                    {/* Status ZISWAF */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getEconomicBadge(j.economicStatus)}
                    </td>

                    {/* Kontak WhatsApp */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {j.phone ? (
                        <a
                          href={`https://wa.me/${cleanPhoneForWa(j.phone)}?text=${encodeURIComponent(
                            `Assalamu'alaikum Warahmatullahi Wabarakatuh Bapak/Ibu ${j.fullName}, salam dari Pengurus DKM Babul Khaer BTP Blok AE.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs border border-emerald-200 transition-colors"
                          title="Kirim pesan WhatsApp"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{j.phone}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-emerald-500 opacity-70" />
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs italic">-</span>
                      )}
                    </td>

                    {/* Pekerjaan & Domisili */}
                    <td className="py-3 px-4 max-w-[180px]">
                      <p className="font-medium text-slate-900 truncate">
                        {j.occupation || '-'}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        Status: {j.residencyStatus === 'TETAP' ? 'Warga Tetap' : j.residencyStatus === 'KONTRAK' ? 'Kontrak' : 'Kost'}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDetail(j)}
                          className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Profil Lengkap"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isReadOnly && (
                          <button
                            onClick={() => onEdit(j)}
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Ubah Data Profil"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            Menampilkan <strong>{filteredList.length}</strong> dari total <strong>{jamaahList.length}</strong> warga terdata di BTP Blok AE
          </span>
          <span className="text-[11px] text-slate-400">
            Sistem Informasi DKM Babul Khaer • Basis Data Umat
          </span>
        </div>
      </div>
    </div>
  );
}
