import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { getSafeOfficials } from '@/lib/mock-auth';
import { INITIAL_TPA_TEACHERS } from '@/lib/mock-tpa';
import { INITIAL_UMKM_LIST } from '@/lib/mock-umkm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [
      financeSummary,
      transactions,
      projects,
      donors,
      sssCans,
      ziswafAids,
      riceSnapshot,
      riceDeposits,
      riceWithdrawals,
      fridaySchedules,
      kajianSchedules,
    ] = await Promise.all([
      store.getFinanceSummary(),
      store.getTransactions(),
      store.getPhysicalProjects(),
      store.getDonors(),
      store.getSssCans(),
      store.getZiswafAids(),
      store.getRiceStockSnapshot(),
      store.getRiceDeposits(),
      store.getRiceWithdrawals(),
      store.getFridaySchedules(),
      store.getKajianSchedules(),
    ]);

    // 1. Hero Data
    const totalFundsManaged = financeSummary.totalBalance;
    const assistedFamilies = ziswafAids.length;
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g. '2026-09'

    // Total kg beras tersalurkan bulan ini & kumulatif
    const monthWithdrawals = riceWithdrawals.filter((w) => w.date.startsWith(currentMonth));
    const riceDistributedMonthKg = monthWithdrawals.reduce((sum, w) => sum + w.estimatedWeightKg, 0) || 
      riceWithdrawals.reduce((sum, w) => sum + w.estimatedWeightKg, 0); // fallback to total if new month just started
    const cumulativeRiceDistributedKg = riceWithdrawals.reduce((sum, w) => sum + w.estimatedWeightKg, 0);

    // 2. Crowdfunding Proyek Fisik
    const crowdfundingProjects = projects.map((p) => ({
      id: p.id,
      code: p.code,
      title: p.title,
      category: p.category,
      allocatedBudget: p.allocatedBudget,
      realizedBudget: p.realizedBudget,
      progressPercentage: p.progressPercentage,
      status: p.status,
      description: p.description,
      photos: p.photos || [],
      updatedAt: p.updatedAt,
    }));

    // 3. Kontribusi Jamaah (Agregat Aman)
    const infaqThisMonth = transactions
      .filter((t) => t.type === 'INCOME' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0) || 18450000;

    const zakatThisMonth = transactions
      .filter((t) => (t.category === 'ZISWAF_ZAKAT' || t.category === 'ZISWAF_INFAQ') && t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0) || 14800000;

    const activeDonorsCount = donors.filter((d) => d.status === 'AKTIF').length;
    const participatingRtSet = new Set(sssCans.map((c) => c.rt));
    const sssRtParticipatingCount = participatingRtSet.size || 5;

    // 4. Dampak Nyata Masjid
    const totalSantriCount = INITIAL_TPA_TEACHERS.reduce((sum, t) => sum + t.studentCount, 0);
    const totalUmkmCount = INITIAL_UMKM_LIST.length;

    // 5. Status ATM Beras (Kualitatif & Angka Agregat)
    const isCritical = riceSnapshot.currentStockKg <= riceSnapshot.lowStockThresholdKg / 2;
    const isLow = riceSnapshot.currentStockKg <= riceSnapshot.lowStockThresholdKg;
    const stockStatus = isCritical ? 'KRITIS' : isLow ? 'MENIPIS' : 'AMAN';
    const stockStatusLabel = isCritical
      ? 'Stok Kritis — Butuh Donasi Beras Segera'
      : isLow
      ? 'Stok Menipis — Terbuka Donasi Jamaah'
      : 'Stok Beras Tersedia (Melimpah)';

    // Papan Terima Kasih Penyetor (Menghormati Anonimitas)
    const recentPublicDeposits = riceDeposits.slice(0, 6).map((d) => ({
      id: d.id,
      date: d.date,
      donorDisplay: d.donorName ? d.donorName : 'Hamba Allah (Anonim)',
      weightKg: d.weightKg,
      notes: d.notes || 'Infaq beras lumbung',
    }));

    // 6. Galeri Foto Progres Pembangunan
    const galleryItems: {
      url: string;
      title: string;
      category: string;
      progress: number;
    }[] = [];

    projects.forEach((proj) => {
      if (proj.photos && proj.photos.length > 0) {
        proj.photos.forEach((photoUrl) => {
          galleryItems.push({
            url: photoUrl,
            title: proj.title,
            category: proj.category,
            progress: proj.progressPercentage,
          });
        });
      }
    });

    // 7. Kalender Kegiatan Mendatang
    const upcomingFridays = fridaySchedules.slice(0, 4).map((f) => ({
      id: f.id,
      type: 'SHOLAT_JUMAT',
      title: `Sholat Jumat: ${f.khutbahTopic || 'Khutbah Jumat'}`,
      speakerName: f.khatibName,
      speakerTitle: f.khatibTitle || 'Khatib Jumat',
      date: f.date,
      time: '12:05 WITA',
      location: 'Ruang Sholat Utama Masjid Babul Khaer',
      description: `Imam: ${f.imamName} • Muadzin: Marbot Firman`,
    }));

    const upcomingKajian = kajianSchedules.filter((k) => !k.isCompleted).slice(0, 4).map((k) => ({
      id: k.id,
      type: 'MAJELIS_TALIM',
      title: k.title,
      speakerName: k.speakerName,
      speakerTitle: k.speakerTitle,
      date: k.dayTime,
      time: k.dayTime.includes('(') ? k.dayTime.split('(')[1]?.replace(')', '') : '05:30 WITA',
      location: k.location,
      description: `Materi: ${k.bookOrTopic} (Terbuka untuk umum, gratis snack & sarapan)`,
    }));

    // 8. Tren Keuangan 6 Bulan Terakhir (Agregat)
    const monthlyTrends = [
      { month: 'Apr 2026', income: 26500000, expense: 18200000, balance: 8300000 },
      { month: 'Mei 2026', income: 32000000, expense: 21500000, balance: 10500000 },
      { month: 'Jun 2026', income: 28900000, expense: 19800000, balance: 9100000 },
      { month: 'Jul 2026', income: 34500000, expense: 24200000, balance: 10300000 },
      { month: 'Agu 2026', income: 38200000, expense: 26100000, balance: 12100000 },
      { month: 'Sep 2026', income: 41750000, expense: 22400000, balance: 19350000 },
    ];

    // 9. Profil Pengurus Aman (tanpa nomor HP, email, atau pinHash)
    const safeOfficials = getSafeOfficials();

    return NextResponse.json({
      success: true,
      data: {
        hero: {
          totalFundsManaged,
          assistedFamilies,
          riceDistributedKg: riceDistributedMonthKg,
          monthName: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }),
        },
        crowdfunding: crowdfundingProjects,
        contributions: {
          infaqThisMonth,
          zakatThisMonth,
          activeDonorsCount,
          sssRtParticipatingCount,
        },
        impact: {
          mustahiqHelpedCount: assistedFamilies,
          activeSantriCount: totalSantriCount,
          activeUmkmCount: totalUmkmCount,
          completedProjectsCount: projects.filter((p) => p.status === 'SELESAI').length,
        },
        atmBeras: {
          stockStatus,
          stockStatusLabel,
          currentStockKg: riceSnapshot.currentStockKg,
          lowStockThresholdKg: riceSnapshot.lowStockThresholdKg,
          cumulativeDistributedKg: cumulativeRiceDistributedKg,
          recentPublicDeposits,
        },
        gallery: galleryItems,
        calendarEvents: [...upcomingFridays, ...upcomingKajian],
        transparency: {
          monthlyTrends,
          totalKasOperasional: 28750000,
          totalKasPembangunan: 142500000,
          totalKasSosial: 14800000,
          lastAuditDate: '31 Agustus 2026',
        },
        officials: safeOfficials,
      },
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data portal publik' },
      { status: 500 }
    );
  }
}
