'use client';

import React, { useState } from 'react';
import { DonorItem, DONOR_CATEGORIES } from '@/types/donor';
import { FinanceTransaction, PaymentMethod } from '@/types/finance';
import {
  X,
  CreditCard,
  Calendar,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface DonorPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  donor: DonorItem | null;
  onPaymentRecorded: (donor: DonorItem, transaction: FinanceTransaction) => void;
}

interface FormContentProps {
  donor: DonorItem;
  onClose: () => void;
  onPaymentRecorded: (donor: DonorItem, transaction: FinanceTransaction) => void;
}

function DonorPaymentForm({ donor, onClose, onPaymentRecorded }: FormContentProps) {
  const [amount, setAmount] = useState<number>(donor.commitmentAmount || 250000);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(donor.paymentMethod || 'TRANSFER_BANK');
  const [notes, setNotes] = useState<string>(
    `Infaq rutin bulan ${new Date().toISOString().slice(0, 7)} - ${donor.donorName}`
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!amount || amount <= 0) {
      setErrorMessage('Nominal setoran donasi harus lebih dari Rp 0.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECORD_PAYMENT',
          donorId: donor.id,
          amount: Number(amount),
          paymentMethod,
          date,
          notes: notes.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.data && data.transaction) {
        onPaymentRecorded(data.data, data.transaction);
        onClose();
      } else {
        setErrorMessage(data.error || 'Gagal mencatat setoran kas');
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryInfo = DONOR_CATEGORIES[donor.category] || {
    name: donor.category,
    badgeColor: 'emerald',
  };

  return (
    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
      {/* Header Modal */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base">
              Catat Setoran Infaq Rutin ke Buku Kas
            </h3>
            <p className="text-xs text-emerald-200">
              Otomatis menghasilkan bukti kuitansi kas masuk DKM
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4 text-slate-800 text-xs">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Profil Donatur Card */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-emerald-950">{donor.donorName}</span>
            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
              {donor.rt}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-mono">
            WhatsApp: {donor.phone} • Alamat: {donor.address}
          </p>
          <div className="pt-1 flex items-center gap-2 text-[11px]">
            <span className="text-slate-500">Alokasi:</span>
            <span className="font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
              {categoryInfo.name}
            </span>
          </div>
        </div>

        {/* Input Nominal Setoran */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Nominal Setoran Infaq (Rp) <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            step={10000}
            min={1000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 0)}
            className="w-full text-base font-bold text-emerald-900 border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            required
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Komitmen rutin terdaftar: Rp {donor.commitmentAmount.toLocaleString('id-ID')} / bulan
          </span>
        </div>

        {/* Tanggal & Metode Pembayaran */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tanggal Penyetoran <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-800 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Metode Pembayaran
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium"
            >
              <option value="TRANSFER_BANK">Transfer Bank (BSI)</option>
              <option value="TUNAI">Tunai (Diserahkan Langsung)</option>
              <option value="QRIS">Scan QRIS DKM</option>
            </select>
          </div>
        </div>

        {/* Catatan / Keterangan Kuitansi */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Keterangan Transaksi (Masuk ke Buku Kas)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Infaq rutin September 2026 via BSI"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Mencatat ke Kas...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Simpan ke Buku Kas DKM</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function DonorPaymentModal({
  isOpen,
  onClose,
  donor,
  onPaymentRecorded,
}: DonorPaymentModalProps) {
  if (!isOpen || !donor) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <DonorPaymentForm
        key={donor.id}
        donor={donor}
        onClose={onClose}
        onPaymentRecorded={onPaymentRecorded}
      />
    </div>
  );
}
