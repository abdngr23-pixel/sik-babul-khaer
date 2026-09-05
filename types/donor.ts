import { PaymentMethod } from './finance';

export type DonorCategory =
  | 'KAS_OPERASIONAL'
  | 'ZISWAF_INFAQ'
  | 'ZISWAF_ZAKAT'
  | 'SWADAYA_PHBI'
  | 'BEASISWA_YATIM';

export type DonorStatus = 'AKTIF' | 'NONAKTIF' | 'JEDA';

export interface DonorCategoryInfo {
  code: DonorCategory;
  name: string;
  description: string;
  badgeColor: string;
}

export const DONOR_CATEGORIES: Record<DonorCategory, DonorCategoryInfo> = {
  KAS_OPERASIONAL: {
    code: 'KAS_OPERASIONAL',
    name: 'Kas Operasional Masjid',
    description: 'Infaq rutin bulanan untuk listrik PLN, air PDAM, marbot, dan operasional',
    badgeColor: 'blue',
  },
  ZISWAF_INFAQ: {
    code: 'ZISWAF_INFAQ',
    name: 'Infaq & Sedekah Terikat',
    description: 'Infaq rutin untuk program dakwah, syiar, dan santunan sosial darurat',
    badgeColor: 'teal',
  },
  BEASISWA_YATIM: {
    code: 'BEASISWA_YATIM',
    name: 'Beasiswa Anak Yatim & Dhuafa',
    description: 'Santunan pendidikan dan kebutuhan dasar anak yatim warga Blok AE',
    badgeColor: 'purple',
  },
  SWADAYA_PHBI: {
    code: 'SWADAYA_PHBI',
    name: 'Dana Swadaya PHBI',
    description: 'Tabungan rutin untuk agenda Hari Besar Islam (Maulid, Isra Mi\'raj, 1 Muharram)',
    badgeColor: 'amber',
  },
  ZISWAF_ZAKAT: {
    code: 'ZISWAF_ZAKAT',
    name: 'Zakat Mal Rutin',
    description: 'Penyaluran zakat perniagaan/penghasilan bulanan',
    badgeColor: 'emerald',
  },
};

export interface DonorItem {
  id: string;
  donorName: string;
  phone: string;
  rt: 'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05' | 'Luar Blok AE';
  address: string;
  category: DonorCategory;
  commitmentAmount: number;
  billingDay: number; // 1 - 28
  paymentMethod: PaymentMethod;
  status: DonorStatus;
  lastPaymentDate?: string; // YYYY-MM-DD
  lastPaymentMonth?: string; // YYYY-MM
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DonorStats {
  totalDonors: number;
  activeDonors: number;
  monthlyPotential: number;
  currentMonthCollected: number;
  paidThisMonthCount: number;
  unpaidThisMonthCount: number;
}
