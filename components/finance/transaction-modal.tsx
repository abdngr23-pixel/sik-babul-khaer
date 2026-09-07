'use client';

import React, { useState } from 'react';
import {
  X,
  Save,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { FinanceTransaction, FinanceCategory, TransactionType, PaymentMethod, FINANCE_CATEGORIES } from '@/types/finance';
import { OFFICIAL_RAKER_BUDGETS } from '@/lib/raker-budget-data';
import { useToast } from '@/lib/toast-context';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: FinanceTransaction | null;
  onSaved: (newTrx: FinanceTransaction) => void;
}

export default function TransactionModal({
  isOpen,
  onClose,
  initialData,
  onSaved,
}: TransactionModalProps) {
  if (!isOpen) return null;

  return (
    <TransactionModalContent
      key={initialData?.id || 'new'}
      onClose={onClose}
      initialData={initialData}
      onSaved={onSaved}
    />
  );
}

function TransactionModalContent({
  onClose,
  initialData,
  onSaved,
}: {
  onClose: () => void;
  initialData?: FinanceTransaction | null;
  onSaved: (newTrx: FinanceTransaction) => void;
}) {
  const isEditing = Boolean(initialData);

  const [type, setType] = useState<TransactionType>(() => initialData?.type || 'INCOME');
  const [category, setCategory] = useState<FinanceCategory>(() => initialData?.category || 'KAS_OPERASIONAL');
  const [amount, setAmount] = useState<number | ''>(() => initialData?.amount || '');
  const [date, setDate] = useState(() => initialData?.date || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(() => initialData?.description || '');
  const [payerOrPayee, setPayerOrPayee] = useState(() => initialData?.payerOrPayee || '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => initialData?.paymentMethod || 'TUNAI');
  const [receiptNumber, setReceiptNumber] = useState(() => initialData?.receiptNumber || '');
  const [notes, setNotes] = useState(() => initialData?.notes || '');
  const [programKerjaId, setProgramKerjaId] = useState(() => initialData?.programKerjaId || '');

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!description.trim() || !amount || Number(amount) <= 0) {
      setErrorMessage('Uraian transaksi dan nominal kas (di atas Rp 0) wajib diisi.');
      return;
    }

    setIsLoading(true);

    const generatedReceipt = receiptNumber.trim() || `KW-${Date.now().toString().slice(-4)}`;

    const payload = {
      id: initialData?.id,
      date,
      type,
      category,
      description: description.trim(),
      amount: Number(amount),
      payerOrPayee: payerOrPayee.trim() || (type === 'INCOME' ? 'Hamba Allah' : 'Pihak Terkait'),
      paymentMethod,
      receiptNumber: generatedReceipt,
      notes: notes.trim(),
      programKerjaId: programKerjaId ? programKerjaId.trim() : undefined,
    };

    try {
      const url = '/api/finance';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        toast.success(isEditing ? 'Perubahan transaksi kas berhasil disimpan!' : 'Transaksi kas baru berhasil dibukukan!');
        onSaved(data.data);
        onClose();
      } else {
        const err = data.error || 'Gagal menyimpan transaksi';
        toast.error(err);
        setErrorMessage(err);
      }
    } catch {
      const err = 'Terjadi kendala jaringan saat menghubungi server';
      toast.error(err);
      setErrorMessage(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 overflow-hidden"
    >
      <div className="bg-white w-full md:max-w-xl rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] text-slate-800 animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <h3 id="transaction-modal-title" className="font-bold text-sm sm:text-base leading-tight">Catat Mutasi Kas Masjid</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">
                Pencatatan kas operasional, swadaya PHBI, atau ZISWAF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup formulir transaksi"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs overscroll-contain">
          {errorMessage && (
            <div aria-live="polite" className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Type Toggle: Kas Masuk / Kas Keluar */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setType('INCOME');
                if (category === 'KAS_OPERASIONAL') setCategory('INFAQ_JUMAT');
              }}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Kas Masuk (Penerimaan)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setType('EXPENSE');
                setCategory('KAS_OPERASIONAL');
              }}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                type === 'EXPENSE'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Kas Keluar (Pengeluaran)</span>
            </button>
          </div>

          {/* Pos Kategori Dana */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Pos Kategori Dana <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FinanceCategory)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-semibold"
            >
              {Object.values(FINANCE_CATEGORIES).map((cat) => (
                <option key={cat.code} value={cat.code}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nominal (Rp) & Tanggal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nominal Jumlah (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1000}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value, 10) || '')}
                placeholder="Contoh: 500000"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                required
              />
            </div>
          </div>

          {/* Uraian Transaksi */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Uraian / Keterangan Transaksi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Pembayaran tagihan listrik PLN ruang utama & sekretariat"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Pihak Terkait & Metode Pembayaran */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {type === 'INCOME' ? 'Diterima Dari' : 'Diserahkan Kepada'}
              </label>
              <input
                type="text"
                value={payerOrPayee}
                onChange={(e) => setPayerOrPayee(e.target.value)}
                placeholder={type === 'INCOME' ? 'Jamaah / Donatur / RT' : 'Vendor / Marbot / Instansi'}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Metode Pembayaran
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              >
                <option value="TUNAI">Uang Tunai</option>
                <option value="TRANSFER_BANK">Transfer Bank</option>
                <option value="QRIS">QRIS Masjid</option>
              </select>
            </div>
          </div>

          {/* Keterkaitan Program Kerja Raker 2026-2029 (Realisasi Anggaran) */}
          <div>
            <label htmlFor="trx-program-kerja" className="block font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Alokasi Program Kerja Raker (Realisasi Anggaran)
            </label>
            <select
              id="trx-program-kerja"
              value={programKerjaId}
              onChange={(e) => setProgramKerjaId(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">-- Tidak Terkait Program Kerja Tertentu (Kas Rutin) --</option>
              {OFFICIAL_RAKER_BUDGETS.map((prog) => (
                <option key={prog.id} value={prog.id}>
                  [{prog.id}] {prog.seksiName} — {prog.programName}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Pilih program kerja jika pengeluaran/pemasukan ini bagian dari realisasi anggaran Raker DKM.
            </p>
          </div>

          {/* Nomor Kwitansi & Catatan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Bukti / Kwitansi
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="BK-001/IX/2026"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Tambahan
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Disahkan oleh Bendahara DKM"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center"
          >
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`min-h-[44px] flex items-center justify-center gap-1.5 px-5 py-2.5 sm:py-2 text-white rounded-xl text-xs font-bold shadow-soft-sm transition-all cursor-pointer ${
              type === 'INCOME'
                ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400'
                : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-400'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Transaksi Kas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
