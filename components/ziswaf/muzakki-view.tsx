'use client';

import React, { useState } from 'react';
import { 
  HeartHandshake, 
  DollarSign, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Send, 
  Printer, 
  ShieldCheck, 
  X,
  Coins
} from 'lucide-react';
import { MuzakkiItem, BaznasSyncStatus } from '@/types/ziswaf';
import { INITIAL_MUZAKKI_LIST, MOCK_BAZNAS_STATUS } from '@/lib/mock-ziswaf';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

export function MuzakkiView() {
  const { currentUser, isReadOnly } = useAuth();
  const { toast } = useToast();

  const [muzakkiList, setMuzakkiList] = useState<MuzakkiItem[]>(INITIAL_MUZAKKI_LIST);
  const [baznasStatus] = useState<BaznasSyncStatus>(MOCK_BAZNAS_STATUS);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedForReceipt, setSelectedForReceipt] = useState<MuzakkiItem | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newZakatType, setNewZakatType] = useState<MuzakkiItem['zakatType']>('ZAKAT_MAL');
  const [newAmountRp, setNewAmountRp] = useState('');
  const [newRiceKg, setNewRiceKg] = useState('');
  const [newPersonCount, setNewPersonCount] = useState('1');
  const [newPaymentMethod, setNewPaymentMethod] = useState<MuzakkiItem['paymentMethod']>('TRANSFER_BSI');
  const [newOfficer, setNewOfficer] = useState('Amil UPZ Babul Khaer');
  const [newNotes, setNewNotes] = useState('');

  const canManage = (currentUser.role === 'KETUA_UMUM' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'BENDAHARA' || currentUser.role === 'SEKRETARIS') && !isReadOnly;

  const filteredMuzakki = muzakkiList.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        m.phone.includes(searchTerm);
    const matchType = typeFilter === 'ALL' || m.zakatType === typeFilter;
    return matchSearch && matchType;
  });

  const handleAddMuzakki = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || (!newAmountRp && !newRiceKg)) {
      toast.error('Form Belum Lengkap', 'Nama muzakki dan nominal/beras wajib diisi.');
      return;
    }

    const nextReceipt = `BK-ZIS/2026/09/${String(muzakkiList.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newItem: MuzakkiItem = {
      id: `mzk-${Date.now()}`,
      receiptNumber: nextReceipt,
      name: newName,
      phone: newPhone,
      address: newAddress || 'Kompleks BTP Blok AE',
      zakatType: newZakatType,
      amountRp: Number(newAmountRp) || 0,
      riceKg: newRiceKg ? Number(newRiceKg) : undefined,
      personCount: Number(newPersonCount) || 1,
      paymentMethod: newPaymentMethod,
      date: today,
      officer: newOfficer,
      reportedToBaznas: false,
      notes: newNotes,
    };

    setMuzakkiList([newItem, ...muzakkiList]);
    setIsAddModalOpen(false);
    // Reset
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewAmountRp('');
    setNewRiceKg('');
    setNewNotes('');

    toast.success('Penerimaan ZISWAF Dicatat', `Bukti setor ${nextReceipt} berhasil dibuat untuk ${newName}`);
  };

  const handleToggleReportBaznas = (id: string) => {
    if (!canManage) return;
    setMuzakkiList(prev => prev.map(m => {
      if (m.id === id) {
        const nextState = !m.reportedToBaznas;
        toast.info(
          nextState ? 'Ditandai Dilaporkan' : 'Batal Dilaporkan',
          'Status sinkronisasi BAZNAS diperbarui.'
        );
        return { ...m, reportedToBaznas: nextState };
      }
      return m;
    }));
  };

  const handleExportBaznas = () => {
    window.print();
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const totalCollectedRp = muzakkiList.reduce((sum, m) => sum + m.amountRp, 0);
  const totalRiceKg = muzakkiList.reduce((sum, m) => sum + (m.riceKg || 0), 0);
  const reportedCount = muzakkiList.filter(m => m.reportedToBaznas).length;

  return (
    <div className="space-y-6">
      {/* BAZNAS UPZ Legal Compliance Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-emerald-800/40">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Unit Pengumpul Zakat (UPZ) Resmi BAZNAS Kota Makassar</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Penerimaan Zakat, Infaq, Sedekah & Wakaf (ZISWAF)</h2>
            <p className="text-xs text-emerald-100 max-w-2xl">
              SK Pendirian UPZ: <strong>{baznasStatus.upzNumber}</strong> • Terverifikasi dan berwenang menerbitkan Bukti Setor Zakat (BSZ) resmi yang diakui pengurang penghasilan kena pajak.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportBaznas}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Berkas BAZNAS</span>
            </button>
            {canManage && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 rounded-xl text-xs font-bold shadow-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Catat Penerimaan ZIS</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Tunai Terhimpun</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatRupiah(totalCollectedRp)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            Zakat Mal, Infaq, Fidyah & Wakaf
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Zakat Fitrah Beras</span>
            <Coins className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {totalRiceKg} Kg
          </div>
          <div className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-0.5">
            Lumbung Pangan Logistik DKM
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Transaksi Muzakki</span>
            <HeartHandshake className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {muzakkiList.length} Muzakki
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Bulan Berjalan (September 2026)
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Sinkronisasi BAZNAS</span>
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {reportedCount} / {muzakkiList.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
            Tersinkron ke BAZNAS Mks
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama muzakki, nomor bukti setor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
            >
              <option value="ALL">Semua Jenis ZIS</option>
              <option value="ZAKAT_FITRAH">Zakat Fitrah</option>
              <option value="ZAKAT_MAL">Zakat Mal</option>
              <option value="FIDYAH">Fidyah</option>
              <option value="INFAQ_SEDEKAH">Infaq & Sedekah</option>
              <option value="WAKAF_TUNAI">Wakaf Tunai</option>
            </select>
          </div>
        </div>

        {/* Table of Muzakki */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="p-3">Bukti Setor & Tanggal</th>
                  <th className="p-3">Nama Muzakki</th>
                  <th className="p-3">Jenis ZIS</th>
                  <th className="p-3">Nominal / Beras</th>
                  <th className="p-3">Metode Bayar</th>
                  <th className="p-3">Status BAZNAS</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                {filteredMuzakki.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{m.receiptNumber}</div>
                      <div className="text-[11px] text-slate-400">{m.date}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{m.name}</div>
                      <div className="text-[11px] text-slate-400">{m.phone} • {m.address}</div>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {m.zakatType.replace('_', ' ')}
                      </span>
                      {m.notes && (
                        <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{m.notes}</div>
                      )}
                    </td>

                    <td className="p-3">
                      {m.amountRp > 0 && (
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          {formatRupiah(m.amountRp)}
                        </div>
                      )}
                      {m.riceKg && (
                        <div className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                          {m.riceKg} Kg Beras ({m.personCount || 1} Jiwa)
                        </div>
                      )}
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {m.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleToggleReportBaznas(m.id)}
                        disabled={!canManage}
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition-colors ${
                          m.reportedToBaznas
                            ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        {m.reportedToBaznas ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        <span>{m.reportedToBaznas ? 'Tersinkron' : 'Belum Lapor'}</span>
                      </button>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedForReceipt(m)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-[11px] font-semibold flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Bukti Setor</span>
                        </button>

                        <a
                          href={`https://wa.me/${m.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${m.name}, terima kasih atas setoran ${m.zakatType.replace('_', ' ')} sebesar ${m.amountRp > 0 ? formatRupiah(m.amountRp) : ''} ${m.riceKg ? m.riceKg + ' kg beras' : ''} melalui UPZ DKM Babul Khaer (No: ${m.receiptNumber}). Semoga Allah SWT menerima amal ibadah Anda dan melipatgandakan rezeki berkah. Aamiin.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded text-[11px] font-semibold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim WA</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: BUKTI SETOR RESMI (BSZ) */}
      {selectedForReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Bukti Setor Zakat (BSZ) UPZ BAZNAS</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={() => setSelectedForReceipt(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 bg-white text-slate-900 font-sans text-xs space-y-4">
              <div className="border-b-2 border-slate-900 pb-3 text-center">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  BAZNAS KOTA MAKASSAR • UPZ DKM MASJID BABUL KHAER
                </div>
                <div className="text-lg font-bold text-slate-900 uppercase">
                  BUKTI SETOR ZAKAT, INFAQ & SEDEKAH (BSZ)
                </div>
                <div className="text-[11px] text-slate-500">
                  SK UPZ: {baznasStatus.upzNumber} • No. Bukti: <strong>{selectedForReceipt.receiptNumber}</strong>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Telah Terima Dari</span>
                  <span className="col-span-2 font-bold">: {selectedForReceipt.name}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Alamat / No. HP</span>
                  <span className="col-span-2">: {selectedForReceipt.address} ({selectedForReceipt.phone})</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Jenis Pembayaran</span>
                  <span className="col-span-2 font-bold text-emerald-700">: {selectedForReceipt.zakatType.replace('_', ' ')}</span>
                </div>
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Jumlah Setoran Tunai</span>
                  <span className="col-span-2 font-extrabold text-sm">: {selectedForReceipt.amountRp > 0 ? formatRupiah(selectedForReceipt.amountRp) : '-'}</span>
                </div>
                {selectedForReceipt.riceKg && (
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Jumlah Beras</span>
                    <span className="col-span-2 font-bold">: {selectedForReceipt.riceKg} Kg ({selectedForReceipt.personCount} Jiwa)</span>
                  </div>
                )}
                <div className="grid grid-cols-3">
                  <span className="text-slate-500">Keterangan / Niat</span>
                  <span className="col-span-2 italic">: &ldquo;{selectedForReceipt.notes || 'ZIS lillahi ta\'ala'}&rdquo;</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600 border border-slate-200">
                <strong>Doa untuk Muzakki:</strong> &ldquo;Ajarakallahu fi ma a&apos;thaita, wa baraka fi ma abqaita, wa ja&apos;alahu laka thahuran.&rdquo; (Semoga Allah memberi pahala atas apa yang engkau berikan, memberkahi apa yang engkau sisakan, dan menjadikannya pembersih bagimu).
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 text-center">
                <div>
                  <div className="text-slate-500">Muzakki / Penyetor,</div>
                  <div className="h-16 flex items-center justify-center text-slate-300 italic">
                    (Tanda Tangan)
                  </div>
                  <div className="font-bold underline">{selectedForReceipt.name}</div>
                </div>

                <div>
                  <div className="text-slate-500">Makassar, {selectedForReceipt.date}</div>
                  <div className="font-semibold text-slate-700">Amil UPZ Penerima,</div>
                  <div className="h-16 flex items-center justify-center text-slate-300 italic">
                    (Stempel UPZ)
                  </div>
                  <div className="font-bold underline">{selectedForReceipt.officer}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CATAT PENERIMAAN ZIS BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Pencatatan Penerimaan ZISWAF</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMuzakki} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Muzakki / Munfiq *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Rusli Hasan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">No. WhatsApp</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jenis Dana ZIS *</label>
                  <select
                    value={newZakatType}
                    onChange={(e) => setNewZakatType(e.target.value as MuzakkiItem['zakatType'])}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  >
                    <option value="ZAKAT_MAL">Zakat Mal / Perniagaan</option>
                    <option value="ZAKAT_FITRAH">Zakat Fitrah</option>
                    <option value="FIDYAH">Fidyah Puasa</option>
                    <option value="INFAQ_SEDEKAH">Infaq / Sedekah Terikat</option>
                    <option value="WAKAF_TUNAI">Wakaf Tunai</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nominal Tunai (Rp)</label>
                  <input
                    type="number"
                    placeholder="Contoh: 1500000"
                    value={newAmountRp}
                    onChange={(e) => setNewAmountRp(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Beras (Kg) / Jiwa</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Beras (kg)"
                      value={newRiceKg}
                      onChange={(e) => setNewRiceKg(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Jiwa"
                      value={newPersonCount}
                      onChange={(e) => setNewPersonCount(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Metode Pembayaran</label>
                  <select
                    value={newPaymentMethod}
                    onChange={(e) => setNewPaymentMethod(e.target.value as MuzakkiItem['paymentMethod'])}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  >
                    <option value="TRANSFER_BSI">Transfer Rekening BSI</option>
                    <option value="TUNAI">Tunai di Meja Amil</option>
                    <option value="QRIS">QRIS Masjid</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Amil / Petugas Penerima</label>
                  <input
                    type="text"
                    value={newOfficer}
                    onChange={(e) => setNewOfficer(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Catatan / Peruntukan Khusus</label>
                <input
                  type="text"
                  placeholder="Contoh: Zakat profesi bulan September 2026"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow"
                >
                  Simpan Penerimaan ZIS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
