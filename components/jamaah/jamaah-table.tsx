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
  HeartHandshake,
  Sparkles,
  Download,
  Upload,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { downloadJamaahTemplate } from '@/lib/excel-helper';
import Pagination from '@/components/ui/pagination';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const paginatedList = filteredList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getEconomicBadge = (status: EconomicStatus) => {
    switch (status) {
      case 'MUZAKKI':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            Muzakki
          </span>
        );
      case 'MAMPU':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Mampu
          </span>
        );
      case 'MUSTAHIQ_DHUAFA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <HeartHandshake className="w-3 h-3 text-amber-700 dark:text-amber-400" />
            Mustahiq Dhuafa
          </span>
        );
      case 'YATIM_PIATU':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
            Yatim / Piatu
          </span>
        );
      case 'LANSIA_DHUAFA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-950/50 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            Lansia Dhuafa
          </span>
        );
    }
  };

  const getFamilyRoleBadge = (role: FamilyRole, isYouth?: boolean) => {
    switch (role) {
      case 'KEPALA_KELUARGA':
        return (
          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
            Kepala Keluarga
          </span>
        );
      case 'ISTRI':
        return (
          <span className="text-[10px] font-medium text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/50 px-1.5 py-0.5 rounded border border-pink-200 dark:border-pink-800">
            Istri
          </span>
        );
      case 'ANAK':
        return isYouth ? (
          <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-1.5 py-0.5 rounded border border-teal-200 dark:border-teal-800 inline-flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            Remaja IRMA
          </span>
        ) : (
          <span className="text-[10px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
            Anak
          </span>
        );
      case 'LANSIA_TANGGUNGAN':
        return (
          <span className="text-[10px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            Lansia
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner Jaminan Privasi Data Jamaah */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/90 dark:border-emerald-800 rounded-2xl px-4 py-3 text-xs text-emerald-950 dark:text-emerald-200 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block">Pangkalan Data Jamaah Dilindungi & Bersifat Internal</span>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-400">
              Data warga hanya digunakan untuk ukhuwah, silaturahmi, syiar dakwah, dan bantuan sosial warga BTP Blok AE
            </span>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 self-start sm:self-auto">
          Terproteksi DKM
        </span>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama jamaah, nomor rumah di Blok AE, pekerjaan, atau catatan..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
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
              className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
            className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors cursor-pointer"
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
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
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
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>
              Menampilkan filter khusus: <strong>Daftar Mustahiq, Yatim, & Lansia Dhuafa</strong> untuk kemudahan penyaluran ZISWAF dan Bantuan Sosial Darurat DKM Babul Khaer.
            </span>
          </div>
          <button
            onClick={() => onSelectStatus('ALL')}
            className="text-[11px] font-bold text-amber-800 dark:text-amber-300 underline hover:text-amber-950 dark:hover:text-amber-100 shrink-0 cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-4">Nama Lengkap & Status</th>
                <th className="py-3 px-4">Alamat Blok AE</th>
                <th className="py-3 px-4">Status ZISWAF / Bansos</th>
                <th className="py-3 px-4">Kontak WhatsApp</th>
                <th className="py-3 px-4">Pekerjaan & Domisili</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <User className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-200">
                      Tidak ada data jamaah yang sesuai
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
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
                paginatedList.map((j) => (
                  <tr
                    key={j.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Nama & Peran */}
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                            j.gender === 'L'
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                              : 'bg-pink-100 dark:bg-pink-950/60 text-pink-800 dark:text-pink-300'
                          }`}
                        >
                          {j.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                            {j.fullName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {getFamilyRoleBadge(j.familyRole, j.isYouthMember)}
                            {j.gender === 'L' ? (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Laki-laki</span>
                            ) : (
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Perempuan</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Alamat & RT */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-semibold">
                        <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-bold text-emerald-800 dark:text-emerald-400">
                          {j.rt}
                        </span>
                        <span>No. {j.houseNumber}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Blok AE, Kompleks BTP
                      </p>
                    </td>

                    {/* No WhatsApp */}
                    <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {j.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{j.phone}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 italic">-</span>
                      )}
                    </td>

                    {/* Status Ekonomi */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getEconomicBadge(j.economicStatus)}
                    </td>

                    {/* Pekerjaan & Domisili */}
                    <td className="py-3 px-4 max-w-[180px]">
                      <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                        {j.occupation || '-'}
                      </p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        Status: {j.residencyStatus === 'TETAP' ? 'Warga Tetap' : j.residencyStatus === 'KONTRAK' ? 'Kontrak' : 'Kost'}
                      </span>
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewDetail(j)}
                          className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Profil Lengkap"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!isReadOnly && (
                          <button
                            onClick={() => onEdit(j)}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
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

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredList.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>
    </div>
  );
}
