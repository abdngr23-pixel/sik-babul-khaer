'use client';

import React, { useState, useMemo } from 'react';
import { AssetItem, ASSET_CATEGORIES, AssetCategory, AssetCondition } from '@/types/asset';
import { formatRupiah } from '@/components/finance/finance-stats';
import {
  Search,
  Plus,
  Wrench,
  Edit2,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  MapPin,
  Calendar
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Pagination from '@/components/ui/pagination';
import { useAuth } from '@/lib/auth-context';

interface AssetTableProps {
  assets: AssetItem[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedCondition: string;
  onSelectCondition: (cond: string) => void;
  onlyDue: boolean;
  onToggleOnlyDue: (val: boolean) => void;
  onOpenCreate: () => void;
  onEdit: (asset: AssetItem) => void;
  onDelete: (id: string, name: string) => void;
  onRecordMaintenance: (asset: AssetItem) => void;
  isReadOnly?: boolean;
  externalSearchTerm?: string;
}

export default function AssetTable({
  assets,
  selectedCategory,
  onSelectCategory,
  selectedCondition,
  onSelectCondition,
  onlyDue,
  onToggleOnlyDue,
  onOpenCreate,
  onEdit,
  onDelete,
  onRecordMaintenance,
  isReadOnly = false,
  externalSearchTerm = '',
}: AssetTableProps) {
  const { canMutateTab, isReadOnly: authReadOnly } = useAuth();
  const canMutate = !isReadOnly && !authReadOnly && canMutateTab('assets');

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    const effectiveQ = (externalSearchTerm || searchQuery).trim().toLowerCase();

    return assets.filter((item) => {
      // Category filter
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      // Condition filter
      if (selectedCondition !== 'ALL' && item.condition !== selectedCondition) {
        return false;
      }
      // Due only filter
      if (onlyDue && !item.isMaintenanceDue) {
        return false;
      }
      // Search query
      if (effectiveQ) {
        const matchesName = item.name.toLowerCase().includes(effectiveQ);
        const matchesCode = item.code.toLowerCase().includes(effectiveQ);
        const matchesLocation = item.location.toLowerCase().includes(effectiveQ);
        const matchesNotes = (item.maintenanceNotes || '').toLowerCase().includes(effectiveQ);
        if (!matchesName && !matchesCode && !matchesLocation && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [assets, selectedCategory, selectedCondition, onlyDue, searchQuery, externalSearchTerm]);

  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export to Excel
  const handleExportExcel = () => {
    const dataForExport = filteredAssets.map((item, index) => ({
      No: index + 1,
      'Kode Aset': item.code,
      'Nama Inventaris': item.name,
      Kategori: ASSET_CATEGORIES[item.category]?.name || item.category,
      Lokasi: item.location,
      'Nilai Perolehan (Rp)': item.purchaseCost || 0,
      'Tanggal Beli': item.purchaseDate || '-',
      Kondisi: item.condition,
      'Siklus Servis (Bulan)': item.maintenanceCycleMonths,
      'Servis Terakhir': item.lastMaintenanceDate || '-',
      'Jatuh Tempo Berikutnya': item.nextMaintenanceDate || '-',
      'Status Pemeliharaan': item.isMaintenanceDue ? 'LEWAT JATUH TEMPO' : 'TERJADWAL AMAN',
      'Catatan Servis / Fisik': item.maintenanceNotes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventaris Sarpras MBH');

    // Auto-fit column widths
    worksheet['!cols'] = [
      { wch: 5 },  // No
      { wch: 15 }, // Kode
      { wch: 40 }, // Nama
      { wch: 28 }, // Kategori
      { wch: 25 }, // Lokasi
      { wch: 18 }, // Nilai
      { wch: 14 }, // Tgl Beli
      { wch: 16 }, // Kondisi
      { wch: 18 }, // Siklus
      { wch: 15 }, // Last
      { wch: 16 }, // Next
      { wch: 20 }, // Status
      { wch: 40 }, // Catatan
    ];

    const todayStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Katalog_Aset_Sarpras_Babul_Khaer_${todayStr}.xlsx`);
  };

  const getConditionBadge = (cond: AssetCondition) => {
    switch (cond) {
      case 'BAIK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Kondisi Prima
          </span>
        );
      case 'PERLU_PERBAIKAN':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Perlu Perbaikan
          </span>
        );
      case 'RUSAK_BERAT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Rusak Berat
          </span>
        );
    }
  };

  const getCategoryBadge = (cat: AssetCategory) => {
    switch (cat) {
      case 'PENDINGIN_UDARA':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            AC & Pendingin
          </span>
        );
      case 'ELEKTRONIK_AUDIO':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Sound & Audio
          </span>
        );
      case 'MESIN_LISTRIK':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Genset & Listrik
          </span>
        );
      case 'SARANA_IBADAH':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Karpet & Ibadah
          </span>
        );
      case 'PERLENGKAPAN_KANTOR':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            Kantor & IT
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {cat}
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Action Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kode (AST-...), nama barang, atau lokasi..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition-all cursor-pointer"
              title="Unduh data inventaris ke spreadsheet Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Ekspor Excel</span>
            </button>

            {canMutate && (
              <button
                onClick={onOpenCreate}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Daftarkan Aset Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Kategori:</span>
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
            >
              <option value="ALL">Semua Kategori Sarpras</option>
              {Object.entries(ASSET_CATEGORIES).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">Kondisi:</span>
            <select
              value={selectedCondition}
              onChange={(e) => onSelectCondition(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
            >
              <option value="ALL">Semua Kondisi</option>
              <option value="BAIK">Kondisi Prima (Baik)</option>
              <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
              <option value="RUSAK_BERAT">Rusak Berat</option>
            </select>
          </div>

          {/* Toggle Button: Only Due For Maintenance */}
          <button
            onClick={() => onToggleOnlyDue(!onlyDue)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
              onlyDue
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${onlyDue ? 'text-white' : 'text-amber-500'}`} />
            <span>Hanya Jatuh Tempo Servis</span>
          </button>

          {/* Active Filter Clear */}
          {(selectedCategory !== 'ALL' || selectedCondition !== 'ALL' || onlyDue || searchQuery) && (
            <button
              onClick={() => {
                onSelectCategory('ALL');
                onSelectCondition('ALL');
                onToggleOnlyDue(false);
                setSearchQuery('');
              }}
              className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline ml-auto cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Asset Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Kode & Inventaris Aset</th>
              <th className="py-3 px-4">Kategori & Lokasi</th>
              <th className="py-3 px-4">Nilai Perolehan</th>
              <th className="py-3 px-4">Siklus Servis</th>
              <th className="py-3 px-4">Jatuh Tempo Berikutnya</th>
              <th className="py-3 px-4">Kondisi Fisik</th>
              <th className="py-3 px-4 text-center">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Wrench className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">Tidak ada data aset inventaris ditemukan</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Coba sesuaikan filter kategori, kondisi, atau kata kunci pencarian Anda.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedAssets.map((asset) => {
                return (
                  <tr
                    key={asset.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                      asset.isMaintenanceDue ? 'bg-amber-50/30 dark:bg-amber-950/20' : ''
                    }`}
                  >
                    {/* Kode & Nama */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                        {asset.code}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 leading-snug">
                        {asset.name}
                      </div>
                      {asset.maintenanceNotes && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic flex items-center gap-1">
                          <span>Catatan:</span>
                          <span className="text-slate-700 dark:text-slate-300">{asset.maintenanceNotes}</span>
                        </div>
                      )}
                    </td>

                    {/* Kategori & Lokasi */}
                    <td className="py-3.5 px-4 space-y-1">
                      <div>{getCategoryBadge(asset.category)}</div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{asset.location}</span>
                      </div>
                    </td>

                    {/* Nilai Perolehan */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
                        {formatRupiah(asset.purchaseCost || 0)}
                      </div>
                      {asset.purchaseDate && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>Beli: {asset.purchaseDate}</span>
                        </div>
                      )}
                    </td>

                    {/* Siklus Servis */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        <span>Per {asset.maintenanceCycleMonths} Bulan</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                        Servis akhir:{' '}
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {asset.lastMaintenanceDate || '-'}
                        </span>
                      </div>
                    </td>

                    {/* Tanggal Servis Berikutnya */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {asset.isMaintenanceDue ? (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-pulse">
                            <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                            <span>LEWAT JATUH TEMPO</span>
                          </div>
                          <div className="text-[11px] font-bold text-rose-900 dark:text-rose-300">
                            {asset.nextMaintenanceDate}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-800">
                            <span>Jadwal Aman</span>
                          </div>
                          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                            {asset.nextMaintenanceDate || '-'}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Kondisi Fisik */}
                    <td className="py-3.5 px-4">
                      {getConditionBadge(asset.condition)}
                    </td>

                    {/* Aksi Operasional */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {canMutate ? (
                          <>
                            {/* Tombol 1-Klik Catat Servis Selesai */}
                            <button
                              onClick={() => onRecordMaintenance(asset)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition-colors cursor-pointer shadow-2xs"
                              title="Tandai pemeliharaan/servis rutin telah selesai dikerjakan"
                            >
                              <Wrench className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                              <span>Servis Selesai</span>
                            </button>

                            {/* Edit Button */}
                            <button
                              onClick={() => onEdit(asset)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit rincian aset"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => onDelete(asset.id, asset.name)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Hapus aset dari inventaris"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            Mode Tinjau
                          </span>
                        )}
                      </div>
                    </td>
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
        totalItems={filteredAssets.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
