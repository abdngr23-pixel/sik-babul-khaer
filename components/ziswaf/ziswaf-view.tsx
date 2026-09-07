'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  HeartHandshake,
  Coins,
  Gift,
  Users,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { SSSCanItem, SSSCollectionRecord, ZiswafAidItem } from '@/types/ziswaf';
import { Jamaah } from '@/types/jamaah';
import { INITIAL_SSS_CANS, INITIAL_SSS_RECORDS, INITIAL_ZISWAF_AIDS } from '@/lib/mock-ziswaf';
import { formatRupiah } from '@/components/finance/finance-stats';
import { useAuth } from '@/lib/auth-context';
import { useModalBackHandler } from '@/lib/back-button-handler';
import RecordSSSModal from './record-sss-modal';
import CreateAidModal from './create-aid-modal';
import AidReceiptModal from './aid-receipt-modal';

interface ZiswafViewProps {
  jamaahList?: Jamaah[];
}

export default function ZiswafView({ jamaahList = [] }: ZiswafViewProps) {
  const { isReadOnly } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'sss' | 'bansos' | 'pemerataan'>('sss');

  // SSS State
  const [sssCans, setSssCans] = useState<SSSCanItem[]>(INITIAL_SSS_CANS);
  const [sssRecords, setSssRecords] = useState<SSSCollectionRecord[]>(INITIAL_SSS_RECORDS);
  const [filterRtSss, setFilterRtSss] = useState<string>('ALL');
  const [filterStatusSss, setFilterStatusSss] = useState<string>('ALL');
  const [searchSss, setSearchSss] = useState<string>('');

  // Bansos State
  const [aidList, setAidList] = useState<ZiswafAidItem[]>(INITIAL_ZISWAF_AIDS);
  const [filterRtBansos, setFilterRtBansos] = useState<string>('ALL');
  const [filterCategoryBansos, setFilterCategoryBansos] = useState<string>('ALL');
  const [searchBansos, setSearchBansos] = useState<string>('');

  // Modals
  const [selectedCanForCollection, setSelectedCanForCollection] = useState<SSSCanItem | null>(null);
  const [isAddCanOpen, setIsAddCanOpen] = useState(false);
  const [isCreateAidOpen, setIsCreateAidOpen] = useState(false);
  const [receiptAidTarget, setReceiptAidTarget] = useState<ZiswafAidItem | null>(null);

  // Mobile Hardware Back Button handlers for ZISWAF modals
  useModalBackHandler(Boolean(selectedCanForCollection), () => setSelectedCanForCollection(null), 'ziswaf-can-collection');
  useModalBackHandler(isAddCanOpen, () => setIsAddCanOpen(false), 'ziswaf-add-can');
  useModalBackHandler(isCreateAidOpen, () => setIsCreateAidOpen(false), 'ziswaf-create-aid');
  useModalBackHandler(Boolean(receiptAidTarget), () => setReceiptAidTarget(null), 'ziswaf-aid-receipt');

  // New Can Form
  const [newCanCode, setNewCanCode] = useState('');
  const [newCanHolder, setNewCanHolder] = useState('');
  const [newCanHouse, setNewCanHouse] = useState('');
  const [newCanRt, setNewCanRt] = useState<'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05'>('RT 01');
  const [newCanPhone, setNewCanPhone] = useState('');
  const [newCanCollector, setNewCanCollector] = useState('Marbot Firman');

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Sync data from Server API on mount
  useEffect(() => {
    fetch('/api/ziswaf')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          if (Array.isArray(res.data.sssCans)) setSssCans(res.data.sssCans);
          if (Array.isArray(res.data.sssRecords)) setSssRecords(res.data.sssRecords);
          if (Array.isArray(res.data.ziswafAids)) setAidList(res.data.ziswafAids);
        }
      })
      .catch((err) => console.warn('Gagal sinkronisasi data ZISWAF dari server:', err));
  }, []);

  // KPI Calculations
  const totalCans = sssCans.length;
  const readyToCollectCount = sssCans.filter((c) => c.status === 'SIAP_TARIK').length;
  const totalSssAccumulated = sssCans.reduce((sum, c) => sum + c.totalCollected, 0);
  const totalAidDistributedRp = aidList.reduce((sum, a) => sum + a.amountValue, 0);

  // Filtered SSS
  const filteredSssCans = useMemo(() => {
    const q = searchSss.toLowerCase().trim();
    return sssCans.filter((c) => {
      if (filterRtSss !== 'ALL' && c.rt !== filterRtSss) return false;
      if (filterStatusSss !== 'ALL' && c.status !== filterStatusSss) return false;
      if (q) {
        return (
          c.canCode.toLowerCase().includes(q) ||
          c.holderName.toLowerCase().includes(q) ||
          c.houseNumber.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [sssCans, filterRtSss, filterStatusSss, searchSss]);

  // Filtered Bansos
  const filteredAids = useMemo(() => {
    const q = searchBansos.toLowerCase().trim();
    return aidList.filter((a) => {
      if (filterRtBansos !== 'ALL' && a.rt !== filterRtBansos) return false;
      if (filterCategoryBansos !== 'ALL' && a.recipientCategory !== filterCategoryBansos) return false;
      if (q) {
        return (
          a.recipientName.toLowerCase().includes(q) ||
          a.aidNumber.toLowerCase().includes(q) ||
          a.address.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [aidList, filterRtBansos, filterCategoryBansos, searchBansos]);

  // Handle Save SSS Collection
  const handleSaveCollection = async (canId: string, amount: number, collector: string, notes: string) => {
    const today = new Date().toISOString().slice(0, 10);
    setSssCans((prev) =>
      prev.map((c) => {
        if (c.id !== canId) return c;
        return {
          ...c,
          lastCollectionDate: today,
          lastAmount: amount,
          totalCollected: c.totalCollected + amount,
          status: 'TERDISTRIBUSI',
          notes: notes || c.notes,
        };
      })
    );

    const target = sssCans.find((c) => c.id === canId);
    if (target) {
      const newRec: SSSCollectionRecord = {
        id: `rec-${Date.now()}`,
        canId,
        canCode: target.canCode,
        collectionDate: today,
        amount,
        rt: target.rt,
        collector,
        depositedToCash: true,
        notes,
      };
      setSssRecords((prev) => [newRec, ...prev]);
    }

    try {
      await fetch('/api/ziswaf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'record-collection',
          canId,
          amount,
          collector,
          notes,
        }),
      });
    } catch (err) {
      console.error('Gagal menyimpan penarikan SSS ke server:', err);
    }

    triggerToast(`Penarikan kaleng ${target?.canCode} sebesar ${formatRupiah(amount)} berhasil dicatat!`);
  };

  // Handle Create New SSS Can
  const handleCreateNewCan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCanHolder.trim() || !newCanCode.trim()) return;

    const newCan: SSSCanItem = {
      id: `sss-${Date.now()}`,
      canCode: newCanCode.trim().toUpperCase(),
      rt: newCanRt,
      houseNumber: newCanHouse.trim() || 'Kompleks BTP Blok AE',
      holderName: newCanHolder.trim(),
      phone: newCanPhone.trim() || '0812-0000-0000',
      distributionDate: new Date().toISOString().slice(0, 10),
      lastCollectionDate: '-',
      lastAmount: 0,
      totalCollected: 0,
      status: 'TERDISTRIBUSI',
      collectorOfficer: newCanCollector,
      notes: 'Distribusi kaleng sedekah baru',
    };

    setSssCans((prev) => [newCan, ...prev]);
    setIsAddCanOpen(false);
    setNewCanCode('');
    setNewCanHolder('');
    setNewCanHouse('');
    setNewCanPhone('');
    triggerToast(`Kaleng SSS ${newCan.canCode} untuk ${newCan.holderName} berhasil didaftarkan!`);

    try {
      await fetch('/api/ziswaf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-can',
          canCode: newCan.canCode,
          rt: newCan.rt,
          houseNumber: newCan.houseNumber,
          holderName: newCan.holderName,
          phone: newCan.phone,
          collectorOfficer: newCan.collectorOfficer,
        }),
      });
    } catch (err) {
      console.error('Gagal mendaftarkan kaleng SSS ke database:', err);
    }
  };

  // Handle Save New Aid
  const handleSaveNewAid = async (newAidData: Omit<ZiswafAidItem, 'id' | 'aidNumber' | 'status'>) => {
    const nextNum = `BS-2026/09/${String(aidList.length + 1).padStart(3, '0')}`;
    const newAid: ZiswafAidItem = {
      ...newAidData,
      id: `aid-${Date.now()}`,
      aidNumber: nextNum,
      receiptNumber: `KW-BS/2026/09/${String(aidList.length + 1).padStart(2, '0')}`,
      status: 'SELESAI',
    };

    setAidList((prev) => [newAid, ...prev]);
    triggerToast(`Penyaluran bantuan untuk ${newAid.recipientName} (${formatRupiah(newAid.amountValue)}) berhasil dicatat!`);

    try {
      await fetch('/api/ziswaf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-aid',
          ...newAidData,
          aidNumber: nextNum,
          receiptNumber: newAid.receiptNumber,
        }),
      });
    } catch (err) {
      console.error('Gagal mencatat penyaluran bansos ZISWAF ke database:', err);
    }
  };

  // List of Mustahiq Jamaah from Sensus for Sub-tab 3
  const mustahiqProfiles = useMemo(() => {
    const list = jamaahList.filter(
      (j) =>
        j.economicStatus === 'MUSTAHIQ_DHUAFA' ||
        j.economicStatus === 'LANSIA_DHUAFA' ||
        j.economicStatus === 'YATIM_PIATU'
    );

    return list.map((j) => {
      // Find latest aid received
      const aidsReceived = aidList.filter(
        (a) => a.jamaahId === j.id || a.recipientName.toLowerCase().includes(j.fullName.toLowerCase())
      );
      const latestAid = aidsReceived[0]; // first is latest
      return {
        jamaah: j,
        latestAid,
        totalAidCount: aidsReceived.length,
      };
    });
  }, [jamaahList, aidList]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-900 text-white text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-300 hover:text-white text-xs">
            Tutup
          </button>
        </div>
      )}

      {/* Top Header & Sub-Tab Navigation Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setActiveSubTab('sss')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'sss'
                ? 'bg-teal-800 text-white shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Coins className="w-3.5 h-3.5 text-amber-300" />
            <span>Sedekah Seribu Sehari (SSS)</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeSubTab === 'sss' ? 'bg-teal-950 text-teal-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {totalCans} Kaleng
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('bansos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'bansos'
                ? 'bg-teal-800 text-white shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Gift className="w-3.5 h-3.5 text-emerald-300" />
            <span>Penyaluran ZISWAF & Bansos</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
              activeSubTab === 'bansos' ? 'bg-teal-950 text-teal-200' : 'bg-slate-200 text-slate-700'
            }`}>
              {aidList.length} Penyaluran
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('pemerataan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'pemerataan'
                ? 'bg-teal-800 text-white shadow-soft-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-teal-300" />
            <span>Pemerataan Mustahiq 5 RT</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-700 font-medium px-3 py-1 bg-slate-50 rounded-lg border border-slate-200">
          <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />
          <span>Bidang III Sosial, ZISWAF & UPZ (Raker 2026)</span>
        </div>
      </div>

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kaleng SSS Tersebar</span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">{totalCans} Kaleng</p>
          <p className="text-[11px] text-teal-700 font-semibold mt-1">
            Tersebar di RT 01 s/d RT 05 BTP Blok AE
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kaleng Siap Ditarik</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-amber-900 mt-2">{readyToCollectCount} Kaleng</p>
          <p className="text-[11px] text-amber-700 font-semibold mt-1">
            Perlu kunjungan marbot / koordinator RT
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Akumulasi Swadaya SSS</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">{formatRupiah(totalSssAccumulated)}</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            Masuk Kas Swadaya DKM Babul Khaer
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Bansos & ZISWAF Tersalur</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Gift className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">{formatRupiah(totalAidDistributedRp)}</p>
          <p className="text-[11px] text-purple-700 font-semibold mt-1">
            {aidList.length} Paket sembako & santunan tunai
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: SEDEKAH SERIBU SEHARI (SSS)                                    */}
      {/* ========================================================================= */}
      {activeSubTab === 'sss' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari kode kaleng, pemegang, no rumah..."
                  value={searchSss}
                  onChange={(e) => setSearchSss(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Filter RT */}
              <select
                value={filterRtSss}
                onChange={(e) => setFilterRtSss(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50"
              >
                <option value="ALL">Semua RT (5 RT)</option>
                <option value="RT 01">RT 01</option>
                <option value="RT 02">RT 02</option>
                <option value="RT 03">RT 03</option>
                <option value="RT 04">RT 04</option>
                <option value="RT 05">RT 05</option>
              </select>

              {/* Filter Status */}
              <select
                value={filterStatusSss}
                onChange={(e) => setFilterStatusSss(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50"
              >
                <option value="ALL">Semua Status Kaleng</option>
                <option value="SIAP_TARIK">Siap Ditarik ({readyToCollectCount})</option>
                <option value="TERDISTRIBUSI">Terdistribusi di Warga</option>
              </select>
            </div>

            {!isReadOnly && (
              <button
                onClick={() => setIsAddCanOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-2 shadow-soft-sm transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Distribusi Kaleng Baru</span>
              </button>
            )}
          </div>

          {/* Table Kaleng SSS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">Kode & Wilayah</th>
                    <th className="px-4 py-3.5">Keluarga Pemegang</th>
                    <th className="px-4 py-3.5">Tanggal Diberikan</th>
                    <th className="px-4 py-3.5">Terakhir Ditarik</th>
                    <th className="px-4 py-3.5 text-right">Akumulasi Swadaya</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    {!isReadOnly && <th className="px-4 py-3.5 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSssCans.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                        Tidak ada kaleng SSS yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredSssCans.map((can) => (
                      <tr key={can.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-mono font-bold text-teal-900">{can.canCode}</div>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 mt-1 inline-block">
                            {can.rt}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{can.holderName}</div>
                          <div className="text-[11px] text-slate-500">{can.houseNumber}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{can.notes}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                          {can.distributionDate}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-mono text-slate-800 font-semibold">{can.lastCollectionDate}</div>
                          {can.lastAmount > 0 && (
                            <span className="text-[10px] text-emerald-700 font-bold">
                              +{formatRupiah(can.lastAmount)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatRupiah(can.totalCollected)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                              can.status === 'SIAP_TARIK'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            }`}
                          >
                            {can.status === 'SIAP_TARIK' ? 'Siap Ditarik' : 'Terdistribusi'}
                          </span>
                        </td>
                        {!isReadOnly && (
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setSelectedCanForCollection(can)}
                              className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                            >
                              Tarik Sedekah
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Riwayat Penarikan SSS Terbaru */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-800" />
                <h4 className="text-xs font-bold text-slate-900">Riwayat Penarikan SSS Terbaru ({sssRecords.length} Penarikan Terdata)</h4>
              </div>
              <span className="text-[11px] text-slate-500">Penyetoran ke Kas DKM Babul Khaer</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sssRecords.slice(0, 6).map((rec) => (
                <div key={rec.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="font-mono text-teal-800">{rec.canCode}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">{rec.rt}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Petugas: {rec.collector} • {rec.collectionDate}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-emerald-800 text-xs">+{formatRupiah(rec.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: PENYALURAN ZISWAF & BANSOS MUSTAHIQ                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'bansos' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Cari nama mustahiq, alamat, nomor bantuan..."
                  value={searchBansos}
                  onChange={(e) => setSearchBansos(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              {/* Filter RT */}
              <select
                value={filterRtBansos}
                onChange={(e) => setFilterRtBansos(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50"
              >
                <option value="ALL">Semua RT</option>
                <option value="RT 01">RT 01</option>
                <option value="RT 02">RT 02</option>
                <option value="RT 03">RT 03</option>
                <option value="RT 04">RT 04</option>
                <option value="RT 05">RT 05</option>
              </select>

              {/* Filter Kategori */}
              <select
                value={filterCategoryBansos}
                onChange={(e) => setFilterCategoryBansos(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50"
              >
                <option value="ALL">Semua Kategori Mustahiq</option>
                <option value="MUSTAHIQ_DHUAFA">Mustahiq Dhuafa</option>
                <option value="LANSIA_DHUAFA">Lansia Dhuafa</option>
                <option value="YATIM_PIATU">Anak Yatim / Piatu</option>
                <option value="JANDA_DHUAFA">Janda Dhuafa</option>
              </select>
            </div>

            {!isReadOnly && (
              <button
                onClick={() => setIsCreateAidOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-2 shadow-soft-sm transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Catat Penyaluran Bansos</span>
              </button>
            )}
          </div>

          {/* Table Penyaluran Bansos */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5">No. Penyaluran</th>
                    <th className="px-4 py-3.5">Penerima & Kategori</th>
                    <th className="px-4 py-3.5">Jenis Bantuan & Rincian</th>
                    <th className="px-4 py-3.5 text-right">Nilai / Nominal</th>
                    <th className="px-4 py-3.5">Tgl & Penyalur</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Kwitansi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAids.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                        Tidak ada riwayat penyaluran bansos yang cocok.
                      </td>
                    </tr>
                  ) : (
                    filteredAids.map((aid) => (
                      <tr key={aid.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                          {aid.aidNumber}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900">{aid.recipientName}</div>
                          <div className="text-[11px] text-slate-500">{aid.address} ({aid.rt})</div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 mt-1 inline-block">
                            {aid.recipientCategory.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-emerald-900">{aid.aidType.replace(/_/g, ' ')}</div>
                          <div className="text-[11px] text-slate-600 italic mt-0.5">
                            {aid.goodsDescription || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                          {formatRupiah(aid.amountValue)}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-mono text-slate-800 font-medium">{aid.distributionDate}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{aid.disbursedBy}</div>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {aid.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setReceiptAidTarget(aid)}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold flex items-center gap-1.5 ml-auto transition-colors cursor-pointer shadow-2xs"
                            title="Cetak Tanda Terima Resmi"
                          >
                            <Printer className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Kwitansi</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: PEMETAAN & PEMERATAAN MUSTAHIQ 5 RT                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'pemerataan' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm">
            <h3 className="text-base font-bold text-slate-900">
              Matriks Pemerataan Bantuan Sosial & ZISWAF 5 RT
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Prinsip Keadilan Raker 2026: Memastikan seluruh keluarga dhuafa, lansia, dan anak yatim di RT 01 s/d RT 05 Kompleks BTP Blok AE terpantau dan tidak terjadi ketimpangan penyaluran bantuan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mustahiqProfiles.length === 0 ? (
              <div className="col-span-3 bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
                Belum ada data jamaah berkategori mustahiq.
              </div>
            ) : (
              mustahiqProfiles.map(({ jamaah, latestAid, totalAidCount }) => (
                <div
                  key={jamaah.id}
                  className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-soft-sm flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {jamaah.fullName}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                        {jamaah.rt}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mb-2">
                      {jamaah.fullAddress || jamaah.houseNumber}
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status Ekonomi:</span>
                        <span className="font-bold text-teal-800">
                          {jamaah.economicStatus.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tanggungan Jiwa:</span>
                        <span className="font-semibold text-slate-800">
                          {jamaah.familyMemberCount || 1} Orang
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bantuan Diterima:</span>
                        <span className="font-bold text-slate-900">
                          {totalAidCount} Kali Penyaluran
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Terakhir Disalurkan:</span>
                      <span className="text-xs font-mono font-bold text-slate-800">
                        {latestAid ? latestAid.distributionDate : 'Belum Ada Data'}
                      </span>
                    </div>

                    {!isReadOnly && (
                      <button
                        onClick={() => {
                          setIsCreateAidOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <span>Salurkan</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CATAT PENARIKAN SSS                                                */}
      {/* ========================================================================= */}
      <RecordSSSModal
        can={selectedCanForCollection}
        isOpen={!!selectedCanForCollection}
        onClose={() => setSelectedCanForCollection(null)}
        onSaveCollection={handleSaveCollection}
      />

      {/* ========================================================================= */}
      {/* MODAL: TAMBAH DISTRIBUSI KALENG SSS BARU                                  */}
      {/* ========================================================================= */}
      {isAddCanOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-can-modal-title"
          className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/70 backdrop-blur-xs p-0 md:p-4 overflow-hidden animate-in fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-soft-xl border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] animate-slide-up md:animate-none">
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

            <div className="px-4 md:px-6 py-4 md:py-5 bg-teal-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-white/10 border border-white/20 shrink-0">
                  <Coins className="w-5 h-5 text-amber-300" />
                </div>
                <div className="min-w-0">
                  <h3 id="add-can-modal-title" className="text-sm md:text-base font-bold truncate">Distribusi Kaleng SSS Baru</h3>
                  <p className="text-xs text-teal-200 truncate">Program Sedekah Seribu Sehari</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddCanOpen(false)}
                aria-label="Tutup modal distribusi kaleng SSS"
                className="p-2 md:p-1 rounded-lg text-slate-300 hover:text-white shrink-0 ml-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewCan} className="p-4 sm:p-6 space-y-3.5 flex-1 overflow-y-auto overscroll-contain">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kode Label Kaleng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: SSS-AE-01-04"
                  value={newCanCode}
                  onChange={(e) => setNewCanCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Keluarga Pemegang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Keluarga Bpk. Andi Baso"
                  value={newCanHolder}
                  onChange={(e) => setNewCanHolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Wilayah RT <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newCanRt}
                    onChange={(e) => setNewCanRt(e.target.value as 'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  >
                    <option value="RT 01">RT 01</option>
                    <option value="RT 02">RT 02</option>
                    <option value="RT 03">RT 03</option>
                    <option value="RT 04">RT 04</option>
                    <option value="RT 05">RT 05</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nomor Rumah
                  </label>
                  <input
                    type="text"
                    placeholder="Blok AE No. 20"
                    value={newCanHouse}
                    onChange={(e) => setNewCanHouse(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={newCanPhone}
                  onChange={(e) => setNewCanPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Petugas Koordinator / Pencatat
                </label>
                <select
                  value={newCanCollector}
                  onChange={(e) => setNewCanCollector(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                >
                  <option value="Marbot Firman">Marbot Firman (Marbot Masjid)</option>
                  <option value="Koordinator RT 01">Koordinator SSS RT 01</option>
                  <option value="Koordinator RT 02">Koordinator SSS RT 02</option>
                  <option value="Koordinator RT 03">Koordinator SSS RT 03</option>
                  <option value="Koordinator RT 04">Koordinator SSS RT 04</option>
                  <option value="Koordinator RT 05">Koordinator SSS RT 05</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse md:flex-row items-center justify-end gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => setIsAddCanOpen(false)}
                  className="w-full md:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 text-xs font-bold text-slate-600 text-center flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold text-center flex items-center justify-center cursor-pointer transition-colors shadow-soft-sm"
                >
                  Daftarkan Kaleng SSS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CATAT PENYALURAN BANSOS / ZISWAF                                   */}
      {/* ========================================================================= */}
      <CreateAidModal
        isOpen={isCreateAidOpen}
        onClose={() => setIsCreateAidOpen(false)}
        jamaahList={jamaahList}
        onSaveAid={handleSaveNewAid}
      />

      {/* ========================================================================= */}
      {/* MODAL: CETAK KWITANSI / TANDA TERIMA BANSOS RESMI DKM                    */}
      {/* ========================================================================= */}
      <AidReceiptModal
        aid={receiptAidTarget}
        isOpen={!!receiptAidTarget}
        onClose={() => setReceiptAidTarget(null)}
      />
    </div>
  );
}
