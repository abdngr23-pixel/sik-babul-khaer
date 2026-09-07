'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wheat,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  Calendar,
  Send,
  Search,
  Sliders,
  History,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { RiceDeposit, RiceWithdrawalLog, RiceStockSnapshot } from '@/types/atm-beras';
import { INITIAL_RICE_DEPOSITS, INITIAL_RICE_WITHDRAWALS, INITIAL_RICE_SNAPSHOT } from '@/lib/mock-atm-beras';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { WhatsAppTemplates, openWhatsApp } from '@/lib/whatsapp-service';

export default function AtmBerasView() {
  const { currentUser, isReadOnly } = useAuth();
  const { toast } = useToast();

  const [snapshot, setSnapshot] = useState<RiceStockSnapshot>(INITIAL_RICE_SNAPSHOT);
  const [deposits, setDeposits] = useState<RiceDeposit[]>(INITIAL_RICE_DEPOSITS);
  const [withdrawals, setWithdrawals] = useState<RiceWithdrawalLog[]>(INITIAL_RICE_WITHDRAWALS);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'status' | 'deposits' | 'withdrawals'>('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMonth, setFilterMonth] = useState('ALL');

  // Form State: Setoran (Deposit)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositWeight, setDepositWeight] = useState('');
  const [depositDate, setDepositDate] = useState(new Date().toISOString().split('T')[0]);
  const [depositDonor, setDepositDonor] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [depositNotes, setDepositNotes] = useState('');
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);

  // Form State: Pengeluaran (Withdrawal - Estimasi, Tanpa Data Diri)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawWeight, setWithdrawWeight] = useState('');
  const [withdrawDate, setWithdrawDate] = useState(new Date().toISOString().split('T')[0]);
  const [withdrawNotes, setWithdrawNotes] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  // Form State: Threshold Setting
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState(false);
  const [thresholdInput, setThresholdInput] = useState(String(snapshot.lowStockThresholdKg));

  // Sync data from Server API
  useEffect(() => {
    fetch('/api/atm-beras')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          if (res.data.snapshot) {
            setSnapshot(res.data.snapshot);
            setThresholdInput(String(res.data.snapshot.lowStockThresholdKg));
          }
          if (Array.isArray(res.data.deposits)) setDeposits(res.data.deposits);
          if (Array.isArray(res.data.withdrawals)) setWithdrawals(res.data.withdrawals);
        }
      })
      .catch((err) => console.warn('Gagal sinkronisasi data ATM Beras dari server:', err));
  }, []);

  // Stock Status Evaluation
  const isCritical = snapshot.currentStockKg <= snapshot.lowStockThresholdKg / 2;
  const isLow = snapshot.currentStockKg <= snapshot.lowStockThresholdKg;

  const stockStatus = isCritical
    ? { label: 'Stok Kritis', color: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-400', badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-900' }
    : isLow
    ? { label: 'Stok Menipis', color: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900' }
    : { label: 'Stok Aman (Prima)', color: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900' };

  // Calculations
  const totalDepositedKg = deposits.reduce((acc, d) => acc + d.weightKg, 0);
  const totalWithdrawnKg = withdrawals.reduce((acc, w) => acc + w.estimatedWeightKg, 0);

  // Submit Deposit
  const handleSaveDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weight = Number(depositWeight);
    if (!weight || weight <= 0) {
      toast.error('Jumlah berat beras harus lebih dari 0 kg');
      return;
    }

    setIsSubmittingDeposit(true);
    const donor = isAnonymous ? '' : depositDonor.trim();

    try {
      const res = await fetch('/api/atm-beras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deposit',
          weightKg: weight,
          date: depositDate,
          donorName: donor,
          notes: depositNotes,
          recordedBy: currentUser?.name || 'Petugas Piket',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mencatat setoran beras');
      }

      setDeposits((prev) => [data.data.deposit, ...prev]);
      if (data.data.snapshot) setSnapshot(data.data.snapshot);
      toast.success(data.message || 'Setoran beras berhasil dicatat');

      setIsDepositModalOpen(false);
      setDepositWeight('');
      setDepositDonor('');
      setIsAnonymous(false);
      setDepositNotes('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      toast.error(msg);
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  // Submit Withdrawal (Estimasi keluar tanpa nama pengambil)
  const handleSaveWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const weight = Number(withdrawWeight);
    if (!weight || weight <= 0) {
      toast.error('Jumlah estimasi pengeluaran harus lebih dari 0 kg');
      return;
    }

    setIsSubmittingWithdraw(true);

    try {
      const res = await fetch('/api/atm-beras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'withdrawal',
          estimatedWeightKg: weight,
          date: withdrawDate,
          notes: withdrawNotes,
          recordedBy: currentUser?.name || 'Petugas Piket',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal mencatat pengeluaran beras');
      }

      setWithdrawals((prev) => [data.data.withdrawal, ...prev]);
      if (data.data.snapshot) setSnapshot(data.data.snapshot);
      toast.success(data.message || 'Estimasi pengeluaran berhasil dicatat');

      setIsWithdrawModalOpen(false);
      setWithdrawWeight('');
      setWithdrawNotes('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      toast.error(msg);
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // Update Threshold
  const handleSaveThreshold = async (e: React.FormEvent) => {
    e.preventDefault();
    const threshold = Number(thresholdInput);
    if (threshold < 0) {
      toast.error('Ambang batas tidak boleh negatif');
      return;
    }

    try {
      const res = await fetch('/api/atm-beras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-threshold',
          thresholdKg: threshold,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSnapshot(data.data);
        toast.success('Ambang batas stok minimum berhasil diperbarui');
        setIsThresholdModalOpen(false);
      }
    } catch {
      toast.error('Gagal memperbarui ambang batas stok');
    }
  };

  // Trigger WhatsApp Alert to Bendahara
  const handleSendStockAlert = () => {
    const text = WhatsAppTemplates.riceStockAlert({
      currentStockKg: snapshot.currentStockKg,
      thresholdKg: snapshot.lowStockThresholdKg,
      lastRefillDate: snapshot.lastRefillDate,
    });
    // Send to Bendahara (H. Sahali: 0812-4000-0003)
    openWhatsApp('0812-4000-0003', text);
  };

  // Filtered deposits
  const filteredDeposits = useMemo(() => {
    return deposits.filter((d) => {
      const matchSearch =
        (d.donorName || 'Hamba Allah').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.recordedBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMonth = filterMonth === 'ALL' || d.date.startsWith(filterMonth);
      return matchSearch && matchMonth;
    });
  }, [deposits, searchQuery, filterMonth]);

  // Filtered withdrawals
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => {
      const matchSearch =
        (w.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.recordedBy.toLowerCase().includes(searchQuery.toLowerCase());
      const matchMonth = filterMonth === 'ALL' || w.date.startsWith(filterMonth);
      return matchSearch && matchMonth;
    });
  }, [withdrawals, searchQuery, filterMonth]);

  return (
    <div className="space-y-6">
      {/* Banner / Headline Modul */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300">
            <Wheat className="w-3.5 h-3.5" />
            <span>Lumbung Pangan Swadaya &amp; Ketahanan Jamaah</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ATM Beras Babul Khaer
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Program lumbung beras mandiri serambi masjid: <em>&ldquo;Menyetor Ikhlas, Mengambil Secukupnya&rdquo;</em>.
            Menjaga kehormatan dan martabat kaum dhuafa tanpa antrean birokrasi, didanai penuh oleh kemurahan hati jamaah Blok AE.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {!isReadOnly && (
              <>
                <button
                  onClick={() => setIsDepositModalOpen(true)}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Catat Setoran Beras</span>
                </button>

                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
                >
                  <MinusCircle className="w-4 h-4" />
                  <span>Catat Pengeluaran/Refill</span>
                </button>
              </>
            )}

            {isLow && (
              <button
                onClick={handleSendStockAlert}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                title="Kirim peringatan stok ke Bendahara DKM"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Alert WA Bendahara</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-4 -bottom-6 text-white/5 pointer-events-none select-none">
          <Wheat className="w-64 h-64" />
        </div>
      </div>

      {/* Grid Status Stok & Metrik Kunci */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kartu Status Stok Real-Time */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Sisa Stok Lumbung
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${stockStatus.badge}`}>
              {stockStatus.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              {snapshot.currentStockKg}
            </span>
            <span className="text-base font-bold text-slate-500">Kg Beras</span>
          </div>

          {/* Progress bar visual terhadap kapasitas 300kg */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${stockStatus.color}`}
              style={{ width: `${Math.min(100, Math.round((snapshot.currentStockKg / 300) * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span>Batas Minimal: <strong>{snapshot.lowStockThresholdKg} Kg</strong></span>
            {!isReadOnly && (
              <button
                onClick={() => setIsThresholdModalOpen(true)}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Sliders className="w-3 h-3" />
                <span>Atur</span>
              </button>
            )}
          </div>
        </div>

        {/* Total Terkumpul */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Beras Masuk
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 dark:text-emerald-400">
              {totalDepositedKg}
            </span>
            <span className="text-base font-bold text-slate-500">Kg</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Dari <strong>{deposits.length} kali</strong> setoran jamaah/donatur
          </div>
        </div>

        {/* Total Tersalurkan */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Beras Tersalurkan
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-teal-700 dark:text-teal-400">
              {totalWithdrawnKg}
            </span>
            <span className="text-base font-bold text-slate-500">Kg</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Estimasi distribusi bebas izin untuk dhuafa
          </div>
        </div>

        {/* Pengisian Terakhir & Prinsip Martabat */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Refill Terakhir
            </span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {snapshot.lastRefillDate || 'Belum ada'}
          </div>
          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5 leading-tight">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Privasi terjaga: Pengambilan tidak mendata nama penerima.</span>
          </div>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 border-b sm:border-b-0 border-slate-200 dark:border-slate-800 pb-2 sm:pb-0">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'status'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            Ringkasan &amp; Tren
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'deposits'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>Riwayat Masuk</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {deposits.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'withdrawals'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <span>Log Pengeluaran</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
              {withdrawals.length}
            </span>
          </button>
        </div>

        {/* Search & Month Filter */}
        {activeTab !== 'status' && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari donatur / catatan..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-medium"
            >
              <option value="ALL">Semua Bulan</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">Agustus 2026</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Ringkasan & Tren Visual */}
      {activeTab === 'status' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alur Kerja & Edukasi Jamaah */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Wheat className="w-4 h-4 text-emerald-600" />
              <span>SOP Operasional &amp; Prinsip Lumbung Mandiri</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                  1
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Setoran Ikhlas Jamaah</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Jamaah menyetor beras fisik (kemasan karung / eceran) ke pos marbot atau langsung ke kotak lumbung. Boleh mencantumkan nama atau memilih opsi anonim.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Dispenser Siap Saji</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Petugas piket mengontrol ketersediaan beras di tabung dispenser serambi masjid secara rutin 2 kali sehari (ba&apos;da Subuh &amp; Ashar).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Ambil Tanpa Izin</div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Keluarga dhuafa, lansia, musafir, atau jamaah yang sedang terjepit ekonomi berhak mengambil beras secukupnya tanpa perlu memperlihatkan identitas / KTP.
                </p>
              </div>
            </div>

            {/* Peringatan Stok Otomatis */}
            <div className="p-4 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-emerald-900 dark:text-emerald-200">
                  Sinkronisasi Otomatis ke Portal Publik
                </div>
                <p className="text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                  Data akumulasi penyaluran dan status stok ini secara aman diagregasikan ke halaman publik [babulkhaer.or.id/publik] untuk memantik kepedulian para muhsinin dan donatur beras.
                </p>
              </div>
            </div>
          </div>

          {/* Tren Stok Mingguan (Visual Bar Chart) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Aktivitas Beras Sepekan Terakhir</span>
            </h3>

            <div className="space-y-3 pt-1">
              {[
                { day: 'Senin', deposit: 25, withdraw: 10, stock: 170 },
                { day: 'Selasa', deposit: 30, withdraw: 15, stock: 185 },
                { day: 'Rabu', deposit: 100, withdraw: 20, stock: 265 },
                { day: 'Kamis', deposit: 0, withdraw: 15, stock: 250 },
                { day: 'Jumat', deposit: 50, withdraw: 25, stock: 275 },
                { day: 'Sabtu', deposit: 10, withdraw: 15, stock: 270 },
                { day: 'Ahad', deposit: 0, withdraw: 20, stock: 250 },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                    <span className="font-semibold">{item.day}</span>
                    <span>+{item.deposit} Kg | -{item.withdraw} Kg</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${Math.min(100, item.deposit * 2)}%` }}
                      title={`Masuk: ${item.deposit} kg`}
                    />
                    <div
                      className="bg-teal-400 h-full"
                      style={{ width: `${Math.min(100, item.withdraw * 2)}%` }}
                      title={`Keluar: ${item.withdraw} kg`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Setoran Masuk
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 inline-block" /> Pengeluaran
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Riwayat Setoran Beras (Deposits) */}
      {activeTab === 'deposits' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daftar Setoran Beras Masuk
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pencatatan donasi beras fisik dari jamaah dan para muhsinin
              </p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setIsDepositModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tambah Setoran</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5">Nama Donatur</th>
                  <th className="p-3.5 text-right">Berat (Kg)</th>
                  <th className="p-3.5">Catatan / Keterangan</th>
                  <th className="p-3.5">Petugas Penerima</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-xs">
                      Tidak ada data setoran beras yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap font-medium">{d.date}</td>
                      <td className="p-3.5 font-bold">
                        {d.donorName ? (
                          <span className="text-slate-900 dark:text-white">{d.donorName}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 italic bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            Hamba Allah (Anonim)
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-extrabold text-emerald-700 dark:text-emerald-400 text-sm whitespace-nowrap">
                        +{d.weightKg} Kg
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {d.notes || '—'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                        {d.recordedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Log Pengeluaran (Withdrawals) - Tanpa Nama Pengambil */}
      {activeTab === 'withdrawals' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Log Pengeluaran &amp; Refill Dispenser
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pencatatan estimasi volume beras keluar oleh petugas piket (menghormati privasi jamaah)
              </p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>Catat Pengeluaran</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Tanggal</th>
                  <th className="p-3.5 text-right">Estimasi Keluar (Kg)</th>
                  <th className="p-3.5">Keterangan / Posisi Dispenser</th>
                  <th className="p-3.5">Petugas Piket</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 text-xs">
                      Belum ada catatan pengeluaran beras pada periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 whitespace-nowrap font-medium">{w.date}</td>
                      <td className="p-3.5 text-right font-extrabold text-teal-700 dark:text-teal-400 text-sm whitespace-nowrap">
                        -{w.estimatedWeightKg} Kg
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-md">
                        {w.notes || 'Pengambilan mandiri jamaah di dispenser serambi'}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-500 text-[11px]">
                        {w.recordedBy}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: Form Setoran Beras */}
      {isDepositModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deposit-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-hidden animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 id="deposit-modal-title" className="text-sm font-bold">Catat Setoran Beras Baru</h3>
                <p className="text-[11px] text-emerald-200">Infaq / sedekah lumbung pangan ATM Beras</p>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDeposit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Jumlah Berat Beras (Kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={depositWeight}
                  onChange={(e) => setDepositWeight(e.target.value)}
                  placeholder="Contoh: 25 atau 50"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Tanggal Penyerahan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              {/* Checkbox Anonim / Hamba Allah */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) setDepositDonor('');
                    }}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Setor tanpa nama (Hamba Allah / Anonim)</span>
                </label>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Centang opsi ini jika donatur tidak ingin namanya dicantumkan di papan transparansi.
                </p>
              </div>

              {!isAnonymous && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Nama Donatur / Keluarga
                  </label>
                  <input
                    type="text"
                    value={depositDonor}
                    onChange={(e) => setDepositDonor(e.target.value)}
                    placeholder="Contoh: H. Sudirman (RT 02 Blok AE)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <input
                  type="text"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  placeholder="Contoh: Beras pandan wangi kemasan 5kg x 10 karung"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDeposit}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingDeposit ? 'Menyimpan...' : 'Simpan Setoran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Form Pengeluaran / Refill (Estimasi, Tanpa Nama Penerima) */}
      {isWithdrawModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdraw-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-hidden animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 bg-teal-800 text-white flex items-center justify-between">
              <div>
                <h3 id="withdraw-modal-title" className="text-sm font-bold">Catat Pengeluaran / Refill</h3>
                <p className="text-[11px] text-teal-200">Pencatatan estimasi beras keluar untuk dispenser</p>
              </div>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-teal-200 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWithdrawal} className="p-6 space-y-4">
              <div className="p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200 leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Prinsip Privasi:</strong> Form ini mencatat total estimasi beras yang dikeluarkan ke tabung dispenser serambi masjid. <strong>TIDAK PERLU</strong> mendata nama penerima/jamaah.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Estimasi Beras Keluar (Kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={withdrawWeight}
                  onChange={(e) => setWithdrawWeight(e.target.value)}
                  placeholder="Contoh: 15 atau 25"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Tanggal Pengisian / Distribusi <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={withdrawDate}
                  onChange={(e) => setWithdrawDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Catatan Petugas Piket (Opsional)
                </label>
                <input
                  type="text"
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  placeholder="Contoh: Pengisian tabung dispenser serambi jelang Maghrib"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWithdraw}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingWithdraw ? 'Menyimpan...' : 'Simpan Pengeluaran'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Atur Ambang Batas (Threshold) */}
      {isThresholdModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="threshold-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-hidden animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-800 text-white flex items-center justify-between">
              <h3 id="threshold-modal-title" className="text-xs font-bold uppercase tracking-wider">
                Ambang Batas Stok Menipis
              </h3>
              <button
                onClick={() => setIsThresholdModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveThreshold} className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Batas Minimum Stok Menipis (Kg)
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  required
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Jika sisa stok &le; angka ini, sistem menandai &ldquo;Menipis&rdquo; dan menyediakan tombol WA darurat.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsThresholdModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Simpan Batas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
