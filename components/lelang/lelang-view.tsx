'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Gavel,
  Plus,
  TrendingUp,
  Clock,
  Phone,
  CheckCircle2,
  Sparkles,
  Tag,
  X,
  RefreshCw,
} from 'lucide-react';
import { LelangItem, LelangStatus } from '@/types/lelang';
import { INITIAL_LELANG_ITEMS } from '@/lib/mock-lelang';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { useModalBackHandler } from '@/lib/back-button-handler';
import ImageUploader from '@/components/shared/image-uploader';
import { openWhatsApp, WhatsAppTemplates } from '@/lib/whatsapp-service';

export default function LelangView() {
  const { isReadOnly, canMutateTab } = useAuth();
  const canMutate = !isReadOnly && canMutateTab('lelang');
  const { toast } = useToast();

  const [items, setItems] = useState<LelangItem[]>(INITIAL_LELANG_ITEMS);
  const [filterStatus, setFilterStatus] = useState<'ALL' | LelangStatus>('BERLANGSUNG');
  const [isLoading, setIsLoading] = useState(false);

  // Modal Create Lelang State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [startingBid, setStartingBid] = useState<number>(500000);
  const [deadlineDate, setDeadlineDate] = useState<string>('2026-09-30');
  const [coordinatorContact, setCoordinatorContact] = useState<string>('0812-4000-0003');
  const [division, setDivision] = useState<string>('Seksi Dana & Usaha Swadaya');

  // Modal Record Bid State
  const [bidModalTarget, setBidModalTarget] = useState<LelangItem | null>(null);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [bidderName, setBidderName] = useState<string>('');
  const [isAnonymousBid, setIsAnonymousBid] = useState<boolean>(false);

  // Modal Complete State
  const [completeModalTarget, setCompleteModalTarget] = useState<LelangItem | null>(null);
  const [winnerName, setWinnerName] = useState<string>('');
  const [finalPrice, setFinalPrice] = useState<number>(0);

  // Lightbox Zoom
  const [zoomPhotoUrl, setZoomPhotoUrl] = useState<string | null>(null);

  // Back button handlers
  useModalBackHandler(isCreateOpen, () => setIsCreateOpen(false), 'lelang-create');
  useModalBackHandler(Boolean(bidModalTarget), () => setBidModalTarget(null), 'lelang-bid');
  useModalBackHandler(Boolean(completeModalTarget), () => setCompleteModalTarget(null), 'lelang-complete');
  useModalBackHandler(Boolean(zoomPhotoUrl), () => setZoomPhotoUrl(null), 'lelang-zoom');

  // Sync data from API
  const fetchLelang = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/lelang');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      }
    } catch (err) {
      console.warn('Gagal memuat lelang dari server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadInitial = async () => {
      try {
        const res = await fetch('/api/lelang');
        const data = await res.json();
        if (!ignore && data.success && Array.isArray(data.data)) {
          setItems(data.data);
        }
      } catch (err) {
        console.warn('Gagal memuat lelang:', err);
      }
    };
    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const formatRp = (amount: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);

  // Filtered list
  const filteredItems = items.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  // Create Lelang Handler
  const handleCreateLelang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim() || startingBid <= 0 || !deadlineDate) {
      toast.warning('Validasi Formulir', 'Nama barang, harga awal, dan tanggal penutupan wajib diisi.');
      return;
    }

    try {
      const res = await fetch('/api/lelang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-lelang',
          item: {
            itemName,
            description,
            photoUrls,
            startingBid,
            deadlineDate,
            coordinatorContact,
            division,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setItems((prev) => [data.data, ...prev]);
        toast.success('Lelang Terdaftar', `Barang "${itemName}" berhasil didaftarkan untuk lelang infaq.`);
        setIsCreateOpen(false);
        // Reset form
        setItemName('');
        setDescription('');
        setPhotoUrls([]);
        setStartingBid(500000);
      } else {
        toast.error('Gagal Mendaftarkan', data.error || 'Terjadi kesalahan.');
      }
    } catch (err: unknown) {
      console.error('Error creating lelang:', err);
      const message = err instanceof Error ? err.message : 'Gangguan koneksi.';
      toast.error('Gagal Mendaftarkan', message);
    }
  };

  // Record Bid Handler
  const handleRecordBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidModalTarget) return;

    if (bidAmount <= bidModalTarget.currentHighestBid) {
      toast.warning(
        'Tawaran Kurang',
        `Tawaran baru harus lebih tinggi dari ${formatRp(bidModalTarget.currentHighestBid)}.`
      );
      return;
    }

    try {
      const bidderNameToUse = isAnonymousBid ? 'Hamba Allah' : bidderName.trim() || 'Hamba Allah';
      const res = await fetch('/api/lelang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'place-bid',
          id: bidModalTarget.id,
          bidAmount,
          bidderName: bidderNameToUse,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setItems((prev) => prev.map((it) => (it.id === bidModalTarget.id ? data.data : it)));
        toast.success(
          'Tawaran Dicatat',
          `Tawaran baru ${formatRp(bidAmount)} dari ${bidderNameToUse} berhasil dicatat.`
        );
        setBidModalTarget(null);
      } else {
        toast.error('Gagal Mencatat', data.error || 'Terjadi kesalahan.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gangguan koneksi.';
      toast.error('Gagal Mencatat', message);
    }
  };

  // Complete Lelang Handler
  const handleCompleteLelang = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completeModalTarget) return;

    try {
      const res = await fetch('/api/lelang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete-lelang',
          id: completeModalTarget.id,
          winnerName: winnerName.trim() || completeModalTarget.currentBidderName || 'Hamba Allah',
          finalPrice: finalPrice || completeModalTarget.currentHighestBid,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setItems((prev) => prev.map((it) => (it.id === completeModalTarget.id ? data.data : it)));
        toast.success(
          'Lelang Selesai',
          `Lelang "${completeModalTarget.itemName}" telah diselesaikan. Pemenang: ${data.data.winnerName}.`
        );
        setCompleteModalTarget(null);
      } else {
        toast.error('Gagal Menyelesaikan', data.error || 'Terjadi kesalahan.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gangguan koneksi.';
      toast.error('Gagal Menyelesaikan', message);
    }
  };

  // Cancel Lelang Handler
  const handleCancelLelang = async (item: LelangItem) => {
    if (!canMutate) return;
    const confirmCancel = window.confirm(
      `Apakah Anda yakin ingin membatalkan lelang "${item.itemName}"? Status akan menjadi DIBATALKAN.`
    );
    if (!confirmCancel) return;

    try {
      const res = await fetch('/api/lelang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel-lelang',
          id: item.id,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setItems((prev) => prev.map((it) => (it.id === item.id ? data.data : it)));
        toast.info('Lelang Dibatalkan', `Status lelang "${item.itemName}" telah dibatalkan.`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal membatalkan lelang.';
      toast.error('Gagal Membatalkan', message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white p-5 sm:p-6 rounded-3xl shadow-soft-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-700/60 border border-amber-500/30 text-amber-200 text-xs font-bold">
            <Gavel className="w-3.5 h-3.5" />
            <span>Galang Dana Swadaya Umat</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Lelang Infaq Barakah
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/80 max-w-2xl leading-relaxed">
            Pelelangan barang wakaf dan karya jamaah untuk pendanaan operasional serta sarpras fisik masjid. Tawaran dikoordinasikan via WhatsApp dan dicatat transparan di sistem.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {canMutate && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 shadow-soft-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Lelang Baru</span>
            </button>
          )}
          <button
            type="button"
            onClick={fetchLelang}
            className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-amber-800/80 hover:bg-amber-700 text-amber-200 transition-colors flex items-center justify-center cursor-pointer"
            title="Muat ulang data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {([
          { id: 'BERLANGSUNG', label: 'Sedang Berlangsung', count: items.filter((i) => i.status === 'BERLANGSUNG').length },
          { id: 'SELESAI', label: 'Tuntas / Terjual', count: items.filter((i) => i.status === 'SELESAI').length },
          { id: 'ALL', label: 'Semua Koleksi', count: items.length },
        ] as const).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilterStatus(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              filterStatus === tab.id
                ? 'bg-amber-800 text-white shadow-soft-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                filterStatus === tab.id
                  ? 'bg-amber-950/60 text-amber-200'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Lelang Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <Gavel className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Belum ada barang lelang dalam status ini
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Divisi mana pun dapat mendaftarkan barang donasi atau karya warga untuk dilelang infaq.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const isOngoing = item.status === 'BERLANGSUNG';
            const isCompleted = item.status === 'SELESAI';

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border shadow-soft-sm overflow-hidden flex flex-col justify-between transition-all ${
                  isOngoing
                    ? 'border-amber-300/80 dark:border-amber-600/30 ring-1 ring-amber-500/10'
                    : isCompleted
                    ? 'border-emerald-300/80 dark:border-emerald-600/30'
                    : 'border-slate-200 dark:border-slate-800 opacity-75'
                }`}
              >
                <div>
                  {/* Photo Preview Container */}
                  <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                    {item.photoUrls && item.photoUrls.length > 0 ? (
                      <Image
                        src={item.photoUrls[0]}
                        alt={item.itemName}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized={item.photoUrls[0].startsWith('/uploads/')}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <Tag className="w-10 h-10 stroke-1" />
                        <span className="text-[11px] mt-1 font-medium">Foto Belum Tersedia</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-2xs ${
                          isOngoing
                            ? 'bg-amber-600/90 text-white'
                            : isCompleted
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-slate-700/90 text-slate-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    {/* Zoom Button */}
                    {item.photoUrls && item.photoUrls.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setZoomPhotoUrl(item.photoUrls[0])}
                        className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-xs transition-colors cursor-pointer"
                        title="Perbesar Foto"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Multiple Photos Indicator */}
                    {item.photoUrls && item.photoUrls.length > 1 && (
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-lg bg-slate-950/70 backdrop-blur-xs text-[10px] font-bold text-white">
                        +{item.photoUrls.length - 1} Foto Lainnya
                      </div>
                    )}
                  </div>

                  {/* Item Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <span className="truncate">{item.division}</span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>s/d {item.deadlineDate}</span>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {item.itemName}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Price Card */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-800/40 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">Harga Awal:</span>
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{formatRp(item.startingBid)}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-amber-200/50 dark:border-amber-800/30">
                        <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                          {isCompleted ? 'Harga Akhir Terjual:' : 'Tawaran Tertinggi:'}
                        </span>
                        <span className="text-base font-black text-amber-700 dark:text-amber-400">
                          {formatRp(isCompleted && item.finalPrice ? item.finalPrice : item.currentHighestBid)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-0.5">
                        <span>Penawar:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {isCompleted ? item.winnerName : item.currentBidderName || 'Belum Ada Tawaran'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    {/* Tombol Tawar via WhatsApp */}
                    <button
                      type="button"
                      onClick={() => {
                        const template = WhatsAppTemplates.lelangBidInquiry({
                          itemName: item.itemName,
                          currentBid: item.currentHighestBid,
                          coordinatorContact: item.coordinatorContact,
                        });
                        openWhatsApp(item.coordinatorContact, template);
                      }}
                      className="flex-1 px-3 py-2 min-h-[40px] rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      title="Hubungi koordinator lelang lewat WhatsApp"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Hubungi Panitia WA</span>
                    </button>

                    {/* Tombol Catat Tawaran Baru (Internal Panitia) */}
                    {canMutate && isOngoing && (
                      <button
                        type="button"
                        onClick={() => {
                          setBidModalTarget(item);
                          setBidAmount(item.currentHighestBid + 50000);
                          setBidderName('');
                          setIsAnonymousBid(false);
                        }}
                        className="px-3 py-2 min-h-[40px] rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        title="Catat tawaran baru dari pesan WA masuk"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Catat Tawar</span>
                      </button>
                    )}
                  </div>

                  {/* Selesaikan / Batalkan (Hanya untuk Koordinator/Pengurus) */}
                  {canMutate && isOngoing && (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCompleteModalTarget(item);
                          setWinnerName(item.currentBidderName || 'Hamba Allah');
                          setFinalPrice(item.currentHighestBid);
                        }}
                        className="flex-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesaikan Lelang</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCancelLelang(item)}
                        className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Batalkan
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BUAT LELANG BARU                                                 */}
      {/* ========================================================================= */}
      {isCreateOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/70 backdrop-blur-xs p-0 md:p-4 overflow-hidden animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-3xl md:rounded-2xl shadow-soft-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[90dvh] max-h-[92dvh] md:h-auto md:max-h-[90dvh] animate-slide-up md:animate-none">
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

            {/* Modal Header */}
            <div className="px-5 py-4 bg-amber-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-800 text-amber-200">
                  <Gavel className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Daftarkan Barang Lelang Infaq</h3>
                  <p className="text-xs text-amber-200">Bisa diajukan oleh divisi / kepanitiaan mana saja</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-amber-200 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateLelang} className="p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Barang Lelang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="cth: Jam Dinding Kaligrafi Kayu Jati Ukir Jepara"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Deskripsi & Asal Usul Barang
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan spesifikasi barang, kondisi, dan tujuan alokasi hasil lelang..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              {/* Universal Image Uploader Multiple */}
              <div>
                <ImageUploader
                  multiple
                  value={photoUrls}
                  onChange={(urls) => setPhotoUrls(urls as string[])}
                  label="Foto Barang Lelang (Maks. 6 Foto)"
                  helperText="Ambil foto dari berbagai sudut. Kamera HP atau galeri file (Maks 5MB per foto)"
                  maxFiles={6}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Harga Awal / Open Bid (Rp) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={50000}
                    step={25000}
                    required
                    value={startingBid}
                    onChange={(e) => setStartingBid(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Batas Akhir Lelang <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Divisi / Seksi Penyelenggara
                  </label>
                  <input
                    type="text"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    placeholder="Seksi Dana & Usaha Swadaya"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No. WA Panitia Koordinator <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={coordinatorContact}
                    onChange={(e) => setCoordinatorContact(e.target.value)}
                    placeholder="0812-4000-0003"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse md:flex-row items-center justify-end gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="w-full md:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-amber-700 hover:bg-amber-800 active:scale-95 text-white text-xs font-bold shadow-soft-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Gavel className="w-4 h-4" />
                  <span>Terbitkan Lelang Infaq</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CATAT TAWARAN MASUK (MANUAL OLEH PANITIA DARI WA)                */}
      {/* ========================================================================= */}
      {bidModalTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-soft-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 bg-amber-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Catat Tawaran Lelang Masuk</h3>
                <p className="text-xs text-amber-200 truncate max-w-xs">{bidModalTarget.itemName}</p>
              </div>
              <button
                type="button"
                onClick={() => setBidModalTarget(null)}
                className="text-amber-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordBid} className="p-5 space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs">
                <span className="text-slate-500 dark:text-slate-400 block">Tawaran Tertinggi Saat Ini:</span>
                <span className="text-base font-extrabold text-amber-900 dark:text-amber-300">
                  {formatRp(bidModalTarget.currentHighestBid)}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Oleh: {bidModalTarget.currentBidderName || 'Belum ada tawaran'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nominal Tawaran Baru (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={bidModalTarget.currentHighestBid + 10000}
                  step={25000}
                  required
                  value={bidAmount}
                  onChange={(e) => setBidAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-amber-800 dark:text-amber-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Penawar
                </label>
                <input
                  type="text"
                  disabled={isAnonymousBid}
                  value={isAnonymousBid ? 'Hamba Allah (Anonim)' : bidderName}
                  onChange={(e) => setBidderName(e.target.value)}
                  placeholder="cth: Bpk. H. Sudirman, S.H."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold disabled:bg-slate-100 dark:disabled:bg-slate-800/60"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="anon-bid-check"
                  checked={isAnonymousBid}
                  onChange={(e) => setIsAnonymousBid(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="anon-bid-check" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                  Penawar meminta anonim (Hamba Allah)
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBidModalTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Simpan Tawaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: SELESAIKAN LELANG (TETAPKAN PEMENANG & HARGA FINAL)              */}
      {/* ========================================================================= */}
      {completeModalTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-soft-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Selesaikan Lelang & Tetapkan Pemenang</h3>
                <p className="text-xs text-emerald-200 truncate max-w-xs">{completeModalTarget.itemName}</p>
              </div>
              <button
                type="button"
                onClick={() => setCompleteModalTarget(null)}
                className="text-emerald-200 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteLelang} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Pemenang Lelang <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={winnerName}
                  onChange={(e) => setWinnerName(e.target.value)}
                  placeholder="Nama pemenang lelang"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Harga Final Infaq (Rp) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1000}
                  required
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-emerald-800 dark:text-emerald-400"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCompleteModalTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tetapkan Pemenang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX ZOOM FOTO LELANG                                                 */}
      {/* ========================================================================= */}
      {zoomPhotoUrl && (
        <div
          role="dialog"
          aria-label="Pratinjau Foto Lelang"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomPhotoUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomPhotoUrl(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <Image
                src={zoomPhotoUrl}
                alt="Foto Barang Lelang"
                fill
                className="object-contain"
                unoptimized={zoomPhotoUrl.startsWith('/uploads/')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
