'use client';

import React, { useState } from 'react';
import { MeetingMinutes, ActionItem } from '@/types/letter';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  MapPin,
  ListTodo,
  FileCheck2,
  Loader2,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';

interface MinutesExtractorProps {
  initialMinutes?: MeetingMinutes[];
}

const SAMPLE_NOTES = `Notulensi Rapat Pengurus DKM Babul Khaer
Tanggal: 4 September 2026
Tempat: Ruang Tamu Masjid Babul Khaer
Hadir: Ketua DKM (H. Arifin), Sekretaris (Ahmad Fauzi), Bendahara (H. Ridwan), Seksi Dakwah (Ust. Haris), Seksi Sarpras (Pak Bambang), Ketua IRMA.

Agenda & Pembahasan:
1. Persiapan Peringatan Maulid Nabi Muhammad SAW 1448 H.
2. Servis berkala perangkat penyejuk udara (AC) dan pengecekan mik nirkabel.
3. Penataan jadwal penceramah kultum subuh selama bulan Rabiul Awal.

Hasil Kesepakatan / Keputusan:
- Acara Maulid Nabi disepakati hari Ahad, 20 September 2026 ba'da Isya.
- Pembentukan panitia pelaksana satu pintu swadaya warga RT 01-05.
- Servis 6 unit AC duduk di ruang utama masjid diselesaikan pekan ini.
- Donasi jamaah untuk PHBI dibuka melalui rekening resmi DKM.

Daftar Tugas & Tindak Lanjut:
- PIC: Sekretaris Umum - Buatkan surat undangan pembentukan panitia ke RT 01-05 paling lambat 6 September 2026.
- PIC: Seksi Sarpras - Panggil teknisi AC dan periksa filter mik nirkabel paling lambat 8 September 2026.
- PIC: Seksi Dakwah - Konfirmasi kesediaan Ustadz penceramah utama Maulid paling lambat 10 September 2026.
- PIC: Bendahara - Buka pos pencatatan dana swadaya jamaah PHBI mulai 5 September 2026.`;

export default function MinutesExtractor({ initialMinutes = [] }: MinutesExtractorProps) {
  const [rawNotes, setRawNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [minutesList, setMinutesList] = useState<MeetingMinutes[]>(initialMinutes);
  const [activeResult, setActiveResult] = useState<MeetingMinutes | null>(
    initialMinutes.length > 0 ? initialMinutes[0] : null
  );
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const handleLoadSample = () => {
    setRawNotes(SAMPLE_NOTES);
    setStatusMessage({
      text: 'Contoh notulensi rapat DKM Babul Khaer berhasil dimuat.',
      type: 'info',
    });
  };

  const handleExtract = async () => {
    if (!rawNotes.trim()) {
      setStatusMessage({
        text: 'Silakan ketik atau tempel catatan rapat mentah terlebih dahulu.',
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/ai/extract-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawNotes, saveToStore: true }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        const newMinute: MeetingMinutes = data.savedMinute || {
          id: `min-${Date.now()}`,
          title: data.data.title,
          date: data.data.date,
          location: data.data.location,
          attendees: data.data.attendees,
          summary: data.data.summary,
          decisions: data.data.decisions,
          actionItems: data.data.actionItems.map((a: ActionItem, idx: number) => ({
            ...a,
            id: `act-${Date.now()}-${idx}`,
            status: 'PENDING' as const,
          })),
          createdAt: new Date().toISOString(),
        };

        setActiveResult(newMinute);
        setMinutesList((prev) => [newMinute, ...prev]);
        setStatusMessage({
          text: data.isAiGenerated
            ? 'Notulensi berhasil diekstrak menjadi Action Items dengan Gemini AI!'
            : 'Notulensi berhasil diekstrak ke dalam daftar tugas terstruktur!',
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: data.error || 'Gagal memproses notulensi.',
          type: 'error',
        });
      }
    } catch {
      setStatusMessage({
        text: 'Terjadi gangguan jaringan saat memproses notulensi.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = async (minuteId: string, taskId: string) => {
    // Optimistic local update
    if (activeResult && activeResult.id === minuteId) {
      const updatedItems = activeResult.actionItems.map((item) =>
        item.id === taskId
          ? { ...item, status: (item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED') as 'PENDING' | 'COMPLETED' }
          : item
      );
      setActiveResult({ ...activeResult, actionItems: updatedItems });
    }

    setMinutesList((prev) =>
      prev.map((m) => {
        if (m.id !== minuteId) return m;
        return {
          ...m,
          actionItems: m.actionItems.map((item) =>
            item.id === taskId
              ? { ...item, status: (item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED') as 'PENDING' | 'COMPLETED' }
              : item
          ),
        };
      })
    );

    // Call API patch
    try {
      await fetch('/api/minutes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minuteId, actionId: taskId }),
      });
    } catch (err) {
      console.error('Failed to update action item status:', err);
    }
  };

  const handleCopyActionList = () => {
    if (!activeResult) return;
    const lines = [
      `DAFTAR TUGAS (ACTION ITEMS) - ${activeResult.title}`,
      `Tanggal: ${activeResult.date} | Lokasi: ${activeResult.location || 'Masjid Babul Khaer'}`,
      '-------------------------------------------------------',
      ...activeResult.actionItems.map(
        (a, i) =>
          `${i + 1}. [${a.status === 'COMPLETED' ? 'SELESAI' : 'PROSES'}] ${a.task}\n   PIC: ${a.pic} | Tenggat: ${a.deadline} | Prioritas: ${a.priority}`
      ),
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Ekstraksi Notulensi Rapat AI (Gemini Studio)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ubah catatan rapat bebas menjadi poin kesepakatan dan daftar tugas (*Action Items*) otomatis.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium transition-colors self-start md:self-auto cursor-pointer"
          >
            Muat Contoh Notulensi DKM
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                : 'bg-blue-50 text-blue-800 border border-blue-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Teks Catatan Notulensi Mentah
          </label>
          <textarea
            rows={6}
            value={rawNotes}
            onChange={(e) => setRawNotes(e.target.value)}
            placeholder="Tempel catatan rapat di sini... contoh: 'Rapat koordinasi persiapan Ramadhan dihadiri Ketua dan Pengurus... Keputusan: kerja bakti Ahad jam 7 pagi... PIC Pak Sekretaris buat surat undangan...'"
            className="w-full text-xs font-mono leading-relaxed border border-slate-200 rounded-lg p-3 bg-slate-50/50 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition-all"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleExtract}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menganalisis Notulensi dengan AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ekstraksi Jadi Action Items</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {activeResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header of Result */}
          <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Hasil Analisis
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {activeResult.date}
                </span>
              </div>
              <h3 className="text-base font-bold text-white">
                {activeResult.title}
              </h3>
              {activeResult.location && (
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  {activeResult.location}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {minutesList.length > 1 && (
                <select
                  value={activeResult.id}
                  onChange={(e) => {
                    const selected = minutesList.find((m) => m.id === e.target.value);
                    if (selected) setActiveResult(selected);
                  }}
                  className="text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden"
                >
                  {minutesList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.date})
                    </option>
                  ))}
                </select>
              )}

              <button
                onClick={handleCopyActionList}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Action Items'}</span>
              </button>
            </div>
          </div>

          <div className="p-5 space-y-6">
            {/* Summary Box */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80 text-xs text-slate-700">
              <span className="font-bold text-slate-900 block mb-1">
                Ringkasan Eksekutif:
              </span>
              <p className="leading-relaxed">{activeResult.summary}</p>
              {activeResult.attendees && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                  <strong>Peserta Rapat:</strong> {activeResult.attendees}
                </div>
              )}
            </div>

            {/* Poin Keputusan */}
            {activeResult.decisions.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Ketetapan / Keputusan Rapat:</span>
                </h4>
                <div className="space-y-1.5">
                  {activeResult.decisions.map((decision, idx) => (
                    <div
                      key={idx}
                      className="text-xs flex items-start gap-2 bg-emerald-50/50 border border-emerald-100/80 p-2.5 rounded-lg text-slate-800"
                    >
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{decision}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Items List */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-amber-600" />
                  <span>Daftar Tindak Lanjut (Action Items):</span>
                </h4>
                <span className="text-[11px] text-slate-500">
                  {activeResult.actionItems.filter((a) => a.status === 'COMPLETED').length} dari {activeResult.actionItems.length} selesai
                </span>
              </div>

              <div className="space-y-2">
                {activeResult.actionItems.map((item) => {
                  const isDone = item.status === 'COMPLETED';
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleTask(activeResult.id, item.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-slate-50 border-slate-200 text-slate-400'
                          : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-800 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => {}} // Handled by parent div
                          className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div>
                          <p
                            className={`text-xs font-medium leading-snug ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-900'
                            }`}
                          >
                            {item.task}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-semibold text-emerald-700">
                              <User className="w-3 h-3 text-emerald-600" />
                              {item.pic}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              Tenggat: {item.deadline}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.priority === 'HIGH'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : item.priority === 'MEDIUM'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {item.priority === 'HIGH' ? 'Tinggi' : item.priority === 'MEDIUM' ? 'Sedang' : 'Rendah'}
                        </span>
                        {isDone ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                            Selesai
                          </span>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                            Menunggu
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
