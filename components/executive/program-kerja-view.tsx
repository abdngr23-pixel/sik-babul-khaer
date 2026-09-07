'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
  Calendar,
  Wallet,
  ShieldCheck,
  Edit3,
  X,
} from 'lucide-react';
import {
  ProgramKerjaItem,
  ExecutionStatus,
  TrafficLightIndicator,
} from '@/types/program-kerja';
import { OFFICIAL_PROGRAM_KERJA } from '@/lib/program-kerja-data';
import { FinanceTransaction } from '@/types/finance';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { NewProgramProposalModal } from '@/components/programs/new-program-proposal-modal';
import { Plus } from 'lucide-react';

interface ProgramKerjaViewProps {

  transactions?: FinanceTransaction[];
}

export default function ProgramKerjaView({ transactions = [] }: ProgramKerjaViewProps) {
  const { currentUser, isReadOnly } = useAuth();
  const { toast } = useToast();

  const [programs, setPrograms] = useState<ProgramKerjaItem[]>(OFFICIAL_PROGRAM_KERJA);
  const [selectedKomisi, setSelectedKomisi] = useState<string>('ALL');
  const [selectedSeksi, setSelectedSeksi] = useState<string>('ALL');
  const [selectedExecutionStatus, setSelectedExecutionStatus] = useState<string>('ALL');
  const [selectedTrafficLight, setSelectedTrafficLight] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state for updating status
  const [editingProgram, setEditingProgram] = useState<ProgramKerjaItem | null>(null);
  const [editStatus, setEditStatus] = useState<ExecutionStatus>('BERJALAN');
  const [editProgress, setEditProgress] = useState<number>(0);
  const [editTraffic, setEditTraffic] = useState<TrafficLightIndicator>('HIJAU');
  const [editNotes, setEditNotes] = useState<string>('');
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [nowTimestamp] = useState(() => Date.now());

  const canEdit = currentUser.role === 'KETUA_UMUM' || (!isReadOnly && currentUser.role !== 'DEWAN_PENGAWAS');

  // Compute real-time spending for each program based on linked budgetProgramId
  const programsWithRealDisbursed = useMemo(() => {
    return programs.map((p) => {
      let spent = 0;
      let txCount = 0;
      if (p.budgetProgramId && transactions.length > 0) {
        const linkedTxs = transactions.filter(
          (tx) => tx.programKerjaId === p.budgetProgramId && tx.type === 'EXPENSE'
        );
        spent = linkedTxs.reduce((sum, tx) => sum + tx.amount, 0);
        txCount = linkedTxs.length;
      }

      // Check overdue status
      const isPastDue = new Date(p.targetDate).getTime() < nowTimestamp && p.executionStatus !== 'SELESAI';
      const effectiveExecutionStatus = isPastDue && p.executionStatus !== 'SELESAI' ? 'TERLAMBAT' : p.executionStatus;
      const effectiveTraffic: TrafficLightIndicator = isPastDue && p.executionStatus !== 'SELESAI' ? 'MERAH' : p.trafficLight;


      return {
        ...p,
        executionStatus: effectiveExecutionStatus,
        trafficLight: effectiveTraffic,
        disbursedAmount: spent,
        txCount,
        isPastDue,
      };
    });
  }, [programs, transactions, nowTimestamp]);

  // Overdue alert list
  const overduePrograms = useMemo(() => {
    return programsWithRealDisbursed.filter((p) => p.isPastDue);
  }, [programsWithRealDisbursed]);

  // Filtered programs
  const filteredPrograms = useMemo(() => {
    return programsWithRealDisbursed.filter((p) => {
      const matchKomisi = selectedKomisi === 'ALL' || p.komisi === selectedKomisi;
      const matchSeksi = selectedSeksi === 'ALL' || p.seksiId === selectedSeksi;
      const matchExec = selectedExecutionStatus === 'ALL' || p.executionStatus === selectedExecutionStatus;
      const matchTraffic = selectedTrafficLight === 'ALL' || p.trafficLight === selectedTrafficLight;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.pic.toLowerCase().includes(q) ||
        p.seksiName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);

      return matchKomisi && matchSeksi && matchExec && matchTraffic && matchSearch;
    });
  }, [
    programsWithRealDisbursed,
    selectedKomisi,
    selectedSeksi,
    selectedExecutionStatus,
    selectedTrafficLight,
    searchQuery,
  ]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = programsWithRealDisbursed.length;
    const completed = programsWithRealDisbursed.filter((p) => p.executionStatus === 'SELESAI').length;
    const inProgress = programsWithRealDisbursed.filter((p) => p.executionStatus === 'BERJALAN').length;
    const delayed = programsWithRealDisbursed.filter((p) => p.executionStatus === 'TERLAMBAT').length;
    const notStarted = programsWithRealDisbursed.filter((p) => p.executionStatus === 'BELUM_MULAI').length;

    const green = programsWithRealDisbursed.filter((p) => p.trafficLight === 'HIJAU').length;
    const yellow = programsWithRealDisbursed.filter((p) => p.trafficLight === 'KUNING').length;
    const red = programsWithRealDisbursed.filter((p) => p.trafficLight === 'MERAH').length;

    const totalAllocated = programsWithRealDisbursed.reduce((s, p) => s + p.allocatedBudget, 0);
    const totalDisbursed = programsWithRealDisbursed.reduce((s, p) => s + (p.disbursedAmount || 0), 0);

    return {
      total,
      completed,
      inProgress,
      delayed,
      notStarted,
      green,
      yellow,
      red,
      totalAllocated,
      totalDisbursed,
    };
  }, [programsWithRealDisbursed]);

  const handleOpenEdit = (prog: ProgramKerjaItem) => {
    if (!canEdit) return;
    setEditingProgram(prog);
    setEditStatus(prog.executionStatus);
    setEditProgress(prog.progressPercent);
    setEditTraffic(prog.trafficLight);
    setEditNotes(prog.notes);
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;

    setPrograms((prev) =>
      prev.map((item) => {
        if (item.id === editingProgram.id) {
          return {
            ...item,
            executionStatus: editStatus,
            progressPercent: editProgress,
            trafficLight: editTraffic,
            notes: editNotes,
            lastUpdate: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );

    toast.success(`Progres program kerja "${editingProgram.title}" berhasil diperbarui!`);
    setEditingProgram(null);
  };

  const getTrafficDot = (t: TrafficLightIndicator) => {
    switch (t) {
      case 'HIJAU':
        return <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400 ring-2 ring-emerald-200 dark:ring-emerald-950 inline-block" title="Lancar / Selesai (Hijau)" />;
      case 'KUNING':
        return <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-400 ring-2 ring-amber-200 dark:ring-amber-950 inline-block animate-pulse" title="Dalam Proses / Waspada (Kuning)" />;
      case 'MERAH':
        return <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-400 ring-2 ring-rose-200 dark:ring-rose-950 inline-block animate-bounce" title="Terlambat / Kritis (Merah)" />;
    }
  };

  const getExecutionBadge = (s: ExecutionStatus) => {
    switch (s) {
      case 'SELESAI':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Selesai
          </span>
        );
      case 'BERJALAN':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Berjalan
          </span>
        );
      case 'TERLAMBAT':
        return (
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Terlambat
          </span>
        );
      case 'BELUM_MULAI':
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Belum Mulai
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Executive Scope */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-soft-sm relative overflow-hidden transition-colors">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-100/40 via-teal-50/20 to-transparent dark:from-emerald-950/20 dark:via-teal-950/10 pointer-events-none rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pusat Monitoring Eksekutif DKM
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                {currentUser.role === 'DEWAN_PENGAWAS' ? 'Mode Pengawas (Read-Only)' : 'Kendali Ketua Umum & Sekretariat'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Dashboard Monitoring 74 Program Kerja Raker 2026–2029
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Pengawasan granular seluruh item program kerja dari 8 seksi, memantau tenggat jadwal, koordinator (PIC), realisasi kas, dan indikator traffic light.
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{metrics.total}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 block">Selesai</span>
              <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">{metrics.completed}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400 block">Jalan</span>
              <span className="text-lg font-black text-blue-700 dark:text-blue-400">{metrics.inProgress}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
            <div className="text-center px-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 block">Lewat</span>
              <span className="text-lg font-black text-rose-700 dark:text-rose-400">{metrics.delayed}</span>
            </div>
            {canEdit && (
              <>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                <button
                  onClick={() => setIsProposalModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-soft-sm transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Usulan Baru</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Automatic Alert Banner for Overdue Programs */}
      {overduePrograms.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-soft-sm animate-in fade-in duration-300">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                Peringatan: {overduePrograms.length} Program Melewati Tenggat Jadwal Pelaksanaan!
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100">
                Perlu Intervensi Pimpinan
              </span>
            </div>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
              Program berikut telah melewati target tanggal penyelesaian namun belum dilaporkan selesai:
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {overduePrograms.map((p) => (
                <div
                  key={p.id}
                  className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/80 px-3 py-1.5 rounded-xl text-xs flex items-center gap-2"
                >
                  <span className="font-bold text-rose-800 dark:text-rose-300">[{p.code}]</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-xs">{p.title}</span>
                  <span className="text-[10px] text-slate-500">Tenggat: {p.targetDate} (PJ: {p.pic})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Traffic-Light Indicators & Financial Runway Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status Hijau (Lancar)</span>
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">{metrics.green} Program</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Berjalan sesuai jadwal atau telah tuntas.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status Kuning (Waspada)</span>
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-2">{metrics.yellow} Program</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Mendekati tenggat atau butuh koordinasi.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status Merah (Terlambat)</span>
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-2">{metrics.red} Program</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Melewati jadwal & belum tuntas.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Realisasi Anggaran</span>
            <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-2">
            Rp {metrics.totalDisbursed.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Dari pagu Rp {metrics.totalAllocated.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* 4. Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft-sm space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama program, kode, seksi, atau penanggung jawab (PIC)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-slate-50 dark:bg-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Quick Clear Filter */}
          {(selectedKomisi !== 'ALL' ||
            selectedSeksi !== 'ALL' ||
            selectedExecutionStatus !== 'ALL' ||
            selectedTrafficLight !== 'ALL' ||
            searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedKomisi('ALL');
                setSelectedSeksi('ALL');
                setSelectedExecutionStatus('ALL');
                setSelectedTrafficLight('ALL');
                setSearchQuery('');
              }}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline px-2 py-1 shrink-0 cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Dropdown Filters Group */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Komisi Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Komisi</label>
            <select
              value={selectedKomisi}
              onChange={(e) => setSelectedKomisi(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Semua Komisi</option>
              <option value="KOMISI_I">Komisi I: Peribadatan & Dakwah</option>
              <option value="KOMISI_II">Komisi II: Pembangunan & Sarpras</option>
              <option value="SOSIAL_HUMAS">Sosial, Humas & ZISWAF</option>
              <option value="PEMBERDAYAAN">Pemberdayaan Perempuan & TPA</option>
            </select>
          </div>

          {/* Seksi Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Seksi (8 Bidang)</label>
            <select
              value={selectedSeksi}
              onChange={(e) => setSelectedSeksi(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Semua 8 Seksi</option>
              <option value="PERIBADATAN_DAKWAH">Seksi Peribadatan & Dakwah</option>
              <option value="PENDIDIKAN_REMAJA">Seksi Pendidikan & Remaja</option>
              <option value="PEMBANGUNAN">Seksi Pembangunan</option>
              <option value="SARANA_PRASARANA">Seksi Sarana & Prasarana</option>
              <option value="HUMAS_SOSIAL">Seksi Humas & Sosial</option>
              <option value="ZISWAF_MUSTAHIQ">Seksi ZISWAF & Mustahiq</option>
              <option value="PEREMPUAN_TPA">Seksi Perempuan & TPA</option>
              <option value="KEAMANAN_LINGKUNGAN">Seksi Keamanan & Lingkungan</option>
            </select>
          </div>

          {/* Status Pelaksanaan */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status Pelaksanaan</label>
            <select
              value={selectedExecutionStatus}
              onChange={(e) => setSelectedExecutionStatus(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Semua Status</option>
              <option value="BELUM_MULAI">Belum Mulai</option>
              <option value="BERJALAN">Sedang Berjalan</option>
              <option value="SELESAI">Selesai</option>
              <option value="TERLAMBAT">Terlambat</option>
            </select>
          </div>

          {/* Traffic Light */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Indikator Traffic Light</label>
            <select
              value={selectedTrafficLight}
              onChange={(e) => setSelectedTrafficLight(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">Semua Indikator</option>
              <option value="HIJAU">🟢 Hijau (Aman / Selesai)</option>
              <option value="KUNING">🟡 Kuning (Perhatian)</option>
              <option value="MERAH">🔴 Merah (Kritis / Terlambat)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 5. Granular Programs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft-sm overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Menampilkan <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{filteredPrograms.length}</span> dari {metrics.total} program kerja
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Klik tombol ubah di ujung baris untuk memutakhirkan progres
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-700">
              <tr>
                <th className="px-3 py-3 text-center w-10">T/L</th>
                <th className="px-4 py-3">Kode & Program</th>
                <th className="px-4 py-3">Seksi & Koordinator (PIC)</th>
                <th className="px-4 py-3 text-center">Status Pelaksanaan</th>
                <th className="px-4 py-3 text-center">Progres</th>
                <th className="px-4 py-3 text-right">Pagu Raker</th>
                <th className="px-4 py-3 text-right">Realisasi Kas</th>
                <th className="px-4 py-3">Tenggat Target</th>
                {canEdit && <th className="px-3 py-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 9 : 8} className="text-center py-10 text-slate-500">
                    Tidak ditemukan program kerja dengan filter pencarian ini.
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Traffic Light Dot */}
                      <td className="px-3 py-3.5 text-center">
                        {getTrafficDot(p.trafficLight)}
                      </td>

                      {/* Code & Title */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {p.code}
                          </span>
                          <span className="font-bold text-slate-900 dark:text-white leading-tight">
                            {p.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {p.description}
                        </p>
                      </td>

                      {/* Seksi & PIC */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                          {p.seksiName}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <User className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span>PJ: {p.pic}</span>
                        </div>
                      </td>

                      {/* Execution Status */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        {getExecutionBadge(p.executionStatus)}
                      </td>

                      {/* Progress Bar */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="inline-flex flex-col items-center">
                          <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                            {p.progressPercent}%
                          </span>
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                p.progressPercent === 100
                                  ? 'bg-emerald-600'
                                  : p.progressPercent > 50
                                  ? 'bg-blue-600'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${p.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Budget Allocated */}
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        Rp {p.allocatedBudget.toLocaleString('id-ID')}
                      </td>

                      {/* Realized Cash */}
                      <td className="px-4 py-3.5 text-right font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        Rp {(p.disbursedAmount || 0).toLocaleString('id-ID')}
                        {p.txCount ? (
                          <span className="text-[9px] text-slate-400 block font-normal">
                            ({p.txCount} transaksi)
                          </span>
                        ) : null}
                      </td>

                      {/* Timeline */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-slate-700 dark:text-slate-300 block text-[11px] font-medium">
                          {p.targetTimeline}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          {p.targetDate}
                        </span>
                      </td>

                      {/* Action Button */}
                      {canEdit && (
                        <td className="px-3 py-3.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            title="Perbarui Progres Program"
                            aria-label={`Perbarui ${p.title}`}
                            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Modal Update Progres Program Kerja */}
      {editingProgram && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-update-prog-title"
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
              <div>
                <h3 id="modal-update-prog-title" className="text-base font-bold text-slate-900 dark:text-white">
                  Perbarui Progres Program Kerja
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  [{editingProgram.code}] {editingProgram.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProgram(null)}
                aria-label="Tutup"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Status Pelaksanaan
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as ExecutionStatus)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                >
                  <option value="BELUM_MULAI">Belum Mulai</option>
                  <option value="BERJALAN">Sedang Berjalan</option>
                  <option value="SELESAI">Selesai (100%)</option>
                  <option value="TERLAMBAT">Terlambat / Tertunda</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Persentase Kemajuan: <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{editProgress}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editProgress}
                  onChange={(e) => setEditProgress(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Indikator Traffic Light
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'HIJAU', label: '🟢 Hijau (Aman)', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300' },
                    { key: 'KUNING', label: '🟡 Kuning (Perhatian)', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-300' },
                    { key: 'MERAH', label: '🔴 Merah (Kritis)', bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-300' },
                  ].map((btn) => (
                    <button
                      key={btn.key}
                      type="button"
                      onClick={() => setEditTraffic(btn.key as TrafficLightIndicator)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                        editTraffic === btn.key
                          ? `${btn.bg} ring-2 ring-emerald-500 font-extrabold shadow-2xs`
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Evaluasi / Kendala Lapangan
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Contoh: Menunggu pengiriman bahan material; jadwal rapat koordinasi disepakati pekan depan..."
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProgram(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft-sm cursor-pointer"
                >
                  Simpan Pembaruan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AJUKAN USULAN PROGRAM KERJA BARU */}
      <NewProgramProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
      />
    </div>
  );
}
