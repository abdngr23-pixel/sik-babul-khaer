'use client';

import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  Printer, 
  Plus, 
  Calendar, 
  DollarSign, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  X,
  Award,
  Send
} from 'lucide-react';
import { AdhocCommittee, CommitteeSection } from '@/types/adhoc';
import { INITIAL_ADHOC_COMMITTEES } from '@/lib/mock-adhoc';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

export function AdhocCommitteeView() {
  const { currentUser, isReadOnly } = useAuth();
  const { toast } = useToast();
  const [committees, setCommittees] = useState<AdhocCommittee[]>(INITIAL_ADHOC_COMMITTEES);
  const [expandedId, setExpandedId] = useState<string | null>('adhoc-001');
  const [selectedForSK, setSelectedForSK] = useState<AdhocCommittee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Committee Form State
  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newTargetBudget, setNewTargetBudget] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newKetuaName, setNewKetuaName] = useState('');
  const [newKetuaPhone, setNewKetuaPhone] = useState('');
  const [newSekretarisName, setNewSekretarisName] = useState('');
  const [newSekretarisPhone, setNewSekretarisPhone] = useState('');
  const [newBendaharaName, setNewBendaharaName] = useState('');
  const [newBendaharaPhone, setNewBendaharaPhone] = useState('');
  const [sections, setSections] = useState<CommitteeSection[]>([
    { name: 'Seksi Acara & Protokoler', coordinator: '', members: [''] },
    { name: 'Seksi Perlengkapan & Logistik', coordinator: '', members: [''] }
  ]);

  const canManage = (currentUser.role === 'KETUA_UMUM' || currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'SEKRETARIS') && !isReadOnly;


  const handleAddSection = () => {
    setSections([...sections, { name: '', coordinator: '', members: [''] }]);
  };

  const handleSectionChange = (idx: number, field: keyof CommitteeSection, val: string | string[]) => {
    const updated = [...sections];
    updated[idx] = { ...updated[idx], [field]: val };
    setSections(updated);
  };


  const handleSubmitNewCommittee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newKetuaName) {
      toast.error('Form Belum Lengkap', 'Nama kepanitiaan dan Ketua wajib diisi.');
      return;
    }

    const nextId = `adhoc-${String(committees.length + 1).padStart(3, '0')}`;
    const nextSkNumber = `00${committees.length + 5}/SK/DKM-BK/IX/2026`;
    const today = new Date().toISOString().split('T')[0];

    const newCommittee: AdhocCommittee = {
      id: nextId,
      name: newName,
      code: newCode || `PAN-${Date.now().toString().slice(-4)}`,
      skNumber: nextSkNumber,
      skDate: today,
      eventDate: newEventDate || today,
      targetBudget: Number(newTargetBudget) || 0,
      description: newDescription,
      structure: {
        ketua: { name: newKetuaName, phone: newKetuaPhone },
        sekretaris: { name: newSekretarisName, phone: newSekretarisPhone },
        bendahara: { name: newBendaharaName, phone: newBendaharaPhone },
        sections: sections.filter(s => s.name.trim() !== '')
      },
      status: 'AKTIF',
      createdAt: new Date().toISOString()
    };

    setCommittees([newCommittee, ...committees]);
    setIsAddModalOpen(false);
    // Reset form
    setNewName('');
    setNewCode('');
    setNewEventDate('');
    setNewTargetBudget('');
    setNewDescription('');
    setNewKetuaName('');
    setNewKetuaPhone('');
    setNewSekretarisName('');
    setNewSekretarisPhone('');
    setNewBendaharaName('');
    setNewBendaharaPhone('');

    toast.success('Panitia Ad-hoc Ditambahkan', `SK Penetapan ${nextSkNumber} berhasil digenerate.`);
  };

  const handlePrintSK = () => {
    window.print();
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const totalBudget = committees.reduce((sum, c) => sum + c.targetBudget, 0);
  const activeCount = committees.filter(c => c.status === 'AKTIF').length;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium mb-1">
            <Award className="w-4 h-4" />
            <span>Struktur Organisasi & Tata Kelola Acara</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Kepanitiaan Ad-hoc & SK Penetapan</h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-2xl">
            Penerbitan Surat Keputusan (SK) resmi DKM Babul Khaer untuk panitia kegiatan temporer (PHBI, Pembangunan, Idul Adha, dsb).
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold rounded-xl shadow-lg transition-all duration-200 text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Bentuk Panitia Baru</span>
          </button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Kepanitiaan</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{committees.length} Ad-hoc</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">{activeCount} Sedang Aktif Berjalan</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target Total Anggaran</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{formatRupiah(totalBudget)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dikelola Mandiri oleh Panitia</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Legalitas SK DKM</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">100% Terverifikasi</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Sesuai AD/ART DKM 2020</div>
          </div>
        </div>
      </div>

      {/* Committee List */}
      <div className="space-y-4">
        {committees.map((comm) => {
          const isExpanded = expandedId === comm.id;
          return (
            <div 
              key={comm.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all duration-200"
            >
              {/* Card Header Summary */}
              <div className="p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {comm.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      SK: {comm.skNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      comm.status === 'AKTIF' 
                        ? 'bg-green-100 dark:bg-green-950/80 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {comm.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
                    {comm.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center">
                  <button
                    onClick={() => setSelectedForSK(comm)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-semibold border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Lihat & Cetak SK</span>
                  </button>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : comm.id)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors"
                  >
                    <span>{isExpanded ? 'Tutup Detail' : 'Struktur & Seksi'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Collapsible Detail */}
              {isExpanded && (
                <div className="p-5 bg-slate-50/50 dark:bg-slate-950/40 space-y-6">
                  {/* Pimpinan Inti */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                      Pengurus Inti Panitia
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Ketua */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                          Ketua Panitia
                        </span>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {comm.structure.ketua.name}
                        </div>
                        {comm.structure.ketua.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{comm.structure.ketua.phone}</span>
                            <a
                              href={`https://wa.me/${comm.structure.ketua.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-auto text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] flex items-center gap-0.5"
                            >
                              <Send className="w-2.5 h-2.5" /> WA
                            </a>
                          </div>
                        )}
                        {comm.structure.ketua.address && (
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {comm.structure.ketua.address}
                          </div>
                        )}
                      </div>

                      {/* Sekretaris */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                          Sekretaris
                        </span>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {comm.structure.sekretaris.name}
                        </div>
                        {comm.structure.sekretaris.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{comm.structure.sekretaris.phone}</span>
                            <a
                              href={`https://wa.me/${comm.structure.sekretaris.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-auto text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] flex items-center gap-0.5"
                            >
                              <Send className="w-2.5 h-2.5" /> WA
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Bendahara */}
                      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                          Bendahara
                        </span>
                        <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                          {comm.structure.bendahara.name}
                        </div>
                        {comm.structure.bendahara.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{comm.structure.bendahara.phone}</span>
                            <a
                              href={`https://wa.me/${comm.structure.bendahara.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-auto text-emerald-600 dark:text-emerald-400 hover:underline text-[11px] flex items-center gap-0.5"
                            >
                              <Send className="w-2.5 h-2.5" /> WA
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seksi-Seksi Kerja */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                      Bidang & Seksi Pelaksana
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {comm.structure.sections.map((sec, sIdx) => (
                        <div 
                          key={sIdx}
                          className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
                        >
                          <div>
                            <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 mb-2">
                              {sec.name}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium block">Koordinator:</span>
                              <span className="font-semibold text-slate-900 dark:text-white">{sec.coordinator || '-'}</span>
                            </div>
                          </div>

                          {sec.members && sec.members.length > 0 && (
                            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-1">Anggota:</span>
                              <div className="flex flex-wrap gap-1">
                                {sec.members.map((m, mIdx) => (
                                  <span 
                                    key={mIdx} 
                                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] rounded-md"
                                  >
                                    {m}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Budget & Target Info Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>Estimasi Pelaksanaan / Selesai: <strong>{comm.eventDate}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span>Target Anggaran: <strong>{formatRupiah(comm.targetBudget)}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL: Surat Keputusan (SK) Generator & Printable Sheet */}
      {selectedForSK && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header Actions */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm">Surat Keputusan (SK) Resmi Pengurus DKM</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintSK}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  onClick={() => setSelectedForSK(null)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable SK Document Content */}
            <div className="p-8 md:p-12 overflow-y-auto bg-white text-slate-900 font-serif leading-relaxed text-sm">
              {/* Kop Surat DKM */}
              <div className="border-b-4 border-double border-slate-900 pb-4 text-center">
                <div className="text-xs uppercase tracking-widest text-slate-600 font-sans font-bold">
                  DEWAN KEMAKMURAN MASJID (DKM)
                </div>
                <div className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-slate-900 font-sans mt-1">
                  MASJID BABUL KHAER
                </div>
                <div className="text-xs text-slate-600 font-sans mt-1">
                  Kompleks Perumahan Bumi Tamalanrea Permai (BTP) Blok AE, Kel. Tamalanrea, Kec. Tamalanrea, Kota Makassar, Sulawesi Selatan 90245
                </div>
                <div className="text-[11px] text-slate-500 font-sans mt-0.5">
                  Website / Portal: sik-babul-khaer.vercel.app • Rekening BSI: 7123456789
                </div>
              </div>

              {/* SK Header */}
              <div className="text-center my-6">
                <div className="text-base font-bold uppercase tracking-wider underline">
                  SURAT KEPUTUSAN KETUA PENGURUS DKM MASJID BABUL KHAER
                </div>
                <div className="text-xs font-semibold font-sans mt-1">
                  Nomor : {selectedForSK.skNumber}
                </div>
                <div className="text-xs font-bold font-sans uppercase mt-2">
                  TENTANG
                </div>
                <div className="text-sm font-bold uppercase mt-1">
                  PENETAPAN SUSUNAN PANITIA PELAKSANA <br />
                  &ldquo;{selectedForSK.name.toUpperCase()}&rdquo;
                </div>
              </div>

              {/* Konsideran */}
              <div className="space-y-3 text-xs md:text-sm font-sans mb-6">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-2 font-bold">Menimbang</div>
                  <div className="col-span-10 text-justify">
                    : a. Bahwa demi kelancaran, ketertiban, dan suksesnya penyelenggaraan {selectedForSK.name}, maka dipandang perlu membentuk Panitia Pelaksana Khusus (Ad-hoc);<br />
                    b. Bahwa nama-nama yang tercantum dalam lampiran keputusan ini dipandang cakap, amanah, dan mampu mengemban tugas kepanitiaan tersebut.
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-2 font-bold">Mengingat</div>
                  <div className="col-span-10 text-justify">
                    : 1. Anggaran Dasar dan Anggaran Rumah Tangga (AD/ART) DKM Masjid Babul Khaer Tahun 2020;<br />
                    2. Hasil Keputusan Rapat Kerja Pengurus DKM Babul Khaer Periode 2026–2028;<br />
                    3. Arahan Dewan Penasehat dan Dewan Pembina DKM Masjid Babul Khaer.
                  </div>
                </div>

                <div className="text-center font-bold my-4 uppercase tracking-wider">
                  MEMUTUSKAN
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-2 font-bold">Menetapkan</div>
                  <div className="col-span-10 font-bold uppercase">
                    : KEPUTUSAN KETUA PENGURUS DKM MASJID BABUL KHAER TENTANG PENGANGKATAN PANITIA PELAKSANA {selectedForSK.name.toUpperCase()}.
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-2 font-bold">Pertama</div>
                  <div className="col-span-10 text-justify">
                    : Mengangkat dan mengesahkan susunan Panitia Pelaksana sebagaimana rincian berikut:
                  </div>
                </div>
              </div>

              {/* Susunan Personalia Table */}
              <div className="my-4 border border-slate-300 rounded-lg overflow-hidden font-sans text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                    <tr>
                      <th className="p-2.5 w-12 text-center border-r border-slate-300">No</th>
                      <th className="p-2.5 w-48 border-r border-slate-300">Jabatan Kepanitiaan</th>
                      <th className="p-2.5">Nama Personalia / Koordinator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 text-center border-r border-slate-200">1</td>
                      <td className="p-2 font-bold border-r border-slate-200">Ketua Panitia</td>
                      <td className="p-2 font-bold">{selectedForSK.structure.ketua.name}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center border-r border-slate-200">2</td>
                      <td className="p-2 font-bold border-r border-slate-200">Sekretaris</td>
                      <td className="p-2 font-bold">{selectedForSK.structure.sekretaris.name}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center border-r border-slate-200">3</td>
                      <td className="p-2 font-bold border-r border-slate-200">Bendahara</td>
                      <td className="p-2 font-bold">{selectedForSK.structure.bendahara.name}</td>
                    </tr>
                    {selectedForSK.structure.sections.map((sec, idx) => (
                      <tr key={idx}>
                        <td className="p-2 text-center border-r border-slate-200">{idx + 4}</td>
                        <td className="p-2 font-semibold border-r border-slate-200">{sec.name}</td>
                        <td className="p-2">
                          <span className="font-bold">{sec.coordinator || '-'}</span>
                          {sec.members && sec.members.length > 0 && (
                            <span className="text-slate-600 block text-[11px] mt-0.5">
                              Anggota: {sec.members.join(', ')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Diktum Penutup */}
              <div className="space-y-2 text-xs md:text-sm font-sans mb-8">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-2 font-bold">Kedua</div>
                  <div className="col-span-10 text-justify">
                    : Panitia bertugas merencanakan, mempersiapkan anggaran sebesar {formatRupiah(selectedForSK.targetBudget)}, mengoordinasikan serta melaksanakan kegiatan dengan penuh amanah dan tanggung jawab.
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-2 font-bold">Ketiga</div>
                  <div className="col-span-10 text-justify">
                    : Panitia wajib memberikan Laporan Pertanggungjawaban (LPJ) tertulis kepada Pengurus DKM paling lambat 14 (empat belas) hari kalender setelah kegiatan selesai.
                  </div>
                </div>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-2 font-bold">Keempat</div>
                  <div className="col-span-10 text-justify">
                    : Keputusan ini berlaku terhitung sejak tanggal ditetapkan, dan apabila terdapat kekeliruan akan diperbaiki sebagaimana mestinya.
                  </div>
                </div>
              </div>

              {/* Tanggal & Tanda Tangan */}
              <div className="grid grid-cols-2 gap-8 font-sans text-xs pt-4">
                <div className="text-center">
                  <div className="text-slate-500">Mengetahui,</div>
                  <div className="font-bold text-slate-800 mt-1">Sekretaris Umum DKM</div>
                  <div className="h-20 flex items-center justify-center text-slate-300 italic text-xs">
                    (Tanda Tangan & Stempel)
                  </div>
                  <div className="font-bold underline text-slate-900">Ahmad Fauzi, S.Kom.</div>
                  <div className="text-[11px] text-slate-600">NIAP: 2026.01.002</div>
                </div>

                <div className="text-center">
                  <div className="text-slate-500">Ditetapkan di Makassar pada {selectedForSK.skDate}</div>
                  <div className="font-bold text-slate-800 mt-1">Ketua Pengurus DKM Babul Khaer</div>
                  <div className="h-20 flex items-center justify-center text-slate-300 italic text-xs">
                    (Tanda Tangan & Stempel)
                  </div>
                  <div className="font-bold underline text-slate-900">Drs. H. Syamsuddin, M.Pd.</div>
                  <div className="text-[11px] text-slate-600">NIAP: 2026.01.001</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Kepanitiaan Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
            <div className="p-4 bg-emerald-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base">Pembentukan Panitia Ad-hoc Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-emerald-200 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewCommittee} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Kepanitiaan / Acara *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Panitia Semarak Ramadhan & Idul Fitri 1448 H"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kode Singkat
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: PAN-RMD-1448"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Anggaran (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="35000000"
                    value={newTargetBudget}
                    onChange={(e) => setNewTargetBudget(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Deskripsi / Ruang Lingkup Tugas
                </label>
                <textarea
                  rows={2}
                  placeholder="Kepanitiaan untuk penyelenggaraan ibadah Ramadhan, itikaf, buka puasa bersama..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Pengurus Inti */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Pengurus Inti</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Nama Ketua Panitia *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nama lengkap & gelar"
                      value={newKetuaName}
                      onChange={(e) => setNewKetuaName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">No. WhatsApp Ketua</label>
                    <input
                      type="text"
                      placeholder="0812-xxxx-xxxx"
                      value={newKetuaPhone}
                      onChange={(e) => setNewKetuaPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Nama Sekretaris</label>
                    <input
                      type="text"
                      placeholder="Nama sekretaris"
                      value={newSekretarisName}
                      onChange={(e) => setNewSekretarisName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">No. WhatsApp Sekretaris</label>
                    <input
                      type="text"
                      placeholder="0852-xxxx-xxxx"
                      value={newSekretarisPhone}
                      onChange={(e) => setNewSekretarisPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">Nama Bendahara</label>
                    <input
                      type="text"
                      placeholder="Nama bendahara"
                      value={newBendaharaName}
                      onChange={(e) => setNewBendaharaName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-400">No. WhatsApp Bendahara</label>
                    <input
                      type="text"
                      placeholder="0813-xxxx-xxxx"
                      value={newBendaharaPhone}
                      onChange={(e) => setNewBendaharaPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi-Seksi */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Seksi / Bidang Kerja</div>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                  >
                    + Tambah Seksi
                  </button>
                </div>

                {sections.map((sec, idx) => (
                  <div key={idx} className="p-3 border rounded-xl dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={`Nama Seksi (e.g. Seksi Konsumsi)`}
                        value={sec.name}
                        onChange={(e) => handleSectionChange(idx, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Nama Koordinator"
                        value={sec.coordinator}
                        onChange={(e) => handleSectionChange(idx, 'coordinator', e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs border rounded-md dark:bg-slate-800 dark:border-slate-700 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md transition-colors"
                >
                  Terbitkan SK Panitia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
