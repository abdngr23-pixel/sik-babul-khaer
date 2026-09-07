export type KomisiType = 'KOMISI_I' | 'KOMISI_II' | 'SOSIAL_HUMAS' | 'PEMBERDAYAAN';

export type SeksiType =
  | 'PERIBADATAN_DAKWAH'
  | 'PENDIDIKAN_REMAJA'
  | 'PEMBANGUNAN'
  | 'SARANA_PRASARANA'
  | 'HUMAS_SOSIAL'
  | 'ZISWAF_MUSTAHIQ'
  | 'PEREMPUAN_TPA'
  | 'KEAMANAN_LINGKUNGAN';

export type ExecutionStatus = 'BELUM_MULAI' | 'BERJALAN' | 'SELESAI' | 'TERLAMBAT';

export type RakerApprovalStatus = 'DISETUJUI' | 'DIREVISI' | 'DITUNDA';

export type TrafficLightIndicator = 'HIJAU' | 'KUNING' | 'MERAH';

export interface ProgramKerjaItem {
  id: string;
  code: string;
  komisi: KomisiType;
  komisiLabel: string;
  seksiId: SeksiType;
  seksiName: string;
  title: string;
  description: string;
  pic: string;
  picPhone?: string;
  allocatedBudget: number;
  targetTimeline: string;
  targetDate: string; // YYYY-MM-DD
  rakerStatus: RakerApprovalStatus;
  executionStatus: ExecutionStatus;
  progressPercent: number; // 0 - 100
  trafficLight: TrafficLightIndicator;
  lastUpdate: string;
  notes: string;
  budgetProgramId?: string; // Links to RakerBudgetItem.id
}

export interface ProgramKerjaSummary {
  totalPrograms: number;
  completedCount: number;
  inProgressCount: number;
  notStartedCount: number;
  delayedCount: number;
  greenCount: number;
  yellowCount: number;
  redCount: number;
  totalAllocatedBudget: number;
  totalDisbursedBudget: number;
  overallProgressPercent: number;
}
