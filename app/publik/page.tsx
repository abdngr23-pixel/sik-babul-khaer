'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Building2,
  Copy,
  Check,
  Send,
  QrCode,
  ChevronRight,
  Sun,
  Moon,
  Wheat,
  HeartHandshake,
  TrendingUp,
  GraduationCap,
  Store,
  Clock,
  ArrowRight,
  Download,
  Image as ImageIcon,
  Sparkles,
  Type,
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { buildWhatsAppLink } from '@/lib/whatsapp-service';

// Data Types from public stats endpoint
interface PublicStatsData {
  hero: {
    totalFundsManaged: number;
    assistedFamilies: number;
    riceDistributedKg: number;
    monthName: string;
  };
  crowdfunding: {
    id: string;
    code: string;
    title: string;
    category: string;
    allocatedBudget: number;
    realizedBudget: number;
    progressPercentage: number;
    status: string;
    description: string;
    photos: string[];
    updatedAt: string;
  }[];
  contributions: {
    infaqThisMonth: number;
    zakatThisMonth: number;
    activeDonorsCount: number;
    sssRtParticipatingCount: number;
  };
  impact: {
    mustahiqHelpedCount: number;
    activeSantriCount: number;
    activeUmkmCount: number;
    completedProjectsCount: number;
  };
  atmBeras: {
    stockStatus: 'AMAN' | 'MENIPIS' | 'KRITIS';
    stockStatusLabel: string;
    currentStockKg: number;
    lowStockThresholdKg: number;
    cumulativeDistributedKg: number;
    recentPublicDeposits: {
      id: string;
      date: string;
      donorDisplay: string;
      weightKg: number;
      notes: string;
    }[];
  };
  gallery: {
    url: string;
    title: string;
    category: string;
    progress: number;
  }[];
  calendarEvents: {
    id: string;
    type: string;
    title: string;
    speakerName: string;
    speakerTitle?: string;
    date: string;
    time: string;
    location: string;
    description: string;
  }[];
  transparency: {
    monthlyTrends: { month: string; income: number; expense: number; balance: number }[];
    totalKasOperasional: number;
    totalKasPembangunan: number;
    totalKasSosial: number;
    lastAuditDate: string;
  };
  officials: {
    id: string;
    name: string;
    title: string;
    role: string;
    roleLabel: string;
    avatarUrl?: string;
    department: string;
    bio?: string;
  }[];
}

const DEFAULT_STATS: PublicStatsData = {
  hero: {
    totalFundsManaged: 186050000,
    assistedFamilies: 48,
    riceDistributedKg: 70,
    monthName: 'September 2026',
  },
  crowdfunding: [
    {
      id: 'prj-002',
      code: 'PRJ-2026-002',
      title: 'Pembangunan Menara Masjid 30 Meter',
      category: 'PEMBANGUNAN_BARU',
      allocatedBudget: 1550000000,
      realizedBudget: 420000000,
      progressPercentage: 30,
      status: 'DALAM_PENGERJAAN',
      description: 'Pembangunan menara masjid permanen setinggi 30 meter sebagai landmark kemakmuran Masjid Babul Khaer dan penempatan corong azan jangkauan luas Blok AE hingga perbatasan BTP.',
      photos: [
        'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&auto=format&fit=crop&q=80',
      ],
      updatedAt: '2026-09-04',
    },
    {
      id: 'prj-001',
      code: 'PRJ-2026-001',
      title: 'Renovasi Plafon & Penanganan Atap Bocor Lantai 2',
      category: 'RENOVASI',
      allocatedBudget: 350000000,
      realizedBudget: 145000000,
      progressPercentage: 55,
      status: 'DALAM_PENGERJAAN',
      description: 'Penggantian menyeluruh rangka plafon gipsum tahan air ruang sholat utama lantai 2 akibat rembesan air saat musim hujan.',
      photos: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
      ],
      updatedAt: '2026-09-05',
    },
  ],
  contributions: {
    infaqThisMonth: 18450000,
    zakatThisMonth: 14800000,
    activeDonorsCount: 34,
    sssRtParticipatingCount: 5,
  },
  impact: {
    mustahiqHelpedCount: 48,
    activeSantriCount: 72,
    activeUmkmCount: 12,
    completedProjectsCount: 2,
  },
  atmBeras: {
    stockStatus: 'AMAN',
    stockStatusLabel: 'Stok Beras Tersedia (Melimpah)',
    currentStockKg: 185,
    lowStockThresholdKg: 50,
    cumulativeDistributedKg: 1450,
    recentPublicDeposits: [
      { id: '1', date: '2026-09-05', donorDisplay: 'Keluarga Bpk. H. Muh. Hasri', weightKg: 50, notes: 'Beras kemasan 5kg' },
      { id: '2', date: '2026-09-03', donorDisplay: 'Hamba Allah (Anonim)', weightKg: 100, notes: 'Setoran 4 karung @ 25kg' },
      { id: '3', date: '2026-09-02', donorDisplay: 'Ibu Hj. Rosdiana (RT 01)', weightKg: 30, notes: 'Infaq syukuran usaha' },
      { id: '4', date: '2026-08-30', donorDisplay: 'Hamba Allah (Anonim)', weightKg: 25, notes: 'Sedekah beras serambi' },
    ],
  },
  gallery: [
    {
      url: 'https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?w=800&auto=format&fit=crop&q=80',
      title: 'Pembangunan Menara Masjid 30 Meter',
      category: 'PEMBANGUNAN_BARU',
      progress: 30,
    },
    {
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186156f?w=800&auto=format&fit=crop&q=80',
      title: 'Renovasi Plafon & Atap Bocor',
      category: 'RENOVASI',
      progress: 55,
    },
    {
      url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&auto=format&fit=crop&q=80',
      title: 'Struktur Elevated Lantai Menara',
      category: 'PEMBANGUNAN_BARU',
      progress: 30,
    },
  ],
  calendarEvents: [
    {
      id: '1',
      type: 'SHOLAT_JUMAT',
      title: 'Sholat Jumat: Generasi Cinta Masjid',
      speakerName: 'Dr. Drs. H. Andi Hasanuddin, M.M.',
      speakerTitle: 'Dewan Penasihat DKM / Ulama Makassar',
      date: '2026-09-11',
      time: '12:05 WITA',
      location: 'Ruang Sholat Utama',
      description: 'Imam: Ustadz Haris • Muadzin: Marbot Firman',
    },
    {
      id: '2',
      type: 'MAJELIS_TALIM',
      title: 'Kajian Rutin Subuh: Fiqih Ibadah & Adab Masjid',
      speakerName: 'Drs. Manai, M.M.',
      speakerTitle: 'Koord. Peribadatan & Dakwah',
      date: 'Ahad Ba\'da Subuh',
      time: '05:30 WITA',
      location: 'Ruang Sholat Utama',
      description: 'Terbuka untuk umum, disediakan sarapan pagi gratis.',
    },
  ],
  transparency: {
    monthlyTrends: [
      { month: 'Apr 2026', income: 26500000, expense: 18200000, balance: 8300000 },
      { month: 'Mei 2026', income: 32000000, expense: 21500000, balance: 10500000 },
      { month: 'Jun 2026', income: 28900000, expense: 19800000, balance: 9100000 },
      { month: 'Jul 2026', income: 34500000, expense: 24200000, balance: 10300000 },
      { month: 'Agu 2026', income: 38200000, expense: 26100000, balance: 12100000 },
      { month: 'Sep 2026', income: 41750000, expense: 22400000, balance: 19350000 },
    ],
    totalKasOperasional: 28750000,
    totalKasPembangunan: 142500000,
    totalKasSosial: 14800000,
    lastAuditDate: '31 Agustus 2026',
  },
  officials: [
    {
      id: 'usr-ketua',
      name: 'Drs. Muhammad Hasri, M. Hum.',
      title: 'Ketua Umum DKM',
      role: 'KETUA_UMUM',
      roleLabel: 'Ketua Umum',
      department: 'Badan Pimpinan Harian (Eksekutif)',
      bio: 'Pimpinan tertinggi operasional DKM Babul Khaer BTP Blok AE periode 2026-2029 (SK PC DMI No. 13/2026).',
    },
    {
      id: 'usr-sekretaris',
      name: 'Ir. Muhammad Natsir, S.T.',
      title: 'Sekretaris Umum DKM',
      role: 'SEKRETARIS',
      roleLabel: 'Sekretaris Umum',
      department: 'Bidang Kesekretariatan & Tata Usaha',
      bio: 'Penanggung jawab administrasi umum, persuratan dinas resmi, dan perumusan kebijakan Raker.',
    },
    {
      id: 'usr-bendahara',
      name: 'H. Sahali',
      title: 'Bendahara Umum DKM',
      role: 'BENDAHARA',
      roleLabel: 'Bendahara Umum',
      department: 'Bidang Keuangan & Perbendaharaan',
      bio: 'Penata dan pengelola keuangan kas operasional, ZISWAF, dan laporan transparansi mimbar Jumat.',
    },
    {
      id: 'usr-sarpras',
      name: 'Faisal T. Parussengi, S.S.',
      title: 'Koordinator Sarana & Prasarana',
      role: 'SARPRAS',
      roleLabel: 'Koordinator Sarpras',
      department: 'Bidang Pembangunan & Sarpras',
      bio: 'Penanggung jawab inventaris fisik, pemeliharaan genset, AC, sound system, dan fasilitas ibadah.',
    },
    {
      id: 'usr-kemasjidan',
      name: 'Drs. Manai, M.M.',
      title: 'Koordinator Peribadatan & Dakwah',
      role: 'KEMASJIDAN',
      roleLabel: 'Peribadatan & Dakwah',
      department: 'Bidang Keagamaan & Pendidikan',
      bio: 'Mengelola jadwal sholat fardhu/Jumat, imam rawatib, kajian majelis ta\'lim, dan pemetaan mustahiq.',
    },
    {
      id: 'usr-pengawas',
      name: 'Dr. Andi Fiptar Abdi Alam, M. Si.',
      title: 'Koordinator Dewan Pengawas',
      role: 'DEWAN_PENGAWAS',
      roleLabel: 'Dewan Pengawas',
      department: 'Badan Pengawas & Pemeriksa Keuangan',
      bio: 'Menjalankan amanah independen pengawasan dan pemeriksaan penggunaan dana kas masjid.',
    },
  ],
};

export default function PublicPortalPage() {
  const { theme, toggleTheme, isLargeText, toggleTextSize } = useTheme();
  const [stats, setStats] = useState<PublicStatsData>(DEFAULT_STATS);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Donation interactive state
  const [selectedCategory, setSelectedCategory] = useState<'INFAQ' | 'ZAKAT' | 'WAKAF' | 'DONATUR'>('INFAQ');
  const [selectedNominal, setSelectedNominal] = useState<number>(100000);
  const [customNominal, setCustomNominal] = useState<string>('');
  const [donorNameInput, setDonorNameInput] = useState<string>('');
  const [selectedPhotoZoom, setSelectedPhotoZoom] = useState<string | null>(null);

  // Jadwal Sholat Makassar
  const prayerTimes = [
    { name: 'Subuh', time: '04:47 WITA' },
    { name: 'Terbit', time: '06:02 WITA' },
    { name: 'Dzuhur', time: '12:05 WITA' },
    { name: 'Ashar', time: '15:21 WITA' },
    { name: 'Maghrib', time: '18:07 WITA' },
    { name: 'Isya', time: '19:16 WITA' },
  ];

  // Fetch real aggregate stats from dedicated endpoint
  useEffect(() => {
    fetch('/api/public/stats')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setStats(res.data);
        }
      })
      .catch((err) => console.warn('Gagal memuat stats publik dari server:', err));
  }, []);

  // Live time ticker
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA'
      );
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

  // Format currency
  const formatRp = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Build WhatsApp prefilled donation link
  const currentDonationAmount = customNominal ? Number(customNominal) || 0 : selectedNominal;
  const donationCategoryLabel = {
    INFAQ: 'Infaq Operasional Masjid',
    ZAKAT: 'Zakat Maal / Zakat Fitrah',
    WAKAF: 'Wakaf Pembangunan Menara 30m',
    DONATUR: 'Komitmen Donatur Tetap Bulanan',
  }[selectedCategory];

  const donationWaLink = useMemo(() => {
    const text =
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
      `Yth. Pengurus DKM Masjid Babul Khaer BTP Blok AE,\n\n` +
      `Saya ingin konfirmasi partisipasi/transfer donasi melalui Portal Publik:\n` +
      `📌 *Kategori Program:* ${donationCategoryLabel}\n` +
      `💰 *Nominal Donasi:* ${formatRp(currentDonationAmount)}\n` +
      `${donorNameInput.trim() ? `👤 *Nama Hamba Allah:* ${donorNameInput.trim()}\n` : ''}` +
      `\nMohon konfirmasi setelah dana diterima di Rekening BSI 7123456789. Semoga membawa berkah dan menjadi amal jariyah.\n\n` +
      `Jazakumullahu Khairan Katsiran.`;
    return buildWhatsAppLink('081244558899', text);
  }, [donationCategoryLabel, currentDonationAmount, donorNameInput]);

  // Calendar iCal download helper
  const handleDownloadIcs = (event: { title: string; description: string; location: string; date: string }) => {
    const cleanDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//DKM Masjid Babul Khaer//Portal Publik//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, ' ')}`,
      `LOCATION:${event.location}`,
      `DTSTART:${cleanDate}T040000Z`,
      `DTEND:${cleanDate}T060000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status badge for ATM Beras
  const atmStatusBadge =
    stats.atmBeras.stockStatus === 'KRITIS'
      ? { label: 'Perlu Tambahan Beras', bg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300' }
      : stats.atmBeras.stockStatus === 'MENIPIS'
      ? { label: 'Stok Menipis', bg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300' }
      : { label: 'Stok Beras Tersedia', bg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR                                                        */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors">
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
            {/* Mode Teks Besar Toggle Button */}
            <button
              onClick={toggleTextSize}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center min-h-[38px] min-w-[38px] ${
                isLargeText
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
              }`}
              title={isLargeText ? 'Mode Teks Normal' : 'Mode Teks Besar (A+)'}
              aria-label="Toggle Text Size"
            >
              <Type className="w-4 h-4" />
              <span className="text-[10px] font-bold ml-0.5">A+</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
              title="Ganti Tema (Gelap/Terang)"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            <Link
              href="/"
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            >
              <span>Login Pengurus</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECTION 1: HERO — BUKTI DAMPAK LANGSUNG                                    */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-900 text-white pt-12 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Siklus Kebaikan: Dari Jamaah, Kembali Nyata untuk Jamaah</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Transparansi Kas, <br />
            <span className="text-emerald-400">Keberkahan &amp; Dampak Nyata Umat</span>
          </h1>

          <p className="text-xs sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
            Menghubungkan setiap infaq dan sedekah Anda langsung dengan senyum para dhuafa, pendidikan santri Al-Qur&apos;an, dan pembangunan fasilitas rumah Allah.
          </p>

          {/* Quick CTA Links */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#donasi"
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm shadow-xl transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              Ikut Berinfaq &amp; QRIS
            </a>
            <a
              href="#atm-beras"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs sm:text-sm border border-white/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Wheat className="w-4 h-4 text-amber-300" />
              <span>Program ATM Beras</span>
            </a>
            <a
              href="#kalender"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs sm:text-sm border border-white/20 transition-all cursor-pointer"
            >
              Jadwal Sholat &amp; Kajian
            </a>
          </div>

          {/* 3 Real Impact Cards Under Hero */}
          <div className="pt-8">
            <div className="text-xs sm:text-sm text-emerald-200 font-semibold mb-3">
              Capaian Terkelola {stats.hero.monthName}:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg space-y-1">
                <div className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider">
                  Dana Umat Terkelola
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">
                  {formatRp(stats.hero.totalFundsManaged)}
                </div>
                <div className="text-[11px] text-slate-300">
                  Diaudit rutin 1 pintu di mimbar Jumat
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg space-y-1">
                <div className="text-[11px] text-teal-300 font-semibold uppercase tracking-wider">
                  Keluarga Terbantu
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">
                  {stats.hero.assistedFamilies} Keluarga
                </div>
                <div className="text-[11px] text-slate-300">
                  Mustahiq 5 RT &amp; lansia dhuafa
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg space-y-1">
                <div className="text-[11px] text-amber-300 font-semibold uppercase tracking-wider">
                  Beras Tersalurkan
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-white">
                  {stats.hero.riceDistributedKg} Kg Beras
                </div>
                <div className="text-[11px] text-slate-300">
                  Melalui lumbung serambi masjid
                </div>
              </div>
            </div>
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

      {/* ========================================================================= */}
      {/* MAIN CONTAINER FOR REMAINING SECTIONS                                      */}
      {/* ========================================================================= */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* ========================================================================= */}
        {/* SECTION 2: "APA YANG JAMAAH BERIKAN" (KONTRIBUSI MASUK / CROWDFUNDING)    */}
        {/* ========================================================================= */}
        <section id="crowdfunding" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Bagian 1: Amanah Jamaah
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Apa yang Jamaah Berikan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Swadaya umat dan gotong royong warga Blok AE yang menjadi denyut nadi operasional dan pembangunan fasilitas ibadah.
            </p>
          </div>

          {/* Crowdfunding Proyek Fisik Berjalan (Kitabisa Style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {stats.crowdfunding.map((project) => {
              const pct = project.progressPercentage;
              const isMenara = project.category === 'PEMBANGUNAN_BARU';
              return (
                <div
                  key={project.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  {/* Project Image Banner */}
                  {project.photos && project.photos.length > 0 ? (
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.photos[0]}
                        alt={project.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-wider">
                        {project.category.replace('_', ' ')}
                      </span>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      <span>Dokumentasi akan segera hadir</span>
                    </div>
                  )}

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                        {project.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    {/* Progress Bar & Numbers */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-300">Terserap / Terkumpul</span>
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm">
                          {pct}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isMenara
                              ? 'bg-gradient-to-r from-teal-500 to-emerald-600'
                              : 'bg-gradient-to-r from-amber-500 to-amber-600'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <span>
                          Realisasi: <strong>{formatRp(project.realizedBudget)}</strong>
                        </span>
                        <span>
                          Target: <strong>{formatRp(project.allocatedBudget)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <a
                        href="#donasi"
                        onClick={() => setSelectedCategory(isMenara ? 'WAKAF' : 'INFAQ')}
                        className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                      >
                        <span>Ikut Berwakaf / Donasi Proyek Ini</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aggregate Contribution Numbers (Agregat Aman) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Infaq Rutin Bulan Ini</div>
              <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                {formatRp(stats.contributions.infaqThisMonth)}
              </div>
              <div className="text-[10px] text-slate-400">Kotak Jumat &amp; Tromol</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">ZISWAF Terkumpul</div>
              <div className="text-lg font-extrabold text-teal-700 dark:text-teal-400">
                {formatRp(stats.contributions.zakatThisMonth)}
              </div>
              <div className="text-[10px] text-slate-400">UPZ BAZNAS Resmi</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Donatur Tetap Aktif</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                {stats.contributions.activeDonorsCount} Donatur
              </div>
              <div className="text-[10px] text-slate-400">Komitmen Rutin Bulanan</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Partisipasi RT (SSS)</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                {stats.contributions.sssRtParticipatingCount} Rukun Tetangga
              </div>
              <div className="text-[10px] text-slate-400">RT 01 s.d RT 05 Blok AE</div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: "APA YANG MASJID BERIKAN KEMBALI" (DAMPAK NYATA & OUTPUT)      */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-950 text-xs font-bold text-teal-800 dark:text-teal-300">
              Bagian 2: Dampak Nyata Umat
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Apa yang Masjid Kembalikan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Setiap rupiah diubah menjadi manfaat nyata yang kembali dirasakan seluruh lapisan masyarakat sekitar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Kartu 1: Mustahiq Terbantu */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.impact.mustahiqHelpedCount} Keluarga
                </div>
                <div className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Santunan Sosial ZISWAF
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Penyaluran beras, santunan dhuafa lansia, dan bantuan darurat bagi warga prasejahtera.
                </p>
              </div>
            </div>

            {/* Kartu 2: Santri TPA */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.impact.activeSantriCount} Santri
                </div>
                <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Pendidikan Al-Qur&apos;an TPA
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Bimbingan tahsin, tahfidz Juz 30, dan adab islami gratis bagi anak-anak warga sekitar.
                </p>
              </div>
            </div>

            {/* Kartu 3: UMKM Binaan */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {stats.impact.activeUmkmCount} Usaha
                </div>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  Pemberdayaan Ekonomi Umat
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Penyaluran modal bergulir Qardhul Hasan bebas riba dan partisipasi bazar halal masjid.
                </p>
              </div>
            </div>

            {/* Kartu 4: Fasilitas Fisik */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  Kenyamanan Ibadah
                </div>
                <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Fasilitas &amp; AC Prima
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ruang ibadah sejuk 2 PK, genset darurat mati lampu, sound horn TOA jernih, dan toilet wudhu bersih.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: SECTION UNGGULAN "ATM BERAS"                                   */}
        {/* ========================================================================= */}
        <section
          id="atm-beras"
          className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-8 relative overflow-hidden"
        >
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-300">
              <Wheat className="w-4 h-4 text-amber-300" />
              <span>Program Unggulan Lumbung Mandiri</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              ATM Beras — Menyetor Ikhlas, Mengambil Secukupnya
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Lumbung pangan swadaya di serambi Masjid Babul Khaer yang beroperasi 24 jam. Siapa saja jamaah yang berkelebihan dipersilakan menyetor beras, dan jamaah yang sedang kekurangan boleh mengambil beras secukupnya <strong>tanpa perlu meminta izin atau memperlihatkan KTP</strong>.
            </p>
          </div>

          {/* Status Gauge & Angka Dampak */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 relative z-10">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 space-y-2">
              <div className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">
                Status Ketersediaan Saat Ini
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${atmStatusBadge.bg}`}>
                  {atmStatusBadge.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Dispenser serambi terisi &amp; siap diambil dhuafa
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 space-y-1">
              <div className="text-xs text-teal-200 font-semibold uppercase tracking-wider">
                Dampak Penyaluran Kumulatif
              </div>
              <div className="text-3xl font-extrabold text-white">
                {stats.atmBeras.cumulativeDistributedKg.toLocaleString('id-ID')} <span className="text-lg">Kg</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Total beras tersalurkan sepanjang tahun 2026
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15 space-y-2">
              <div className="text-xs text-amber-200 font-semibold uppercase tracking-wider">
                Akses Fisik Langsung
              </div>
              <div className="text-sm font-bold text-white">
                Serambi Kanan Masjid
              </div>
              <p className="text-[11px] text-slate-300">
                Terbuka setiap hari ba&apos;da Subuh s.d Isya (Gratis)
              </p>
            </div>
          </div>

          {/* Alur 3 Langkah Tanpa Birokrasi */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl space-y-3 relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Cara Kerja Program (Menjaga Martabat Jamaah)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span><strong>Bawa Wadah Sendiri:</strong> Datang ke serambi masjid dengan membawa kantong beras bersih.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span><strong>Ambil Sesuai Kebutuhan:</strong> Buka tuas dispenser beras secukupnya untuk kebutuhan makan harian keluarga.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span><strong>Tanpa Pertanyaan:</strong> Tidak perlu lapor atau meninggalkan KTP. Kehormatan Anda adalah amanah kami.</span>
              </div>
            </div>
          </div>

          {/* Papan Terima Kasih Donatur Beras (Menghormati Anonimitas) */}
          <div className="space-y-3 relative z-10">
            <div className="flex items-center justify-between text-xs text-emerald-200">
              <span className="font-bold uppercase tracking-wider">Papan Apresiasi Penyetor Beras Terbaru</span>
              <span className="text-[11px]">Jazakumullah Khair Katsiran</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {stats.atmBeras.recentPublicDeposits.map((dep) => (
                <div key={dep.id} className="p-3.5 rounded-xl bg-white/10 border border-white/15 text-xs space-y-1">
                  <div className="font-bold text-white truncate">{dep.donorDisplay}</div>
                  <div className="text-emerald-300 font-extrabold">+{dep.weightKg} Kg Beras</div>
                  <div className="text-[10px] text-slate-300 flex justify-between">
                    <span>{dep.date}</span>
                    <span className="truncate ml-1">{dep.notes}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: GALERI BUKTI NYATA                                             */}
        {/* ========================================================================= */}
        <section id="galeri" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              Dokumentasi Lapangan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Galeri Bukti Nyata Progres
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Dokumentasi autentik pekerjaan fisik pembangunan dan perbaikan sarana prasarana Masjid Babul Khaer.
            </p>
          </div>

          {stats.gallery.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
              <ImageIcon className="w-8 h-8 mx-auto text-slate-400" />
              <div className="text-sm font-bold text-slate-600 dark:text-slate-400">
                Dokumentasi foto lapangan akan segera hadir
              </div>
              <p className="text-xs text-slate-400">
                Tim Seksi Sarpras sedang mengunggah foto progres pengerjaan terbaru.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
              {stats.gallery.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedPhotoZoom(img.url)}
                  className="group relative aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-90 p-4 flex flex-col justify-end text-white">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      {img.category.replace('_', ' ')} • {img.progress}%
                    </div>
                    <div className="text-xs font-bold truncate mt-0.5">{img.title}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modal Zoom Foto Galeri */}
        {selectedPhotoZoom && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in"
            onClick={() => setSelectedPhotoZoom(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedPhotoZoom} alt="Pratinjau Foto" className="w-full h-auto max-h-[85vh] object-contain" />
              <button
                onClick={() => setSelectedPhotoZoom(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-slate-900/80 text-white hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 6: SECTION KALENDER KEGIATAN PUBLIK                               */}
        {/* ========================================================================= */}
        <section id="kalender" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-xs font-bold text-blue-800 dark:text-blue-300">
              Agenda &amp; Majelis Ilmu
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Kalender Kegiatan Publik
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Jadwal sholat Jumat, kajian tematik, dan majelis ta&apos;lim yang terbuka gratis untuk seluruh kaum muslimin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {stats.calendarEvents.map((evt) => (
              <div
                key={evt.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {evt.type === 'SHOLAT_JUMAT' ? 'Khatib Jumat' : 'Majelis Ta\'lim'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{evt.time}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {evt.title}
                  </h3>

                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    {evt.speakerName} {evt.speakerTitle ? `(${evt.speakerTitle})` : ''}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400">🗓 {evt.date}</span>
                  <button
                    onClick={() => handleDownloadIcs(evt)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition-colors cursor-pointer flex items-center gap-1.5 text-[11px]"
                    title="Unduh file kalender .ics untuk Google/Apple Calendar"
                  >
                    <Download className="w-3 h-3" />
                    <span>Simpan ke Kalender (.ics)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: AJAKAN BERKONTRIBUSI (REDESAIN SECTION DONASI & QRIS)          */}
        {/* ========================================================================= */}
        <section
          id="donasi"
          className="bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-2xl space-y-8"
        >
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-emerald-300 border border-white/20">
              Saluran Berkah &amp; Jariyah
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Infaq, Sedekah &amp; Wakaf Pembangunan
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100">
              Pilih program dan nominal infaq, lalu konfirmasikan otomatis melalui WhatsApp resmi DKM Babul Khaer.
            </p>
          </div>

          {/* Interactive Category Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-3xl mx-auto">
            {(
              [
                { id: 'INFAQ', label: 'Infaq Umum' },
                { id: 'ZAKAT', label: 'Zakat Maal' },
                { id: 'WAKAF', label: 'Wakaf Menara' },
                { id: 'DONATUR', label: 'Donatur Tetap' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-center border ${
                  selectedCategory === cat.id
                    ? 'bg-white text-slate-950 border-white shadow-md'
                    : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Quick Nominal Buttons */}
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="text-xs text-emerald-200 font-semibold text-center">Pilih Nominal Infaq:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[50000, 100000, 250000, 500000].map((nom) => (
                <button
                  key={nom}
                  onClick={() => {
                    setSelectedNominal(nom);
                    setCustomNominal('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                    selectedNominal === nom && !customNominal
                      ? 'bg-emerald-400 text-slate-950 border-emerald-300 shadow-md'
                      : 'bg-white/10 text-white border-white/15 hover:bg-white/20'
                  }`}
                >
                  {formatRp(nom)}
                </button>
              ))}
            </div>

            {/* Nominal Bebas & Nama Donatur */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] text-emerald-200 font-semibold mb-1">
                  Atau Masukkan Nominal Lain (Rp):
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 1500000"
                  value={customNominal}
                  onChange={(e) => setCustomNominal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-emerald-200 font-semibold mb-1">
                  Nama Anda / Hamba Allah:
                </label>
                <input
                  type="text"
                  placeholder="Kosongkan jika ingin anonim"
                  value={donorNameInput}
                  onChange={(e) => setDonorNameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Rekening BSI & QRIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2">
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
                  className="px-4 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  {copiedAccount ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAccount ? 'Nomor Tersalin!' : 'Salin Nomor Rekening'}</span>
                </button>

                <a
                  href={donationWaLink}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Konfirmasi via WhatsApp</span>
                </a>
              </div>
            </div>

            {/* QRIS Card */}
            <div className="bg-white p-6 rounded-2xl text-slate-900 text-center space-y-3 shadow-xl">
              <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Scan QRIS Resmi Semua Bank &amp; E-Wallet</span>
              </div>

              <div className="w-44 h-44 mx-auto bg-slate-100 rounded-xl p-3 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center relative">
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

        {/* ========================================================================= */}
        {/* SECTION 8: LAPORAN TRANSPARANSI (KAS 6 BULAN & LPJ)                        */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              Audit &amp; Akuntabilitas
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Laporan Transparansi Kas
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Pemisahan 3 pos kas utama yang dilaporkan berkala di mimbar Jumat dan diaudit oleh Dewan Pengawas independen.
            </p>
          </div>

          {/* 3 Pos Kas Utama */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1.5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Kas Operasional Masjid</div>
              <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {formatRp(stats.transparency.totalKasOperasional)}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Listrik, Air, Marbot &amp; Operasional Rutin
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1.5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Dana Pembangunan Menara</div>
              <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-400">
                {formatRp(stats.transparency.totalKasPembangunan)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Pagu Menara 30m Rp 1,55 Miliar
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-1.5">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Dana Sosial &amp; ZISWAF BAZNAS</div>
              <div className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">
                {formatRp(stats.transparency.totalKasSosial)}
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                Santunan Dhuafa &amp; Kaleng SSS 5 RT
              </div>
            </div>
          </div>

          {/* Grafik Batang 6 Bulan Terakhir */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Tren Pemasukan vs Pengeluaran (6 Bulan Terakhir)</span>
              </h3>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Pemasukan
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" /> Pengeluaran
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
              {stats.transparency.monthlyTrends.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-center space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{t.month}</div>
                  <div className="space-y-1 text-[10px]">
                    <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                      +{Math.round(t.income / 1000000)} Jt
                    </div>
                    <div className="text-rose-600 dark:text-rose-400 font-semibold">
                      -{Math.round(t.expense / 1000000)} Jt
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${Math.min(100, Math.round((t.income / 45000000) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Diaudit oleh Dewan Pengawas: <strong>{stats.transparency.lastAuditDate}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Status: WTP (Wajar Tanpa Pengecualian)</span>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9: PROFIL PENGURUS 2026–2029                                      */}
        {/* ========================================================================= */}
        <section id="pengurus" className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              Amanah Kepengurusan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Pengurus DKM Babul Khaer
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Struktur Badan Pimpinan Harian Periode 2026–2029 (SK PC DMI Biringkanaya No. 13/2026).
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
            {stats.officials.map((off) => (
              <div
                key={off.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                    {off.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {off.name}
                    </h3>
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {off.title}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {off.bio}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
                  {off.department}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FOOTER & SEKRETARIAT                                                      */}
        {/* ========================================================================= */}
        <footer className="border-t border-slate-200 dark:border-slate-800 pt-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Sekretariat DKM Masjid Babul Khaer
            </div>
            <div>Kompleks BTP Blok AE, Kelurahan Tamalanrea, Kecamatan Tamalanrea, Makassar 90245</div>
            <div className="mt-1">
              Kontak Resmi: 0812-4455-8899 (Ketua Umum) • 0812-4000-0003 (Bendahara ATM Beras)
            </div>
          </div>

          <div className="text-left md:text-right">
            <div>Sistem Informasi Kemakmuran (SIK) Babul Khaer © 2026</div>
            <div className="text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
              Standar Transparansi Umat &bull; Portal Publik Terpadu
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
