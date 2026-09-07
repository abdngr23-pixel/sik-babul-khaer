export type ProjectCategory =
  | 'RENOVASI'
  | 'PEMBANGUNAN_BARU'
  | 'PERBAIKAN_INFRASTRUKTUR'
  | 'PENGADAAN_SARPRAS';

export type ProjectStatus =
  | 'PERENCANAAN'
  | 'TENDER_VENDOR'
  | 'DALAM_PENGERJAAN'
  | 'SELESAI'
  | 'TERTUNDA';

export type ProjectUrgency = 'MENDESAK' | 'TINGGI' | 'SEDANG';

export interface ProjectMilestone {
  id: string;
  title: string;
  isDone: boolean;
  targetDate?: string;
}

export interface PhysicalProjectItem {
  id: string;
  code: string; // e.g. PRJ-2026-001
  title: string;
  category: ProjectCategory;
  allocatedBudget: number; // Pagu Anggaran Raker (Rp)
  realizedBudget: number; // Realisasi Dana Terserap (Rp)
  progressPercentage: number; // 0 - 100%
  status: ProjectStatus;
  urgencyLevel: ProjectUrgency;
  responsiblePerson: string;
  contractorVendor?: string;
  startDate: string;
  targetEndDate: string;
  description: string;
  milestones: ProjectMilestone[];
  photos?: string[];
  notes?: string;
  updatedAt: string;
}
