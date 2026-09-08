'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Plus,
  Calendar,
  Trash2,
  Maximize2,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { GalleryItem, GalleryCategory } from '@/types/gallery';
import { INITIAL_GALLERY_ITEMS } from '@/lib/mock-gallery';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { useModalBackHandler } from '@/lib/back-button-handler';
import ImageUploader from '@/components/shared/image-uploader';

export default function GalleryView() {
  const { isReadOnly, currentUser, canMutateTab } = useAuth();
  const canManage = !isReadOnly && canMutateTab('gallery');
  const { toast } = useToast();

  const [items, setItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  // Modal Upload Foto Baru
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<GalleryCategory>('KAJIAN');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [division, setDivision] = useState(currentUser.department || 'Pengurus DKM');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Lightbox Zoom
  const [zoomItem, setZoomItem] = useState<GalleryItem | null>(null);

  // Back button handlers
  useModalBackHandler(isUploadOpen, () => setIsUploadOpen(false), 'gallery-upload');
  useModalBackHandler(Boolean(zoomItem), () => setZoomItem(null), 'gallery-zoom');

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gallery');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setItems(data.data);
      }
    } catch (err) {
      console.warn('Gagal memuat galeri dari server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadInitial = async () => {
      try {
        const res = await fetch('/api/gallery');
        const data = await res.json();
        if (!ignore && data.success && Array.isArray(data.data)) {
          setItems(data.data);
        }
      } catch (err) {
        console.warn('Gagal memuat galeri:', err);
      }
    };
    loadInitial();
    return () => {
      ignore = true;
    };
  }, []);

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'Semua Dokumentasi' },
    { id: 'KAJIAN', label: 'Kajian & Ibadah' },
    { id: 'PHBI', label: 'Hari Besar (PHBI)' },
    { id: 'RAPAT', label: 'Rapat & Pleno' },
    { id: 'SOSIAL', label: 'Sosial & ZISWAF' },
    { id: 'PEMBANGUNAN', label: 'Pembangunan Sarpras' },
    { id: 'TPA', label: 'Santri TPA' },
    { id: 'LAINNYA', label: 'Lainnya' },
  ];

  const filteredItems = items.filter((item) => {
    if (activeCategory === 'ALL') return true;
    return item.category === activeCategory;
  });

  const handleUploadGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !photoUrl) {
      toast.warning('Validasi Formulir', 'Judul kegiatan dan foto wajib diisi.');
      return;
    }

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add-item',
          item: {
            title,
            caption,
            category,
            photoUrl,
            division,
            date,
          },
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setItems((prev) => [data.data, ...prev]);
        toast.success('Foto Terbit', `Dokumentasi "${title}" berhasil disimpan di galeri.`);
        setIsUploadOpen(false);
        setTitle('');
        setCaption('');
        setPhotoUrl('');
      } else {
        toast.error('Gagal Mengunggah', data.error || 'Terjadi kesalahan.');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gangguan koneksi.';
      toast.error('Gagal Mengunggah', message);
    }
  };

  const handleDeletePhoto = async (item: GalleryItem) => {
    if (!canManage) return;
    const confirmDelete = window.confirm(`Hapus foto "${item.title}" dari galeri kegiatan?`);
    if (!confirmDelete) return;

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete-item',
          id: item.id,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        toast.info('Foto Dihapus', `Dokumentasi "${item.title}" telah dihapus.`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus foto.';
      toast.error('Gagal Menghapus', message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-soft-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-500/30 text-teal-200 text-xs font-bold">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Dokumentasi Lintas Divisi DKM</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Galeri Kegiatan Universal
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl leading-relaxed">
            Pusat arsip dokumentasi visual seluruh program kerja dan kegiatan keumatan Masjid Babul Khaer: kajian, PHBI, rapat pleno, penyaluran sosial, santri TPA, dan pembangunan sarpras.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {canManage && (
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 min-h-[44px] rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-soft-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Dokumentasi</span>
            </button>
          )}
          <button
            type="button"
            onClick={fetchGallery}
            className="p-2.5 min-h-[44px] min-w-[44px] rounded-xl bg-teal-800/80 hover:bg-teal-700 text-teal-200 transition-colors flex items-center justify-center cursor-pointer"
            title="Muat ulang foto"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => {
          const count = cat.id === 'ALL' ? items.length : items.filter((i) => i.category === cat.id).length;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-teal-800 text-white shadow-soft-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? 'bg-teal-950/60 text-teal-200'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Photos Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
          <ImageIcon className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Belum ada dokumentasi pada kategori ini
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Gunakan tombol &quot;Unggah Dokumentasi&quot; untuk menambahkan foto arsip kegiatan masjid.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft-sm overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Photo Thumbnail */}
                <div
                  onClick={() => setZoomItem(item)}
                  className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden cursor-pointer"
                >
                  <Image
                    src={item.photoUrl}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized={item.photoUrl.startsWith('/uploads/')}
                  />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-teal-900/80 text-teal-200 backdrop-blur-md shadow-2xs">
                      {item.category}
                    </span>
                  </div>

                  {/* Zoom Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-bold backdrop-blur-[2px]">
                    <Maximize2 className="w-4 h-4" />
                    <span>Lihat Ukuran Penuh</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    <span>{item.division}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-teal-600" />
                      <span>{item.date}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>

                  {item.caption && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </div>

              {/* Footer / Meta */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="truncate">Oleh: <strong>{item.uploadedBy}</strong></span>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Hapus foto ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL UNGGAH FOTO KEGIATAN BARU                                           */}
      {/* ========================================================================= */}
      {isUploadOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/70 backdrop-blur-xs p-0 md:p-4 overflow-hidden animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-3xl md:rounded-2xl shadow-soft-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[90dvh] max-h-[92dvh] md:h-auto md:max-h-[90dvh] animate-slide-up md:animate-none">
            {/* Mobile Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

            <div className="px-5 py-4 bg-teal-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-700 text-teal-100">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Unggah Dokumentasi Kegiatan</h3>
                  <p className="text-xs text-teal-200">Terbuka untuk semua divisi & seksi DKM</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadOpen(false)}
                className="text-teal-200 hover:text-white p-2 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadGallery} className="p-5 space-y-4 flex-1 overflow-y-auto overscroll-contain">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Judul Kegiatan / Acara <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="cth: Peringatan Isra Mi'raj & Penyaluran Beras Lumbung"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kategori Kegiatan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GalleryCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="KAJIAN">KAJIAN (Ibadah & Dakwah)</option>
                    <option value="PHBI">PHBI (Hari Besar Islam)</option>
                    <option value="RAPAT">RAPAT (Pleno & Koordinasi)</option>
                    <option value="SOSIAL">SOSIAL (ZISWAF & Lumbung)</option>
                    <option value="PEMBANGUNAN">PEMBANGUNAN (Sarpras Fisik)</option>
                    <option value="TPA">TPA (Santri Al-Quran)</option>
                    <option value="LAINNYA">LAINNYA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Pelaksanaan
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Keterangan Singkat / Cerita Dokumentasi
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ceritakan momen penting, jumlah jamaah yang hadir, atau hasil kegiatan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              {/* Universal Image Uploader Single Mode */}
              <div>
                <ImageUploader
                  value={photoUrl}
                  onChange={(url) => setPhotoUrl(url as string)}
                  label="Foto Dokumentasi (Kamera HP / Galeri)"
                  helperText="Gunakan orientasi landscape (horizontal) untuk tampilan terbaik (Maks. 5MB)"
                  aspectRatio="video"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Divisi / Penyelenggara
                </label>
                <input
                  type="text"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  placeholder="cth: Seksi PHBI & Hari Besar Islam"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col-reverse md:flex-row items-center justify-end gap-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="w-full md:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs font-bold shadow-soft-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Terbitkan ke Galeri</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* LIGHTBOX ZOOM FOTO GALERI                                                 */}
      {/* ========================================================================= */}
      {zoomItem && (
        <div
          role="dialog"
          aria-label="Zoom Foto Galeri"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setZoomItem(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomItem(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <Image
                src={zoomItem.photoUrl}
                alt={zoomItem.title}
                fill
                className="object-contain"
                unoptimized={zoomItem.photoUrl.startsWith('/uploads/')}
              />
            </div>
            <div className="w-full mt-3 p-4 rounded-xl bg-slate-900/90 text-white text-left space-y-1">
              <div className="flex items-center justify-between text-xs text-teal-300 font-bold">
                <span>{zoomItem.category} • {zoomItem.division}</span>
                <span>{zoomItem.date}</span>
              </div>
              <h4 className="text-sm font-bold">{zoomItem.title}</h4>
              {zoomItem.caption && (
                <p className="text-xs text-slate-300">{zoomItem.caption}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
