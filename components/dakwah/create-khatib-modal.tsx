'use client';

import React, { useState } from 'react';
import {
  X,
  UserPlus,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { KhatibItem } from '@/types/dakwah';
import { useToast } from '@/lib/toast-context';

interface CreateKhatibModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (khatib: Omit<KhatibItem, 'id' | 'createdAt' | 'totalAppearances'>) => void;
}

const SPECIALIZATIONS = [
  'Fiqih Ibadah & Muamalah',
  'Tafsir & Tadabbur Al-Qur\'an',
  'Aqidah & Akhlak Islami',
  'Keluarga Sakinah & Parenting',
  'Pembinaan Remaja & Generasi Muda',
  'Tahsin & Tilawah Al-Qur\'an',
  'ZISWAF & Fiqih Mawaris',
  'Ukhuwah & Sosial Kemasyarakatan',
  'Kajian Tematik Umum',
];

const INSTITUTION_SUGGESTIONS = [
  'PC DMI Biringkanaya',
  'MUI Kota Makassar',
  'KUA Kecamatan Biringkanaya',
  'Pondok Pesantren / Madrasah',
  'UIN Alauddin Makassar',
  'Universitas Hasanuddin / PTN',
  'BKPRMI / Remaja Masjid',
  'DKM Babul Khaer',
];

export default function CreateKhatibModal({
  isOpen,
  onClose,
  onSave,
}: CreateKhatibModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    specialization: 'Fiqih Ibadah & Muamalah',
    institution: 'PC DMI Biringkanaya',
    phone: '',
    address: '',
    status: 'AKTIF' as 'AKTIF' | 'CADANGAN',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Nama lengkap asatidz wajib diisi.';
    if (!formData.phone.trim()) errs.phone = 'Nomor WhatsApp / telepon wajib diisi.';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error('Mohon lengkapi formulir pendaftaran asatidz.');
      return;
    }

    onSave({
      name: formData.name.trim(),
      title: formData.title.trim() || 'Dai / Penceramah',
      specialization: formData.specialization,
      institution: formData.institution.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim() || 'Makassar',
      status: formData.status,
      notes: formData.notes.trim() || undefined,
    });

    toast.success(`Data asatidz ${formData.name.trim()} berhasil didaftarkan.`);

    // Reset form
    setFormData({
      name: '',
      title: '',
      specialization: 'Fiqih Ibadah & Muamalah',
      institution: 'PC DMI Biringkanaya',
      phone: '',
      address: '',
      status: 'AKTIF',
      notes: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-khatib-title"
      className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/70 backdrop-blur-xs p-0 md:p-4 overflow-hidden animate-in fade-in"
    >
      <div className="bg-white w-full max-w-xl rounded-t-3xl md:rounded-2xl shadow-soft-xl border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] animate-slide-up md:animate-none">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header Modal */}
        <div className="px-4 md:px-6 py-4 md:py-5 bg-gradient-to-r from-teal-800 to-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 shrink-0">
              <UserPlus className="w-5 h-5 text-teal-200" />
            </div>
            <div className="min-w-0">
              <h3 id="create-khatib-title" className="text-sm md:text-base font-bold tracking-tight truncate">Tambah Khatib & Penceramah Baru</h3>
              <p className="text-xs text-teal-100/80 truncate">
                Pendaftaran data asatidz untuk penugasan Sholat Jumat dan Kajian.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            aria-label="Tutup modal pendaftaran khatib"
            className="p-2 md:p-1.5 rounded-lg text-teal-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Isi */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-4 flex-1">
          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap & Gelar Keagamaan / Akademik <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Ust. Dr. H. Muh. Syarif, M.A."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all ${
                errors.name ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50'
              }`}
            />
            {errors.name && <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.name}</p>}
          </div>

          {/* Gelar / Jabatan Kultural */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-teal-700" />
                <span>Jabatan / Keterangan Dai</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Pimpinan Ponpes / Dosen UIN"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all"
              />
            </div>

            {/* Asal Lembaga */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-700" />
                <span>Asal Lembaga / Ormas <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="text"
                list="institutions-list"
                required
                placeholder="Contoh: PC DMI Biringkanaya"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all ${
                  errors.institution ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50'
                }`}
              />
              <datalist id="institutions-list">
                {INSTITUTION_SUGGESTIONS.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
              {errors.institution && (
                <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.institution}</p>
              )}
            </div>
          </div>

          {/* Spesialisasi Materi & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-700" />
                <span>Fokus Keilmuan / Materi</span>
              </label>
              <select
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all font-medium"
              >
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Status Ketersediaan
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'AKTIF' | 'CADANGAN',
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all font-medium"
              >
                <option value="AKTIF">AKTIF — Siap dijadwalkan rutin</option>
                <option value="CADANGAN">CADANGAN — Siap pengganti mendesak</option>
              </select>
            </div>
          </div>

          {/* Nomor WhatsApp & Domisili */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-teal-700" />
                <span>Nomor WhatsApp Aktif <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="tel"
                required
                placeholder="Contoh: 0812-4111-2299"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all ${
                  errors.phone ? 'border-rose-300 bg-rose-50/30' : 'border-slate-200 bg-slate-50/50'
                }`}
              />
              {errors.phone && <p className="mt-1 text-[11px] text-rose-600 font-medium">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-teal-700" />
                <span>Domisili / Alamat</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: BTP Blok AE / Tamalanrea"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all"
              />
            </div>
          </div>

          {/* Catatan / Keterangan Khusus */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Khusus Penugasan (Opsional)
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Hanya bersedia pekan ke-2 & ke-4. Disarankan materi tentang zakat."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse md:flex-row items-center justify-end gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full md:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-soft-sm flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan ke Database</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
