'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface MaintenanceTask {
  id: string;
  assetName: string;
  category: string;
  cycleLabel: string;
  cycleMonths: number;
  lastDate: string;
  nextDate: string;
  status: 'JATUH_TEMPO' | 'MENDATANG' | 'SELESAI';
  officer: string;
  notes: string;
}

const INITIAL_MAINTENANCE_TASKS: MaintenanceTask[] = [
  {
    id: 'mnt-001',
    assetName: 'AC Daikin Standing 5 PK (Saf Utama)',
    category: 'Pendingin Udara (AC)',
    cycleLabel: 'Per 3 Bulan',
    cycleMonths: 3,
    lastDate: '2026-08-10',
    nextDate: '2026-11-10',
    status: 'MENDATANG',
    officer: 'Marbot Firman & Teknisi Daikin',
    notes: 'Pembersihan filter udara, pencucian evaporator & pengecekan tekanan freon R32.',
  },
  {
    id: 'mnt-002',
    assetName: 'Unit Genset Diesel 15 KVA & Modul ATS',
    category: 'Genset & Kelistrikan',
    cycleLabel: 'Per 4 Bulan',
    cycleMonths: 4,
    lastDate: '2026-08-28',
    nextDate: '2026-12-28',
    status: 'MENDATANG',
    officer: 'Marbot Firman & Teknisi Genset',
    notes: 'Penggantian oli mesin diesel, pengecekan air aki starter & simulasi otomatis ATS.',
  },
  {
    id: 'mnt-003',
    assetName: 'Sound System, Mixer Yamaha & Mic Nirkabel',
    category: 'Audio & Elektronik',
    cycleLabel: 'Per 6 Bulan',
    cycleMonths: 6,
    lastDate: '2026-03-15',
    nextDate: '2026-09-15',
    status: 'JATUH_TEMPO',
    officer: 'Faisal T. Parussengi & Operator Audio',
    notes: 'Kalibrasi equalizer mimbar, pembersihan jack audio, penggantian baterai mic nirkabel.',
  },
  {
    id: 'mnt-004',
    assetName: 'Karpet Turki Ruang Sholat Utama (Saf 1 - 10)',
    category: 'Sarana Ibadah',
    cycleLabel: 'Per 6 Bulan',
    cycleMonths: 6,
    lastDate: '2026-04-01',
    nextDate: '2026-10-01',
    status: 'MENDATANG',
    officer: 'Tim Gotong Royong Warga RT 01-05',
    notes: 'Pencucian karpet menggunakan mesin vakum hydro-cleaner menjelang Maulid Nabi.',
  },
  {
    id: 'mnt-005',
    assetName: 'Pompa Air Sumur Bor & Filter Air Wudhu',
    category: 'Fasilitas Wudhu & Sanitasi',
    cycleLabel: 'Per 3 Bulan',
    cycleMonths: 3,
    lastDate: '2026-06-20',
    nextDate: '2026-09-20',
    status: 'JATUH_TEMPO',
    officer: 'Marbot Firman',
    notes: 'Pengurasan bak tandon utama 5000 liter dan penggantian cartridge filter sedimen.',
  },
];

export default function SarprasMaintenanceView() {
  const { isReadOnly, canMutateTab, logAction } = useAuth();
  const canMutate = !isReadOnly && canMutateTab('assets');
  const [tasks, setTasks] = useState<MaintenanceTask[]>(INITIAL_MAINTENANCE_TASKS);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const handleMarkServiced = async (taskId: string) => {
    if (!canMutate) return;
    const now = new Date().toISOString().split('T')[0];

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        // Hitung next date
        const next = new Date();
        next.setMonth(next.getMonth() + t.cycleMonths);
        const nextStr = next.toISOString().split('T')[0];

        return {
          ...t,
          lastDate: now,
          nextDate: nextStr,
          status: 'SELESAI',
        };
      })
    );

    setSuccessToast('Pemeliharaan berhasil dicatat! Tanggal servis berikutnya otomatis dihitung.');
    setTimeout(() => setSuccessToast(null), 4000);

    await logAction(
      'SERVICE_ASSET',
      'Pencatatan Servis Sarpras Selesai',
      'SARPRAS',
      `Servis selesai dicatat untuk aset ${taskId} oleh Sarpras/Marbot.`
    );
  };

  const dueCount = tasks.filter((t) => t.status === 'JATUH_TEMPO').length;

  return (
    <div className="space-y-4">
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 shadow-soft-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Alert Peringatan Servis Jatuh Tempo */}
      {dueCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 shadow-soft-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-900">
              Ada {dueCount} Fasilitas Sarpras yang Telah Jatuh Tempo Pemeliharaan
            </h4>
            <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
              Sesuai instruksi Raker 2026: Sound system dan pompa air wudhu memerlukan tindakan pengecekan oleh Marbot & Teknisi pekan ini.
            </p>
          </div>
        </div>
      )}

      {/* Tabel Tugas Pemeliharaan */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Jadwal Servis Berkala Sarana & Prasarana
            </h3>
            <p className="text-[11px] text-slate-500">
              Standar siklus pemeliharaan rutin untuk menjaga keawetan aset DKM Masjid Babul Khaer.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 border border-teal-200">
            {tasks.length} Fasilitas Dipantau
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Nama Aset / Fasilitas</th>
                <th className="px-4 py-3">Siklus Pemeliharaan</th>
                <th className="px-4 py-3">Servis Terakhir</th>
                <th className="px-4 py-3">Jadwal Berikutnya</th>
                <th className="px-4 py-3">Petugas Pelaksana</th>
                <th className="px-4 py-3 text-center">Status</th>
                {canMutate && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{task.assetName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{task.category}</div>
                    <div className="text-[11px] text-slate-600 mt-1 italic">{task.notes}</div>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">
                    {task.cycleLabel}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                    {task.lastDate}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] font-bold text-slate-900">
                    {task.nextDate}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 font-medium">
                    {task.officer}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        task.status === 'JATUH_TEMPO'
                          ? 'bg-rose-50 text-rose-800 border-rose-200 animate-pulse'
                          : task.status === 'SELESAI'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  {canMutate && (
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleMarkServiced(task.id)}
                        className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        Catat Selesai
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
