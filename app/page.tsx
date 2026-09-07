'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Sidebar, { AppNavTab } from '@/components/layout/sidebar';
import BottomNavBar from '@/components/layout/bottom-nav-bar';
import { TAB_LABELS } from '@/types/navigation';
import Navbar from '@/components/layout/navbar';
import { ModuleHeaderBanner } from '@/components/layout/module-header-banner';
import { ModuleTabSelector } from '@/components/layout/module-tab-selector';
import { AppModals } from '@/components/modals/app-modals';
import {
  setTabNavigationHandler,
  pushTabHistory,
  replaceTabHistory,
  useModalBackHandler,
} from '@/lib/back-button-handler';

// Phase 1 Components
import LetterArchiveTable from '@/components/letters/letter-archive-table';
import MinutesExtractor from '@/components/letters/minutes-extractor';

// Phase 2 Components
import JamaahStatsCards from '@/components/jamaah/jamaah-stats';
import JamaahTable from '@/components/jamaah/jamaah-table';

// Keuangan & Sarpras Components
import FinanceStatsCards from '@/components/finance/finance-stats';
import TransactionTable from '@/components/finance/transaction-table';
import DonorTable from '@/components/finance/donor-table';
import CashflowRunwayAlert from '@/components/finance/cashflow-runway-alert';
import RakerBudgetTracker from '@/components/finance/raker-budget-tracker';
import DakwahView from '@/components/dakwah/dakwah-view';
import ZiswafView from '@/components/ziswaf/ziswaf-view';
import AssetStatsCards from '@/components/assets/asset-stats';
import SarprasView from '@/components/assets/sarpras-view';
import SuperAdminView from '@/components/admin/super-admin-view';

// Laporan & Eksekutif Components
import ExecutiveKPI from '@/components/reports/executive-kpi';
import LPJGenerator from '@/components/reports/lpj-generator';
import ApprovalBoard from '@/components/reports/approval-board';

// Keamanan & Auth
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { useConfirm } from '@/lib/confirm-context';
import RoleBanner from '@/components/auth/role-banner';
import FeatureLoginPortal from '@/components/auth/feature-login-portal';

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
  CheckCircle2,
  FileText,
  ListTodo,
  Loader2,
  BarChart3,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    currentUser,
    isReadOnly,
    canAccessTab,
    canMutateTab,
    isAuthenticated,
    logout,
  } = useAuth();
  const [requestedTab, setRequestedTab] = useState<AppNavTab>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as AppNavTab;
      if (hash && hash !== 'dashboard') return hash;
    }
    return 'dashboard';
  });
  const [tabHistory, setTabHistory] = useState<AppNavTab[]>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as AppNavTab;
      if (hash && hash !== 'dashboard') return ['dashboard'];
    }
    return [];
  });

  // Initialize browser history & hash routing on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash.replace('#', '') as AppNavTab;
    if (hash && hash !== 'dashboard' && canAccessTab(hash)) {
      replaceTabHistory('dashboard');
      pushTabHistory(hash);
    } else {
      replaceTabHistory('dashboard');
    }
  }, [canAccessTab]);

  // Connect central popstate dispatcher to tab navigation state
  useEffect(() => {
    setTabNavigationHandler((targetTab) => {
      const nextTab: AppNavTab = targetTab && canAccessTab(targetTab) ? targetTab : 'dashboard';
      setRequestedTab(nextTab);
      setTabHistory((prev) => (prev.length > 0 ? prev.slice(0, -1) : []));
    });

    return () => {
      setTabNavigationHandler(null);
    };
  }, [canAccessTab]);

  // History-aware navigation handler
  const handleNavigateTab = useCallback((newTab: AppNavTab) => {
    setRequestedTab((currentTab) => {
      if (currentTab !== newTab) {
        pushTabHistory(newTab);
        setTabHistory((prev) => [...prev, currentTab]);
      }
      return newTab;
    });
  }, []);

  // Back handler to return to previous menu
  const handleGoBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1 && requestedTab !== 'dashboard') {
      window.history.back();
    } else {
      handleNavigateTab('dashboard');
    }
  }, [requestedTab, handleNavigateTab]);

  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isFridayReportOpen, setIsFridayReportOpen] = useState(false);

  // Derived activeTab ensures user cannot be on a restricted tab
  const activeTab: AppNavTab = canAccessTab(requestedTab)
    ? requestedTab
    : 'dashboard';

  // Navigation labels
  const previousTab: AppNavTab = tabHistory.length > 0 ? tabHistory[tabHistory.length - 1] : 'dashboard';
  const previousTabLabel = TAB_LABELS[previousTab] || 'Menu Sebelumnya';
  const currentTabLabel = TAB_LABELS[activeTab] || 'Halaman Aktif';

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

  // Responsive Mobile Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  useModalBackHandler(isMobileMenuOpen, () => setIsMobileMenuOpen(false), 'mobile-menu-drawer');

  // Global Toast & Confirm Contexts
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const showToast = useCallback((msg: string, type?: 'success' | 'error' | 'warning' | 'info') => {
    const lower = msg.toLowerCase();
    if (type === 'error' || lower.includes('gagal') || lower.includes('tidak diizinkan') || lower.includes('terbatas')) {
      toast.error(msg);
    } else if (type === 'warning') {
      toast.warning(msg);
    } else {
      toast.success(msg);
    }
  }, [toast]);

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
  const isAssetTab = activeTab === 'assets';
  const isJamaahTab = activeTab === 'jamaah' || activeTab === 'mustahiq';
  const isReportsTab = activeTab === 'reports';
  const isApprovalsTab = activeTab === 'approvals';
  const isDakwahTab = activeTab === 'dakwah';

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
    const ok = await confirm({
      title: 'Hapus Transaksi Kas',
      message: `Yakin ingin menghapus transaksi kas "${desc}"? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: 'Hapus Transaksi',
      variant: 'danger',
    });
    if (!ok) return;

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
    const ok = await confirm({
      title: 'Hapus Inventaris Sarpras',
      message: `Yakin ingin menghapus inventaris sarpras "${name}"? Tindakan ini akan menghapus aset dari pembukuan masjid.`,
      confirmText: 'Hapus Aset',
      variant: 'danger',
    });
    if (!ok) return;

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

  if (!isAuthenticated) {
    return <FeatureLoginPortal onLoginSuccess={() => refreshAll()} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onOpenCreateLetter={handleOpenCreateLetter}
        onOpenCreateJamaah={handleOpenCreateJamaah}
        onOpenCreateTransaction={handleOpenCreateTransaction}
        onOpenCreateAsset={handleOpenCreateAsset}
        onOpenSwitchRole={() => setIsLoginModalOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenCreate={handleOpenCreateLetter}
          onOpenSwitchRole={() => logout()}
          onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
          pendingApprovalsCount={pendingApprovalsCount}
          globalSearchQuery={globalSearchQuery}
          onGlobalSearchChange={setGlobalSearchQuery}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          activeTab={activeTab}
          onGoBack={handleGoBack}
          previousTabLabel={previousTabLabel}
        />

        {/* Mode Pengawas & Role Alert Banner */}
        <RoleBanner
          onOpenSwitchRole={() => setIsLoginModalOpen(true)}
          onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
        />

        <main className="p-3.5 sm:p-5 md:p-8 pb-24 md:pb-8 space-y-4 sm:space-y-6 flex-1 max-w-7xl w-full mx-auto overflow-x-hidden">
          {/* Indikator Persistensi Basis Data (Khusus Super Admin) */}
          {currentUser.role === 'SUPER_ADMIN' && (
            <PersistenceBanner onOpenBackupModal={() => setIsBackupModalOpen(true)} />
          )}

          {/* Quick Back & Breadcrumb Bar (Visible when not on Dashboard) */}
          {activeTab !== 'dashboard' && (
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 bg-white/95 backdrop-blur-md p-2 sm:p-2.5 px-3 sm:px-4 rounded-2xl border border-slate-200/90 shadow-soft-sm animate-in fade-in slide-in-from-left-2 duration-200">
              <button
                type="button"
                onClick={handleGoBack}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold shadow-soft-sm hover:shadow-md transition-all cursor-pointer group shrink-0"
                title={`Kembali ke ${previousTabLabel}`}
              >
                <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="truncate max-w-[200px] sm:max-w-none">Kembali ke {previousTabLabel}</span>
              </button>

              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleNavigateTab('dashboard')}
                  className="hover:text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Pusat Kendali</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-bold text-slate-800 truncate">{currentTabLabel}</span>
              </nav>
            </div>
          )}

          {/* Dynamic Module Header Banner */}
          <ModuleHeaderBanner
            activeTab={activeTab}
            isReadOnly={isReadOnly}
            canMutateTab={canMutateTab}
            onOpenCreateLetter={handleOpenCreateLetter}
            onOpenCreateJamaah={handleOpenCreateJamaah}
            onOpenCreateTransaction={handleOpenCreateTransaction}
            onOpenCreateDonor={() => setIsCreateDonorOpen(true)}
            onOpenCreateAsset={handleOpenCreateAsset}
            onOpenArchiveLetterModal={() => setIsArchiveLetterModalOpen(true)}
            onOpenFridayReport={() => setIsFridayReportOpen(true)}
            onOpenMustahiq={() => {
              setSelectedStatus('MUSTAHIQ_ALL');
              handleNavigateTab('mustahiq');
            }}
            onOpenMinutes={() => handleNavigateTab('minutes')}
            assetStats={assetStats}
            onFilterAssetOnlyDue={() => setAssetOnlyDueFilter(true)}
            onGoBack={handleGoBack}
            previousTabLabel={previousTabLabel}
          />

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
              onNavigateTab={(tab) => handleNavigateTab(tab)}
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
          ) : isDakwahTab ? null : (
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
          <ModuleTabSelector
            activeTab={activeTab}
            setActiveTab={handleNavigateTab}
            canAccessTab={canAccessTab}
            lettersCount={letters.length}
            jamaahCount={jamaahList.length}
            donorsCount={donors.length}
            assetsCount={assets.length}
            pendingApprovalsCount={pendingApprovalsCount}
            onSelectStatus={(status) => setSelectedStatus(status)}
            onLogout={() => logout()}
            onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
            isAuditRole={currentUser.role === 'DEWAN_PENGAWAS' || currentUser.role === 'KETUA_UMUM'}
            onGoBack={handleGoBack}
            previousTabLabel={previousTabLabel}
          />

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
                      {canAccessTab('archive') && (
                        <DashboardSekretariatCard
                          letters={letters}
                          minutes={minutes}
                          onNavigateTab={(tab) => handleNavigateTab(tab)}
                          onPreviewLetter={(l) => setPreviewLetter(l)}
                        />
                      )}

                      {canAccessTab('finance') && (
                        <DashboardKeuanganCard
                          financeSummary={financeSummary}
                          onOpenFridayReport={() => setIsFridayReportOpen(true)}
                        />
                      )}
                    </div>

                    {/* Right Column (4 of 12 cols): Quick Actions & System Highlights */}
                    <div className="lg:col-span-4 space-y-6">
                      <DashboardQuickActions
                        onOpenCreateLetter={handleOpenCreateLetter}
                        onOpenCreateJamaah={handleOpenCreateJamaah}
                        onOpenCreateTransaction={handleOpenCreateTransaction}
                        onOpenFridayReport={() => setIsFridayReportOpen(true)}
                        onOpenArchiveLetterModal={() => setIsArchiveLetterModalOpen(true)}
                        onNavigateTab={(tab) => handleNavigateTab(tab)}
                        lpjReport={lpjReport}
                        onPreviewLPJ={(rep) => setPreviewLPJ(rep)}
                      />

                      {canAccessTab('assets') && (
                        <DashboardSarprasCard
                          assets={assets}
                          assetStats={assetStats}
                          onNavigateTab={(tab) => handleNavigateTab(tab)}
                        />
                      )}

                      {canAccessTab('reports') && (
                        <DashboardKpiCard
                          overallScore={overallScore}
                          overallGrade={overallGrade}
                        />
                      )}
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

              {/* Database Jamaah Sensus 5 RT */}
              {activeTab === 'jamaah' && (
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

              {/* Bidang III: ZISWAF, Program Sedekah Seribu Sehari (SSS) & Bansos 5 RT */}
              {activeTab === 'mustahiq' && (
                <div className="space-y-4">
                  <ZiswafView jamaahList={jamaahList} />
                </div>
              )}

              {/* Keuangan: Buku Kas */}
              {activeTab === 'finance' && (
                <div className="space-y-6">
                  {/* Prioritas 1: Peringatan Dini Defisit & Analisis Runway Kas */}
                  <CashflowRunwayAlert />

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

                  {/* Prioritas 1: Monitoring Pagu Anggaran Raker (Budget vs Actual) */}
                  <RakerBudgetTracker />
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

              {/* Sarpras: Tracker Proyek Fisik Raker 2026, Katalog Aset & Pemeliharaan */}
              {activeTab === 'assets' && (
                <div className="space-y-4">
                  <SarprasView
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

              {/* Dakwah: Manajemen Jadwal Khatib, Rawatib, Kajian, Ramadhan */}
              {activeTab === 'dakwah' && (
                <div className="space-y-4">
                  <DakwahView />
                </div>
              )}

              {/* Super Admin: Database Cloud Turso, Cadangkan/Pulihkan & Kelola Akun/PIN */}
              {activeTab === 'superadmin' && (
                <div className="space-y-4">
                  <SuperAdminView
                    onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
                    onOpenBackupModal={() => setIsBackupModalOpen(true)}
                  />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ---------------------------------------------------- */}
      {/* Mobile Fixed Bottom Navigation Bar (< md)            */}
      {/* ---------------------------------------------------- */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onOpenCreateLetter={handleOpenCreateLetter}
        onOpenCreateJamaah={handleOpenCreateJamaah}
        onOpenCreateTransaction={handleOpenCreateTransaction}
        onOpenCreateAsset={handleOpenCreateAsset}
        onOpenSwitchRole={() => setIsLoginModalOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        pendingApprovalsCount={pendingApprovalsCount}
      />

      {/* ---------------------------------------------------- */}
      {/* Modal Dialogs                                        */}
      {/* ---------------------------------------------------- */}
      <AppModals
        isCreateLetterOpen={isCreateLetterOpen}
        setIsCreateLetterOpen={setIsCreateLetterOpen}
        previewLetter={previewLetter}
        setPreviewLetter={setPreviewLetter}
        handleLetterCreated={handleLetterCreated}
        isArchiveLetterModalOpen={isArchiveLetterModalOpen}
        setIsArchiveLetterModalOpen={setIsArchiveLetterModalOpen}
        handleArchiveLetterSaved={handleArchiveLetterSaved}
        isJamaahFormOpen={isJamaahFormOpen}
        setIsJamaahFormOpen={setIsJamaahFormOpen}
        editingJamaah={editingJamaah}
        handleJamaahSaved={handleJamaahSaved}
        detailJamaah={detailJamaah}
        setDetailJamaah={setDetailJamaah}
        handleEditJamaah={handleEditJamaah}
        isExcelModalOpen={isExcelModalOpen}
        setIsExcelModalOpen={setIsExcelModalOpen}
        jamaahList={jamaahList}
        handleImportSuccess={handleImportSuccess}
        isFridayReportOpen={isFridayReportOpen}
        setIsFridayReportOpen={setIsFridayReportOpen}
        transactions={transactions}
        isTransactionModalOpen={isTransactionModalOpen}
        setIsTransactionModalOpen={setIsTransactionModalOpen}
        editingTransaction={editingTransaction}
        handleTransactionSaved={handleTransactionSaved}
        isAssetModalOpen={isAssetModalOpen}
        setIsAssetModalOpen={setIsAssetModalOpen}
        editingAsset={editingAsset}
        handleAssetSaved={handleAssetSaved}
        previewLPJ={previewLPJ}
        setPreviewLPJ={setPreviewLPJ}
        isLoginModalOpen={isLoginModalOpen}
        setIsLoginModalOpen={setIsLoginModalOpen}
        onSuccessLoginToast={showToast}
        isAuditLogModalOpen={isAuditLogModalOpen}
        setIsAuditLogModalOpen={setIsAuditLogModalOpen}
        isBackupModalOpen={isBackupModalOpen}
        setIsBackupModalOpen={setIsBackupModalOpen}
        onDataRestored={() => {
          refreshAll();
          showToast('Data berhasil dipulihkan dari berkas cadangan!');
        }}
      />
    </div>
  );
}
