'use client';

import React, { useState, useEffect } from 'react';
import { useModalBackHandler } from '@/lib/back-button-handler';
import {
  Calendar,
  Clock,
  Phone,
  Copy,
  Printer,
  CheckCircle2,
  Share2,
  BookOpen,
  Moon,
  Sparkles,
  Users,
  UserPlus,
  Search,
  Check,
  Building,
  GraduationCap,
  MapPin,
  ExternalLink,
  Filter,
  FileSpreadsheet,
  Upload,
  Download,
} from 'lucide-react';
import {
  INITIAL_KHATIB_DATABASE,
  INITIAL_FRIDAY_SCHEDULES,
  INITIAL_RAWATIB_SCHEDULES,
  INITIAL_KAJIAN_SCHEDULES,
  INITIAL_RAMADHAN_SCHEDULES,
} from '@/lib/mock-dakwah';
import {
  FridayScheduleItem,
  FridayConfirmationStatus,
  KhatibItem,
  KajianScheduleItem,
  RamadhanScheduleItem,
} from '@/types/dakwah';
import { useAuth } from '@/lib/auth-context';
import CreateKhatibModal from './create-khatib-modal';
import CompleteAgendaModal from './complete-agenda-modal';
import DakwahUploadModal from './dakwah-upload-modal';
import {
  downloadFridayScheduleTemplate,
  exportFridayScheduleToExcel,
  downloadRamadhanScheduleTemplate,
  exportRamadhanScheduleToExcel,
} from '@/lib/dakwah-excel-helper';

export default function DakwahView() {
  const { isReadOnly } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'asatidz' | 'khatib' | 'rawatib' | 'kajian' | 'ramadhan'>('khatib');

  // Periode Tahun Terpilih (Default 2026)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const availableYears = [2025, 2026, 2027, 2028];

  const getHijriYear = (yr: number): string => {
    if (yr === 2026) return '1448 H';
    if (yr === 2027) return '1449 H';
    if (yr === 2025) return '1447 H';
    return `${yr - 578} H`;
  };

  // Master Database Asatidz / Khatib & Penceramah
  const [khatibList, setKhatibList] = useState<KhatibItem[]>(INITIAL_KHATIB_DATABASE);
  const [searchKhatib, setSearchKhatib] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'AKTIF' | 'CADANGAN'>('ALL');
  const [isCreateKhatibOpen, setIsCreateKhatibOpen] = useState(false);

  // State Schedules
  const [fridaySchedules, setFridaySchedules] = useState<FridayScheduleItem[]>(INITIAL_FRIDAY_SCHEDULES);
  const [kajianSchedules, setKajianSchedules] = useState<KajianScheduleItem[]>(INITIAL_KAJIAN_SCHEDULES);
  const [ramadhanSchedules, setRamadhanSchedules] = useState<RamadhanScheduleItem[]>(INITIAL_RAMADHAN_SCHEDULES);

  // Agenda Filters (Semua / Terjadwal / Sudah Dikerjakan)
  const [fridayFilter, setFridayFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [kajianFilter, setKajianFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');
  const [ramadhanFilter, setRamadhanFilter] = useState<'ALL' | 'UPCOMING' | 'COMPLETED'>('ALL');

  // Modal Upload & Template State
  const [uploadModalState, setUploadModalState] = useState<{
    isOpen: boolean;
    type: 'FRIDAY' | 'RAMADHAN';
  }>({ isOpen: false, type: 'FRIDAY' });

  // Modal Tandai Selesai / Realisasi Pelaksanaan
  const [completeModalTarget, setCompleteModalTarget] = useState<{
    type: 'FRIDAY' | 'KAJIAN' | 'RAMADHAN';
    id: string;
    title: string;
    speaker: string;
    date: string;
    defaultHonor: number;
    defaultAttendance?: number;
  } | null>(null);

  // Mobile Hardware Back Button handlers for Dakwah modals
  useModalBackHandler(isCreateKhatibOpen, () => setIsCreateKhatibOpen(false), 'dakwah-create-khatib');
  useModalBackHandler(uploadModalState.isOpen, () => setUploadModalState((prev) => ({ ...prev, isOpen: false })), 'dakwah-upload');
  useModalBackHandler(Boolean(completeModalTarget), () => setCompleteModalTarget(null), 'dakwah-complete-agenda');

  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  // Sync from Cloud Turso / SQLite on mount and when year changes
  useEffect(() => {
    fetch(`/api/dakwah?year=${selectedYear}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          if (res.data.khatibList) setKhatibList(res.data.khatibList);
          if (res.data.fridaySchedules) setFridaySchedules(res.data.fridaySchedules);
          if (res.data.ramadhanSchedules) setRamadhanSchedules(res.data.ramadhanSchedules);
          if (res.data.kajianSchedules) setKajianSchedules(res.data.kajianSchedules);
        }
      })
      .catch((err) => console.warn('Gagal sinkronisasi data dakwah dari server:', err));
  }, [selectedYear]);

  // Helper filter by Year
  const getFridayItemYear = (item: FridayScheduleItem) => {
    if (item.year) return item.year;
    if (item.date && item.date.length >= 4) {
      const parsed = parseInt(item.date.slice(0, 4), 10);
      if (!isNaN(parsed)) return parsed;
    }
    return 2026;
  };

  const getRamadhanItemYear = (item: RamadhanScheduleItem) => {
    if (item.year) return item.year;
    return 2026;
  };

  // Schedules filtered by selectedYear
  const fridayForSelectedYear = fridaySchedules.filter((f) => getFridayItemYear(f) === selectedYear);
  const ramadhanForSelectedYear = ramadhanSchedules.filter((r) => getRamadhanItemYear(r) === selectedYear);

  // Handler tambah khatib baru
  const handleSaveKhatib = async (newKhatibData: Omit<KhatibItem, 'id' | 'createdAt' | 'totalAppearances'>) => {
    const tempKhatib: KhatibItem = {
      ...newKhatibData,
      id: `ktb-${Date.now()}`,
      totalAppearances: 0,
      createdAt: new Date().toISOString(),
    };
    setKhatibList((prev) => [tempKhatib, ...prev]);
    setCopiedMessage(`Asatidz/Khatib "${tempKhatib.name}" berhasil ditambahkan ke database!`);

    try {
      const res = await fetch('/api/dakwah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create-khatib', ...newKhatibData }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setKhatibList((prev) => prev.map((k) => (k.id === tempKhatib.id ? data.data : k)));
      }
    } catch (err) {
      console.error('Gagal menyimpan khatib ke database:', err);
    }

    setTimeout(() => {
      setCopiedMessage(null);
    }, 4000);
  };

  // Handler import jadwal Jumat dari Excel
  const handleImportFriday = async (items: FridayScheduleItem[], mode: 'APPEND' | 'REPLACE') => {
    if (mode === 'REPLACE') {
      setFridaySchedules((prev) => [
        ...prev.filter((f) => getFridayItemYear(f) !== selectedYear),
        ...items,
      ]);
      setCopiedMessage(`Berhasil menggantikan jadwal Jumat tahun ${selectedYear} dengan ${items.length} sesi baru.`);
    } else {
      setFridaySchedules((prev) => [...prev, ...items]);
      setCopiedMessage(`Alhamdulillah! Berhasil menambahkan ${items.length} sesi jadwal Jumat ke tahun ${selectedYear}.`);
    }

    try {
      await fetch('/api/dakwah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-friday', items }),
      });
    } catch (err) {
      console.error('Gagal menyimpan jadwal Jumat ke server:', err);
    }

    setTimeout(() => setCopiedMessage(null), 4000);
  };

  // Handler import jadwal Ramadhan dari Excel
  const handleImportRamadhan = async (items: RamadhanScheduleItem[], mode: 'APPEND' | 'REPLACE') => {
    if (mode === 'REPLACE') {
      setRamadhanSchedules((prev) => [
        ...prev.filter((r) => getRamadhanItemYear(r) !== selectedYear),
        ...items,
      ]);
      setCopiedMessage(`Berhasil memperbarui jadwal Ramadhan ${getHijriYear(selectedYear)} dengan ${items.length} malam.`);
    } else {
      setRamadhanSchedules((prev) => [...prev, ...items]);
      setCopiedMessage(`Alhamdulillah! Berhasil mengimpor ${items.length} jadwal malam Ramadhan.`);
    }

    try {
      await fetch('/api/dakwah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'bulk-ramadhan', items }),
      });
    } catch (err) {
      console.error('Gagal menyimpan jadwal ramadhan ke server:', err);
    }

    setTimeout(() => setCopiedMessage(null), 4000);
  };

  // Handler selesaikan agenda dakwah
  const handleSaveCompletedAgenda = async (realization: {
    attendanceCount: number;
    actualHonorDisbursed: number;
    summaryNotes: string;
  }) => {
    if (!completeModalTarget) return;

    if (completeModalTarget.type === 'FRIDAY') {
      setFridaySchedules((prev) =>
        prev.map((item) => {
          if (item.id === completeModalTarget.id) {
            return {
              ...item,
              status: 'SELESAI',
              isCompleted: true,
              attendanceCount: realization.attendanceCount,
              actualHonorDisbursed: realization.actualHonorDisbursed,
              summaryNotes: realization.summaryNotes,
              completedAt: new Date().toISOString(),
            };
          }
          return item;
        })
      );

      // Increment appearances in database khatib if matched
      setKhatibList((prev) =>
        prev.map((k) =>
          k.name.toLowerCase().includes(completeModalTarget.speaker.toLowerCase()) ||
          completeModalTarget.speaker.toLowerCase().includes(k.name.toLowerCase())
            ? { ...k, totalAppearances: k.totalAppearances + 1 }
            : k
        )
      );

      setCopiedMessage(`Sholat Jumat "${completeModalTarget.title}" berhasil dicatat sebagai agenda terlaksana!`);
    } else if (completeModalTarget.type === 'KAJIAN') {
      setKajianSchedules((prev) =>
        prev.map((item) => {
          if (item.id === completeModalTarget.id) {
            return {
              ...item,
              isCompleted: true,
              attendanceCount: realization.attendanceCount,
              actualHonorDisbursed: realization.actualHonorDisbursed,
              summaryNotes: realization.summaryNotes,
              completedAt: new Date().toISOString(),
            };
          }
          return item;
        })
      );
      setCopiedMessage(`Kajian "${completeModalTarget.title}" berhasil dicatat sebagai agenda terlaksana!`);
    } else if (completeModalTarget.type === 'RAMADHAN') {
      setRamadhanSchedules((prev) =>
        prev.map((item) => {
          if (item.id === completeModalTarget.id) {
            return {
              ...item,
              isCompleted: true,
              attendanceCount: realization.attendanceCount,
              actualHonorDisbursed: realization.actualHonorDisbursed,
              summaryNotes: realization.summaryNotes,
              completedAt: new Date().toISOString(),
            };
          }
          return item;
        })
      );
      setCopiedMessage(`Agenda Ramadhan "${completeModalTarget.title}" berhasil dicatat sebagai agenda terlaksana!`);
    }

    try {
      await fetch('/api/dakwah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete-agenda',
          type: completeModalTarget.type,
          id: completeModalTarget.id,
          ...realization,
        }),
      });
    } catch (err) {
      console.error('Gagal menyimpan penyelesaian agenda ke database:', err);
    }

    setTimeout(() => {
      setCopiedMessage(null);
    }, 4000);
    setCompleteModalTarget(null);
  };

  // Handler update status konfirmasi Jumat
  const handleToggleStatus = async (id: string, newStatus: FridayConfirmationStatus) => {
    if (isReadOnly) return;
    setFridaySchedules((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      await fetch('/api/dakwah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update-friday',
          id,
          updates: { status: newStatus },
        }),
      });
    } catch (err) {
      console.error('Gagal menyimpan status jadwal ke database:', err);
    }
  };

  // Handler salin ke clipboard untuk WhatsApp
  const handleCopyWhatsAppText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(`Jadwal ${label} berhasil disalin ke clipboard! Siap dibagikan ke grup WhatsApp Jamaah.`);
    setTimeout(() => {
      setCopiedMessage(null);
    }, 4000);
  };

  // Handler cetak pengumuman mading
  const handlePrint = () => {
    window.print();
  };

  // Filtered Asatidz Database
  const filteredKhatibList = khatibList.filter((k) => {
    const matchSearch =
      k.name.toLowerCase().includes(searchKhatib.toLowerCase()) ||
      k.institution.toLowerCase().includes(searchKhatib.toLowerCase()) ||
      k.specialization.toLowerCase().includes(searchKhatib.toLowerCase()) ||
      k.phone.includes(searchKhatib);

    const matchStatus = filterStatus === 'ALL' ? true : k.status === filterStatus;
    const matchSpec = filterSpecialization === 'ALL' ? true : k.specialization.toLowerCase().includes(filterSpecialization.toLowerCase());

    return matchSearch && matchStatus && matchSpec;
  });

  // Filtered Friday
  const filteredFridaySchedules = fridayForSelectedYear.filter((f) => {
    if (fridayFilter === 'UPCOMING') return !f.isCompleted;
    if (fridayFilter === 'COMPLETED') return f.isCompleted;
    return true;
  });

  // Filtered Kajian
  const filteredKajianSchedules = kajianSchedules.filter((k) => {
    if (kajianFilter === 'UPCOMING') return !k.isCompleted;
    if (kajianFilter === 'COMPLETED') return k.isCompleted;
    return true;
  });

  // Filtered Ramadhan
  const filteredRamadhanSchedules = ramadhanForSelectedYear.filter((r) => {
    if (ramadhanFilter === 'UPCOMING') return !r.isCompleted;
    if (ramadhanFilter === 'COMPLETED') return r.isCompleted;
    return true;
  });

  // Unique specializations for filter dropdown
  const uniqueSpecializations = Array.from(
    new Set(khatibList.map((k) => k.specialization.split('&')[0].trim()))
  );

  return (
    <div className="space-y-6">
      {/* Alert Notifikasi Salin / Tambah / Import Berhasil */}
      {copiedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-soft-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{copiedMessage}</span>
        </div>
      )}

      {/* Header Banner Divisi Peribadatan & Dakwah */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-soft-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-200 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Seksi Peribadatan & Dakwah — Bidang Ketua I (Drs. H. Suardi, M.Pd.)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sistem Manajemen Peribadatan & Dakwah Masjid
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Database penceramah per periode tahun, sistem template & upload file Excel/CSV, jadwal Khatib Jumat (52 pekan), realisasi agenda dakwah terlaksana,
            dan Semarak Ramadhan 1448 H sesuai Berita Acara Raker No. 006/A/DKM-BK-VIII/2026.
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-4 text-xs text-teal-200 font-medium flex-wrap">
            <span>PJ Seksi: <strong>Drs. Manai, M.M.</strong></span>
            <span>•</span>
            <span>Sekretariat: <strong>BTP Blok AE Katimbang</strong></span>
            <span>•</span>
            <span>SK DMI: <strong>No. 13/2026</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Database Asatidz</span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">{khatibList.length} Khatib & Dai</p>
          <p className="text-[11px] text-teal-700 font-semibold mt-1">
            {khatibList.filter((k) => k.status === 'AKTIF').length} Dai Aktif Siap Bertugas
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Khutbah Jumat ({selectedYear})</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">
            {fridayForSelectedYear.filter((f) => f.isCompleted).length} / {fridayForSelectedYear.length} Sesi
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Periode Tahun {selectedYear} ({getHijriYear(selectedYear)})
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Semarak Ramadhan</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Moon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">
            {ramadhanForSelectedYear.length} Malam Terjadwal
          </p>
          <p className="text-[11px] text-purple-700 font-semibold mt-1">
            Ramadhan {getHijriYear(selectedYear)} • {ramadhanForSelectedYear.filter((r) => r.isCompleted).length} Selesai
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Imam Sholat Fardhu</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">3 Imam Rawatib</p>
          <p className="text-[11px] text-blue-700 font-semibold mt-1">
            Rp 1.500.000 / imam / bulan
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <div className="flex items-center gap-1 sm:gap-2">
          {[
            { id: 'asatidz', label: 'Database Khatib & Dai', icon: Users, badge: khatibList.length },
            { id: 'khatib', label: 'Khatib & Sholat Jumat', icon: Calendar, badge: fridayForSelectedYear.length },
            { id: 'rawatib', label: 'Imam Rawatib & Marbot', icon: Clock },
            { id: 'kajian', label: 'Agenda Kajian & Tabligh', icon: BookOpen, badge: kajianSchedules.length },
            { id: 'ramadhan', label: 'Semarak Ramadhan', icon: Moon, badge: ramadhanForSelectedYear.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as 'asatidz' | 'khatib' | 'rawatib' | 'kajian' | 'ramadhan')}
                className={`px-3.5 sm:px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-emerald-200/70 text-emerald-900' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            title="Cetak Jadwal Resmi A4 untuk Mading"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Cetak Mading A4</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 0: DATABASE KHATIB & PENCERAMAH (ASATIDZ)                          */}
      {/* ========================================================================= */}
      {activeSubTab === 'asatidz' && (
        <div className="space-y-4">
          {/* Header & Tombol Tambah */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-soft-sm">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Database & Direktori Asatidz (Khatib & Penceramah)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-[10px] font-extrabold">
                  {khatibList.length} Terdaftar
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Bank data resmi para dai, ulama, dan penceramah dari PC DMI Biringkanaya, Kemenag, Pesantren, dan Akademisi.
              </p>
            </div>

            {!isReadOnly && (
              <button
                onClick={() => setIsCreateKhatibOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-soft-sm transition-all cursor-pointer shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Tambah Khatib / Penceramah</span>
              </button>
            )}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari nama khatib, keahlian materi, ormas, atau nomor HP..."
                value={searchKhatib}
                onChange={(e) => setSearchKhatib(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/60 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all"
              />
            </div>

            {/* Filter Status */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap hidden sm:inline">Status:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['ALL', 'AKTIF', 'CADANGAN'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      filterStatus === st
                        ? 'bg-white text-teal-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'ALL' ? 'Semua' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Spesialisasi */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={filterSpecialization}
                onChange={(e) => setFilterSpecialization(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all"
              >
                <option value="ALL">Semua Bidang Keilmuan</option>
                {uniqueSpecializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Kartu Khatib */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKhatibList.map((khatib) => {
              const initials = khatib.name
                .replace(/^(Dr\.|Drs\.|H\.|Prof\.|Ust\.|Ir\.)\s*/g, '')
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')
                .toUpperCase();

              const cleanPhone = khatib.phone.replace(/[^0-9]/g, '');
              const waNumber = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;

              return (
                <div
                  key={khatib.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-700 to-emerald-800 text-white font-extrabold text-sm flex items-center justify-center shadow-2xs shrink-0">
                          {initials || 'KH'}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-snug">
                            {khatib.name}
                          </h4>
                          <p className="text-[11px] text-teal-800 font-medium line-clamp-1">
                            {khatib.title}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                          khatib.status === 'AKTIF'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {khatib.status}
                      </span>
                    </div>

                    <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <span className="font-semibold text-slate-800">{khatib.specialization}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{khatib.institution}</span>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{khatib.address}</span>
                      </div>
                    </div>

                    {khatib.notes && (
                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-500 italic">
                        {khatib.notes}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800">
                      {khatib.totalAppearances}x Penugasan
                    </span>

                    <a
                      href={`https://wa.me/${waNumber}?text=Assalamu%27alaikum%20Warahmatullahi%20Wabarakatuh%2C%20Ustadz%20${encodeURIComponent(
                        khatib.name
                      )}.%20Kami%20dari%20Pengurus%20DKM%20Masjid%20Babul%20Khaer%20BTP%20Blok%20AE...`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Hubungi WA</span>
                      <ExternalLink className="w-3 h-3 text-emerald-600" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 1: KHATIB & SHOLAT JUMAT (DENGAN TAHUN, TEMPLATE & UPLOAD)       */}
      {/* ========================================================================= */}
      {activeSubTab === 'khatib' && (
        <div className="space-y-4">
          {/* Toolbar Periode Tahun & Fitur Template / Upload */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-soft-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">
                  Jadwal Penugasan Khatib Sholat Jumat
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-extrabold">
                  Periode {selectedYear} ({getHijriYear(selectedYear)})
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Pilih periode tahun kalender, unduh template resmi DKM, atau unggah file jadwal dari file Excel / CSV.
              </p>
            </div>

            {/* Selector Tahun & Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Year Selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span className="text-xs font-bold text-slate-600">Tahun:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-xs font-extrabold text-teal-900 outline-hidden cursor-pointer"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      {y} ({getHijriYear(y)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Unduh Template Excel */}
              <button
                type="button"
                onClick={() => downloadFridayScheduleTemplate(selectedYear, khatibList)}
                title="Unduh Template Excel Resmi DKM untuk Jadwal Jumat"
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-teal-700" />
                <span className="hidden sm:inline">Template Excel</span>
              </button>

              {/* Upload Jadwal Excel */}
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setUploadModalState({ isOpen: true, type: 'FRIDAY' })}
                  title="Upload Jadwal Khatib dari File Excel atau CSV"
                  className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-soft-sm transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Jadwal</span>
                </button>
              )}

              {/* Export Excel */}
              <button
                type="button"
                onClick={() => exportFridayScheduleToExcel(fridayForSelectedYear, selectedYear)}
                title="Export seluruh jadwal Jumat tahun ini ke file Excel"
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
            </div>
          </div>

          {/* Filter Status Agenda Jumat & Share Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Filter Agenda:</span>
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                {[
                  { id: 'ALL', label: `Semua (${fridayForSelectedYear.length})` },
                  { id: 'UPCOMING', label: `Terjadwal (${fridayForSelectedYear.filter((f) => !f.isCompleted).length})` },
                  { id: 'COMPLETED', label: `Sudah Dikerjakan (${fridayForSelectedYear.filter((f) => f.isCompleted).length})` },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setFridayFilter(pill.id as 'ALL' | 'UPCOMING' | 'COMPLETED')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      fridayFilter === pill.id
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                const text = fridayForSelectedYear
                  .map(
                    (s) =>
                      `📅 *Jumat, ${s.date} (${s.dateHijri})* ${s.isCompleted ? '✅ [TERLAKSANA]' : ''}\n🎙️ Khatib: ${s.khatibName}\n🕌 Imam: ${s.imamName}\n📖 Tema: "${s.khutbahTopic}"\n`
                  )
                  .join('\n');
                handleCopyWhatsAppText(
                  `*JADWAL KHATIB & IMAM JUMAT MASJID BABUL KHAER (TAHUN ${selectedYear})*\n\n${text}\n_Wassalamu'alaikum Wr. Wb. — Seksi Peribadatan & Dakwah DKM_`,
                  `Khatib Jumat Tahun ${selectedYear}`
                );
              }}
              className="px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-stretch sm:self-auto justify-center"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Salin Teks ke WhatsApp Jamaah</span>
            </button>
          </div>

          {/* Grid Jadwal Jumat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFridaySchedules.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl p-5 border shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between ${
                  item.isCompleted ? 'border-emerald-300 ring-1 ring-emerald-400/30' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.dateHijri}</span>
                      </div>
                    </div>

                    {item.isCompleted ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                        <span>SUDAH DIKERJAKAN</span>
                      </span>
                    ) : (
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          item.status === 'TERKONFIRMASI'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    &quot;{item.khutbahTopic}&quot;
                  </h4>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-semibold w-16 text-slate-400">Khatib:</span>
                      <span className="font-bold text-slate-900">{item.khatibName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-semibold w-16 text-slate-400">Imam:</span>
                      <span className="font-semibold text-emerald-800">{item.imamName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.phone}</span>
                      <span className="mx-1">•</span>
                      <span>Insentif: Rp {item.incentiveAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Laporan Realisasi Agenda Yang Telah Dikerjakan */}
                  {item.isCompleted && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-[11px] text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Kehadiran: {item.attendanceCount || 0} Orang Jamaah</span>
                        </span>
                        <span>Realisasi: Rp {(item.actualHonorDisbursed || item.incentiveAmount).toLocaleString('id-ID')}</span>
                      </div>
                      {item.summaryNotes && (
                        <p className="text-[11px] text-emerald-900/90 italic pt-1 border-t border-emerald-200/60 leading-relaxed">
                          &quot;{item.summaryNotes}&quot;
                        </p>
                      )}
                    </div>
                  )}

                  {item.notes && !item.isCompleted && (
                    <p className="mt-3 p-2 rounded-lg bg-slate-50 text-[11px] text-slate-500 italic">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>

                {/* Status Toggle & Mark As Complete Action */}
                {!isReadOnly && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2 flex-wrap">
                    {!item.isCompleted ? (
                      <>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-400 font-medium">Status:</span>
                          <button
                            onClick={() => handleToggleStatus(item.id, 'TERKONFIRMASI')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                              item.status === 'TERKONFIRMASI'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            Terkonfirmasi
                          </button>
                          <button
                            onClick={() => handleToggleStatus(item.id, 'MENUNGGU')}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                              item.status === 'MENUNGGU'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            Menunggu
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            setCompleteModalTarget({
                              type: 'FRIDAY',
                              id: item.id,
                              title: item.khutbahTopic,
                              speaker: item.khatibName,
                              date: `${item.date} (${item.dateHijri})`,
                              defaultHonor: item.incentiveAmount,
                              defaultAttendance: 250,
                            })
                          }
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Tandai Terlaksana</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-between text-[11px] text-emerald-800">
                        <span className="font-semibold">Status: Telah Selesai & Terdokumentasi</span>
                        <button
                          onClick={() =>
                            setCompleteModalTarget({
                              type: 'FRIDAY',
                              id: item.id,
                              title: item.khutbahTopic,
                              speaker: item.khatibName,
                              date: `${item.date} (${item.dateHijri})`,
                              defaultHonor: item.actualHonorDisbursed || item.incentiveAmount,
                              defaultAttendance: item.attendanceCount || 250,
                            })
                          }
                          className="text-teal-700 hover:underline font-bold cursor-pointer"
                        >
                          Edit Realisasi
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFridaySchedules.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Belum ada jadwal Khatib Jumat untuk Tahun {selectedYear}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Gunakan tombol di bawah untuk mengunduh template Excel resmi, mengisi daftar khatib setahun penuh, lalu unggah file ke sistem.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => downloadFridayScheduleTemplate(selectedYear, khatibList)}
                  className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template Excel {selectedYear}</span>
                </button>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => setUploadModalState({ isOpen: true, type: 'FRIDAY' })}
                    className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Jadwal {selectedYear}</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: IMAM RAWATIB & MARBOT SHOLAT FARDHU                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'rawatib' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm">
            <h3 className="text-base font-bold text-slate-900">
              Struktur & Jadwal Imam Rawatib Sholat 5 Waktu
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Hasil Sidang Pleno Raker 2026: Mengikuti standar insentif baru Rp 1.500.000 / imam / bulan
              (usulan Ketua Umum Pak Hasri). Muadzin ditiadakan anggarannya, diganti penugasan Marbot yang bisa adzan tepat waktu (usulan Pak Suardi).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_RAWATIB_SCHEDULES.map((imam) => (
              <div
                key={imam.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        imam.role === 'IMAM_RAWATIB'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {imam.roleLabel}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {imam.status}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900">{imam.name}</h4>
                  <p className="text-xs font-semibold text-emerald-800 mt-1">
                    Insentif: Rp {imam.monthlyIncentive.toLocaleString('id-ID')} / bulan
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                      Waktu Sholat yang Diimami:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {imam.assignedPrayers.map((prayer, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/70 text-xs font-bold"
                        >
                          {prayer}
                        </span>
                      ))}
                    </div>
                  </div>

                  {imam.notes && (
                    <p className="mt-3 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 leading-relaxed">
                      {imam.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{imam.phone}</span>
                  </div>
                  <span className="font-semibold text-emerald-700">Kemenag Rekomendasi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: AGENDA KAJIAN & TABLIGH                                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'kajian' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Agenda Kajian & Pembinaan Keagamaan Jamaah
              </h3>
              <p className="text-xs text-slate-500">
                Kebijakan Raker: Kajian pekanan maksimal 2x sepekan, pendanaan dicarikan sendiri (SWADAYA, tidak memakai kas operasional masjid).
              </p>
            </div>
            <button
              onClick={() => {
                const text = kajianSchedules
                  .map(
                    (k) =>
                      `📚 *${k.title}* ${k.isCompleted ? '✅ [TERLAKSANA]' : ''}\n🎙️ Pemateri: ${k.speakerName}\n📖 Tema: "${k.bookOrTopic}"\n⏰ Waktu: ${k.dayTime}\n📍 Tempat: ${k.location}\n`
                  )
                  .join('\n');
                handleCopyWhatsAppText(
                  `*AGENDA KAJIAN & PEMBINAAN MASJID BABUL KHAER BTP BLOK AE*\n\n${text}\n_Mari raih keberkahan ilmu di rumah Allah!_`,
                  'Kajian Pekanan'
                );
              }}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Jadwal Kajian ke WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Agenda:</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              {[
                { id: 'ALL', label: `Semua (${kajianSchedules.length})` },
                { id: 'UPCOMING', label: `Terjadwal (${kajianSchedules.filter((k) => !k.isCompleted).length})` },
                { id: 'COMPLETED', label: `Sudah Dikerjakan (${kajianSchedules.filter((k) => k.isCompleted).length})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setKajianFilter(pill.id as 'ALL' | 'UPCOMING' | 'COMPLETED')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    kajianFilter === pill.id
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredKajianSchedules.map((kjn) => (
              <div
                key={kjn.id}
                className={`bg-white rounded-2xl p-5 border shadow-soft-sm flex flex-col justify-between ${
                  kjn.isCompleted ? 'border-emerald-300 ring-1 ring-emerald-400/30' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {kjn.type}
                    </span>
                    {kjn.isCompleted ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                        <span>SUDAH DIKERJAKAN</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                        {kjn.fundingSource === 'SWADAYA_JAMAAH' ? 'Dana Swadaya Jamaah' : 'Kas Masjid'}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{kjn.title}</h4>
                  <p className="text-xs font-bold text-emerald-800 mt-1">
                    Pemateri: {kjn.speakerName} {kjn.speakerTitle && `(${kjn.speakerTitle})`}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span><strong>Kitab / Materi:</strong> {kjn.bookOrTopic}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span><strong>Waktu:</strong> {kjn.dayTime}</span>
                    </div>
                  </div>

                  {/* Laporan Realisasi Kajian */}
                  {kjn.isCompleted && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-[11px] text-emerald-800">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Kehadiran: {kjn.attendanceCount || 0} Orang Jamaah</span>
                        </span>
                        <span>Realisasi Honor: Rp {(kjn.actualHonorDisbursed || 0).toLocaleString('id-ID')}</span>
                      </div>
                      {kjn.summaryNotes && (
                        <p className="text-[11px] text-emerald-900/90 italic pt-1 border-t border-emerald-200/60 leading-relaxed">
                          &quot;{kjn.summaryNotes}&quot;
                        </p>
                      )}
                    </div>
                  )}

                  {kjn.notes && !kjn.isCompleted && (
                    <p className="mt-3 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-500">
                      Ketentuan: {kjn.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Kontak: {kjn.contactPerson}</span>
                  <div className="flex items-center gap-2">
                    {!isReadOnly && !kjn.isCompleted && (
                      <button
                        onClick={() =>
                          setCompleteModalTarget({
                            type: 'KAJIAN',
                            id: kjn.id,
                            title: kjn.title,
                            speaker: kjn.speakerName,
                            date: kjn.dayTime,
                            defaultHonor: 200000,
                            defaultAttendance: 50,
                          })
                        }
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Tandai Selesai</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const msg = `📚 *${kjn.title}*\n🎙️ ${kjn.speakerName}\n📖 "${kjn.bookOrTopic}"\n⏰ ${kjn.dayTime}\n📍 ${kjn.location}\n\n_Mari hadir memakmurkan majelis ilmu Masjid Babul Khaer!_`;
                        navigator.clipboard.writeText(msg);
                        setCopiedMessage(`Undangan kajian "${kjn.title}" disalin!`);
                        setTimeout(() => setCopiedMessage(null), 3000);
                      }}
                      className="text-teal-700 hover:text-teal-900 font-bold text-xs hover:underline cursor-pointer"
                    >
                      Salin Undangan
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SEMARAK RAMADHAN (DENGAN TAHUN, TEMPLATE & UPLOAD)             */}
      {/* ========================================================================= */}
      {activeSubTab === 'ramadhan' && (
        <div className="space-y-4">
          {/* Toolbar Periode Ramadhan & Fitur Template / Upload */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-soft-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                  <Moon className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Jadwal Penceramah Tarawih Ramadhan
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-xs font-extrabold">
                  Ramadhan {getHijriYear(selectedYear)} ({selectedYear} M)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Unduh template 30 malam Ramadhan, isi daftar ustadz kultum, dan unggah langsung ke sistem.
              </p>
            </div>

            {/* Actions for Ramadhan */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Year / Season Selector */}
              <div className="flex items-center gap-1.5 bg-purple-50/70 border border-purple-200 rounded-xl px-2.5 py-1">
                <Moon className="w-3.5 h-3.5 text-purple-700" />
                <span className="text-xs font-bold text-slate-600">Tahun:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-xs font-extrabold text-purple-950 outline-hidden cursor-pointer"
                >
                  {availableYears.map((y) => (
                    <option key={y} value={y}>
                      Ramadhan {getHijriYear(y)} ({y} M)
                    </option>
                  ))}
                </select>
              </div>

              {/* Unduh Template Ramadhan */}
              <button
                type="button"
                onClick={() => downloadRamadhanScheduleTemplate(selectedYear, getHijriYear(selectedYear), khatibList)}
                title="Unduh Template Excel 30 Malam Ramadhan Lengkap Standar Raker"
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-purple-700" />
                <span className="hidden sm:inline">Template 30 Malam</span>
              </button>

              {/* Upload Jadwal Ramadhan */}
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => setUploadModalState({ isOpen: true, type: 'RAMADHAN' })}
                  title="Upload Jadwal Penceramah Tarawih dari File Excel"
                  className="px-3.5 py-2 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-soft-sm transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Ramadhan</span>
                </button>
              )}

              {/* Export Ramadhan to Excel */}
              <button
                type="button"
                onClick={() => exportRamadhanScheduleToExcel(ramadhanForSelectedYear, getHijriYear(selectedYear), selectedYear)}
                title="Export Jadwal Ramadhan ke File Excel"
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
            </div>
          </div>

          {/* Standar Pleno Raker Banner */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            Standar honor resmi hasil revisi sidang pleno Raker 2026:
            <br />• <strong>Honor Penceramah Ramadhan:</strong> Rp 400.000 / malam.
            <br />• <strong>Honor Imam Tarawih:</strong> Rp 300.000 / malam.
            <br />• <strong>Buka Puasa Ramadhan:</strong> Rp 0 (Murni partisipasi swadaya jamaah RT 01 s/d RT 05).
            <br />• <strong>I&apos;tikaf 10 Akhir Ramadhan:</strong> Terjadwal pada malam ke-21 s.d. 30.
          </div>

          {/* Filter Status Ramadhan */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Filter Agenda:</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
              {[
                { id: 'ALL', label: `Semua (${ramadhanForSelectedYear.length})` },
                { id: 'UPCOMING', label: `Mendatang (${ramadhanForSelectedYear.filter((r) => !r.isCompleted).length})` },
                { id: 'COMPLETED', label: `Sudah Dikerjakan (${ramadhanForSelectedYear.filter((r) => r.isCompleted).length})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setRamadhanFilter(pill.id as 'ALL' | 'UPCOMING' | 'COMPLETED')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    ramadhanFilter === pill.id
                      ? 'bg-purple-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-soft-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3">Malam & Tanggal</th>
                  <th className="px-4 py-3">Penceramah Tarawih / Kultum</th>
                  <th className="px-4 py-3">Imam Sholat Tarawih</th>
                  <th className="px-4 py-3">Tuan Rumah Buka Puasa</th>
                  <th className="px-4 py-3 text-center">Status Pelaksanaan</th>
                  {!isReadOnly && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRamadhanSchedules.map((rmd) => (
                  <tr key={rmd.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 block text-xs">
                        Malam Ke-{rmd.nightNumber}
                      </span>
                      <span className="text-[10px] text-purple-700 font-semibold">{rmd.date}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{rmd.penceramahTarawih}</div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                        &quot;{rmd.topicKultum}&quot;
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                        Honor: Rp {rmd.honorPenceramah.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{rmd.imamTarawih}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                        Honor: Rp {rmd.honorImamTarawih.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{rmd.bukberHost}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Estimasi: {rmd.bukberPax} Porsi
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {rmd.isCompleted ? (
                        <div className="inline-flex flex-col items-center gap-0.5">
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                            <span>Terlaksana</span>
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold">
                            {rmd.attendanceCount || 100} Jamaah
                          </span>
                        </div>
                      ) : (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            rmd.itikafStatus === 'TERJADWAL'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {rmd.itikafStatus === 'TERJADWAL' ? 'I\'tikaf 10 Akhir' : 'Terjadwal'}
                        </span>
                      )}
                    </td>
                    {!isReadOnly && (
                      <td className="px-4 py-3.5 text-right">
                        {!rmd.isCompleted ? (
                          <button
                            onClick={() =>
                              setCompleteModalTarget({
                                type: 'RAMADHAN',
                                id: rmd.id,
                                title: `Malam Ke-${rmd.nightNumber} Ramadhan: ${rmd.topicKultum}`,
                                speaker: rmd.penceramahTarawih,
                                date: rmd.date,
                                defaultHonor: rmd.honorPenceramah + rmd.honorImamTarawih,
                                defaultAttendance: 150,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Tandai Selesai
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-bold">Lunas</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRamadhanSchedules.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
              <Moon className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Belum ada jadwal penceramah untuk Ramadhan {getHijriYear(selectedYear)}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Unduh template resmi 30 malam Ramadhan yang telah disiapkan, lalu unggah file jadwal Anda.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => downloadRamadhanScheduleTemplate(selectedYear, getHijriYear(selectedYear), khatibList)}
                  className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template 30 Malam</span>
                </button>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => setUploadModalState({ isOpen: true, type: 'RAMADHAN' })}
                    className="px-4 py-2 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Jadwal Ramadhan</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Tambah Khatib / Penceramah */}
      <CreateKhatibModal
        isOpen={isCreateKhatibOpen}
        onClose={() => setIsCreateKhatibOpen(false)}
        onSave={handleSaveKhatib}
      />

      {/* MODAL 2: Tandai Selesai / Realisasi Pelaksanaan */}
      {completeModalTarget && (
        <CompleteAgendaModal
          isOpen={!!completeModalTarget}
          agendaType={completeModalTarget.type}
          agendaTitle={completeModalTarget.title}
          agendaSpeaker={completeModalTarget.speaker}
          agendaDate={completeModalTarget.date}
          defaultHonor={completeModalTarget.defaultHonor}
          defaultAttendance={completeModalTarget.defaultAttendance}
          onClose={() => setCompleteModalTarget(null)}
          onSave={handleSaveCompletedAgenda}
        />
      )}

      {/* MODAL 3: Upload Spreadsheet Jadwal (Friday & Ramadhan) */}
      <DakwahUploadModal
        isOpen={uploadModalState.isOpen}
        type={uploadModalState.type}
        selectedYear={selectedYear}
        hijriYear={getHijriYear(selectedYear)}
        asatidzList={khatibList}
        onClose={() => setUploadModalState({ ...uploadModalState, isOpen: false })}
        onImportFriday={handleImportFriday}
        onImportRamadhan={handleImportRamadhan}
      />
    </div>
  );
}
