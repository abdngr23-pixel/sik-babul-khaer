'use client';

import React, { useState } from 'react';
import { ApprovalItem, ApprovalStatus, ApprovalType } from '@/types/reports';
import { formatRupiah } from '@/components/finance/finance-stats';
import { useAuth } from '@/lib/auth-context';
import { useModalBackHandler } from '@/lib/back-button-handler';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Plus,
  FileText,
  Wallet,
  Wrench,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface ApprovalBoardProps {
  approvals: ApprovalItem[];
  onVerify: (id: string, status: ApprovalStatus, dispositionNotes?: string) => void;
  onSubmitNewApproval: (item: {
    type: ApprovalType;
    title: string;
    category: string;
    submittedBy: string;
    submittedRole: string;
    amount?: number;
    description: string;
  }) => void;
}

export default function ApprovalBoard({
  approvals,
  onVerify,
  onSubmitNewApproval,
}: ApprovalBoardProps) {
  const { currentUser, isReadOnly } = useAuth();
  const canExecute = (currentUser.role === 'KETUA_UMUM' || currentUser.role === 'SUPER_ADMIN') && !isReadOnly;

  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // New Submission State
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ApprovalType>('PENCAIRAN_DANA');
  const [newCategory, setNewCategory] = useState('Swadaya PHBI');
  const [newSubmittedBy, setNewSubmittedBy] = useState('Ir. Muhammad Natsir, S.T.');
  const [newSubmittedRole, setNewSubmittedRole] = useState('Sekretaris Umum');
  const [newAmount, setNewAmount] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Disposition Prompt State
  const [activeActionItem, setActiveActionItem] = useState<{
    id: string;
    title: string;
    action: ApprovalStatus;
  } | null>(null);
  const [dispositionNotes, setDispositionNotes] = useState('');

  // Mobile Hardware Back Button handlers
  useModalBackHandler(isSubmitModalOpen, () => setIsSubmitModalOpen(false), 'approval-submit');
  useModalBackHandler(Boolean(activeActionItem), () => setActiveActionItem(null), 'approval-action');

  // Filter approvals
  const filtered = approvals.filter((a) => {
    if (selectedStatus === 'ALL') return true;
    return a.status === selectedStatus;
  });

  const pendingCount = approvals.filter((a) => a.status === 'MENUNGGU_VERIFIKASI').length;
  const approvedCount = approvals.filter((a) => a.status === 'DISETUJUI').length;
  const revisionCount = approvals.filter((a) => a.status === 'PERLU_REVISI').length;

  const getTypeBadge = (type: ApprovalType) => {
    switch (type) {
      case 'SURAT_KELUAR':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
            <FileText className="w-3 h-3 text-emerald-600" />
            Surat Resmi
          </span>
        );
      case 'PENCAIRAN_DANA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
            <Wallet className="w-3 h-3 text-amber-600" />
            Pencairan Kas
          </span>
        );
      case 'PENGADAAN_SARPRAS':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
            <Wrench className="w-3 h-3 text-blue-600" />
            Pengadaan Sarpras
          </span>
        );
      case 'DRAF_LPJ':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            Draf LPJ
          </span>
        );
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    switch (status) {
      case 'MENUNGGU_VERIFIKASI':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            Menunggu Verifikasi
          </span>
        );
      case 'DISETUJUI':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Telah Disahkan
          </span>
        );
      case 'PERLU_REVISI':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3 h-3 text-rose-600" />
            Perlu Revisi
          </span>
        );
    }
  };

  const handleConfirmDisposition = () => {
    if (!activeActionItem) return;
    onVerify(activeActionItem.id, activeActionItem.action, dispositionNotes.trim());
    setActiveActionItem(null);
    setDispositionNotes('');
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onSubmitNewApproval({
      type: newType,
      title: newTitle.trim(),
      category: newCategory.trim(),
      submittedBy: newSubmittedBy.trim(),
      submittedRole: newSubmittedRole.trim(),
      amount: newAmount ? Number(newAmount) : undefined,
      description: newDescription.trim(),
    });

    setIsSubmitModalOpen(false);
    setNewTitle('');
    setNewAmount('');
    setNewDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Executive Authority Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-lg border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Alur Validasi Satu Pintu Ketua Umum
              </span>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                Otoritas Eksekutif
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Persetujuan Dokumen Resmi & Disposisi Anggaran Kas
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Memastikan seluruh surat keluar, pencairan dana kas di atas batas ketentuan, dan draf pertanggungjawaban terverifikasi sebelum disebarkan atau dicairkan.
            </p>
          </div>
        </div>

        {!isReadOnly && (
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 self-end md:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>+ Ajukan Pengesahan Baru</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Counter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Semua Pengajuan ({approvals.length})
          </button>

          <button
            onClick={() => setSelectedStatus('MENUNGGU_VERIFIKASI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'MENUNGGU_VERIFIKASI'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Menunggu Verifikasi ({pendingCount})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('DISETUJUI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'DISETUJUI'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Disahkan ({approvedCount})</span>
          </button>

          <button
            onClick={() => setSelectedStatus('PERLU_REVISI')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'PERLU_REVISI'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Perlu Revisi ({revisionCount})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 text-right">
          Otoritas Pengesah: <span className="font-bold text-slate-800">Drs. Muhammad Hasri, M. Hum.</span>
        </div>
      </div>

      {/* Approval Items List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
            Tidak ada pengajuan yang sesuai dengan kriteria filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all ${
                item.status === 'MENUNGGU_VERIFIKASI'
                  ? 'border-amber-300 ring-1 ring-amber-200/50 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    {getTypeBadge(item.type)}
                    <span className="text-[10px] font-mono text-slate-400">
                      {item.referenceNumber || item.id}
                    </span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {new Date(item.submittedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                    <div>
                      Diajukan oleh:{' '}
                      <span className="font-semibold text-slate-700">
                        {item.submittedBy}
                      </span>{' '}
                      ({item.submittedRole})
                    </div>
                    {item.amount && item.amount > 0 && (
                      <div className="text-amber-800 font-extrabold bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                        Nominal: {formatRupiah(item.amount)}
                      </div>
                    )}
                  </div>

                  {/* Disposition Audit Trail Box */}
                  {item.dispositionNotes && (
                    <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px] mb-0.5">
                        <Send className="w-3 h-3 text-indigo-600" />
                        <span>Catatan Disposisi Ketua Umum ({item.verifiedBy || 'Ketua Umum'}):</span>
                      </div>
                      <p className="text-slate-600 italic pl-4">
                        &quot;{item.dispositionNotes}&quot;
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Side: Status & Action Buttons */}
                <div className="flex flex-col items-end gap-2.5 shrink-0 self-stretch md:self-center border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div>{getStatusBadge(item.status)}</div>

                  {/* Actions for Pending Verification */}
                  {item.status === 'MENUNGGU_VERIFIKASI' && (
                    <div className="flex items-center gap-2 mt-1">
                      {canExecute ? (
                        <>
                          <button
                            onClick={() =>
                              setActiveActionItem({
                                id: item.id,
                                title: item.title,
                                action: 'PERLU_REVISI',
                              })
                            }
                            className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Minta Revisi
                          </button>

                          <button
                            onClick={() =>
                              setActiveActionItem({
                                id: item.id,
                                title: item.title,
                                action: 'DISETUJUI',
                              })
                            }
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sahkan / Setujui</span>
                          </button>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>Hak Disposisi: Ketua Umum</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Prompt Disposisi Ketua */}
      {activeActionItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 overflow-hidden animate-in fade-in">
          <div className="bg-white rounded-t-3xl md:rounded-2xl max-w-md w-full p-5 md:p-6 shadow-2xl border border-slate-200 space-y-4 animate-slide-up md:animate-none pb-[max(1rem,env(safe-area-inset-bottom))]">
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-1 md:hidden shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {activeActionItem.action === 'DISETUJUI'
                  ? 'Pengesahan Satu Pintu Ketua Umum'
                  : 'Pengembalian untuk Revisi'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                {activeActionItem.title}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Disposisi Resmi (Opsional):
              </label>
              <textarea
                value={dispositionNotes}
                onChange={(e) => setDispositionNotes(e.target.value)}
                rows={3}
                placeholder={
                  activeActionItem.action === 'DISETUJUI'
                    ? 'Contoh: Disetujui untuk dicairkan segera dari pos anggaran terkait...'
                    : 'Contoh: Mohon koordinasikan ulang dengan Bendahara mengenai kwitansi pembanding...'
                }
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
            </div>

            <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setActiveActionItem(null);
                  setDispositionNotes('');
                }}
                className="w-full md:w-auto px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer text-center flex items-center justify-center"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDisposition}
                className={`w-full md:w-auto px-4 py-2.5 min-h-[44px] text-xs font-bold text-white rounded-xl shadow-xs cursor-pointer text-center flex items-center justify-center ${
                  activeActionItem.action === 'DISETUJUI'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {activeActionItem.action === 'DISETUJUI'
                  ? 'Konfirmasi Pengesahan'
                  : 'Kirimkan Revisi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ajukan Pengesahan Baru */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 overflow-hidden animate-in fade-in">
          <div className="bg-white rounded-t-3xl md:rounded-2xl max-w-lg w-full p-5 md:p-6 shadow-2xl border border-slate-200 space-y-4 h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] overflow-y-auto overscroll-contain animate-slide-up md:animate-none pb-[max(1rem,env(safe-area-inset-bottom))]">
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-1 md:hidden shrink-0" />
            <h3 className="text-base font-bold text-slate-900 border-b pb-2">
              Pengajuan Disposisi / Pengesahan Baru
            </h3>

            <form onSubmit={handleSubmitNew} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Perihal Pengajuan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Pencairan Dana Swadaya PHBI untuk Konsumsi Pengajian"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jenis Pengajuan
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ApprovalType)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="PENCAIRAN_DANA">Pencairan Dana Kas</option>
                    <option value="SURAT_KELUAR">Pengesahan Surat Resmi</option>
                    <option value="PENGADAAN_SARPRAS">Pengadaan Sarpras</option>
                    <option value="DRAF_LPJ">Pengesahan Draf LPJ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Bidang
                  </label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Pengaju
                  </label>
                  <input
                    type="text"
                    value={newSubmittedBy}
                    onChange={(e) => setNewSubmittedBy(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jabatan Pengaju
                  </label>
                  <input
                    type="text"
                    value={newSubmittedRole}
                    onChange={(e) => setNewSubmittedRole(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Anggaran (Rp - jika ada)
                </label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="3500000"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Uraian & Alasan Kebutuhan
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Rincian peruntukan atau latar belakang pengajuan..."
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col-reverse md:flex-row items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="w-full md:w-auto px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer text-center flex items-center justify-center"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-4 py-2.5 min-h-[44px] text-xs font-bold bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl shadow-xs cursor-pointer text-center flex items-center justify-center"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
