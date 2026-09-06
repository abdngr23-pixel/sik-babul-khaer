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
  Save,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { downloadJamaahTemplate, exportJamaahToExcel, parseJamaahExcelFile } from '@/lib/excel-helper';
import { Jamaah } from '@/types/jamaah';

interface JamaahExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentJamaahList: Jamaah[];
  onImportSuccess: (imported: Jamaah[]) => void;
}

export default function JamaahExcelModal({
  isOpen,
  onClose,
  currentJamaahList,
  onImportSuccess,
}: JamaahExcelModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parsedValid, setParsedValid] = useState<Omit<Jamaah, 'id' | 'createdAt' | 'updatedAt'>[]>([]);
  const [parsedErrors, setParsedErrors] = useState<{ row: number; reason: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorList, setShowErrorList] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setErrorMessage('');
    setSuccessMessage('');
    setIsParsing(true);

    try {
      const result = await parseJamaahExcelFile(file);
      setParsedValid(result.valid);
      setParsedErrors(result.errors);

      if (result.valid.length === 0 && result.errors.length > 0) {
        setErrorMessage('Tidak ada data yang valid ditemukan. Periksa kolom Nama Lengkap, RT, No. Rumah, dan WhatsApp.');
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Gagal membaca file spreadsheet');
      setParsedValid([]);
      setParsedErrors([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleCommitImport = async () => {
    if (parsedValid.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/jamaah/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jamaahList: parsedValid }),
      });

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        onImportSuccess(data.data);
        setSuccessMessage(`Alhamdulillah! Berhasil mengimpor ${data.data.length} data warga.`);
        setParsedValid([]);
        setSelectedFile(null);
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setErrorMessage(data.error || 'Gagal menyimpan data import massal.');
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat mengirim data ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedValid([]);
    setParsedErrors([]);
    setErrorMessage('');
    setSuccessMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 overflow-hidden">
      <div className="bg-white w-full md:max-w-4xl rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] text-slate-800 animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                Import & Ekspor Data Massal (Excel)
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">
                Otomasi input basis data jamaah warga BTP Blok AE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 text-xs overscroll-contain">
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* Grid: 1. Download Template & 2. Export All */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1: Download Template */}
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1">
                  <Download className="w-4 h-4 text-emerald-700" />
                  <span>1. Unduh Template Excel Resmi</span>
                </div>
                <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                  Berkas Excel terstandarisasi lengkap dengan kolom identitas, RT 01-05, nomor rumah, status ZISWAF, dan contoh isian.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadJamaahTemplate}
                className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Template (.xlsx)</span>
              </button>
            </div>

            {/* Step 2: Backup Existing */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>Cadangkan Data Jamaah Saat Ini</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Ekspor seluruh {currentJamaahList.length} warga yang ada di sistem saat ini ke format Excel untuk laporan atau arsip offline.
                </p>
              </div>
              <button
                type="button"
                onClick={() => exportJamaahToExcel(currentJamaahList)}
                className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Database ({currentJamaahList.length} Jiwa)</span>
              </button>
            </div>
          </div>

          {/* Step 3: Upload Box */}
          <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
              className="hidden"
              id="excel-file-input"
            />

            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                <Upload className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm">
                Pilih atau Tarik Berkas Excel / XLS ke Sini
              </p>
              <p className="text-slate-500 text-xs">
                Mendukung format file <strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>
              </p>

              <label
                htmlFor="excel-file-input"
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Pilih Berkas Komputer</span>
              </label>

              {selectedFile && (
                <div className="mt-3 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">{selectedFile.name}</span>
                  <span className="text-slate-400">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  <button
                    onClick={handleReset}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                    title="Ganti Berkas"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Loading parsing */}
          {isParsing && (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="font-semibold">Menganalisis lembar kerja Excel...</p>
            </div>
          )}

          {/* Parsed Result Preview */}
          {!isParsing && (parsedValid.length > 0 || parsedErrors.length > 0) && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-xs">Pratinjau Hasil Pembacaan:</span>
                  {parsedValid.length > 0 && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {parsedValid.length} Data Valid
                    </span>
                  )}
                  {parsedErrors.length > 0 && (
                    <button
                      onClick={() => setShowErrorList(!showErrorList)}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 cursor-pointer"
                    >
                      <AlertCircle className="w-3 h-3 text-amber-700" />
                      {parsedErrors.length} Baris Bermasalah
                      {showErrorList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-slate-500">
                  Total Baris Dibaca: <strong>{parsedValid.length + parsedErrors.length}</strong>
                </div>
              </div>

              {/* Warning list if expanded */}
              {showErrorList && parsedErrors.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
                  <p className="font-bold mb-1">Baris yang dilewati karena data tidak lengkap:</p>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {parsedErrors.map((err, idx) => (
                      <li key={idx}>
                        Baris {err.row}: {err.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Table Preview */}
              {parsedValid.length > 0 && (
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 text-[10px] font-bold text-slate-600 uppercase">
                        <tr>
                          <th className="py-2.5 px-3">No</th>
                          <th className="py-2.5 px-3">Nama Lengkap</th>
                          <th className="py-2.5 px-3">RT & Rumah</th>
                          <th className="py-2.5 px-3">WhatsApp</th>
                          <th className="py-2.5 px-3">ZISWAF</th>
                          <th className="py-2.5 px-3">Peran Keluarga</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                        {parsedValid.slice(0, 50).map((j, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                            <td className="py-2 px-3 font-semibold text-slate-900">
                              {j.fullName}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="font-bold text-emerald-800 mr-1.5">{j.rt}</span>
                              <span>{j.houseNumber}</span>
                            </td>
                            <td className="py-2 px-3 font-mono">{j.phone}</td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-700">
                                {j.economicStatus}
                              </span>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">{j.familyRole}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedValid.length > 50 && (
                    <div className="p-2 bg-slate-50 text-[11px] text-slate-500 text-center border-t border-slate-200">
                      Menampilkan 50 baris pertama dari total {parsedValid.length} data valid.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleCommitImport}
            disabled={isSubmitting || parsedValid.length === 0}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-5 py-2.5 sm:py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl text-xs font-bold shadow-soft-sm transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan {parsedValid.length} Warga...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>
                  {parsedValid.length > 0
                    ? `Konfirmasi & Simpan (${parsedValid.length} Warga)`
                    : 'Pilih File Terlebih Dahulu'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
