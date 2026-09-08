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
import { useAuth } from '@/lib/auth-context';

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
  const { canMutateTab, isReadOnly: authReadOnly } = useAuth();
  const canMutate = !isReadOnly && !authReadOnly && canMutateTab('finance');

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

    let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700';
    if (color === 'blue') bgClass = 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    if (color === 'amber') bgClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-700 font-bold';
    if (color === 'purple') bgClass = 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    if (color === 'teal') bgClass = 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800';

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
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari uraian transaksi, pihak pembayar, kwitansi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>

        {/* Filter Badges & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Pos Dana Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
            className="text-xs py-2 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden focus:border-emerald-500"
          >
            <option value="ALL">Semua Pos Kas</option>
            <option value="KAS_OPERASIONAL">Kas Operasional Rutin</option>
            <option value="SWADAYA_PHBI">Dana Swadaya PHBI (Satu Pintu)</option>
            <option value="ZISWAF_ZAKAT">Zakat Mal & Fitrah</option>
            <option value="ZISWAF_INFAQ">Infaq / Sedekah Terikat</option>
            <option value="INFAQ_JUMAT">Kotak Amal Jumat</option>
          </select>

          {/* Type Filter Buttons */}
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800 text-xs">
            <button
              onClick={() => handleSelectType('ALL')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedType === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => handleSelectType('INCOME')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedType === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400'
              }`}
            >
              Masuk
            </button>
            <button
              onClick={() => handleSelectType('EXPENSE')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                selectedType === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-400'
              }`}
            >
              Keluar
            </button>
          </div>

          {/* Cetak Laporan Kas Jumat */}
          <button
            onClick={() => setIsFridayReportOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all cursor-pointer shadow-2xs"
            title="Buka format cetak resmi pengumuman kas mingguan Sholat Jumat"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span className="hidden sm:inline">Laporan Kas Jumat</span>
          </button>

          {/* Export to Excel */}
          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all cursor-pointer"
            title="Ekspor buku kas ke Microsoft Excel"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Ekspor Excel</span>
          </button>

          {/* Add Transaction Button */}
          {canMutate && (
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
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Tanggal & Bukti</th>
                <th className="py-3 px-4">Pos Anggaran</th>
                <th className="py-3 px-4">Uraian Transaksi</th>
                <th className="py-3 px-4">Pihak / Sumber</th>
                <th className="py-3 px-4 text-right">Nominal Kas</th>
                <th className="py-3 px-4 text-right">Saldo Berjalan</th>
                {canMutate && (onEdit || onDelete) && (
                  <th className="py-3 px-4 text-center">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={canMutate && (onEdit || onDelete) ? 7 : 6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Belum ada transaksi kas yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t) => {
                  const isIncome = t.type === 'INCOME';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Tanggal & No Bukti */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{t.date}</p>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {t.receiptNumber || `TX-${t.id.slice(0, 6)}`}
                        </span>
                      </td>

                      {/* Deskripsi & Kategori */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                          {t.description}
                        </p>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          {getCategoryBadge(t.category)}
                        </div>
                      </td>

                      {/* Pihak Terkait & Metode */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{t.payerOrPayee || '-'}</p>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          {t.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Nominal */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-bold">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            isIncome ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {isIncome ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          )}
                          <span>
                            {isIncome ? '+' : '-'}
                            {formatRupiah(t.amount)}
                          </span>
                        </span>
                      </td>

                      {/* Saldo Berjalan */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-semibold text-slate-900 dark:text-slate-100">
                        {formatRupiah(t.balanceAfter)}
                      </td>

                      {/* Aksi */}
                      {canMutate && (onEdit || onDelete) && (
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {onEdit && (
                              <button
                                onClick={() => onEdit(t)}
                                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                                title="Edit transaksi"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => onDelete(t.id, t.description)}
                                className="p-1 text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
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
