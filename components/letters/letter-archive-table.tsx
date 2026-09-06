'use client';

import React, { useState } from 'react';
import {
  OfficialLetter,
  LetterCategory,
  LetterStatus,
  LetterDepartment,
  LETTER_CATEGORIES,
  LETTER_DEPARTMENTS,
} from '@/types/letter';
import { formatIndonesianDate } from '@/lib/letter-numbering';
import {
  Search,
  Filter,
  Eye,
  Copy,
  Check,
  FileText,
  Clock,
  Send,
  Archive,
  CheckCircle2,
  FolderArchive,
  Download,
  QrCode,
} from 'lucide-react';

interface LetterArchiveTableProps {
  letters: OfficialLetter[];
  onPreviewLetter: (letter: OfficialLetter) => void;
  onUpdateStatus: (id: string, newStatus: LetterStatus) => void;
  onOpenArchiveModal?: () => void;
  isReadOnly?: boolean;
  externalSearchTerm?: string;
}

export default function LetterArchiveTable({
  letters,
  onPreviewLetter,
  onUpdateStatus,
  onOpenArchiveModal,
  isReadOnly = false,
  externalSearchTerm = '',
}: LetterArchiveTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState<LetterDepartment | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter letters
  const effectiveSearch = (externalSearchTerm || searchTerm).toLowerCase().trim();
  const filteredLetters = letters.filter((letter) => {
    const matchesSearch =
      !effectiveSearch ||
      letter.letterNumber.toLowerCase().includes(effectiveSearch) ||
      letter.subject.toLowerCase().includes(effectiveSearch) ||
      letter.recipientName.toLowerCase().includes(effectiveSearch);

    const matchesCategory =
      selectedCategory === 'ALL' || letter.category === selectedCategory;

    const matchesDepartment =
      selectedDepartment === 'ALL' ||
      letter.department === selectedDepartment ||
      letter.letterNumber.includes(`/${selectedDepartment}/`);

    const matchesStatus =
      selectedStatus === 'ALL' || letter.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesDepartment && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nomor Surat',
      'Bidang',
      'Kategori',
      'Tanggal Surat',
      'Penerima',
      'Perihal',
      'Status',
      'Kode Verifikasi',
    ];
    const rows = filteredLetters.map((l, idx) => [
      idx + 1,
      `"${l.letterNumber}"`,
      `"${l.department || '-'}"`,
      `"${l.category}"`,
      `"${l.letterDate}"`,
      `"${(l.recipientName || '').replace(/"/g, '""')}"`,
      `"${(l.subject || '').replace(/"/g, '""')}"`,
      `"${l.status}"`,
      `"${l.verificationCode || '-'}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Buku_Agenda_Surat_Keluar_DKM_Babul_Khaer_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyNumber = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: LetterStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Draf</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Disetujui</span>
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Send className="w-3 h-3 text-blue-600" />
            <span>Terkirim</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            <Archive className="w-3 h-3 text-slate-600" />
            <span>Diarsipkan</span>
          </span>
        );
    }
  };

  const getCategoryBadge = (category: LetterCategory) => {
    const info = LETTER_CATEGORIES[category];
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {info?.code || category}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Notice Banner Tata Usaha AD/ART & Anti-Duplikasi */}
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-soft-sm">
        <div className="flex items-center gap-2.5 text-emerald-950">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300/60">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900">Tata Usaha Terpadu & Registry Nomor Anti-Duplikasi</h4>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              Nomor urut otomatis tersinkronisasi terpusat antara Sekretaris I, Sekretaris II, dan Panitia PHBI sesuai AD/ART.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono font-semibold px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-900 w-fit">
          <span>Format: [No]/[Bidang]/DKM-BK/[Romawi]/[Tahun]</span>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor surat, perihal, atau nama penerima..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all text-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center gap-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value as LetterDepartment | 'ALL')}
              className="text-xs font-semibold border border-slate-200 rounded-xl px-2.5 py-2 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="ALL">Semua Bidang</option>
              {Object.values(LETTER_DEPARTMENTS).map((d) => (
                <option key={d.code} value={d.code}>
                  [{d.code}] {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-xl px-2.5 py-2 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Semua Kategori</option>
            {Object.values(LETTER_CATEGORIES).map((c) => (
              <option key={c.code} value={c.code}>
                [{c.code}] {c.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-xl px-2.5 py-2 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Semua Status</option>
            <option value="DRAFT">Draf</option>
            <option value="APPROVED">Disetujui</option>
            <option value="SENT">Terkirim</option>
            <option value="ARCHIVED">Diarsipkan</option>
          </select>

          {/* Export CSV Buku Agenda */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-300 transition-colors cursor-pointer shrink-0"
            title="Unduh rekap buku agenda nomor surat keluar untuk audit"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700" />
            <span>Ekspor Agenda</span>
          </button>

          {/* Catat Arsip Surat Lampau */}
          {onOpenArchiveModal && !isReadOnly && (
            <button
              onClick={onOpenArchiveModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-300 transition-colors cursor-pointer shrink-0"
              title="Catat arsip surat fisik yang telah keluar sebelum tercatat di sistem"
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-600" />
              <span>Catat Arsip</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-4">Nomor Surat</th>
                <th className="py-3 px-4">Perihal & Kategori</th>
                <th className="py-3 px-4">Penerima</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-medium text-sm text-slate-600">Tidak ada surat ditemukan</p>
                    <p className="text-xs text-slate-400">
                      Coba sesuaikan kata kunci pencarian atau filter kategori di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLetters.map((letter) => (
                  <tr
                    key={letter.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Nomor Surat */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{letter.letterNumber}</span>
                        <button
                          onClick={() => handleCopyNumber(letter.id, letter.letterNumber)}
                          title="Salin Nomor Surat"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 rounded text-slate-500 cursor-pointer"
                        >
                          {copiedId === letter.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Perihal & Kategori */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {getCategoryBadge(letter.category)}
                        {letter.department && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {letter.department}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5" title="Terverifikasi QR Code Resmi">
                          <QrCode className="w-2.5 h-2.5 text-emerald-600" />
                          <span>QR</span>
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 line-clamp-1">
                        {letter.subject}
                      </p>
                    </td>

                    {/* Penerima */}
                    <td className="py-3 px-4 max-w-[200px]">
                      <p className="font-medium text-slate-900 line-clamp-1">
                        {letter.recipientName}
                      </p>
                      {letter.recipientAddress && (
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          {letter.recipientAddress}
                        </p>
                      )}
                    </td>

                    {/* Tanggal */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                      {formatIndonesianDate(letter.letterDate)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(letter.status)}
                        {!isReadOnly && (
                          <select
                            value={letter.status}
                            onChange={(e) => onUpdateStatus(letter.id, e.target.value as LetterStatus)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600 cursor-pointer"
                            title="Ubah Status Surat"
                          >
                            <option value="DRAFT">Draf</option>
                            <option value="APPROVED">Disetujui</option>
                            <option value="SENT">Terkirim</option>
                            <option value="ARCHIVED">Diarsipkan</option>
                          </select>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onPreviewLetter(letter)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs transition-colors cursor-pointer border border-emerald-200/80"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Dokumen</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="bg-slate-50 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredLetters.length}</strong> dari total <strong>{letters.length}</strong> surat dalam E-Arsip
          </span>
          <span className="text-[11px] text-slate-400">
            Katalog Dokumen DKM Masjid Babul Khaer
          </span>
        </div>
      </div>
    </div>
  );
}
