'use client';

import { useCallback } from 'react';
import { AppNavTab } from '@/components/layout/sidebar';
import { SafeUser } from '@/types/auth';
import { OfficialLetter, LetterStatus } from '@/types/letter';
import { Jamaah } from '@/types/jamaah';
import { FinanceTransaction } from '@/types/finance';
import { AssetItem } from '@/types/asset';
import { ApprovalStatus, ApprovalType } from '@/types/reports';
import { ConfirmOptions } from '@/lib/confirm-context';

interface UseAppHandlersParams {
  currentUser: SafeUser;
  isReadOnly: boolean;
  canMutateTab: (tab: AppNavTab) => boolean;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;

  fetchLetters: () => Promise<void>;
  fetchJamaah: () => Promise<void>;
  fetchFinance: () => Promise<void>;
  fetchAssets: () => Promise<void>;
  fetchApprovals: () => Promise<void>;
  setLetters: React.Dispatch<React.SetStateAction<OfficialLetter[]>>;

  setIsCreateLetterOpen: (open: boolean) => void;
  setEditingJamaah: (jamaah: Jamaah | null) => void;
  setIsJamaahFormOpen: (open: boolean) => void;
  setEditingTransaction: (tx: FinanceTransaction | null) => void;
  setIsTransactionModalOpen: (open: boolean) => void;
  setEditingAsset: (asset: AssetItem | null) => void;
  setIsAssetModalOpen: (open: boolean) => void;
}

export function useAppHandlers(params: UseAppHandlersParams) {
  const {
    currentUser,
    isReadOnly,
    canMutateTab,
    showToast,
    confirm,
    fetchLetters,
    fetchJamaah,
    fetchFinance,
    fetchAssets,
    fetchApprovals,
    setLetters,
    setIsCreateLetterOpen,
    setEditingJamaah,
    setIsJamaahFormOpen,
    setEditingTransaction,
    setIsTransactionModalOpen,
    setEditingAsset,
    setIsAssetModalOpen,
  } = params;

  // Letters Handlers
  const handleOpenCreateLetter = useCallback(() => {
    if (!canMutateTab('create')) {
      showToast('Wewenang terbatas: Hanya Sekretaris atau Ketua yang dapat membuat surat');
      return;
    }
    setIsCreateLetterOpen(true);
  }, [canMutateTab, showToast, setIsCreateLetterOpen]);

  const handleLetterCreated = useCallback((newLetter: OfficialLetter) => {
    setLetters((prev) => [newLetter, ...prev]);
    showToast(`Surat No. ${newLetter.letterNumber} berhasil diterbitkan`);
  }, [setLetters, showToast]);

  const handleArchiveLetterSaved = useCallback(() => {
    fetchLetters();
    showToast('Surat berhasil dicatat ke e-arsip');
  }, [fetchLetters, showToast]);

  const handleUpdateStatus = useCallback(async (id: string, status: LetterStatus) => {
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
  }, [canMutateTab, showToast, setLetters]);

  // Jamaah Handlers
  const handleOpenCreateJamaah = useCallback(() => {
    if (!canMutateTab('jamaah')) {
      showToast('Wewenang terbatas: Hanya Bidang Kemasjidan yang dapat menambah data jamaah');
      return;
    }
    setEditingJamaah(null);
    setIsJamaahFormOpen(true);
  }, [canMutateTab, showToast, setEditingJamaah, setIsJamaahFormOpen]);

  const handleEditJamaah = useCallback((jamaah: Jamaah) => {
    if (!canMutateTab('jamaah')) {
      showToast('Wewenang terbatas: Hanya Bidang Kemasjidan yang dapat mengubah data jamaah');
      return;
    }
    setEditingJamaah(jamaah);
    setIsJamaahFormOpen(true);
  }, [canMutateTab, showToast, setEditingJamaah, setIsJamaahFormOpen]);

  const handleJamaahSaved = useCallback(() => {
    fetchJamaah();
    showToast('Data warga berhasil disimpan');
  }, [fetchJamaah, showToast]);

  const handleImportSuccess = useCallback((imported: Jamaah[]) => {
    fetchJamaah();
    showToast(`Berhasil mengimpor ${imported.length} data jamaah`);
  }, [fetchJamaah, showToast]);

  // Finance Handlers
  const handleOpenCreateTransaction = useCallback(() => {
    if (!canMutateTab('finance')) {
      showToast('Wewenang terbatas: Hanya Bendahara yang dapat mencatat mutasi kas');
      return;
    }
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  }, [canMutateTab, showToast, setEditingTransaction, setIsTransactionModalOpen]);

  const handleEditTransaction = useCallback((tx: FinanceTransaction) => {
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
  }, [isReadOnly, canMutateTab, showToast, setEditingTransaction, setIsTransactionModalOpen]);

  const handleDeleteTransaction = useCallback(async (id: string, desc: string) => {
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
  }, [isReadOnly, canMutateTab, confirm, fetchFinance, showToast]);

  const handleTransactionSaved = useCallback(() => {
    fetchFinance();
    showToast('Transaksi kas berhasil dibukukan');
  }, [fetchFinance, showToast]);

  // Asset Handlers
  const handleOpenCreateAsset = useCallback(() => {
    if (!canMutateTab('assets')) {
      showToast('Wewenang terbatas: Hanya Koordinator Sarpras yang dapat mendaftarkan aset');
      return;
    }
    setEditingAsset(null);
    setIsAssetModalOpen(true);
  }, [canMutateTab, showToast, setEditingAsset, setIsAssetModalOpen]);

  const handleEditAsset = useCallback((asset: AssetItem) => {
    if (!canMutateTab('assets')) {
      showToast('Wewenang terbatas: Hanya Koordinator Sarpras yang dapat mengubah aset');
      return;
    }
    setEditingAsset(asset);
    setIsAssetModalOpen(true);
  }, [canMutateTab, showToast, setEditingAsset, setIsAssetModalOpen]);

  const handleAssetSaved = useCallback(() => {
    fetchAssets();
    showToast('Aset inventaris berhasil disimpan');
  }, [fetchAssets, showToast]);

  const handleDeleteAsset = useCallback(async (id: string, name: string) => {
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
  }, [isReadOnly, canMutateTab, confirm, fetchAssets, showToast]);

  const handleRecordMaintenance = useCallback(async (assetId: string, notes?: string) => {
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
  }, [canMutateTab, showToast, fetchAssets]);

  // Approval Handlers
  const handleVerifyApproval = useCallback(async (id: string, status: ApprovalStatus, notes?: string) => {
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
  }, [currentUser, fetchApprovals, showToast]);

  const handleSubmitNewApproval = useCallback(async (data: {
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
  }, [currentUser, fetchApprovals, showToast]);

  return {
    handleOpenCreateLetter,
    handleLetterCreated,
    handleArchiveLetterSaved,
    handleUpdateStatus,
    handleOpenCreateJamaah,
    handleEditJamaah,
    handleJamaahSaved,
    handleImportSuccess,
    handleOpenCreateTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    handleTransactionSaved,
    handleOpenCreateAsset,
    handleEditAsset,
    handleAssetSaved,
    handleDeleteAsset,
    handleRecordMaintenance,
    handleVerifyApproval,
    handleSubmitNewApproval,
  };
}
