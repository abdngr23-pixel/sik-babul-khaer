'use client';

import React, { useState } from 'react';
import { FinanceTransaction, FINANCE_CATEGORIES, FinanceCategory } from '@/types/finance';
import { formatRupiah } from './finance-stats';
import {
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Edit2,
  Trash2,
  Printer,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import FridayReportModal from './friday-report-modal';
import Pagination from '@/components/ui/pagination';

interface TransactionTableProps {
  transactions: FinanceTransaction[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedType?: string;
  onSelectType?: (type: string) => void;
  onOpenCreate: () => void;
  onEdit?: (tx: FinanceTransaction) => void;
  onDelete?: (id: string, desc: string) => void;
  isReadOnly?: boolean;
  externalSearchTerm?: string;
}

export default function TransactionTable({
  transactions,
  selectedCategory,
  onSelectCategory,
  selectedType: propSelectedType,
  onSelectType: propOnSelectType,
  onOpenCreate,
  onEdit,
  onDelete,
  isReadOnly = false,
  externalSearchTerm = '',
}: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalSelectedType, setInternalSelectedType] = useState('ALL');
  const [isFridayReportOpen, setIsFridayReportOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const selectedType = propSelectedType !== undefined ? propSelectedType : internalSelectedType;
  const handleSelectType = (type: string) => {
    if (propOnSelectType) propOnSelectType(type);
    else setInternalSelectedType(type);
  };

  const effectiveSearch = (externalSearchTerm || searchTerm).toLowerCase().trim();
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      !effectiveSearch ||
      t.description.toLowerCase().includes(effectiveSearch) ||
      (t.payerOrPayee && t.payerOrPayee.toLowerCase().includes(effectiveSearch)) ||
      (t.receiptNumber && t.receiptNumber.toLowerCase().includes(effectiveSearch));

    const matchesCategory =
      selectedCategory === 'ALL' || t.category === selectedCategory;

    const matchesType =
      selectedType === 'ALL' || t.type === selectedType;

    return matchesSearch && matchesCategory && matchesType;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getCategoryBadge = (category: FinanceCategory) => {
    const info = FINANCE_CATEGORIES[category];
    const color = info?.badgeColor || 'slate';

    let bgClass = 'bg-slate-100 text-slate-800 border-slate-200';
    if (color === 'blue') bgClass = 'bg-blue-50 text-blue-800 border-blue-200';
    if (color === 'amber') bgClass = 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
    if (color === 'purple') bgClass = 'bg-purple-50 text-purple-800 border-purple-200';
    if (color === 'teal') bgClass = 'bg-teal-50 text-teal-800 border-teal-200';

    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${bgClass}`}>
        {info?.name || category}
      </span>
    );
  };

  const exportToExcel = () => {
    const exportData = filteredTransactions.map((t, idx) => ({
      No: idx + 1,
      Tanggal: t.date,
      'No. Kwitansi': t.receiptNumber || '-',
      Tipe: t.type === 'INCOME' ? 'Kas Masuk' : 'Kas Keluar',
      'Pos Dana': FINANCE_CATEGORIES[t.category]?.name || t.category,
      'Uraian Transaksi': t.description,
      'Pihak / Sumber': t.payerOrPayee || '-',
      'Metode Bayar': t.paymentMethod,
      'Nominal (Rp)': t.amount,
      'Saldo Akhir (Rp)': t.balanceAfter,
      Catatan: t.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Buku Kas Babul Khaer');

    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 12 }, // Tanggal
      { wch: 15 }, // Kwitansi
      { wch: 12 }, // Tipe
      { wch: 25 }, // Pos
      { wch: 35 }, // Uraian
      { wch: 22 }, // Pihak
      { wch: 14 }, // Metode
      { wch: 16 }, // Nominal
      { wch: 16 }, // Saldo
      { wch: 25 }, // Catatan
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Buku_Kas_DKM_Babul_Khaer_${todayStr}.xlsx`);
  };

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari uraian transaksi, pihak pembayar, kwitansi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        {/* Filter Badges & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pos Dana Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="text-xs py-2 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden focus:border-emerald-500"
          >
            <option value="ALL">Semua Pos Kas</option>
            <option value="KAS_OPERASIONAL">Kas Operasional Rutin</option>
            <option value="SWADAYA_PHBI">Dana Swadaya PHBI (Satu Pintu)</option>
            <option value="ZISWAF_ZAKAT">Zakat Mal & Fitrah</option>
            <option value="ZISWAF_INFAQ">Infaq / Sedekah Terikat</option>
            <option value="INFAQ_JUMAT">Kotak Amal Jumat</option>
          </select>

          {/* Type Filter Buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => handleSelectType('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedType === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => handleSelectType('INCOME')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedType === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => handleSelectType('EXPENSE')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedType === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-700'
              }`}
            >
              Keluar
            </button>
          </div>

          {/* Cetak Laporan Kas Jumat */}
          <button
            onClick={() => setIsFridayReportOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
            title="Buka format cetak resmi pengumuman kas mingguan Sholat Jumat"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Laporan Kas Jumat</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            title="Ekspor buku kas ke Microsoft Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </button>

          {/* Add Transaction Button */}
          {!isReadOnly && (
            <button
              onClick={onOpenCreate}
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Catat Kas</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Tanggal & Bukti</th>
                <th className="py-3 px-4">Pos Anggaran</th>
                <th className="py-3 px-4">Uraian Transaksi</th>
                <th className="py-3 px-4">Pihak / Sumber</th>
                <th className="py-3 px-4 text-right">Nominal Kas</th>
                <th className="py-3 px-4 text-right">Saldo Berjalan</th>
                {!isReadOnly && (onEdit || onDelete) && (
                  <th className="py-3 px-4 text-center">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={!isReadOnly && (onEdit || onDelete) ? 7 : 6} className="py-12 text-center text-slate-400">
                    Belum ada transaksi kas yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => {
                  const isIncome = t.type === 'INCOME';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Tanggal & No Bukti */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-900">{t.date}</p>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {t.receiptNumber || `TX-${t.id.slice(0, 6)}`}
                        </span>
                      </td>

                      {/* Deskripsi & Kategori */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 line-clamp-2 leading-snug">
                          {t.description}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {getCategoryBadge(t.category)}
                        </div>
                      </td>

                      {/* Pihak Terkait & Metode */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-800">{t.payerOrPayee || '-'}</p>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {t.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Nominal */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isIncome ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          )}
                          <span>
                            {isIncome ? '+' : '-'}
                            {formatRupiah(t.amount)}
                          </span>
                        </span>
                      </td>

                      {/* Saldo Berjalan */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-semibold text-slate-900">
                        {formatRupiah(t.balanceAfter)}
                      </td>

                      {/* Aksi */}
                      {!isReadOnly && (onEdit || onDelete) && (
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(t)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                title="Edit transaksi"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(t.id, t.description)}
                                className="p-1 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Hapus transaksi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredTransactions.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Friday Cash Report Modal */}
      <FridayReportModal
        isOpen={isFridayReportOpen}
        onClose={() => setIsFridayReportOpen(false)}
        transactions={filteredTransactions}
      />
    </div>
  );
}
