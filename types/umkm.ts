export type UmkmCategory = 'KULINER_HALAL' | 'BUSANA_MUSLIM' | 'HERBAL_KESEHATAN' | 'JASA_KREATIF' | 'SEMBAKO_KONTRAKAN';

export type QardhStatus = 'LANCAR' | 'LUNAS' | 'MENUNGGAK' | 'BEBAS_PINJAMAN';

export interface UmkmBusiness {
  id: string;
  name: string;
  category: UmkmCategory;
  ownerName: string;
  phone: string;
  rt: 'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05';
  address: string;
  description: string;
  products: string[];
  priceRange: string;
  bazarParticipant: boolean; // Rutin ikut Bazar Jumat Berkah
  qardhFacility: {
    hasLoan: boolean;
    loanAmount: number;
    disbursedDate?: string;
    remainingAmount: number;
    monthlyInstallment: number;
    status: QardhStatus;
  };
  verifiedByDkm: boolean;
}

export interface UmkmSummary {
  totalBusinesses: number;
  totalBazarParticipants: number;
  totalQardhActive: number;
  totalQardhDisbursed: number;
  repaymentRate: number; // Persentase kelancaran pengembalian (e.g. 98%)
}
