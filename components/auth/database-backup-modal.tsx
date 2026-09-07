'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HardDrive,
  Cloud,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { useConfirm } from '@/lib/confirm-context';

interface DatabaseStats {
  path: string;
  sizeBytes: number;
  engine?: 'turso_cloud' | 'local_sqlite' | 'vercel_tmp';
  engineLabel?: string;
  cloudConnected?: boolean;
  totalLetters: number;
  totalMinutes: number;
  totalJamaah: number;
  totalTransactions: number;
  totalDonors: number;
  totalAssets: number;
  totalApprovals: number;
  totalAuditLogs: number;
  totalKhatib?: number;
  totalFridaySchedules?: number;
  totalRamadhanSchedules?: number;
  totalKajianSchedules?: number;
  totalPhysicalProjects?: number;
  totalSssCans?: number;
  totalSssRecords?: number;
  totalZiswafAids?: number;
  totalUsers?: number;
  managedTablesCount?: number;
}

interface HealthTableReport {
  table: string;
  label: string;
  tursoCount: number | null;
  localCount: number | null;
  drift: number;
  status: 'SYNCED' | 'DRIFT_DETECTED' | 'SINGLE_ENGINE' | 'UNAVAILABLE';
}

interface HealthCheckResult {
  overallStatus: 'HEALTHY' | 'DRIFT_DETECTED' | 'SINGLE_ENGINE';
  healthScore: number;
  checkedAt: string;
  tursoConnected: boolean;
  dualEngineActive: boolean;
  summary: {
    totalTables: number;
    syncedTables: number;
    singleEngineTables: number;
    driftTables: number;
  };
  tables: HealthTableReport[];
}

interface DatabaseBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored?: () => void;
}

export default function DatabaseBackupModal({
  isOpen,
  onClose,
  onDataRestored,
}: DatabaseBackupModalProps) {
  const { confirm } = useConfirm();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [isHealthLoading, setIsHealthLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/database/backup?type=stats');
      const json = await res.json();
      if (json.success) {
        setStats(json.stats);
      }
    } catch (err) {
      console.error('Failed to fetch database stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    fetch('/api/database/backup?type=stats')
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setStats(json.stats);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch database stats on mount:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const fetchHealth = useCallback(async () => {
    setIsHealthLoading(true);
    try {
      const res = await fetch('/api/database/health');
      const json = await res.json();
      if (json.success) {
        setHealthData(json.health);
      }
    } catch (err) {
      console.error('Failed to fetch health check:', err);
    } finally {
      setIsHealthLoading(false);
    }
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    setRestoreSuccess(null);
    setRestoreError(null);
    setSelectedFile(null);
    onClose();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadBackup = () => {
    window.open('/api/database/backup?download=true', '_blank');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setRestoreSuccess(null);
      setRestoreError(null);
    }
  };

  const handleRestoreSubmit = async () => {
    if (!selectedFile) return;

    const ok = await confirm({
      title: 'Peringatan Pemulihan Basis Data',
      message: 'Memulihkan basis data akan menimpa data aktif saat ini dengan data dari berkas cadangan snapshot. Apakah Anda yakin ingin melanjutkan?',
      confirmText: 'Ya, Pulihkan Data',
      variant: 'danger',
    });
    if (!ok) return;

    setIsRestoring(true);
    setRestoreSuccess(null);
    setRestoreError(null);

    try {
      const fileText = await selectedFile.text();
      const parsedData = JSON.parse(fileText);

      const res = await fetch('/api/database/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedData),
      });

      const json = await res.json();
      if (json.success) {
        setRestoreSuccess(json.message || 'Basis data berhasil dipulihkan secara utuh!');
        fetchStats();
        if (fileInputRef.current) fileInputRef.current.value = '';
        setSelectedFile(null);
        if (onDataRestored) {
          onDataRestored();
        }
      } else {
        setRestoreError(json.error || 'Gagal memulihkan basis data.');
      }
    } catch (err: unknown) {
      console.error('Error restoring backup file:', err);
      const errMsg = err instanceof Error ? err.message : 'Berkas cadangan tidak valid atau rusak.';
      setRestoreError(`Format JSON tidak valid: ${errMsg}`);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="backup-modal-title"
      className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-hidden"
    >
      <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border-t md:border border-slate-100 w-full md:max-w-3xl overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header Modal */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 sm:space-x-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md p-2 flex items-center justify-center border border-white/20 shadow-inner shrink-0">
              <Image
                src="/logo-babul-khaer.png"
                alt="Logo Masjid Babul Khaer"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h2 id="backup-modal-title" className="text-base sm:text-xl font-bold tracking-tight truncate">
                  Pusat Cadangan & Pemulihan Data
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold bg-emerald-500/30 text-emerald-100 border border-emerald-400/30 whitespace-nowrap">
                  {stats?.engine === 'turso_cloud' ? 'Turso Cloud' : 'SQLite'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-100/90 font-medium truncate">
                {stats?.engine === 'turso_cloud'
                  ? 'Cloud Terdistribusi — Permanen & Aman'
                  : 'Penyimpanan Mandiri — Server Lokal'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors shrink-0 ml-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-5 sm:space-y-6 flex-1 bg-slate-50/50">
          {/* Status Database Disk */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border font-semibold shrink-0 ${
                    stats?.engine === 'turso_cloud'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : stats?.engine === 'vercel_tmp'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {stats?.engine === 'turso_cloud' ? (
                    <Cloud className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Database className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="text-sm font-bold text-slate-800">
                      Status Basis Data Aktif
                    </h3>
                    {stats?.engine === 'turso_cloud' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Cloud SQLite (Permanen)
                      </span>
                    )}
                    {stats?.engine === 'vercel_tmp' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                        Vercel Temporer (/tmp)
                      </span>
                    )}
                    {stats?.engine === 'local_sqlite' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                        Disk Lokal
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {stats?.path || 'data/sik_mbh.sqlite'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end space-x-2 shrink-0">
                {stats?.engine === 'turso_cloud' ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                    Turso Online (Region sin1)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                    WAL Mode Aktif
                  </span>
                )}
                <button
                  onClick={fetchStats}
                  disabled={isLoading}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Perbarui status"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Statistik Tabel Data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Ukuran File</span>
                <span className="text-base font-bold text-slate-800">
                  {stats ? formatBytes(stats.sizeBytes) : '...'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Surat & Notulen</span>
                <span className="text-base font-bold text-emerald-700">
                  {stats ? `${stats.totalLetters} / ${stats.totalMinutes}` : '...'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Jamaah & Donatur</span>
                <span className="text-base font-bold text-teal-700">
                  {stats ? `${stats.totalJamaah} / ${stats.totalDonors}` : '...'}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium block">Transaksi & Aset</span>
                <span className="text-base font-bold text-blue-700">
                  {stats ? `${stats.totalTransactions} / ${stats.totalAssets}` : '...'}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback Alert */}
          {restoreSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start space-x-3 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-900">Pemulihan Sukses!</p>
                <p className="text-xs text-emerald-700 mt-0.5">{restoreSuccess}</p>
              </div>
            </div>
          )}

          {restoreError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start space-x-3 animate-fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-rose-900">Gagal Memulihkan Data</p>
                <p className="text-xs text-rose-700 mt-0.5">{restoreError}</p>
              </div>
            </div>
          )}

          {/* 2 Panel: Backup & Restore */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel Unduh Cadangan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Unduh Cadangan (Backup)
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Ekspor seluruh data operasional (Surat dinas, notulensi AI, sensus jamaah RT 01-05, buku kas, donatur tetap, aset sarpras, dan log audit) ke dalam satu berkas JSON terstruktur.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  onClick={handleDownloadBackup}
                  className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all shadow-sm hover:shadow active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Berkas Cadangan (.json)</span>
                </button>
                <span className="block text-[11px] text-center text-slate-400 mt-2">
                  Dapat disimpan di Google Drive atau flashdisk pengurus
                </span>
              </div>
            </div>

            {/* Panel Pulihkan Cadangan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 mb-3">
                  <Upload className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">
                  Pulihkan Data (Restore)
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Unggah berkas cadangan JSON yang sebelumnya pernah diunduh untuk mengembalikan seluruh sistem ke kondisi saat cadangan dibuat.
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />

                <button
                  onClick={handleRestoreSubmit}
                  disabled={!selectedFile || isRestoring}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition-all ${
                    selectedFile && !isRestoring
                      ? 'bg-teal-700 hover:bg-teal-800 text-white shadow-sm hover:shadow active:scale-[0.99]'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isRestoring ? 'animate-spin' : ''}`} />
                  <span>{isRestoring ? 'Memulihkan Data...' : 'Mulai Pemulihan Data'}</span>
                </button>

                <span className="block text-[11px] text-center text-amber-600 font-medium">
                  Pastikan memilih berkas cadangan resmi SIK-MBH
                </span>
              </div>
            </div>
          </div>

          {/* Health Check Dual-Engine */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-700 flex items-center justify-center border border-violet-200">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Health Check Dual-Engine
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Perbandingan jumlah baris per tabel antara Turso Cloud vs SQLite
                  </p>
                </div>
              </div>
              <button
                onClick={fetchHealth}
                disabled={isHealthLoading}
                className="px-3 py-1.5 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isHealthLoading ? 'animate-spin' : ''}`} />
                <span>{isHealthLoading ? 'Memeriksa...' : 'Jalankan Health Check'}</span>
              </button>
            </div>

            {healthData ? (
              <div className="space-y-4">
                {/* Overall Status Badge */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  healthData.overallStatus === 'HEALTHY'
                    ? 'bg-emerald-50 border-emerald-200'
                    : healthData.overallStatus === 'DRIFT_DETECTED'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className={`w-5 h-5 ${
                      healthData.overallStatus === 'HEALTHY'
                        ? 'text-emerald-600'
                        : healthData.overallStatus === 'DRIFT_DETECTED'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`} />
                    <div>
                      <span className={`text-sm font-bold ${
                        healthData.overallStatus === 'HEALTHY'
                          ? 'text-emerald-800'
                          : healthData.overallStatus === 'DRIFT_DETECTED'
                          ? 'text-amber-800'
                          : 'text-blue-800'
                      }`}>
                        {healthData.overallStatus === 'HEALTHY'
                          ? 'Sistem Sehat — Semua Tabel Tersinkronisasi'
                          : healthData.overallStatus === 'DRIFT_DETECTED'
                          ? `Drift Terdeteksi — ${healthData.summary.driftTables} Tabel Tidak Sinkron`
                          : 'Single Engine — Hanya Satu Engine Aktif'}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Diperiksa: {new Date(healthData.checkedAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className={`text-2xl font-black ${
                    healthData.healthScore >= 90
                      ? 'text-emerald-700'
                      : healthData.healthScore >= 70
                      ? 'text-amber-700'
                      : 'text-rose-700'
                  }`}>
                    {healthData.healthScore}%
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-center">
                    <span className="text-lg font-bold text-slate-800">{healthData.summary.totalTables}</span>
                    <span className="block text-[10px] text-slate-500 font-medium">Total Tabel</span>
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 text-center">
                    <span className="text-lg font-bold text-emerald-700">{healthData.summary.syncedTables}</span>
                    <span className="block text-[10px] text-emerald-600 font-medium">Sinkron</span>
                  </div>
                  <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100 text-center">
                    <span className="text-lg font-bold text-blue-700">{healthData.summary.singleEngineTables}</span>
                    <span className="block text-[10px] text-blue-600 font-medium">Single Engine</span>
                  </div>
                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 text-center">
                    <span className="text-lg font-bold text-amber-700">{healthData.summary.driftTables}</span>
                    <span className="block text-[10px] text-amber-600 font-medium">Drift</span>
                  </div>
                </div>

                {/* Per-Table Detail */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600">
                        <th className="text-left py-2 px-3 font-semibold">Tabel</th>
                        <th className="text-center py-2 px-3 font-semibold">Turso Cloud</th>
                        <th className="text-center py-2 px-3 font-semibold">SQLite Lokal</th>
                        <th className="text-center py-2 px-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {healthData.tables.map((row, idx) => (
                        <tr key={row.table} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                          <td className="py-1.5 px-3">
                            <span className="font-semibold text-slate-700">{row.label}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{row.table}</span>
                          </td>
                          <td className="text-center py-1.5 px-3 font-mono font-bold text-slate-700">
                            {row.tursoCount !== null ? row.tursoCount : '—'}
                          </td>
                          <td className="text-center py-1.5 px-3 font-mono font-bold text-slate-700">
                            {row.localCount !== null ? row.localCount : '—'}
                          </td>
                          <td className="text-center py-1.5 px-3">
                            {row.status === 'SYNCED' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                ✅ Sinkron
                              </span>
                            )}
                            {row.status === 'DRIFT_DETECTED' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                ⚠️ Drift {row.drift}
                              </span>
                            )}
                            {row.status === 'SINGLE_ENGINE' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                                ℹ️ Single
                              </span>
                            )}
                            {row.status === 'UNAVAILABLE' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                                — N/A
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Tekan &quot;Jalankan Health Check&quot; untuk memeriksa kondisi sinkronisasi dual-engine</p>
                <p className="text-[11px] mt-1">Membandingkan 19 tabel antara Turso Cloud dan SQLite Lokal</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100/70 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center space-x-1.5 text-center sm:text-left">
            <HardDrive className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-[11px] sm:text-xs">Penyimpanan lokal: Mesin host lokal (Zero Cloud Dependency)</span>
          </div>
          <button
            onClick={handleClose}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-xl border border-slate-200 transition-colors shadow-sm text-center flex items-center justify-center"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
