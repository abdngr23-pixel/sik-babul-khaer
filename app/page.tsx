'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Sidebar, { AppNavTab } from '@/components/layout/sidebar';
import Navbar from '@/components/layout/navbar';

// Phase 1 Components
import LetterArchiveTable from '@/components/letters/letter-archive-table';
import CreateLetterModal from '@/components/letters/create-letter-modal';
import ArchiveLetterModal from '@/components/letters/archive-letter-modal';
import OfficialLetterPreview from '@/components/letters/official-letter-preview';
import MinutesExtractor from '@/components/letters/minutes-extractor';

// Phase 2 Components
import JamaahStatsCards from '@/components/jamaah/jamaah-stats';
import JamaahTable from '@/components/jamaah/jamaah-table';
import JamaahFormModal from '@/components/jamaah/jamaah-form-modal';
import JamaahDetailModal from '@/components/jamaah/jamaah-detail-modal';
import JamaahExcelModal from '@/components/jamaah/jamaah-excel-modal';

// Keuangan & Sarpras Components
import FinanceStatsCards from '@/components/finance/finance-stats';
import TransactionTable from '@/components/finance/transaction-table';
import TransactionModal from '@/components/finance/transaction-modal';
import FridayReportModal from '@/components/finance/friday-report-modal';
import DonorTable from '@/components/finance/donor-table';
import AssetStatsCards from '@/components/assets/asset-stats';
import AssetTable from '@/components/assets/asset-table';
import AssetFormModal from '@/components/assets/asset-form-modal';

// Laporan & Eksekutif Components
import ExecutiveKPI from '@/components/reports/executive-kpi';
import LPJGenerator from '@/components/reports/lpj-generator';
import LPJPreviewModal from '@/components/reports/lpj-preview-modal';
import ApprovalBoard from '@/components/reports/approval-board';

// Keamanan & Auth
import { useAuth } from '@/lib/auth-context';
import RoleBanner from '@/components/auth/role-banner';
import LoginModal from '@/components/auth/login-modal';
import AuditLogModal from '@/components/auth/audit-log-modal';
import DatabaseBackupModal from '@/components/auth/database-backup-modal';

// Modular Dashboard Components (Refactor Prioritas 4)
import PersistenceBanner from '@/components/dashboard/persistence-banner';
import DashboardSummaryGrid from '@/components/dashboard/dashboard-summary-grid';
import DashboardSekretariatCard from '@/components/dashboard/dashboard-sekretariat-card';
import DashboardKeuanganCard from '@/components/dashboard/dashboard-keuangan-card';
import DashboardQuickActions from '@/components/dashboard/dashboard-quick-actions';
import DashboardSarprasCard from '@/components/dashboard/dashboard-sarpras-card';
import DashboardKpiCard from '@/components/dashboard/dashboard-kpi-card';

// Custom Hook (Refactor Prioritas 4 & 5)
import { useDashboardStats } from '@/hooks/useDashboardStats';

// Types
import { OfficialLetter, LetterStatus } from '@/types/letter';
import { Jamaah } from '@/types/jamaah';
import { FinanceTransaction } from '@/types/finance';
import { AssetItem } from '@/types/asset';
import { LPJReport, ApprovalStatus, ApprovalType } from '@/types/reports';

import {
  Inbox,
  FileCheck2,
  Sparkles,
  CheckCircle2,
  FileText,
  ListTodo,
  Plus,
  Loader2,
  Users,
  HeartHandshake,
  Wrench,
  Package,
  BarChart3,
  ShieldCheck,
  Eye,
  ArrowRightLeft,
  LayoutDashboard,
  Archive,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, isReadOnly, canAccessTab, canMutateTab } = useAuth();
  const [requestedTab, setActiveTab] = useState<AppNavTab>('dashboard');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isFridayReportOpen, setIsFridayReportOpen] = useState(false);

  // Derived activeTab ensures user cannot be on a restricted tab
  const activeTab: AppNavTab = canAccessTab(requestedTab)
    ? requestedTab
    : 'dashboard';

  // Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Phase 1 Letters State
  const [isCreateLetterOpen, setIsCreateLetterOpen] = useState(false);
  const [isArchiveLetterModalOpen, setIsArchiveLetterModalOpen] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<OfficialLetter | null>(null);

  // Phase 2 Jamaah State
  const [selectedRT, setSelectedRT] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isJamaahFormOpen, setIsJamaahFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState<Jamaah | null>(null);
  const [detailJamaah, setDetailJamaah] = useState<Jamaah | null>(null);

  // Phase 3 Finance & Donors State
  const [financeCategoryFilter, setFinanceCategoryFilter] = useState('ALL');
  const [financeTypeFilter, setFinanceTypeFilter] = useState('ALL');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);
  const [isCreateDonorOpen, setIsCreateDonorOpen] = useState(false);

  // Phase 3 Assets State
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('ALL');
  const [assetConditionFilter, setAssetConditionFilter] = useState('ALL');
  const [assetOnlyDueFilter, setAssetOnlyDueFilter] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);

  // Phase 4 Reports & Approvals State
  const [previewLPJ, setPreviewLPJ] = useState<LPJReport | null>(null);
  const [reportsSubView, setReportsSubView] = useState<'generator' | 'kpi'>('generator');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Data fetching hook
  const {
    letters,
    setLetters,
    minutes,
    jamaahList,
    jamaahStats,
    transactions,
    financeSummary,
    donors,
    donorStats,
    assets,
    assetStats,
    kpis,
    overallScore,
    overallGrade,
    approvals,
    lpjReport,
    totalLetters,
    approvedCount,
    invitationCount,
    pendingApprovalsCount,
    totalActiveTasks,
    isLoading,
    refreshAll,
    fetchLetters,
    fetchJamaah,
    fetchFinance,
    fetchDonors,
    fetchAssets,
    fetchReports,
    fetchApprovals,
  } = useDashboardStats();

  // Tab category flags
  const isDashboardTab = activeTab === 'dashboard';
  const isFinanceTab = activeTab === 'finance';
  const isDonorsTab = activeTab === 'donors';
  const isAssetTab = activeTab === 'assets';
  const isJamaahTab = activeTab === 'jamaah' || activeTab === 'mustahiq';
  const isReportsTab = activeTab === 'reports';
  const isApprovalsTab = activeTab === 'approvals';

  // ----------------------------------------------------
  // Action Handlers
  // ----------------------------------------------------
  const handleOpenCreateLetter = () => {
    if (!canMutateTab('create')) {
      showToast('Wewenang terbatas: Hanya Sekretaris atau Ketua yang dapat membuat surat');
      return;
    }
    setIsCreateLetterOpen(true);
  };

  const handleOpenCreateJamaah = () => {
    if (!canMutateTab('jamaah')) {
      showToast('Wewenang terbatas: Hanya Bidang Kemasjidan yang dapat menambah data jamaah');
      return;
    }
    setEditingJamaah(null);
    setIsJamaahFormOpen(true);
  };

  const handleEditJamaah = (jamaah: Jamaah) => {
    if (!canMutateTab('jamaah')) {
      showToast('Wewenang terbatas: Hanya Bidang Kemasjidan yang dapat mengubah data jamaah');
      return;
    }
    setEditingJamaah(jamaah);
    setIsJamaahFormOpen(true);
  };

  const handleJamaahSaved = () => {
    fetchJamaah();
    showToast('Data warga berhasil disimpan');
  };

  const handleImportSuccess = (imported: Jamaah[]) => {
    fetchJamaah();
    showToast(`Berhasil mengimpor ${imported.length} data jamaah`);
  };

  const handleOpenCreateTransaction = () => {
    if (!canMutateTab('finance')) {
      showToast('Wewenang terbatas: Hanya Bendahara yang dapat mencatat mutasi kas');
      return;
    }
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const handleEditTransaction = (tx: FinanceTransaction) => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Perubahan catatan kas tidak diizinkan.');
      return;
    }
    if (!canMutateTab('finance')) {
      showToast('Wewenang terbatas: Hanya Bendahara yang dapat mengubah data kas.');
      return;
    }
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string, desc: string) => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Penghapusan transaksi kas tidak diizinkan.');
      return;
    }
    if (!canMutateTab('finance')) {
      showToast('Wewenang terbatas: Hanya Bendahara yang dapat menghapus data kas.');
      return;
    }
    if (!window.confirm(`Yakin ingin menghapus transaksi kas "${desc}"?`)) return;

    try {
      const res = await fetch(`/api/finance?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchFinance();
        showToast(`Transaksi "${desc}" berhasil dihapus.`);
      }
    } catch {
      showToast('Gagal menghapus transaksi kas');
    }
  };

  const handleTransactionSaved = () => {
    fetchFinance();
    showToast('Transaksi kas berhasil dibukukan');
  };

  const handleOpenCreateAsset = () => {
    if (!canMutateTab('assets')) {
      showToast('Wewenang terbatas: Hanya Koordinator Sarpras yang dapat mendaftarkan aset');
      return;
    }
    setEditingAsset(null);
    setIsAssetModalOpen(true);
  };

  const handleEditAsset = (asset: AssetItem) => {
    if (!canMutateTab('assets')) {
      showToast('Wewenang terbatas: Hanya Koordinator Sarpras yang dapat mengubah aset');
      return;
    }
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  };

  const handleAssetSaved = () => {
    fetchAssets();
    showToast('Aset inventaris berhasil disimpan');
  };

  const handleDeleteAsset = async (id: string, name: string) => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Penghapusan aset inventaris tidak diizinkan.');
      return;
    }
    if (!canMutateTab('assets')) {
      showToast('Wewenang terbatas: Hanya Koordinator Sarpras yang dapat menghapus aset.');
      return;
    }
    if (!window.confirm(`Yakin ingin menghapus inventaris sarpras "${name}"?`)) return;

    try {
      const res = await fetch(`/api/assets?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAssets();
        showToast(`Aset "${name}" berhasil dihapus dari inventaris.`);
      }
    } catch {
      showToast('Gagal menghapus aset sarpras');
    }
  };

  const handleRecordMaintenance = async (assetId: string, notes?: string) => {
    if (!canMutateTab('assets')) {
      showToast('Wewenang terbatas: Hanya Koordinator Sarpras yang dapat mencatat servis');
      return;
    }
    try {
      const res = await fetch('/api/assets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: assetId, action: 'RECORD_MAINTENANCE', notes }),
      });
      if (res.ok) {
        fetchAssets();
        showToast('Jadwal pemeliharaan aset berhasil dicatat!');
      }
    } catch {
      showToast('Gagal mencatat pemeliharaan aset');
    }
  };

  const handleLetterCreated = (newLetter: OfficialLetter) => {
    setLetters((prev) => [newLetter, ...prev]);
    showToast(`Surat No. ${newLetter.letterNumber} berhasil diterbitkan`);
  };

  const handleArchiveLetterSaved = () => {
    fetchLetters();
    showToast('Surat berhasil dicatat ke e-arsip');
  };

  const handleUpdateStatus = async (id: string, status: LetterStatus) => {
    if (!canMutateTab('archive')) {
      showToast('Wewenang terbatas: Hanya Sekretaris atau Ketua yang dapat mengubah status surat');
      return;
    }
    try {
      const res = await fetch('/api/letters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setLetters((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
        showToast(`Status surat berhasil diubah ke: ${status}`);
      }
    } catch {
      showToast('Gagal memperbarui status surat');
    }
  };

  const handleVerifyApproval = async (id: string, status: ApprovalStatus, notes?: string) => {
    try {
      const res = await fetch('/api/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          dispositionNotes: notes,
          verifiedBy: `${currentUser.title} (${currentUser.name})`,
        }),
      });
      if (res.ok) {
        fetchApprovals();
        showToast(
          status === 'DISETUJUI'
            ? 'Disposisi pengesahan satu pintu telah disetujui!'
            : 'Pengajuan dikembalikan untuk revisi pengurus'
        );
      }
    } catch {
      showToast('Gagal memproses verifikasi disposisi');
    }
  };

  const handleSubmitNewApproval = async (data: {
    type: ApprovalType;
    title: string;
    description: string;
    amount?: number;
    category?: string;
  }) => {
    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          submittedBy: currentUser.name,
          submittedRole: currentUser.title,
        }),
      });
      if (res.ok) {
        fetchApprovals();
        showToast('Pengajuan disposisi baru berhasil dikirim ke Ketua Umum');
      }
    } catch {
      showToast('Gagal mengirim pengajuan disposisi');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold border border-slate-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => setActiveTab(tab)}
        onOpenCreateLetter={handleOpenCreateLetter}
        onOpenCreateJamaah={handleOpenCreateJamaah}
        onOpenCreateTransaction={handleOpenCreateTransaction}
        onOpenCreateAsset={handleOpenCreateAsset}
        onOpenSwitchRole={() => setIsLoginModalOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onOpenCreate={handleOpenCreateLetter}
          onOpenSwitchRole={() => setIsLoginModalOpen(true)}
          onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
          pendingApprovalsCount={pendingApprovalsCount}
          globalSearchQuery={globalSearchQuery}
          onGlobalSearchChange={setGlobalSearchQuery}
        />

        {/* Mode Pengawas & Role Alert Banner */}
        <RoleBanner
          onOpenSwitchRole={() => setIsLoginModalOpen(true)}
          onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
        />

        <main className="p-6 md:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Prioritas 3: Indikator Persistensi Basis Data */}
          <PersistenceBanner onOpenBackupModal={() => setIsBackupModalOpen(true)} />

          {/* Dynamic Module Header Banner */}
          <div
            className={`text-white rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden transition-all duration-300 ${
              isReportsTab || isApprovalsTab
                ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 shadow-indigo-950/20'
                : isFinanceTab || isDonorsTab
                ? 'bg-gradient-to-r from-amber-950 via-amber-900 to-slate-900 shadow-amber-950/20'
                : isAssetTab
                ? 'bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 shadow-slate-950/20'
                : isJamaahTab
                ? 'bg-gradient-to-r from-teal-950 via-teal-900 to-emerald-950 shadow-teal-950/20'
                : 'bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 shadow-emerald-950/20'
            }`}
          >
            {/* Watermark Logo */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden md:block select-none">
              <Image
                src="/logo-babul-khaer.png"
                alt="Watermark Logo Masjid Babul Khaer"
                width={240}
                height={240}
                className="object-contain filter brightness-150"
              />
            </div>

            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold mb-3 border border-white/20 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {isDashboardTab
                    ? 'Pusat Kendali Operasional & Informasi Terpadu'
                    : isReportsTab
                    ? 'Modul Laporan Pertanggungjawaban (LPJ) & Evaluasi 4 Pilar'
                    : isApprovalsTab
                    ? 'Alur Pengesahan Satu Pintu (Approval & Disposisi Ketua Umum)'
                    : isFinanceTab
                    ? 'Pengelolaan Keuangan & Swadaya PHBI Satu Pintu'
                    : isDonorsTab
                    ? 'Kelola Infaq & Donatur Rutin Masjid Babul Khaer'
                    : isAssetTab
                    ? 'Inventarisasi Sarana Prasarana & Peringatan Servis Berkala'
                    : isJamaahTab
                    ? 'Sistem Basis Data Kependudukan & Jamaah Blok AE'
                    : 'Administrasi Persuratan Resmi & Kesekretariatan DKM'}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="w-11 h-11 rounded-2xl bg-white/95 p-1 shadow-soft-sm border border-white/40 flex items-center justify-center shrink-0">
                  <Image
                    src="/logo-babul-khaer.png"
                    alt="Logo Masjid Babul Khaer"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white leading-tight">
                    {isDashboardTab
                      ? 'Selamat Datang, Pengurus DKM Babul Khaer'
                      : 'Dewan Kemakmuran Masjid Babul Khaer'}
                  </h1>
                  <p className="text-xs text-emerald-200 font-medium">
                    Kompleks BTP Blok AE, Tamalanrea, Makassar • SIK-MBH Terpadu
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-100/90 leading-relaxed">
                {isDashboardTab
                  ? 'Pusat kendali operasional Masjid Babul Khaer BTP Blok AE Tamalanrea Makassar. Mengintegrasikan otomasi administrasi surat dinas, basis data sensus jamaah, transparansi kas & swadaya PHBI, hingga jadwal pemeliharaan inventaris fisik sarpras.'
                  : isReportsTab
                  ? 'Kompilasi otomatis data pertanggungjawaban tahunan dari 4 pilar bidang DKM, evaluasi kinerja oleh Dewan Penasehat, serta draf dokumen resmi siap cetak format A4.'
                  : isApprovalsTab
                  ? 'Alur disposisi dan pengesahan resmi oleh Ketua Umum untuk penerbitan surat dinas keluar, pencairan anggaran swadaya PHBI, pengadaan sarpras, dan draf LPJ.'
                  : isFinanceTab
                  ? 'Transparansi mutasi kas DKM Kompleks BTP Blok AE: Pemisahan tegas antara Kas Operasional Rutin, Dana Swadaya Kegiatan PHBI (satu pintu), dan Rekapitulasi ZISWAF umat.'
                  : isDonorsTab
                  ? 'Manajemen donatur tetap bulanan (infaq operasional, beasiswa yatim, zakat mal, PHBI) dengan integrasi 1-klik setor kas masjid dan pemantauan tertib komitmen donasi.'
                  : isAssetTab
                  ? 'Katalog sarana & prasarana fisik masjid (AC duduk Daikin, genset silent 5500W, sound system, karpet shaf) lengkap dengan pemantauan otomatis jadwal servis berkala.'
                  : isJamaahTab
                  ? 'Basis data terpadu warga Kompleks BTP Blok AE untuk pemetaan jamaah, pendataan mustahiq zakat, penyaluran bantuan sosial darurat, dan koordinasi dakwah keumatan.'
                  : 'Kelola penomoran surat resmi secara otomatis, telusuri e-arsip dokumen kesekretariatan, susun draf dinas Islami via Gemini AI, dan ekstrak notulensi rapat jadi daftar tugas terstruktur.'}
              </p>

              {/* Banner Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {isReadOnly ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900/60 border border-purple-400/40 text-purple-200 text-xs font-semibold shadow-md">
                    <Eye className="w-4 h-4 text-purple-300" />
                    <span>Mode Pengawas: Akses Khusus Tinjauan Independen & Pengawasan Sistem</span>
                  </div>
                ) : isDashboardTab ? (
                  <>
                    <button
                      onClick={handleOpenCreateLetter}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-emerald-700" />
                      <span>Buat Surat Dinas</span>
                    </button>
                    <button
                      onClick={handleOpenCreateJamaah}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-teal-950" />
                      <span>Registrasi Warga</span>
                    </button>
                    <button
                      onClick={handleOpenCreateTransaction}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-amber-950" />
                      <span>Catat Kas Masuk/Keluar</span>
                    </button>
                  </>
                ) : isFinanceTab ? (
                  <>
                    <button
                      onClick={handleOpenCreateTransaction}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Catat Mutasi Kas Baru</span>
                    </button>
                    <button
                      onClick={() => setIsFridayReportOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <span>Laporan Kas Jumat</span>
                    </button>
                  </>
                ) : isDonorsTab ? (
                  <>
                    <button
                      onClick={() => setIsCreateDonorOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Daftarkan Donatur Tetap</span>
                    </button>
                  </>
                ) : isAssetTab ? (
                  <>
                    <button
                      onClick={handleOpenCreateAsset}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Daftarkan Aset Baru</span>
                    </button>
                    <button
                      onClick={() => setAssetOnlyDueFilter(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <Wrench className="w-4 h-4 text-amber-300" />
                      <span>Jatuh Tempo Servis ({assetStats?.maintenanceDueCount || 0})</span>
                    </button>
                  </>
                ) : isJamaahTab ? (
                  <>
                    <button
                      onClick={handleOpenCreateJamaah}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Registrasi Warga Baru</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStatus('MUSTAHIQ_ALL');
                        setActiveTab('mustahiq');
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-800/80 hover:bg-teal-700/80 text-white border border-teal-600/50 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <HeartHandshake className="w-4 h-4 text-amber-300" />
                      <span>Data Mustahiq & Bansos</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleOpenCreateLetter}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-emerald-700" />
                      <span>Buat Surat Resmi Baru</span>
                    </button>
                    <button
                      onClick={() => setIsArchiveLetterModalOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Archive className="w-4 h-4" />
                      <span>Catat Arsip Keluar</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('minutes')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-700/80 text-white border border-emerald-600/50 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Ekstraksi Notulensi AI</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic Top Stats Grid based on active module */}
          {isDashboardTab ? (
            <DashboardSummaryGrid
              totalLetters={totalLetters}
              approvedCount={approvedCount}
              invitationCount={invitationCount}
              totalJamaah={jamaahList.length}
              jamaahStats={jamaahStats}
              financeSummary={financeSummary}
              totalAssets={assets.length}
              assetStats={assetStats}
              overallScore={overallScore}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          ) : isReportsTab || isApprovalsTab ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Indeks Kesehatan DKM
                  </p>
                  <p className="text-2xl font-black text-indigo-900 mt-1">
                    {overallScore !== null ? `${overallScore}%` : <span className="animate-pulse text-indigo-300">...</span>}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    Predikat: {overallGrade}
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status Draf LPJ
                  </p>
                  <p className="text-xl font-bold text-slate-900 mt-1">
                    Siap Disahkan
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    4 Pilar Teragregasi
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Disposisi Menunggu
                  </p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">
                    {pendingApprovalsCount} <span className="text-xs font-normal text-amber-700">Pengajuan</span>
                  </p>
                  <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                    Otoritas Ketua Umum
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pengesahan Disetujui
                  </p>
                  <p className="text-2xl font-bold text-emerald-800 mt-1">
                    {approvals.filter((a) => a.status === 'DISETUJUI').length} <span className="text-xs font-normal text-emerald-600">Dokumen</span>
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    Tercatat di Jejak Audit
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          ) : isFinanceTab ? (
            <FinanceStatsCards
              summary={financeSummary}
              selectedCategory={financeCategoryFilter}
              onSelectCategory={setFinanceCategoryFilter}
            />
          ) : isAssetTab ? (
            <AssetStatsCards
              stats={assetStats}
              dueAssets={assets.filter((a) => a.isMaintenanceDue)}
              selectedCategory={assetCategoryFilter}
              onSelectCategory={setAssetCategoryFilter}
              onFilterDueOnly={() => setAssetOnlyDueFilter(true)}
              onRecordMaintenance={(asset) => handleRecordMaintenance(asset.id)}
            />
          ) : isJamaahTab ? (
            <JamaahStatsCards
              stats={jamaahStats}
              selectedRT={selectedRT}
              onSelectRT={setSelectedRT}
              selectedStatus={selectedStatus}
              onSelectStatus={setSelectedStatus}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Surat Terbit
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {totalLetters}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    Tersimpan di E-Arsip
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Surat Undangan
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {invitationCount}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    PHBI & Musyawarah
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Inbox className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Surat Disahkan
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {approvedCount}
                  </p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                    Disetujui / Terkirim
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <FileCheck2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tugas Rapat Berjalan
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {totalActiveTasks}
                  </p>
                  <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                    Menunggu Penyelesaian
                  </p>
                </div>
                <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <ListTodo className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {/* Module Tab Selector Bar - Soft UI Segmented Container */}
          <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center gap-1.5 shadow-2xs">
            {/* Dashboard Pill */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-white text-emerald-900 shadow-soft-sm ring-1 ring-emerald-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pusat Kendali (Dashboard)</span>
            </button>

            {/* Administrasi & Persuratan */}
            {canAccessTab('archive') && (
              <button
                onClick={() => setActiveTab('archive')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'archive'
                    ? 'bg-white text-emerald-900 shadow-soft-sm ring-1 ring-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Inbox className="w-3.5 h-3.5 text-emerald-600" />
                <span>E-Arsip Surat ({letters.length})</span>
              </button>
            )}

            {canAccessTab('minutes') && (
              <button
                onClick={() => setActiveTab('minutes')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'minutes'
                    ? 'bg-white text-emerald-900 shadow-soft-sm ring-1 ring-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Notulensi Rapat AI</span>
              </button>
            )}

            {/* Database Jamaah & Sosial */}
            {canAccessTab('jamaah') && (
              <button
                onClick={() => {
                  setActiveTab('jamaah');
                  setSelectedStatus('ALL');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'jamaah'
                    ? 'bg-white text-teal-900 shadow-soft-sm ring-1 ring-teal-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-teal-600" />
                <span>Basis Data Warga ({jamaahList.length})</span>
              </button>
            )}

            {canAccessTab('mustahiq') && (
              <button
                onClick={() => {
                  setActiveTab('mustahiq');
                  setSelectedStatus('MUSTAHIQ_ALL');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'mustahiq'
                    ? 'bg-white text-teal-900 shadow-soft-sm ring-1 ring-teal-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                <span>Mustahiq ZISWAF</span>
              </button>
            )}

            {/* Keuangan & Swadaya */}
            {canAccessTab('finance') && (
              <button
                onClick={() => setActiveTab('finance')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'finance'
                    ? 'bg-white text-amber-900 shadow-soft-sm ring-1 ring-amber-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="font-bold text-amber-600">Rp</span>
                <span>Buku Kas Satu Pintu</span>
              </button>
            )}

            {canAccessTab('donors') && (
              <button
                onClick={() => setActiveTab('donors')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'donors'
                    ? 'bg-white text-teal-900 shadow-soft-sm ring-1 ring-teal-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                <span>Donatur Rutin ({donors.length})</span>
              </button>
            )}

            {/* Sarpras Fisik */}
            {canAccessTab('assets') && (
              <button
                onClick={() => setActiveTab('assets')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'assets'
                    ? 'bg-white text-emerald-900 shadow-soft-sm ring-1 ring-emerald-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                <span>Inventaris Sarpras ({assets.length})</span>
              </button>
            )}

            {/* Laporan & Pengesahan */}
            {canAccessTab('reports') && (
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'reports'
                    ? 'bg-white text-indigo-900 shadow-soft-sm ring-1 ring-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Evaluasi & LPJ</span>
              </button>
            )}

            {canAccessTab('approvals') && (
              <button
                onClick={() => setActiveTab('approvals')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'approvals'
                    ? 'bg-white text-indigo-900 shadow-soft-sm ring-1 ring-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Pengesahan Satu Pintu ({pendingApprovalsCount})</span>
              </button>
            )}

            {/* Akses & Keamanan */}
            <div className="ml-auto flex items-center gap-1.5 pl-2">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50/80 hover:bg-purple-100 border border-purple-200/60 transition-all cursor-pointer flex items-center gap-1.5"
                title="Beralih Akun / Peran Pengurus"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600" />
                <span className="hidden md:inline">Ganti Akun</span>
              </button>

              {(currentUser.role === 'DEWAN_PENGAWAS' || currentUser.role === 'KETUA_UMUM') && (
                <button
                  onClick={() => setIsAuditLogModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  title="Lihat Log Audit Aktivitas Sistem"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Log Audit</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Tab Content */}
          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-xs font-medium">Memuat data sistem informasi DKM Babul Khaer...</p>
            </div>
          ) : (
            <>
              {/* Menu Utama: Pusat Kendali (Dashboard) */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column (8 of 12 cols): Recent Activities & Operations */}
                    <div className="lg:col-span-8 space-y-6">
                      <DashboardSekretariatCard
                        letters={letters}
                        minutes={minutes}
                        onNavigateTab={(tab) => setActiveTab(tab)}
                        onPreviewLetter={(l) => setPreviewLetter(l)}
                      />

                      <DashboardKeuanganCard
                        financeSummary={financeSummary}
                        onOpenFridayReport={() => setIsFridayReportOpen(true)}
                      />
                    </div>

                    {/* Right Column (4 of 12 cols): Quick Actions & System Highlights */}
                    <div className="lg:col-span-4 space-y-6">
                      <DashboardQuickActions
                        onOpenCreateLetter={handleOpenCreateLetter}
                        onOpenCreateJamaah={handleOpenCreateJamaah}
                        onOpenCreateTransaction={handleOpenCreateTransaction}
                        onOpenFridayReport={() => setIsFridayReportOpen(true)}
                        onOpenArchiveLetterModal={() => setIsArchiveLetterModalOpen(true)}
                        onNavigateTab={(tab) => setActiveTab(tab)}
                        lpjReport={lpjReport}
                        onPreviewLPJ={(rep) => setPreviewLPJ(rep)}
                      />

                      <DashboardSarprasCard
                        assets={assets}
                        assetStats={assetStats}
                        onNavigateTab={(tab) => setActiveTab(tab)}
                      />

                      <DashboardKpiCard
                        overallScore={overallScore}
                        overallGrade={overallGrade}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Administrasi: E-Arsip */}
              {activeTab === 'archive' && (
                <div className="space-y-4">
                  <LetterArchiveTable
                    letters={letters}
                    onPreviewLetter={(letter) => setPreviewLetter(letter)}
                    onUpdateStatus={handleUpdateStatus}
                    onOpenArchiveModal={() => setIsArchiveLetterModalOpen(true)}
                    isReadOnly={isReadOnly}
                    externalSearchTerm={globalSearchQuery}
                  />
                </div>
              )}

              {/* Administrasi: Notulensi AI */}
              {activeTab === 'minutes' && (
                <div className="space-y-4">
                  <MinutesExtractor initialMinutes={minutes} />
                </div>
              )}

              {/* Database Jamaah & Mustahiq */}
              {(activeTab === 'jamaah' || activeTab === 'mustahiq') && (
                <div className="space-y-4">
                  <JamaahTable
                    jamaahList={jamaahList}
                    selectedRT={selectedRT}
                    onSelectRT={setSelectedRT}
                    selectedStatus={selectedStatus}
                    onSelectStatus={setSelectedStatus}
                    onViewDetail={(j) => setDetailJamaah(j)}
                    onEdit={handleEditJamaah}
                    onOpenCreate={handleOpenCreateJamaah}
                    onOpenExcelModal={() => setIsExcelModalOpen(true)}
                    isReadOnly={isReadOnly}
                    externalSearchTerm={globalSearchQuery}
                  />
                </div>
              )}

              {/* Keuangan: Buku Kas */}
              {activeTab === 'finance' && (
                <div className="space-y-4">
                  <TransactionTable
                    transactions={transactions}
                    selectedCategory={financeCategoryFilter}
                    selectedType={financeTypeFilter}
                    onSelectCategory={setFinanceCategoryFilter}
                    onSelectType={setFinanceTypeFilter}
                    onOpenCreate={handleOpenCreateTransaction}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    isReadOnly={isReadOnly}
                    externalSearchTerm={globalSearchQuery}
                  />
                </div>
              )}

              {/* Keuangan: Donatur Rutin */}
              {activeTab === 'donors' && (
                <div className="space-y-4">
                  <DonorTable
                    donors={donors}
                    donorStats={donorStats || {
                      totalDonors: 0,
                      activeDonors: 0,
                      monthlyPotential: 0,
                      currentMonthCollected: 0,
                      paidThisMonthCount: 0,
                      unpaidThisMonthCount: 0,
                    }}
                    onDonorSaved={() => {
                      fetchDonors();
                      showToast('Data donatur berhasil disimpan');
                    }}
                    onDonorDeleted={() => {
                      fetchDonors();
                      showToast('Donatur berhasil dihapus');
                    }}
                    isExternalCreateOpen={isCreateDonorOpen}
                    onCloseExternalCreate={() => setIsCreateDonorOpen(false)}
                    onPaymentRecorded={() => {
                      fetchDonors();
                      fetchFinance();
                      showToast('Setoran donasi berhasil dicatat ke Kas Operasional Masjid!');
                    }}
                    isReadOnly={isReadOnly}
                    externalSearchTerm={globalSearchQuery}
                  />
                </div>
              )}

              {/* Sarpras: Katalog Aset */}
              {activeTab === 'assets' && (
                <div className="space-y-4">
                  <AssetTable
                    assets={assets}
                    selectedCategory={assetCategoryFilter}
                    onSelectCategory={setAssetCategoryFilter}
                    selectedCondition={assetConditionFilter}
                    onSelectCondition={setAssetConditionFilter}
                    onlyDue={assetOnlyDueFilter}
                    onToggleOnlyDue={setAssetOnlyDueFilter}
                    onOpenCreate={handleOpenCreateAsset}
                    onEdit={handleEditAsset}
                    onDelete={handleDeleteAsset}
                    onRecordMaintenance={(asset) => handleRecordMaintenance(asset.id)}
                    isReadOnly={isReadOnly}
                    externalSearchTerm={globalSearchQuery}
                  />
                </div>
              )}

              {/* Laporan: Evaluasi & LPJ */}
              {activeTab === 'reports' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setReportsSubView('generator')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          reportsSubView === 'generator'
                            ? 'bg-indigo-900 text-white shadow-soft-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Dokumen LPJ Resmi (Format Cetak A4)</span>
                      </button>

                      <button
                        onClick={() => setReportsSubView('kpi')}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          reportsSubView === 'kpi'
                            ? 'bg-indigo-900 text-white shadow-soft-sm'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Evaluasi Kinerja & KPI 4 Pilar</span>
                      </button>
                    </div>

                    {lpjReport && (
                      <button
                        onClick={() => setPreviewLPJ(lpjReport)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Format Cetak A4</span>
                      </button>
                    )}
                  </div>

                  {reportsSubView === 'generator' ? (
                    <LPJGenerator
                      initialReport={lpjReport}
                      onPreviewLPJ={(rep) => setPreviewLPJ(rep)}
                      onRefreshData={fetchReports}
                    />
                  ) : (
                    <ExecutiveKPI
                      kpis={kpis}
                      overallScore={overallScore || 0}
                      overallGrade={overallGrade}
                      onOpenLPJGenerator={() => setReportsSubView('generator')}
                    />
                  )}
                </div>
              )}

              {/* Pengesahan: Alur Disposisi Satu Pintu Ketua Umum */}
              {activeTab === 'approvals' && (
                <div className="space-y-4">
                  <ApprovalBoard
                    approvals={approvals}
                    onVerify={handleVerifyApproval}
                    onSubmitNewApproval={handleSubmitNewApproval}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Modal Dialogs                                        */}
      {/* ---------------------------------------------------- */}

      {/* Modal Buat Surat */}
      <CreateLetterModal
        isOpen={isCreateLetterOpen}
        onClose={() => setIsCreateLetterOpen(false)}
        onLetterCreated={handleLetterCreated}
        onPreviewLetter={(letter) => setPreviewLetter(letter)}
      />

      {/* Modal Pratinjau Dokumen Resmi A4 */}
      <OfficialLetterPreview
        letter={previewLetter}
        onClose={() => setPreviewLetter(null)}
      />

      {/* Modal Catat Arsip Surat Keluar Fisik / Lampau */}
      <ArchiveLetterModal
        isOpen={isArchiveLetterModalOpen}
        onClose={() => setIsArchiveLetterModalOpen(false)}
        onLetterArchived={handleArchiveLetterSaved}
      />

      {/* Modal Form Tambah / Edit Profil Jamaah */}
      <JamaahFormModal
        isOpen={isJamaahFormOpen}
        onClose={() => setIsJamaahFormOpen(false)}
        initialData={editingJamaah}
        onSaved={handleJamaahSaved}
      />

      {/* Modal Detail Profil Jamaah */}
      <JamaahDetailModal
        jamaah={detailJamaah}
        onClose={() => setDetailJamaah(null)}
        onEdit={(j) => {
          setDetailJamaah(null);
          handleEditJamaah(j);
        }}
      />

      {/* Modal Impor & Ekspor Sensus Excel */}
      <JamaahExcelModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        currentJamaahList={jamaahList}
        onImportSuccess={handleImportSuccess}
      />

      {/* Modal Laporan Kas Mingguan Sholat Jumat */}
      <FridayReportModal
        isOpen={isFridayReportOpen}
        onClose={() => setIsFridayReportOpen(false)}
        transactions={transactions}
      />

      {/* Modal Catat Transaksi Kas */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        initialData={editingTransaction}
        onSaved={handleTransactionSaved}
      />

      {/* Modal Form Tambah / Edit Aset Sarpras */}
      <AssetFormModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        initialData={editingAsset}
        onSaved={handleAssetSaved}
      />

      {/* Modal Pratinjau Dokumen Cetak LPJ A4 */}
      <LPJPreviewModal
        report={previewLPJ}
        onClose={() => setPreviewLPJ(null)}
      />

      {/* Modal Pergantian Peran / Login Akun Pengurus */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccessToast={showToast}
      />

      {/* Modal Log Audit Aktivitas Sistem */}
      <AuditLogModal
        isOpen={isAuditLogModalOpen}
        onClose={() => setIsAuditLogModalOpen(false)}
      />

      {/* Modal Pusat Cadangan & Pemulihan Basis Data */}
      <DatabaseBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={() => {
          refreshAll();
          showToast('Data berhasil dipulihkan dari berkas cadangan!');
        }}
      />
    </div>
  );
}
