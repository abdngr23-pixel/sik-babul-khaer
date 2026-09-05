export type AssetCategory =
  | 'PENDINGIN_UDARA'
  | 'ELEKTRONIK_AUDIO'
  | 'SARANA_IBADAH'
  | 'MESIN_LISTRIK'
  | 'PERLENGKAPAN_KANTOR';

export type AssetCondition = 'BAIK' | 'PERLU_PERBAIKAN' | 'RUSAK_BERAT';

export interface AssetCategoryInfo {
  code: AssetCategory;
  name: string;
  defaultCycleMonths: number;
}

export const ASSET_CATEGORIES: Record<AssetCategory, AssetCategoryInfo> = {
  PENDINGIN_UDARA: {
    code: 'PENDINGIN_UDARA',
    name: 'Pendingin Udara (AC)',
    defaultCycleMonths: 3, // Servis rutin per 3 bulan
  },
  ELEKTRONIK_AUDIO: {
    code: 'ELEKTRONIK_AUDIO',
    name: 'Sound System & Audio',
    defaultCycleMonths: 6, // Pengecekan mic, mixer, amplifier per 6 bulan
  },
  MESIN_LISTRIK: {
    code: 'MESIN_LISTRIK',
    name: 'Genset & Kelistrikan',
    defaultCycleMonths: 4, // Servis oli, aki & filter genset per 4 bulan
  },
  SARANA_IBADAH: {
    code: 'SARANA_IBADAH',
    name: 'Sarana Ibadah & Karpet',
    defaultCycleMonths: 6, // Cuci karpet & deep cleaning
  },
  PERLENGKAPAN_KANTOR: {
    code: 'PERLENGKAPAN_KANTOR',
    name: 'Peralatan Kantor & Sekretariat',
    defaultCycleMonths: 12,
  },
};

export interface AssetItem {
  id: string;
  code: string; // e.g. AST-AC-001
  name: string;
  category: AssetCategory;
  location: string; // e.g. "Ruang Utama Masjid", "Serambi", "Sekretariat"
  purchaseDate?: string;
  purchaseCost?: number;
  condition: AssetCondition;
  maintenanceCycleMonths: number; // in months
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  maintenanceNotes?: string;
  isMaintenanceDue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AssetStats {
  totalAssets: number;
  totalEstimatedValue: number;
  goodCount: number;
  needRepairCount: number;
  maintenanceDueCount: number;
}
