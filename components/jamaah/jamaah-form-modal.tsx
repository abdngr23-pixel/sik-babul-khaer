'use client';

import React, { useState } from 'react';
import { Jamaah, Gender, ResidencyStatus, EconomicStatus, FamilyRole } from '@/types/jamaah';
import {
  X,
  Save,
  User,
  MapPin,
  HeartHandshake,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface JamaahFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Jamaah | null;
  onSaved: (jamaah: Jamaah) => void;
}

interface FormContentProps {
  initialData?: Jamaah | null;
  onClose: () => void;
  onSaved: (jamaah: Jamaah) => void;
}

function JamaahFormContent({ initialData, onClose, onSaved }: FormContentProps) {
  const isEditing = Boolean(initialData);

  // Form Fields Pokok
  const [fullName, setFullName] = useState(initialData?.fullName || '');
  const [gender, setGender] = useState<Gender>(initialData?.gender || 'L');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [rt, setRt] = useState<'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05'>(initialData?.rt || 'RT 01');
  const [houseNumber, setHouseNumber] = useState(initialData?.houseNumber || 'Blok AE No. ');
  const [fullAddress, setFullAddress] = useState(initialData?.fullAddress || 'Kompleks BTP Blok AE, Tamalanrea, Makassar');
  const [residencyStatus, setResidencyStatus] = useState<ResidencyStatus>(initialData?.residencyStatus || 'TETAP');
  const [familyRole, setFamilyRole] = useState<FamilyRole>(initialData?.familyRole || 'KEPALA_KELUARGA');
  const [familyMemberCount, setFamilyMemberCount] = useState(initialData?.familyMemberCount || 1);
  const [economicStatus, setEconomicStatus] = useState<EconomicStatus>(initialData?.economicStatus || 'MAMPU');
  const [isYouthMember, setIsYouthMember] = useState(Boolean(initialData?.isYouthMember));
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Data Tambahan (Opsional)
  const [showOptionalData, setShowOptionalData] = useState(
    Boolean(initialData?.nik || initialData?.birthDate || (initialData?.bloodType && initialData.bloodType !== '-'))
  );
  const [nik, setNik] = useState(initialData?.nik || '');
  const [birthPlace, setBirthPlace] = useState(initialData?.birthPlace || 'Makassar');
  const [birthDate, setBirthDate] = useState(initialData?.birthDate || '');
  const [occupation, setOccupation] = useState(initialData?.occupation || '');
  const [bloodType, setBloodType] = useState(initialData?.bloodType || '-');
  const [email, setEmail] = useState(initialData?.email || '');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName.trim() || !houseNumber.trim() || !phone.trim()) {
      setErrorMessage('Mohon lengkapi Nama Lengkap, Nomor Rumah, dan Nomor WhatsApp.');
      return;
    }

    setIsLoading(true);

    const payload = {
      id: initialData?.id,
      fullName: fullName.trim(),
      gender,
      nik: nik.trim() || undefined,
      birthPlace: birthPlace.trim() || undefined,
      birthDate: birthDate || undefined,
      rt,
      houseNumber: houseNumber.trim(),
      fullAddress: fullAddress.trim() || `Kompleks BTP ${houseNumber}, Makassar`,
      phone: phone.trim(),
      email: email.trim() || undefined,
      residencyStatus,
      economicStatus,
      familyRole,
      familyMemberCount: Number(familyMemberCount) || 1,
      occupation: occupation.trim() || undefined,
      bloodType: bloodType !== '-' ? bloodType : undefined,
      isYouthMember,
      notes: notes.trim(),
    };

    try {
      const url = '/api/jamaah';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        onSaved(data.data);
        onClose();
      } else {
        setErrorMessage(data.error || 'Gagal menyimpan data jamaah.');
      }
    } catch {
      setErrorMessage('Terjadi kendala jaringan saat menghubungi server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Content Form */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1 text-xs overscroll-contain">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Banner Jaminan Keamanan & Privasi Data Warga */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 flex items-start gap-3.5 text-emerald-900 shadow-2xs">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
              <span>Jaminan Privasi & Keamanan Data Warga Jamaah</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                Aman & Rahasia
              </span>
            </h4>
            <p className="text-[11px] text-emerald-800/90 mt-1 leading-relaxed">
              Data ini dikelola internal DKM Babul Khaer hanya untuk <strong>silaturahmi warga Kompleks BTP Blok AE, syiar dakwah, dan penyaluran program sosial keumatan</strong>. DKM menjamin kerahasiaan data dan tidak meminta berkas sensitif yang memberatkan warga.
            </p>
          </div>
        </div>

        {/* Bagian 1: Data Pokok Warga */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>1. Identitas & Kontak Warga</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Lengkap / Kepala Keluarga <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Bapak H. Baharuddin, S.E."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor WhatsApp Aktif <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0812xxxxxxxx"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Untuk pengumuman pengajian & info DKM
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Peran dalam Keluarga
              </label>
              <select
                value={familyRole}
                onChange={(e) => setFamilyRole(e.target.value as FamilyRole)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              >
                <option value="KEPALA_KELUARGA">Kepala Keluarga (KK)</option>
                <option value="ISTRI">Istri</option>
                <option value="ANAK">Anak / Remaja</option>
                <option value="LANSIA_TANGGUNGAN">Lansia / Tanggungan</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Jumlah Jiwa dalam Rumah
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={familyMemberCount}
                onChange={(e) => setFamilyMemberCount(parseInt(e.target.value, 10) || 1)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Bagian 2: Alamat di Lingkungan Blok AE */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. Tempat Tinggal di Kompleks BTP Blok AE</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Wilayah Rukun Tetangga (RT) <span className="text-rose-500">*</span>
              </label>
              <select
                value={rt}
                onChange={(e) => setRt(e.target.value as 'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05')}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-emerald-900 font-bold"
              >
                <option value="RT 01">RT 01 RW 08</option>
                <option value="RT 02">RT 02 RW 08</option>
                <option value="RT 03">RT 03 RW 08</option>
                <option value="RT 04">RT 04 RW 08</option>
                <option value="RT 05">RT 05 RW 08</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Rumah di Blok AE <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="Contoh: Blok AE No. 25"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-900 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Status Tempat Tinggal
              </label>
              <select
                value={residencyStatus}
                onChange={(e) => setResidencyStatus(e.target.value as ResidencyStatus)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              >
                <option value="TETAP">Warga Tetap</option>
                <option value="KONTRAK">Kontrak / Sewa</option>
                <option value="KOST">Singgah / Kost</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Patokan / Alamat Lengkap
              </label>
              <input
                type="text"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                placeholder="Jl. Kerukunan Blok AE No. 25 (Depan Taman), BTP, Tamalanrea"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Bagian 3: Layanan & Perhatian DKM */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] pb-1 border-b border-slate-200 flex items-center gap-1.5">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            <span>3. Layanan Sosial & Perhatian Masjid</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kategori Layanan Keumatan
              </label>
              <select
                value={economicStatus}
                onChange={(e) => setEconomicStatus(e.target.value as EconomicStatus)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium"
              >
                <option value="MAMPU">Keluarga Mandiri / Umum</option>
                <option value="MUSTAHIQ_DHUAFA">Keluarga Berhak Bantuan / Dhuafa (Prioritas ZISWAF)</option>
                <option value="LANSIA_DHUAFA">Lansia Memerlukan Perhatian Khusus (Bansos Sembako)</option>
                <option value="YATIM_PIATU">Anak Yatim / Piatu (Santunan & Beasiswa)</option>
                <option value="MUZAKKI">Muzakki / Bersedia Menjadi Donatur Tetap</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer select-none bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 w-full">
                <input
                  type="checkbox"
                  checked={isYouthMember}
                  onChange={(e) => setIsYouthMember(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-800 text-[11px]">
                  Ada Anggota Remaja Masjid (IRMA) di Keluarga
                </span>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan Khusus / Keperluan Jamaah (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Ada lansia tirah baring, anak butuh bimbingan mengaji, atau bersedia jadi relawan"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Bagian 4: Accordion Data Tambahan (Opsional) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          <button
            type="button"
            onClick={() => setShowOptionalData(!showOptionalData)}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 text-xs">
                Data Tambahan Administratif (Opsional — Boleh Dikosongkan)
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-medium">
                {showOptionalData ? 'Terbuka' : 'Tertutup'}
              </span>
            </div>
            {showOptionalData ? (
              <ChevronUp className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {showOptionalData && (
            <div className="p-4 pt-2 border-t border-slate-200 space-y-3 bg-white">
              <p className="text-[11px] text-slate-500">
                Kolom berikut hanya diisi apabila warga bersedia memberikan untuk keperluan administrasi formal (misal: rekomendasi pengajuan ke instansi pemerintah / Baznas).
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NIK KTP (Opsional)
                  </label>
                  <input
                    type="text"
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    placeholder="7371xxxxxxxxxxxx"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tempat Lahir (Opsional)
                  </label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="Makassar"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Lahir (Opsional)
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Pekerjaan / Profesi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Wiraswasta / Guru / Pensiunan"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Golongan Darah (Opsional)
                  </label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  >
                    <option value="-">Tidak Tahu / -</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Alamat Email (Opsional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="bg-slate-50 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 sm:p-6 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="min-h-[44px] flex items-center justify-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-xl text-xs font-bold shadow-soft-sm transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Menyimpan Data...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Simpan Pembaruan' : 'Daftarkan Jamaah'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
}

export default function JamaahFormModal({
  isOpen,
  onClose,
  initialData,
  onSaved,
}: JamaahFormModalProps) {
  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 overflow-hidden">
      <div className="bg-white w-full md:max-w-3xl rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] text-slate-800 animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">
                {isEditing ? 'Ubah Data Profil Jamaah' : 'Pendaftaran Warga Jamaah Baru'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">
                Pangkalan Data DKM Babul Khaer • Kompleks BTP Blok AE
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Key resets all state when initialData changes */}
        <JamaahFormContent
          key={initialData?.id || 'new'}
          initialData={initialData}
          onClose={onClose}
          onSaved={onSaved}
        />
      </div>
    </div>
  );
}
