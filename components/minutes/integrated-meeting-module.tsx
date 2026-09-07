'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Printer,
  CheckCircle2,
  UserCheck,
  FileCheck,
  Send,
  X,
} from 'lucide-react';
import { IntegratedMeeting, MeetingInvitee, AttendanceStatus } from '@/types/meeting';
import { INITIAL_INTEGRATED_MEETINGS } from '@/lib/mock-meetings';
import { OFFICIAL_USERS } from '@/lib/mock-auth';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';

export default function IntegratedMeetingModule() {
  const { currentUser, isReadOnly } = useAuth();
  const { toast } = useToast();

  const [meetings, setMeetings] = useState<IntegratedMeeting[]>(INITIAL_INTEGRATED_MEETINGS);
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(meetings[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'undangan' | 'presensi' | 'notulen' | 'cetak_paket'>('presensi');

  // Form create meeting modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<IntegratedMeeting['meetingType']>('PLENO');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('20:00');
  const [newEndTime, setNewEndTime] = useState('22:00');
  const [newLocation, setNewLocation] = useState('Serambi Utama Masjid Babul Khaer');
  const [newAgendas, setNewAgendas] = useState<string>('Evaluasi Program Kerja Bulanan\nLaporan Kas Keuangan\nLain-lain');

  const activeMeeting = useMemo(() => {
    return meetings.find((m) => m.id === selectedMeetingId) || meetings[0];
  }, [meetings, selectedMeetingId]);

  // Attendance stats
  const attendanceStats = useMemo(() => {
    if (!activeMeeting) return { hadir: 0, izin: 0, alpa: 0, total: 0 };
    const hadir = activeMeeting.invitees.filter((i) => i.status === 'HADIR').length;
    const izin = activeMeeting.invitees.filter((i) => i.status === 'IZIN').length;
    const alpa = activeMeeting.invitees.filter((i) => i.status === 'ALPA').length;
    const total = activeMeeting.invitees.length;
    return { hadir, izin, alpa, total };
  }, [activeMeeting]);

  // List of attendee names automatically derived from invitees with HADIR status
  const confirmedAttendeesStr = useMemo(() => {
    if (!activeMeeting) return '';
    const names = activeMeeting.invitees
      .filter((i) => i.status === 'HADIR')
      .map((i) => `${i.name} (${i.role})`);
    return names.join(', ');
  }, [activeMeeting]);

  const canEdit = currentUser.role === 'SEKRETARIS' || currentUser.role === 'KETUA_UMUM' || (!isReadOnly && currentUser.role === 'SUPER_ADMIN');

  // Toggle attendance status
  const handleToggleAttendance = (inviteeId: string, nextStatus: AttendanceStatus) => {
    if (!canEdit || !activeMeeting) return;

    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === activeMeeting.id) {
          const updatedInvitees = m.invitees.map((inv) =>
            inv.id === inviteeId ? { ...inv, status: nextStatus } : inv
          );
          return { ...m, invitees: updatedInvitees };
        }
        return m;
      })
    );
    toast.success('Status presensi kehadiran diperbarui');
  };

  // Update minutes summary
  const handleUpdateMinutes = (summary: string) => {
    if (!canEdit || !activeMeeting) return;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === activeMeeting.id) {
          return {
            ...m,
            minutes: {
              ...m.minutes,
              summary,
              recordedBy: `${currentUser.name} (${currentUser.roleLabel})`,
            },
          };
        }
        return m;
      })
    );
  };

  // Add new decision
  const [newDecisionText, setNewDecisionText] = useState('');
  const handleAddDecision = () => {
    if (!newDecisionText.trim() || !activeMeeting || !canEdit) return;
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === activeMeeting.id) {
          return {
            ...m,
            minutes: {
              ...m.minutes,
              decisions: [...m.minutes.decisions, newDecisionText.trim()],
            },
          };
        }
        return m;
      })
    );
    setNewDecisionText('');
    toast.success('Keputusan rapat baru ditambahkan!');
  };

  // Create new meeting
  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    // Automatically seed invitees from official users
    const defaultInvitees: MeetingInvitee[] = OFFICIAL_USERS.map((u) => ({
      id: `inv-${Date.now()}-${u.id}`,
      userId: u.id,
      name: u.name,
      role: u.title,
      phone: u.phone,
      status: 'UNDANGAN',
    }));

    const parsedAgendas = newAgendas
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean);

    const newMtg: IntegratedMeeting = {
      id: `mtg-${Date.now()}`,
      title: newTitle.trim(),
      meetingType: newType,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      location: newLocation.trim(),
      agenda: parsedAgendas,
      invitees: defaultInvitees,
      minutes: {
        summary: '',
        decisions: [],
        actionItems: [],
        recordedBy: `${currentUser.name} (${currentUser.roleLabel})`,
      },
      status: 'TERJADWAL',
      createdAt: new Date().toISOString(),
    };

    setMeetings((prev) => [newMtg, ...prev]);
    setSelectedMeetingId(newMtg.id);
    setIsCreateModalOpen(false);
    setNewTitle('');
    toast.success(`Jadwal Rapat "${newMtg.title}" dan undangan resmi berhasil dibuat!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-soft-sm relative overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <FileCheck className="w-3.5 h-3.5" />
                Modul Kesekretariatan Terpadu
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Satu Siklus: Undangan • Presensi • Notulensi
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sistem Rapat Terpadu Pengurus DKM Babul Khaer
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Mengikat dokumen undangan rapat, daftar hadir interaktif digital, dan notulensi resmi dalam satu arsip terpadu yang siap cetak.
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-bold shadow-soft-sm transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Jadwalkan Rapat Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Meeting Selection Tab Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {meetings.map((m) => {
          const isSelected = m.id === selectedMeetingId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMeetingId(m.id)}
              className={`px-4 py-3 rounded-2xl border text-left shrink-0 max-w-xs transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-700 shadow-soft-sm ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {m.meetingType}
                </span>
                <span className="text-[10px] text-slate-400">{m.date}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {m.title}
              </h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {m.location}
              </p>
            </button>
          );
        })}
      </div>

      {activeMeeting && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-soft-sm overflow-hidden transition-colors">
          {/* Sub-Tabs Selector */}
          <div className="border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3 overflow-x-auto bg-slate-50/50 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              {[
                { key: 'undangan', label: '1. Undangan Resmi', icon: Send },
                { key: 'presensi', label: `2. Daftar Hadir (${attendanceStats.hadir}/${attendanceStats.total})`, icon: UserCheck },
                { key: 'notulen', label: '3. Notulensi Rapat', icon: FileText },
                { key: 'cetak_paket', label: '4. Paket Arsip Lengkap', icon: Printer },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeSubTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveSubTab(tab.key as typeof activeSubTab)}
                    className={`flex items-center gap-2 py-4 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                        : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Halaman Ini</span>
            </button>
          </div>

          {/* Sub-Tab 1: Undangan Resmi */}
          {activeSubTab === 'undangan' && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Formal Letterhead */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/40 dark:bg-slate-800/20 max-w-3xl mx-auto space-y-4">
                <div className="text-center border-b-2 border-slate-800 dark:border-slate-200 pb-4">
                  <h3 className="font-extrabold text-base uppercase tracking-wider text-slate-900 dark:text-white">
                    DEWAN KEMAKMURAN MASJID BABUL KHAER
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Kompleks BTP Blok AE, Kel. Tamalanrea, Kec. Tamalanrea, Kota Makassar 90245
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Surat Undangan Dinas Internal No. 012/UND/DKM-BK/{activeMeeting.date.slice(5, 7)}/2026
                  </p>
                </div>

                <div className="text-xs space-y-3 text-slate-800 dark:text-slate-200 leading-relaxed">
                  <p>
                    Kepada Yth. <strong>Bapak/Ibu Pengurus DKM Babul Khaer</strong> di Tempat.
                  </p>
                  <p className="italic">Assalamu&apos;alaikum Warahmatullahi Wabarakatuh,</p>
                  <p>
                    Sehubungan dengan agenda kerja DKM, kami mengharapkan kehadiran Bapak/Ibu pada rapat resmi dengan rincian kegiatan sebagai berikut:
                  </p>

                  <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex gap-2">
                      <span className="w-28 font-bold text-slate-500 dark:text-slate-400">Agenda:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{activeMeeting.title}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-28 font-bold text-slate-500 dark:text-slate-400">Hari / Tanggal:</span>
                      <span>{activeMeeting.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-28 font-bold text-slate-500 dark:text-slate-400">Waktu:</span>
                      <span>{activeMeeting.startTime} – {activeMeeting.endTime} WITA</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-28 font-bold text-slate-500 dark:text-slate-400">Tempat:</span>
                      <span>{activeMeeting.location}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-white mb-1">Rincian Pokok Bahasan:</h5>
                    <ol className="list-decimal pl-5 space-y-1">
                      {activeMeeting.agenda.map((ag, idx) => (
                        <li key={idx}>{ag}</li>
                      ))}
                    </ol>
                  </div>

                  <p>
                    Mengingat pentingnya musyawarah ini demi kemaslahatan jamaah, dimohon kehadirannya tepat waktu.
                  </p>
                  <p className="italic">Wassalamu&apos;alaikum Warahmatullahi Wabarakatuh.</p>
                </div>

                {/* Signatories */}
                <div className="pt-6 flex justify-between text-center text-xs">
                  <div className="space-y-12">
                    <p>Mengetahui,<br /><strong>Ketua Umum DKM</strong></p>
                    <p className="font-bold underline">H. Arifin, S.E.</p>
                  </div>
                  <div className="space-y-12">
                    <p>Makassar, {activeMeeting.date}<br /><strong>Sekretaris Umum</strong></p>
                    <p className="font-bold underline">Ahmad Fauzi, S.Kom.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 2: Presensi / Daftar Hadir Digital */}
          {activeSubTab === 'presensi' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50/60 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Presensi Kehadiran Rapat Terpadu
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Total Hadir: <span className="font-bold text-emerald-700 dark:text-emerald-400">{attendanceStats.hadir}</span> • Izin: {attendanceStats.izin} • Belum Hadir: {attendanceStats.total - attendanceStats.hadir - attendanceStats.izin}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-2xs"
                  >
                    Cetak Blangko Tanda Tangan Fisik
                  </button>
                </div>
              </div>

              {/* Table of Invitees with Checkable Status */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="px-4 py-3 w-10 text-center">No</th>
                      <th className="px-4 py-3">Nama Pengurus / Tokoh</th>
                      <th className="px-4 py-3">Jabatan / Amanah</th>
                      <th className="px-4 py-3 text-center">Status Kehadiran</th>
                      <th className="px-4 py-3">Keterangan</th>
                      {canEdit && <th className="px-4 py-3 text-center">Centang Presensi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeMeeting.invitees.map((inv, idx) => {
                      return (
                        <tr
                          key={inv.id}
                          className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                            inv.status === 'HADIR'
                              ? 'bg-emerald-50/20 dark:bg-emerald-950/10'
                              : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                            {inv.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                            {inv.role}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                                inv.status === 'HADIR'
                                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                                  : inv.status === 'IZIN'
                                  ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 italic">
                            {inv.notes || '-'}
                          </td>
                          {canEdit && (
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleAttendance(inv.id, 'HADIR')}
                                  title="Tandai Hadir"
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                    inv.status === 'HADIR'
                                      ? 'bg-emerald-700 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-100'
                                  }`}
                                >
                                  Hadir
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleAttendance(inv.id, 'IZIN')}
                                  title="Tandai Izin"
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                    inv.status === 'IZIN'
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-100'
                                  }`}
                                >
                                  Izin
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleAttendance(inv.id, 'ALPA')}
                                  title="Tandai Tidak Hadir"
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                                    inv.status === 'ALPA'
                                      ? 'bg-rose-600 text-white'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-100'
                                  }`}
                                >
                                  Alpa
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-Tab 3: Notulensi Rapat Otomatis */}
          {activeSubTab === 'notulen' && (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Field Peserta Hadir Otomatis */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Peserta Rapat Hadir (Otomatis Terisi dari Daftar Hadir Presensi)
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {attendanceStats.hadir} Hadir
                  </span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                  {confirmedAttendeesStr || 'Belum ada peserta yang dicentang hadir pada daftar presensi.'}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  * Nama peserta hadir tidak diisi teks bebas manual, melainkan bersumber langsung dari hasil centang di Tab 2 (Presensi).
                </p>
              </div>

              {/* Ringkasan Risalah Rapat */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Ringkasan Pembahasan & Jalannya Rapat
                </label>
                <textarea
                  rows={4}
                  value={activeMeeting.minutes.summary}
                  onChange={(e) => handleUpdateMinutes(e.target.value)}
                  disabled={!canEdit}
                  placeholder="Catat rangkuman pembicaraan, masukan ketua, atau isu prioritas yang dibahas..."
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-2xl p-3.5 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Keputusan Rapat */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  Keputusan Musyawarah Rapat (Final)
                </h5>
                <div className="space-y-2">
                  {activeMeeting.minutes.decisions.map((dec, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex items-start gap-2.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-slate-800 dark:text-slate-200 flex-1">{dec}</span>
                    </div>
                  ))}
                </div>

                {canEdit && (
                  <div className="flex items-center gap-2 mt-3">
                    <input
                      type="text"
                      value={newDecisionText}
                      onChange={(e) => setNewDecisionText(e.target.value)}
                      placeholder="Ketik poin keputusan baru hasil rapat..."
                      className="flex-1 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                    />
                    <button
                      type="button"
                      onClick={handleAddDecision}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Tambah Keputusan
                    </button>
                  </div>
                )}
              </div>

              {/* Action Items (Tindak Lanjut PIC) */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  Daftar Tugas Tindak Lanjut (Action Items)
                </h5>
                <div className="space-y-2">
                  {activeMeeting.minutes.actionItems.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">{act.task}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          PIC: {act.pic} • Tenggat: {act.deadline}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {act.priority}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 4: Paket Arsip Lengkap (All-in-One Printable Bundle) */}
          {activeSubTab === 'cetak_paket' && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl">
                <div>
                  <h4 className="text-sm font-bold text-purple-900 dark:text-purple-200">
                    Paket Berkas Rapat Terpadu Siap Ekspor
                  </h4>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    Menggabungkan 3 lembar (Undangan Resmi, Daftar Hadir Berita Acara, & Notulensi) menjadi 1 arsip resmi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-soft-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Paket Arsip</span>
                </button>
              </div>

              {/* Printable Unified Preview */}
              <div className="border border-slate-300 dark:border-slate-700 rounded-2xl p-6 bg-white dark:bg-slate-900 space-y-6 max-w-3xl mx-auto shadow-soft-sm">
                <div className="text-center border-b pb-3">
                  <h3 className="font-extrabold text-sm uppercase text-slate-900 dark:text-white">
                    BERKAS ARSIP RAPAT DINAS DKM BABUL KHAER
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeMeeting.title} • {activeMeeting.date}
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 border-b pb-1 mb-2">
                      I. BERITA ACARA KEHADIRAN (DAFTAR HADIR)
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Tercatat <strong>{attendanceStats.hadir}</strong> dari {attendanceStats.total} pengurus terdaftar hadir secara fisik dalam musyawarah ini.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {activeMeeting.invitees.map((inv) => (
                        <div key={inv.id} className="p-2 border rounded text-[11px] flex justify-between">
                          <span>{inv.name} ({inv.role})</span>
                          <span className="font-bold">{inv.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-200 border-b pb-1 mb-2">
                      II. NOTULENSI & KEPUTUSAN KESEPAKATAN
                    </h5>
                    <p className="text-[11px] leading-relaxed mb-2">
                      {activeMeeting.minutes.summary || 'Belum ada ringkasan notulen yang dicatat.'}
                    </p>
                    <ol className="list-decimal pl-5 space-y-1 text-[11px]">
                      {activeMeeting.minutes.decisions.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="pt-6 border-t flex justify-between text-center text-xs">
                  <div>
                    <p>Mengetahui,<br />Ketua Umum DKM</p>
                    <p className="mt-12 font-bold underline">H. Arifin, S.E.</p>
                  </div>
                  <div>
                    <p>Notulis / Pencatat,<br />Sekretaris Umum</p>
                    <p className="mt-12 font-bold underline">Ahmad Fauzi, S.Kom.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Buat Rapat Baru */}
      {isCreateModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-create-mtg-title"
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/50">
              <h3 id="modal-create-mtg-title" className="text-base font-bold text-slate-900 dark:text-white">
                Jadwalkan Rapat Terpadu Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Tutup"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama / Tajuk Rapat <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Rapat Pleno Persiapan PHBI Maulid 1448 H"
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jenis Pertemuan
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as IntegratedMeeting['meetingType'])}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="PLENO">Rapat Pleno</option>
                    <option value="RAKER">Rapat Kerja (Raker)</option>
                    <option value="KOORDINASI_SEKSI">Koordinasi Seksi</option>
                    <option value="EVALUASI">Evaluasi</option>
                    <option value="DARURAT">Rapat Darurat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tanggal Rapat
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lokasi Pertemuan
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Agenda Pokok Bahasan (Pisahkan dengan baris baru)
                </label>
                <textarea
                  rows={3}
                  value={newAgendas}
                  onChange={(e) => setNewAgendas(e.target.value)}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-soft-sm cursor-pointer"
                >
                  Terbitkan Undangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
