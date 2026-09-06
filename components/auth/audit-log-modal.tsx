'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AuditLogEntry, AuditModule } from '@/types/auth';
import {
  X,
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  User,
  FileSpreadsheet,
} from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuditLogModal({ isOpen, onClose }: AuditLogModalProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('ALL');

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const params = new URLSearchParams();
    if (selectedModule !== 'ALL') params.set('module', selectedModule);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());

    fetch(`/api/audit-logs?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success) {
          setLogs(data.data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching audit logs:', err);
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedModule, searchQuery]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedModule !== 'ALL') params.set('module', selectedModule);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const modules: { label: string; value: AuditModule | 'ALL' }[] = [
    { label: 'Semua Modul', value: 'ALL' },
    { label: 'Autentikasi & Akun', value: 'AUTENTIKASI' },
    { label: 'Kesekretariatan', value: 'KESEKRETARIATAN' },
    { label: 'Basis Data Jamaah', value: 'JAMAAH' },
    { label: 'Keuangan & PHBI', value: 'KEUANGAN' },
    { label: 'Sarana Prasarana', value: 'SARPRAS' },
    { label: 'Eksekutif & Disposisi', value: 'EKSEKUTIF' },
  ];

  const formatLogDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' WITA';
    } catch {
      return dateStr;
    }
  };

  const getModuleBadgeColor = (mod: AuditModule) => {
    switch (mod) {
      case 'AUTENTIKASI':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'KESEKRETARIATAN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'JAMAAH':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'KEUANGAN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SARPRAS':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'EKSEKUTIF':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center p-0 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border-t sm:border border-slate-200 w-full sm:max-w-4xl h-[95dvh] sm:h-auto sm:max-h-[92dvh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white p-1 shadow-soft-sm border border-purple-200 flex items-center justify-center shrink-0">
              <Image
                src="/logo-babul-khaer.png"
                alt="Logo Resmi Masjid Babul Khaer"
                width={38}
                height={38}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5 sm:gap-2 leading-tight truncate">
                <span className="truncate">Log Audit Aktivitas Sistem</span>
                <span className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase shrink-0">
                  Pengawas
                </span>
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 leading-tight truncate">
                Transparansi & rekam jejak mutasi DKM Babul Khaer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pelaku, tindakan, atau keterangan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          {/* Module Selector */}
          <div className="flex items-center gap-2">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 cursor-pointer"
            >
              {modules.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleRefresh}
              disabled={isLoading}
              title="Segarkan Log"
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all cursor-pointer"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Log Entries List */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1 bg-slate-100/50">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <RotateCcw className="w-6 h-6 animate-spin text-purple-600" />
              <span>Memuat data audit trail...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              Tidak ada riwayat aktivitas yang cocok dengan filter saat ini.
            </div>
          ) : (
            logs.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition-all space-y-2.5"
              >
                {/* Top Info */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getModuleBadgeColor(
                        item.module
                      )}`}
                    >
                      {item.module}
                    </span>
                    <span className="font-bold text-slate-900">
                      {item.actionLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{formatLogDate(item.timestamp)}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Terverifikasi
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-700 leading-relaxed font-normal">
                  {item.description}
                </p>

                {/* Footer User Info */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold text-slate-800">{item.userName}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">{item.userRoleLabel}</span>
                  </div>
                  {item.ipAddress && (
                    <span className="font-mono text-[10px] text-slate-400">
                      IP: {item.ipAddress}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs text-slate-500 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <span className="font-semibold text-slate-700">Total Aktivitas:</span>
            <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              {logs.length} Rekaman
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 sm:flex-none justify-center px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium flex items-center gap-1.5 transition-all cursor-pointer text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium transition-all cursor-pointer text-xs text-center"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
