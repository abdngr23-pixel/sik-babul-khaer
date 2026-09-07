'use client';

import React from 'react';
import { useModalBackHandler } from '@/lib/back-button-handler';
import CreateLetterModal from '@/components/letters/create-letter-modal';
import OfficialLetterPreview from '@/components/letters/official-letter-preview';
import ArchiveLetterModal from '@/components/letters/archive-letter-modal';
import JamaahFormModal from '@/components/jamaah/jamaah-form-modal';
import JamaahDetailModal from '@/components/jamaah/jamaah-detail-modal';
import JamaahExcelModal from '@/components/jamaah/jamaah-excel-modal';
import FridayReportModal from '@/components/finance/friday-report-modal';
import TransactionModal from '@/components/finance/transaction-modal';
import AssetFormModal from '@/components/assets/asset-form-modal';
import LPJPreviewModal from '@/components/reports/lpj-preview-modal';
import LoginModal from '@/components/auth/login-modal';
import AuditLogModal from '@/components/auth/audit-log-modal';
import DatabaseBackupModal from '@/components/auth/database-backup-modal';

import { OfficialLetter } from '@/types/letter';
import { Jamaah } from '@/types/jamaah';
import { FinanceTransaction } from '@/types/finance';
import { AssetItem } from '@/types/asset';
import { LPJReport } from '@/types/reports';

export interface AppModalsProps {
  // Letters
  isCreateLetterOpen: boolean;
  setIsCreateLetterOpen: (open: boolean) => void;
  previewLetter: OfficialLetter | null;
  setPreviewLetter: (letter: OfficialLetter | null) => void;
  handleLetterCreated: (letter: OfficialLetter) => void;
  isArchiveLetterModalOpen: boolean;
  setIsArchiveLetterModalOpen: (open: boolean) => void;
  handleArchiveLetterSaved: (archivedLetter: OfficialLetter) => void;

  // Jamaah
  isJamaahFormOpen: boolean;
  setIsJamaahFormOpen: (open: boolean) => void;
  editingJamaah: Jamaah | null;
  handleJamaahSaved: (jamaah: Jamaah) => void;
  detailJamaah: Jamaah | null;
  setDetailJamaah: (jamaah: Jamaah | null) => void;
  handleEditJamaah: (jamaah: Jamaah) => void;
  isExcelModalOpen: boolean;
  setIsExcelModalOpen: (open: boolean) => void;
  jamaahList: Jamaah[];
  handleImportSuccess: (imported: Jamaah[]) => void;

  // Finance
  isFridayReportOpen: boolean;
  setIsFridayReportOpen: (open: boolean) => void;
  transactions: FinanceTransaction[];
  isTransactionModalOpen: boolean;
  setIsTransactionModalOpen: (open: boolean) => void;
  editingTransaction: FinanceTransaction | null;
  handleTransactionSaved: (tx: FinanceTransaction) => void;

  // Assets
  isAssetModalOpen: boolean;
  setIsAssetModalOpen: (open: boolean) => void;
  editingAsset: AssetItem | null;
  handleAssetSaved: (asset: AssetItem) => void;

  // LPJ
  previewLPJ: LPJReport | null;
  setPreviewLPJ: (report: LPJReport | null) => void;

  // Auth & Admin
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  onSuccessLoginToast: (msg: string) => void;
  isAuditLogModalOpen: boolean;
  setIsAuditLogModalOpen: (open: boolean) => void;
  isBackupModalOpen: boolean;
  setIsBackupModalOpen: (open: boolean) => void;
  onDataRestored: () => void;
}

export function AppModals({
  // Letters
  isCreateLetterOpen,
  setIsCreateLetterOpen,
  previewLetter,
  setPreviewLetter,
  handleLetterCreated,
  isArchiveLetterModalOpen,
  setIsArchiveLetterModalOpen,
  handleArchiveLetterSaved,

  // Jamaah
  isJamaahFormOpen,
  setIsJamaahFormOpen,
  editingJamaah,
  handleJamaahSaved,
  detailJamaah,
  setDetailJamaah,
  handleEditJamaah,
  isExcelModalOpen,
  setIsExcelModalOpen,
  jamaahList,
  handleImportSuccess,

  // Finance
  isFridayReportOpen,
  setIsFridayReportOpen,
  transactions,
  isTransactionModalOpen,
  setIsTransactionModalOpen,
  editingTransaction,
  handleTransactionSaved,

  // Assets
  isAssetModalOpen,
  setIsAssetModalOpen,
  editingAsset,
  handleAssetSaved,

  // LPJ
  previewLPJ,
  setPreviewLPJ,

  // Auth & Admin
  isLoginModalOpen,
  setIsLoginModalOpen,
  onSuccessLoginToast,
  isAuditLogModalOpen,
  setIsAuditLogModalOpen,
  isBackupModalOpen,
  setIsBackupModalOpen,
  onDataRestored,
}: AppModalsProps) {
  // Mobile hardware back button bindings for all lifted modals
  useModalBackHandler(isCreateLetterOpen, () => setIsCreateLetterOpen(false), 'create-letter');
  useModalBackHandler(Boolean(previewLetter), () => setPreviewLetter(null), 'preview-letter');
  useModalBackHandler(isArchiveLetterModalOpen, () => setIsArchiveLetterModalOpen(false), 'archive-letter');
  useModalBackHandler(isJamaahFormOpen, () => setIsJamaahFormOpen(false), 'jamaah-form');
  useModalBackHandler(Boolean(detailJamaah), () => setDetailJamaah(null), 'detail-jamaah');
  useModalBackHandler(isExcelModalOpen, () => setIsExcelModalOpen(false), 'excel-jamaah');
  useModalBackHandler(isFridayReportOpen, () => setIsFridayReportOpen(false), 'friday-report');
  useModalBackHandler(isTransactionModalOpen, () => setIsTransactionModalOpen(false), 'transaction-form');
  useModalBackHandler(isAssetModalOpen, () => setIsAssetModalOpen(false), 'asset-form');
  useModalBackHandler(Boolean(previewLPJ), () => setPreviewLPJ(null), 'preview-lpj');
  useModalBackHandler(isLoginModalOpen, () => setIsLoginModalOpen(false), 'login-auth');
  useModalBackHandler(isAuditLogModalOpen, () => setIsAuditLogModalOpen(false), 'audit-log');
  useModalBackHandler(isBackupModalOpen, () => setIsBackupModalOpen(false), 'database-backup');

  return (
    <>
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
        onSuccessToast={onSuccessLoginToast}
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
        onDataRestored={onDataRestored}
      />
    </>
  );
}
