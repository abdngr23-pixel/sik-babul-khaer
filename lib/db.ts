import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

// Mock initial data for seeding on first initialization
import { INITIAL_LETTERS, INITIAL_MINUTES } from './mock-data';
import { INITIAL_JAMAAH } from './mock-jamaah';
import { INITIAL_TRANSACTIONS } from './mock-finance';
import { INITIAL_DONORS } from './mock-donors';
import { INITIAL_ASSETS } from './mock-assets';
import { INITIAL_APPROVALS, INITIAL_FIELD_KPIS } from './mock-reports';
import { INITIAL_AUDIT_LOGS } from './mock-auth';

// Types
import { OfficialLetter, MeetingMinutes, LetterStatus } from '@/types/letter';
import { Jamaah } from '@/types/jamaah';
import { FinanceTransaction } from '@/types/finance';
import { DonorItem } from '@/types/donor';
import { AssetItem } from '@/types/asset';
import { ApprovalItem, FieldKPI } from '@/types/reports';
import { AuditLogEntry } from '@/types/auth';

const globalForDb = globalThis as unknown as {
  sikMbhDb?: DatabaseSync;
};

export function getDatabasePath(): string {
  // Allow explicit override via environment variable if configured by admin
  if (process.env.DATABASE_PATH) {
    const customDir = path.dirname(process.env.DATABASE_PATH);
    if (!fs.existsSync(customDir)) {
      fs.mkdirSync(customDir, { recursive: true });
    }
    return process.env.DATABASE_PATH;
  }

  // On Vercel serverless functions, root filesystem is read-only; /tmp is writable
  const isVercel = Boolean(process.env.VERCEL);
  const dataDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'sik_mbh.sqlite');
}

export function getDb(): DatabaseSync {
  if (globalForDb.sikMbhDb) {
    return globalForDb.sikMbhDb;
  }

  const dbPath = getDatabasePath();
  const db = new DatabaseSync(dbPath);

  // Performance & Integrity settings
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA busy_timeout = 5000;');

  initializeDatabase(db);

  globalForDb.sikMbhDb = db;
  return db;
}

function initializeDatabase(db: DatabaseSync) {
  // 1. Letters Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS letters (
      id TEXT PRIMARY KEY,
      sequenceNumber INTEGER NOT NULL,
      letterNumber TEXT NOT NULL,
      category TEXT NOT NULL,
      recipientName TEXT NOT NULL,
      recipientTitle TEXT,
      recipientAddress TEXT,
      subject TEXT NOT NULL,
      letterDate TEXT NOT NULL,
      attachmentCount TEXT,
      eventDate TEXT,
      eventTime TEXT,
      eventLocation TEXT,
      content TEXT NOT NULL,
      status TEXT NOT NULL,
      signatory1 TEXT NOT NULL,
      signatory2 TEXT NOT NULL,
      letterDetails TEXT,
      physicalArchiveLocation TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 2. Meeting Minutes Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS minutes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT,
      attendees TEXT,
      summary TEXT NOT NULL,
      decisions TEXT NOT NULL,
      actionItems TEXT NOT NULL,
      rawNotes TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // 3. Jamaah Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS jamaah (
      id TEXT PRIMARY KEY,
      fullName TEXT NOT NULL,
      nik TEXT,
      gender TEXT NOT NULL,
      birthPlace TEXT,
      birthDate TEXT,
      rt TEXT NOT NULL,
      houseNumber TEXT NOT NULL,
      fullAddress TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      residencyStatus TEXT NOT NULL,
      economicStatus TEXT NOT NULL,
      familyRole TEXT NOT NULL,
      familyMemberCount INTEGER,
      occupation TEXT,
      bloodType TEXT,
      isYouthMember INTEGER NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 4. Finance Transactions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      receiptNumber TEXT,
      payerOrPayee TEXT,
      paymentMethod TEXT NOT NULL,
      balanceAfter REAL NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // 5. Donors Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS donors (
      id TEXT PRIMARY KEY,
      donorName TEXT NOT NULL,
      phone TEXT NOT NULL,
      rt TEXT NOT NULL,
      address TEXT NOT NULL,
      category TEXT NOT NULL,
      commitmentAmount REAL NOT NULL,
      billingDay INTEGER NOT NULL,
      paymentMethod TEXT NOT NULL,
      status TEXT NOT NULL,
      lastPaymentDate TEXT,
      lastPaymentMonth TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 6. Assets Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      purchaseDate TEXT,
      purchaseCost REAL,
      condition TEXT NOT NULL,
      maintenanceCycleMonths INTEGER NOT NULL,
      lastMaintenanceDate TEXT,
      nextMaintenanceDate TEXT,
      maintenanceNotes TEXT,
      isMaintenanceDue INTEGER NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 7. Approvals Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS approvals (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      referenceNumber TEXT,
      category TEXT NOT NULL,
      submittedBy TEXT NOT NULL,
      submittedRole TEXT NOT NULL,
      submittedAt TEXT NOT NULL,
      amount REAL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      dispositionNotes TEXT,
      verifiedBy TEXT,
      verifiedAt TEXT
    );
  `);

  // 8. Field KPIs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS field_kpis (
      field TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      leaderName TEXT NOT NULL,
      score REAL NOT NULL,
      status TEXT NOT NULL,
      summary TEXT NOT NULL,
      indicators TEXT NOT NULL,
      keyNotes TEXT NOT NULL
    );
  `);

  // 9. Audit Logs Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      userId TEXT NOT NULL,
      userName TEXT NOT NULL,
      userRole TEXT NOT NULL,
      userRoleLabel TEXT NOT NULL,
      action TEXT NOT NULL,
      actionLabel TEXT NOT NULL,
      module TEXT NOT NULL,
      description TEXT NOT NULL,
      ipAddress TEXT,
      status TEXT NOT NULL
    );
  `);

  // 10. Metadata / Key-Value Store
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta_kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Auto-seed if empty
  seedIfEmpty(db);
}

function seedIfEmpty(db: DatabaseSync) {
  // Letters
  const lettersCount = Number(
    (db.prepare('SELECT COUNT(*) as count FROM letters').get() as { count: number | bigint }).count
  );
  if (lettersCount === 0 && INITIAL_LETTERS.length > 0) {
    const insertLetter = db.prepare(`
      INSERT INTO letters (
        id, sequenceNumber, letterNumber, category, recipientName, recipientTitle,
        recipientAddress, subject, letterDate, attachmentCount, eventDate, eventTime,
        eventLocation, content, status, signatory1, signatory2, letterDetails,
        physicalArchiveLocation, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const l of INITIAL_LETTERS) {
      insertLetter.run(
        l.id,
        l.sequenceNumber,
        l.letterNumber,
        l.category,
        l.recipientName,
        l.recipientTitle || '',
        l.recipientAddress || '',
        l.subject,
        l.letterDate,
        l.attachmentCount || '-',
        l.eventDate || null,
        l.eventTime || null,
        l.eventLocation || null,
        l.content,
        l.status,
        JSON.stringify(l.signatory1),
        JSON.stringify(l.signatory2),
        l.letterDetails ? JSON.stringify(l.letterDetails) : null,
        l.physicalArchiveLocation || null,
        l.createdAt,
        l.updatedAt
      );
    }
  }

  // Minutes
  const minutesCount = Number(
    (db.prepare('SELECT COUNT(*) as count FROM minutes').get() as { count: number | bigint }).count
  );
  if (minutesCount === 0 && INITIAL_MINUTES.length > 0) {
    const insertMinute = db.prepare(`
      INSERT INTO minutes (
        id, title, date, location, attendees, summary, decisions, actionItems, rawNotes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const m of INITIAL_MINUTES) {
      insertMinute.run(
        m.id,
        m.title,
        m.date,
        m.location || null,
        m.attendees || null,
        m.summary,
        JSON.stringify(m.decisions || []),
        JSON.stringify(m.actionItems || []),
        m.rawNotes || null,
        m.createdAt
      );
    }
  }

  // Jamaah
  const jamaahCount = Number(
    (db.prepare('SELECT COUNT(*) as count FROM jamaah').get() as { count: number | bigint }).count
  );
  if (jamaahCount === 0 && INITIAL_JAMAAH.length > 0) {
    const insertJamaah = db.prepare(`
      INSERT INTO jamaah (
        id, fullName, nik, gender, birthPlace, birthDate, rt, houseNumber,
        fullAddress, phone, email, residencyStatus, economicStatus, familyRole,
        familyMemberCount, occupation, bloodType, isYouthMember, notes,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const j of INITIAL_JAMAAH) {
      insertJamaah.run(
        j.id,
        j.fullName,
        j.nik || null,
        j.gender,
        j.birthPlace || null,
        j.birthDate || null,
        j.rt,
        j.houseNumber,
        j.fullAddress,
        j.phone,
        j.email || null,
        j.residencyStatus,
        j.economicStatus,
        j.familyRole,
        j.familyMemberCount || 1,
        j.occupation || null,
        j.bloodType || null,
        j.isYouthMember ? 1 : 0,
        j.notes || null,
        j.createdAt,
        j.updatedAt
      );
    }
  }

  // Transactions
  const trxCount = Number(
    (db.prepare('SELECT COUNT(*) as count FROM transactions').get() as { count: number | bigint }).count
  );
  if (trxCount === 0 && INITIAL_TRANSACTIONS.length > 0) {
    const insertTrx = db.prepare(`
      INSERT INTO transactions (
        id, date, type, category, description, amount, receiptNumber, payerOrPayee,
        paymentMethod, balanceAfter, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const t of INITIAL_TRANSACTIONS) {
      insertTrx.run(
        t.id,
        t.date,
        t.type,
        t.category,
        t.description,
        t.amount,
        t.receiptNumber || null,
        t.payerOrPayee || null,
        t.paymentMethod,
        t.balanceAfter || 0,
        t.notes || null,
        t.createdAt
      );
    }
  }

  // Donors
  const donorsCount = Number(
    (db.prepare('SELECT COUNT(*) as count FROM donors').get() as { count: number | bigint }).count
  );
  if (donorsCount === 0 && INITIAL_DONORS.length > 0) {
    const insertDonor = db.prepare(`
      INSERT INTO donors (
        id, donorName, phone, rt, address, category, commitmentAmount, billingDay,
        paymentMethod, status, lastPaymentDate, lastPaymentMonth, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const d of INITIAL_DONORS) {
      insertDonor.run(
        d.id,
        d.donorName,
        d.phone,
        d.rt,
        d.address,
        d.category,
        d.commitmentAmount,
        d.billingDay,
        d.paymentMethod,
        d.status,
        d.lastPaymentDate || null,
        d.lastPaymentMonth || null,
        d.notes || null,
        d.createdAt,
        d.updatedAt
      );
    }
  }

  // Assets
  const assetsCount = Number(
    (db.prepare('SELECT COUNT(*) as count FROM assets').get() as { count: number | bigint }).count
  );
  if (assetsCount === 0 && INITIAL_ASSETS.length > 0) {
    const insertAsset = db.prepare(`
      INSERT INTO assets (
        id, code, name, category, location, purchaseDate, purchaseCost,
        condition, maintenanceCycleMonths, lastMaintenanceDate, nextMaintenanceDate,
        maintenanceNotes, isMaintenanceDue, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const a of INITIAL_ASSETS) {
      insertAsset.run(
        a.id,
        a.code,
        a.name,
        a.category,
        a.location,
        a.purchaseDate || null,
        a.purchaseCost || null,
        a.condition,
        a.maintenanceCycleMonths,
        a.lastMaintenanceDate || null,
        a.nextMaintenanceDate || null,
        a.maintenanceNotes || null,
        a.isMaintenanceDue ? 1 : 0,
        a.createdAt,
        a.updatedAt
      );
    }
  }

  // Approvals
  const approvalsCount = Number(
    (db.prepare('SELECT COUNT(*) as count FROM approvals').get() as { count: number | bigint }).count
  );
  if (approvalsCount === 0 && INITIAL_APPROVALS.length > 0) {
    const insertApproval = db.prepare(`
      INSERT INTO approvals (
        id, type, title, referenceNumber, category, submittedBy, submittedRole,
        submittedAt, amount, description, status, dispositionNotes, verifiedBy, verifiedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const ap of INITIAL_APPROVALS) {
      insertApproval.run(
        ap.id,
        ap.type,
        ap.title,
        ap.referenceNumber || null,
        ap.category,
        ap.submittedBy,
        ap.submittedRole,
        ap.submittedAt,
        ap.amount ?? null,
        ap.description,
        ap.status,
        ap.dispositionNotes || null,
        ap.verifiedBy || null,
        ap.verifiedAt || null
      );
    }
  }

  // Field KPIs
  const kpisCount = Number(
    (db.prepare('SELECT COUNT(*) as count FROM field_kpis').get() as { count: number | bigint }).count
  );
  if (kpisCount === 0 && INITIAL_FIELD_KPIS.length > 0) {
    const insertKpi = db.prepare(`
      INSERT INTO field_kpis (
        field, title, leaderName, score, status, summary, indicators, keyNotes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const k of INITIAL_FIELD_KPIS) {
      insertKpi.run(
        k.field,
        k.title,
        k.leaderName,
        k.score,
        k.status,
        k.summary,
        JSON.stringify(k.indicators),
        JSON.stringify(k.keyNotes)
      );
    }
  }

  // Audit Logs
  const auditCount = Number(
    (db.prepare('SELECT COUNT(*) as count FROM audit_logs').get() as { count: number | bigint }).count
  );
  if (auditCount === 0 && INITIAL_AUDIT_LOGS.length > 0) {
    const insertAudit = db.prepare(`
      INSERT INTO audit_logs (
        id, timestamp, userId, userName, userRole, userRoleLabel, action,
        actionLabel, module, description, ipAddress, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const al of INITIAL_AUDIT_LOGS) {
      insertAudit.run(
        al.id,
        al.timestamp,
        al.userId,
        al.userName,
        al.userRole,
        al.userRoleLabel,
        al.action,
        al.actionLabel,
        al.module,
        al.description,
        al.ipAddress || null,
        al.status
      );
    }
  }

  // Save Meta initialization date
  db.prepare(`
    INSERT OR REPLACE INTO meta_kv (key, value) VALUES (?, ?)
  `).run('initialized_at', new Date().toISOString());
}

// ---------------- ROW PARSERS ----------------
const parseLetter = (r: Record<string, unknown>): OfficialLetter => ({
  id: r.id as string,
  sequenceNumber: Number(r.sequenceNumber),
  letterNumber: r.letterNumber as string,
  category: r.category as OfficialLetter['category'],
  recipientName: r.recipientName as string,
  recipientTitle: (r.recipientTitle as string) || undefined,
  recipientAddress: (r.recipientAddress as string) || undefined,
  subject: r.subject as string,
  letterDate: r.letterDate as string,
  attachmentCount: (r.attachmentCount as string) || undefined,
  eventDate: (r.eventDate as string) || undefined,
  eventTime: (r.eventTime as string) || undefined,
  eventLocation: (r.eventLocation as string) || undefined,
  content: r.content as string,
  status: r.status as OfficialLetter['status'],
  signatory1: JSON.parse(r.signatory1 as string),
  signatory2: JSON.parse(r.signatory2 as string),
  letterDetails: r.letterDetails ? JSON.parse(r.letterDetails as string) : undefined,
  physicalArchiveLocation: (r.physicalArchiveLocation as string) || undefined,
  createdAt: r.createdAt as string,
  updatedAt: r.updatedAt as string,
});

const parseMinute = (r: Record<string, unknown>): MeetingMinutes => ({
  id: r.id as string,
  title: r.title as string,
  date: r.date as string,
  location: (r.location as string) || undefined,
  attendees: (r.attendees as string) || undefined,
  summary: r.summary as string,
  decisions: JSON.parse((r.decisions as string) || '[]'),
  actionItems: JSON.parse((r.actionItems as string) || '[]'),
  rawNotes: (r.rawNotes as string) || undefined,
  createdAt: r.createdAt as string,
});

const parseJamaah = (r: Record<string, unknown>): Jamaah => ({
  id: r.id as string,
  fullName: r.fullName as string,
  nik: (r.nik as string) || undefined,
  gender: r.gender as Jamaah['gender'],
  birthPlace: (r.birthPlace as string) || undefined,
  birthDate: (r.birthDate as string) || undefined,
  rt: r.rt as Jamaah['rt'],
  houseNumber: r.houseNumber as string,
  fullAddress: r.fullAddress as string,
  phone: r.phone as string,
  email: (r.email as string) || undefined,
  residencyStatus: r.residencyStatus as Jamaah['residencyStatus'],
  economicStatus: r.economicStatus as Jamaah['economicStatus'],
  familyRole: r.familyRole as Jamaah['familyRole'],
  familyMemberCount: r.familyMemberCount !== null ? Number(r.familyMemberCount) : undefined,
  occupation: (r.occupation as string) || undefined,
  bloodType: (r.bloodType as string) || undefined,
  isYouthMember: Boolean(r.isYouthMember),
  notes: (r.notes as string) || undefined,
  createdAt: r.createdAt as string,
  updatedAt: r.updatedAt as string,
});

const parseTransaction = (r: Record<string, unknown>): FinanceTransaction => ({
  id: r.id as string,
  date: r.date as string,
  type: r.type as FinanceTransaction['type'],
  category: r.category as FinanceTransaction['category'],
  description: r.description as string,
  amount: Number(r.amount),
  receiptNumber: (r.receiptNumber as string) || undefined,
  payerOrPayee: (r.payerOrPayee as string) || undefined,
  paymentMethod: r.paymentMethod as FinanceTransaction['paymentMethod'],
  balanceAfter: Number(r.balanceAfter),
  notes: (r.notes as string) || undefined,
  createdAt: r.createdAt as string,
});

const parseDonor = (r: Record<string, unknown>): DonorItem => ({
  id: r.id as string,
  donorName: r.donorName as string,
  phone: r.phone as string,
  rt: r.rt as DonorItem['rt'],
  address: r.address as string,
  category: r.category as DonorItem['category'],
  commitmentAmount: Number(r.commitmentAmount),
  billingDay: Number(r.billingDay),
  paymentMethod: r.paymentMethod as DonorItem['paymentMethod'],
  status: r.status as DonorItem['status'],
  lastPaymentDate: (r.lastPaymentDate as string) || undefined,
  lastPaymentMonth: (r.lastPaymentMonth as string) || undefined,
  notes: (r.notes as string) || undefined,
  createdAt: r.createdAt as string,
  updatedAt: r.updatedAt as string,
});

const parseAsset = (r: Record<string, unknown>): AssetItem => ({
  id: r.id as string,
  code: r.code as string,
  name: r.name as string,
  category: r.category as AssetItem['category'],
  location: r.location as string,
  purchaseDate: (r.purchaseDate as string) || undefined,
  purchaseCost: r.purchaseCost !== null ? Number(r.purchaseCost) : undefined,
  condition: r.condition as AssetItem['condition'],
  maintenanceCycleMonths: Number(r.maintenanceCycleMonths),
  lastMaintenanceDate: (r.lastMaintenanceDate as string) || undefined,
  nextMaintenanceDate: (r.nextMaintenanceDate as string) || undefined,
  maintenanceNotes: (r.maintenanceNotes as string) || undefined,
  isMaintenanceDue: Boolean(r.isMaintenanceDue),
  createdAt: r.createdAt as string,
  updatedAt: r.updatedAt as string,
});

const parseApproval = (r: Record<string, unknown>): ApprovalItem => ({
  id: r.id as string,
  type: r.type as ApprovalItem['type'],
  title: r.title as string,
  referenceNumber: (r.referenceNumber as string) || undefined,
  category: r.category as string,
  submittedBy: r.submittedBy as string,
  submittedRole: r.submittedRole as string,
  submittedAt: r.submittedAt as string,
  amount: r.amount !== null ? Number(r.amount) : undefined,
  description: r.description as string,
  status: r.status as ApprovalItem['status'],
  dispositionNotes: (r.dispositionNotes as string) || undefined,
  verifiedBy: (r.verifiedBy as string) || undefined,
  verifiedAt: (r.verifiedAt as string) || undefined,
});

const parseKpi = (r: Record<string, unknown>): FieldKPI => ({
  field: r.field as FieldKPI['field'],
  title: r.title as string,
  leaderName: r.leaderName as string,
  score: Number(r.score),
  status: r.status as FieldKPI['status'],
  summary: r.summary as string,
  indicators: JSON.parse(r.indicators as string),
  keyNotes: JSON.parse(r.keyNotes as string),
});

const parseAudit = (r: Record<string, unknown>): AuditLogEntry => ({
  id: r.id as string,
  timestamp: r.timestamp as string,
  userId: r.userId as string,
  userName: r.userName as string,
  userRole: r.userRole as AuditLogEntry['userRole'],
  userRoleLabel: r.userRoleLabel as string,
  action: r.action as AuditLogEntry['action'],
  actionLabel: r.actionLabel as string,
  module: r.module as AuditLogEntry['module'],
  description: r.description as string,
  ipAddress: (r.ipAddress as string) || undefined,
  status: r.status as AuditLogEntry['status'],
});

// ---------------- LOAD ALL DATA FROM DATABASE ----------------
export function loadAllDataFromDatabase() {
  const db = getDb();
  return {
    letters: db.prepare('SELECT * FROM letters ORDER BY sequenceNumber DESC').all().map(parseLetter),
    minutes: db.prepare('SELECT * FROM minutes ORDER BY date DESC').all().map(parseMinute),
    jamaah: db.prepare('SELECT * FROM jamaah ORDER BY fullName ASC').all().map(parseJamaah),
    transactions: db.prepare('SELECT * FROM transactions ORDER BY date DESC').all().map(parseTransaction),
    donors: db.prepare('SELECT * FROM donors ORDER BY donorName ASC').all().map(parseDonor),
    assets: db.prepare('SELECT * FROM assets ORDER BY code ASC').all().map(parseAsset),
    approvals: db.prepare('SELECT * FROM approvals ORDER BY submittedAt DESC').all().map(parseApproval),
    fieldKPIs: db.prepare('SELECT * FROM field_kpis').all().map(parseKpi),
    auditLogs: db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC').all().map(parseAudit),
  };
}

// ---------------- PERSISTENCE MUTATIONS ----------------

// Letters
export function dbInsertLetter(l: OfficialLetter) {
  const db = getDb();
  db.prepare(`
    INSERT INTO letters (
      id, sequenceNumber, letterNumber, category, recipientName, recipientTitle,
      recipientAddress, subject, letterDate, attachmentCount, eventDate, eventTime,
      eventLocation, content, status, signatory1, signatory2, letterDetails,
      physicalArchiveLocation, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    l.id,
    l.sequenceNumber,
    l.letterNumber,
    l.category,
    l.recipientName,
    l.recipientTitle || '',
    l.recipientAddress || '',
    l.subject,
    l.letterDate,
    l.attachmentCount || '-',
    l.eventDate || null,
    l.eventTime || null,
    l.eventLocation || null,
    l.content,
    l.status,
    JSON.stringify(l.signatory1),
    JSON.stringify(l.signatory2),
    l.letterDetails ? JSON.stringify(l.letterDetails) : null,
    l.physicalArchiveLocation || null,
    l.createdAt,
    l.updatedAt
  );
}

export function dbUpdateLetterStatus(id: string, status: LetterStatus, updatedAt: string) {
  const db = getDb();
  db.prepare('UPDATE letters SET status = ?, updatedAt = ? WHERE id = ?').run(status, updatedAt, id);
}

// Minutes
export function dbInsertMinute(m: MeetingMinutes) {
  const db = getDb();
  db.prepare(`
    INSERT INTO minutes (
      id, title, date, location, attendees, summary, decisions, actionItems, rawNotes, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    m.id,
    m.title,
    m.date,
    m.location || null,
    m.attendees || null,
    m.summary,
    JSON.stringify(m.decisions || []),
    JSON.stringify(m.actionItems || []),
    m.rawNotes || null,
    m.createdAt
  );
}

export function dbUpdateMinuteActionItems(id: string, actionItems: unknown[]) {
  const db = getDb();
  db.prepare('UPDATE minutes SET actionItems = ? WHERE id = ?').run(JSON.stringify(actionItems), id);
}

// Jamaah
export function dbInsertJamaah(j: Jamaah) {
  const db = getDb();
  db.prepare(`
    INSERT INTO jamaah (
      id, fullName, nik, gender, birthPlace, birthDate, rt, houseNumber,
      fullAddress, phone, email, residencyStatus, economicStatus, familyRole,
      familyMemberCount, occupation, bloodType, isYouthMember, notes,
      createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    j.id,
    j.fullName,
    j.nik || null,
    j.gender,
    j.birthPlace || null,
    j.birthDate || null,
    j.rt,
    j.houseNumber,
    j.fullAddress,
    j.phone,
    j.email || null,
    j.residencyStatus,
    j.economicStatus,
    j.familyRole,
    j.familyMemberCount || 1,
    j.occupation || null,
    j.bloodType || null,
    j.isYouthMember ? 1 : 0,
    j.notes || null,
    j.createdAt,
    j.updatedAt
  );
}

export function dbInsertBulkJamaah(list: Jamaah[]) {
  const db = getDb();
  db.exec('BEGIN TRANSACTION;');
  try {
    const stmt = db.prepare(`
      INSERT INTO jamaah (
        id, fullName, nik, gender, birthPlace, birthDate, rt, houseNumber,
        fullAddress, phone, email, residencyStatus, economicStatus, familyRole,
        familyMemberCount, occupation, bloodType, isYouthMember, notes,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const j of list) {
      stmt.run(
        j.id,
        j.fullName,
        j.nik || null,
        j.gender,
        j.birthPlace || null,
        j.birthDate || null,
        j.rt,
        j.houseNumber,
        j.fullAddress,
        j.phone,
        j.email || null,
        j.residencyStatus,
        j.economicStatus,
        j.familyRole,
        j.familyMemberCount || 1,
        j.occupation || null,
        j.bloodType || null,
        j.isYouthMember ? 1 : 0,
        j.notes || null,
        j.createdAt,
        j.updatedAt
      );
    }
    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

export function dbUpdateJamaah(j: Jamaah) {
  const db = getDb();
  db.prepare(`
    UPDATE jamaah SET
      fullName = ?, nik = ?, gender = ?, birthPlace = ?, birthDate = ?,
      rt = ?, houseNumber = ?, fullAddress = ?, phone = ?, email = ?,
      residencyStatus = ?, economicStatus = ?, familyRole = ?, familyMemberCount = ?,
      occupation = ?, bloodType = ?, isYouthMember = ?, notes = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    j.fullName,
    j.nik || null,
    j.gender,
    j.birthPlace || null,
    j.birthDate || null,
    j.rt,
    j.houseNumber,
    j.fullAddress,
    j.phone,
    j.email || null,
    j.residencyStatus,
    j.economicStatus,
    j.familyRole,
    j.familyMemberCount || 1,
    j.occupation || null,
    j.bloodType || null,
    j.isYouthMember ? 1 : 0,
    j.notes || null,
    j.updatedAt,
    j.id
  );
}

export function dbDeleteJamaah(id: string) {
  const db = getDb();
  db.prepare('DELETE FROM jamaah WHERE id = ?').run(id);
}

// Transactions
export function dbInsertTransaction(t: FinanceTransaction) {
  const db = getDb();
  db.prepare(`
    INSERT INTO transactions (
      id, date, type, category, description, amount, receiptNumber, payerOrPayee,
      paymentMethod, balanceAfter, notes, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    t.id,
    t.date,
    t.type,
    t.category,
    t.description,
    t.amount,
    t.receiptNumber || null,
    t.payerOrPayee || null,
    t.paymentMethod,
    t.balanceAfter || 0,
    t.notes || null,
    t.createdAt
  );
}

export function dbUpdateTransaction(t: FinanceTransaction) {
  const db = getDb();
  db.prepare(`
    UPDATE transactions SET
      date = ?, type = ?, category = ?, description = ?, amount = ?,
      receiptNumber = ?, payerOrPayee = ?, paymentMethod = ?, balanceAfter = ?, notes = ?
    WHERE id = ?
  `).run(
    t.date,
    t.type,
    t.category,
    t.description,
    t.amount,
    t.receiptNumber || null,
    t.payerOrPayee || null,
    t.paymentMethod,
    t.balanceAfter || 0,
    t.notes || null,
    t.id
  );
}

export function dbDeleteTransaction(id: string) {
  const db = getDb();
  db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
}

// Donors
export function dbInsertDonor(d: DonorItem) {
  const db = getDb();
  db.prepare(`
    INSERT INTO donors (
      id, donorName, phone, rt, address, category, commitmentAmount, billingDay,
      paymentMethod, status, lastPaymentDate, lastPaymentMonth, notes, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    d.id,
    d.donorName,
    d.phone,
    d.rt,
    d.address,
    d.category,
    d.commitmentAmount,
    d.billingDay,
    d.paymentMethod,
    d.status,
    d.lastPaymentDate || null,
    d.lastPaymentMonth || null,
    d.notes || null,
    d.createdAt,
    d.updatedAt
  );
}

export function dbUpdateDonor(d: DonorItem) {
  const db = getDb();
  db.prepare(`
    UPDATE donors SET
      donorName = ?, phone = ?, rt = ?, address = ?, category = ?,
      commitmentAmount = ?, billingDay = ?, paymentMethod = ?, status = ?,
      lastPaymentDate = ?, lastPaymentMonth = ?, notes = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    d.donorName,
    d.phone,
    d.rt,
    d.address,
    d.category,
    d.commitmentAmount,
    d.billingDay,
    d.paymentMethod,
    d.status,
    d.lastPaymentDate || null,
    d.lastPaymentMonth || null,
    d.notes || null,
    d.updatedAt,
    d.id
  );
}

export function dbDeleteDonor(id: string) {
  const db = getDb();
  db.prepare('DELETE FROM donors WHERE id = ?').run(id);
}

// Assets
export function dbInsertAsset(a: AssetItem) {
  const db = getDb();
  db.prepare(`
    INSERT INTO assets (
      id, code, name, category, location, purchaseDate, purchaseCost,
      condition, maintenanceCycleMonths, lastMaintenanceDate, nextMaintenanceDate,
      maintenanceNotes, isMaintenanceDue, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    a.id,
    a.code,
    a.name,
    a.category,
    a.location,
    a.purchaseDate || null,
    a.purchaseCost || null,
    a.condition,
    a.maintenanceCycleMonths,
    a.lastMaintenanceDate || null,
    a.nextMaintenanceDate || null,
    a.maintenanceNotes || null,
    a.isMaintenanceDue ? 1 : 0,
    a.createdAt,
    a.updatedAt
  );
}

export function dbUpdateAsset(a: AssetItem) {
  const db = getDb();
  db.prepare(`
    UPDATE assets SET
      code = ?, name = ?, category = ?, location = ?, purchaseDate = ?,
      purchaseCost = ?, condition = ?, maintenanceCycleMonths = ?,
      lastMaintenanceDate = ?, nextMaintenanceDate = ?, maintenanceNotes = ?,
      isMaintenanceDue = ?, updatedAt = ?
    WHERE id = ?
  `).run(
    a.code,
    a.name,
    a.category,
    a.location,
    a.purchaseDate || null,
    a.purchaseCost || null,
    a.condition,
    a.maintenanceCycleMonths,
    a.lastMaintenanceDate || null,
    a.nextMaintenanceDate || null,
    a.maintenanceNotes || null,
    a.isMaintenanceDue ? 1 : 0,
    a.updatedAt,
    a.id
  );
}

export function dbDeleteAsset(id: string) {
  const db = getDb();
  db.prepare('DELETE FROM assets WHERE id = ?').run(id);
}

// Approvals
export function dbInsertApproval(ap: ApprovalItem) {
  const db = getDb();
  db.prepare(`
    INSERT INTO approvals (
      id, type, title, referenceNumber, category, submittedBy, submittedRole,
      submittedAt, amount, description, status, dispositionNotes, verifiedBy, verifiedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    ap.id,
    ap.type,
    ap.title,
    ap.referenceNumber || null,
    ap.category,
    ap.submittedBy,
    ap.submittedRole,
    ap.submittedAt,
    ap.amount ?? null,
    ap.description,
    ap.status,
    ap.dispositionNotes || null,
    ap.verifiedBy || null,
    ap.verifiedAt || null
  );
}

export function dbUpdateApproval(ap: ApprovalItem) {
  const db = getDb();
  db.prepare(`
    UPDATE approvals SET
      status = ?, dispositionNotes = ?, verifiedBy = ?, verifiedAt = ?
    WHERE id = ?
  `).run(
    ap.status,
    ap.dispositionNotes || null,
    ap.verifiedBy || null,
    ap.verifiedAt || null,
    ap.id
  );
}

// Audit Logs
export function dbInsertAuditLog(al: AuditLogEntry) {
  const db = getDb();
  db.prepare(`
    INSERT INTO audit_logs (
      id, timestamp, userId, userName, userRole, userRoleLabel, action,
      actionLabel, module, description, ipAddress, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    al.id,
    al.timestamp,
    al.userId,
    al.userName,
    al.userRole,
    al.userRoleLabel,
    al.action,
    al.actionLabel,
    al.module,
    al.description,
    al.ipAddress || null,
    al.status
  );
}

// Database stats helper for Backup/Restore UI
export function getDatabaseStats(): {
  path: string;
  sizeBytes: number;
  totalLetters: number;
  totalMinutes: number;
  totalJamaah: number;
  totalTransactions: number;
  totalDonors: number;
  totalAssets: number;
  totalApprovals: number;
  totalAuditLogs: number;
} {
  const db = getDb();
  const dbPath = getDatabasePath();
  let sizeBytes = 0;
  try {
    const stat = fs.statSync(/*turbopackIgnore: true*/ dbPath);
    sizeBytes = stat.size;
  } catch {}

  const getCount = (tbl: string) => {
    try {
      const res = db.prepare(`SELECT COUNT(*) as count FROM ${tbl}`).get() as { count: number | bigint };
      return Number(res.count);
    } catch {
      return 0;
    }
  };

  return {
    path: dbPath,
    sizeBytes,
    totalLetters: getCount('letters'),
    totalMinutes: getCount('minutes'),
    totalJamaah: getCount('jamaah'),
    totalTransactions: getCount('transactions'),
    totalDonors: getCount('donors'),
    totalAssets: getCount('assets'),
    totalApprovals: getCount('approvals'),
    totalAuditLogs: getCount('audit_logs'),
  };
}

// Full Database Export Snapshot for Backup
export function exportDatabaseSnapshot(): {
  version: string;
  exportedAt: string;
  mosqueName: string;
  data: {
    letters: OfficialLetter[];
    minutes: MeetingMinutes[];
    jamaah: Jamaah[];
    transactions: FinanceTransaction[];
    donors: DonorItem[];
    assets: AssetItem[];
    approvals: ApprovalItem[];
    fieldKPIs: FieldKPI[];
    auditLogs: AuditLogEntry[];
  };
} {
  const loaded = loadAllDataFromDatabase();
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    mosqueName: 'Masjid Babul Khaer BTP Blok AE Makassar',
    data: loaded,
  };
}

// Restore Database from Snapshot
export function restoreDatabaseSnapshot(snapshot: {
  data: {
    letters?: OfficialLetter[];
    minutes?: MeetingMinutes[];
    jamaah?: Jamaah[];
    transactions?: FinanceTransaction[];
    donors?: DonorItem[];
    assets?: AssetItem[];
    approvals?: ApprovalItem[];
    fieldKPIs?: FieldKPI[];
    auditLogs?: AuditLogEntry[];
  };
}): { success: boolean; message: string } {
  const db = getDb();

  db.exec('BEGIN TRANSACTION;');
  try {
    if (snapshot.data.letters && Array.isArray(snapshot.data.letters)) {
      db.exec('DELETE FROM letters;');
      const stmt = db.prepare(`
        INSERT INTO letters (
          id, sequenceNumber, letterNumber, category, recipientName, recipientTitle,
          recipientAddress, subject, letterDate, attachmentCount, eventDate, eventTime,
          eventLocation, content, status, signatory1, signatory2, letterDetails,
          physicalArchiveLocation, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const l of snapshot.data.letters) {
        stmt.run(
          l.id,
          l.sequenceNumber,
          l.letterNumber,
          l.category,
          l.recipientName,
          l.recipientTitle || '',
          l.recipientAddress || '',
          l.subject,
          l.letterDate,
          l.attachmentCount || '-',
          l.eventDate || null,
          l.eventTime || null,
          l.eventLocation || null,
          l.content,
          l.status,
          JSON.stringify(l.signatory1),
          JSON.stringify(l.signatory2),
          l.letterDetails ? JSON.stringify(l.letterDetails) : null,
          l.physicalArchiveLocation || null,
          l.createdAt,
          l.updatedAt
        );
      }
    }

    if (snapshot.data.minutes && Array.isArray(snapshot.data.minutes)) {
      db.exec('DELETE FROM minutes;');
      const stmt = db.prepare(`
        INSERT INTO minutes (
          id, title, date, location, attendees, summary, decisions, actionItems, rawNotes, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const m of snapshot.data.minutes) {
        stmt.run(
          m.id,
          m.title,
          m.date,
          m.location || null,
          m.attendees || null,
          m.summary,
          JSON.stringify(m.decisions || []),
          JSON.stringify(m.actionItems || []),
          m.rawNotes || null,
          m.createdAt
        );
      }
    }

    if (snapshot.data.jamaah && Array.isArray(snapshot.data.jamaah)) {
      db.exec('DELETE FROM jamaah;');
      const stmt = db.prepare(`
        INSERT INTO jamaah (
          id, fullName, nik, gender, birthPlace, birthDate, rt, houseNumber,
          fullAddress, phone, email, residencyStatus, economicStatus, familyRole,
          familyMemberCount, occupation, bloodType, isYouthMember, notes,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const j of snapshot.data.jamaah) {
        stmt.run(
          j.id,
          j.fullName,
          j.nik || null,
          j.gender,
          j.birthPlace || null,
          j.birthDate || null,
          j.rt,
          j.houseNumber,
          j.fullAddress,
          j.phone,
          j.email || null,
          j.residencyStatus,
          j.economicStatus,
          j.familyRole,
          j.familyMemberCount || 1,
          j.occupation || null,
          j.bloodType || null,
          j.isYouthMember ? 1 : 0,
          j.notes || null,
          j.createdAt,
          j.updatedAt
        );
      }
    }

    if (snapshot.data.transactions && Array.isArray(snapshot.data.transactions)) {
      db.exec('DELETE FROM transactions;');
      const stmt = db.prepare(`
        INSERT INTO transactions (
          id, date, type, category, description, amount, receiptNumber, payerOrPayee,
          paymentMethod, balanceAfter, notes, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const t of snapshot.data.transactions) {
        stmt.run(
          t.id,
          t.date,
          t.type,
          t.category,
          t.description,
          t.amount,
          t.receiptNumber || null,
          t.payerOrPayee || null,
          t.paymentMethod,
          t.balanceAfter || 0,
          t.notes || null,
          t.createdAt
        );
      }
    }

    if (snapshot.data.donors && Array.isArray(snapshot.data.donors)) {
      db.exec('DELETE FROM donors;');
      const stmt = db.prepare(`
        INSERT INTO donors (
          id, donorName, phone, rt, address, category, commitmentAmount, billingDay,
          paymentMethod, status, lastPaymentDate, lastPaymentMonth, notes, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const d of snapshot.data.donors) {
        stmt.run(
          d.id,
          d.donorName,
          d.phone,
          d.rt,
          d.address,
          d.category,
          d.commitmentAmount,
          d.billingDay,
          d.paymentMethod,
          d.status,
          d.lastPaymentDate || null,
          d.lastPaymentMonth || null,
          d.notes || null,
          d.createdAt,
          d.updatedAt
        );
      }
    }

    if (snapshot.data.assets && Array.isArray(snapshot.data.assets)) {
      db.exec('DELETE FROM assets;');
      const stmt = db.prepare(`
        INSERT INTO assets (
          id, code, name, category, location, purchaseDate, purchaseCost,
          condition, maintenanceCycleMonths, lastMaintenanceDate, nextMaintenanceDate,
          maintenanceNotes, isMaintenanceDue, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const a of snapshot.data.assets) {
        stmt.run(
          a.id,
          a.code,
          a.name,
          a.category,
          a.location,
          a.purchaseDate || null,
          a.purchaseCost || null,
          a.condition,
          a.maintenanceCycleMonths,
          a.lastMaintenanceDate || null,
          a.nextMaintenanceDate || null,
          a.maintenanceNotes || null,
          a.isMaintenanceDue ? 1 : 0,
          a.createdAt,
          a.updatedAt
        );
      }
    }

    if (snapshot.data.approvals && Array.isArray(snapshot.data.approvals)) {
      db.exec('DELETE FROM approvals;');
      const stmt = db.prepare(`
        INSERT INTO approvals (
          id, type, title, referenceNumber, category, submittedBy, submittedRole,
          submittedAt, amount, description, status, dispositionNotes, verifiedBy, verifiedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const ap of snapshot.data.approvals) {
        stmt.run(
          ap.id,
          ap.type,
          ap.title,
          ap.referenceNumber || null,
          ap.category,
          ap.submittedBy,
          ap.submittedRole,
          ap.submittedAt,
          ap.amount ?? null,
          ap.description,
          ap.status,
          ap.dispositionNotes || null,
          ap.verifiedBy || null,
          ap.verifiedAt || null
        );
      }
    }

    if (snapshot.data.fieldKPIs && Array.isArray(snapshot.data.fieldKPIs)) {
      db.exec('DELETE FROM field_kpis;');
      const stmt = db.prepare(`
        INSERT INTO field_kpis (
          field, title, leaderName, score, status, summary, indicators, keyNotes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const k of snapshot.data.fieldKPIs) {
        stmt.run(
          k.field,
          k.title,
          k.leaderName,
          k.score,
          k.status,
          k.summary,
          JSON.stringify(k.indicators),
          JSON.stringify(k.keyNotes)
        );
      }
    }

    if (snapshot.data.auditLogs && Array.isArray(snapshot.data.auditLogs)) {
      db.exec('DELETE FROM audit_logs;');
      const stmt = db.prepare(`
        INSERT INTO audit_logs (
          id, timestamp, userId, userName, userRole, userRoleLabel, action,
          actionLabel, module, description, ipAddress, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const al of snapshot.data.auditLogs) {
        stmt.run(
          al.id,
          al.timestamp,
          al.userId,
          al.userName,
          al.userRole,
          al.userRoleLabel,
          al.action,
          al.actionLabel,
          al.module,
          al.description,
          al.ipAddress || null,
          al.status
        );
      }
    }

    db.exec('COMMIT;');
    return { success: true, message: 'Basis data berhasil dipulihkan secara utuh!' };
  } catch (error) {
    db.exec('ROLLBACK;');
    console.error('Failed to restore database snapshot:', error);
    return { success: false, message: 'Gagal memulihkan database. Transaksi dibatalkan.' };
  }
}
