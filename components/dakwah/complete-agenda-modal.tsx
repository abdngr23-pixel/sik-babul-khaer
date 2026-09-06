'use client';

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Users,
  Coins,
  FileText,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface CompleteAgendaModalProps {
  isOpen: boolean;
  agendaType: 'FRIDAY' | 'KAJIAN' | 'RAMADHAN';
  agendaTitle: string;
  agendaSpeaker: string;
  agendaDate: string;
  defaultHonor?: number;
  defaultAttendance?: number;
  onClose: () => void;
  onSave: (data: {
    attendanceCount: number;
    actualHonorDisbursed: number;
    summaryNotes: string;
  }) => void;
}

export default function CompleteAgendaModal({
  isOpen,
  agendaType,
  agendaTitle,
  agendaSpeaker,
  agendaDate,
  defaultHonor = 0,
  defaultAttendance = 100,
  onClose,
  onSave,
}: CompleteAgendaModalProps) {
  const [attendanceCount, setAttendanceCount] = useState<number>(defaultAttendance);
  const [actualHonorDisbursed, setActualHonorDisbursed] = useState<number>(defaultHonor);
  const [summaryNotes, setSummaryNotes] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      attendanceCount: Number(attendanceCount) || 0,
      actualHonorDisbursed: Number(actualHonorDisbursed) || 0,
      summaryNotes: summaryNotes.trim(),
    });
    onClose();
  };

  const getPresetAttendance = () => {
    if (agendaType === 'FRIDAY') return [150, 200, 250, 300, 350];
    if (agendaType === 'RAMADHAN') return [80, 120, 150, 200, 250];
    return [30, 50, 75, 100, 150];
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:justify-center md:items-center bg-slate-900/70 backdrop-blur-xs p-0 md:p-4 overflow-hidden animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl md:rounded-2xl shadow-soft-xl border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] animate-slide-up md:animate-none">
        {/* Mobile Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header Modal */}
        <div className="px-4 md:px-6 py-4 md:py-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-bold tracking-tight truncate">Tandai Agenda Telah Selesai</h3>
              <p className="text-xs text-emerald-100/80 truncate">
                Dokumentasikan realisasi kehadiran & intisari materi.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 md:p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ringkasan Agenda Yang Dikerjakan */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200/80 shrink-0">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-1">
            <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{agendaDate}</span>
            <span>•</span>
            <span className="text-teal-700 font-extrabold uppercase tracking-wide">
              {agendaType === 'FRIDAY' ? 'Sholat Jumat' : agendaType === 'RAMADHAN' ? 'Semarak Ramadhan' : 'Kajian Jamaah'}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
            {agendaTitle}
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Penceramah / Khatib: <strong className="text-slate-900">{agendaSpeaker}</strong>
          </p>
        </div>

        {/* Form Isi */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto overscroll-contain space-y-4 flex-1">
          {/* Estimasi Kehadiran Jamaah */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-700" />
                <span>Estimasi Jumlah Jamaah yang Hadir</span>
              </span>
              <span className="text-teal-800 font-extrabold text-xs">
                {attendanceCount} Orang Jamaah
              </span>
            </label>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="number"
                min="0"
                required
                value={attendanceCount}
                onChange={(e) => setAttendanceCount(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all"
              />
            </div>

            {/* Quick preset pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-slate-400 font-semibold mr-1">Preset Cepat:</span>
              {getPresetAttendance().map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAttendanceCount(preset)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-colors ${
                    attendanceCount === preset
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset} org
                </button>
              ))}
            </div>
          </div>

          {/* Realisasi Honorarium / Insentif */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-teal-700" />
              <span>Realisasi Insentif / Honorarium Disalurkan (Rp)</span>
            </label>
            <input
              type="number"
              min="0"
              step="50000"
              required
              value={actualHonorDisbursed}
              onChange={(e) => setActualHonorDisbursed(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Terbilang: <strong>Rp {actualHonorDisbursed.toLocaleString('id-ID')}</strong> (Tercatat dalam realisasi pengeluaran Seksi Peribadatan).
            </p>
          </div>

          {/* Intisari Materi & Catatan Evaluasi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>Intisari Materi / Catatan Pelaksanaan</span>
            </label>
            <textarea
              rows={3}
              required
              placeholder="Contoh: Khutbah/Kajian berjalan khidmat. Sound system terdengar jelas hingga shaf belakang. Jamaah antusias menyimak pembahasan."
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 outline-hidden transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse md:flex-row items-center justify-end gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto px-4 py-2.5 min-h-[44px] rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors cursor-pointer text-center flex items-center justify-center"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full md:w-auto px-5 py-2.5 min-h-[44px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-soft-sm flex items-center justify-center gap-2 transition-all cursor-pointer text-center"
            >
              <Sparkles className="w-4 h-4" />
              <span>Simpan Laporan & Selesaikan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
