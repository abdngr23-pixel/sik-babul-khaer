'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import {
  Camera,
  Image as ImageIcon,
  X,
  Loader2,
  Trash2,
  Maximize2,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/lib/toast-context';

export interface BaseImageUploaderProps {
  label?: string;
  helperText?: string;
  disabled?: boolean;
  maxFiles?: number;
  aspectRatio?: 'square' | 'video' | 'poster' | 'auto';
  className?: string;
}

export interface SingleImageUploaderProps extends BaseImageUploaderProps {
  multiple?: false;
  value?: string;
  onChange: (val: string) => void;
}

export interface MultipleImageUploaderProps extends BaseImageUploaderProps {
  multiple: true;
  value?: string[];
  onChange: (val: string[]) => void;
}

export type ImageUploaderProps = SingleImageUploaderProps | MultipleImageUploaderProps;

/**
 * Kompresi gambar client-side menggunakan HTML5 Canvas
 * Mengubah resolusi maksimal ke lebar 1600px dan kualitas 0.82
 * Mengurangi ukuran file dari 10-20MB ke ~200-400KB sebelum dikirim ke API
 */
async function compressImageClientSide(file: File, maxWidth = 1600, quality = 0.82): Promise<File> {
  // Hanya kompres tipe gambar standard
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Prefer WebP if supported, fallback to JPEG
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: outputMime,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          outputMime,
          quality
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}

export default function ImageUploader({
  value,
  onChange,
  multiple = false,
  label = 'Unggah Foto',
  helperText = 'Format JPG, PNG, atau WebP (Maks 5MB per file)',
  disabled = false,
  maxFiles = 6,
  aspectRatio = 'auto',
  className = '',
}: ImageUploaderProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  const fileInputGalleryRef = useRef<HTMLInputElement>(null);
  const fileInputCameraRef = useRef<HTMLInputElement>(null);

  // Normalisasi list foto
  const currentUrls: string[] = Array.isArray(value)
    ? value.filter(Boolean)
    : value
    ? [value]
    : [];

  const handleUploadFiles = async (files: FileList | File[]) => {
    if (disabled || files.length === 0) return;

    // Batasan jumlah file
    if (multiple && currentUrls.length + files.length > maxFiles) {
      toast.warning(
        'Batas Jumlah Foto',
        `Maksimal ${maxFiles} foto yang dapat diunggah.`
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    const uploadedUrls: string[] = [];
    const totalFiles = files.length;

    try {
      for (let i = 0; i < totalFiles; i++) {
        const rawFile = files[i];

        // Validasi tipe
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(rawFile.type)) {
          toast.error(
            'Format Tidak Didukung',
            `File "${rawFile.name}" bukan format JPEG, PNG, atau WebP.`
          );
          continue;
        }

        // Kompresi di sisi klien
        setUploadProgress(25 + Math.round((i / totalFiles) * 30));
        const fileToUpload = await compressImageClientSide(rawFile);

        // Siapkan FormData
        const formData = new FormData();
        formData.append('file', fileToUpload);

        setUploadProgress(60 + Math.round((i / totalFiles) * 35));

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const contentType = res.headers.get('content-type') || '';
        let data: { success?: boolean; url?: string; error?: string } = {};

        if (contentType.includes('application/json')) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(
            res.status === 404
              ? 'Server belum memuat rute upload baru (404). Silakan restart server aplikasi.'
              : `Kesalahan server (${res.status}): ${text.slice(0, 100)}`
          );
        }

        if (!res.ok || !data.success || !data.url) {
          throw new Error(data.error || `Gagal mengunggah ${rawFile.name}`);
        }

        uploadedUrls.push(data.url);
      }

      setUploadProgress(100);

      if (uploadedUrls.length > 0) {
        if (multiple) {
          const updated = [...currentUrls, ...uploadedUrls];
          (onChange as (val: string[]) => void)(updated);
        } else {
          (onChange as (val: string) => void)(uploadedUrls[0]);
        }

        toast.success(
          'Berhasil Diunggah',
          `${uploadedUrls.length} foto berhasil disimpan.`
        );
      }
    } catch (err: unknown) {
      console.error('Upload error:', err);
      const message = err instanceof Error ? err.message : 'Terjadi gangguan saat mengunggah foto.';
      toast.error(
        'Upload Gagal',
        message
      );
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input element value
      if (fileInputGalleryRef.current) fileInputGalleryRef.current.value = '';
      if (fileInputCameraRef.current) fileInputCameraRef.current.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    if (disabled) return;
    if (multiple) {
      const updated = currentUrls.filter((_, idx) => idx !== indexToRemove);
      (onChange as (val: string[]) => void)(updated);
    } else {
      (onChange as (val: string) => void)('');
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'square':
        return 'aspect-square';
      case 'video':
        return 'aspect-video';
      case 'poster':
        return 'aspect-[3/4]';
      default:
        return 'aspect-[4/3]';
    }
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Label & Counter */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
        {multiple && (
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {currentUrls.length}/{maxFiles} Foto
          </span>
        )}
      </div>

      {/* Hidden File Inputs */}
      <input
        ref={fileInputGalleryRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple={multiple}
        disabled={disabled || isUploading}
        onChange={(e) => {
          if (e.target.files) handleUploadFiles(e.target.files);
        }}
        className="hidden"
        id={`gallery-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
      />

      <input
        ref={fileInputCameraRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="environment"
        disabled={disabled || isUploading}
        onChange={(e) => {
          if (e.target.files) handleUploadFiles(e.target.files);
        }}
        className="hidden"
        id={`camera-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
      />

      {/* Upload Action Area */}
      {(!currentUrls.length || multiple) && currentUrls.length < maxFiles && (
        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 bg-slate-50/70 dark:bg-slate-800/40 text-center transition-all hover:bg-slate-100/60 dark:hover:bg-slate-800/60">
          {isUploading ? (
            <div className="py-5 flex flex-col items-center justify-center space-y-2.5">
              <Loader2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin" />
              <div className="w-48 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Mengompresi & Mengunggah... {uploadProgress}%
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2">
                {/* Tombol Buka Galeri */}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => fileInputGalleryRef.current?.click()}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-soft-sm cursor-pointer transition-all disabled:opacity-50"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Pilih dari Galeri</span>
                </button>

                {/* Tombol Kamera HP Langsung (Mobile Friendly) */}
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => fileInputCameraRef.current?.click()}
                  className="px-4 py-2.5 min-h-[44px] rounded-xl bg-teal-700 hover:bg-teal-800 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-soft-sm cursor-pointer transition-all disabled:opacity-50"
                  title="Ambil foto langsung dengan kamera ponsel"
                >
                  <Camera className="w-4 h-4" />
                  <span>Buka Kamera</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {helperText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Thumbnails Preview Grid */}
      {currentUrls.length > 0 && (
        <div
          className={`grid gap-3 pt-1 ${
            multiple
              ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
              : 'grid-cols-1 max-w-sm'
          }`}
        >
          {currentUrls.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className={`relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 group ${getAspectClass()} shadow-2xs`}
            >
              <Image
                src={url}
                alt={`Pratinjau foto ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized={url.startsWith('/uploads/')}
              />

              {/* Action Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                <button
                  type="button"
                  onClick={() => setPreviewZoomUrl(url)}
                  className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-800 text-xs backdrop-blur-xs transition-colors cursor-pointer shadow-2xs"
                  title="Perbesar Pratinjau"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>

                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs transition-colors cursor-pointer shadow-2xs"
                    title="Hapus Foto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Single Mode Replace Pill */}
              {!multiple && !disabled && (
                <div className="absolute top-2 right-2">
                  <button
                    type="button"
                    onClick={() => fileInputGalleryRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-bold backdrop-blur-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ganti</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal Zoom */}
      {previewZoomUrl && (
        <div
          role="dialog"
          aria-label="Zoom Pratinjau Foto"
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewZoomUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewZoomUrl(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Tutup Pratinjau"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="relative w-full h-[65vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <Image
                src={previewZoomUrl}
                alt="Zoom Pratinjau Foto"
                fill
                className="object-contain"
                unoptimized={previewZoomUrl.startsWith('/uploads/')}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
