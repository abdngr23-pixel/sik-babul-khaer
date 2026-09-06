import { createClient, Client, InStatement } from '@libsql/client';

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

const globalForTurso = globalThis as unknown as {
  tursoClient?: Client;
  tursoInitialized?: boolean;
};

/**
 * Check whether Turso Cloud credentials are provided via environment variables.
 */
export function isTursoConfigured(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL && process.env.TURSO_DATABASE_URL.trim().length > 0);
}

/**
 * Get singleton Turso client instance.
 */
export function getTursoClient(): Client | null {
  if (!isTursoConfigured()) {
    return null;
  }

  if (globalForTurso.tursoClient) {
    return globalForTurso.tursoClient;
  }

  const url = process.env.TURSO_DATABASE_URL!.trim();
  const authToken = process.env.TURSO_AUTH_TOKEN ? process.env.TURSO_AUTH_TOKEN.trim() : undefined;

  const client = createClient({
    url,
    authToken,
  });

  globalForTurso.tursoClient = client;
  return client;
}

/**
 * Initialize all 10 tables in Turso Cloud SQLite if they do not exist.
 * Auto-seeds initial mock data if empty.
 */
export async function initTursoSchema(client: Client): Promise<void> {
  if (globalForTurso.tursoInitialized) {
    return;
  }

  // 1. Letters Table
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
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
  await client.execute(`
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

  // 10. Meta KV Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS meta_kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Auto seed initial data if empty
  await seedTursoIfEmpty(client);

  globalForTurso.tursoInitialized = true;
}

async function seedTursoIfEmpty(client: Client): Promise<void> {
  // Letters
  const lettersRes = await client.execute('SELECT COUNT(*) as count FROM letters');
  const lettersCount = Number(lettersRes.rows[0]?.count || 0);

  if (lettersCount === 0 && INITIAL_LETTERS.length > 0) {
    const stmts: InStatement[] = INITIAL_LETTERS.map((l) => ({
      sql: `
        INSERT INTO letters (
          id, sequenceNumber, letterNumber, category, recipientName, recipientTitle,
          recipientAddress, subject, letterDate, attachmentCount, eventDate, eventTime,
          eventLocation, content, status, signatory1, signatory2, letterDetails,
          physicalArchiveLocation, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
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
        l.updatedAt,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // Minutes
  const minRes = await client.execute('SELECT COUNT(*) as count FROM minutes');
  const minCount = Number(minRes.rows[0]?.count || 0);
  if (minCount === 0 && INITIAL_MINUTES.length > 0) {
    const stmts: InStatement[] = INITIAL_MINUTES.map((m) => ({
      sql: `
        INSERT INTO minutes (
          id, title, date, location, attendees, summary, decisions, actionItems, rawNotes, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        m.id,
        m.title,
        m.date,
        m.location || null,
        m.attendees || null,
        m.summary,
        JSON.stringify(m.decisions || []),
        JSON.stringify(m.actionItems || []),
        m.rawNotes || null,
        m.createdAt,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // Jamaah
  const jamRes = await client.execute('SELECT COUNT(*) as count FROM jamaah');
  const jamCount = Number(jamRes.rows[0]?.count || 0);
  if (jamCount === 0 && INITIAL_JAMAAH.length > 0) {
    const stmts: InStatement[] = INITIAL_JAMAAH.map((j) => ({
      sql: `
        INSERT INTO jamaah (
          id, fullName, nik, gender, birthPlace, birthDate, rt, houseNumber,
          fullAddress, phone, email, residencyStatus, economicStatus, familyRole,
          familyMemberCount, occupation, bloodType, isYouthMember, notes,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
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
        j.updatedAt,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // Transactions
  const trxRes = await client.execute('SELECT COUNT(*) as count FROM transactions');
  const trxCount = Number(trxRes.rows[0]?.count || 0);
  if (trxCount === 0 && INITIAL_TRANSACTIONS.length > 0) {
    const stmts: InStatement[] = INITIAL_TRANSACTIONS.map((t) => ({
      sql: `
        INSERT INTO transactions (
          id, date, type, category, description, amount, receiptNumber, payerOrPayee,
          paymentMethod, balanceAfter, notes, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
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
        t.createdAt,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // Donors
  const donRes = await client.execute('SELECT COUNT(*) as count FROM donors');
  const donCount = Number(donRes.rows[0]?.count || 0);
  if (donCount === 0 && INITIAL_DONORS.length > 0) {
    const stmts: InStatement[] = INITIAL_DONORS.map((d) => ({
      sql: `
        INSERT INTO donors (
          id, donorName, phone, rt, address, category, commitmentAmount, billingDay,
          paymentMethod, status, lastPaymentDate, lastPaymentMonth, notes, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
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
        d.updatedAt,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // Assets
  const astRes = await client.execute('SELECT COUNT(*) as count FROM assets');
  const astCount = Number(astRes.rows[0]?.count || 0);
  if (astCount === 0 && INITIAL_ASSETS.length > 0) {
    const stmts: InStatement[] = INITIAL_ASSETS.map((a) => ({
      sql: `
        INSERT INTO assets (
          id, code, name, category, location, purchaseDate, purchaseCost,
          condition, maintenanceCycleMonths, lastMaintenanceDate, nextMaintenanceDate,
          maintenanceNotes, isMaintenanceDue, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
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
        a.updatedAt,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // Approvals
  const appRes = await client.execute('SELECT COUNT(*) as count FROM approvals');
  const appCount = Number(appRes.rows[0]?.count || 0);
  if (appCount === 0 && INITIAL_APPROVALS.length > 0) {
    const stmts: InStatement[] = INITIAL_APPROVALS.map((ap) => ({
      sql: `
        INSERT INTO approvals (
          id, type, title, referenceNumber, category, submittedBy, submittedRole,
          submittedAt, amount, description, status, dispositionNotes, verifiedBy, verifiedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
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
        ap.verifiedAt || null,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // Field KPIs
  const kpiRes = await client.execute('SELECT COUNT(*) as count FROM field_kpis');
  const kpiCount = Number(kpiRes.rows[0]?.count || 0);
  if (kpiCount === 0 && INITIAL_FIELD_KPIS.length > 0) {
    const stmts: InStatement[] = INITIAL_FIELD_KPIS.map((k) => ({
      sql: `
        INSERT INTO field_kpis (
          field, title, leaderName, score, status, summary, indicators, keyNotes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        k.field,
        k.title,
        k.leaderName,
        k.score,
        k.status,
        k.summary,
        JSON.stringify(k.indicators),
        JSON.stringify(k.keyNotes),
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // Audit Logs
  const audRes = await client.execute('SELECT COUNT(*) as count FROM audit_logs');
  const audCount = Number(audRes.rows[0]?.count || 0);
  if (audCount === 0 && INITIAL_AUDIT_LOGS.length > 0) {
    const stmts: InStatement[] = INITIAL_AUDIT_LOGS.map((al) => ({
      sql: `
        INSERT INTO audit_logs (
          id, timestamp, userId, userName, userRole, userRoleLabel, action,
          actionLabel, module, description, ipAddress, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
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
        al.status,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  await client.execute({
    sql: 'INSERT OR REPLACE INTO meta_kv (key, value) VALUES (?, ?)',
    args: ['turso_initialized_at', new Date().toISOString()],
  });
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

// ---------------- QUERY ALL DATA ----------------
export async function tursoLoadAllData(client: Client) {
  await initTursoSchema(client);

  const [
    lettersRes,
    minutesRes,
    jamaahRes,
    transactionsRes,
    donorsRes,
    assetsRes,
    approvalsRes,
    kpisRes,
    auditRes,
  ] = await Promise.all([
    client.execute('SELECT * FROM letters ORDER BY sequenceNumber DESC'),
    client.execute('SELECT * FROM minutes ORDER BY date DESC'),
    client.execute('SELECT * FROM jamaah ORDER BY fullName ASC'),
    client.execute('SELECT * FROM transactions ORDER BY date DESC'),
    client.execute('SELECT * FROM donors ORDER BY donorName ASC'),
    client.execute('SELECT * FROM assets ORDER BY code ASC'),
    client.execute('SELECT * FROM approvals ORDER BY submittedAt DESC'),
    client.execute('SELECT * FROM field_kpis'),
    client.execute('SELECT * FROM audit_logs ORDER BY timestamp DESC'),
  ]);

  return {
    letters: lettersRes.rows.map((r) => parseLetter(r as unknown as Record<string, unknown>)),
    minutes: minutesRes.rows.map((r) => parseMinute(r as unknown as Record<string, unknown>)),
    jamaah: jamaahRes.rows.map((r) => parseJamaah(r as unknown as Record<string, unknown>)),
    transactions: transactionsRes.rows.map((r) => parseTransaction(r as unknown as Record<string, unknown>)),
    donors: donorsRes.rows.map((r) => parseDonor(r as unknown as Record<string, unknown>)),
    assets: assetsRes.rows.map((r) => parseAsset(r as unknown as Record<string, unknown>)),
    approvals: approvalsRes.rows.map((r) => parseApproval(r as unknown as Record<string, unknown>)),
    fieldKPIs: kpisRes.rows.map((r) => parseKpi(r as unknown as Record<string, unknown>)),
    auditLogs: auditRes.rows.map((r) => parseAudit(r as unknown as Record<string, unknown>)),
  };
}

// ---------------- MUTATIONS ----------------

export async function tursoInsertLetter(client: Client, l: OfficialLetter): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO letters (
        id, sequenceNumber, letterNumber, category, recipientName, recipientTitle,
        recipientAddress, subject, letterDate, attachmentCount, eventDate, eventTime,
        eventLocation, content, status, signatory1, signatory2, letterDetails,
        physicalArchiveLocation, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
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
      l.updatedAt,
    ],
  });
}

export async function tursoUpdateLetterStatus(
  client: Client,
  id: string,
  status: LetterStatus,
  updatedAt: string
): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: 'UPDATE letters SET status = ?, updatedAt = ? WHERE id = ?',
    args: [status, updatedAt, id],
  });
}

export async function tursoInsertMinute(client: Client, m: MeetingMinutes): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO minutes (
        id, title, date, location, attendees, summary, decisions, actionItems, rawNotes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      m.id,
      m.title,
      m.date,
      m.location || null,
      m.attendees || null,
      m.summary,
      JSON.stringify(m.decisions || []),
      JSON.stringify(m.actionItems || []),
      m.rawNotes || null,
      m.createdAt,
    ],
  });
}

export async function tursoUpdateMinuteActionItems(
  client: Client,
  id: string,
  actionItems: unknown[]
): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: 'UPDATE minutes SET actionItems = ? WHERE id = ?',
    args: [JSON.stringify(actionItems), id],
  });
}

export async function tursoInsertJamaah(client: Client, j: Jamaah): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO jamaah (
        id, fullName, nik, gender, birthPlace, birthDate, rt, houseNumber,
        fullAddress, phone, email, residencyStatus, economicStatus, familyRole,
        familyMemberCount, occupation, bloodType, isYouthMember, notes,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
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
      j.updatedAt,
    ],
  });
}

export async function tursoInsertBulkJamaah(client: Client, list: Jamaah[]): Promise<void> {
  await initTursoSchema(client);
  const stmts: InStatement[] = list.map((j) => ({
    sql: `
      INSERT INTO jamaah (
        id, fullName, nik, gender, birthPlace, birthDate, rt, houseNumber,
        fullAddress, phone, email, residencyStatus, economicStatus, familyRole,
        familyMemberCount, occupation, bloodType, isYouthMember, notes,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
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
      j.updatedAt,
    ],
  }));
  await client.batch(stmts, 'write');
}

export async function tursoUpdateJamaah(client: Client, j: Jamaah): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE jamaah SET
        fullName = ?, nik = ?, gender = ?, birthPlace = ?, birthDate = ?,
        rt = ?, houseNumber = ?, fullAddress = ?, phone = ?, email = ?,
        residencyStatus = ?, economicStatus = ?, familyRole = ?, familyMemberCount = ?,
        occupation = ?, bloodType = ?, isYouthMember = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `,
    args: [
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
      j.id,
    ],
  });
}

export async function tursoDeleteJamaah(client: Client, id: string): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: 'DELETE FROM jamaah WHERE id = ?',
    args: [id],
  });
}

export async function tursoInsertTransaction(client: Client, t: FinanceTransaction): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO transactions (
        id, date, type, category, description, amount, receiptNumber, payerOrPayee,
        paymentMethod, balanceAfter, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
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
      t.createdAt,
    ],
  });
}

export async function tursoUpdateTransaction(client: Client, t: FinanceTransaction): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE transactions SET
        date = ?, type = ?, category = ?, description = ?, amount = ?,
        receiptNumber = ?, payerOrPayee = ?, paymentMethod = ?, balanceAfter = ?, notes = ?
      WHERE id = ?
    `,
    args: [
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
      t.id,
    ],
  });
}

export async function tursoDeleteTransaction(client: Client, id: string): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: 'DELETE FROM transactions WHERE id = ?',
    args: [id],
  });
}

export async function tursoInsertDonor(client: Client, d: DonorItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO donors (
        id, donorName, phone, rt, address, category, commitmentAmount, billingDay,
        paymentMethod, status, lastPaymentDate, lastPaymentMonth, notes, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
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
      d.updatedAt,
    ],
  });
}

export async function tursoUpdateDonor(client: Client, d: DonorItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE donors SET
        donorName = ?, phone = ?, rt = ?, address = ?, category = ?,
        commitmentAmount = ?, billingDay = ?, paymentMethod = ?, status = ?,
        lastPaymentDate = ?, lastPaymentMonth = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `,
    args: [
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
      d.id,
    ],
  });
}

export async function tursoDeleteDonor(client: Client, id: string): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: 'DELETE FROM donors WHERE id = ?',
    args: [id],
  });
}

export async function tursoInsertAsset(client: Client, a: AssetItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO assets (
        id, code, name, category, location, purchaseDate, purchaseCost,
        condition, maintenanceCycleMonths, lastMaintenanceDate, nextMaintenanceDate,
        maintenanceNotes, isMaintenanceDue, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
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
      a.updatedAt,
    ],
  });
}

export async function tursoUpdateAsset(client: Client, a: AssetItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE assets SET
        code = ?, name = ?, category = ?, location = ?, purchaseDate = ?,
        purchaseCost = ?, condition = ?, maintenanceCycleMonths = ?,
        lastMaintenanceDate = ?, nextMaintenanceDate = ?, maintenanceNotes = ?,
        isMaintenanceDue = ?, updatedAt = ?
      WHERE id = ?
    `,
    args: [
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
      a.id,
    ],
  });
}

export async function tursoDeleteAsset(client: Client, id: string): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: 'DELETE FROM assets WHERE id = ?',
    args: [id],
  });
}

export async function tursoInsertApproval(client: Client, ap: ApprovalItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO approvals (
        id, type, title, referenceNumber, category, submittedBy, submittedRole,
        submittedAt, amount, description, status, dispositionNotes, verifiedBy, verifiedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
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
      ap.verifiedAt || null,
    ],
  });
}

export async function tursoUpdateApproval(client: Client, ap: ApprovalItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE approvals SET
        status = ?, dispositionNotes = ?, verifiedBy = ?, verifiedAt = ?
      WHERE id = ?
    `,
    args: [
      ap.status,
      ap.dispositionNotes || null,
      ap.verifiedBy || null,
      ap.verifiedAt || null,
      ap.id,
    ],
  });
}

export async function tursoInsertAuditLog(client: Client, al: AuditLogEntry): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO audit_logs (
        id, timestamp, userId, userName, userRole, userRoleLabel, action,
        actionLabel, module, description, ipAddress, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
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
      al.status,
    ],
  });
}

// ---------------- DATABASE STATS HELPER ----------------
export async function tursoGetDatabaseStats(client: Client) {
  await initTursoSchema(client);

  const getCount = async (tbl: string) => {
    try {
      const res = await client.execute(`SELECT COUNT(*) as count FROM ${tbl}`);
      return Number(res.rows[0]?.count || 0);
    } catch {
      return 0;
    }
  };

  const [
    totalLetters,
    totalMinutes,
    totalJamaah,
    totalTransactions,
    totalDonors,
    totalAssets,
    totalApprovals,
    totalAuditLogs,
  ] = await Promise.all([
    getCount('letters'),
    getCount('minutes'),
    getCount('jamaah'),
    getCount('transactions'),
    getCount('donors'),
    getCount('assets'),
    getCount('approvals'),
    getCount('audit_logs'),
  ]);

  const rawUrl = process.env.TURSO_DATABASE_URL || '';
  const maskedUrl = rawUrl.replace(/(libsql:\/\/[^.]+)\..*/, '$1.turso.io');

  return {
    engine: 'turso_cloud' as const,
    engineLabel: 'Turso Cloud LibSQL (Permanen)',
    path: maskedUrl || 'Turso Cloud Database',
    sizeBytes: 0, // LibSQL remote manages size in cloud
    cloudConnected: true,
    totalLetters,
    totalMinutes,
    totalJamaah,
    totalTransactions,
    totalDonors,
    totalAssets,
    totalApprovals,
    totalAuditLogs,
  };
}

// ---------------- EXPORT SNAPSHOT ----------------
export async function tursoExportDatabaseSnapshot(client: Client) {
  const loaded = await tursoLoadAllData(client);
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    mosqueName: 'Masjid Babul Khaer BTP Blok AE Makassar',
    engine: 'turso_cloud',
    data: loaded,
  };
}

// ---------------- RESTORE SNAPSHOT ----------------
export async function tursoRestoreDatabaseSnapshot(
  client: Client,
  snapshot: {
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
  }
): Promise<{ success: boolean; message: string }> {
  await initTursoSchema(client);

  try {
    const batchStatements: InStatement[] = [];

    // Letters
    if (snapshot.data.letters && Array.isArray(snapshot.data.letters)) {
      batchStatements.push({ sql: 'DELETE FROM letters;', args: [] });
      for (const l of snapshot.data.letters) {
        batchStatements.push({
          sql: `
            INSERT INTO letters (
              id, sequenceNumber, letterNumber, category, recipientName, recipientTitle,
              recipientAddress, subject, letterDate, attachmentCount, eventDate, eventTime,
              eventLocation, content, status, signatory1, signatory2, letterDetails,
              physicalArchiveLocation, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
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
            l.updatedAt,
          ],
        });
      }
    }

    // Minutes
    if (snapshot.data.minutes && Array.isArray(snapshot.data.minutes)) {
      batchStatements.push({ sql: 'DELETE FROM minutes;', args: [] });
      for (const m of snapshot.data.minutes) {
        batchStatements.push({
          sql: `
            INSERT INTO minutes (
              id, title, date, location, attendees, summary, decisions, actionItems, rawNotes, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            m.id,
            m.title,
            m.date,
            m.location || null,
            m.attendees || null,
            m.summary,
            JSON.stringify(m.decisions || []),
            JSON.stringify(m.actionItems || []),
            m.rawNotes || null,
            m.createdAt,
          ],
        });
      }
    }

    // Jamaah
    if (snapshot.data.jamaah && Array.isArray(snapshot.data.jamaah)) {
      batchStatements.push({ sql: 'DELETE FROM jamaah;', args: [] });
      for (const j of snapshot.data.jamaah) {
        batchStatements.push({
          sql: `
            INSERT INTO jamaah (
              id, fullName, nik, gender, birthPlace, birthDate, rt, houseNumber,
              fullAddress, phone, email, residencyStatus, economicStatus, familyRole,
              familyMemberCount, occupation, bloodType, isYouthMember, notes,
              createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
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
            j.updatedAt,
          ],
        });
      }
    }

    // Transactions
    if (snapshot.data.transactions && Array.isArray(snapshot.data.transactions)) {
      batchStatements.push({ sql: 'DELETE FROM transactions;', args: [] });
      for (const t of snapshot.data.transactions) {
        batchStatements.push({
          sql: `
            INSERT INTO transactions (
              id, date, type, category, description, amount, receiptNumber, payerOrPayee,
              paymentMethod, balanceAfter, notes, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
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
            t.createdAt,
          ],
        });
      }
    }

    // Donors
    if (snapshot.data.donors && Array.isArray(snapshot.data.donors)) {
      batchStatements.push({ sql: 'DELETE FROM donors;', args: [] });
      for (const d of snapshot.data.donors) {
        batchStatements.push({
          sql: `
            INSERT INTO donors (
              id, donorName, phone, rt, address, category, commitmentAmount, billingDay,
              paymentMethod, status, lastPaymentDate, lastPaymentMonth, notes, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
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
            d.updatedAt,
          ],
        });
      }
    }

    // Assets
    if (snapshot.data.assets && Array.isArray(snapshot.data.assets)) {
      batchStatements.push({ sql: 'DELETE FROM assets;', args: [] });
      for (const a of snapshot.data.assets) {
        batchStatements.push({
          sql: `
            INSERT INTO assets (
              id, code, name, category, location, purchaseDate, purchaseCost,
              condition, maintenanceCycleMonths, lastMaintenanceDate, nextMaintenanceDate,
              maintenanceNotes, isMaintenanceDue, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
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
            a.updatedAt,
          ],
        });
      }
    }

    // Approvals
    if (snapshot.data.approvals && Array.isArray(snapshot.data.approvals)) {
      batchStatements.push({ sql: 'DELETE FROM approvals;', args: [] });
      for (const ap of snapshot.data.approvals) {
        batchStatements.push({
          sql: `
            INSERT INTO approvals (
              id, type, title, referenceNumber, category, submittedBy, submittedRole,
              submittedAt, amount, description, status, dispositionNotes, verifiedBy, verifiedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
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
            ap.verifiedAt || null,
          ],
        });
      }
    }

    // Field KPIs
    if (snapshot.data.fieldKPIs && Array.isArray(snapshot.data.fieldKPIs)) {
      batchStatements.push({ sql: 'DELETE FROM field_kpis;', args: [] });
      for (const k of snapshot.data.fieldKPIs) {
        batchStatements.push({
          sql: `
            INSERT INTO field_kpis (
              field, title, leaderName, score, status, summary, indicators, keyNotes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            k.field,
            k.title,
            k.leaderName,
            k.score,
            k.status,
            k.summary,
            JSON.stringify(k.indicators),
            JSON.stringify(k.keyNotes),
          ],
        });
      }
    }

    // Audit Logs
    if (snapshot.data.auditLogs && Array.isArray(snapshot.data.auditLogs)) {
      batchStatements.push({ sql: 'DELETE FROM audit_logs;', args: [] });
      for (const al of snapshot.data.auditLogs) {
        batchStatements.push({
          sql: `
            INSERT INTO audit_logs (
              id, timestamp, userId, userName, userRole, userRoleLabel, action,
              actionLabel, module, description, ipAddress, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
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
            al.status,
          ],
        });
      }
    }

    // Execute in chunks if needed (LibSQL handles up to hundreds of statements in 1 batch)
    const chunkSize = 100;
    for (let i = 0; i < batchStatements.length; i += chunkSize) {
      const chunk = batchStatements.slice(i, i + chunkSize);
      await client.batch(chunk, 'write');
    }

    return {
      success: true,
      message: `Berhasil memulihkan ${batchStatements.length} data ke basis data Turso Cloud.`,
    };
  } catch (error) {
    console.error('Failed to restore snapshot to Turso Cloud:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Terjadi kegagalan saat memulihkan ke Turso Cloud',
    };
  }
}
