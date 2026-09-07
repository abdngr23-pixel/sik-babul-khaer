export type LPJStatus = 'DRAFT' | 'APPROVED' | 'PUBLISHED';

export interface LPJReport {
  id: string;
  title: string;
  period: string; // e.g. "Tahun Anggaran 2026"
  divisionScope?: 'ALL' | FieldArea;
  executiveSummary: string;
  compiledAt: string;
  compiledBy: string;
  status: LPJStatus;

  // Agregasi Realisasi Lintas Modul
  metrics: {
    // Bidang 1: Kesekretariatan
    totalLetters: number;
    invitationsCount: number;
    officialNoticesCount: number;
    totalMinutes: number;
    actionItemsCompleted: number;
    actionItemsTotal: number;

    // Bidang 2: Jamaah & Kemasjidan
    totalJamaah: number;
    totalFamilies: number;
    mustahiqCount: number;
    youthMembersCount: number;

    // Bidang 3: Keuangan & ZISWAF
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    phbiBalance: number; // Swadaya satu pintu
    ziswafCollected: number;
    ziswafDisbursed: number;

    // Bidang 4: Sarpras & Fasilitas Fisik
    totalAssetsCount: number;
    totalAssetsEstimatedValue: number;
    goodConditionCount: number;
    maintenanceDueCount: number;
    maintenanceCompliancePercent: number;
  };

  // Narasi Tematik
  keyAchievements: string[];
  challengesAndSolutions: string[];
  strategicRecommendations: string[];
  signatories: {
    ketuaUmum: { name: string; title: string };
    sekretarisUmum: { name: string; title: string };
    bendaharaUmum: { name: string; title: string };
  };
}

export type FieldArea =
  | 'KESEKRETARIATAN'
  | 'KEMASJIDAN_JAMAAH'
  | 'KEUANGAN_PERBENDAHARAAN'
  | 'SARANA_PRASARANA';

export interface FieldKPIIndicator {
  label: string;
  current: string | number;
  target: string | number;
  percent: number;
  unit: string;
}

export interface FieldKPI {
  field: FieldArea;
  title: string;
  leaderName: string;
  score: number; // 0 - 100
  status: 'SANGAT_BAIK' | 'BAIK' | 'CUKUP' | 'PERLU_PERHATIAN';
  summary: string;
  indicators: FieldKPIIndicator[];
  keyNotes: string[];
}

export type ApprovalType =
  | 'SURAT_KELUAR'
  | 'PENCAIRAN_DANA'
  | 'PENGADAAN_SARPRAS'
  | 'DRAF_LPJ'
  | 'USULAN_PROGRAM';


export type ApprovalStatus =
  | 'MENUNGGU_VERIFIKASI'
  | 'DISETUJUI'
  | 'PERLU_REVISI';

export interface ApprovalItem {
  id: string;
  type: ApprovalType;
  title: string;
  referenceNumber?: string;
  category: string;
  submittedBy: string;
  submittedRole: string;
  submittedAt: string;
  amount?: number;
  description: string;
  status: ApprovalStatus;
  dispositionNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}
