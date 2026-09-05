'use client';

import React, { useState, useEffect } from 'react';
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
import FinanceStatsCards, { formatRupiah } from '@/components/finance/finance-stats';
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

// Types
import { OfficialLetter, LetterStatus, MeetingMinutes } from '@/types/letter';
import { Jamaah, JamaahStats } from '@/types/jamaah';
import { FinanceTransaction, FinanceSummary } from '@/types/finance';
import { DonorItem, DonorStats, DONOR_CATEGORIES } from '@/types/donor';
import { AssetItem, AssetStats } from '@/types/asset';
import { LPJReport, FieldKPI, ApprovalItem, ApprovalStatus, ApprovalType } from '@/types/reports';

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
  Wallet,
  Wrench,
  Package,
  BarChart3,
  ShieldCheck,
  Eye,
  ArrowRightLeft,
  LayoutDashboard,
  ArrowUpRight,
  Printer,
  Archive,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, isReadOnly, canAccessTab, canMutateTab, logAction } = useAuth();
  const [requestedTab, setActiveTab] = useState<AppNavTab>('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isFridayReportOpen, setIsFridayReportOpen] = useState(false);

  // Derived activeTab ensures user cannot be on a restricted tab
  const activeTab: AppNavTab = canAccessTab(requestedTab)
    ? requestedTab
    : 'dashboard';

  // Phase 5 & Database Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Phase 1 State
  const [letters, setLetters] = useState<OfficialLetter[]>([]);
  const [minutes, setMinutes] = useState<MeetingMinutes[]>([]);
  const [isCreateLetterOpen, setIsCreateLetterOpen] = useState(false);
  const [isArchiveLetterModalOpen, setIsArchiveLetterModalOpen] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<OfficialLetter | null>(null);

  // Phase 2 State
  const [jamaahList, setJamaahList] = useState<Jamaah[]>([]);
  const [jamaahStats, setJamaahStats] = useState<JamaahStats | null>(null);
  const [selectedRT, setSelectedRT] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isJamaahFormOpen, setIsJamaahFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState<Jamaah | null>(null);
  const [detailJamaah, setDetailJamaah] = useState<Jamaah | null>(null);

  // Phase 3 State - Finance & Donatur
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummary | null>(null);
  const [financeCategoryFilter, setFinanceCategoryFilter] = useState('ALL');
  const [financeTypeFilter, setFinanceTypeFilter] = useState('ALL');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);

  // Donatur Tetap State
  const [donors, setDonors] = useState<DonorItem[]>([]);
  const [donorStats, setDonorStats] = useState<DonorStats | null>(null);
  const [isCreateDonorOpen, setIsCreateDonorOpen] = useState(false);

  // Phase 3 State - Assets
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [assetStats, setAssetStats] = useState<AssetStats | null>(null);
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('ALL');
  const [assetConditionFilter, setAssetConditionFilter] = useState('ALL');
  const [assetOnlyDueFilter, setAssetOnlyDueFilter] = useState(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);

  // Phase 4 State - Reports, KPIs & Approvals
  const [lpjReport, setLpjReport] = useState<LPJReport | null>(null);
  const [fieldKPIs, setFieldKPIs] = useState<FieldKPI[]>([]);
  const [overallScore, setOverallScore] = useState(90);
  const [overallGrade, setOverallGrade] = useState('A (Sangat Baik)');
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [previewLPJ, setPreviewLPJ] = useState<LPJReport | null>(null);
  const [reportsSubView, setReportsSubView] = useState<'generator' | 'kpi'>('generator');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Data version trigger for reloading across all modules
  const [dataVersion, setDataVersion] = useState(0);

  // Fetch initial data across all modules
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lettersRes, minutesRes, jamaahRes, financeRes, assetsRes, lpjRes, kpiRes, apprRes, donorsRes] =
          await Promise.all([
            fetch('/api/letters'),
            fetch('/api/minutes'),
            fetch('/api/jamaah'),
            fetch('/api/finance'),
            fetch('/api/assets'),
            fetch('/api/reports/lpj'),
            fetch('/api/reports/kpi'),
            fetch('/api/approvals'),
            fetch('/api/donors'),
          ]);

        const lettersData = await lettersRes.json();
        const minutesData = await minutesRes.json();
        const jamaahData = await jamaahRes.json();
        const financeData = await financeRes.json();
        const assetsData = await assetsRes.json();
        const lpjData = await lpjRes.json();
        const kpiData = await kpiRes.json();
        const apprData = await apprRes.json();
        const donorsData = await donorsRes.json();

        if (lettersData.success) setLetters(lettersData.data);
        if (minutesData.success) setMinutes(minutesData.data);
        if (jamaahData.success) {
          setJamaahList(jamaahData.data);
          setJamaahStats(jamaahData.stats);
        }
        if (financeData.success) {
          setTransactions(financeData.data);
          setFinanceSummary(financeData.summary);
        }
        if (donorsData.success) {
          setDonors(donorsData.data);
          setDonorStats(donorsData.stats);
        }
        if (assetsData.success) {
          setAssets(assetsData.data);
          setAssetStats(assetsData.stats);
        }
        if (lpjData.success) {
          setLpjReport(lpjData.data);
        }
        if (kpiData.success) {
          setFieldKPIs(kpiData.data);
          if (kpiData.overallScore) setOverallScore(kpiData.overallScore);
          if (kpiData.overallGrade) setOverallGrade(kpiData.overallGrade);
        }
        if (apprData.success) {
          setApprovals(apprData.data);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dataVersion]);

  // ----------------------------------------------------
  // Phase 1 Actions (Letters & Minutes)
  // ----------------------------------------------------
  const handleOpenCreateLetter = () => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Aksi pembuatan surat dinonaktifkan.');
      return;
    }
    if (!canMutateTab('archive')) {
      showToast('Akses Dibatasi: Anda tidak memiliki wewenang menerbitkan surat dinas.');
      return;
    }
    setIsCreateLetterOpen(true);
  };

  const handleLetterCreated = (newLetter: OfficialLetter) => {
    setLetters((prev) => [newLetter, ...prev]);
    showToast(`Surat nomor ${newLetter.letterNumber} berhasil disimpan ke E-Arsip!`);
    setActiveTab('archive');

    logAction(
      'CREATE_LETTER',
      'Penerbitan Surat Resmi',
      'KESEKRETARIATAN',
      `Menerbitkan surat dinas nomor ${newLetter.letterNumber} (${newLetter.subject})`
    );
  };

  const handleArchiveLetterSaved = (newLetter: OfficialLetter) => {
    setLetters((prev) => [newLetter, ...prev]);
    showToast(`Surat fisik "${newLetter.letterNumber}" berhasil dicatat ke E-Arsip!`);
    setActiveTab('archive');

    logAction(
      'CREATE_LETTER',
      'Pencatatan Arsip Surat Keluar',
      'KESEKRETARIATAN',
      `Mencatat arsip surat fisik/lampau nomor ${newLetter.letterNumber} (${newLetter.subject})`
    );
  };

  const handleUpdateStatus = async (id: string, newStatus: LetterStatus) => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Perubahan status surat tidak diizinkan.');
      return;
    }

    try {
      const res = await fetch('/api/letters', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setLetters((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        );
        showToast(`Status surat berhasil diubah menjadi ${newStatus}`);

        logAction(
          'UPDATE_LETTER',
          'Pemutakhiran Status Surat',
          'KESEKRETARIATAN',
          `Mengubah status surat ID ${id} menjadi ${newStatus}`
        );
      }
    } catch {
      showToast('Gagal mengubah status surat');
    }
  };

  // ----------------------------------------------------
  // Phase 2 Actions (Jamaah & Mustahiq)
  // ----------------------------------------------------
  const handleOpenCreateJamaah = () => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Pendaftaran warga dinonaktifkan.');
      return;
    }
    if (!canMutateTab('jamaah')) {
      showToast('Akses Dibatasi: Anda tidak memiliki wewenang mengelola data warga.');
      return;
    }
    setEditingJamaah(null);
    setIsJamaahFormOpen(true);
  };

  const handleEditJamaah = (j: Jamaah) => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Perubahan profil jamaah tidak diizinkan.');
      return;
    }
    if (!canMutateTab('jamaah')) {
      showToast('Akses Dibatasi: Anda tidak memiliki wewenang mengubah data warga.');
      return;
    }
    setEditingJamaah(j);
    setIsJamaahFormOpen(true);
  };

  const handleJamaahSaved = (savedJamaah: Jamaah) => {
    setJamaahList((prev) => {
      const exists = prev.some((j) => j.id === savedJamaah.id);
      if (exists) {
        return prev.map((j) => (j.id === savedJamaah.id ? savedJamaah : j));
      }
      return [savedJamaah, ...prev];
    });

    fetch('/api/jamaah')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setJamaahStats(data.stats);
      })
      .catch((err) => console.error(err));

    showToast(`Profil ${savedJamaah.fullName} berhasil disimpan!`);

    logAction(
      'CREATE_JAMAAH',
      'Pemutakhiran Data Jamaah',
      'JAMAAH',
      `Memutakhirkan profil jamaah ${savedJamaah.fullName} RT ${savedJamaah.rt} Blok AE`
    );
  };

  const handleImportSuccess = (imported: Jamaah[]) => {
    setJamaahList((prev) => [...imported, ...prev]);
    fetch('/api/jamaah')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setJamaahStats(data.stats);
      })
      .catch((err) => console.error(err));
    showToast(`Alhamdulillah! Berhasil mengimpor ${imported.length} data warga ke basis data!`);

    logAction(
      'IMPORT_JAMAAH_EXCEL',
      'Impor Data Jamaah Massal',
      'JAMAAH',
      `Mengimpor ${imported.length} data sensus warga Blok AE dari berkas spreadsheet Excel`
    );
  };

  // ----------------------------------------------------
  // Phase 3 Actions (Finance & Cashflow)
  // ----------------------------------------------------
  const handleOpenCreateTransaction = () => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Pencatatan kas dinonaktifkan.');
      return;
    }
    if (!canMutateTab('finance')) {
      showToast('Akses Dibatasi: Anda tidak memiliki hak pencatatan buku kas.');
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
      showToast('Akses Dibatasi: Anda tidak memiliki hak mengubah catatan kas.');
      return;
    }
    setEditingTransaction(tx);
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSaved = (savedTx: FinanceTransaction) => {
    setTransactions((prev) => {
      const exists = prev.some((t) => t.id === savedTx.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTx.id ? savedTx : t));
      }
      return [savedTx, ...prev];
    });

    fetch('/api/finance')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setFinanceSummary(data.summary);
      })
      .catch((err) => console.error(err));

    showToast(`Transaksi "${savedTx.description}" berhasil disimpan ke buku kas!`);

    logAction(
      'CREATE_TRANSACTION',
      'Pencatatan Kas Masjid',
      'KEUANGAN',
      `Mencatat mutasi ${savedTx.type} Rp ${savedTx.amount.toLocaleString('id-ID')} (${savedTx.category}) - ${savedTx.description}`
    );
  };

  const handleDeleteTransaction = async (id: string, desc: string) => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Penghapusan transaksi kas tidak diizinkan.');
      return;
    }
    if (!canMutateTab('finance')) {
      showToast('Akses Dibatasi: Anda tidak memiliki wewenang menghapus data kas.');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus transaksi kas "${desc}"?`)) return;

    try {
      const res = await fetch(`/api/finance?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        if (data.summary) setFinanceSummary(data.summary);
        showToast(`Transaksi "${desc}" berhasil dihapus.`);

        logAction(
          'UPDATE_TRANSACTION',
          'Penghapusan Mutasi Kas',
          'KEUANGAN',
          `Menghapus transaksi kas "${desc}" (ID: ${id})`
        );
      }
    } catch {
      showToast('Gagal menghapus transaksi kas');
    }
  };

  // ----------------------------------------------------
  // Donatur Tetap Actions
  // ----------------------------------------------------
  const handleDonorSaved = (savedDonor: DonorItem) => {
    setDonors((prev) => {
      const exists = prev.some((d) => d.id === savedDonor.id);
      if (exists) return prev.map((d) => (d.id === savedDonor.id ? savedDonor : d));
      return [savedDonor, ...prev];
    });

    fetch('/api/donors')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) setDonorStats(data.stats);
      })
      .catch(() => {});

    showToast(`Data donatur tetap "${savedDonor.donorName}" berhasil disimpan!`);

    logAction(
      'CREATE_DONOR',
      'Registrasi Donatur Tetap',
      'KEUANGAN',
      `Menyimpan data donatur tetap: ${savedDonor.donorName} (${DONOR_CATEGORIES[savedDonor.category]?.name || savedDonor.category} - Rp ${savedDonor.commitmentAmount.toLocaleString('id-ID')}/bln)`
    );
  };

  const handleDonorDeleted = (id: string) => {
    setDonors((prev) => prev.filter((d) => d.id !== id));

    fetch('/api/donors')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) setDonorStats(data.stats);
      })
      .catch(() => {});

    showToast('Data donatur tetap berhasil dihapus.');

    logAction(
      'DELETE_DONOR',
      'Penghapusan Donatur Tetap',
      'KEUANGAN',
      `Menghapus data donatur tetap ID: ${id}`
    );
  };

  const handleDonorPaymentRecorded = (
    donor: DonorItem,
    transaction: FinanceTransaction
  ) => {
    setDonors((prev) => prev.map((d) => (d.id === donor.id ? donor : d)));
    setTransactions((prev) => [transaction, ...prev]);

    fetch('/api/finance')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.summary) setFinanceSummary(data.summary);
      })
      .catch(() => {});

    fetch('/api/donors')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) setDonorStats(data.stats);
      })
      .catch(() => {});

    showToast(
      `Alhamdulillah! Setoran infaq/donasi ${donor.donorName} sebesar Rp ${transaction.amount.toLocaleString('id-ID')} berhasil dicatat ke Kas.`
    );

    logAction(
      'CREATE_TRANSACTION',
      'Penerimaan Infaq Donatur Tetap',
      'KEUANGAN',
      `Mencatat setoran kas dari donatur tetap ${donor.donorName} sebesar Rp ${transaction.amount.toLocaleString('id-ID')} (${DONOR_CATEGORIES[donor.category]?.name || donor.category})`
    );
  };

  // ----------------------------------------------------
  // Phase 3 Actions (Assets & Maintenance)
  // ----------------------------------------------------
  const handleOpenCreateAsset = () => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Pendaftaran aset baru dinonaktifkan.');
      return;
    }
    if (!canMutateTab('assets')) {
      showToast('Akses Dibatasi: Anda tidak memiliki hak mengelola inventaris sarpras.');
      return;
    }
    setEditingAsset(null);
    setIsAssetModalOpen(true);
  };

  const handleEditAsset = (asset: AssetItem) => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Perubahan data inventaris tidak diizinkan.');
      return;
    }
    if (!canMutateTab('assets')) {
      showToast('Akses Dibatasi: Anda tidak memiliki wewenang mengubah data inventaris.');
      return;
    }
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  };

  const handleAssetSaved = (savedAsset: AssetItem) => {
    setAssets((prev) => {
      const exists = prev.some((a) => a.id === savedAsset.id);
      if (exists) {
        return prev.map((a) => (a.id === savedAsset.id ? savedAsset : a));
      }
      return [savedAsset, ...prev];
    });

    fetch('/api/assets')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setAssetStats(data.stats);
      })
      .catch((err) => console.error(err));

    showToast(`Data sarpras "${savedAsset.name}" berhasil disimpan!`);

    logAction(
      'CREATE_ASSET',
      'Pendaftaran/Update Aset Sarpras',
      'SARPRAS',
      `Mendaftarkan/memutakhirkan aset fisik "${savedAsset.name}" (${savedAsset.code}) di ${savedAsset.location}`
    );
  };

  const handleDeleteAsset = async (id: string, name: string) => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Penghapusan aset inventaris tidak diizinkan.');
      return;
    }
    if (!canMutateTab('assets')) {
      showToast('Akses Dibatasi: Anda tidak memiliki hak menghapus aset.');
      return;
    }

    if (!window.confirm(`Yakin ingin menghapus inventaris sarpras "${name}"?`)) return;

    try {
      const res = await fetch(`/api/assets?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
        if (data.stats) setAssetStats(data.stats);
        showToast(`Aset "${name}" berhasil dihapus dari inventaris.`);

        logAction(
          'UPDATE_ASSET',
          'Penghapusan Inventaris Sarpras',
          'SARPRAS',
          `Menghapus inventaris aset "${name}" (ID: ${id})`
        );
      }
    } catch {
      showToast('Gagal menghapus aset inventaris');
    }
  };

  const handleRecordMaintenance = async (asset: AssetItem) => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Pencatatan pemeliharaan tidak diizinkan.');
      return;
    }
    if (!canMutateTab('assets')) {
      showToast('Akses Dibatasi: Anda tidak memiliki wewenang mencatat pemeliharaan aset.');
      return;
    }

    const notesPrompt = window.prompt(
      `Konfirmasi penyelesaian servis rutin untuk:\n"${asset.name}"\n\nMasukkan catatan teknisi / pemeliharaan (opsional):`,
      'Servis rutin berkala selesai dikerjakan, kondisi kembali optimal & prima.'
    );

    if (notesPrompt === null) return;

    try {
      const res = await fetch('/api/assets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: asset.id,
          action: 'RECORD_MAINTENANCE',
          notes: notesPrompt.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAssets((prev) => prev.map((a) => (a.id === asset.id ? data.data : a)));
        if (data.stats) setAssetStats(data.stats);
        showToast(`Alhamdulillah! Pemeliharaan ${asset.name} selesai dicatat, siklus servis berikutnya telah dimutakhirkan.`);

        logAction(
          'SERVICE_ASSET',
          'Pemeliharaan Aset Sarpras',
          'SARPRAS',
          `Mencatat penyelesaian servis rutin berkala untuk aset "${asset.name}"`
        );
      } else {
        showToast(data.error || 'Gagal memperbarui servis aset');
      }
    } catch {
      showToast('Gagal mencatat pemeliharaan aset');
    }
  };

  // ----------------------------------------------------
  // Phase 4 Actions (Reports, KPIs, & Approvals)
  // ----------------------------------------------------
  const handleRefreshLPJ = async (customPeriod: string) => {
    try {
      const res = await fetch(`/api/reports/lpj?period=${encodeURIComponent(customPeriod)}`);
      const data = await res.json();
      if (data.success) {
        setLpjReport(data.data);
      }
    } catch (err) {
      console.error('Failed to refresh LPJ data:', err);
    }
  };

  const handleVerifyApproval = async (id: string, status: ApprovalStatus, dispositionNotes?: string) => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Eksekusi disposisi tidak diizinkan.');
      return;
    }
    if (currentUser.role !== 'KETUA_UMUM') {
      showToast('Akses Dibatasi: Hanya Ketua Umum yang berhak mengeksekusi pengesahan disposisi.');
      return;
    }

    try {
      const res = await fetch('/api/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, dispositionNotes }),
      });
      const data = await res.json();
      if (data.success) {
        setApprovals((prev) => prev.map((a) => (a.id === id ? data.data : a)));
        showToast(data.message || 'Status pengesahan berhasil diperbarui');

        logAction(
          status === 'DISETUJUI' ? 'APPROVE_DISPOSITION' : 'REJECT_DISPOSITION',
          'Disposisi Pengesahan Satu Pintu',
          'EKSEKUTIF',
          `Ketua Umum (${currentUser.name}) memverifikasi pengajuan [${id}] dengan status ${status}${
            dispositionNotes ? `: "${dispositionNotes}"` : ''
          }`
        );
      } else {
        showToast(data.error || 'Gagal memperbarui pengesahan');
      }
    } catch {
      showToast('Gagal menghubungi server untuk verifikasi');
    }
  };

  const handleSubmitNewApproval = async (item: {
    type: ApprovalType;
    title: string;
    category: string;
    submittedBy: string;
    submittedRole: string;
    amount?: number;
    description: string;
  }) => {
    if (isReadOnly) {
      showToast('Mode Pengawas: Pengajuan pengesahan dinonaktifkan.');
      return;
    }

    try {
      const res = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.success) {
        setApprovals((prev) => [data.data, ...prev]);
        showToast('Permohonan pengesahan berhasil diajukan ke Ketua Umum!');

        logAction(
          'APPROVE_DISPOSITION',
          'Pengajuan Disposisi Baru',
          'EKSEKUTIF',
          `Pengajuan baru diajukan oleh ${item.submittedBy} (${item.submittedRole}): ${item.title}`
        );
      } else {
        showToast(data.error || 'Gagal mengajukan pengesahan');
      }
    } catch {
      showToast('Terjadi kendala saat mengajukan');
    }
  };

  // Tab Helpers
  const isDashboardTab = activeTab === 'dashboard';
  const isJamaahTab = activeTab === 'jamaah' || activeTab === 'mustahiq';
  const isFinanceTab = activeTab === 'finance';
  const isDonorsTab = activeTab === 'donors';
  const isAssetTab = activeTab === 'assets';
  const isReportsTab = activeTab === 'reports';
  const isApprovalsTab = activeTab === 'approvals';

  // Fast action label for Navbar
  const getCreateLabel = () => {
    if (isReportsTab) return 'Pratinjau LPJ A4';
    if (isApprovalsTab) return 'Ajukan Disposisi';
    if (isFinanceTab) return 'Catat Transaksi';
    if (isDonorsTab) return 'Tambah Donatur';
    if (isAssetTab) return 'Daftar Aset Baru';
    if (isJamaahTab) return 'Tambah Warga';
    return 'Buat Surat';
  };

  const handleFastNavbarCreate = () => {
    if (isReportsTab && lpjReport) setPreviewLPJ(lpjReport);
    else if (isApprovalsTab) setActiveTab('approvals');
    else if (isFinanceTab) handleOpenCreateTransaction();
    else if (isDonorsTab) setIsCreateDonorOpen(true);
    else if (isAssetTab) handleOpenCreateAsset();
    else if (isJamaahTab) handleOpenCreateJamaah();
    else setIsCreateLetterOpen(true);
  };

  // Letters metrics
  const totalLetters = letters.length;
  const invitationCount = letters.filter((l) => l.category === 'UND').length;
  const approvedCount = letters.filter((l) => l.status === 'APPROVED' || l.status === 'SENT').length;
  const totalActiveTasks = minutes.reduce(
    (acc, m) => acc + m.actionItems.filter((a) => a.status === 'PENDING').length,
    0
  );

  const pendingApprovalsCount = approvals.filter((a) => a.status === 'MENUNGGU_VERIFIKASI').length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'mustahiq') setSelectedStatus('MUSTAHIQ_ALL');
          else if (tab === 'jamaah') setSelectedStatus('ALL');
          setActiveTab(tab);
        }}
        onOpenCreateLetter={handleOpenCreateLetter}
        onOpenCreateJamaah={handleOpenCreateJamaah}
        onOpenCreateTransaction={handleOpenCreateTransaction}
        onOpenCreateAsset={handleOpenCreateAsset}
        onOpenLPJModal={() => {
          if (lpjReport) setPreviewLPJ(lpjReport);
        }}
        onOpenSwitchRole={() => setIsLoginModalOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenCreate={handleFastNavbarCreate}
          createButtonLabel={getCreateLabel()}
          onOpenSwitchRole={() => setIsLoginModalOpen(true)}
          onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
          hideCreateButton={isReadOnly}
          pendingApprovalsCount={pendingApprovalsCount}
          globalSearchQuery={globalSearchQuery}
          onGlobalSearchChange={setGlobalSearchQuery}
        />

        {/* Mode Pengawas / Role Alert Banner */}
        <RoleBanner
          onOpenSwitchRole={() => setIsLoginModalOpen(true)}
          onOpenAuditLogs={() => setIsAuditLogModalOpen(true)}
        />

        <main className="p-6 md:p-8 space-y-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Header Banner - Dynamic for all Modules */}
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
            {/* Official Mosque Logo Watermark */}
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
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Users className="w-4 h-4" />
                      <span>Registrasi Warga</span>
                    </button>
                    <button
                      onClick={handleOpenCreateTransaction}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Catat Mutasi Kas</span>
                    </button>
                    <button
                      onClick={() => setIsFridayReportOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-emerald-300" />
                      <span>Laporan Mimbar Jumat (A4)</span>
                    </button>
                  </>
                ) : isReportsTab ? (
                  <>
                    <button
                      onClick={() => {
                        if (lpjReport) setPreviewLPJ(lpjReport);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Buka Draf Dokumen LPJ A4</span>
                    </button>
                    <button
                      onClick={() => setReportsSubView(reportsSubView === 'generator' ? 'kpi' : 'generator')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-amber-300" />
                      <span>{reportsSubView === 'generator' ? 'Lihat Evaluasi KPI Bidang' : 'Kembali ke Generator LPJ'}</span>
                    </button>
                  </>
                ) : isApprovalsTab ? (
                  <>
                    <button
                      onClick={() => setActiveTab('approvals')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{pendingApprovalsCount} Pengajuan Butuh Verifikasi</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-indigo-300" />
                      <span>Modul LPJ & Evaluasi</span>
                    </button>
                  </>
                ) : isFinanceTab ? (
                  <>
                    <button
                      onClick={handleOpenCreateTransaction}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Catat Mutasi Kas</span>
                    </button>
                    <button
                      onClick={() => setIsFridayReportOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-emerald-300" />
                      <span>Laporan Kas Jumat (A4)</span>
                    </button>
                    <button
                      onClick={() => setFinanceCategoryFilter('SWADAYA_PHBI')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Pos Swadaya PHBI</span>
                    </button>
                  </>
                ) : isDonorsTab ? (
                  <>
                    <button
                      onClick={() => setIsCreateDonorOpen(true)}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Daftarkan Donatur Tetap</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('finance')}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/25 font-semibold text-xs transition-all cursor-pointer"
                    >
                      <Wallet className="w-4 h-4 text-emerald-300" />
                      <span>Lihat Buku Kas & PHBI</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab('archive')}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Administrasi & Surat
                    </p>
                    <p className="text-2xl font-black text-slate-900 mt-1 group-hover:text-emerald-700 transition-colors">
                      {totalLetters} <span className="text-xs font-semibold text-slate-500">Surat</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                      {approvedCount} Disahkan • {invitationCount} Undangan
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:scale-105 transition-transform shadow-2xs">
                    <FileText className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
                  <span>Buka E-Arsip Surat</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('jamaah')}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Kependudukan Jamaah
                    </p>
                    <p className="text-2xl font-black text-slate-900 mt-1 group-hover:text-teal-700 transition-colors">
                      {jamaahList.length} <span className="text-xs font-semibold text-slate-500">Jiwa</span>
                    </p>
                    <p className="text-[11px] text-teal-700 font-semibold mt-0.5">
                      {jamaahStats?.totalKK || 0} KK • {jamaahStats?.totalMustahiq || 0} Mustahiq ZISWAF
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 group-hover:scale-105 transition-transform shadow-2xs">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-teal-700">
                  <span>Kelola Data Warga</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('finance')}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Keuangan & Swadaya Kas
                    </p>
                    <p className="text-xl font-black text-slate-900 mt-1 group-hover:text-amber-700 transition-colors truncate">
                      {financeSummary ? formatRupiah(financeSummary.totalBalance) : 'Rp 0'}
                    </p>
                    <p className="text-[11px] text-amber-800 font-semibold mt-0.5">
                      PHBI: {financeSummary ? formatRupiah(financeSummary.phbiBalance) : 'Rp 0'}
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform shadow-2xs">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-amber-800">
                  <span>Buku Kas & Pos PHBI</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              <div
                onClick={() => setActiveTab('assets')}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Sarpras & Kinerja DKM
                    </p>
                    <p className="text-2xl font-black text-slate-900 mt-1 group-hover:text-indigo-700 transition-colors">
                      {assets.length} <span className="text-xs font-semibold text-slate-500">Unit</span>
                    </p>
                    <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                      {assetStats?.maintenanceDueCount || 0} Perlu Servis • Indeks: {overallScore}%
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 group-hover:scale-105 transition-transform shadow-2xs">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-indigo-700">
                  <span>Inventaris & Pemeliharaan</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ) : isReportsTab || isApprovalsTab ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Indeks Kesehatan DKM
                  </p>
                  <p className="text-2xl font-black text-indigo-900 mt-1">
                    {overallScore}%
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
              onRecordMaintenance={handleRecordMaintenance}
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
                    ? 'bg-white text-amber-900 shadow-soft-sm ring-1 ring-amber-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                <span>Mustahiq & Bansos ({jamaahStats?.totalMustahiq || 0})</span>
              </button>
            )}

            {/* Keuangan & Sarpras */}
            {canAccessTab('finance') && (
              <button
                onClick={() => setActiveTab('finance')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'finance'
                    ? 'bg-white text-amber-900 shadow-soft-sm ring-1 ring-amber-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Wallet className="w-3.5 h-3.5 text-amber-600" />
                <span>Buku Kas & PHBI ({transactions.length})</span>
              </button>
            )}

            {canAccessTab('finance') && (
              <button
                onClick={() => setActiveTab('donors')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'donors'
                    ? 'bg-white text-teal-900 shadow-soft-sm ring-1 ring-teal-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-teal-600" />
                <span>Donatur Tetap ({donors.length})</span>
              </button>
            )}

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
                      {/* 1. Surat Dinas & Disposisi Terbaru */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                              <Inbox className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                                Surat Dinas & Persuratan Terbaru
                              </h3>
                              <p className="text-[11px] text-slate-500">
                                E-Arsip dokumen dinas terbit & riwayat pengesahan
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('archive')}
                            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Buka E-Arsip</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="divide-y divide-slate-100">
                          {letters.slice(0, 4).map((l) => (
                            <div
                              key={l.id}
                              className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    {l.letterNumber}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      l.status === 'APPROVED' || l.status === 'SENT'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : l.status === 'ARCHIVED'
                                        ? 'bg-slate-100 text-slate-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {l.status === 'APPROVED'
                                      ? 'Disetujui'
                                      : l.status === 'SENT'
                                      ? 'Terkirim'
                                      : l.status === 'ARCHIVED'
                                      ? 'Diarsipkan'
                                      : 'Draf'}
                                  </span>
                                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                                    {l.letterDate}
                                  </span>
                                </div>
                                <h4 className="font-semibold text-slate-800 truncate">
                                  {l.subject}
                                </h4>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                  Tujuan: {l.recipientName} ({l.recipientTitle || l.recipientAddress || 'Jamaah'})
                                </p>
                              </div>

                              <button
                                onClick={() => setPreviewLetter(l)}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all cursor-pointer shrink-0"
                              >
                                Lihat A4
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 2. Agenda Rapat & Tindak Lanjut Berjalan */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                              <ListTodo className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                                Agenda & Tindak Lanjut Rapat DKM
                              </h3>
                              <p className="text-[11px] text-slate-500">
                                Ekstraksi butir tugas terstruktur dari notulensi rapat AI
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveTab('minutes')}
                            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <span>Kelola Notulensi</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="p-4 space-y-2.5">
                          {minutes.length > 0 && minutes[0].actionItems.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-start justify-between gap-3 text-xs"
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                  ✓
                                </span>
                                <div>
                                  <p className="font-semibold text-slate-800 leading-snug">
                                    {item.task}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                                    <span className="font-medium text-slate-600">
                                      PIC: {item.pic}
                                    </span>
                                    <span>•</span>
                                    <span className="text-amber-700 font-medium">
                                      Tenggat: {item.deadline}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 3. Posisi Saldo Kas Berdasarkan Pos Dana (Satu Pintu) */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                              <Wallet className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-900 leading-tight">
                                Pemisahan Pos Kas Keuangan (Satu Pintu)
                              </h3>
                              <p className="text-[11px] text-slate-500">
                                Rekapitulasi saldo kas operasional, swadaya PHBI, dan ZISWAF
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setIsFridayReportOpen(true)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak Pengumuman Jumat</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                              Kas Operasional Rutin
                            </span>
                            <span className="text-base font-bold text-slate-900 block mt-1">
                              {financeSummary ? formatRupiah(financeSummary.operationalBalance) : 'Rp 0'}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              Listrik, air, marbot & harian
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80">
                            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                              Dana Swadaya PHBI
                            </span>
                            <span className="text-base font-bold text-amber-900 block mt-1">
                              {financeSummary ? formatRupiah(financeSummary.phbiBalance) : 'Rp 0'}
                            </span>
                            <span className="text-[10px] text-amber-700 mt-1 block">
                              Pos terpisah kegiatan hari besar
                            </span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200/80">
                            <span className="text-[11px] font-semibold text-purple-800 uppercase tracking-wider block">
                              Rekapitulasi ZISWAF
                            </span>
                            <span className="text-base font-bold text-purple-900 block mt-1">
                              {financeSummary ? formatRupiah(financeSummary.ziswafBalance) : 'Rp 0'}
                            </span>
                            <span className="text-[10px] text-purple-700 mt-1 block">
                              Zakat & infaq terikat mustahiq
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column (4 of 12 cols): Quick Actions & System Highlights */}
                    <div className="lg:col-span-4 space-y-6">
                      {/* Aksi Cepat Pengurus (Pusat Kendali 1-Klik) */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <h3 className="font-bold text-sm text-slate-900">
                            Pusat Aksi Cepat Pengurus
                          </h3>
                        </div>

                        <div className="space-y-2">
                          <button
                            onClick={handleOpenCreateLetter}
                            className="w-full p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                ✉️
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block group-hover:text-emerald-900">
                                  Buat Draf Surat Dinas
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  Template cepat & bantuan AI
                                </span>
                              </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                          </button>

                          <button
                            onClick={handleOpenCreateJamaah}
                            className="w-full p-3 rounded-xl bg-teal-50 hover:bg-teal-100/80 border border-teal-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                👥
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block group-hover:text-teal-900">
                                  Registrasi Warga Baru
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  Input profil sensus jamaah RT 01-06
                                </span>
                              </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 transition-colors" />
                          </button>

                          <button
                            onClick={handleOpenCreateTransaction}
                            className="w-full p-3 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                💰
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block group-hover:text-amber-900">
                                  Catat Mutasi Kas Masuk/Keluar
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  Input transaksi buku kas harian
                                </span>
                              </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
                          </button>

                          <button
                            onClick={() => setIsFridayReportOpen(true)}
                            className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                🕌
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block">
                                  Laporan Kas Mimbar Jumat
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  Format siap cetak A4 & PDF
                                </span>
                              </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" />
                          </button>

                          <button
                            onClick={() => {
                              if (lpjReport) setPreviewLPJ(lpjReport);
                              else setActiveTab('reports');
                            }}
                            className="w-full p-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                📑
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block group-hover:text-indigo-900">
                                  Draf Dokumen LPJ Tahunan
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  Kompilasi 4 pilar bidang A4
                                </span>
                              </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 transition-colors" />
                          </button>

                          <button
                            onClick={() => setIsArchiveLetterModalOpen(true)}
                            className="w-full p-3 rounded-xl bg-orange-50/80 hover:bg-orange-100/80 border border-orange-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                📁
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block group-hover:text-amber-900">
                                  Catat Arsip Keluar (Fisik)
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  Rekam surat lampau ke E-Arsip
                                </span>
                              </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 transition-colors" />
                          </button>

                          <button
                            onClick={() => setActiveTab('donors')}
                            className="w-full p-3 rounded-xl bg-teal-50/80 hover:bg-teal-100/80 border border-teal-200/80 flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                🤝
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 block group-hover:text-teal-900">
                                  Kelola Donatur Tetap
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  Infaq rutin & 1-klik setor kas
                                </span>
                              </div>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 transition-colors" />
                          </button>
                        </div>
                      </div>

                      {/* Peringatan Pemeliharaan Sarpras */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-emerald-600" />
                            <h3 className="font-bold text-sm text-slate-900">
                              Servis Sarpras Berkala
                            </h3>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {assetStats?.maintenanceDueCount || 0} Terjadwal
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          {assets.slice(0, 3).map((a) => (
                            <div
                              key={a.id}
                              className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <span className="font-semibold text-slate-800 block truncate">
                                  {a.name}
                                </span>
                                <span className="text-[10px] text-slate-500 block truncate">
                                  Lokasi: {a.location} • Servis: {a.nextMaintenanceDate}
                                </span>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                  a.isMaintenanceDue
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {a.isMaintenanceDue ? 'Jatuh Tempo' : 'Optimal'}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => setActiveTab('assets')}
                          className="w-full mt-3 py-2 text-center text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer block"
                        >
                          Lihat Seluruh Inventaris Sarpras →
                        </button>
                      </div>

                      {/* Evaluasi Kesehatan Organisasi (Dewan Penasehat) */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-soft-sm p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Indeks Kesehatan DKM
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                            {overallGrade}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-slate-900">
                            {overallScore}%
                          </span>
                          <span className="text-xs text-emerald-600 font-semibold">
                            Kinerja Sangat Baik
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${overallScore}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                          Penilaian agregat otomatis berdasarkan ketercapaian target dakwah, kedisiplinan pencatatan kas, dan pemeliharaan fasilitas ibadah.
                        </p>
                      </div>
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

              {/* Keuangan: Catatan Kas & Pos PHBI */}
              {activeTab === 'finance' && (
                <div className="space-y-4">
                  <TransactionTable
                    transactions={transactions}
                    selectedCategory={financeCategoryFilter}
                    onSelectCategory={setFinanceCategoryFilter}
                    selectedType={financeTypeFilter}
                    onSelectType={setFinanceTypeFilter}
                    onOpenCreate={handleOpenCreateTransaction}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    isReadOnly={isReadOnly}
                    externalSearchTerm={globalSearchQuery}
                  />
                </div>
              )}

              {/* Donatur Tetap: Manajemen Donasi Rutin & 1-Klik Setor Kas */}
              {activeTab === 'donors' && (
                <div className="space-y-4">
                  <DonorTable
                    donors={donors}
                    donorStats={
                      donorStats || {
                        totalDonors: donors.length,
                        activeDonors: donors.filter((d) => d.status === 'AKTIF').length,
                        monthlyPotential: donors
                          .filter((d) => d.status === 'AKTIF')
                          .reduce((acc, d) => acc + d.commitmentAmount, 0),
                        currentMonthCollected: 0,
                        paidThisMonthCount: 0,
                        unpaidThisMonthCount: 0,
                      }
                    }
                    onDonorSaved={handleDonorSaved}
                    onDonorDeleted={handleDonorDeleted}
                    onPaymentRecorded={handleDonorPaymentRecorded}
                    isReadOnly={isReadOnly}
                    externalSearchTerm={globalSearchQuery}
                    isExternalCreateOpen={isCreateDonorOpen}
                    onCloseExternalCreate={() => setIsCreateDonorOpen(false)}
                  />
                </div>
              )}

              {/* Sarpras: Inventaris & Servis Berkala */}
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
                    onRecordMaintenance={handleRecordMaintenance}
                    isReadOnly={isReadOnly}
                    externalSearchTerm={globalSearchQuery}
                  />
                </div>
              )}

              {/* Laporan: Evaluasi Kinerja & LPJ Tahunan */}
              {activeTab === 'reports' && (
                <div className="space-y-4">
                  {/* Sub-view Switcher Bar */}
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div className="inline-flex rounded-lg p-1 bg-slate-100 border border-slate-200 text-xs">
                      <button
                        onClick={() => setReportsSubView('generator')}
                        className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                          reportsSubView === 'generator'
                            ? 'bg-white text-indigo-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Generator LPJ & Agregasi Modul
                      </button>
                      <button
                        onClick={() => setReportsSubView('kpi')}
                        className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
                          reportsSubView === 'kpi'
                            ? 'bg-white text-indigo-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Evaluasi Kinerja 4 Pilar (Dewan Penasehat)
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
                      onRefreshData={handleRefreshLPJ}
                    />
                  ) : (
                    <ExecutiveKPI
                      kpis={fieldKPIs}
                      overallScore={overallScore}
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

      {/* Modal Pusat Cadangan & Pemulihan Basis Data (SQLite) */}
      <DatabaseBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataRestored={() => {
          setDataVersion((v) => v + 1);
          showToast('Data berhasil dipulihkan dari berkas cadangan!');
        }}
      />
    </div>
  );
}
