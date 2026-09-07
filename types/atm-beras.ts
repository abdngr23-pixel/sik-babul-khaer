export interface RiceDeposit {
  id: string;
  date: string;
  donorName?: string; // opsional, boleh kosong/anonim
  weightKg: number;
  notes?: string;
  recordedBy: string;
}

export interface RiceWithdrawalLog {
  id: string;
  date: string;
  estimatedWeightKg: number; // estimasi, bukan pencatatan per-individu
  recordedBy: string;
  notes?: string;
}

export interface RiceStockSnapshot {
  currentStockKg: number;
  lastRefillDate: string;
  lowStockThresholdKg: number;
}
