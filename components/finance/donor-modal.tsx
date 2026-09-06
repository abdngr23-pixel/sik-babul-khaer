'use client';

import React, { useState } from 'react';
import { DonorItem, DonorCategory, DONOR_CATEGORIES, DonorStatus } from '@/types/donor';
import { PaymentMethod } from '@/types/finance';
import {
  X,
  HeartHandshake,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface DonorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (donor: DonorItem) => void;
  initialData?: DonorItem | null;
}

export default function DonorModal({
  isOpen,
  onClose,
  onSaved,
  initialData,
}: DonorModalProps) {
  const isEditing = Boolean(initialData);

  const [donorName, setDonorName] = useState(initialData?.donorName || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [rt, setRt] = useState<'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05' | 'Luar Blok AE'>(
    initialData?.rt || 'RT 01'
  );
  const [address, setAddress] = useState(initialData?.address || 'Kompleks BTP Blok AE No. ');
  const [category, setCategory] = useState<DonorCategory>(initialData?.category || 'KAS_OPERASIONAL');
  const [commitmentAmount, setCommitmentAmount] = useState<number>(initialData?.commitmentAmount || 250000);
  const [billingDay, setBillingDay] = useState<number>(initialData?.billingDay || 1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(initialData?.paymentMethod || 'TRANSFER_BANK');
  const [status, setStatus] = useState<DonorStatus>(initialData?.status || 'AKTIF');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!donorName.trim() || !phone.trim() || !commitmentAmount) {
      setErrorMessage('Nama donatur, kontak WhatsApp, dan nominal komitmen wajib diisi.');
      return;
    }

    setIsLoading(true);

    const payload = {
      id: initialData?.id,
      donorName: donorName.trim(),
      phone: phone.trim(),
      rt,
      address: address.trim(),
      category,
      commitmentAmount: Number(commitmentAmount),
      billingDay: Number(billingDay),
      paymentMethod,
      status,
      notes: notes.trim(),
    };

    try {
      const url = '/api/donors';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        onSaved(data.data);
        onClose();
      } else {
        setErrorMessage(data.error || 'Gagal menyimpan data donatur');
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[95dvh] sm:h-auto sm:max-h-[92dvh] animate-slide-up sm:animate-none">
        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base truncate">
                {isEditing ? 'Perbarui Data Donatur Tetap' : 'Daftarkan Donatur Tetap Baru'}
              </h3>
              <p className="text-xs text-slate-300 truncate">
                Pengelolaan infaq & sedekah rutin warga jamaah DKM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-4 flex-1 text-slate-800 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nama & Kontak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Donatur / Hamba Allah <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Contoh: H. Sahali"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          {/* Wilayah RT & Alamat Rumah */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Wilayah RT / Asal
              </label>
              <select
                value={rt}
                onChange={(e) => setRt(e.target.value as DonorItem['rt'])}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-semibold"
              >
                <option value="RT 01">RT 01 RW 08</option>
                <option value="RT 02">RT 02 RW 08</option>
                <option value="RT 03">RT 03 RW 08</option>
                <option value="RT 04">RT 04 RW 08</option>
                <option value="RT 05">RT 05 RW 08</option>
                <option value="Luar Blok AE">Luar Blok AE / Simpatisan</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Rumah / Patokan
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Contoh: Kompleks BTP Blok AE No. 12"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Pos Alokasi Donasi & Komitmen Nominal */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
              Komitmen Alokasi & Jadwal Rutin
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pos Dana Donasi
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DonorCategory)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium"
                >
                  {Object.values(DONOR_CATEGORIES).map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Komitmen Nominal / Bulan (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step={50000}
                  min={10000}
                  value={commitmentAmount}
                  onChange={(e) => setCommitmentAmount(Number(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Rutin per Bulan
                </label>
                <select
                  value={billingDay}
                  onChange={(e) => setBillingDay(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                >
                  <option value={1}>Setiap Tanggal 1 (Awal Bulan)</option>
                  <option value={5}>Setiap Tanggal 5</option>
                  <option value={10}>Setiap Tanggal 10</option>
                  <option value={15}>Setiap Tanggal 15 (Pertengahan)</option>
                  <option value={25}>Setiap Tanggal 25 (Gajian)</option>
                  <option value={28}>Setiap Tanggal 28 (Akhir Bulan)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Metode Penyaluran Favorit
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                >
                  <option value="TRANSFER_BANK">Transfer Bank (BSI / Lainnya)</option>
                  <option value="TUNAI">Tunai (Diserahkan ke Marbot / Pengurus)</option>
                  <option value="QRIS">Scan QRIS Resmi DKM</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status Donatur & Catatan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Keaktifan
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DonorStatus)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-semibold"
              >
                <option value="AKTIF">Aktif Berinfaq Rutin</option>
                <option value="JEDA">Jeda Sementara</option>
                <option value="NONAKTIF">Nonaktif / Berhenti</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Khusus (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Khusus untuk beasiswa santri yatim / transfer via BSI"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 border-t border-slate-200 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 text-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Simpan Perubahan' : 'Daftarkan Donatur'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
