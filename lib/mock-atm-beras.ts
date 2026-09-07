import { RiceDeposit, RiceWithdrawalLog, RiceStockSnapshot } from '@/types/atm-beras';

export const INITIAL_RICE_SNAPSHOT: RiceStockSnapshot = {
  currentStockKg: 185,
  lastRefillDate: '2026-09-05',
  lowStockThresholdKg: 50,
};

export const INITIAL_RICE_DEPOSITS: RiceDeposit[] = [
  {
    id: 'rdep-001',
    date: '2026-08-28',
    donorName: 'H. Sudirman & Keluarga',
    weightKg: 50,
    notes: 'Beras pandan wangi 2 karung @ 25kg untuk lumbung masjid',
    recordedBy: 'Marbot Firman',
  },
  {
    id: 'rdep-002',
    date: '2026-08-30',
    donorName: '', // Anonim / Hamba Allah
    weightKg: 25,
    notes: 'Sedekah beras tanpa nama ditaruh di serambi masjid',
    recordedBy: 'Drs. Manai, M.M.',
  },
  {
    id: 'rdep-003',
    date: '2026-09-02',
    donorName: 'Ibu Hj. Rosdiana (RT 01)',
    weightKg: 30,
    notes: 'Infaq beras syukuran usaha katering',
    recordedBy: 'Marbot Firman',
  },
  {
    id: 'rdep-004',
    date: '2026-09-03',
    donorName: '', // Anonim / Hamba Allah
    weightKg: 100,
    notes: 'Setoran 4 karung @ 25kg titipan jamaah ba\'da Isya',
    recordedBy: 'H. Sahali (Bendahara)',
  },
  {
    id: 'rdep-005',
    date: '2026-09-05',
    donorName: 'Keluarga Bpk. H. Muh. Hasri',
    weightKg: 50,
    notes: 'Beras kemasan 5kg sebanyak 10 karung',
    recordedBy: 'Marbot Firman',
  },
];

export const INITIAL_RICE_WITHDRAWALS: RiceWithdrawalLog[] = [
  {
    id: 'rwth-001',
    date: '2026-08-29',
    estimatedWeightKg: 20,
    recordedBy: 'Marbot Firman',
    notes: 'Pengisian tabung dispenser ATM Beras serambi untuk kebutuhan harian dhuafa',
  },
  {
    id: 'rwth-002',
    date: '2026-08-31',
    estimatedWeightKg: 15,
    recordedBy: 'Marbot Firman',
    notes: 'Piket malam: jamaah lansia & musafir mengambil beras secukupnya',
  },
  {
    id: 'rwth-003',
    date: '2026-09-02',
    estimatedWeightKg: 15,
    recordedBy: 'Drs. Manai, M.M.',
    notes: 'Dispenser beras terisi penuh kembali untuk jamaah yang membutuhkan',
  },
  {
    id: 'rwth-004',
    date: '2026-09-04',
    estimatedWeightKg: 20,
    recordedBy: 'Marbot Firman',
    notes: 'Distribusi beras mandiri jamaah dhuafa jelang shalat Jumat',
  },
];
