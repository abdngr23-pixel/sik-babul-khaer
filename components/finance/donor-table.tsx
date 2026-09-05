'use client';

import React, { useState } from 'react';
import { DonorItem, DONOR_CATEGORIES, DonorStats } from '@/types/donor';
import { FinanceTransaction } from '@/types/finance';
import {
  Search,
  Plus,
  HeartHandshake,
  CheckCircle2,
  Clock,
  MessageCircle,
  CreditCard,
  Edit2,
  Trash2,
  Coins,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';
import DonorModal from './donor-modal';
import DonorPaymentModal from './donor-payment-modal';

interface DonorTableProps {
  donors: DonorItem[];
  donorStats: DonorStats;
  onDonorSaved: (donor: DonorItem) => void;
  onDonorDeleted: (id: string) => void;
  onPaymentRecorded: (donor: DonorItem, transaction: FinanceTransaction) => void;
  isReadOnly?: boolean;
  externalSearchTerm?: string;
  isExternalCreateOpen?: boolean;
  onCloseExternalCreate?: () => void;
}

export default function DonorTable({
  donors,
  donorStats,
  onDonorSaved,
  onDonorDeleted,
  onPaymentRecorded,
  isReadOnly = false,
  externalSearchTerm = '',
  isExternalCreateOpen = false,
  onCloseExternalCreate,
}: DonorTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedRT, setSelectedRT] = useState<string>('ALL');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('ALL');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDonor, setEditingDonor] = useState<DonorItem | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePaymentDonor, setActivePaymentDonor] = useState<DonorItem | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const currentMonthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());

  const effectiveSearch = (externalSearchTerm || searchTerm).toLowerCase().trim();

  // Filtered donors
  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      !effectiveSearch ||
      donor.donorName.toLowerCase().includes(effectiveSearch) ||
      donor.phone.includes(effectiveSearch) ||
      donor.address.toLowerCase().includes(effectiveSearch) ||
      (donor.notes && donor.notes.toLowerCase().includes(effectiveSearch));

    const matchesCategory =
      selectedCategory === 'ALL' || donor.category === selectedCategory;

    const matchesRT = selectedRT === 'ALL' || donor.rt === selectedRT;

    const isPaidThisMonth = donor.lastPaymentMonth === currentMonth;
    const matchesPaymentStatus =
      selectedPaymentStatus === 'ALL' ||
      (selectedPaymentStatus === 'PAID' && isPaidThisMonth) ||
      (selectedPaymentStatus === 'UNPAID' && !isPaidThisMonth);

    return matchesSearch && matchesCategory && matchesRT && matchesPaymentStatus;
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleOpenEdit = (donor: DonorItem) => {
    setEditingDonor(donor);
    setIsFormModalOpen(true);
  };

  const handleOpenPayment = (donor: DonorItem) => {
    setActivePaymentDonor(donor);
    setIsPaymentModalOpen(true);
  };

  const handleWhatsApp = (phone: string, name: string, isPaid: boolean, amount: number) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }

    const text = isPaid
      ? `Assalamu'alaikum Warahmatullahi Wabarakatuh, Bapak/Ibu ${name}. Pengurus DKM Masjid Babul Khaer BTP Blok AE mengucapkan terima kasih banyak (Jazakumullahu Khairan Katsiran) atas setoran infaq rutin sebesar ${formatRupiah(amount)} untuk bulan ${currentMonthName}. Semoga Allah SWT melipatgandakan pahala dan keberkahan bagi Bapak/Ibu sekeluarga. Aamiin.`
      : `Assalamu'alaikum Warahmatullahi Wabarakatuh, Bapak/Ibu ${name}. Semoga senantiasa dalam keadaan sehat wal'afiat. Kami dari Pengurus DKM Babul Khaer BTP Blok AE ingin mengonfirmasi terkait program infaq rutin bulanan (${formatRupiah(amount)}) untuk periode ${currentMonthName}. Jika ada yang dapat kami bantu atau titipkan melalui rekening/marbot, silakan mengabari kami. Jazakumullahu Khairan.`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Donatur Aktif */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Donatur Aktif
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {donorStats.activeDonors}
            </span>
            <span className="text-xs text-slate-500">
              dari {donorStats.totalDonors} terdaftar
            </span>
          </div>
          <p className="text-[11px] text-teal-700 font-medium mt-2">
            Muhsinin rutin warga BTP Blok AE
          </p>
        </div>

        {/* Potensi Komitmen Bulanan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Target Rutin / Bulan
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-slate-900">
              {formatRupiah(donorStats.monthlyPotential)}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Proyeksi penerimaan per bulan
          </p>
        </div>

        {/* Realisasi Bulan Ini */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Realisasi {currentMonthName.split(' ')[0]}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-emerald-700">
              {formatRupiah(donorStats.currentMonthCollected)}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Ketercapaian:</span>
            <span className="font-bold text-emerald-800">
              {donorStats.monthlyPotential > 0
                ? Math.round((donorStats.currentMonthCollected / donorStats.monthlyPotential) * 100)
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Rasio Status Lunas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Status Bulan Berjalan
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="text-lg font-bold text-emerald-700">
                {donorStats.paidThisMonthCount}
              </span>
              <span className="text-[11px] text-slate-500 ml-1">Lunas</span>
            </div>
            <span className="text-slate-300">/</span>
            <div>
              <span className="text-lg font-bold text-amber-600">
                {donorStats.unpaidThisMonthCount}
              </span>
              <span className="text-[11px] text-slate-500 ml-1">Menunggu</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {donorStats.unpaidThisMonthCount > 0
              ? `${donorStats.unpaidThisMonthCount} donatur belum tercatat bulan ini`
              : 'Semua donatur aktif telah menyetor!'}
          </p>
        </div>
      </div>

      {/* Toolbar Controls */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama donatur, nomor WA, atau alamat Blok AE..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden transition-all text-slate-800"
          />
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pos Donasi Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium"
          >
            <option value="ALL">Semua Pos Dana</option>
            {Object.values(DONOR_CATEGORIES).map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          {/* RT Filter */}
          <select
            value={selectedRT}
            onChange={(e) => setSelectedRT(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium"
          >
            <option value="ALL">Semua Wilayah RT</option>
            <option value="RT 01">RT 01</option>
            <option value="RT 02">RT 02</option>
            <option value="RT 03">RT 03</option>
            <option value="RT 04">RT 04</option>
            <option value="RT 05">RT 05</option>
            <option value="Luar Blok AE">Luar Blok AE</option>
          </select>

          {/* Status Setor Bulan Ini */}
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-teal-500 focus:outline-hidden font-medium"
          >
            <option value="ALL">Semua Status Setor</option>
            <option value="PAID">Lunas Bulan Ini</option>
            <option value="UNPAID">Belum Setor Bulan Ini</option>
          </select>

          {/* Add Donor Button */}
          {!isReadOnly && (
            <button
              onClick={() => {
                setEditingDonor(null);
                setIsFormModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-soft-sm hover:shadow-soft-md transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Daftarkan Donatur</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3.5 px-4">Nama Donatur</th>
                <th className="py-3.5 px-4">Wilayah & Kontak</th>
                <th className="py-3.5 px-4">Pos Alokasi Donasi</th>
                <th className="py-3.5 px-4">Komitmen Bulanan</th>
                <th className="py-3.5 px-4">Jadwal Rutin</th>
                <th className="py-3.5 px-4">Status {currentMonthName.split(' ')[0]}</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredDonors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <HeartHandshake className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-sm text-slate-700">Tidak ada donatur ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba sesuaikan kata kunci pencarian atau filter di atas.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredDonors.map((donor) => {
                  const categoryInfo = DONOR_CATEGORIES[donor.category] || {
                    name: donor.category,
                    badgeColor: 'emerald',
                  };
                  const isPaidThisMonth = donor.lastPaymentMonth === currentMonth;

                  return (
                    <tr key={donor.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Nama Donatur */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-sm">{donor.donorName}</div>
                        {donor.notes && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 italic mt-0.5">
                            {donor.notes}
                          </p>
                        )}
                      </td>

                      {/* Wilayah & Kontak */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {donor.rt}
                          </span>
                          <span className="font-mono text-[11px] text-slate-700">{donor.phone}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {donor.address}
                        </p>
                      </td>

                      {/* Pos Alokasi */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                          {categoryInfo.name}
                        </span>
                      </td>

                      {/* Komitmen Bulanan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900">
                          {formatRupiah(donor.commitmentAmount)}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          via {donor.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Jadwal Rutin */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Tgl {donor.billingDay} / bln</span>
                        </div>
                      </td>

                      {/* Status Bulan Berjalan */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isPaidThisMonth ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Lunas Bulan Ini</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Belum Setor</span>
                          </span>
                        )}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* 1-Klik Catat Setor Kas */}
                          {!isReadOnly && (
                            <button
                              onClick={() => handleOpenPayment(donor)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
                              title="Catat penerimaan donasi langsung masuk ke Buku Kas DKM"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Setor Kas</span>
                            </button>
                          )}

                          {/* Chat WhatsApp Konfirmasi */}
                          <button
                            onClick={() => handleWhatsApp(donor.phone, donor.donorName, isPaidThisMonth, donor.commitmentAmount)}
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors cursor-pointer"
                            title={isPaidThisMonth ? 'Kirim Ucapan Terima Kasih via WhatsApp' : 'Kirim Pengingat Santun via WhatsApp'}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          {!isReadOnly && (
                            <button
                              onClick={() => handleOpenEdit(donor)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Edit Data Donatur"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          {!isReadOnly && (
                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus donatur ${donor.donorName}?`)) {
                                  onDonorDeleted(donor.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Donatur"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredDonors.length}</strong> dari total <strong>{donors.length}</strong> donatur tetap terdata
          </span>
          <span className="text-[11px] text-slate-400">
            Seksi ZISWAF & Kesejahteraan Umat DKM Masjid Babul Khaer
          </span>
        </div>
      </div>

      {/* Modal Tambah/Edit */}
      <DonorModal
        isOpen={isFormModalOpen || isExternalCreateOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingDonor(null);
          onCloseExternalCreate?.();
        }}
        onSaved={(d) => {
          onDonorSaved(d);
          setIsFormModalOpen(false);
          setEditingDonor(null);
          onCloseExternalCreate?.();
        }}
        initialData={editingDonor}
      />

      {/* Modal 1-Klik Setor Kas */}
      <DonorPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setActivePaymentDonor(null);
        }}
        donor={activePaymentDonor}
        onPaymentRecorded={(d, t) => {
          onPaymentRecorded(d, t);
          setIsPaymentModalOpen(false);
          setActivePaymentDonor(null);
        }}
      />
    </div>
  );
}
