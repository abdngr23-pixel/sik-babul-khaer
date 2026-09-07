'use client';

import React from 'react';
import { AppNavTab } from '@/components/layout/sidebar';
import DashboardSummaryGrid from '@/components/dashboard/dashboard-summary-grid';
import DashboardSekretariatCard from '@/components/dashboard/dashboard-sekretariat-card';
import DashboardKeuanganCard from '@/components/dashboard/dashboard-keuangan-card';
import DashboardQuickActions from '@/components/dashboard/dashboard-quick-actions';
import DashboardSarprasCard from '@/components/dashboard/dashboard-sarpras-card';
import DashboardKpiCard from '@/components/dashboard/dashboard-kpi-card';
import FinanceStatsCards from '@/components/finance/finance-stats';
import AssetStatsCards from '@/components/assets/asset-stats';
import JamaahStatsCards from '@/components/jamaah/jamaah-stats';

import LetterArchiveTable from '@/components/letters/letter-archive-table';
import MinutesExtractor from '@/components/letters/minutes-extractor';
import JamaahTable from '@/components/jamaah/jamaah-table';
import ZiswafView from '@/components/ziswaf/ziswaf-view';
import TransactionTable from '@/components/finance/transaction-table';
import CashflowRunwayAlert from '@/components/finance/cashflow-runway-alert';
import RakerBudgetTracker from '@/components/finance/raker-budget-tracker';
import DonorTable from '@/components/finance/donor-table';
import SarprasView from '@/components/assets/sarpras-view';
import LPJGenerator from '@/components/reports/lpj-generator';
import ExecutiveKPI from '@/components/reports/executive-kpi';
import ApprovalBoard from '@/components/reports/approval-board';
import DakwahView from '@/components/dakwah/dakwah-view';
import SuperAdminView from '@/components/admin/super-admin-view';
import ProgramKerjaView from '@/components/executive/program-kerja-view';
import IntegratedMeetingModule from '@/components/minutes/integrated-meeting-module';
import { AdhocCommitteeView } from '@/components/organization/adhoc-committee-view';
import { TpaView } from '@/components/tpa/tpa-view';
import { UmkmView } from '@/components/umkm/umkm-view';
import LelangView from '@/components/lelang/lelang-view';
import GalleryView from '@/components/gallery/gallery-view';


import { OfficialLetter, LetterStatus } from '@/types/letter';
import { MeetingMinutes } from '@/types/letter';
import { Jamaah, JamaahStats } from '@/types/jamaah';
import { FinanceTransaction, FinanceSummary } from '@/types/finance';
import { DonorItem, DonorStats } from '@/types/donor';
import { AssetItem, AssetStats } from '@/types/asset';
import { ApprovalItem, ApprovalStatus, ApprovalType, FieldKPI, LPJReport } from '@/types/reports';

import {
  Inbox,
  FileCheck2,
  CheckCircle2,
  FileText,
  ListTodo,
  Loader2,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';

export interface MainContentRouterProps {
  activeTab: AppNavTab;
  canAccessTab: (tab: AppNavTab) => boolean;
  onNavigateTab: (tab: AppNavTab) => void;
  globalSearchQuery: string;
  isReadOnly: boolean;
  isLoading: boolean;

  // Data
  letters: OfficialLetter[];
  minutes: MeetingMinutes[];
  jamaahList: Jamaah[];
  jamaahStats: JamaahStats | null;
  transactions: FinanceTransaction[];
  financeSummary: FinanceSummary | null;
  donors: DonorItem[];
  donorStats: DonorStats | null;
  assets: AssetItem[];
  assetStats: AssetStats | null;
  approvals: ApprovalItem[];
  kpis: FieldKPI[];
  overallScore: number | null;
  overallGrade: string;
  lpjReport: LPJReport | null;
  totalLetters: number;
  approvedCount: number;
  invitationCount: number;
  pendingApprovalsCount: number;
  totalActiveTasks: number;

  // Filters & Sub-views
  selectedRT: string;
  setSelectedRT: (rt: string) => void;
  selectedStatus: string;
  setSelectedStatus: (st: string) => void;
  financeCategoryFilter: string;
  setFinanceCategoryFilter: (cat: string) => void;
  financeTypeFilter: string;
  setFinanceTypeFilter: (type: string) => void;
  assetCategoryFilter: string;
  setAssetCategoryFilter: (cat: string) => void;
  assetConditionFilter: string;
  setAssetConditionFilter: (cond: string) => void;
  assetOnlyDueFilter: boolean;
  setAssetOnlyDueFilter: (only: boolean | ((prev: boolean) => boolean)) => void;
  reportsSubView: 'generator' | 'kpi';
  setReportsSubView: (view: 'generator' | 'kpi') => void;

  // Handlers
  onPreviewLetter: (letter: OfficialLetter) => void;
  onOpenCreateLetter: () => void;
  onUpdateLetterStatus: (id: string, status: LetterStatus) => void;
  onOpenArchiveModal: () => void;
  onViewDetailJamaah: (jamaah: Jamaah) => void;
  onEditJamaah: (jamaah: Jamaah) => void;
  onOpenCreateJamaah: () => void;
  onOpenExcelModal: () => void;
  onOpenCreateTransaction: () => void;
  onEditTransaction: (tx: FinanceTransaction) => void;
  onDeleteTransaction: (id: string, desc: string) => void;
  onOpenFridayReport: () => void;
  isCreateDonorOpen: boolean;
  onCloseCreateDonor: () => void;
  onDonorSaved: () => void;
  onDonorDeleted: () => void;
  onPaymentRecorded: () => void;
  onOpenCreateAsset: () => void;
  onEditAsset: (asset: AssetItem) => void;
  onDeleteAsset: (id: string, name: string) => void;
  onRecordMaintenance: (assetId: string) => void;
  onPreviewLPJ: (rep: LPJReport) => void;
  onRefreshReports: () => void;
  onVerifyApproval: (id: string, status: ApprovalStatus, dispositionNotes?: string) => void;
  onSubmitNewApproval: (item: {
    type: ApprovalType;
    title: string;
    category: string;
    submittedBy: string;
    submittedRole: string;
    amount?: number;
    description: string;
  }) => void;
  onOpenAuditLogs: () => void;
  onOpenBackupModal: () => void;
}

export default function MainContentRouter(props: MainContentRouterProps) {
  const {
    activeTab,
    canAccessTab,
    onNavigateTab,
    globalSearchQuery,
    isReadOnly,
    isLoading,
    letters,
    minutes,
    jamaahList,
    jamaahStats,
    transactions,
    financeSummary,
    donors,
    donorStats,
    assets,
    assetStats,
    approvals,
    kpis,
    overallScore,
    overallGrade,
    lpjReport,
    totalLetters,
    approvedCount,
    invitationCount,
    pendingApprovalsCount,
    totalActiveTasks,
    selectedRT,
    setSelectedRT,
    selectedStatus,
    setSelectedStatus,
    financeCategoryFilter,
    setFinanceCategoryFilter,
    financeTypeFilter,
    setFinanceTypeFilter,
    assetCategoryFilter,
    setAssetCategoryFilter,
    assetConditionFilter,
    setAssetConditionFilter,
    assetOnlyDueFilter,
    setAssetOnlyDueFilter,
    reportsSubView,
    setReportsSubView,
    onPreviewLetter,
    onOpenCreateLetter,
    onUpdateLetterStatus,
    onOpenArchiveModal,
    onViewDetailJamaah,
    onEditJamaah,
    onOpenCreateJamaah,
    onOpenExcelModal,
    onOpenCreateTransaction,
    onEditTransaction,
    onDeleteTransaction,
    onOpenFridayReport,
    isCreateDonorOpen,
    onCloseCreateDonor,
    onDonorSaved,
    onDonorDeleted,
    onPaymentRecorded,
    onOpenCreateAsset,
    onEditAsset,
    onDeleteAsset,
    onRecordMaintenance,
    onPreviewLPJ,
    onRefreshReports,
    onVerifyApproval,
    onSubmitNewApproval,
    onOpenAuditLogs,
    onOpenBackupModal,
  } = props;

  const isDashboardTab = activeTab === 'dashboard';
  const isFinanceTab = activeTab === 'finance';
  const isAssetTab = activeTab === 'assets';
  const isJamaahTab = activeTab === 'jamaah' || activeTab === 'mustahiq';
  const isReportsTab = activeTab === 'reports';
  const isApprovalsTab = activeTab === 'approvals';
  const isDakwahTab = activeTab === 'dakwah';

  return (
    <>
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
          onNavigateTab={onNavigateTab}
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
          onRecordMaintenance={(asset) => onRecordMaintenance(asset.id)}
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
                      onNavigateTab={onNavigateTab}
                      onPreviewLetter={onPreviewLetter}
                    />
                  )}

                  {canAccessTab('finance') && (
                    <DashboardKeuanganCard
                      financeSummary={financeSummary}
                      onOpenFridayReport={onOpenFridayReport}
                    />
                  )}
                </div>

                {/* Right Column (4 of 12 cols): Quick Actions & System Highlights */}
                <div className="lg:col-span-4 space-y-6">
                  <DashboardQuickActions
                    onOpenCreateLetter={onOpenCreateLetter}
                    onOpenCreateJamaah={onOpenCreateJamaah}
                    onOpenCreateTransaction={onOpenCreateTransaction}
                    onOpenFridayReport={onOpenFridayReport}
                    onOpenArchiveLetterModal={onOpenArchiveModal}
                    onNavigateTab={onNavigateTab}
                    lpjReport={lpjReport}
                    onPreviewLPJ={onPreviewLPJ}
                  />

                  {canAccessTab('assets') && (
                    <DashboardSarprasCard
                      assets={assets}
                      assetStats={assetStats}
                      onNavigateTab={onNavigateTab}
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
                onPreviewLetter={onPreviewLetter}
                onUpdateStatus={onUpdateLetterStatus}
                onOpenArchiveModal={onOpenArchiveModal}
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
                onViewDetail={onViewDetailJamaah}
                onEdit={onEditJamaah}
                onOpenCreate={onOpenCreateJamaah}
                onOpenExcelModal={onOpenExcelModal}
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
              <CashflowRunwayAlert />
              <TransactionTable
                transactions={transactions}
                selectedCategory={financeCategoryFilter}
                selectedType={financeTypeFilter}
                onSelectCategory={setFinanceCategoryFilter}
                onSelectType={setFinanceTypeFilter}
                onOpenCreate={onOpenCreateTransaction}
                onEdit={onEditTransaction}
                onDelete={onDeleteTransaction}
                isReadOnly={isReadOnly}
                externalSearchTerm={globalSearchQuery}
              />
              <RakerBudgetTracker transactions={transactions} />
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
                onDonorSaved={onDonorSaved}
                onDonorDeleted={onDonorDeleted}
                isExternalCreateOpen={isCreateDonorOpen}
                onCloseExternalCreate={onCloseCreateDonor}
                onPaymentRecorded={onPaymentRecorded}
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
                onOpenCreate={onOpenCreateAsset}
                onEdit={onEditAsset}
                onDelete={onDeleteAsset}
                onRecordMaintenance={(asset) => onRecordMaintenance(asset.id)}
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
                    onClick={() => onPreviewLPJ(lpjReport)}
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
                  onPreviewLPJ={onPreviewLPJ}
                  onRefreshData={onRefreshReports}
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
                onVerify={onVerifyApproval}
                onSubmitNewApproval={onSubmitNewApproval}
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
                onOpenAuditLogs={onOpenAuditLogs}
                onOpenBackupModal={onOpenBackupModal}
              />
            </div>
          )}

          {/* Monitoring 74 Program Kerja Raker 2026-2029 */}
          {activeTab === 'program-kerja' && (
            <div className="space-y-4">
              <ProgramKerjaView transactions={transactions} />
            </div>
          )}

          {/* Rapat Terpadu: Undangan, Presensi, Notulen, Cetak */}
          {activeTab === 'meetings' && (
            <div className="space-y-4">
              <IntegratedMeetingModule />
            </div>
          )}

          {/* Kepanitiaan Ad-hoc & SK Penetapan */}
          {activeTab === 'adhoc' && (
            <div className="space-y-4">
              <AdhocCommitteeView />
            </div>
          )}

          {/* Modul TPA & Pembinaan Santri */}
          {activeTab === 'tpa' && (
            <div className="space-y-4">
              <TpaView />
            </div>
          )}

          {/* Sentra UMKM Jamaah & Gerai Muslimah */}
          {activeTab === 'umkm' && (
            <div className="space-y-4">
              <UmkmView />
            </div>
          )}

          {/* Lelang Infaq Barakah */}
          {activeTab === 'lelang' && (
            <div className="space-y-4">
              <LelangView />
            </div>
          )}

          {/* Galeri Kegiatan Universal */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              <GalleryView />
            </div>
          )}
        </>
      )}
    </>
  );
}
