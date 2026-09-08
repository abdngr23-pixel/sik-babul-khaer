'use client';

import React, { useState } from 'react';
import { 
  Store, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  Send, 
  Calendar, 
  Sparkles, 
  X, 
  ShieldCheck
} from 'lucide-react';
import { UmkmBusiness, UmkmCategory } from '@/types/umkm';
import { INITIAL_UMKM_LIST } from '@/lib/mock-umkm';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

export function UmkmView() {
  const { isReadOnly, canMutateTab } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'katalog' | 'qardh' | 'bazar'>('katalog');
  const [businesses, setBusinesses] = useState<UmkmBusiness[]>(INITIAL_UMKM_LIST);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [rtFilter, setRtFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New UMKM Form
  const [newName, setNewName] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState<UmkmCategory>('KULINER_HALAL');
  const [newRt, setNewRt] = useState<'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05'>('RT 01');
  const [newAddress, setNewAddress] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProducts, setNewProducts] = useState('');
  const [newPriceRange, setNewPriceRange] = useState('');
  const [newBazar, setNewBazar] = useState(true);

  const canManage = !isReadOnly && canMutateTab('umkm');

  const filteredBusinesses = businesses.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        b.products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = categoryFilter === 'ALL' || b.category === categoryFilter;
    const matchRt = rtFilter === 'ALL' || b.rt === rtFilter;
    return matchSearch && matchCategory && matchRt;
  });

  const handleAddUmkm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newOwner || !newPhone) {
      toast.error('Form Belum Lengkap', 'Nama usaha, pemilik, dan nomor kontak wajib diisi.');
      return;
    }

    const newBusiness: UmkmBusiness = {
      id: `umkm-${Date.now()}`,
      name: newName,
      category: newCategory,
      ownerName: newOwner,
      phone: newPhone,
      rt: newRt,
      address: newAddress || 'Kompleks BTP Blok AE',
      description: newDesc,
      products: newProducts.split(',').map(p => p.trim()).filter(Boolean),
      priceRange: newPriceRange || 'Harga terjangkau',
      bazarParticipant: newBazar,
      qardhFacility: {
        hasLoan: false,
        loanAmount: 0,
        remainingAmount: 0,
        monthlyInstallment: 0,
        status: 'BEBAS_PINJAMAN',
      },
      verifiedByDkm: true,
    };

    setBusinesses([newBusiness, ...businesses]);
    setIsAddModalOpen(false);
    // Reset
    setNewName('');
    setNewOwner('');
    setNewPhone('');
    setNewAddress('');
    setNewDesc('');
    setNewProducts('');
    setNewPriceRange('');

    toast.success('Mitra UMKM Berhasil Didaftarkan', `${newName} telah ditambahkan ke direktori ekonomi jamaah.`);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const totalQardhDisbursed = businesses.reduce((sum, b) => sum + (b.qardhFacility.loanAmount || 0), 0);
  const totalQardhRemaining = businesses.reduce((sum, b) => sum + (b.qardhFacility.remainingAmount || 0), 0);
  const bazarCount = businesses.filter(b => b.bazarParticipant).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-300 text-sm font-medium mb-1">
            <Store className="w-4 h-4" />
            <span>Pemberdayaan Ekonomi Umat & Gerai Muslimah</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Sentra UMKM Jamaah & Qardhul Hasan</h1>
          <p className="text-teal-100 text-sm mt-1 max-w-2xl">
            Wadah kolaborasi usaha mikro warga BTP Blok AE, fasilitas permodalan bergulir bebas riba, dan penyelenggaraan Bazar Jumat Berkah di pelataran masjid.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-xl shadow-lg transition-all duration-200 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Mitra UMKM</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Mitra Terdaftar</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{businesses.length} Usaha Warga</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Binaan DKM Babul Khaer</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Peserta Bazar Jumat</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{bazarCount} Lapak Binaan</div>
            <div className="text-[11px] text-slate-400">Pelataran Masjid Ba&apos;da Jumat</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Modal Disalurkan</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{formatRupiah(totalQardhDisbursed)}</div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Qardhul Hasan Bebas Riba</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tingkat Kolektibilitas</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">100% Lancar</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Sisa Tagihan: {formatRupiah(totalQardhRemaining)}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('katalog')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'katalog'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Katalog Usaha Jamaah ({filteredBusinesses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('qardh')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'qardh'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Dana Bergulir Qardhul Hasan</span>
        </button>

        <button
          onClick={() => setActiveTab('bazar')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'bazar'
              ? 'border-teal-600 text-teal-700 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Bazar Jumat Berkah</span>
        </button>
      </div>

      {/* TAB 1: KATALOG USAHA */}
      {activeTab === 'katalog' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama usaha, produk, pemilik..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="KULINER_HALAL">Kuliner Halal</option>
                <option value="BUSANA_MUSLIM">Busana Muslimah</option>
                <option value="HERBAL_KESEHATAN">Herbal & Kesehatan</option>
                <option value="SEMBAKO_KONTRAKAN">Sembako & Rumah Tangga</option>
                <option value="JASA_KREATIF">Jasa & Percetakan</option>
              </select>

              <select
                value={rtFilter}
                onChange={(e) => setRtFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
              >
                <option value="ALL">Semua RT (01-05)</option>
                <option value="RT 01">RT 01</option>
                <option value="RT 02">RT 02</option>
                <option value="RT 03">RT 03</option>
                <option value="RT 04">RT 04</option>
                <option value="RT 05">RT 05</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBusinesses.map((b) => (
              <div 
                key={b.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                      {b.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {b.rt}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {b.name}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {b.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Produk Unggulan:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {b.products.map((p, pIdx) => (
                        <span 
                          key={pIdx}
                          className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] rounded-md"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>Estimasi Harga:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{b.priceRange}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs">
                    <div className="font-semibold text-slate-900 dark:text-white">{b.ownerName}</div>
                    <div className="text-[11px] text-slate-400">{b.address}</div>
                  </div>

                  <a
                    href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${b.ownerName}, saya jamaah Masjid Babul Khaer ingin menanyakan produk ${b.name}.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Order WA</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: QARDHUL HASAN */}
      {activeTab === 'qardh' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Program Qardhul Hasan (Pinjaman Kebajikan Bebas Riba)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              Fasilitas pinjaman modal usaha syariah murni tanpa bunga, tanpa denda, dan tanpa agunan memberatkan. Bersumber dari infaq bergulir para donatur Masjid Babul Khaer untuk membebaskan pedagang kecil jamaah dari jeratan pinjol dan rentenir keliling.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3">Nama Usaha & Pemilik</th>
                    <th className="p-3">Plafon Pinjaman</th>
                    <th className="p-3">Tanggal Cair</th>
                    <th className="p-3">Angsuran / Bln</th>
                    <th className="p-3">Sisa Pokok</th>
                    <th className="p-3">Status Kelancaran</th>
                    <th className="p-3 text-right">Kontak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                  {businesses.filter(b => b.qardhFacility.hasLoan).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{b.name}</div>
                        <div className="text-[11px] text-slate-400">{b.ownerName} • {b.rt}</div>
                      </td>

                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        {formatRupiah(b.qardhFacility.loanAmount)}
                      </td>

                      <td className="p-3 text-slate-500">
                        {b.qardhFacility.disbursedDate || '-'}
                      </td>

                      <td className="p-3 font-medium">
                        {formatRupiah(b.qardhFacility.monthlyInstallment)}
                      </td>

                      <td className="p-3 font-bold text-teal-700 dark:text-teal-400">
                        {formatRupiah(b.qardhFacility.remainingAmount)}
                      </td>

                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800">
                          {b.qardhFacility.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <a
                          href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${b.ownerName}, pengurus DKM Babul Khaer mengabarkan sisa pinjaman Qardhul Hasan Anda saat ini adalah ${formatRupiah(b.qardhFacility.remainingAmount)} dengan angsuran bulanan ${formatRupiah(b.qardhFacility.monthlyInstallment)}. Status kelancaran: ${b.qardhFacility.status}. Syukran Jazakumullah Khair.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 rounded font-semibold text-[11px] inline-flex items-center gap-1 border border-teal-200 dark:border-teal-800"
                        >
                          <Send className="w-3 h-3" />
                          <span>Notif WA</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BAZAR JUMAT BERKAH */}
      {activeTab === 'bazar' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Bazar Jumat Berkah Pelataran Masjid Babul Khaer</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Kegiatan rutin setiap hari Jumat pukul 11.30 s.d 13.30 WITA untuk memutar roda ekonomi jamaah setelah Sholat Jumat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400">1. Gratis Sewa Lapak</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Lapak meja dan teras masjid dipinjamkan cuma-cuma tanpa dipungut retribusi sewa.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400">2. Infaq Sukarela</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Pedagang dianjurkan menyisihkan infaq sukarela ke kotak amal masjid untuk kebersihan halaman.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-teal-700 dark:text-teal-400">3. Bersih & Halal</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Seluruh produk makanan wajib halal, higienis, dan pedagang wajib membersihkan area setelah bazar usai.
              </p>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Daftar Lapak Terdaftar Pekan Ini:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {businesses.filter(b => b.bazarParticipant).map(b => (
                <div key={b.id} className="p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-teal-50/30 dark:bg-teal-950/20 space-y-1.5">
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{b.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Penanggung Jawab: {b.ownerName} ({b.phone})</div>
                  <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">Menu: {b.products.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DAFTAR MITRA UMKM BARU */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="p-4 bg-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-teal-300" />
                <h3 className="font-bold text-base">Pendaftaran Mitra UMKM Jamaah</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-teal-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUmkm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Usaha / Gerai *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dapur Berkah Bu Aisyah"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Pemilik Usaha *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Hj. Rosdiana"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">No. WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kategori Usaha</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as UmkmCategory)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  >
                    <option value="KULINER_HALAL">Kuliner Halal</option>
                    <option value="BUSANA_MUSLIM">Busana Muslimah</option>
                    <option value="HERBAL_KESEHATAN">Herbal & Kesehatan</option>
                    <option value="SEMBAKO_KONTRAKAN">Sembako & Rumah Tangga</option>
                    <option value="JASA_KREATIF">Jasa & Percetakan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Wilayah RT</label>
                  <select
                    value={newRt}
                    onChange={(e) => setNewRt(e.target.value as UmkmBusiness['rt'])}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  >
                    <option value="RT 01">RT 01</option>
                    <option value="RT 02">RT 02</option>
                    <option value="RT 03">RT 03</option>
                    <option value="RT 04">RT 04</option>
                    <option value="RT 05">RT 05</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Alamat Lengkap Rumah / Toko</label>
                <input
                  type="text"
                  placeholder="Contoh: BTP Blok AE No. 12"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Deskripsi Singkat Usaha</label>
                <textarea
                  rows={2}
                  placeholder="Menjual aneka kue tradisional khas Makassar..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Produk Unggulan (Pisahkan Koma)</label>
                <input
                  type="text"
                  placeholder="Contoh: Barongko, Jalangkote, Pisang Ijo"
                  value={newProducts}
                  onChange={(e) => setNewProducts(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Kisaran Harga</label>
                  <input
                    type="text"
                    placeholder="Rp 5.000 - Rp 50.000"
                    value={newPriceRange}
                    onChange={(e) => setNewPriceRange(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="bazarCheck"
                    checked={newBazar}
                    onChange={(e) => setNewBazar(e.target.checked)}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="bazarCheck" className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Ikut Bazar Jumat Berkah
                  </label>
                </div>
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
                  className="px-4 py-2 text-xs font-semibold bg-teal-700 hover:bg-teal-600 text-white rounded-lg shadow"
                >
                  Simpan Data Mitra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
