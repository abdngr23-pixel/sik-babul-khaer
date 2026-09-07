'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Calendar, 
  Copy, 
  Check, 
  Send, 
  QrCode, 
  ShieldCheck, 
  ChevronRight,
  Sun,
  Moon,
  Compass
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export default function PublicPortalPage() {
  const { theme, toggleTheme } = useTheme();
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyBsi = () => {
    navigator.clipboard.writeText('7123456789');
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Jadwal Sholat Makassar (Estimasi September)
  const prayerTimes = [
    { name: 'Subuh', time: '04:47 WITA' },
    { name: 'Terbit', time: '06:02 WITA' },
    { name: 'Dzuhur', time: '12:05 WITA' },
    { name: 'Ashar', time: '15:21 WITA' },
    { name: 'Maghrib', time: '18:07 WITA' },
    { name: 'Isya', time: '19:16 WITA' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/85 dark:bg-slate-900/85 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-700/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight leading-none">
                Masjid Babul Khaer
              </div>
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                BTP Blok AE, Tamalanrea, Makassar
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Ganti Tema (Gelap/Terang)"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <Link
              href="/"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>Login Pengurus</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-900 text-white pt-12 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-emerald-300">
            <Compass className="w-3.5 h-3.5" />
            <span>Portal Informasi & Transparansi Jamaah</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Kemakmuran Masjid, <br />
            <span className="text-emerald-400">Keberkahan Bagi Seluruh Jamaah</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Pusat ibadah, pendidikan Al-Qur&apos;an, kepedulian sosial ZISWAF, dan pemberdayaan ekonomi umat Kompleks BTP Blok AE Makassar.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#donasi"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm shadow-xl transition-transform hover:-translate-y-0.5"
            >
              Infaq & QRIS Donasi
            </a>
            <a
              href="#jadwal"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm border border-white/20 transition-all"
            >
              Jadwal Sholat & Khatib
            </a>
          </div>
        </div>
      </section>

      {/* Floating Prayer Times Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
          {prayerTimes.map((p, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{p.name}</div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">{p.time}</div>
            </div>
          ))}
        </div>
        <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-2">
          Waktu Saat Ini: <strong>{currentTime || 'Memuat...'}</strong> (Zona Waktu Makassar)
        </div>
      </div>

      {/* Main Content Sections */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* Transparency Section: Kas Masjid Real-Time */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Akuntabilitas Satu Pintu</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Transparansi Kas & Amanah Jamaah
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pemisahan rekening dan saldo yang diaudit berkala serta dipertanggungjawabkan pada setiap laporan Jumat.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1.5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Kas Operasional Masjid</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">Rp 28.750.000</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Listrik, Air, Marbot & Operasional Rutin</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1.5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Dana Khusus Pembangunan Menara</div>
              <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-400">Rp 142.500.000</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Target Menara 30m Rp 1,55 Miliar</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1.5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Dana Sosial & ZISWAF BAZNAS</div>
              <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">Rp 14.800.000</div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Santunan Dhuafa & Kaleng SSS 5 RT</div>
            </div>
          </div>
        </section>

        {/* Jadwal Khatib & Kajian */}
        <section id="jadwal" className="space-y-4 pt-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-4 h-4" />
            <span>Jadwal Dakwah & Kajian</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Agenda Ibadah & Majelis Ta&apos;lim
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Khatib Jumat Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  Sholat Jumat Pekan Ini
                </span>
                <span className="text-xs text-slate-400">12.05 WITA</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Ust. H. Muh. Ridwan, S.Ag., M.Pd.I
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tema: &ldquo;Membangun Generasi Robbani yang Cinta Masjid dan Al-Qur&apos;an&rdquo;
                </p>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <span>Muadzin: Marbot Firman</span>
                <span>Imam: Ustadz Haris</span>
              </div>
            </div>

            {/* Kajian Rutin Muslimah & Majelis Ta'lim */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                  Majelis Ta&apos;lim Ibu-Ibu
                </span>
                <span className="text-xs text-slate-400">Ahad Pagi (09.00 WITA)</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Kajian Fiqih Wanita & Thaharah
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pembina: Ustadzah Nur Aisyah, S.Pd.I (Terbuka untuk muslimah BTP Blok AE & sekitarnya)
                </p>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                <span>Tempat: Ruang Utama Lantai 2</span>
                <span className="text-teal-600 font-semibold">Gratis Snack & Kopi</span>
              </div>
            </div>
          </div>
        </section>

        {/* DONASI & QRIS SECTION */}
        <section id="donasi" className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-emerald-300 border border-white/20">
              Saluran Berkah & Jariyah
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Infaq, Sedekah & Donasi Menara Masjid
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100">
              Setiap rupiah yang Anda sedekahkan dialirkan langsung untuk operasional ibadah jamaah dan pembangunan fisik fasilitas rumah Allah.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-4">
            {/* Rekening BSI Card */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-bold text-sm tracking-wider uppercase text-emerald-300">
                  Bank Syariah Indonesia (BSI)
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-400 text-slate-950">
                  Rekening Resmi
                </span>
              </div>

              <div>
                <div className="text-xs text-emerald-200">Nomor Rekening:</div>
                <div className="text-2xl sm:text-3xl font-mono font-bold tracking-wider mt-1 text-white">
                  7123456789
                </div>
                <div className="text-xs text-emerald-200 mt-1">
                  Atas Nama: <strong>DKM MASJID BABUL KHAER</strong>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={handleCopyBsi}
                  className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-md"
                >
                  {copiedAccount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAccount ? 'Tersalin ke Clipboard!' : 'Salin Nomor Rekening'}</span>
                </button>

                <a
                  href={`https://wa.me/6281244558899?text=${encodeURIComponent(
                    "Assalamu'alaikum Pengurus DKM Babul Khaer, saya ingin konfirmasi bukti transfer infaq/donasi untuk masjid. Terima kasih."
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>Konfirmasi via WA</span>
                </a>
              </div>
            </div>

            {/* QRIS Card Visual */}
            <div className="bg-white p-6 rounded-2xl text-slate-900 text-center space-y-3 shadow-xl">
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Scan QRIS Resmi Semua Bank & Dompet Digital</span>
              </div>

              <div className="w-44 h-44 mx-auto bg-slate-100 rounded-xl p-3 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative group">
                {/* QR Visual */}
                <div className="w-full h-full bg-slate-900 rounded-lg p-2 flex items-center justify-center text-white">
                  <QrCode className="w-32 h-32" />
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                NMID: <strong>ID102026090001BK</strong> • Mendukung BCA, BSI, Mandiri, GoPay, OVO, Dana, LinkAja
              </div>
            </div>
          </div>
        </section>

        {/* Footer Contact */}
        <section className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200">Sekretariat DKM Masjid Babul Khaer</div>
            <div>Kompleks BTP Blok AE, Kelurahan Tamalanrea, Kecamatan Tamalanrea, Makassar 90245</div>
            <div className="mt-1">Nara Hubung: 0812-4455-8899 (Ketua) • 0852-9988-1122 (Sekretaris)</div>
          </div>

          <div className="text-right">
            <div>Sistem Informasi Kemakmuran (SIK) Babul Khaer © 2026</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Versi 3.5 — Standar Raker DKM 2026–2029</div>
          </div>
        </section>
      </main>
    </div>
  );
}
