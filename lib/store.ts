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
import {
  isTursoConfigured,
  getTursoClient,
  tursoLoadAllData,
  tursoInsertLetter,
  tursoUpdateLetterStatus,
  tursoInsertMinute,
  tursoUpdateMinuteActionItems,
  tursoInsertJamaah,
  tursoInsertBulkJamaah,
  tursoUpdateJamaah,
  tursoDeleteJamaah,
  tursoInsertTransaction,
  tursoUpdateTransaction,
  tursoDeleteTransaction,
  tursoInsertDonor,
  tursoUpdateDonor,
  tursoDeleteDonor,
  tursoInsertAsset,
  tursoUpdateAsset,
  tursoDeleteAsset,
  tursoInsertApproval,
  tursoUpdateApproval,
  tursoInsertAuditLog,
} from './turso';

// Dual-Engine Persistent Store:
// 1. If TURSO_DATABASE_URL is set -> uses Turso Cloud LibSQL (permanent across Vercel serverless cold starts)
// 2. If TURSO_DATABASE_URL is NOT set -> uses native node:sqlite (local data/sik_mbh.sqlite or /tmp)
// Both engines utilize an in-memory TTL write-through cache for instant UI rendering.
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

  private lastSyncedAt = 0;
  private syncPromise: Promise<void> | null = null;

  constructor() {
    this.loadFromLocalDatabase();
    if (isTursoConfigured()) {
      this.sync(true).catch(() => {});
    }
  }

  public loadFromLocalDatabase(): void {
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
      console.warn('DataStore: Fallback to initial seed (local SQLite not yet ready):', err);
    }
  }

  public async sync(force = false): Promise<void> {
    if (!isTursoConfigured()) {
      if (force) {
        this.loadFromLocalDatabase();
      }
      return;
    }

    const now = Date.now();
    // Cache for 3000ms unless forced
    if (!force && now - this.lastSyncedAt < 3000) {
      return;
    }

    if (this.syncPromise) {
      return this.syncPromise;
    }

    this.syncPromise = (async () => {
      try {
        const client = getTursoClient();
        if (client) {
          const data = await tursoLoadAllData(client);
          if (data.letters) this.letters = data.letters;
          if (data.minutes) this.minutes = data.minutes;
          if (data.jamaah) this.jamaahList = data.jamaah;
          if (data.transactions) this.transactions = data.transactions;
          if (data.donors) this.donors = data.donors;
          if (data.assets) this.assets = data.assets;
          if (data.approvals) this.approvals = data.approvals;
          if (data.fieldKPIs) this.fieldKPIs = data.fieldKPIs;
          if (data.auditLogs) this.auditLogs = data.auditLogs;
          this.lastSyncedAt = Date.now();
        }
      } catch (err) {
        console.error('DataStore: Turso Cloud sync error:', err);
      } finally {
        this.syncPromise = null;
      }
    })();

    return this.syncPromise;
  }

  public async reloadFromDatabase(): Promise<void> {
    if (isTursoConfigured()) {
      await this.sync(true);
    } else {
      this.loadFromLocalDatabase();
    }
  }

  // ================= LETTERS =================
  public async getLetters(params?: {
    search?: string;
    category?: string;
    status?: string;
  }): Promise<OfficialLetter[]> {
    await this.sync();
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

  public async getNextSequenceNumber(): Promise<number> {
    await this.sync();
    if (this.letters.length === 0) return 1;
    const max = Math.max(...this.letters.map((l) => l.sequenceNumber || 0));
    return max + 1;
  }

  public async addLetter(letterData: Omit<OfficialLetter, 'id' | 'sequenceNumber' | 'letterNumber' | 'createdAt' | 'updatedAt'> & {
    customNumber?: string;
  }): Promise<OfficialLetter> {
    await this.sync();
    const nextSeq = await this.getNextSequenceNumber();
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

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoInsertLetter(client, newLetter);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to persist letter to Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbInsertLetter(newLetter);
      } catch (err) {
        console.error('Failed to persist letter to SQLite:', err);
      }
    }

    return newLetter;
  }

  public async updateLetterStatus(id: string, status: LetterStatus): Promise<OfficialLetter | null> {
    await this.sync();
    const letter = this.letters.find((l) => l.id === id);
    if (!letter) return null;
    letter.status = status;
    letter.updatedAt = new Date().toISOString();

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoUpdateLetterStatus(client, letter.id, status, letter.updatedAt);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to update letter status in Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbUpdateLetterStatus(letter.id, status, letter.updatedAt);
      } catch (err) {
        console.error('Failed to persist letter status to SQLite:', err);
      }
    }

    return letter;
  }

  // ================= MINUTES =================
  public async getMinutes(): Promise<MeetingMinutes[]> {
    await this.sync();
    return [...this.minutes];
  }

  public async addMinutes(minuteData: Omit<MeetingMinutes, 'id' | 'createdAt'>): Promise<MeetingMinutes> {
    await this.sync();
    const newMinute: MeetingMinutes = {
      ...minuteData,
      id: `min-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.minutes.unshift(newMinute);

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoInsertMinute(client, newMinute);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to persist minutes to Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbInsertMinute(newMinute);
      } catch (err) {
        console.error('Failed to persist minutes to SQLite:', err);
      }
    }

    return newMinute;
  }

  public async toggleActionItemStatus(minuteId: string, actionId: string): Promise<boolean> {
    await this.sync();
    const minute = this.minutes.find((m) => m.id === minuteId);
    if (!minute) return false;
    const item = minute.actionItems.find((a) => a.id === actionId);
    if (!item) return false;
    item.status = item.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoUpdateMinuteActionItems(client, minuteId, minute.actionItems);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to update action items in Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbUpdateMinuteActionItems(minuteId, minute.actionItems);
      } catch (err) {
        console.error('Failed to persist minute action items to SQLite:', err);
      }
    }

    return true;
  }

  // ================= JAMAAH =================
  public async getJamaah(params?: JamaahFilterParams): Promise<Jamaah[]> {
    await this.sync();
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

  public async getJamaahById(id: string): Promise<Jamaah | undefined> {
    await this.sync();
    return this.jamaahList.find((j) => j.id === id);
  }

  public async addJamaah(data: Omit<Jamaah, 'id' | 'createdAt' | 'updatedAt'>): Promise<Jamaah> {
    await this.sync();
    const now = new Date().toISOString();
    const newJamaah: Jamaah = {
      ...data,
      id: `jmh-${String(this.jamaahList.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.jamaahList.unshift(newJamaah);

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoInsertJamaah(client, newJamaah);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to persist jamaah to Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbInsertJamaah(newJamaah);
      } catch (err) {
        console.error('Failed to persist jamaah to SQLite:', err);
      }
    }

    return newJamaah;
  }

  public async addBulkJamaah(dataArray: Omit<Jamaah, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Jamaah[]> {
    await this.sync();
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

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoInsertBulkJamaah(client, addedList);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to bulk persist jamaah to Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbInsertBulkJamaah(addedList);
      } catch (err) {
        console.error('Failed to bulk persist jamaah to SQLite:', err);
      }
    }

    return addedList;
  }

  public async updateJamaah(id: string, data: Partial<Jamaah>): Promise<Jamaah | null> {
    await this.sync();
    const index = this.jamaahList.findIndex((j) => j.id === id);
    if (index === -1) return null;

    const updated: Jamaah = {
      ...this.jamaahList[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    this.jamaahList[index] = updated;

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoUpdateJamaah(client, updated);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to update jamaah in Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbUpdateJamaah(updated);
      } catch (err) {
        console.error('Failed to update jamaah in SQLite:', err);
      }
    }

    return updated;
  }

  public async deleteJamaah(id: string): Promise<boolean> {
    await this.sync();
    const prevLen = this.jamaahList.length;
    this.jamaahList = this.jamaahList.filter((j) => j.id !== id);
    const success = this.jamaahList.length < prevLen;

    if (success) {
      if (isTursoConfigured()) {
        const client = getTursoClient();
        if (client) {
          try {
            await tursoDeleteJamaah(client, id);
            this.lastSyncedAt = Date.now();
          } catch (err) {
            console.error('Failed to delete jamaah from Turso Cloud:', err);
          }
        }
      } else {
        try {
          dbDeleteJamaah(id);
        } catch (err) {
          console.error('Failed to delete jamaah from SQLite:', err);
        }
      }
    }

    return success;
  }

  public async getJamaahStats(): Promise<JamaahStats> {
    await this.sync();
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
  public async getTransactions(params?: { category?: string; type?: string; search?: string }): Promise<FinanceTransaction[]> {
    await this.sync();
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

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public async addTransaction(data: Omit<FinanceTransaction, 'id' | 'balanceAfter' | 'createdAt'>): Promise<FinanceTransaction> {
    await this.sync();
    const currentSummary = await this.getFinanceSummary();
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

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoInsertTransaction(client, newTrx);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to persist transaction to Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbInsertTransaction(newTrx);
      } catch (err) {
        console.error('Failed to persist transaction to SQLite:', err);
      }
    }

    return newTrx;
  }

  public async updateTransaction(id: string, updates: Partial<FinanceTransaction>): Promise<FinanceTransaction | null> {
    await this.sync();
    const idx = this.transactions.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    this.transactions[idx] = {
      ...this.transactions[idx],
      ...updates,
    };

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoUpdateTransaction(client, this.transactions[idx]);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to update transaction in Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbUpdateTransaction(this.transactions[idx]);
      } catch (err) {
        console.error('Failed to update transaction in SQLite:', err);
      }
    }

    return this.transactions[idx];
  }

  public async deleteTransaction(id: string): Promise<boolean> {
    await this.sync();
    const initialLen = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.id !== id);
    const success = this.transactions.length < initialLen;

    if (success) {
      if (isTursoConfigured()) {
        const client = getTursoClient();
        if (client) {
          try {
            await tursoDeleteTransaction(client, id);
            this.lastSyncedAt = Date.now();
          } catch (err) {
            console.error('Failed to delete transaction from Turso Cloud:', err);
          }
        }
      } else {
        try {
          dbDeleteTransaction(id);
        } catch (err) {
          console.error('Failed to delete transaction from SQLite:', err);
        }
      }
    }

    return success;
  }

  public async getFinanceSummary(): Promise<FinanceSummary> {
    await this.sync();
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
  public async getDonors(params?: {
    search?: string;
    category?: string;
    status?: string;
    rt?: string;
    paymentStatus?: 'PAID_THIS_MONTH' | 'UNPAID_THIS_MONTH';
  }): Promise<DonorItem[]> {
    await this.sync();
    let result = [...this.donors];
    const currentMonth = new Date().toISOString().slice(0, 7);

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

  public async getDonorById(id: string): Promise<DonorItem | undefined> {
    await this.sync();
    return this.donors.find((d) => d.id === id);
  }

  public async addDonor(data: Omit<DonorItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<DonorItem> {
    await this.sync();
    const now = new Date().toISOString();
    const newDonor: DonorItem = {
      ...data,
      id: `dnr-${String(this.donors.length + 1).padStart(3, '0')}-${Date.now().toString().slice(-4)}`,
      createdAt: now,
      updatedAt: now,
    };
    this.donors.unshift(newDonor);

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoInsertDonor(client, newDonor);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to persist donor to Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbInsertDonor(newDonor);
      } catch (err) {
        console.error('Failed to persist donor to SQLite:', err);
      }
    }

    return newDonor;
  }

  public async updateDonor(id: string, data: Partial<DonorItem>): Promise<DonorItem | null> {
    await this.sync();
    const idx = this.donors.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    this.donors[idx] = {
      ...this.donors[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoUpdateDonor(client, this.donors[idx]);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to update donor in Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbUpdateDonor(this.donors[idx]);
      } catch (err) {
        console.error('Failed to update donor in SQLite:', err);
      }
    }

    return this.donors[idx];
  }

  public async deleteDonor(id: string): Promise<boolean> {
    await this.sync();
    const initialLen = this.donors.length;
    this.donors = this.donors.filter((d) => d.id !== id);
    const success = this.donors.length < initialLen;

    if (success) {
      if (isTursoConfigured()) {
        const client = getTursoClient();
        if (client) {
          try {
            await tursoDeleteDonor(client, id);
            this.lastSyncedAt = Date.now();
          } catch (err) {
            console.error('Failed to delete donor from Turso Cloud:', err);
          }
        }
      } else {
        try {
          dbDeleteDonor(id);
        } catch (err) {
          console.error('Failed to delete donor from SQLite:', err);
        }
      }
    }

    return success;
  }

  public async recordDonorPayment(params: {
    donorId: string;
    amount?: number;
    paymentMethod?: PaymentMethod;
    date?: string;
    notes?: string;
  }): Promise<{ donor: DonorItem; transaction: FinanceTransaction } | null> {
    await this.sync();
    const donor = this.donors.find((d) => d.id === params.donorId);
    if (!donor) return null;

    const payDate = params.date || new Date().toISOString().split('T')[0];
    const payMonth = payDate.slice(0, 7);
    const payAmount = params.amount || donor.commitmentAmount;
    const method = params.paymentMethod || donor.paymentMethod;

    let financeCat: FinanceCategory = 'KAS_OPERASIONAL';
    if (donor.category === 'KAS_OPERASIONAL') financeCat = 'KAS_OPERASIONAL';
    else if (donor.category === 'SWADAYA_PHBI') financeCat = 'SWADAYA_PHBI';
    else if (donor.category === 'ZISWAF_ZAKAT') financeCat = 'ZISWAF_ZAKAT';
    else if (donor.category === 'ZISWAF_INFAQ' || donor.category === 'BEASISWA_YATIM') financeCat = 'ZISWAF_INFAQ';

    // 1. Create transaction in Finance
    const newTrx = await this.addTransaction({
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

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoUpdateDonor(client, donor);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to update donor payment status in Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbUpdateDonor(donor);
      } catch (err) {
        console.error('Failed to update donor payment status in SQLite:', err);
      }
    }

    return { donor, transaction: newTrx };
  }

  public async getDonorStats(): Promise<DonorStats> {
    await this.sync();
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
  public async getAssets(params?: {
    category?: string;
    condition?: string;
    search?: string;
    maintenanceDueOnly?: boolean;
  }): Promise<AssetItem[]> {
    await this.sync();
    const today = new Date().toISOString().split('T')[0];

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

  public async addAsset(data: Omit<AssetItem, 'id' | 'createdAt' | 'updatedAt' | 'isMaintenanceDue'>): Promise<AssetItem> {
    await this.sync();
    const now = new Date().toISOString();
    const newAsset: AssetItem = {
      ...data,
      id: `ast-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.assets.unshift(newAsset);

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoInsertAsset(client, newAsset);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to persist asset to Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbInsertAsset(newAsset);
      } catch (err) {
        console.error('Failed to persist asset to SQLite:', err);
      }
    }

    return newAsset;
  }

  public async updateAsset(id: string, data: Partial<AssetItem>): Promise<AssetItem | null> {
    await this.sync();
    const index = this.assets.findIndex((a) => a.id === id);
    if (index === -1) return null;

    const updated: AssetItem = {
      ...this.assets[index],
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };
    this.assets[index] = updated;

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoUpdateAsset(client, updated);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to update asset in Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbUpdateAsset(updated);
      } catch (err) {
        console.error('Failed to update asset in SQLite:', err);
      }
    }

    return updated;
  }

  public async recordMaintenanceDone(id: string, notes?: string): Promise<AssetItem | null> {
    await this.sync();
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) return null;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

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

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoUpdateAsset(client, asset);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to update maintenance status in Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbUpdateAsset(asset);
      } catch (err) {
        console.error('Failed to update maintenance status in SQLite:', err);
      }
    }

    return asset;
  }

  public async deleteAsset(id: string): Promise<boolean> {
    await this.sync();
    const prevLen = this.assets.length;
    this.assets = this.assets.filter((a) => a.id !== id);
    const success = this.assets.length < prevLen;

    if (success) {
      if (isTursoConfigured()) {
        const client = getTursoClient();
        if (client) {
          try {
            await tursoDeleteAsset(client, id);
            this.lastSyncedAt = Date.now();
          } catch (err) {
            console.error('Failed to delete asset from Turso Cloud:', err);
          }
        }
      } else {
        try {
          dbDeleteAsset(id);
        } catch (err) {
          console.error('Failed to delete asset from SQLite:', err);
        }
      }
    }

    return success;
  }

  public async getAssetStats(): Promise<AssetStats> {
    await this.sync();
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
  public async getApprovals(status?: string): Promise<ApprovalItem[]> {
    await this.sync();
    let result = [...this.approvals];
    if (status && status !== 'ALL') {
      result = result.filter((a) => a.status === status);
    }
    return result.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }

  public async addApproval(data: Omit<ApprovalItem, 'id' | 'submittedAt' | 'status'>): Promise<ApprovalItem> {
    await this.sync();
    const newItem: ApprovalItem = {
      ...data,
      id: `appr-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'MENUNGGU_VERIFIKASI',
    };
    this.approvals.unshift(newItem);

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoInsertApproval(client, newItem);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to persist approval to Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbInsertApproval(newItem);
      } catch (err) {
        console.error('Failed to persist approval to SQLite:', err);
      }
    }

    return newItem;
  }

  public async verifyApproval(
    id: string,
    status: ApprovalStatus,
    dispositionNotes?: string,
    verifiedBy: string = 'Drs. Muhammad Hasri, M. Hum. (Ketua Umum)'
  ): Promise<ApprovalItem | null> {
    await this.sync();
    const item = this.approvals.find((a) => a.id === id);
    if (!item) return null;

    item.status = status;
    item.dispositionNotes = dispositionNotes || item.dispositionNotes;
    item.verifiedBy = verifiedBy;
    item.verifiedAt = new Date().toISOString();

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoUpdateApproval(client, item);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to update approval verification in Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbUpdateApproval(item);
      } catch (err) {
        console.error('Failed to update approval verification in SQLite:', err);
      }
    }

    return item;
  }

  // ================= FIELD KPIS & LPJ =================
  public async getFieldKPIs(): Promise<FieldKPI[]> {
    await this.sync();
    return [...this.fieldKPIs];
  }

  public async generateLPJData(customPeriod: string = 'Tahun Anggaran 2026'): Promise<LPJReport> {
    await this.sync();
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
    const finSummary = await this.getFinanceSummary();
    const ziswafCollected = this.transactions
      .filter((t) => t.type === 'INCOME' && (t.category === 'ZISWAF_ZAKAT' || t.category === 'ZISWAF_INFAQ'))
      .reduce((sum, t) => sum + t.amount, 0);
    const ziswafDisbursed = this.transactions
      .filter((t) => t.type === 'EXPENSE' && (t.category === 'ZISWAF_ZAKAT' || t.category === 'ZISWAF_INFAQ'))
      .reduce((sum, t) => sum + t.amount, 0);

    // 4. Metrics from Assets
    const astStats = await this.getAssetStats();
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
        ketuaUmum: { name: 'Drs. Muhammad Hasri, M. Hum.', title: 'Ketua Umum DKM Babul Khaer' },
        sekretarisUmum: { name: 'Ir. Muhammad Natsir, S.T.', title: 'Sekretaris Umum' },
        bendaharaUmum: { name: 'H. Sahali', title: 'Bendahara Umum' },
      },
    };
  }

  // ================= AUDIT LOGS & KEAMANAN =================
  public async getAuditLogs(params?: {
    module?: string;
    role?: string;
    search?: string;
    limit?: number;
  }): Promise<AuditLogEntry[]> {
    await this.sync();
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

    result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (params?.limit && params.limit > 0) {
      result = result.slice(0, params.limit);
    }

    return result;
  }

  public async addAuditLog(
    entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: string }
  ): Promise<AuditLogEntry> {
    const newLog: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
    };

    this.auditLogs.unshift(newLog);

    if (isTursoConfigured()) {
      const client = getTursoClient();
      if (client) {
        try {
          await tursoInsertAuditLog(client, newLog);
          this.lastSyncedAt = Date.now();
        } catch (err) {
          console.error('Failed to persist audit log to Turso Cloud:', err);
        }
      }
    } else {
      try {
        dbInsertAuditLog(newLog);
      } catch (err) {
        console.error('Failed to persist audit log to SQLite:', err);
      }
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
