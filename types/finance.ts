export type TransactionType = 'INCOME' | 'EXPENSE';

export type FinanceCategory =
  | 'KAS_OPERASIONAL'
  | 'ZISWAF_ZAKAT'
  | 'ZISWAF_INFAQ'
  | 'SWADAYA_PHBI'
  | 'INFAQ_JUMAT';

export type PaymentMethod = 'TUNAI' | 'TRANSFER_BANK' | 'QRIS';

export interface FinanceCategoryInfo {
  code: FinanceCategory;
  name: string;
  description: string;
  badgeColor: string;
}

export const FINANCE_CATEGORIES: Record<FinanceCategory, FinanceCategoryInfo> = {
  KAS_OPERASIONAL: {
    code: 'KAS_OPERASIONAL',
    name: 'Kas Operasional Masjid',
    description: 'Biaya listrik PLN, air PDAM, kebersihan marbot, operasional rutin',
    badgeColor: 'blue',
  },
  SWADAYA_PHBI: {
    code: 'SWADAYA_PHBI',
    name: 'Dana Swadaya PHBI (Satu Pintu)',
    description: 'Penerimaan & belanja khusus kegiatan Hari Besar Islam (Maulid, Isra Mi\'raj, dll)',
    badgeColor: 'amber',
  },
  ZISWAF_ZAKAT: {
    code: 'ZISWAF_ZAKAT',
    name: 'Zakat Fitrah & Mal',
    description: 'Penerimaan & penyaluran zakat kepada mustahiq terdata',
    badgeColor: 'purple',
  },
  ZISWAF_INFAQ: {
    code: 'ZISWAF_INFAQ',
    name: 'Infaq & Sedekah Terikat',
    description: 'Infaq subuh, sedekah anak yatim, santunan sosial darurat',
    badgeColor: 'teal',
  },
  INFAQ_JUMAT: {
    code: 'INFAQ_JUMAT',
    name: 'Tromol / Kotak Amal Jumat',
    description: 'Perolehan rutin kotak amal shalat Jumat berjamaah',
    badgeColor: 'emerald',
  },
};

export interface FinanceTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: FinanceCategory;
  description: string;
  amount: number;
  receiptNumber?: string;
  payerOrPayee?: string;
  paymentMethod: PaymentMethod;
  balanceAfter: number;
  notes?: string;
  createdAt: string;
}

export interface FinanceSummary {
  totalBalance: number;
  operationalBalance: number;
  phbiBalance: number;
  ziswafBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}
