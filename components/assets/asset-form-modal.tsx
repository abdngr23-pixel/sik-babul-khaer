'use client';

import React, { useState } from 'react';
import {
  AssetItem,
  AssetCategory,
  AssetCondition,
  ASSET_CATEGORIES
} from '@/types/asset';
import { X, Save, Package, Loader2, Info } from 'lucide-react';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AssetItem | null;
  onSaved: (asset: AssetItem) => void;
}

export default function AssetFormModal({
  isOpen,
  onClose,
  initialData,
  onSaved,
}: AssetFormModalProps) {
  if (!isOpen) return null;

  return (
    <AssetFormModalContent
      key={initialData?.id || 'new'}
      onClose={onClose}
      initialData={initialData}
      onSaved={onSaved}
    />
  );
}

function AssetFormModalContent({
  onClose,
  initialData,
  onSaved,
}: {
  onClose: () => void;
  initialData?: AssetItem | null;
  onSaved: (asset: AssetItem) => void;
}) {
  const isEditing = Boolean(initialData);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [category, setCategory] = useState<AssetCategory>(
    initialData?.category || 'PENDINGIN_UDARA'
  );
  const [location, setLocation] = useState(initialData?.location || 'Ruang Utama Masjid');
  const [purchaseCost, setPurchaseCost] = useState(
    initialData?.purchaseCost ? String(initialData.purchaseCost) : ''
  );
  const [purchaseDate, setPurchaseDate] = useState(
    initialData?.purchaseDate || new Date().toISOString().split('T')[0]
  );
  const [condition, setCondition] = useState<AssetCondition>(
    initialData?.condition || 'BAIK'
  );
  const [maintenanceCycleMonths, setMaintenanceCycleMonths] = useState(
    initialData?.maintenanceCycleMonths
      ? String(initialData.maintenanceCycleMonths)
      : String(ASSET_CATEGORIES['PENDINGIN_UDARA'].defaultCycleMonths)
  );
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState(
    initialData?.lastMaintenanceDate || ''
  );
  const [maintenanceNotes, setMaintenanceNotes] = useState(
    initialData?.maintenanceNotes || ''
  );

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Category Change (auto-update default maintenance cycle if creating new)
  const handleCategoryChange = (newCat: AssetCategory) => {
    setCategory(newCat);
    if (!isEditing) {
      setMaintenanceCycleMonths(String(ASSET_CATEGORIES[newCat]?.defaultCycleMonths || 3));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Nama barang / aset inventaris wajib diisi');
      return;
    }
    if (!location.trim()) {
      setErrorMessage('Lokasi penempatan aset wajib diisi');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        id: initialData?.id,
        name: name.trim(),
        code: code.trim(),
        category,
        location: location.trim(),
        purchaseCost: Number(purchaseCost) || 0,
        purchaseDate: purchaseDate || undefined,
        condition,
        maintenanceCycleMonths: Number(maintenanceCycleMonths) || 3,
        lastMaintenanceDate: lastMaintenanceDate || undefined,
        maintenanceNotes: maintenanceNotes.trim() || undefined,
      };

      const url = '/api/assets';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal menyimpan data inventaris');
      }

      onSaved(data.data);
      onClose();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 overflow-hidden">
      <div className="bg-white rounded-t-3xl md:rounded-2xl md:max-w-2xl w-full h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[90dvh] flex flex-col shadow-2xl border-t md:border border-slate-200 overflow-hidden text-slate-800 animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-200 shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                {isEditing ? 'Perbarui Data Inventaris Sarpras' : 'Registrasi Aset Sarpras Baru'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-tight">
                Inventaris fisik fasilitas DKM Masjid Babul Khaer BTP Blok AE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Kode Aset */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode Aset
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="AST-AC-001 (Opsional)"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">Kosongkan untuk otomatis</p>
            </div>

            {/* Nama Aset */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Barang / Fasilitas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: AC Duduk Daikin Floor Standing 2 PK"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Kategori */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kategori Fasilitas <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value as AssetCategory)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
              >
                {Object.entries(ASSET_CATEGORIES).map(([key, info]) => (
                  <option key={key} value={key}>
                    {info.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Lokasi Penempatan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lokasi Penempatan <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Ruang Utama Masjid (Depan Kiri)"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Nilai Perolehan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nilai Perolehan / Beli (Rp)
              </label>
              <input
                type="number"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                placeholder="14500000"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold"
              />
            </div>

            {/* Tanggal Beli */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tanggal Pembelian
              </label>
              <input
                type="date"
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            {/* Kondisi Fisik */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kondisi Fisik Saat Ini <span className="text-rose-500">*</span>
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
              >
                <option value="BAIK">Kondisi Prima (Baik)</option>
                <option value="PERLU_PERBAIKAN">Perlu Perbaikan</option>
                <option value="RUSAK_BERAT">Rusak Berat</option>
              </select>
            </div>
          </div>

          {/* Section: Pemeliharaan Rutin */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Pengaturan Siklus Pemeliharaan Rutin
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Siklus Servis (Bulan) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Siklus Servis Rutin (Bulan)
                </label>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={maintenanceCycleMonths}
                  onChange={(e) => setMaintenanceCycleMonths(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Standar: AC (3 bln), Genset (4 bln), Sound (6 bln)
                </p>
              </div>

              {/* Tanggal Servis Terakhir */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Servis Terakhir
                </label>
                <input
                  type="date"
                  value={lastMaintenanceDate}
                  onChange={(e) => setLastMaintenanceDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Tanggal servis berikutnya akan dihitung otomatis
                </p>
              </div>
            </div>

            {/* Catatan Servis / Fisik */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Catatan Pemeliharaan & Kontak Teknisi
              </label>
              <textarea
                value={maintenanceNotes}
                onChange={(e) => setMaintenanceNotes(e.target.value)}
                rows={2}
                placeholder="Contoh: Teknisi Daikin Tamalanrea (Bpk. Hasan 081244xxxx), ganti filter freon R32..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-slate-100 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="min-h-[44px] flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl shadow-soft-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Simpan Perubahan' : 'Daftarkan Aset'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
