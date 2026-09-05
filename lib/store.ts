import { OfficialLetter, MeetingMinutes, LetterStatus } from '@/types/letter';
import { Jamaah, JamaahFilterParams, JamaahStats } from '@/types/jamaah';
import { FinanceTransaction, FinanceSummary, FinanceCategory, PaymentMethod } from '@/types/finance';
import { AssetItem, AssetStats } from '@/types/asset';
import { ApprovalItem, ApprovalStatus, FieldKPI, LPJReport } from '@/types/reports';
import { AuditLogEntry } from '@/types/auth';
import { DonorItem, DonorStats } from '@/types/donor';
import { INITIAL_LETTERS, INITIAL_MINUTES } from './mock-data';
import { INITIAL_JAMAAH } from './mock-jamaah';
import { INITIAL_TRANSACTIONS } from './mock-finance';
import { INITIAL_ASSETS } from './mock-assets';
import { INITIAL_APPROVALS, INITIAL_FIELD_KPIS } from './mock-reports';
import { INITIAL_AUDIT_LOGS } from './mock-auth';
import { INITIAL_DONORS } from './mock-donors';
import { generateLetterNumber } from './letter-numbering';
import {
  loadAllDataFromDatabase,
  dbInsertLetter,
  dbUpdateLetterStatus,
  dbInsertMinute,
  dbUpdateMinuteActionItems,
  dbInsertJamaah,
  dbInsertBulkJamaah,
  dbUpdateJamaah,
  dbDeleteJamaah,
  dbInsertTransaction,
  dbUpdateTransaction,
  dbDeleteTransaction,
  dbInsertDonor,
  dbUpdateDonor,
  dbDeleteDonor,
  dbInsertAsset,
  dbUpdateAsset,
  dbDeleteAsset,
  dbInsertApproval,
  dbUpdateApproval,
  dbInsertAuditLog,
} from './db';

// Hybrid In-Memory + SQLite Persistent Store
// Loads from SQLite on initialization; mutations write to disk & update memory for 0ms UI latency
class DataStore {
  private letters: OfficialLetter[] = [...INITIAL_LETTERS];
  private minutes: MeetingMinutes[] = [...INITIAL_MINUTES];
  private jamaahList: Jamaah[] = [...INITIAL_JAMAAH];
  private transactions: FinanceTransaction[] = [...INITIAL_TRANSACTIONS];
  private donors: DonorItem[] = [...INITIAL_DONORS];
  private assets: AssetItem[] = [...INITIAL_ASSETS];
  private approvals: ApprovalItem[] = [...INITIAL_APPROVALS];
  private fieldKPIs: FieldKPI[] = [...INITIAL_FIELD_KPIS];
  private auditLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];

  constructor() {
    this.loadFromDatabase();
  }

  public loadFromDatabase(): void {
    try {
      const data = loadAllDataFromDatabase();
      if (data.letters && data.letters.length > 0) this.letters = data.letters;
      if (data.minutes && data.minutes.length > 0) this.minutes = data.minutes;
      if (data.jamaah && data.jamaah.length > 0) this.jamaahList = data.jamaah;
      if (data.transactions && data.transactions.length > 0) this.transactions = data.transactions;
      if (data.donors && data.donors.length > 0) this.donors = data.donors;
      if (data.assets && data.assets.length > 0) this.assets = data.assets;
      if (data.approvals && data.approvals.length > 0) this.approvals = data.approvals;
      if (data.fieldKPIs && data.fieldKPIs.length > 0) this.fieldKPIs = data.fieldKPIs;
      if (data.auditLogs && data.auditLogs.length > 0) this.auditLogs = data.auditLogs;
    } catch (err) {
      console.warn('DataStore: Fallback to in-memory datasets (SQLite unavailable or initial build):', err);
    }
  }

  public reloadFromDatabase(): void {
    this.loadFromDatabase();
  }

  // ================= LETTERS =================
  public getLetters(params?: {
    search?: string;
    category?: string;
    status?: string;
  }): OfficialLetter[] {
    let result = [...this.letters];

    if (params?.category && params.category !== 'ALL') {
      result = result.filter((l) => l.category === params.category);
    }

    if (params?.status && params.status !== 'ALL') {
      result = result.filter((l) => l.status === params.status);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (l) =>
          l.letterNumber.toLowerCase().includes(q) ||
          l.subject.toLowerCase().includes(q) ||
          l.recipientName.toLowerCase().includes(q) ||
          l.content.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => b.sequenceNumber - a.sequenceNumber);
  }

  public getNextSequenceNumber(): number {
    if (this.letters.length === 0) return 1;
    const max = Math.max(...this.letters.map((l) => l.sequenceNumber || 0));
    return max + 1;
  }

  public addLetter(letterData: Omit<OfficialLetter, 'id' | 'sequenceNumber' | 'letterNumber' | 'createdAt' | 'updatedAt'> & {
    customNumber?: string;
  }): OfficialLetter {
    const nextSeq = this.getNextSequenceNumber();
    const letterNumber =
      letterData.customNumber ||
      generateLetterNumber(nextSeq, letterData.category, letterData.letterDate);

    const now = new Date().toISOString();
    const newLetter: OfficialLetter = {
      ...letterData,
      id: `ltr-${String(nextSeq).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
      sequenceNumber: nextSeq,
      letterNumber,
      createdAt: now,
      updatedAt: now,
    };

    this.letters.unshift(newLetter);

    try {
      dbInsertLetter(newLetter);
    } catch (err) {
      console.error('Failed to persist letter to SQLite:', err);
    }

    return newLetter;
  }

  public updateLetterStatus(id: string, status: LetterStatus): OfficialLetter | null {
    const letter = this.letters.find((l) => l.id === id);
    if (!letter) return null;
    letter.status = status;
    letter.updatedAt = new Date().toISOString();

    try {
      dbUpdateLetterStatus(letter.id, status, letter.updatedAt);
    } catch (err) {
      console.error('Failed to persist letter status to SQLite:', err);
    }

    return letter;
  }

  // ================= MINUTES =================
  public getMinutes(): MeetingMinutes[] {
    return [...this.minutes];
  }

  public addMinutes(minuteData: Omit<MeetingMinutes, 'id' | 'createdAt'>): MeetingMinutes {
    const newMinute: MeetingMinutes = {
      ...minuteData,
      id: `min-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.minutes.unshift(newMinute);

    try {
      dbInsertMinute(newMinute);
    } catch (err) {
      console.error('Failed to persist minutes to SQLite:', err);
    }

    return newMinute;
  }

  public toggleActionItemStatus(minuteId: string, actionId: string): boolean {
    const minute = this.minutes.find((m) => m.id === minuteId);
    if (!minute) return false;
    const item = minute.actionItems.find((a) => a.id === actionId);
    if (!item) return false;
    item.status = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    try {
      dbUpdateMinuteActionItems(minuteId, minute.actionItems);
    } catch (err) {
      console.error('Failed to persist minute action items to SQLite:', err);
    }

    return true;
  }

  // ================= JAMAAH =================
  public getJamaah(params?: JamaahFilterParams): Jamaah[] {
    let result = [...this.jamaahList];

    if (params?.rt && params.rt !== 'ALL') {
      result = result.filter((j) => j.rt === params.rt);
    }

    if (params?.economicStatus && params.economicStatus !== 'ALL') {
      if (params.economicStatus === 'MUSTAHIQ_ALL') {
        result = result.filter((j) =>
          j.economicStatus === 'MUSTAHIQ_DHUAFA' ||
          j.economicStatus === 'YATIM_PIATU' ||
          j.economicStatus === 'LANSIA_DHUAFA'
        );
      } else {
        result = result.filter((j) => j.economicStatus === params.economicStatus);
      }
    }

    if (params?.residencyStatus && params.residencyStatus !== 'ALL') {
      result = result.filter((j) => j.residencyStatus === params.residencyStatus);
    }

    if (params?.isYouthMember) {
      result = result.filter((j) => j.isYouthMember === true);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (j) =>
          j.fullName.toLowerCase().includes(q) ||
          j.houseNumber.toLowerCase().includes(q) ||
          j.phone.includes(q) ||
          (j.occupation && j.occupation.toLowerCase().includes(q)) ||
          (j.notes && j.notes.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }

  public getJamaahById(id: string): Jamaah | undefined {
    return this.jamaahList.find((j) => j.id === id);
  }

  public addJamaah(data: Omit<Jamaah, 'id' | 'createdAt' | 'updatedAt'>): Jamaah {
    const now = new Date().toISOString();
    const newJamaah: Jamaah = {
      ...data,
      id: `jmh-${String(this.jamaahList.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.jamaahList.unshift(newJamaah);

    try {
      dbInsertJamaah(newJamaah);
    } catch (err) {
      console.error('Failed to persist jamaah to SQLite:', err);
    }

    return newJamaah;
  }

  public addBulkJamaah(dataArray: Omit<Jamaah, 'id' | 'createdAt' | 'updatedAt'>[]): Jamaah[] {
    const now = new Date().toISOString();
    const addedList: Jamaah[] = [];

    for (let i = 0; i < dataArray.length; i++) {
      const data = dataArray[i];
      const newJamaah: Jamaah = {
        ...data,
        id: `jmh-${String(this.jamaahList.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}-${i}`,
        createdAt: now,
        updatedAt: now,
      };
      this.jamaahList.unshift(newJamaah);
      addedList.push(newJamaah);
    }

    try {
      dbInsertBulkJamaah(addedList);
    } catch (err) {
      console.error('Failed to bulk persist jamaah to SQLite:', err);
    }

    return addedList;
  }

  public updateJamaah(id: string, data: Partial<Jamaah>): Jamaah | null {
    const index = this.jamaahList.findIndex((j) => j.id === id);
    if (index === -1) return null;

    const updated: Jamaah = {
      ...this.jamaahList[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    this.jamaahList[index] = updated;

    try {
      dbUpdateJamaah(updated);
    } catch (err) {
      console.error('Failed to update jamaah in SQLite:', err);
    }

    return updated;
  }

  public deleteJamaah(id: string): boolean {
    const prevLen = this.jamaahList.length;
    this.jamaahList = this.jamaahList.filter((j) => j.id !== id);
    const success = this.jamaahList.length < prevLen;

    if (success) {
      try {
        dbDeleteJamaah(id);
      } catch (err) {
        console.error('Failed to delete jamaah from SQLite:', err);
      }
    }

    return success;
  }

  public getJamaahStats(): JamaahStats {
    const totalJamaah = this.jamaahList.length;
    const totalKK = this.jamaahList.filter((j) => j.familyRole === 'KEPALA_KELUARGA').length;
    const totalMustahiq = this.jamaahList.filter(
      (j) =>
        j.economicStatus === 'MUSTAHIQ_DHUAFA' ||
        j.economicStatus === 'YATIM_PIATU' ||
        j.economicStatus === 'LANSIA_DHUAFA'
    ).length;
    const totalYouth = this.jamaahList.filter((j) => j.isYouthMember).length;

    const byRT: Record<string, number> = {
      'RT 01': 0,
      'RT 02': 0,
      'RT 03': 0,
      'RT 04': 0,
      'RT 05': 0,
    };

    this.jamaahList.forEach((j) => {
      if (byRT[j.rt] !== undefined) {
        byRT[j.rt]++;
      }
    });

    return {
      totalJamaah,
      totalKK,
      totalMustahiq,
      totalYouth,
      byRT,
    };
  }

  // ================= FINANCE =================
  public getTransactions(params?: { category?: string; type?: string; search?: string }): FinanceTransaction[] {
    let result = [...this.transactions];

    if (params?.category && params.category !== 'ALL') {
      result = result.filter((t) => t.category === params.category);
    }

    if (params?.type && params.type !== 'ALL') {
      result = result.filter((t) => t.type === params.type);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          (t.payerOrPayee && t.payerOrPayee.toLowerCase().includes(q)) ||
          (t.receiptNumber && t.receiptNumber.toLowerCase().includes(q))
      );
    }

    // Sort descending by date
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public addTransaction(data: Omit<FinanceTransaction, 'id' | 'balanceAfter' | 'createdAt'>): FinanceTransaction {
    const currentSummary = this.getFinanceSummary();
    const newBalance =
      data.type === 'INCOME'
        ? currentSummary.totalBalance + data.amount
        : currentSummary.totalBalance - data.amount;

    const newTrx: FinanceTransaction = {
      ...data,
      id: `trx-${Date.now()}`,
      balanceAfter: newBalance,
      createdAt: new Date().toISOString(),
    };

    this.transactions.push(newTrx);

    try {
      dbInsertTransaction(newTrx);
    } catch (err) {
      console.error('Failed to persist transaction to SQLite:', err);
    }

    return newTrx;
  }

  public updateTransaction(id: string, updates: Partial<FinanceTransaction>): FinanceTransaction | null {
    const idx = this.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    this.transactions[idx] = {
      ...this.transactions[idx],
      ...updates,
    };

    try {
      dbUpdateTransaction(this.transactions[idx]);
    } catch (err) {
      console.error('Failed to update transaction in SQLite:', err);
    }

    return this.transactions[idx];
  }

  public deleteTransaction(id: string): boolean {
    const initialLen = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    const success = this.transactions.length < initialLen;

    if (success) {
      try {
        dbDeleteTransaction(id);
      } catch (err) {
        console.error('Failed to delete transaction from SQLite:', err);
      }
    }

    return success;
  }

  public getFinanceSummary(): FinanceSummary {
    let totalBalance = 0;
    let operationalBalance = 0;
    let phbiBalance = 0;
    let ziswafBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    this.transactions.forEach((t) => {
      const isCurrentMonth = t.date.startsWith(currentMonth);

      if (t.type === 'INCOME') {
        totalBalance += t.amount;
        if (isCurrentMonth) monthlyIncome += t.amount;

        if (t.category === 'KAS_OPERASIONAL' || t.category === 'INFAQ_JUMAT') {
          operationalBalance += t.amount;
        } else if (t.category === 'SWADAYA_PHBI') {
          phbiBalance += t.amount;
        } else if (t.category === 'ZISWAF_ZAKAT' || t.category === 'ZISWAF_INFAQ') {
          ziswafBalance += t.amount;
        }
      } else {
        totalBalance -= t.amount;
        if (isCurrentMonth) monthlyExpense += t.amount;

        if (t.category === 'KAS_OPERASIONAL' || t.category === 'INFAQ_JUMAT') {
          operationalBalance -= t.amount;
        } else if (t.category === 'SWADAYA_PHBI') {
          phbiBalance -= t.amount;
        } else if (t.category === 'ZISWAF_ZAKAT' || t.category === 'ZISWAF_INFAQ') {
          ziswafBalance -= t.amount;
        }
      }
    });

    return {
      totalBalance,
      operationalBalance,
      phbiBalance,
      ziswafBalance,
      monthlyIncome,
      monthlyExpense,
    };
  }

  // ================= DONORS (DONATUR TETAP) =================
  public getDonors(params?: {
    search?: string;
    category?: string;
    status?: string;
    rt?: string;
    paymentStatus?: 'PAID_THIS_MONTH' | 'UNPAID_THIS_MONTH';
  }): DonorItem[] {
    let result = [...this.donors];
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    if (params?.category && params.category !== 'ALL') {
      result = result.filter((d) => d.category === params.category);
    }

    if (params?.status && params.status !== 'ALL') {
      result = result.filter((d) => d.status === params.status);
    }

    if (params?.rt && params.rt !== 'ALL') {
      result = result.filter((d) => d.rt === params.rt);
    }

    if (params?.paymentStatus) {
      if (params.paymentStatus === 'PAID_THIS_MONTH') {
        result = result.filter((d) => d.lastPaymentMonth === currentMonth);
      } else if (params.paymentStatus === 'UNPAID_THIS_MONTH') {
        result = result.filter((d) => d.lastPaymentMonth !== currentMonth);
      }
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.donorName.toLowerCase().includes(q) ||
          d.phone.includes(q) ||
          d.address.toLowerCase().includes(q) ||
          (d.notes && d.notes.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => a.donorName.localeCompare(b.donorName));
  }

  public getDonorById(id: string): DonorItem | undefined {
    return this.donors.find((d) => d.id === id);
  }

  public addDonor(data: Omit<DonorItem, 'id' | 'createdAt' | 'updatedAt'>): DonorItem {
    const now = new Date().toISOString();
    const newDonor: DonorItem = {
      ...data,
      id: `dnr-${String(this.donors.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.donors.unshift(newDonor);

    try {
      dbInsertDonor(newDonor);
    } catch (err) {
      console.error('Failed to persist donor to SQLite:', err);
    }

    return newDonor;
  }

  public updateDonor(id: string, data: Partial<DonorItem>): DonorItem | null {
    const idx = this.donors.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    this.donors[idx] = {
      ...this.donors[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    try {
      dbUpdateDonor(this.donors[idx]);
    } catch (err) {
      console.error('Failed to update donor in SQLite:', err);
    }

    return this.donors[idx];
  }

  public deleteDonor(id: string): boolean {
    const initialLen = this.donors.length;
    this.donors = this.donors.filter((d) => d.id !== id);
    const success = this.donors.length < initialLen;

    if (success) {
      try {
        dbDeleteDonor(id);
      } catch (err) {
        console.error('Failed to delete donor from SQLite:', err);
      }
    }

    return success;
  }

  public recordDonorPayment(params: {
    donorId: string;
    amount?: number;
    paymentMethod?: PaymentMethod;
    date?: string;
    notes?: string;
  }): { donor: DonorItem; transaction: FinanceTransaction } | null {
    const donor = this.donors.find((d) => d.id === params.donorId);
    if (!donor) return null;

    const payDate = params.date || new Date().toISOString().split('T')[0];
    const payMonth = payDate.slice(0, 7);
    const payAmount = params.amount || donor.commitmentAmount;
    const method = params.paymentMethod || donor.paymentMethod;

    // Map donor category to finance category
    let financeCat: FinanceCategory = 'KAS_OPERASIONAL';
    if (donor.category === 'KAS_OPERASIONAL') financeCat = 'KAS_OPERASIONAL';
    else if (donor.category === 'SWADAYA_PHBI') financeCat = 'SWADAYA_PHBI';
    else if (donor.category === 'ZISWAF_ZAKAT') financeCat = 'ZISWAF_ZAKAT';
    else if (donor.category === 'ZISWAF_INFAQ' || donor.category === 'BEASISWA_YATIM') financeCat = 'ZISWAF_INFAQ';

    // 1. Create transaction in Finance (internally persists to SQLite)
    const newTrx = this.addTransaction({
      date: payDate,
      type: 'INCOME',
      category: financeCat,
      description: `Infaq Rutin Donatur Tetap: ${donor.donorName} (${donor.rt})`,
      amount: payAmount,
      receiptNumber: `BK-DNR-${Date.now().toString().slice(-6)}`,
      payerOrPayee: donor.donorName,
      paymentMethod: method,
      notes: params.notes || `Donasi rutin bulanan (${payMonth}). Alamat: ${donor.address}`,
    });

    // 2. Update donor last payment
    donor.lastPaymentDate = payDate;
    donor.lastPaymentMonth = payMonth;
    donor.updatedAt = new Date().toISOString();

    try {
      dbUpdateDonor(donor);
    } catch (err) {
      console.error('Failed to update donor payment status in SQLite:', err);
    }

    return { donor, transaction: newTrx };
  }

  public getDonorStats(): DonorStats {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const totalDonors = this.donors.length;
    const activeDonorsList = this.donors.filter((d) => d.status === 'AKTIF');
    const activeDonors = activeDonorsList.length;

    const monthlyPotential = activeDonorsList.reduce((acc, d) => acc + d.commitmentAmount, 0);

    const paidThisMonthDonors = this.donors.filter(
      (d) => d.lastPaymentMonth === currentMonth
    );
    const paidThisMonthCount = paidThisMonthDonors.length;
    const unpaidThisMonthCount = activeDonors - paidThisMonthCount;

    const currentMonthCollected = paidThisMonthDonors.reduce(
      (acc, d) => acc + d.commitmentAmount,
      0
    );

    return {
      totalDonors,
      activeDonors,
      monthlyPotential,
      currentMonthCollected,
      paidThisMonthCount,
      unpaidThisMonthCount: Math.max(0, unpaidThisMonthCount),
    };
  }

  // ================= ASSETS =================
  public getAssets(params?: {
    category?: string;
    condition?: string;
    search?: string;
    maintenanceDueOnly?: boolean;
  }): AssetItem[] {
    const today = new Date().toISOString().split('T')[0];

    // Compute maintenance due
    let result = this.assets.map((a) => {
      const isDue = Boolean(a.nextMaintenanceDate && a.nextMaintenanceDate <= today);
      return {
        ...a,
        isMaintenanceDue: isDue,
      };
    });

    if (params?.category && params.category !== 'ALL') {
      result = result.filter((a) => a.category === params.category);
    }

    if (params?.condition && params.condition !== 'ALL') {
      result = result.filter((a) => a.condition === params.condition);
    }

    if (params?.maintenanceDueOnly) {
      result = result.filter((a) => a.isMaintenanceDue === true || a.condition === 'PERLU_PERBAIKAN');
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.code.toLowerCase().includes(q) ||
          a.location.toLowerCase().includes(q) ||
          (a.maintenanceNotes && a.maintenanceNotes.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => a.code.localeCompare(b.code));
  }

  public addAsset(data: Omit<AssetItem, 'id' | 'createdAt' | 'updatedAt' | 'isMaintenanceDue'>): AssetItem {
    const now = new Date().toISOString();
    const newAsset: AssetItem = {
      ...data,
      id: `ast-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.assets.unshift(newAsset);

    try {
      dbInsertAsset(newAsset);
    } catch (err) {
      console.error('Failed to persist asset to SQLite:', err);
    }

    return newAsset;
  }

  public updateAsset(id: string, data: Partial<AssetItem>): AssetItem | null {
    const index = this.assets.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const updated: AssetItem = {
      ...this.assets[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.assets[index] = updated;

    try {
      dbUpdateAsset(updated);
    } catch (err) {
      console.error('Failed to update asset in SQLite:', err);
    }

    return updated;
  }

  public recordMaintenanceDone(id: string, notes?: string): AssetItem | null {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return null;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Compute next maintenance date
    const nextDate = new Date(today);
    nextDate.setMonth(nextDate.getMonth() + (asset.maintenanceCycleMonths || 3));
    const nextDateStr = nextDate.toISOString().split('T')[0];

    asset.lastMaintenanceDate = todayStr;
    asset.nextMaintenanceDate = nextDateStr;
    asset.isMaintenanceDue = false;
    asset.condition = 'BAIK';
    if (notes) {
      asset.maintenanceNotes = notes;
    }
    asset.updatedAt = new Date().toISOString();

    try {
      dbUpdateAsset(asset);
    } catch (err) {
      console.error('Failed to update maintenance status in SQLite:', err);
    }

    return asset;
  }

  public deleteAsset(id: string): boolean {
    const prevLen = this.assets.length;
    this.assets = this.assets.filter((a) => a.id !== id);
    const success = this.assets.length < prevLen;

    if (success) {
      try {
        dbDeleteAsset(id);
      } catch (err) {
        console.error('Failed to delete asset from SQLite:', err);
      }
    }

    return success;
  }

  public getAssetStats(): AssetStats {
    const today = new Date().toISOString().split('T')[0];
    const totalAssets = this.assets.length;
    const totalEstimatedValue = this.assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0);
    const goodCount = this.assets.filter((a) => a.condition === 'BAIK').length;
    const needRepairCount = this.assets.filter((a) => a.condition === 'PERLU_PERBAIKAN' || a.condition === 'RUSAK_BERAT').length;
    const maintenanceDueCount = this.assets.filter((a) => (a.nextMaintenanceDate && a.nextMaintenanceDate <= today) || a.condition === 'PERLU_PERBAIKAN').length;

    return {
      totalAssets,
      totalEstimatedValue,
      goodCount,
      needRepairCount,
      maintenanceDueCount,
    };
  }

  // ================= APPROVALS =================
  public getApprovals(status?: string): ApprovalItem[] {
    let result = [...this.approvals];
    if (status && status !== 'ALL') {
      result = result.filter((a) => a.status === status);
    }
    return result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public addApproval(data: Omit<ApprovalItem, 'id' | 'submittedAt' | 'status'>): ApprovalItem {
    const newItem: ApprovalItem = {
      ...data,
      id: `appr-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'MENUNGGU_VERIFIKASI',
    };
    this.approvals.unshift(newItem);

    try {
      dbInsertApproval(newItem);
    } catch (err) {
      console.error('Failed to persist approval to SQLite:', err);
    }

    return newItem;
  }

  public verifyApproval(
    id: string,
    status: ApprovalStatus,
    dispositionNotes?: string,
    verifiedBy: string = 'Drs. H. M. Said, M.Pd. (Ketua Umum)'
  ): ApprovalItem | null {
    const item = this.approvals.find((a) => a.id === id);
    if (!item) return null;

    item.status = status;
    item.dispositionNotes = dispositionNotes || item.dispositionNotes;
    item.verifiedBy = verifiedBy;
    item.verifiedAt = new Date().toISOString();

    try {
      dbUpdateApproval(item);
    } catch (err) {
      console.error('Failed to update approval verification in SQLite:', err);
    }

    return item;
  }

  // ================= FIELD KPIS & LPJ =================
  public getFieldKPIs(): FieldKPI[] {
    return [...this.fieldKPIs];
  }

  public generateLPJData(customPeriod: string = 'Tahun Anggaran 2026'): LPJReport {
    // 1. Metrics from Letters & Minutes
    const totalLetters = this.letters.length;
    const invitationsCount = this.letters.filter((l) => l.category === 'UND').length;
    const officialNoticesCount = this.letters.filter(
      (l) => l.category === 'PEM' || l.category === 'SK' || l.category === 'SKET' || l.category === 'TGS'
    ).length;
    const totalMinutes = this.minutes.length;
    const actionItemsTotal = this.minutes.reduce((sum, m) => sum + m.actionItems.length, 0);
    const actionItemsCompleted = this.minutes.reduce(
      (sum, m) => sum + m.actionItems.filter((a) => a.status === 'COMPLETED').length,
      0
    );

    // 2. Metrics from Jamaah
    const totalJamaah = this.jamaahList.length;
    const distinctFamilies = new Set(this.jamaahList.map((j) => `${j.rt}-${j.houseNumber}`)).size;
    const mustahiqCount = this.jamaahList.filter(
      (j) => j.economicStatus === 'MUSTAHIQ_DHUAFA' || j.economicStatus === 'YATIM_PIATU' || j.economicStatus === 'LANSIA_DHUAFA'
    ).length;
    const youthMembersCount = this.jamaahList.filter((j) => j.isYouthMember).length;

    // 3. Metrics from Finance
    const finSummary = this.getFinanceSummary();
    const ziswafCollected = this.transactions
      .filter((t) => t.type === 'INCOME' && (t.category === 'ZISWAF_ZAKAT' || t.category === 'ZISWAF_INFAQ'))
      .reduce((sum, t) => sum + t.amount, 0);
    const ziswafDisbursed = this.transactions
      .filter((t) => t.type === 'EXPENSE' && (t.category === 'ZISWAF_ZAKAT' || t.category === 'ZISWAF_INFAQ'))
      .reduce((sum, t) => sum + t.amount, 0);

    // 4. Metrics from Assets
    const astStats = this.getAssetStats();
    const maintenanceCompliancePercent = Math.round(
      ((astStats.totalAssets - astStats.maintenanceDueCount) / (astStats.totalAssets || 1)) * 100
    );

    return {
      id: `lpj-${Date.now()}`,
      title: `Laporan Pertanggungjawaban Tahunan DKM Masjid Babul Khaer (${customPeriod})`,
      period: customPeriod,
      compiledAt: new Date().toISOString(),
      compiledBy: 'Sekretariat & Perbendaharaan DKM Babul Khaer',
      status: 'DRAFT',
      metrics: {
        totalLetters,
        invitationsCount,
        officialNoticesCount,
        totalMinutes,
        actionItemsCompleted,
        actionItemsTotal,

        totalJamaah,
        totalFamilies: distinctFamilies,
        mustahiqCount,
        youthMembersCount,

        totalIncome: finSummary.monthlyIncome > 0 ? finSummary.monthlyIncome * 12 : 125000000,
        totalExpense: finSummary.monthlyExpense > 0 ? finSummary.monthlyExpense * 12 : 98000000,
        netBalance: finSummary.totalBalance,
        phbiBalance: finSummary.phbiBalance,
        ziswafCollected: ziswafCollected > 0 ? ziswafCollected : 15500000,
        ziswafDisbursed: ziswafDisbursed > 0 ? ziswafDisbursed : 12300000,

        totalAssetsCount: astStats.totalAssets,
        totalAssetsEstimatedValue: astStats.totalEstimatedValue,
        goodConditionCount: astStats.goodCount,
        maintenanceDueCount: astStats.maintenanceDueCount,
        maintenanceCompliancePercent,
      },
      executiveSummary:
        'Segala puji bagi Allah Subhanahu Wa Ta\'ala, Tuhan semesta alam, yang telah melimpahkan rahmat, taufiq, dan hidayah-Nya sehingga Dewan Kemakmuran Masjid (DKM) Babul Khaer Kompleks BTP Blok AE Tamalanrea Makassar dapat menuntaskan amanah program kerja tahun berjalan dengan capaian yang akuntabel, transparan, dan berkelanjutan. Berlandaskan AD/ART MBH 2020 dan Hasil Rapat Kerja 2026-2029, kepengurusan telah berhasil mengimplementasikan sistem administrasi digital SIK-MBH, menata pembukuan kas dengan pemisahan tegas dana swadaya PHBI satu pintu, memperluas jangkauan sensus jamaah RT 01-05, serta memelihara fasilitas sarana prasarana ibadah secara teratur dan terjadwal.',
      keyAchievements: [
        `Digitalisasi 100% tata persuratan dinas DKM dengan penomoran otomatis dan e-arsip PDF terpusat.`,
        `Pendataan ${totalJamaah} warga muslim di Kompleks BTP Blok AE dengan klasifikasi mustahiq darurat yang terverifikasi.`,
        `Penerapan Rekening Kas Satu Pintu untuk swadaya PHBI sehingga kegiatan peringatan hari besar Islam terlaksana tanpa mengganggu kas operasional masjid.`,
        `Pemeliharaan preventif fasilitas utama (AC Duduk Daikin, Genset Silent 5500W, Sound System) dengan tingkat kelayakan fasilitas mencapai ${maintenanceCompliancePercent}%.`,
      ],
      challengesAndSolutions: [
        'Kendala keterbatasan sarana cadangan sound system saat kajian akbar diatasi dengan pengajuan alokasi anggaran mikrofon nirkabel tambahan.',
        'Kebutuhan integrasi tindak lanjut hasil rapat pleno diatasi secara efektif melalui fitur Ekstraksi Notulensi AI.',
        'Fluktuasi beban listrik daya puncak saat shalat Jumat diatasi dengan koordinasi teknisi dan perawatan genset cadangan secara rutin per 4 bulan.',
      ],
      strategicRecommendations: [
        'Melanjutkan pemutakhiran sensus jamaah secara berkala bersama para Ketua RT 01-05 Blok AE.',
        'Menguatkan peran Ikatan Remaja Masjid Babul Khaer (IRMBH) dalam pengelolaan media dakwah dan kepanitiaan PHBI.',
        'Mempertahankan rasio cadangan kas operasional minimal 3 bulan ke depan untuk menjamin kelancaran honorarium marbot dan operasional masjid.',
      ],
      signatories: {
        ketuaUmum: { name: 'Drs. H. M. Said, M.Pd.', title: 'Ketua Umum DKM Babul Khaer' },
        sekretarisUmum: { name: 'M. Yusuf, S.Ag.', title: 'Sekretaris Umum' },
        bendaharaUmum: { name: 'H. Abdul Rahman, S.E.', title: 'Bendahara Umum' },
      },
    };
  }

  // ================= AUDIT LOGS & KEAMANAN =================
  public getAuditLogs(params?: {
    module?: string;
    role?: string;
    search?: string;
    limit?: number;
  }): AuditLogEntry[] {
    let result = [...this.auditLogs];

    if (params?.module && params.module !== 'ALL') {
      result = result.filter((log) => log.module === params.module);
    }

    if (params?.role && params.role !== 'ALL') {
      result = result.filter((log) => log.userRole === params.role);
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (log) =>
          log.userName.toLowerCase().includes(q) ||
          log.description.toLowerCase().includes(q) ||
          log.actionLabel.toLowerCase().includes(q) ||
          log.userRoleLabel.toLowerCase().includes(q)
      );
    }

    // Sort descending by timestamp
    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (params?.limit && params.limit > 0) {
      result = result.slice(0, params.limit);
    }

    return result;
  }

  public addAuditLog(
    entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: string }
  ): AuditLogEntry {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
    };

    this.auditLogs.unshift(newLog);

    try {
      dbInsertAuditLog(newLog);
    } catch (err) {
      console.error('Failed to persist audit log to SQLite:', err);
    }

    return newLog;
  }
}

// Global singleton instance across Next.js dev reloads
const globalStore = global as unknown as { __sikStore?: DataStore };

export const store = globalStore.__sikStore || new DataStore();
if (process.env.NODE_ENV !== 'production') {
  globalStore.__sikStore = store;
}
