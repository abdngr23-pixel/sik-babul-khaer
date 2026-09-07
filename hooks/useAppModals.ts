'use client';

import { useState } from 'react';
import { OfficialLetter } from '@/types/letter';
import { Jamaah } from '@/types/jamaah';
import { FinanceTransaction } from '@/types/finance';
import { AssetItem } from '@/types/asset';
import { LPJReport } from '@/types/reports';

export function useAppModals() {
  // Letters
  const [isCreateLetterOpen, setIsCreateLetterOpen] = useState(false);
  const [isArchiveLetterModalOpen, setIsArchiveLetterModalOpen] = useState(false);
  const [previewLetter, setPreviewLetter] = useState<OfficialLetter | null>(null);

  // Jamaah
  const [isJamaahFormOpen, setIsJamaahFormOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [editingJamaah, setEditingJamaah] = useState<Jamaah | null>(null);
  const [detailJamaah, setDetailJamaah] = useState<Jamaah | null>(null);

  // Finance & Donors
  const [isFridayReportOpen, setIsFridayReportOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);
  const [isCreateDonorOpen, setIsCreateDonorOpen] = useState(false);

  // Assets
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetItem | null>(null);

  // LPJ
  const [previewLPJ, setPreviewLPJ] = useState<LPJReport | null>(null);

  // Auth & Admin
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAuditLogModalOpen, setIsAuditLogModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Mobile Drawer
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return {
    isCreateLetterOpen,
    setIsCreateLetterOpen,
    isArchiveLetterModalOpen,
    setIsArchiveLetterModalOpen,
    previewLetter,
    setPreviewLetter,
    isJamaahFormOpen,
    setIsJamaahFormOpen,
    isExcelModalOpen,
    setIsExcelModalOpen,
    editingJamaah,
    setEditingJamaah,
    detailJamaah,
    setDetailJamaah,
    isFridayReportOpen,
    setIsFridayReportOpen,
    isTransactionModalOpen,
    setIsTransactionModalOpen,
    editingTransaction,
    setEditingTransaction,
    isCreateDonorOpen,
    setIsCreateDonorOpen,
    isAssetModalOpen,
    setIsAssetModalOpen,
    editingAsset,
    setEditingAsset,
    previewLPJ,
    setPreviewLPJ,
    isLoginModalOpen,
    setIsLoginModalOpen,
    isAuditLogModalOpen,
    setIsAuditLogModalOpen,
    isBackupModalOpen,
    setIsBackupModalOpen,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
  };
}
