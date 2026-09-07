'use client';

import React, { useState } from 'react';
import { ZiswafAidItem, AidType, RecipientCategory } from '@/types/ziswaf';
import { Jamaah } from '@/types/jamaah';
import { useToast } from '@/lib/toast-context';
import { HeartHandshake, X, AlertCircle, UserCheck } from 'lucide-react';

interface CreateAidModalProps {
  isOpen: boolean;
  onClose: () => void;
  jamaahList: Jamaah[];
  onSaveAid: (aid: Omit<ZiswafAidItem, 'id' | 'aidNumber' | 'status'>) => void;
}

export default function CreateAidModal({
  isOpen,
  onClose,
  jamaahList,
  onSaveAid,
}: CreateAidModalProps) {
  const { toast } = useToast();
  const [selectedJamaahId, setSelectedJamaahId] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientCategory, setRecipientCategory] = useState<RecipientCategory>('MUSTAHIQ_DHUAFA');
  const [rt, setRt] = useState<'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05'>('RT 01');
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [aidType, setAidType] = useState<AidType>('PAKET_SEMBAKO');
  const [amountValue, setAmountValue] = useState<string>('350000');
  const [goodsDescription, setGoodsDescription] = useState<string>('Beras 10 kg, Minyak Goreng 2L, Telur 1 Rak, Gula 2 kg');
  const [distributionDate, setDistributionDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [disbursedBy, setDisbursedBy] = useState<string>('Seksi Sosial & UPZ DKM');
  const [notes, setNotes] = useState<string>('Penyaluran bantuan sosial mustahiq terdata DKM Masjid Babul Khaer');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  // Filter only mustahiq-related jamaah for quick selection
  const mustahiqJamaah = jamaahList.filter(
    (j) =>
      j.economicStatus === 'MUSTAHIQ_DHUAFA' ||
      j.economicStatus === 'LANSIA_DHUAFA' ||
      j.economicStatus === 'YATIM_PIATU'
  );

  const handleSelectJamaah = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedJamaahId(id);
    if (!id) return;

    const found = jamaahList.find((j) => j.id === id);
    if (found) {
      setRecipientName(found.fullName);
      setRt((found.rt as 'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05') || 'RT 01');
      setAddress(found.fullAddress || found.houseNumber);
      setPhone(found.phone || '');

      if (found.economicStatus === 'LANSIA_DHUAFA') {
        setRecipientCategory('LANSIA_DHUAFA');
      } else if (found.economicStatus === 'YATIM_PIATU') {
        setRecipientCategory('YATIM_PIATU');
      } else {
        setRecipientCategory('MUSTAHIQ_DHUAFA');
      }
    }
  };

  const handleAidTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as AidType;
    setAidType(type);
    if (type === 'PAKET_SEMBAKO') {
      setAmountValue('350000');
      setGoodsDescription('Beras 10 kg, Minyak Goreng 2L, Telur 1 Rak, Gula 2 kg');
    } else if (type === 'BERAS_ZAKAT') {
      setAmountValue('250000');
      setGoodsDescription('Beras Zakat Fitrah 20 kg (2 Karung @10 kg)');
    } else if (type === 'SANTUNAN_TUNAI') {
      setAmountValue('500000');
      setGoodsDescription('Santunan Biaya Hidup Tunai Mustahiq Dhuafa');
    } else if (type === 'BEASISWA_PENDIDIKAN') {
      setAmountValue('600000');
      setGoodsDescription('Santunan Biaya SPP & Alat Tulis Pendidikan Anak Yatim');
    } else if (type === 'BANTUAN_KESEHATAN') {
      setAmountValue('450000');
      setGoodsDescription('Bantuan Tebus Resep Obat & Perawatan Darurat');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      const msg = 'Nama penerima bantuan wajib diisi.';
      setError(msg);
      toast.error(msg);
      return;
    }

    const numAmount = parseInt(amountValue.replace(/\D/g, ''), 10);
    if (isNaN(numAmount) || numAmount < 0) {
      const msg = 'Nilai estimasi / nominal bantuan harus berupa angka valid.';
      setError(msg);
      toast.error(msg);
      return;
    }

    toast.success(`Penyaluran bantuan untuk ${recipientName.trim()} berhasil dicatat.`);
    onSaveAid({
      jamaahId: selectedJamaahId || undefined,
      recipientName: recipientName.trim(),
      recipientCategory,
      rt,
      address: address.trim(),
      phone: phone.trim() || undefined,
      aidType,
      amountValue: numAmount,
      goodsDescription: goodsDescription.trim() || undefined,
      distributionDate,
      disbursedBy: disbursedBy.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-aid-title"
      className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/70 backdrop-blur-xs p-0 md:p-4 overflow-hidden"
    >
      <div className="bg-white w-full md:max-w-xl rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-emerald-900 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20 shrink-0">
              <HeartHandshake className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <h3 id="create-aid-title" className="text-sm sm:text-base font-bold truncate">Catat Penyaluran ZISWAF & Bansos</h3>
              <p className="text-xs text-emerald-200 truncate">Seksi Sosial & UPZ DKM Babul Khaer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal pencatatan penyaluran ZISWAF"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors shrink-0 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4">
          {error && (
            <div role="alert" aria-live="polite" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Pilih dari Database Jamaah */}
          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200">
            <label className="block text-xs font-bold text-teal-900 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>Pilih Cepat dari Database Jamaah (Mustahiq Terdata):</span>
            </label>
            <select
              value={selectedJamaahId}
              onChange={handleSelectJamaah}
              className="w-full px-3 py-2 rounded-xl border border-teal-300 bg-white text-xs font-semibold text-slate-800"
            >
              <option value="">-- Isi Manual / Bukan Dari Jamaah Terdaftar --</option>
              {mustahiqJamaah.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.fullName} ({j.rt} • {j.economicStatus.replace('_', ' ')})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-teal-700 mt-1">
              Memilih jamaah akan otomatis mengisi nama, alamat RT, dan kategori penerima.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Penerima Manfaat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Contoh: Ibu St. Aminah"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Mustahiq <span className="text-rose-500">*</span>
              </label>
              <select
                value={recipientCategory}
                onChange={(e) => setRecipientCategory(e.target.value as RecipientCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="MUSTAHIQ_DHUAFA">Mustahiq Dhuafa (Fakir/Miskin)</option>
                <option value="LANSIA_DHUAFA">Lansia Dhuafa / Jompo</option>
                <option value="YATIM_PIATU">Anak Yatim / Piatu</option>
                <option value="JANDA_DHUAFA">Janda Dhuafa Tanggungan Anak</option>
                <option value="FISABILILLAH">Fisabilillah (Guru Mengaji/Marbot)</option>
                <option value="IBNU_SABIL">Ibnu Sabil (Musafir Kehabisan Bekal)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Wilayah Domisili (RT) <span className="text-rose-500">*</span>
              </label>
              <select
                value={rt}
                onChange={(e) => setRt(e.target.value as 'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                <option value="RT 01">RT 01 Kompleks BTP Blok AE</option>
                <option value="RT 02">RT 02 Kompleks BTP Blok AE</option>
                <option value="RT 03">RT 03 Kompleks BTP Blok AE</option>
                <option value="RT 04">RT 04 Kompleks BTP Blok AE</option>
                <option value="RT 05">RT 05 Kompleks BTP Blok AE</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nomor Kontak / WhatsApp
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812-xxxx-xxxx"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Lengkap Rumah
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Kompleks BTP Blok AE No. 28"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jenis Bantuan Sosial <span className="text-rose-500">*</span>
              </label>
              <select
                value={aidType}
                onChange={handleAidTypeChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
              >
                <option value="PAKET_SEMBAKO">Paket Sembako Lengkap</option>
                <option value="BERAS_ZAKAT">Beras Zakat Fitrah / Cadangan Pangan</option>
                <option value="SANTUNAN_TUNAI">Santunan Tunai Biaya Hidup</option>
                <option value="BEASISWA_PENDIDIKAN">Beasiswa / Alat Sekolah Yatim</option>
                <option value="BANTUAN_KESEHATAN">Bantuan Biaya Berobat / Medis</option>
                <option value="TANGGAP_DARURAT">Bantuan Tanggap Darurat Bencana</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimasi Nilai / Nominal (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="10000"
                  value={amountValue}
                  onChange={(e) => setAmountValue(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold font-mono"
                  placeholder="350000"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Rincian Barang / Bentuk Bantuan
            </label>
            <input
              type="text"
              value={goodsDescription}
              onChange={(e) => setGoodsDescription(e.target.value)}
              placeholder="Contoh: Beras 10 kg, Minyak 2L, Telur 1 Rak"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Penyerahan <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={distributionDate}
                onChange={(e) => setDistributionDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pengurus Penyalur / Saksi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={disbursedBy}
                onChange={(e) => setDisbursedBy(e.target.value)}
                placeholder="Contoh: Seksi Sosial (Ust. Rahman) & RT"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Khusus / Keterangan Penyaluran
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              placeholder="Catatan kondisi keluarga mustahiq saat penyerahan"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-center flex items-center justify-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 sm:py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-soft-sm transition-all cursor-pointer text-center flex items-center justify-center"
            >
              Simpan Penyaluran Bansos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
