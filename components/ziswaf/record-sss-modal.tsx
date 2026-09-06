'use client';

import React, { useState } from 'react';
import { SSSCanItem } from '@/types/ziswaf';
import { formatRupiah } from '@/components/finance/finance-stats';
import { HeartHandshake, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface RecordSSSModalProps {
  can: SSSCanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCollection: (canId: string, amount: number, collector: string, notes: string) => void;
}

export default function RecordSSSModal({
  can,
  isOpen,
  onClose,
  onSaveCollection,
}: RecordSSSModalProps) {
  const [amount, setAmount] = useState<string>('100000');
  const [collector, setCollector] = useState<string>('Marbot Firman');
  const [notes, setNotes] = useState<string>('Penarikan rutin kaleng Sedekah Seribu Sehari');
  const [error, setError] = useState<string>('');

  if (!isOpen || !can) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/\D/g, ''), 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Nominal sedekah harus berupa angka positif.');
      return;
    }

    onSaveCollection(can.id, numAmount, collector, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/70 backdrop-blur-xs p-0 md:p-4 overflow-hidden">
      <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 bg-gradient-to-r from-teal-900 to-emerald-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-white/10 border border-white/20 shrink-0">
              <HeartHandshake className="w-5 h-5 text-teal-300" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold truncate">Catat Penarikan Kaleng SSS</h3>
              <p className="text-xs text-teal-200 truncate">{can.canCode} • {can.rt}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors shrink-0 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4">
          {/* Card Info Pemegang Kaleng */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Pemegang Kaleng:</span>
              <span className="font-bold text-slate-900">{can.holderName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Alamat Rumah:</span>
              <span className="font-semibold text-slate-700">{can.houseNumber} ({can.rt})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Penarikan Sebelumnya:</span>
              <span className="font-mono text-emerald-800 font-bold">
                {formatRupiah(can.lastAmount)} ({can.lastCollectionDate})
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nominal Terhitung (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                Rp
              </span>
              <input
                type="number"
                required
                min="1000"
                step="1000"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold font-mono focus:ring-2 focus:ring-teal-500/20"
                placeholder="100000"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Jumlah total uang tunai yang dihitung dari kaleng sedekah warga.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Petugas Penarik / Pencatat <span className="text-rose-500">*</span>
            </label>
            <select
              value={collector}
              onChange={(e) => setCollector(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold"
            >
              <option value="Marbot Firman">Marbot Firman (Marbot Masjid)</option>
              <option value="Koordinator RT 01">Koordinator SSS RT 01</option>
              <option value="Koordinator RT 02">Koordinator SSS RT 02</option>
              <option value="Koordinator RT 03">Koordinator SSS RT 03</option>
              <option value="Koordinator RT 04">Koordinator SSS RT 04</option>
              <option value="Koordinator RT 05">Koordinator SSS RT 05</option>
              <option value="Bendahara H. Sahali">Bendahara DKM (H. Sahali)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Penarikan
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              placeholder="Catatan kondisi kaleng atau titipan doa"
            />
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Hasil penarikan otomatis menambah akumulasi kaleng & tercatat di rekap swadaya DKM.</span>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2 shrink-0 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2.5 sm:py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer text-center flex items-center justify-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 sm:py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold shadow-soft-sm transition-all cursor-pointer text-center flex items-center justify-center"
            >
              Simpan Hasil Penarikan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
