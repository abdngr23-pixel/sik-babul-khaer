'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  DollarSign, 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Award,
  X,
  UserCheck
} from 'lucide-react';
import { Santri, TpaTeacher, SantriLevel, SppStatus } from '@/types/tpa';
import { INITIAL_SANTRI_LIST, INITIAL_TPA_TEACHERS } from '@/lib/mock-tpa';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

export function TpaView() {
  const { isReadOnly, canMutateTab } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'santri' | 'teachers' | 'hafalan'>('santri');
  const [santriList, setSantriList] = useState<Santri[]>(INITIAL_SANTRI_LIST);
  const [teachers] = useState<TpaTeacher[]>(INITIAL_TPA_TEACHERS);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [sppFilter, setSppFilter] = useState<string>('ALL');
  const [isAddSantriOpen, setIsAddSantriOpen] = useState(false);

  // Form State for new santri
  const [newName, setNewName] = useState('');
  const [newGender, setNewGender] = useState<'L' | 'P'>('L');
  const [newAge, setNewAge] = useState('7');
  const [newLevel, setNewLevel] = useState<SantriLevel>('Iqro 1-2');
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newSppStatus, setNewSppStatus] = useState<SppStatus>('LUNAS');
  const [newTeacherId, setNewTeacherId] = useState(teachers[0]?.id || '');

  const canManage = !isReadOnly && canMutateTab('tpa');

  const filteredSantri = santriList.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.nis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.parentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchLevel = levelFilter === 'ALL' || s.level === levelFilter;
    const matchSpp = sppFilter === 'ALL' || s.sppStatus === sppFilter;
    return matchSearch && matchLevel && matchSpp;
  });

  const handleToggleSppStatus = (id: string, currentStatus: SppStatus) => {
    if (!canManage) return;
    const nextStatus: SppStatus = currentStatus === 'LUNAS' ? 'MENUNGGAK' : 'LUNAS';
    setSantriList(prev => prev.map(s => s.id === id ? { ...s, sppStatus: nextStatus } : s));
    toast.success('Status SPP Diperbarui', `Status santri diubah menjadi ${nextStatus}`);
  };

  const handleAddSantri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newParentName) {
      toast.error('Form Belum Lengkap', 'Nama santri dan nama wali wajib diisi.');
      return;
    }

    const assignedTeacher = teachers.find(t => t.id === newTeacherId) || teachers[0];
    const nextNis = `BK-TPA-2026-${String(santriList.length + 1).padStart(3, '0')}`;

    const newSantri: Santri = {
      id: `san-${Date.now()}`,
      nis: nextNis,
      name: newName,
      gender: newGender,
      age: Number(newAge) || 7,
      level: newLevel,
      parentName: newParentName,
      parentPhone: newParentPhone,
      address: newAddress || 'Kompleks BTP',
      sppStatus: newSppStatus,
      monthlyFee: newSppStatus === 'BEASISWA_DKM' ? 0 : 75000,
      joinDate: new Date().toISOString().split('T')[0],
      teacherId: assignedTeacher.id,
      teacherName: assignedTeacher.name,
      hafalanCount: 'Surah Al-Fatihah',
      lastAssessment: 'Santri baru mendaftar',
    };

    setSantriList([newSantri, ...santriList]);
    setIsAddSantriOpen(false);
    setNewName('');
    setNewParentName('');
    setNewParentPhone('');
    setNewAddress('');

    toast.success('Santri Berhasil Didaftarkan', `${newName} terdaftar dengan NIS ${nextNis}`);
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const totalMonthlyFee = santriList.filter(s => s.sppStatus === 'LUNAS').reduce((sum, s) => sum + s.monthlyFee, 0);
  const totalTeacherHonor = teachers.reduce((sum, t) => sum + t.allowanceMonthly, 0);
  const beasiswaCount = santriList.filter(s => s.sppStatus === 'BEASISWA_DKM').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Seksi Pemberdayaan Perempuan & Pembinaan TPA</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Taman Pendidikan Al-Qur&apos;an (TPA) Babul Khaer</h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            Sistem Informasi Pengelolaan Santri, Ustadzah, Evaluasi Hafalan Al-Qur&apos;an, dan SPP Bulanan Unit 05 Tamalanrea.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddSantriOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold rounded-xl shadow-lg transition-all duration-200 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Daftarkan Santri Baru</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Santri Aktif</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{santriList.length} Santri</div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">{beasiswaCount} Penerima Beasiswa DKM</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Tenaga Pengajar</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{teachers.length} Ustadz/ah</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Jadwal: Senin - Kamis</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Pemasukan SPP / Bln</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{formatRupiah(totalMonthlyFee)}</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Tarif Rp 75.000 / Santri</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Insentif Ustadzah</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{formatRupiah(totalTeacherHonor)}</div>
            <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Disubsidi Kas Masjid</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-2">
        <button
          onClick={() => setActiveTab('santri')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'santri'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Database Santri ({filteredSantri.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'teachers'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Tenaga Pengajar & Ustadzah ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hafalan')}
          className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'hafalan'
              ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Capaian Hafalan & Munaqasyah</span>
        </button>
      </div>

      {/* TAB 1: SANTRI LIST */}
      {activeTab === 'santri' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama santri, NIS, atau wali..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Kelas:</span>
              </div>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
              >
                <option value="ALL">Semua Tingkat</option>
                <option value="Iqro 1-2">Iqro 1-2</option>
                <option value="Iqro 3-4">Iqro 3-4</option>
                <option value="Iqro 5-6">Iqro 5-6</option>
                <option value="Al-Quran Dasar">Al-Qur&apos;an Dasar</option>
                <option value="Tahfidz Juz 30">Tahfidz Juz 30</option>
                <option value="Tahfidz Lanjutan">Tahfidz Lanjutan</option>
              </select>

              <select
                value={sppFilter}
                onChange={(e) => setSppFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
              >
                <option value="ALL">Semua Status SPP</option>
                <option value="LUNAS">Lunas</option>
                <option value="MENUNGGAK">Menunggak</option>
                <option value="BEASISWA_DKM">Beasiswa DKM</option>
              </select>
            </div>
          </div>

          {/* Table of Santri */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-3">Santri & NIS</th>
                    <th className="p-3">Jenjang / Kelas</th>
                    <th className="p-3">Ustadzah Pembina</th>
                    <th className="p-3">Wali Santri</th>
                    <th className="p-3">Status SPP</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-slate-700 dark:text-slate-300">
                  {filteredSantri.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            s.gender === 'L' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-300'
                          }`}>
                            {s.gender}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                            <div className="text-[11px] text-slate-400">{s.nis} • {s.age} Tahun</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                          {s.level}
                        </span>
                      </td>

                      <td className="p-3">
                        <div className="font-medium text-slate-900 dark:text-slate-200">{s.teacherName}</div>
                      </td>

                      <td className="p-3">
                        <div className="font-medium">{s.parentName}</div>
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Phone className="w-3 h-3" />
                          <span>{s.parentPhone}</span>
                          {s.parentPhone && (
                            <a
                              href={`https://wa.me/${s.parentPhone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 ml-1"
                            >
                              <Send className="w-2.5 h-2.5" /> WA
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="p-3">
                        {canManage && s.sppStatus !== 'BEASISWA_DKM' ? (
                          <button
                            type="button"
                            onClick={() => handleToggleSppStatus(s.id, s.sppStatus)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              s.sppStatus === 'LUNAS'
                                ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                            }`}
                          >
                            {s.sppStatus === 'LUNAS' && <CheckCircle2 className="w-3 h-3" />}
                            {s.sppStatus === 'MENUNGGAK' && <AlertCircle className="w-3 h-3" />}
                            <span>{s.sppStatus.replace('_', ' ')}</span>
                          </button>
                        ) : (
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-semibold items-center gap-1.5 ${
                              s.sppStatus === 'LUNAS'
                                ? 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-800'
                                : s.sppStatus === 'BEASISWA_DKM'
                                ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                                : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                            }`}
                          >
                            {s.sppStatus === 'LUNAS' && <CheckCircle2 className="w-3 h-3" />}
                            {s.sppStatus === 'MENUNGGAK' && <AlertCircle className="w-3 h-3" />}
                            <span>{s.sppStatus.replace('_', ' ')}</span>
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-right">
                        <a
                          href={`https://wa.me/${s.parentPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${s.parentName}, pengurus TPA Babul Khaer mengabarkan bahwa ${s.name} saat ini berada di kelas ${s.level} (${s.hafalanCount}). Status SPP: ${s.sppStatus}. Syukran Jazakumullah Khair.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-md font-semibold text-[11px] inline-flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                        >
                          <Send className="w-3 h-3" />
                          <span>Kirim Rapor WA</span>
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

      {/* TAB 2: TEACHERS */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teachers.map((t) => (
            <div 
              key={t.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</h3>
                    <div className="text-xs text-slate-400">{t.specialization}</div>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300">
                  {t.status}
                </span>
              </div>

              <div className="space-y-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Jadwal Mengajar:</span>
                  <span className="font-semibold">{t.schedule}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Jumlah Santri Asuhan:</span>
                  <span className="font-semibold">{t.studentCount} Santri</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="text-slate-400">Insentif Bulanan:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(t.allowanceMonthly)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{t.phone}</span>
                </div>
                <a
                  href={`https://wa.me/${t.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Hubungi Ustadzah</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: CAPAIAN HAFALAN */}
      {activeTab === 'hafalan' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Progres Hafalan Santri & Ujian Munaqasyah</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Monitoring hafalan Juz 30 dan Juz 29 untuk persiapan wisuda santri BKPRMI tahun 2026.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {santriList.map((s) => (
              <div 
                key={s.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors space-y-2 bg-slate-50/40 dark:bg-slate-800/20"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{s.name}</div>
                    <div className="text-[11px] text-slate-400">Kelas: {s.level} • Pembina: {s.teacherName}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {s.nis}
                  </span>
                </div>

                <div className="text-xs">
                  <div className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    <span>Capaian: {s.hafalanCount || 'Belum ada data'}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                    Catatan Ustadzah: &ldquo;{s.lastAssessment}&rdquo;
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: DAFTARKAN SANTRI BARU */}
      {isAddSantriOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Pendaftaran Santri Baru TPA</h3>
              </div>
              <button
                onClick={() => setIsAddSantriOpen(false)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSantri} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Lengkap Santri *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Rayhan"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Jenis Kelamin</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as 'L' | 'P')}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Usia (Tahun)</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tingkat / Kelas</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as SantriLevel)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  >
                    <option value="Iqro 1-2">Iqro 1-2</option>
                    <option value="Iqro 3-4">Iqro 3-4</option>
                    <option value="Iqro 5-6">Iqro 5-6</option>
                    <option value="Al-Quran Dasar">Al-Qur&apos;an Dasar</option>
                    <option value="Tahfidz Juz 30">Tahfidz Juz 30</option>
                    <option value="Tahfidz Lanjutan">Tahfidz Lanjutan</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ustadzah Pembina</label>
                  <select
                    value={newTeacherId}
                    onChange={(e) => setNewTeacherId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nama Orang Tua / Wali *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: H. Amiruddin"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">No. WhatsApp Wali</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newParentPhone}
                    onChange={(e) => setNewParentPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Status Iuran SPP</label>
                  <select
                    value={newSppStatus}
                    onChange={(e) => setNewSppStatus(e.target.value as SppStatus)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                  >
                    <option value="LUNAS">Reguler (Rp 75.000 / bln)</option>
                    <option value="BEASISWA_DKM">Beasiswa DKM Dhuafa (Gratis)</option>
                    <option value="MENUNGGAK">Menunggak</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Alamat Rumah (BTP)</label>
                <input
                  type="text"
                  placeholder="Contoh: Blok AE No. 14"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddSantriOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow"
                >
                  Simpan Data Santri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
