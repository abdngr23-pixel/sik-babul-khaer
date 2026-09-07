'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Sidebar, { AppNavTab } from '@/components/layout/sidebar';
import BottomNavBar from '@/components/layout/bottom-nav-bar';
import { TAB_LABELS } from '@/types/navigation';
import Navbar from '@/components/layout/navbar';
import { ModuleHeaderBanner } from '@/components/layout/module-header-banner';
import { ModuleTabSelector } from '@/components/layout/module-tab-selector';
import MainContentRouter from '@/components/dashboard/main-content-router';
import AppModalsContainer from '@/components/dashboard/app-modals-container';
import PersistenceBanner from '@/components/dashboard/persistence-banner';
import RoleBanner from '@/components/auth/role-banner';
import FeatureLoginPortal from '@/components/auth/feature-login-portal';

import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { useConfirm } from '@/lib/confirm-context';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import { useAppModals } from '@/hooks/useAppModals';
import { useAppHandlers } from '@/hooks/useAppHandlers';
import {
  setTabNavigationHandler,
  pushTabHistory,
  replaceTabHistory,
  useModalBackHandler,
} from '@/lib/back-button-handler';

import { ArrowLeft, ChevronRight, LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  const {
    currentUser,
    isReadOnly,
    canAccessTab,
    canMutateTab,
    isAuthenticated,
    logout,
  } = useAuth();

  // Tab & History State
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

  // Filters & Search State
  const filters = useDashboardFilters();

  // Contexts
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

  // Modals State
  const modals = useAppModals();
  useModalBackHandler(modals.isMobileMenuOpen, () => modals.setIsMobileMenuOpen(false), 'mobile-menu-drawer');

  // Data Stats Hook
  const stats = useDashboardStats();

  // Action Handlers Hook
  const handlers = useAppHandlers({
    currentUser,
    isReadOnly,
    canMutateTab,
    showToast,
    confirm,
    fetchLetters: stats.fetchLetters,
    fetchJamaah: stats.fetchJamaah,
    fetchFinance: stats.fetchFinance,
    fetchAssets: stats.fetchAssets,
    fetchApprovals: stats.fetchApprovals,
    setLetters: stats.setLetters,
    setIsCreateLetterOpen: modals.setIsCreateLetterOpen,
    setEditingJamaah: modals.setEditingJamaah,
    setIsJamaahFormOpen: modals.setIsJamaahFormOpen,
    setEditingTransaction: modals.setEditingTransaction,
    setIsTransactionModalOpen: modals.setIsTransactionModalOpen,
    setEditingAsset: modals.setEditingAsset,
    setIsAssetModalOpen: modals.setIsAssetModalOpen,
  });

  // Browser History & Popstate synchronization
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

  const handleNavigateTab = useCallback((newTab: AppNavTab) => {
    setRequestedTab((currentTab) => {
      if (currentTab !== newTab) {
        pushTabHistory(newTab);
        setTabHistory((prev) => [...prev, currentTab]);
      }
      return newTab;
    });
  }, []);

  const handleGoBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1 && requestedTab !== 'dashboard') {
      window.history.back();
    } else {
      handleNavigateTab('dashboard');
    }
  }, [requestedTab, handleNavigateTab]);

  // Derived Active Tab & Labels
  const activeTab: AppNavTab = canAccessTab(requestedTab) ? requestedTab : 'dashboard';
  const previousTab: AppNavTab = tabHistory.length > 0 ? tabHistory[tabHistory.length - 1] : 'dashboard';
  const previousTabLabel = TAB_LABELS[previousTab] || 'Menu Sebelumnya';
  const currentTabLabel = TAB_LABELS[activeTab] || 'Halaman Aktif';

  if (!isAuthenticated) {
    return <FeatureLoginPortal onLoginSuccess={() => stats.refreshAll()} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onOpenCreateLetter={handlers.handleOpenCreateLetter}
        onOpenCreateJamaah={handlers.handleOpenCreateJamaah}
        onOpenCreateTransaction={handlers.handleOpenCreateTransaction}
        onOpenCreateAsset={handlers.handleOpenCreateAsset}
        onOpenSwitchRole={() => modals.setIsLoginModalOpen(true)}
        onOpenAuditLogs={() => modals.setIsAuditLogModalOpen(true)}
        onOpenBackupModal={() => modals.setIsBackupModalOpen(true)}
        isMobileOpen={modals.isMobileMenuOpen}
        onCloseMobile={() => modals.setIsMobileMenuOpen(false)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenCreate={handlers.handleOpenCreateLetter}
          onOpenSwitchRole={() => logout()}
          onOpenAuditLogs={() => modals.setIsAuditLogModalOpen(true)}
          pendingApprovalsCount={stats.pendingApprovalsCount}
          globalSearchQuery={globalSearchQuery}
          onGlobalSearchChange={setGlobalSearchQuery}
          onToggleMobileMenu={() => modals.setIsMobileMenuOpen((prev) => !prev)}
          activeTab={activeTab}
          onGoBack={handleGoBack}
          previousTabLabel={previousTabLabel}
        />

        {/* Mode Pengawas & Role Alert Banner */}
        <RoleBanner
          onOpenSwitchRole={() => modals.setIsLoginModalOpen(true)}
          onOpenAuditLogs={() => modals.setIsAuditLogModalOpen(true)}
        />

        <main className="p-3.5 sm:p-5 md:p-8 pb-24 md:pb-8 space-y-4 sm:space-y-6 flex-1 max-w-7xl w-full mx-auto overflow-x-hidden">
          {/* Indikator Persistensi Basis Data (Khusus Super Admin) */}
          {currentUser.role === 'SUPER_ADMIN' && (
            <PersistenceBanner onOpenBackupModal={() => modals.setIsBackupModalOpen(true)} />
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
            onOpenCreateLetter={handlers.handleOpenCreateLetter}
            onOpenCreateJamaah={handlers.handleOpenCreateJamaah}
            onOpenCreateTransaction={handlers.handleOpenCreateTransaction}
            onOpenCreateDonor={() => modals.setIsCreateDonorOpen(true)}
            onOpenCreateAsset={handlers.handleOpenCreateAsset}
            onOpenArchiveLetterModal={() => modals.setIsArchiveLetterModalOpen(true)}
            onOpenFridayReport={() => modals.setIsFridayReportOpen(true)}
            onOpenMustahiq={() => {
              setSelectedStatus('MUSTAHIQ_ALL');
              handleNavigateTab('mustahiq');
            }}
            onOpenMinutes={() => handleNavigateTab('minutes')}
            assetStats={stats.assetStats}
            onFilterAssetOnlyDue={() => setAssetOnlyDueFilter(true)}
            onGoBack={handleGoBack}
            previousTabLabel={previousTabLabel}
          />

          {/* Module Tab Selector Bar */}
          <ModuleTabSelector
            activeTab={activeTab}
            setActiveTab={handleNavigateTab}
            canAccessTab={canAccessTab}
            lettersCount={stats.letters.length}
            jamaahCount={stats.jamaahList.length}
            donorsCount={stats.donors.length}
            assetsCount={stats.assets.length}
            pendingApprovalsCount={stats.pendingApprovalsCount}
            onSelectStatus={(status) => filters.setSelectedStatus(status)}
            onLogout={() => logout()}
            onOpenAuditLogs={() => modals.setIsAuditLogModalOpen(true)}
            isAuditRole={currentUser.role === 'DEWAN_PENGAWAS' || currentUser.role === 'KETUA_UMUM'}
            onGoBack={handleGoBack}
            previousTabLabel={previousTabLabel}
          />

          {/* Main Content Router for all Modules */}
          <MainContentRouter
            activeTab={activeTab}
            canAccessTab={canAccessTab}
            onNavigateTab={handleNavigateTab}
            globalSearchQuery={filters.globalSearchQuery}
            isReadOnly={isReadOnly}
            isLoading={stats.isLoading}
            letters={stats.letters}
            minutes={stats.minutes}
            jamaahList={stats.jamaahList}
            jamaahStats={stats.jamaahStats}
            transactions={stats.transactions}
            financeSummary={stats.financeSummary}
            donors={stats.donors}
            donorStats={stats.donorStats}
            assets={stats.assets}
            assetStats={stats.assetStats}
            approvals={stats.approvals}
            kpis={stats.kpis}
            overallScore={stats.overallScore}
            overallGrade={stats.overallGrade}
            lpjReport={stats.lpjReport}
            totalLetters={stats.totalLetters}
            approvedCount={stats.approvedCount}
            invitationCount={stats.invitationCount}
            pendingApprovalsCount={stats.pendingApprovalsCount}
            totalActiveTasks={stats.totalActiveTasks}
            selectedRT={filters.selectedRT}
            setSelectedRT={filters.setSelectedRT}
            selectedStatus={filters.selectedStatus}
            setSelectedStatus={filters.setSelectedStatus}
            financeCategoryFilter={filters.financeCategoryFilter}
            setFinanceCategoryFilter={filters.setFinanceCategoryFilter}
            financeTypeFilter={filters.financeTypeFilter}
            setFinanceTypeFilter={filters.setFinanceTypeFilter}
            assetCategoryFilter={filters.assetCategoryFilter}
            setAssetCategoryFilter={filters.setAssetCategoryFilter}
            assetConditionFilter={filters.assetConditionFilter}
            setAssetConditionFilter={filters.setAssetConditionFilter}
            assetOnlyDueFilter={filters.assetOnlyDueFilter}
            setAssetOnlyDueFilter={filters.setAssetOnlyDueFilter}
            reportsSubView={filters.reportsSubView}
            setReportsSubView={filters.setReportsSubView}
            onPreviewLetter={(l) => modals.setPreviewLetter(l)}
            onOpenCreateLetter={handlers.handleOpenCreateLetter}
            onUpdateLetterStatus={handlers.handleUpdateStatus}
            onOpenArchiveModal={() => modals.setIsArchiveLetterModalOpen(true)}
            onViewDetailJamaah={(j) => modals.setDetailJamaah(j)}
            onEditJamaah={handlers.handleEditJamaah}
            onOpenCreateJamaah={handlers.handleOpenCreateJamaah}
            onOpenExcelModal={() => modals.setIsExcelModalOpen(true)}
            onOpenCreateTransaction={handlers.handleOpenCreateTransaction}
            onEditTransaction={handlers.handleEditTransaction}
            onDeleteTransaction={handlers.handleDeleteTransaction}
            onOpenFridayReport={() => modals.setIsFridayReportOpen(true)}
            isCreateDonorOpen={modals.isCreateDonorOpen}
            onCloseCreateDonor={() => modals.setIsCreateDonorOpen(false)}
            onDonorSaved={() => {
              stats.fetchDonors();
              showToast('Data donatur berhasil disimpan');
            }}
            onDonorDeleted={() => {
              stats.fetchDonors();
              showToast('Donatur berhasil dihapus');
            }}
            onPaymentRecorded={() => {
              stats.fetchDonors();
              stats.fetchFinance();
              showToast('Setoran donasi berhasil dicatat ke Kas Operasional Masjid!');
            }}
            onOpenCreateAsset={handlers.handleOpenCreateAsset}
            onEditAsset={handlers.handleEditAsset}
            onDeleteAsset={handlers.handleDeleteAsset}
            onRecordMaintenance={(id) => handlers.handleRecordMaintenance(id)}
            onPreviewLPJ={(rep) => modals.setPreviewLPJ(rep)}
            onRefreshReports={stats.fetchReports}
            onVerifyApproval={handlers.handleVerifyApproval}
            onSubmitNewApproval={handlers.handleSubmitNewApproval}
            onOpenAuditLogs={() => modals.setIsAuditLogModalOpen(true)}
            onOpenBackupModal={() => modals.setIsBackupModalOpen(true)}
          />
        </main>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (< md) */}
      <BottomNavBar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onOpenCreateLetter={handlers.handleOpenCreateLetter}
        onOpenCreateJamaah={handlers.handleOpenCreateJamaah}
        onOpenCreateTransaction={handlers.handleOpenCreateTransaction}
        onOpenCreateAsset={handlers.handleOpenCreateAsset}
        onOpenSwitchRole={() => modals.setIsLoginModalOpen(true)}
        onOpenAuditLogs={() => modals.setIsAuditLogModalOpen(true)}
        onOpenBackupModal={() => modals.setIsBackupModalOpen(true)}
        pendingApprovalsCount={stats.pendingApprovalsCount}
      />

      {/* Modal Dialogs */}
      <AppModalsContainer
        modals={modals}
        handlers={handlers}
        stats={stats}
        showToast={showToast}
      />
    </div>
  );
}
