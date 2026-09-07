'use client';

import React, { useState } from 'react';
import { 
  PlusCircle, 
  X, 
  Send, 
  AlertTriangle
} from 'lucide-react';
import { SeksiType } from '@/types/program-kerja';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

interface NewProgramProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function NewProgramProposalModal({ isOpen, onClose, onSuccess }: NewProgramProposalModalProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [seksi, setSeksi] = useState<SeksiType>('PERIBADATAN_DAKWAH');
  const [amount, setAmount] = useState('');

  const [fundingSource, setFundingSource] = useState('Kas Masjid DKM');
  const [targetDate, setTargetDate] = useState('');
  const [background, setBackground] = useState('');
  const [rabSummary, setRabSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !background.trim()) {
      toast.error('Data Belum Lengkap', 'Judul program dan latar belakang urgensi wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    const fullDescription = `[USULAN PROGRAM KERJA BARU]\nSeksi: ${seksi}\nSumber Dana: ${fundingSource}\nTarget Pelaksanaan: ${targetDate || 'Fleksibel'}\n\nLatar Belakang & Urgensi:\n${background}\n\nRingkasan RAB:\n${rabSummary || 'Terlampir dalam proposal fisik'}`;

    try {
      const response = await fetch('/api/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'USULAN_PROGRAM',
          title: `[Usulan Baru] ${title.trim()}`,
          referenceNumber: `PROP-BK/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`,
          category: seksi,
          submittedBy: currentUser?.name || currentUser?.roleLabel || 'Pengurus Seksi DKM',
          submittedRole: currentUser?.roleLabel || 'Pengurus DKM',
          amount: amount ? Number(amount) : 0,
          description: fullDescription,
        }),
      });

      const resData = await response.json();

      if (resData.success) {
        toast.success('Usulan Program Terkirim', 'Usulan telah masuk ke antrean Persetujuan Satu Pintu Ketua DKM.');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error('Pengajuan Gagal', resData.error || 'Terjadi kesalahan sistem saat mengajukan program.');
      }
    } catch (err: unknown) {
      console.error('Error submitting program proposal:', err);
      toast.error('Koneksi Bermasalah', 'Gagal mengirim usulan ke server. Pastikan Anda telah login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <PlusCircle className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-base">Ajukan Usulan Program Kerja Baru</h3>
              <p className="text-xs text-emerald-200">
                Pintu Usulan Insidental di luar Raker Awal untuk Disposisi Ketua DKM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p className="text-[11px] leading-relaxed">
              Program baru yang diajukan akan otomatis diverifikasi dalam <strong>Modul Persetujuan Satu Pintu</strong>. Setelah disetujui Ketua DKM, anggaran akan dialokasikan dan tercatat pada buku APBD resmi.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Judul Usulan Program Kerja *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Penggantian Mesin Pompa Air Wudhu & Filter RO Darurat"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Seksi / Bidang Pengusul *
              </label>
              <select
                value={seksi}
                onChange={(e) => setSeksi(e.target.value as SeksiType)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
              >
                <option value="PERIBADATAN_DAKWAH">Seksi Peribadatan & Dakwah</option>
                <option value="PENDIDIKAN_REMAJA">Seksi Pendidikan & Remaja</option>
                <option value="PEMBANGUNAN">Seksi Pembangunan</option>
                <option value="SARANA_PRASARANA">Seksi Sarana & Prasarana</option>
                <option value="HUMAS_SOSIAL">Seksi Humas & Sosial Kemasyarakatan</option>
                <option value="ZISWAF_MUSTAHIQ">Seksi ZISWAF & Pemberdayaan Mustahiq</option>
                <option value="PEREMPUAN_TPA">Seksi Pemberdayaan Perempuan & TPA</option>
                <option value="KEAMANAN_LINGKUNGAN">Seksi Keamanan & Ketertiban Lingkungan</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Target Tanggal Pelaksanaan
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Estimasi Anggaran Dibutuhkan (Rp) *
              </label>
              <input
                type="number"
                placeholder="Contoh: 4500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Rencana Sumber Pendanaan
              </label>
              <select
                value={fundingSource}
                onChange={(e) => setFundingSource(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
              >
                <option value="Kas Masjid DKM">Kas Operasional Masjid</option>
                <option value="Donatur Khusus / Swadaya Jamaah">Donatur Khusus / Swadaya Jamaah</option>
                <option value="Infaq Kotak Khusus / Jumat">Infaq Kotak Khusus Jumat</option>
                <option value="Sponsorship / Bantuan Instansi">Sponsorship / Bantuan Pemkot/Kemenag</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Latar Belakang, Manfaat & Urgensi Program *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Jelaskan alasan mendesak pelaksanaan kegiatan ini serta manfaat langsung bagi kenyamanan jamaah atau kemaslahatan masjid..."
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">
              Rincian Rencana Anggaran Biaya (RAB Singkat)
            </label>
            <textarea
              rows={3}
              placeholder="Contoh: 1. Pembelian Mesin Pompa Shimizu 250W: Rp 1.850.000&#10;2. Filter & Pipa PVC 1/2 inch: Rp 450.000&#10;3. Ongkos Tukang 2 Hari: Rp 500.000..."
              value={rabSummary}
              onChange={(e) => setRabSummary(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="text-slate-500 text-[11px]">
              Pengusul: <strong>{currentUser?.name || currentUser?.roleLabel || 'Pengurus Seksi'}</strong>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white rounded-lg shadow-md transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Mengirim...' : 'Ajukan Usulan ke Ketua'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
