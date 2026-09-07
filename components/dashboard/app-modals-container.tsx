'use client';

import React from 'react';
import { AppModals } from '@/components/modals/app-modals';
import { useAppModals } from '@/hooks/useAppModals';
import { useAppHandlers } from '@/hooks/useAppHandlers';
import { useDashboardStats } from '@/hooks/useDashboardStats';

interface AppModalsContainerProps {
  modals: ReturnType<typeof useAppModals>;
  handlers: ReturnType<typeof useAppHandlers>;
  stats: ReturnType<typeof useDashboardStats>;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function AppModalsContainer({
  modals,
  handlers,
  stats,
  showToast,
}: AppModalsContainerProps) {
  return (
    <AppModals
      isCreateLetterOpen={modals.isCreateLetterOpen}
      setIsCreateLetterOpen={modals.setIsCreateLetterOpen}
      previewLetter={modals.previewLetter}
      setPreviewLetter={modals.setPreviewLetter}
      handleLetterCreated={handlers.handleLetterCreated}
      isArchiveLetterModalOpen={modals.isArchiveLetterModalOpen}
      setIsArchiveLetterModalOpen={modals.setIsArchiveLetterModalOpen}
      handleArchiveLetterSaved={handlers.handleArchiveLetterSaved}
      isJamaahFormOpen={modals.isJamaahFormOpen}
      setIsJamaahFormOpen={modals.setIsJamaahFormOpen}
      editingJamaah={modals.editingJamaah}
      handleJamaahSaved={handlers.handleJamaahSaved}
      detailJamaah={modals.detailJamaah}
      setDetailJamaah={modals.setDetailJamaah}
      handleEditJamaah={handlers.handleEditJamaah}
      isExcelModalOpen={modals.isExcelModalOpen}
      setIsExcelModalOpen={modals.setIsExcelModalOpen}
      jamaahList={stats.jamaahList}
      handleImportSuccess={handlers.handleImportSuccess}
      isFridayReportOpen={modals.isFridayReportOpen}
      setIsFridayReportOpen={modals.setIsFridayReportOpen}
      transactions={stats.transactions}
      isTransactionModalOpen={modals.isTransactionModalOpen}
      setIsTransactionModalOpen={modals.setIsTransactionModalOpen}
      editingTransaction={modals.editingTransaction}
      handleTransactionSaved={handlers.handleTransactionSaved}
      isAssetModalOpen={modals.isAssetModalOpen}
      setIsAssetModalOpen={modals.setIsAssetModalOpen}
      editingAsset={modals.editingAsset}
      handleAssetSaved={handlers.handleAssetSaved}
      previewLPJ={modals.previewLPJ}
      setPreviewLPJ={modals.setPreviewLPJ}
      isLoginModalOpen={modals.isLoginModalOpen}
      setIsLoginModalOpen={modals.setIsLoginModalOpen}
      onSuccessLoginToast={showToast}
      isAuditLogModalOpen={modals.isAuditLogModalOpen}
      setIsAuditLogModalOpen={modals.setIsAuditLogModalOpen}
      isBackupModalOpen={modals.isBackupModalOpen}
      setIsBackupModalOpen={modals.setIsBackupModalOpen}
      onDataRestored={() => {
        stats.refreshAll();
        showToast('Data berhasil dipulihkan dari berkas cadangan!');
      }}
    />
  );
}
