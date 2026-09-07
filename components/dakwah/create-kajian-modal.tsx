'use client';

import React, { useState } from 'react';
import { X, BookOpen, Sparkles } from 'lucide-react';
import { KajianScheduleItem, KajianType } from '@/types/dakwah';
import ImageUploader from '@/components/shared/image-uploader';
import { useModalBackHandler } from '@/lib/back-button-handler';

interface CreateKajianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kajian: Omit<KajianScheduleItem, 'id'>, editId?: string) => Promise<void>;
  initialData?: KajianScheduleItem | null;
}

export default function CreateKajianModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: CreateKajianModalProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState<KajianType>(initialData?.type || 'PEKANAN');
  const [speakerName, setSpeakerName] = useState(initialData?.speakerName || '');
  const [speakerTitle, setSpeakerTitle] = useState(initialData?.speakerTitle || '');
  const [bookOrTopic, setBookOrTopic] = useState(initialData?.bookOrTopic || '');
  const [dayTime, setDayTime] = useState(initialData?.dayTime || "Ahad Ba'da Subuh (05:30 WITA)");
  const [location, setLocation] = useState(initialData?.location || 'Ruang Sholat Utama Masjid Babul Khaer');
  const [fundingSource, setFundingSource] = useState<'SWADAYA_JAMAAH' | 'KAS_MASJID' | 'SPONSOR_DONATUR'>(
    initialData?.fundingSource || 'SWADAYA_JAMAAH'
  );
  const [contactPerson, setContactPerson] = useState(
    initialData?.contactPerson || 'H. Ambo Tuo / Ustadz Firman (0812-4000-0005)'
  );
  const [notes, setNotes] = useState(
    initialData?.notes || 'Terbuka untuk umum jamaah muslimin & muslimah. Disediakan sarapan bersama.'
  );
  const [posterUrl, setPosterUrl] = useState<string>(initialData?.posterUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mobile Hardware Back Button handler
  useModalBackHandler(isOpen, onClose, 'dakwah-create-kajian');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !speakerName.trim() || !bookOrTopic.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(
        {
          title: title.trim(),
          type,
          speakerName: speakerName.trim(),
          speakerTitle: speakerTitle.trim() || undefined,
          bookOrTopic: bookOrTopic.trim(),
          dayTime: dayTime.trim(),
          location: location.trim(),
          fundingSource,
          contactPerson: contactPerson.trim(),
          notes: notes.trim() || undefined,
          posterUrl: posterUrl || undefined,
        },
        initialData ? initialData.id : undefined
      );
      onClose();
    } catch (err) {
      console.error('Error saving kajian:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="kajian-modal-title"
      className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/70 backdrop-blur-xs p-0 md:p-4 overflow-hidden animate-in fade-in"
    >
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-3xl md:rounded-2xl shadow-soft-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[90dvh] max-h-[92dvh] md:h-auto md:max-h-[90dvh] animate-slide-up md:animate-none">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Modal Header */}
        <div className="px-5 py-4 bg-teal-800 dark:bg-teal-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-700/80 dark:bg-teal-900 text-teal-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 id="kajian-modal-title" className="text-base font-bold">
                {initialData ? 'Edit Agenda Kajian' : 'Tambah Agenda Kajian Baru'}
              </h3>
              <p className="text-xs text-teal-200">
                Seksi Peribadatan & Dakwah Masjid Babul Khaer
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="text-teal-200 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain">
          {/* Judul & Tipe Kajian */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Judul Kajian <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="cth: Kajian Tematik Fiqih Muamalah Kontemporer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tipe Kajian
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as KajianType)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="PEKANAN">PEKANAN (Rutin)</option>
                <option value="BULANAN">BULANAN</option>
                <option value="TABLIGH_AKBAR">TABLIGH AKBAR</option>
                <option value="TAHSIN">TAHSIN AL-QURAN</option>
              </select>
            </div>
          </div>

          {/* Pemateri & Gelar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Pemateri / Ustadz <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                placeholder="cth: Ustadz Dr. H. Amri Amrullah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Gelar / Lembaga (Opsional)
              </label>
              <input
                type="text"
                value={speakerTitle}
                onChange={(e) => setSpeakerTitle(e.target.value)}
                placeholder="cth: Lc., M.A. / Dosen UIN Alauddin"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Kitab & Hari/Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kitab / Tema Pembahasan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={bookOrTopic}
                onChange={(e) => setBookOrTopic(e.target.value)}
                placeholder="cth: Kitab Bulughul Maram bab Muamalah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jadwal Waktu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={dayTime}
                onChange={(e) => setDayTime(e.target.value)}
                placeholder="cth: Setiap Ahad Ba'da Subuh (05:30 WITA)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* Tempat & Sumber Dana */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lokasi Kegiatan
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ruang Sholat Utama Masjid Babul Khaer"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sumber Dana Konsumsi / Honor
              </label>
              <select
                value={fundingSource}
                onChange={(e) => setFundingSource(e.target.value as 'SWADAYA_JAMAAH' | 'KAS_MASJID' | 'SPONSOR_DONATUR')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="SWADAYA_JAMAAH">SWADAYA JAMAAH (Sesuai Raker)</option>
                <option value="KAS_MASJID">KAS OPERASIONAL MASJID</option>
                <option value="SPONSOR_DONATUR">SPONSOR / DONATUR TETAP</option>
              </select>
            </div>
          </div>

          {/* Kontak & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kontak Person / PIC
              </label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Ustadz H. Ambo Tuo (0812-4000-0005)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catatan Fasilitas / Konsumsi
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="cth: Tersedia snack & sarapan bubur ayam"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          {/* ============================================================= */}
          {/* UPLOAD POSTER BROSUR KAJIAN (UNIVERSAL IMAGE UPLOADER)        */}
          {/* ============================================================= */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <ImageUploader
              value={posterUrl}
              onChange={(val) => setPosterUrl(val as string)}
              label="Poster Brosur Kajian (Tampil di Publik & Internal)"
              helperText="Unggah flyer/poster resmi kajian. Kamera HP atau galeri (Maks. 5MB)"
              aspectRatio="poster"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse md:flex-row items-center justify-end gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs font-bold shadow-soft-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Terbitkan Agenda Kajian'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
