'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  Copy,
  Printer,
  CheckCircle2,
  Share2,
  BookOpen,
  Moon,
  Sparkles,
  Users,
} from 'lucide-react';
import {
  INITIAL_FRIDAY_SCHEDULES,
  INITIAL_RAWATIB_SCHEDULES,
  INITIAL_KAJIAN_SCHEDULES,
  INITIAL_RAMADHAN_SCHEDULES,
} from '@/lib/mock-dakwah';
import { FridayScheduleItem, FridayConfirmationStatus } from '@/types/dakwah';
import { useAuth } from '@/lib/auth-context';

export default function DakwahView() {
  const { isReadOnly } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'khatib' | 'rawatib' | 'kajian' | 'ramadhan'>('khatib');

  // State Schedules
  const [fridaySchedules, setFridaySchedules] = useState<FridayScheduleItem[]>(INITIAL_FRIDAY_SCHEDULES);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  // Handler update status konfirmasi Jumat
  const handleToggleStatus = (id: string, newStatus: FridayConfirmationStatus) => {
    if (isReadOnly) return;
    setFridaySchedules((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  // Handler salin ke clipboard untuk WhatsApp
  const handleCopyWhatsAppText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(`Jadwal ${label} berhasil disalin ke clipboard! Siap dibagikan ke grup WhatsApp Jamaah.`);
    setTimeout(() => {
      setCopiedMessage(null);
    }, 4000);
  };

  // Handler cetak pengumuman mading
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Alert Notifikasi Salin Berhasil */}
      {copiedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-soft-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{copiedMessage}</span>
        </div>
      )}

      {/* Header Banner Divisi Peribadatan & Dakwah */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-900 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-soft-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-teal-200 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Seksi Peribadatan & Dakwah — Bidang Ketua I (Drs. H. Suardi, M.Pd.)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Sistem Manajemen Peribadatan & Dakwah Masjid
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            Pengelolaan jadwal Khatib Jumat, 3 Imam Rawatib sholat fardhu (insentif Rp1.5jt/bln),
            agenda kajian pekanan swadaya jamaah (maksimal 2x/pekan), dan Semarak Ramadhan 1448 H sesuai
            Berita Acara Raker No. 006/A/DKM-BK-VIII/2026.
          </p>
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-4 text-xs text-teal-200 font-medium flex-wrap">
            <span>PJ Seksi: <strong>Drs. Manai, M.M.</strong></span>
            <span>•</span>
            <span>Sekretariat: <strong>BTP Blok AE Katimbang</strong></span>
            <span>•</span>
            <span>SK DMI: <strong>No. 13/2026</strong></span>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Imam Sholat Fardhu</span>
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">3 Imam Rawatib</p>
          <p className="text-[11px] text-teal-700 font-semibold mt-1">
            Rp 1.500.000 / imam / bulan
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Jumat Bulan Ini</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">{fridaySchedules.length} Sesi Terjadwal</p>
          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
            {fridaySchedules.filter((f) => f.status === 'TERKONFIRMASI').length} Telah Terkonfirmasi
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Kajian & Majelis</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">Maks. 2x / Pekan</p>
          <p className="text-[11px] text-blue-700 font-semibold mt-1">
            Dana Swadaya (Bebas Kas Masjid)
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-soft-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Standar Ramadhan</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Moon className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 mt-2">Rp 400rb & Rp 300rb</p>
          <p className="text-[11px] text-purple-700 font-semibold mt-1">
            Honor Ceramah & Imam Tarawih / Malam
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        <div className="flex items-center gap-2">
          {[
            { id: 'khatib', label: 'Khatib & Sholat Jumat', icon: Calendar },
            { id: 'rawatib', label: 'Imam Rawatib & Marbot', icon: Clock },
            { id: 'kajian', label: 'Agenda Kajian & Tabligh', icon: BookOpen },
            { id: 'ramadhan', label: 'Semarak Ramadhan 1448 H', icon: Moon },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as 'khatib' | 'rawatib' | 'kajian' | 'ramadhan')}
                className={`px-4 py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/40 rounded-t-xl'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Print / Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handlePrint}
            title="Cetak Jadwal Resmi A4 untuk Mading"
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Cetak Mading A4</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: KHATIB & SHOLAT JUMAT                                         */}
      {/* ========================================================================= */}
      {activeSubTab === 'khatib' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Jadwal Penugasan Khatib & Imam Sholat Jumat
              </h3>
              <p className="text-xs text-slate-500">
                Standar insentif Rp 1.500.000 / Jumat. Optimalkan imam rawatib untuk memimpin sholat.
              </p>
            </div>
            <button
              onClick={() => {
                const text = fridaySchedules
                  .map(
                    (s) =>
                      `📅 *Jumat, ${s.date} (${s.dateHijri})*\n🎙️ Khatib: ${s.khatibName}\n🕌 Imam: ${s.imamName}\n📖 Tema: "${s.khutbahTopic}"\n`
                  )
                  .join('\n');
                handleCopyWhatsAppText(
                  `*JADWAL KHATIB & IMAM JUMAT MASJID BABUL KHAER BTP BLOK AE*\n\n${text}\n_Wassalamu'alaikum Wr. Wb. — DKM Babul Khaer_`,
                  'Khatib Jumat'
                );
              }}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Salin Teks ke WhatsApp Jamaah</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fridaySchedules.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold">
                        <Calendar className="w-3.5 h-3.5 text-teal-600" />
                        <span>{item.date}</span>
                        <span>•</span>
                        <span>{item.dateHijri}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        item.status === 'TERKONFIRMASI'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    &quot;{item.khutbahTopic}&quot;
                  </h4>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-semibold w-16 text-slate-400">Khatib:</span>
                      <span className="font-bold text-slate-900">{item.khatibName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <span className="font-semibold w-16 text-slate-400">Imam:</span>
                      <span className="font-semibold text-emerald-800">{item.imamName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.phone}</span>
                      <span className="mx-1">•</span>
                      <span>Insentif: Rp {item.incentiveAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="mt-3 p-2 rounded-lg bg-slate-50 text-[11px] text-slate-500 italic">
                      Catatan: {item.notes}
                    </p>
                  )}
                </div>

                {/* Status Toggle Action */}
                {!isReadOnly && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">Ubah Status Konfirmasi:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleStatus(item.id, 'TERKONFIRMASI')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          item.status === 'TERKONFIRMASI'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        Terkonfirmasi
                      </button>
                      <button
                        onClick={() => handleToggleStatus(item.id, 'MENUNGGU')}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                          item.status === 'MENUNGGU'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                      >
                        Menunggu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: IMAM RAWATIB & MARBOT SHOLAT FARDHU                            */}
      {/* ========================================================================= */}
      {activeSubTab === 'rawatib' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm">
            <h3 className="text-base font-bold text-slate-900">
              Struktur & Jadwal Imam Rawatib Sholat 5 Waktu
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Hasil Sidang Pleno Raker 2026: Mengikuti standar insentif baru Rp 1.500.000 / imam / bulan
              (usulan Ketua Umum Pak Hasri). Muadzin ditiadakan anggarannya, diganti penugasan Marbot yang bisa adzan tepat waktu (usulan Pak Suardi).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_RAWATIB_SCHEDULES.map((imam) => (
              <div
                key={imam.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        imam.role === 'IMAM_RAWATIB'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {imam.roleLabel}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {imam.status}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900">{imam.name}</h4>
                  <p className="text-xs font-semibold text-emerald-800 mt-1">
                    Insentif: Rp {imam.monthlyIncentive.toLocaleString('id-ID')} / bulan
                  </p>

                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                      Waktu Sholat yang Diimami:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {imam.assignedPrayers.map((prayer, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200/70 text-xs font-bold"
                        >
                          {prayer}
                        </span>
                      ))}
                    </div>
                  </div>

                  {imam.notes && (
                    <p className="mt-3 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-600 leading-relaxed">
                      {imam.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{imam.phone}</span>
                  </div>
                  <span className="font-semibold text-emerald-700">Kemenag Rekomendasi</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: AGENDA KAJIAN & TABLIGH                                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'kajian' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Agenda Kajian & Pembinaan Keagamaan Jamaah
              </h3>
              <p className="text-xs text-slate-500">
                Kebijakan Raker: Kajian pekanan maksimal 2x sepekan, pendanaan dicarikan sendiri (SWADAYA, tidak memakai kas operasional masjid).
              </p>
            </div>
            <button
              onClick={() => {
                const text = INITIAL_KAJIAN_SCHEDULES.map(
                  (k) =>
                    `📚 *${k.title}*\n🎙️ Pemateri: ${k.speakerName}\n📖 Tema: "${k.bookOrTopic}"\n⏰ Waktu: ${k.dayTime}\n📍 Tempat: ${k.location}\n`
                ).join('\n');
                handleCopyWhatsAppText(
                  `*AGENDA KAJIAN & PEMBINAAN MASJID BABUL KHAER BTP BLOK AE*\n\n${text}\n_Mari raih keberkahan ilmu di rumah Allah!_`,
                  'Kajian Pekanan'
                );
              }}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin Jadwal Kajian ke WhatsApp</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {INITIAL_KAJIAN_SCHEDULES.map((kjn) => (
              <div
                key={kjn.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-soft-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {kjn.type}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {kjn.fundingSource === 'SWADAYA_JAMAAH' ? 'Dana Swadaya Jamaah' : 'Kas Masjid'}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900">{kjn.title}</h4>
                  <p className="text-xs font-bold text-emerald-800 mt-1">
                    Pemateri: {kjn.speakerName} {kjn.speakerTitle && `(${kjn.speakerTitle})`}
                  </p>

                  <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span><strong>Kitab / Materi:</strong> {kjn.bookOrTopic}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span><strong>Waktu:</strong> {kjn.dayTime}</span>
                    </div>
                  </div>

                  {kjn.notes && (
                    <p className="mt-3 p-2.5 rounded-xl bg-slate-50 text-[11px] text-slate-500">
                      Ketentuan: {kjn.notes}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Kontak: {kjn.contactPerson}</span>
                  <button
                    onClick={() => {
                      const msg = `📚 *${kjn.title}*\n🎙️ ${kjn.speakerName}\n📖 "${kjn.bookOrTopic}"\n⏰ ${kjn.dayTime}\n📍 ${kjn.location}\n\n_Mari hadir memakmurkan majelis ilmu Masjid Babul Khaer!_`;
                      navigator.clipboard.writeText(msg);
                      setCopiedMessage(`Undangan kajian "${kjn.title}" disalin!`);
                      setTimeout(() => setCopiedMessage(null), 3000);
                    }}
                    className="text-teal-700 hover:text-teal-900 font-bold text-xs hover:underline cursor-pointer"
                  >
                    Salin Undangan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 4: SEMARAK RAMADHAN 1448 H                                        */}
      {/* ========================================================================= */}
      {activeSubTab === 'ramadhan' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                <Moon className="w-4 h-4" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Perencanaan Semarak Ramadhan 1448 H
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standar honor resmi hasil revisi sidang pleno Raker 2026:
              <br />• <strong>Honor Penceramah Ramadhan:</strong> Rp 400.000 / malam (revisi dari sebelumnya Rp 500.000/tahun).
              <br />• <strong>Honor Imam Tarawih:</strong> Rp 300.000 / malam (revisi dari sebelumnya Rp 700.000/minggu).
              <br />• <strong>Buka Puasa Ramadhan:</strong> Rp 0 (Murni partisipasi konsumsi dari jamaah warga RT 01 s/d RT 05).
              <br />• <strong>I&apos;tikaf 10 Akhir Ramadhan:</strong> Masih terbuka / belum diputuskan final oleh Pengurus DKM.
            </p>
          </div>

          <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200 shadow-soft-sm">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
                <tr>
                  <th className="px-5 py-3">Malam & Tanggal</th>
                  <th className="px-4 py-3">Penceramah Tarawih / Kultum</th>
                  <th className="px-4 py-3">Imam Sholat Tarawih</th>
                  <th className="px-4 py-3">Tuan Rumah Buka Puasa</th>
                  <th className="px-4 py-3 text-center">Status I&apos;tikaf</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {INITIAL_RAMADHAN_SCHEDULES.map((rmd) => (
                  <tr key={rmd.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 block text-xs">
                        Malam Ke-{rmd.nightNumber}
                      </span>
                      <span className="text-[10px] text-purple-700 font-semibold">{rmd.date}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{rmd.penceramahTarawih}</div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                        &quot;{rmd.topicKultum}&quot;
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                        Honor: Rp {rmd.honorPenceramah.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{rmd.imamTarawih}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                        Honor: Rp {rmd.honorImamTarawih.toLocaleString('id-ID')}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-800">{rmd.bukberHost}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Estimasi: {rmd.bukberPax} Porsi Takjil & Makanan
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          rmd.itikafStatus === 'TERJADWAL'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {rmd.itikafStatus === 'TERJADWAL' ? 'I\'tikaf 10 Akhir' : 'Tarawih Reguler'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
