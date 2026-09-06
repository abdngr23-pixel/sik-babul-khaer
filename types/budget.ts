export type KomisiType = 'KOMISI_I' | 'KOMISI_II' | 'SOSIAL_HUMAS';

export interface RakerBudgetItem {
  id: string;
  komisi: KomisiType;
  komisiLabel: string;
  seksiName: string;
  programName: string;
  allocatedBudget: number; // Dari Raker 2026
  disbursedAmount: number; // Realisasi saat ini
  unit: string; // 'Tahun', 'Bulan', 'Kegiatan', 'Total'
  statusRaker: 'DISETUJUI' | 'DIREVISI' | 'BARU' | 'TERBUKA';
  fundingSource: 'KAS_MASJID' | 'SWADAYA_JAMAAH' | 'DONATUR_KHUSUS';
  notes: string;
}

export interface CashflowRunwaySummary {
  monthlyOperationalTarget: number; // Rp 10.000.000 (catatan Bendahara H. Sahali)
  weeklyIncomeAverage: number; // Rp 2.500.000
  currentOperatingCash: number;
  runwayMonths: number;
  healthStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  recommendations: string[];
}
