'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  downloadFridayScheduleTemplate,
  parseFridayExcelFile,
  downloadRamadhanScheduleTemplate,
  parseRamadhanExcelFile,
} from '@/lib/dakwah-excel-helper';
import { FridayScheduleItem, RamadhanScheduleItem, KhatibItem } from '@/types/dakwah';

interface DakwahUploadModalProps {
  isOpen: boolean;
  type: 'FRIDAY' | 'RAMADHAN';
  selectedYear: number;
  hijriYear?: string;
  asatidzList: KhatibItem[];
  onClose: () => void;
  onImportFriday: (items: FridayScheduleItem[], mode: 'APPEND' | 'REPLACE') => void;
  onImportRamadhan: (items: RamadhanScheduleItem[], mode: 'APPEND' | 'REPLACE') => void;
}

export default function DakwahUploadModal({
  isOpen,
  type,
  selectedYear,
  hijriYear = '1448 H',
  asatidzList,
  onClose,
  onImportFriday,
  onImportRamadhan,
}: DakwahUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [importMode, setImportMode] = useState<'APPEND' | 'REPLACE'>('APPEND');

  // Parsed Friday items
  const [parsedFriday, setParsedFriday] = useState<FridayScheduleItem[]>([]);
  // Parsed Ramadhan items
  const [parsedRamadhan, setParsedRamadhan] = useState<RamadhanScheduleItem[]>([]);

  const [parsedErrors, setParsedErrors] = useState<{ row: number; reason: string }[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    if (type === 'FRIDAY') {
      downloadFridayScheduleTemplate(selectedYear, asatidzList);
    } else {
      downloadRamadhanScheduleTemplate(selectedYear, hijriYear, asatidzList);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMessage('');
    setParsedErrors([]);
    setIsParsing(true);

    try {
      if (type === 'FRIDAY') {
        const result = await parseFridayExcelFile(file, selectedYear);
        setParsedFriday(result.valid);
        setParsedErrors(result.errors);
        if (result.valid.length === 0 && result.errors.length > 0) {
          setErrorMessage('Tidak ada baris jadwal Jumat yang valid. Silakan periksa kolom Tanggal, Nama Khatib, dan Tema.');
        }
      } else {
        const result = await parseRamadhanExcelFile(file, selectedYear, hijriYear);
        setParsedRamadhan(result.valid);
        setParsedErrors(result.errors);
        if (result.valid.length === 0 && result.errors.length > 0) {
          setErrorMessage('Tidak ada baris jadwal Ramadhan yang valid. Periksa kolom Malam Ke (1-30) dan Nama Penceramah.');
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal membaca dan memproses file spreadsheet.');
      setParsedFriday([]);
      setParsedRamadhan([]);
      setParsedErrors([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleCommitImport = () => {
    if (type === 'FRIDAY') {
      if (parsedFriday.length === 0) return;
      onImportFriday(parsedFriday, importMode);
    } else {
      if (parsedRamadhan.length === 0) return;
      onImportRamadhan(parsedRamadhan, importMode);
    }
    onClose();
  };

  const totalValid = type === 'FRIDAY' ? parsedFriday.length : parsedRamadhan.length;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-soft-xl border border-slate-200 overflow-hidden flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92dvh] animate-slide-up sm:animate-none">
        {/* Header Modal */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-teal-200" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold tracking-tight truncate">
                {type === 'FRIDAY'
                  ? `Upload Jadwal Jumat — ${selectedYear}`
                  : `Upload Jadwal Ramadhan — ${hijriYear}`}
              </h3>
              <p className="text-xs text-teal-100/80 truncate">
                Impor massal dari file Excel (.xlsx, .xls) atau CSV.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner Unduh Template Resmi */}
        <div className="p-3.5 sm:p-4 bg-teal-50/70 border-b border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-teal-900 min-w-0">
            <p className="font-bold flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span>Belum memiliki file dengan format standar?</span>
            </p>
            <p className="text-teal-700 text-[11px] mt-0.5">
              Unduh template resmi DKM Babul Khaer yang telah dilengkapi contoh data.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white hover:bg-teal-100/60 text-teal-800 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer text-center"
          >
            <Download className="w-3.5 h-3.5 text-teal-700" />
            <span>Unduh Template Excel</span>
          </button>
        </div>

        {/* Konten Upload & Preview */}
        <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto overscroll-contain">
          {/* File Drag & Drop / Input */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-teal-600 bg-slate-50/60 hover:bg-teal-50/20 rounded-2xl p-6 text-center cursor-pointer transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-2xl bg-teal-100/70 text-teal-800 flex items-center justify-center mx-auto mb-2.5">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              {selectedFile ? selectedFile.name : 'Klik atau seret file spreadsheet ke sini'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Mendukung format Microsoft Excel (.xlsx, .xls) atau CSV (Maks. 5MB)
            </p>
            {selectedFile && (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold">
                Ukuran: {(selectedFile.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          {/* Loading Indicator */}
          {isParsing && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
              <Loader2 className="w-4 h-4 text-teal-700 animate-spin" />
              <span>Memvalidasi dan memproses baris data spreadsheet...</span>
            </div>
          )}

          {/* Pesan Error Global */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Hasil Validasi & Preview */}
          {totalValid > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{totalValid} Baris Siap Diimpor</span>
                  </span>
                  {parsedErrors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowErrors(!showErrors)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold cursor-pointer"
                    >
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>{parsedErrors.length} Baris Dilewati</span>
                      {showErrors ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Periode Terpilih: <strong>Tahun {selectedYear}</strong>
                </div>
              </div>

              {/* Daftar Error jika ada */}
              {showErrors && parsedErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 space-y-1 max-h-32 overflow-y-auto">
                  <p className="font-bold">Baris berikut tidak dapat dibaca dan akan dilewati:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {parsedErrors.map((err, i) => (
                      <li key={i}>
                        Baris {err.row}: {err.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 sticky top-0 border-b border-slate-200">
                    {type === 'FRIDAY' ? (
                      <tr>
                        <th className="px-3 py-2">Tanggal</th>
                        <th className="px-3 py-2">Khatib</th>
                        <th className="px-3 py-2">Imam</th>
                        <th className="px-3 py-2">Tema Khutbah</th>
                        <th className="px-3 py-2 text-right">Honor</th>
                      </tr>
                    ) : (
                      <tr>
                        <th className="px-3 py-2">Malam</th>
                        <th className="px-3 py-2">Penceramah</th>
                        <th className="px-3 py-2">Tema Kultum</th>
                        <th className="px-3 py-2">Imam Tarawih</th>
                        <th className="px-3 py-2 text-right">Honor</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {type === 'FRIDAY'
                      ? parsedFriday.slice(0, 10).map((f, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-2 whitespace-nowrap font-semibold text-slate-900">{f.date}</td>
                            <td className="px-3 py-2 font-bold text-teal-900">{f.khatibName}</td>
                            <td className="px-3 py-2 text-slate-600">{f.imamName}</td>
                            <td className="px-3 py-2 max-w-xs truncate">{f.khutbahTopic}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap text-emerald-800 font-bold">
                              Rp {f.incentiveAmount.toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))
                      : parsedRamadhan.slice(0, 10).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-3 py-2 whitespace-nowrap font-bold text-purple-900">
                              Malam {r.nightNumber}
                            </td>
                            <td className="px-3 py-2 font-bold text-teal-900">{r.penceramahTarawih}</td>
                            <td className="px-3 py-2 max-w-xs truncate">{r.topicKultum}</td>
                            <td className="px-3 py-2 text-slate-600">{r.imamTarawih}</td>
                            <td className="px-3 py-2 text-right whitespace-nowrap text-emerald-800 font-bold">
                              Rp {(r.honorPenceramah + r.honorImamTarawih).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
              {totalValid > 10 && (
                <p className="text-[11px] text-slate-400 text-center italic">
                  Menampilkan 10 baris pertama dari total {totalValid} jadwal yang valid.
                </p>
              )}

              {/* Mode Import */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-teal-700" />
                  <span>Metode Penggabungan Jadwal:</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label
                    onClick={() => setImportMode('APPEND')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'APPEND'
                        ? 'border-teal-600 bg-teal-50/50 text-teal-950 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'APPEND'}
                      onChange={() => setImportMode('APPEND')}
                      className="mt-0.5 text-teal-700"
                    />
                    <div>
                      <span className="block text-xs">Tambahkan ke Jadwal yang Ada</span>
                      <span className="block text-[10px] text-slate-500 font-normal">
                        Jadwal lama tetap tersimpan, data baru ditambahkan ke periode ini.
                      </span>
                    </div>
                  </label>

                  <label
                    onClick={() => setImportMode('REPLACE')}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'REPLACE'
                        ? 'border-rose-500 bg-rose-50/50 text-rose-950 font-bold shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'REPLACE'}
                      onChange={() => setImportMode('REPLACE')}
                      className="mt-0.5 text-rose-600"
                    />
                    <div>
                      <span className="block text-xs">Timpa Seluruh Jadwal Tahun Ini</span>
                      <span className="block text-[10px] text-slate-500 font-normal">
                        Menghapus jadwal periode {selectedYear} dan menggantikannya dengan file baru.
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-teal-700 shrink-0" />
            <span>Tahun Target: <strong>{selectedYear}</strong></span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={totalValid === 0 || isParsing}
              onClick={handleCommitImport}
              className={`flex-1 sm:flex-none px-5 py-2.5 sm:py-2 rounded-xl text-xs font-bold shadow-soft-sm flex items-center justify-center gap-2 transition-all cursor-pointer text-center ${
                totalValid > 0 && !isParsing
                  ? 'bg-teal-700 hover:bg-teal-800 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Impor {totalValid > 0 ? `${totalValid} Jadwal` : ''}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
