'use client';

import React, { useState } from 'react';
import { LetterCategory, LETTER_CATEGORIES, OfficialLetter, LetterStatus } from '@/types/letter';
import { DKM_INFO } from '@/lib/letter-numbering';
import { useToast } from '@/lib/toast-context';
import {
  Archive,
  X,
  Calendar,
  AlertCircle,
  Loader2,
  FolderArchive,
  CheckCircle2,
} from 'lucide-react';

interface ArchiveLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLetterArchived: (letter: OfficialLetter) => void;
}

export default function ArchiveLetterModal({
  isOpen,
  onClose,
  onLetterArchived,
}: ArchiveLetterModalProps) {
  const { toast } = useToast();
  const [customNumber, setCustomNumber] = useState('');
  const [category, setCategory] = useState<LetterCategory>('UND');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientTitle, setRecipientTitle] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('Kompleks BTP Blok AE, Makassar');
  const [attachmentCount, setAttachmentCount] = useState('-');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<LetterStatus>('ARCHIVED');
  const [physicalLocation, setPhysicalLocation] = useState('Map Arsip Sekretariat DKM Babul Khaer (Lemari A)');
  const [signatory1Name, setSignatory1Name] = useState(DKM_INFO.defaultChairman);
  const [signatory2Name, setSignatory2Name] = useState(DKM_INFO.defaultSecretary);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customNumber.trim()) {
      const msg = 'Nomor surat fisik wajib diisi sesuai dokumen asli.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!subject.trim()) {
      const msg = 'Perihal surat wajib diisi.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!recipientName.trim()) {
      const msg = 'Nama pihak/instansi penerima wajib diisi.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!content.trim()) {
      const msg = 'Ringkasan isi / naskah surat fisik wajib diisi.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    const payload = {
      category,
      recipientName: recipientName.trim(),
      recipientTitle: recipientTitle.trim() || undefined,
      recipientAddress: recipientAddress.trim() || undefined,
      subject: subject.trim(),
      letterDate,
      attachmentCount: attachmentCount.trim() || '-',
      content: `${content.trim()}\n\n[Catatan Lokasi Berkas Fisik: ${physicalLocation.trim() || 'Sekretariat DKM'}]`,
      status,
      signatory1: {
        name: signatory1Name.trim() || DKM_INFO.defaultChairman,
        role: 'Ketua Umum DKM',
      },
      signatory2: {
        name: signatory2Name.trim() || DKM_INFO.defaultSecretary,
        role: 'Sekretaris Umum',
      },
      customNumber: customNumber.trim(),
    };

    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        toast.success(`Arsip surat ${customNumber.trim()} berhasil dicatat.`);
        onLetterArchived(data.data);
        onClose();
      } else {
        const msg = data.error || 'Gagal menyimpan arsip surat';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'Terjadi kendala jaringan saat menghubungkan ke server.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-letter-title"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 overflow-hidden"
    >
      <div className="bg-white w-full md:max-w-3xl rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header Modal */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <FolderArchive className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 id="archive-letter-title" className="font-bold text-sm sm:text-base flex items-center gap-2 leading-tight">
                <span>Catat Arsip Surat Keluar</span>
                <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                  Fisik / Lampau
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-tight">
                Pencatatan surat fisik yang telah terbit sebelumnya ke E-Arsip
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal arsip surat"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 text-slate-800 text-xs overscroll-contain">
          {errorMessage && (
            <div role="alert" aria-live="polite" className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Banner Penjelasan */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900">
            <Archive className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Gunakan formulir ini untuk merekam surat resmi DKM Babul Khaer yang <strong>sudah dicetak, ditandatangani, atau dikeluarkan sebelumnya</strong> namun belum tercatat di sistem digital. Nomor surat dapat diketik bebas sesuai dengan nomor fisik aslinya.
            </p>
          </div>

          {/* Row 1: Nomor Surat Fisik & Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-7">
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Surat Fisik Asli <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={customNumber}
                onChange={(e) => setCustomNumber(e.target.value)}
                placeholder="Contoh: 004/DKM-MBH/UND/VII/2026 atau 012/PHBI/2026"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                required
              />
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Ketik nomor persis seperti yang tertera pada berkas fisik.
              </span>
            </div>

            <div className="md:col-span-5">
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Jenis Surat
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LetterCategory)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-semibold"
              >
                {Object.values(LETTER_CATEGORIES).map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    [{cat.code}] {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Tanggal Terbit & Status Arsip */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Surat Keluar <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Dokumen
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LetterStatus)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-semibold"
              >
                <option value="ARCHIVED">Diarsipkan (Dokumen Tersimpan)</option>
                <option value="SENT">Telah Dikirim / Didistribusikan</option>
                <option value="APPROVED">Disetujui</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jumlah Lampiran Berkas
              </label>
              <input
                type="text"
                value={attachmentCount}
                onChange={(e) => setAttachmentCount(e.target.value)}
                placeholder="Contoh: 1 Berkas / -"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Perihal Surat */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Perihal / Hal Surat <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Undangan Musyawarah Warga Penetapan Idul Fitri 1447 H"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Row 3: Penerima & Alamat Tujuan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pihak / Instansi Penerima <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Contoh: Bapak Lurah Tamalanrea / Warga RT 02"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Sebutan / Jabatan Penerima (Opsional)
              </label>
              <input
                type="text"
                value={recipientTitle}
                onChange={(e) => setRecipientTitle(e.target.value)}
                placeholder="Contoh: Kepala Kelurahan Tamalanrea"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat / Kota Tujuan
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Contoh: Kantor Kelurahan Tamalanrea, Makassar"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Ringkasan Isi Surat Fisik */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Ringkasan Isi / Naskah Surat Fisik <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan intisari surat, poin-poin keputusan, atau salinan naskah dokumen yang telah dikeluarkan..."
              className="w-full border border-slate-300 rounded-lg p-3 bg-white text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-hidden leading-relaxed"
              required
            />
          </div>

          {/* Lokasi Arsip Fisik & Penandatangan */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Archive className="w-3.5 h-3.5 text-amber-600" />
              <span>Lokasi Penyimpanan Fisik & Penandatangan Dokumen</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <label className="block font-semibold text-slate-700 mb-1">
                  Lokasi Map / Lemari Arsip
                </label>
                <input
                  type="text"
                  value={physicalLocation}
                  onChange={(e) => setPhysicalLocation(e.target.value)}
                  placeholder="Map Hijau Lemari B-02"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Penandatangan 1 (Ketua)
                </label>
                <input
                  type="text"
                  value={signatory1Name}
                  onChange={(e) => setSignatory1Name(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Penandatangan 2 (Sekretaris)
                </label>
                <input
                  type="text"
                  value={signatory2Name}
                  onChange={(e) => setSignatory2Name(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-200 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-soft-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Arsip...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simpan ke E-Arsip</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
