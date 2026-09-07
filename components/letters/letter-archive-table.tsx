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
} from 'lucide-react';
import Pagination from '@/components/ui/pagination';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const paginatedLetters = filteredLetters.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>Draf</span>
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span>Disetujui</span>
          </span>
        );
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Send className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span>Terkirim</span>
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Archive className="w-3 h-3 text-slate-600 dark:text-slate-400" />
            <span>Diarsipkan</span>
          </span>
        );
    }
  };

  const getCategoryBadge = (category: LetterCategory) => {
    const info = LETTER_CATEGORIES[category];
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {info?.code || category}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Notice Banner Tata Usaha AD/ART & Anti-Duplikasi */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/90 dark:border-emerald-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-soft-sm">
        <div className="flex items-center gap-2.5 text-emerald-950 dark:text-emerald-200">
          <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Tata Usaha Terpadu & Registry Nomor Anti-Duplikasi</h4>
            <p className="text-emerald-800 dark:text-emerald-400 text-[11px] mt-0.5">
              Nomor urut otomatis tersinkronisasi terpusat antara Sekretaris I, Sekretaris II, dan Panitia PHBI sesuai AD/ART.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 w-fit">
          <span>Format: [No]/[Bidang]/DKM-BK/[Romawi]/[Tahun]</span>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-soft-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nomor surat, perihal, atau nama penerima..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden transition-all text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
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
              className="text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20"
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
            className="text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20"
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
            className="text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20"
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
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-semibold text-xs border border-emerald-300 dark:border-emerald-700 transition-colors cursor-pointer shrink-0"
            title="Unduh rekap buku agenda nomor surat keluar untuk audit"
          >
            <Download className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Ekspor Agenda</span>
          </button>

          {/* Catat Arsip Surat Lampau */}
          {onOpenArchiveModal && !isReadOnly && (
            <button
              onClick={onOpenArchiveModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-semibold text-xs border border-amber-300 dark:border-amber-700 transition-colors cursor-pointer shrink-0"
              title="Catat arsip surat fisik yang telah keluar sebelum tercatat di sistem"
            >
              <FolderArchive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Catat Arsip</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <th className="py-3 px-4">Nomor Surat</th>
                <th className="py-3 px-4">Perihal & Kategori</th>
                <th className="py-3 px-4">Penerima</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-200">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400 dark:text-slate-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-medium text-sm text-slate-600 dark:text-slate-300">Tidak ada surat ditemukan</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Coba sesuaikan kata kunci pencarian atau filter kategori di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLetters.map((letter) => (
                  <tr
                    key={letter.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Nomor Surat */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span>{letter.letterNumber}</span>
                        <button
                          onClick={() => handleCopyNumber(letter.id, letter.letterNumber)}
                          title="Salin Nomor Surat"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 dark:text-slate-400 cursor-pointer"
                        >
                          {copiedId === letter.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            {letter.department}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                        {letter.subject}
                      </p>
                    </td>

                    {/* Penerima */}
                    <td className="py-3 px-4 max-w-[180px]">
                      <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1">
                        {letter.recipientName}
                      </p>
                      {letter.recipientAddress && (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
                          {letter.recipientAddress}
                        </p>
                      )}
                    </td>

                    {/* Tanggal */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{formatIndonesianDate(letter.letterDate)}</span>
                      </div>
                    </td>

                    {/* Status & Quick Action */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(letter.status)}

                        {/* Fast Status Change Actions */}
                        {!isReadOnly && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            {letter.status === 'DRAFT' && (
                              <button
                                onClick={() => onUpdateStatus(letter.id, 'APPROVED')}
                                title="Sahkan Surat (Ketua Umum)"
                                className="p-1 rounded bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {letter.status === 'APPROVED' && (
                              <button
                                onClick={() => onUpdateStatus(letter.id, 'SENT')}
                                title="Tandai Sudah Terkirim ke Penerima"
                                className="p-1 rounded bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition-colors cursor-pointer"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {letter.status === 'SENT' && (
                              <button
                                onClick={() => onUpdateStatus(letter.id, 'ARCHIVED')}
                                title="Simpan ke Arsip Permanen"
                                className="p-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onPreviewLetter(letter)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition-colors cursor-pointer border border-emerald-200/80 dark:border-emerald-800"
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

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredLetters.length}
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
