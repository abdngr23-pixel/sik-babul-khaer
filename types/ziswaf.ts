export type SSSCanStatus = 'TERDISTRIBUSI' | 'SIAP_TARIK' | 'DISETOR_KAS' | 'HILANG_RUSAK';

export type RecipientCategory =
  | 'MUSTAHIQ_DHUAFA'
  | 'LANSIA_DHUAFA'
  | 'YATIM_PIATU'
  | 'JANDA_DHUAFA'
  | 'FISABILILLAH'
  | 'IBNU_SABIL';

export type AidType =
  | 'PAKET_SEMBAKO'
  | 'BERAS_ZAKAT'
  | 'SANTUNAN_TUNAI'
  | 'BEASISWA_PENDIDIKAN'
  | 'BANTUAN_KESEHATAN'
  | 'TANGGAP_DARURAT';

export type AidStatus = 'TERVERIFIKASI' | 'DISALURKAN' | 'SELESAI';

export interface SSSCanItem {
  id: string;
  canCode: string; // e.g. "SSS-AE-01-01"
  rt: 'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05';
  houseNumber: string; // e.g. "Blok AE No. 03"
  holderName: string; // e.g. "Keluarga H. Muhammad Arifin"
  phone: string;
  distributionDate: string; // "YYYY-MM-DD"
  lastCollectionDate: string; // "YYYY-MM-DD"
  lastAmount: number; // Rp terakhir ditarik
  totalCollected: number; // Akumulasi total yang disetorkan
  status: SSSCanStatus;
  collectorOfficer: string; // Petugas penarik (Marbot / Koordinator RT)
  notes: string;
}

export interface SSSCollectionRecord {
  id: string;
  canId: string;
  canCode: string;
  collectionDate: string;
  amount: number;
  rt: 'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05';
  collector: string;
  depositedToCash: boolean;
  notes?: string;
}

export interface ZiswafAidItem {
  id: string;
  aidNumber: string; // e.g. "BS-2026/08/001"
  jamaahId?: string; // Link to Database Jamaah
  recipientName: string;
  recipientCategory: RecipientCategory;
  rt: 'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05';
  address: string;
  phone?: string;
  aidType: AidType;
  amountValue: number; // Estimasi nilai rupiah atau nominal tunai
  goodsDescription?: string; // e.g. "Beras 10 kg, Minyak 2L, Gula 2kg, Telur 1 Rak"
  distributionDate: string;
  disbursedBy: string; // Nama pengurus pelaksana
  status: AidStatus;
  receiptNumber?: string;
  notes: string;
}

export interface ZiswafSummaryKPI {
  totalSssCans: number;
  activeSssCans: number;
  readyToCollectCans: number;
  totalSssAccumulated: number;
  totalAidRecipients: number;
  totalAidDisbursedRp: number;
  totalRiceDisbursedKg: number;
}
