import { createClient, Client, InStatement } from '@libsql/client';

// Mock initial data for seeding on first initialization
import { INITIAL_LETTERS, INITIAL_MINUTES } from './mock-data';
import { INITIAL_JAMAAH } from './mock-jamaah';
import { INITIAL_TRANSACTIONS } from './mock-finance';
import { INITIAL_DONORS } from './mock-donors';
import { INITIAL_ASSETS } from './mock-assets';
import { INITIAL_APPROVALS, INITIAL_FIELD_KPIS } from './mock-reports';
import { INITIAL_AUDIT_LOGS, OFFICIAL_USERS } from './mock-auth';
import {
  INITIAL_KHATIB_DATABASE,
  INITIAL_FRIDAY_SCHEDULES,
  INITIAL_RAMADHAN_SCHEDULES,
  INITIAL_KAJIAN_SCHEDULES,
} from './mock-dakwah';
import { INITIAL_PHYSICAL_PROJECTS } from './mock-projects';
import { INITIAL_SSS_CANS, INITIAL_SSS_RECORDS, INITIAL_ZISWAF_AIDS } from './mock-ziswaf';

// Types
import { OfficialLetter, MeetingMinutes, LetterStatus } from '@/types/letter';
import { Jamaah } from '@/types/jamaah';
import { FinanceTransaction } from '@/types/finance';
import { DonorItem } from '@/types/donor';
import { AssetItem } from '@/types/asset';
import { ApprovalItem, FieldKPI } from '@/types/reports';
import { AuditLogEntry, User, UserRole } from '@/types/auth';
import {
  KhatibItem,
  FridayScheduleItem,
  RamadhanScheduleItem,
  KajianScheduleItem,
} from '@/types/dakwah';
import { PhysicalProjectItem } from '@/types/project';
import { SSSCanItem, SSSCollectionRecord, ZiswafAidItem } from '@/types/ziswaf';

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

  // 11. Khatib Database Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS khatib_database (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      specialization TEXT NOT NULL,
      institution TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      totalAppearances INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      notes TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  // 12. Friday Schedules Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS friday_schedules (
      id TEXT PRIMARY KEY,
      year INTEGER,
      date TEXT NOT NULL,
      dateHijri TEXT NOT NULL,
      khatibName TEXT NOT NULL,
      khatibTitle TEXT,
      imamName TEXT NOT NULL,
      khutbahTopic TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL,
      incentiveAmount REAL NOT NULL DEFAULT 0,
      notes TEXT,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      attendanceCount INTEGER,
      actualHonorDisbursed REAL,
      summaryNotes TEXT,
      completedAt TEXT
    );
  `);

  // 13. Ramadhan Schedules Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ramadhan_schedules (
      id TEXT PRIMARY KEY,
      year INTEGER,
      hijriYear TEXT,
      nightNumber INTEGER NOT NULL,
      date TEXT NOT NULL,
      penceramahTarawih TEXT NOT NULL,
      topicKultum TEXT NOT NULL,
      honorPenceramah REAL NOT NULL DEFAULT 0,
      imamTarawih TEXT NOT NULL,
      honorImamTarawih REAL NOT NULL DEFAULT 0,
      bukberHost TEXT NOT NULL,
      bukberPax INTEGER NOT NULL DEFAULT 0,
      itikafStatus TEXT,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      attendanceCount INTEGER,
      actualHonorDisbursed REAL,
      summaryNotes TEXT,
      completedAt TEXT
    );
  `);

  // 14. Kajian Schedules Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS kajian_schedules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      speakerName TEXT NOT NULL,
      speakerTitle TEXT,
      bookOrTopic TEXT NOT NULL,
      dayTime TEXT NOT NULL,
      location TEXT NOT NULL,
      fundingSource TEXT NOT NULL,
      contactPerson TEXT NOT NULL,
      notes TEXT,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      attendanceCount INTEGER,
      actualHonorDisbursed REAL,
      summaryNotes TEXT,
      completedAt TEXT
    );
  `);

  // 15. Physical Projects Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS physical_projects (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      allocatedBudget REAL NOT NULL DEFAULT 0,
      realizedBudget REAL NOT NULL DEFAULT 0,
      progressPercentage REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      urgencyLevel TEXT NOT NULL,
      responsiblePerson TEXT NOT NULL,
      contractorVendor TEXT,
      startDate TEXT NOT NULL,
      targetEndDate TEXT NOT NULL,
      description TEXT NOT NULL,
      milestones TEXT NOT NULL,
      notes TEXT,
      updatedAt TEXT NOT NULL
    );
  `);

  // 16. SSS Cans Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS sss_cans (
      id TEXT PRIMARY KEY,
      canCode TEXT NOT NULL,
      rt TEXT NOT NULL,
      houseNumber TEXT NOT NULL,
      holderName TEXT NOT NULL,
      phone TEXT NOT NULL,
      distributionDate TEXT NOT NULL,
      lastCollectionDate TEXT NOT NULL,
      lastAmount REAL NOT NULL DEFAULT 0,
      totalCollected REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL,
      collectorOfficer TEXT NOT NULL,
      notes TEXT NOT NULL
    );
  `);

  // 17. SSS Records Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS sss_records (
      id TEXT PRIMARY KEY,
      canId TEXT NOT NULL,
      canCode TEXT NOT NULL,
      collectionDate TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      rt TEXT NOT NULL,
      collector TEXT NOT NULL,
      depositedToCash INTEGER NOT NULL DEFAULT 0,
      notes TEXT
    );
  `);

  // 18. Ziswaf Aids Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS ziswaf_aids (
      id TEXT PRIMARY KEY,
      aidNumber TEXT NOT NULL,
      jamaahId TEXT,
      recipientName TEXT NOT NULL,
      recipientCategory TEXT NOT NULL,
      rt TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      aidType TEXT NOT NULL,
      amountValue REAL NOT NULL DEFAULT 0,
      goodsDescription TEXT,
      distributionDate TEXT NOT NULL,
      disbursedBy TEXT NOT NULL,
      status TEXT NOT NULL,
      receiptNumber TEXT,
      notes TEXT NOT NULL
    );
  `);

  // 19. Users Table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      role TEXT NOT NULL,
      roleLabel TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      department TEXT NOT NULL,
      isReadOnly INTEGER DEFAULT 0,
      pinHash TEXT NOT NULL,
      status TEXT DEFAULT 'AKTIF',
      bio TEXT,
      avatarUrl TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
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

  // 11. Khatib Database
  const ktbRes = await client.execute('SELECT COUNT(*) as count FROM khatib_database');
  const ktbCount = Number(ktbRes.rows[0]?.count || 0);
  if (ktbCount === 0 && INITIAL_KHATIB_DATABASE.length > 0) {
    const stmts: InStatement[] = INITIAL_KHATIB_DATABASE.map((k) => ({
      sql: `
        INSERT INTO khatib_database (
          id, name, title, specialization, institution, phone, address,
          totalAppearances, status, notes, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        k.id,
        k.name,
        k.title,
        k.specialization,
        k.institution,
        k.phone,
        k.address,
        k.totalAppearances || 0,
        k.status,
        k.notes || null,
        k.createdAt,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // 12. Friday Schedules
  const friRes = await client.execute('SELECT COUNT(*) as count FROM friday_schedules');
  const friCount = Number(friRes.rows[0]?.count || 0);
  if (friCount === 0 && INITIAL_FRIDAY_SCHEDULES.length > 0) {
    const stmts: InStatement[] = INITIAL_FRIDAY_SCHEDULES.map((f) => ({
      sql: `
        INSERT INTO friday_schedules (
          id, year, date, dateHijri, khatibName, khatibTitle, imamName, khutbahTopic,
          phone, status, incentiveAmount, notes, isCompleted, attendanceCount,
          actualHonorDisbursed, summaryNotes, completedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        f.id,
        f.year || 2026,
        f.date,
        f.dateHijri,
        f.khatibName,
        f.khatibTitle || null,
        f.imamName,
        f.khutbahTopic,
        f.phone,
        f.status,
        f.incentiveAmount || 0,
        f.notes || null,
        f.isCompleted ? 1 : 0,
        f.attendanceCount || null,
        f.actualHonorDisbursed || null,
        f.summaryNotes || null,
        f.completedAt || null,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // 13. Ramadhan Schedules
  const ramRes = await client.execute('SELECT COUNT(*) as count FROM ramadhan_schedules');
  const ramCount = Number(ramRes.rows[0]?.count || 0);
  if (ramCount === 0 && INITIAL_RAMADHAN_SCHEDULES.length > 0) {
    const stmts: InStatement[] = INITIAL_RAMADHAN_SCHEDULES.map((r) => ({
      sql: `
        INSERT INTO ramadhan_schedules (
          id, year, hijriYear, nightNumber, date, penceramahTarawih, topicKultum,
          honorPenceramah, imamTarawih, honorImamTarawih, bukberHost, bukberPax,
          itikafStatus, isCompleted, attendanceCount, actualHonorDisbursed, summaryNotes, completedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        r.id,
        r.year || 2026,
        r.hijriYear || '1448 H',
        r.nightNumber,
        r.date,
        r.penceramahTarawih,
        r.topicKultum,
        r.honorPenceramah || 0,
        r.imamTarawih,
        r.honorImamTarawih || 0,
        r.bukberHost,
        r.bukberPax || 0,
        r.itikafStatus || null,
        r.isCompleted ? 1 : 0,
        r.attendanceCount || null,
        r.actualHonorDisbursed || null,
        r.summaryNotes || null,
        r.completedAt || null,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // 14. Kajian Schedules
  const kajRes = await client.execute('SELECT COUNT(*) as count FROM kajian_schedules');
  const kajCount = Number(kajRes.rows[0]?.count || 0);
  if (kajCount === 0 && INITIAL_KAJIAN_SCHEDULES.length > 0) {
    const stmts: InStatement[] = INITIAL_KAJIAN_SCHEDULES.map((k) => ({
      sql: `
        INSERT INTO kajian_schedules (
          id, title, type, speakerName, speakerTitle, bookOrTopic, dayTime,
          location, fundingSource, contactPerson, notes, isCompleted,
          attendanceCount, actualHonorDisbursed, summaryNotes, completedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        k.id,
        k.title,
        k.type,
        k.speakerName,
        k.speakerTitle || null,
        k.bookOrTopic,
        k.dayTime,
        k.location,
        k.fundingSource,
        k.contactPerson,
        k.notes || null,
        k.isCompleted ? 1 : 0,
        k.attendanceCount || null,
        k.actualHonorDisbursed || null,
        k.summaryNotes || null,
        k.completedAt || null,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // 15. Physical Projects
  const prjRes = await client.execute('SELECT COUNT(*) as count FROM physical_projects');
  const prjCount = Number(prjRes.rows[0]?.count || 0);
  if (prjCount === 0 && INITIAL_PHYSICAL_PROJECTS.length > 0) {
    const stmts: InStatement[] = INITIAL_PHYSICAL_PROJECTS.map((p) => ({
      sql: `
        INSERT INTO physical_projects (
          id, code, title, category, allocatedBudget, realizedBudget, progressPercentage,
          status, urgencyLevel, responsiblePerson, contractorVendor, startDate,
          targetEndDate, description, milestones, notes, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        p.id,
        p.code,
        p.title,
        p.category,
        p.allocatedBudget || 0,
        p.realizedBudget || 0,
        p.progressPercentage || 0,
        p.status,
        p.urgencyLevel,
        p.responsiblePerson,
        p.contractorVendor || null,
        p.startDate,
        p.targetEndDate,
        p.description,
        JSON.stringify(p.milestones || []),
        p.notes || null,
        p.updatedAt,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // 16. SSS Cans
  const sssRes = await client.execute('SELECT COUNT(*) as count FROM sss_cans');
  const sssCount = Number(sssRes.rows[0]?.count || 0);
  if (sssCount === 0 && INITIAL_SSS_CANS.length > 0) {
    const stmts: InStatement[] = INITIAL_SSS_CANS.map((s) => ({
      sql: `
        INSERT INTO sss_cans (
          id, canCode, rt, houseNumber, holderName, phone, distributionDate,
          lastCollectionDate, lastAmount, totalCollected, status, collectorOfficer, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        s.id,
        s.canCode,
        s.rt,
        s.houseNumber,
        s.holderName,
        s.phone,
        s.distributionDate,
        s.lastCollectionDate,
        s.lastAmount || 0,
        s.totalCollected || 0,
        s.status,
        s.collectorOfficer,
        s.notes,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // 17. SSS Records
  const recRes = await client.execute('SELECT COUNT(*) as count FROM sss_records');
  const recCount = Number(recRes.rows[0]?.count || 0);
  if (recCount === 0 && INITIAL_SSS_RECORDS.length > 0) {
    const stmts: InStatement[] = INITIAL_SSS_RECORDS.map((r) => ({
      sql: `
        INSERT INTO sss_records (
          id, canId, canCode, collectionDate, amount, rt, collector, depositedToCash, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        r.id,
        r.canId,
        r.canCode,
        r.collectionDate,
        r.amount,
        r.rt,
        r.collector,
        r.depositedToCash ? 1 : 0,
        r.notes || null,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // 18. Ziswaf Aids
  const aidRes = await client.execute('SELECT COUNT(*) as count FROM ziswaf_aids');
  const aidCount = Number(aidRes.rows[0]?.count || 0);
  if (aidCount === 0 && INITIAL_ZISWAF_AIDS.length > 0) {
    const stmts: InStatement[] = INITIAL_ZISWAF_AIDS.map((a) => ({
      sql: `
        INSERT INTO ziswaf_aids (
          id, aidNumber, jamaahId, recipientName, recipientCategory, rt, address,
          phone, aidType, amountValue, goodsDescription, distributionDate,
          disbursedBy, status, receiptNumber, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        a.id,
        a.aidNumber,
        a.jamaahId || null,
        a.recipientName,
        a.recipientCategory,
        a.rt,
        a.address,
        a.phone || null,
        a.aidType,
        a.amountValue || 0,
        a.goodsDescription || null,
        a.distributionDate,
        a.disbursedBy,
        a.status,
        a.receiptNumber || null,
        a.notes,
      ],
    }));
    await client.batch(stmts, 'write');
  }

  // 19. Users
  const userRes = await client.execute('SELECT COUNT(*) as count FROM users');
  const userCount = Number(userRes.rows[0]?.count || 0);
  if (userCount === 0 && OFFICIAL_USERS.length > 0) {
    const now = new Date().toISOString();
    const stmts: InStatement[] = OFFICIAL_USERS.map((u) => ({
      sql: `
        INSERT INTO users (
          id, name, title, role, roleLabel, email, phone, department,
          isReadOnly, pinHash, status, bio, avatarUrl, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        u.id,
        u.name,
        u.title,
        u.role,
        u.roleLabel,
        u.email,
        u.phone,
        u.department,
        u.isReadOnly ? 1 : 0,
        u.pinHash || '',
        u.status || 'AKTIF',
        u.bio || null,
        u.avatarUrl || null,
        now,
        now,
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

const parseKhatib = (r: Record<string, unknown>): KhatibItem => ({
  id: r.id as string,
  name: r.name as string,
  title: r.title as string,
  specialization: r.specialization as string,
  institution: r.institution as string,
  phone: r.phone as string,
  address: r.address as string,
  totalAppearances: Number(r.totalAppearances || 0),
  status: r.status as KhatibItem['status'],
  notes: (r.notes as string) || undefined,
  createdAt: r.createdAt as string,
});

const parseFridaySchedule = (r: Record<string, unknown>): FridayScheduleItem => ({
  id: r.id as string,
  year: r.year ? Number(r.year) : undefined,
  date: r.date as string,
  dateHijri: r.dateHijri as string,
  khatibName: r.khatibName as string,
  khatibTitle: (r.khatibTitle as string) || undefined,
  imamName: r.imamName as string,
  khutbahTopic: r.khutbahTopic as string,
  phone: r.phone as string,
  status: r.status as FridayScheduleItem['status'],
  incentiveAmount: Number(r.incentiveAmount || 0),
  notes: (r.notes as string) || undefined,
  isCompleted: Boolean(r.isCompleted),
  attendanceCount: r.attendanceCount ? Number(r.attendanceCount) : undefined,
  actualHonorDisbursed: r.actualHonorDisbursed ? Number(r.actualHonorDisbursed) : undefined,
  summaryNotes: (r.summaryNotes as string) || undefined,
  completedAt: (r.completedAt as string) || undefined,
});

const parseRamadhanSchedule = (r: Record<string, unknown>): RamadhanScheduleItem => ({
  id: r.id as string,
  year: r.year ? Number(r.year) : undefined,
  hijriYear: (r.hijriYear as string) || undefined,
  nightNumber: Number(r.nightNumber || 0),
  date: r.date as string,
  penceramahTarawih: r.penceramahTarawih as string,
  topicKultum: r.topicKultum as string,
  honorPenceramah: Number(r.honorPenceramah || 0),
  imamTarawih: r.imamTarawih as string,
  honorImamTarawih: Number(r.honorImamTarawih || 0),
  bukberHost: r.bukberHost as string,
  bukberPax: Number(r.bukberPax || 0),
  itikafStatus: (r.itikafStatus as RamadhanScheduleItem['itikafStatus']) || undefined,
  isCompleted: Boolean(r.isCompleted),
  attendanceCount: r.attendanceCount ? Number(r.attendanceCount) : undefined,
  actualHonorDisbursed: r.actualHonorDisbursed ? Number(r.actualHonorDisbursed) : undefined,
  summaryNotes: (r.summaryNotes as string) || undefined,
  completedAt: (r.completedAt as string) || undefined,
});

const parseKajianSchedule = (r: Record<string, unknown>): KajianScheduleItem => ({
  id: r.id as string,
  title: r.title as string,
  type: r.type as KajianScheduleItem['type'],
  speakerName: r.speakerName as string,
  speakerTitle: (r.speakerTitle as string) || undefined,
  bookOrTopic: r.bookOrTopic as string,
  dayTime: r.dayTime as string,
  location: r.location as string,
  fundingSource: r.fundingSource as KajianScheduleItem['fundingSource'],
  contactPerson: r.contactPerson as string,
  notes: (r.notes as string) || undefined,
  isCompleted: Boolean(r.isCompleted),
  attendanceCount: r.attendanceCount ? Number(r.attendanceCount) : undefined,
  actualHonorDisbursed: r.actualHonorDisbursed ? Number(r.actualHonorDisbursed) : undefined,
  summaryNotes: (r.summaryNotes as string) || undefined,
  completedAt: (r.completedAt as string) || undefined,
});

const parsePhysicalProject = (r: Record<string, unknown>): PhysicalProjectItem => ({
  id: r.id as string,
  code: r.code as string,
  title: r.title as string,
  category: r.category as PhysicalProjectItem['category'],
  allocatedBudget: Number(r.allocatedBudget || 0),
  realizedBudget: Number(r.realizedBudget || 0),
  progressPercentage: Number(r.progressPercentage || 0),
  status: r.status as PhysicalProjectItem['status'],
  urgencyLevel: r.urgencyLevel as PhysicalProjectItem['urgencyLevel'],
  responsiblePerson: r.responsiblePerson as string,
  contractorVendor: (r.contractorVendor as string) || undefined,
  startDate: r.startDate as string,
  targetEndDate: r.targetEndDate as string,
  description: r.description as string,
  milestones: JSON.parse((r.milestones as string) || '[]'),
  notes: (r.notes as string) || undefined,
  updatedAt: r.updatedAt as string,
});

const parseSSSCan = (r: Record<string, unknown>): SSSCanItem => ({
  id: r.id as string,
  canCode: r.canCode as string,
  rt: r.rt as SSSCanItem['rt'],
  houseNumber: r.houseNumber as string,
  holderName: r.holderName as string,
  phone: r.phone as string,
  distributionDate: r.distributionDate as string,
  lastCollectionDate: r.lastCollectionDate as string,
  lastAmount: Number(r.lastAmount || 0),
  totalCollected: Number(r.totalCollected || 0),
  status: r.status as SSSCanItem['status'],
  collectorOfficer: r.collectorOfficer as string,
  notes: (r.notes as string) || '',
});

const parseSSSRecord = (r: Record<string, unknown>): SSSCollectionRecord => ({
  id: r.id as string,
  canId: r.canId as string,
  canCode: r.canCode as string,
  collectionDate: r.collectionDate as string,
  amount: Number(r.amount || 0),
  rt: r.rt as SSSCollectionRecord['rt'],
  collector: r.collector as string,
  depositedToCash: Boolean(r.depositedToCash),
  notes: (r.notes as string) || undefined,
});

const parseZiswafAid = (r: Record<string, unknown>): ZiswafAidItem => ({
  id: r.id as string,
  aidNumber: r.aidNumber as string,
  jamaahId: (r.jamaahId as string) || undefined,
  recipientName: r.recipientName as string,
  recipientCategory: r.recipientCategory as ZiswafAidItem['recipientCategory'],
  rt: r.rt as ZiswafAidItem['rt'],
  address: r.address as string,
  phone: (r.phone as string) || undefined,
  aidType: r.aidType as ZiswafAidItem['aidType'],
  amountValue: Number(r.amountValue || 0),
  goodsDescription: (r.goodsDescription as string) || undefined,
  distributionDate: r.distributionDate as string,
  disbursedBy: r.disbursedBy as string,
  status: r.status as ZiswafAidItem['status'],
  receiptNumber: (r.receiptNumber as string) || undefined,
  notes: (r.notes as string) || '',
});

const parseUser = (r: Record<string, unknown>): User => ({
  id: r.id as string,
  name: r.name as string,
  title: r.title as string,
  role: r.role as UserRole,
  roleLabel: r.roleLabel as string,
  email: r.email as string,
  phone: r.phone as string,
  department: r.department as string,
  isReadOnly: Boolean(r.isReadOnly),
  pinHash: (r.pinHash as string) || undefined,
  status: (r.status as 'AKTIF' | 'NON_AKTIF') || 'AKTIF',
  bio: (r.bio as string) || undefined,
  avatarUrl: (r.avatarUrl as string) || undefined,
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
    khatibRes,
    fridayRes,
    ramadhanRes,
    kajianRes,
    projectsRes,
    cansRes,
    recordsRes,
    aidsRes,
    usersRes,
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
    client.execute('SELECT * FROM khatib_database ORDER BY name ASC'),
    client.execute('SELECT * FROM friday_schedules ORDER BY date ASC'),
    client.execute('SELECT * FROM ramadhan_schedules ORDER BY nightNumber ASC'),
    client.execute('SELECT * FROM kajian_schedules ORDER BY id ASC'),
    client.execute('SELECT * FROM physical_projects ORDER BY code ASC'),
    client.execute('SELECT * FROM sss_cans ORDER BY canCode ASC'),
    client.execute('SELECT * FROM sss_records ORDER BY collectionDate DESC'),
    client.execute('SELECT * FROM ziswaf_aids ORDER BY distributionDate DESC'),
    client.execute('SELECT * FROM users ORDER BY id ASC'),
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
    khatibList: khatibRes.rows.map((r) => parseKhatib(r as unknown as Record<string, unknown>)),
    fridaySchedules: fridayRes.rows.map((r) => parseFridaySchedule(r as unknown as Record<string, unknown>)),
    ramadhanSchedules: ramadhanRes.rows.map((r) => parseRamadhanSchedule(r as unknown as Record<string, unknown>)),
    kajianSchedules: kajianRes.rows.map((r) => parseKajianSchedule(r as unknown as Record<string, unknown>)),
    physicalProjects: projectsRes.rows.map((r) => parsePhysicalProject(r as unknown as Record<string, unknown>)),
    sssCans: cansRes.rows.map((r) => parseSSSCan(r as unknown as Record<string, unknown>)),
    sssRecords: recordsRes.rows.map((r) => parseSSSRecord(r as unknown as Record<string, unknown>)),
    ziswafAids: aidsRes.rows.map((r) => parseZiswafAid(r as unknown as Record<string, unknown>)),
    users: usersRes.rows.map((r) => parseUser(r as unknown as Record<string, unknown>)),
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

// ---------------- DAKWAH MUTATIONS ----------------

export async function tursoInsertKhatib(client: Client, k: KhatibItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO khatib_database (
        id, name, title, specialization, institution, phone, address,
        totalAppearances, status, notes, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      k.id,
      k.name,
      k.title,
      k.specialization,
      k.institution,
      k.phone,
      k.address,
      k.totalAppearances || 0,
      k.status,
      k.notes || null,
      k.createdAt,
    ],
  });
}

export async function tursoUpdateKhatib(client: Client, k: KhatibItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE khatib_database SET
        name = ?, title = ?, specialization = ?, institution = ?,
        phone = ?, address = ?, totalAppearances = ?, status = ?, notes = ?
      WHERE id = ?
    `,
    args: [
      k.name,
      k.title,
      k.specialization,
      k.institution,
      k.phone,
      k.address,
      k.totalAppearances || 0,
      k.status,
      k.notes || null,
      k.id,
    ],
  });
}

export async function tursoDeleteKhatib(client: Client, id: string): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: 'DELETE FROM khatib_database WHERE id = ?',
    args: [id],
  });
}

export async function tursoInsertFridaySchedule(client: Client, f: FridayScheduleItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO friday_schedules (
        id, year, date, dateHijri, khatibName, khatibTitle, imamName, khutbahTopic,
        phone, status, incentiveAmount, notes, isCompleted, attendanceCount,
        actualHonorDisbursed, summaryNotes, completedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      f.id,
      f.year || 2026,
      f.date,
      f.dateHijri,
      f.khatibName,
      f.khatibTitle || null,
      f.imamName,
      f.khutbahTopic,
      f.phone,
      f.status,
      f.incentiveAmount || 0,
      f.notes || null,
      f.isCompleted ? 1 : 0,
      f.attendanceCount || null,
      f.actualHonorDisbursed || null,
      f.summaryNotes || null,
      f.completedAt || null,
    ],
  });
}

export async function tursoUpdateFridaySchedule(client: Client, f: FridayScheduleItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE friday_schedules SET
        year = ?, date = ?, dateHijri = ?, khatibName = ?, khatibTitle = ?,
        imamName = ?, khutbahTopic = ?, phone = ?, status = ?, incentiveAmount = ?,
        notes = ?, isCompleted = ?, attendanceCount = ?, actualHonorDisbursed = ?,
        summaryNotes = ?, completedAt = ?
      WHERE id = ?
    `,
    args: [
      f.year || 2026,
      f.date,
      f.dateHijri,
      f.khatibName,
      f.khatibTitle || null,
      f.imamName,
      f.khutbahTopic,
      f.phone,
      f.status,
      f.incentiveAmount || 0,
      f.notes || null,
      f.isCompleted ? 1 : 0,
      f.attendanceCount || null,
      f.actualHonorDisbursed || null,
      f.summaryNotes || null,
      f.completedAt || null,
      f.id,
    ],
  });
}

export async function tursoInsertBulkFridaySchedules(client: Client, list: FridayScheduleItem[]): Promise<void> {
  await initTursoSchema(client);
  const stmts: InStatement[] = list.map((f) => ({
    sql: `
      INSERT OR REPLACE INTO friday_schedules (
        id, year, date, dateHijri, khatibName, khatibTitle, imamName, khutbahTopic,
        phone, status, incentiveAmount, notes, isCompleted, attendanceCount,
        actualHonorDisbursed, summaryNotes, completedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      f.id,
      f.year || 2026,
      f.date,
      f.dateHijri,
      f.khatibName,
      f.khatibTitle || null,
      f.imamName,
      f.khutbahTopic,
      f.phone,
      f.status,
      f.incentiveAmount || 0,
      f.notes || null,
      f.isCompleted ? 1 : 0,
      f.attendanceCount || null,
      f.actualHonorDisbursed || null,
      f.summaryNotes || null,
      f.completedAt || null,
    ],
  }));
  await client.batch(stmts, 'write');
}

export async function tursoInsertRamadhanSchedule(client: Client, r: RamadhanScheduleItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO ramadhan_schedules (
        id, year, hijriYear, nightNumber, date, penceramahTarawih, topicKultum,
        honorPenceramah, imamTarawih, honorImamTarawih, bukberHost, bukberPax,
        itikafStatus, isCompleted, attendanceCount, actualHonorDisbursed, summaryNotes, completedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      r.id,
      r.year || 2026,
      r.hijriYear || '1448 H',
      r.nightNumber,
      r.date,
      r.penceramahTarawih,
      r.topicKultum,
      r.honorPenceramah || 0,
      r.imamTarawih,
      r.honorImamTarawih || 0,
      r.bukberHost,
      r.bukberPax || 0,
      r.itikafStatus || null,
      r.isCompleted ? 1 : 0,
      r.attendanceCount || null,
      r.actualHonorDisbursed || null,
      r.summaryNotes || null,
      r.completedAt || null,
    ],
  });
}

export async function tursoUpdateRamadhanSchedule(client: Client, r: RamadhanScheduleItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE ramadhan_schedules SET
        year = ?, hijriYear = ?, nightNumber = ?, date = ?, penceramahTarawih = ?,
        topicKultum = ?, honorPenceramah = ?, imamTarawih = ?, honorImamTarawih = ?,
        bukberHost = ?, bukberPax = ?, itikafStatus = ?, isCompleted = ?,
        attendanceCount = ?, actualHonorDisbursed = ?, summaryNotes = ?, completedAt = ?
      WHERE id = ?
    `,
    args: [
      r.year || 2026,
      r.hijriYear || '1448 H',
      r.nightNumber,
      r.date,
      r.penceramahTarawih,
      r.topicKultum,
      r.honorPenceramah || 0,
      r.imamTarawih,
      r.honorImamTarawih || 0,
      r.bukberHost,
      r.bukberPax || 0,
      r.itikafStatus || null,
      r.isCompleted ? 1 : 0,
      r.attendanceCount || null,
      r.actualHonorDisbursed || null,
      r.summaryNotes || null,
      r.completedAt || null,
      r.id,
    ],
  });
}

export async function tursoInsertBulkRamadhanSchedules(client: Client, list: RamadhanScheduleItem[]): Promise<void> {
  await initTursoSchema(client);
  const stmts: InStatement[] = list.map((r) => ({
    sql: `
      INSERT OR REPLACE INTO ramadhan_schedules (
        id, year, hijriYear, nightNumber, date, penceramahTarawih, topicKultum,
        honorPenceramah, imamTarawih, honorImamTarawih, bukberHost, bukberPax,
        itikafStatus, isCompleted, attendanceCount, actualHonorDisbursed, summaryNotes, completedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      r.id,
      r.year || 2026,
      r.hijriYear || '1448 H',
      r.nightNumber,
      r.date,
      r.penceramahTarawih,
      r.topicKultum,
      r.honorPenceramah || 0,
      r.imamTarawih,
      r.honorImamTarawih || 0,
      r.bukberHost,
      r.bukberPax || 0,
      r.itikafStatus || null,
      r.isCompleted ? 1 : 0,
      r.attendanceCount || null,
      r.actualHonorDisbursed || null,
      r.summaryNotes || null,
      r.completedAt || null,
    ],
  }));
  await client.batch(stmts, 'write');
}

export async function tursoInsertKajianSchedule(client: Client, k: KajianScheduleItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO kajian_schedules (
        id, title, type, speakerName, speakerTitle, bookOrTopic, dayTime,
        location, fundingSource, contactPerson, notes, isCompleted,
        attendanceCount, actualHonorDisbursed, summaryNotes, completedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      k.id,
      k.title,
      k.type,
      k.speakerName,
      k.speakerTitle || null,
      k.bookOrTopic,
      k.dayTime,
      k.location,
      k.fundingSource,
      k.contactPerson,
      k.notes || null,
      k.isCompleted ? 1 : 0,
      k.attendanceCount || null,
      k.actualHonorDisbursed || null,
      k.summaryNotes || null,
      k.completedAt || null,
    ],
  });
}

export async function tursoUpdateKajianSchedule(client: Client, k: KajianScheduleItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE kajian_schedules SET
        title = ?, type = ?, speakerName = ?, speakerTitle = ?, bookOrTopic = ?,
        dayTime = ?, location = ?, fundingSource = ?, contactPerson = ?, notes = ?,
        isCompleted = ?, attendanceCount = ?, actualHonorDisbursed = ?,
        summaryNotes = ?, completedAt = ?
      WHERE id = ?
    `,
    args: [
      k.title,
      k.type,
      k.speakerName,
      k.speakerTitle || null,
      k.bookOrTopic,
      k.dayTime,
      k.location,
      k.fundingSource,
      k.contactPerson,
      k.notes || null,
      k.isCompleted ? 1 : 0,
      k.attendanceCount || null,
      k.actualHonorDisbursed || null,
      k.summaryNotes || null,
      k.completedAt || null,
      k.id,
    ],
  });
}

// ---------------- PROJECTS MUTATIONS ----------------

export async function tursoInsertPhysicalProject(client: Client, p: PhysicalProjectItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO physical_projects (
        id, code, title, category, allocatedBudget, realizedBudget, progressPercentage,
        status, urgencyLevel, responsiblePerson, contractorVendor, startDate,
        targetEndDate, description, milestones, notes, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      p.id,
      p.code,
      p.title,
      p.category,
      p.allocatedBudget || 0,
      p.realizedBudget || 0,
      p.progressPercentage || 0,
      p.status,
      p.urgencyLevel,
      p.responsiblePerson,
      p.contractorVendor || null,
      p.startDate,
      p.targetEndDate,
      p.description,
      JSON.stringify(p.milestones || []),
      p.notes || null,
      p.updatedAt,
    ],
  });
}

export async function tursoUpdatePhysicalProject(client: Client, p: PhysicalProjectItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE physical_projects SET
        code = ?, title = ?, category = ?, allocatedBudget = ?, realizedBudget = ?,
        progressPercentage = ?, status = ?, urgencyLevel = ?, responsiblePerson = ?,
        contractorVendor = ?, startDate = ?, targetEndDate = ?, description = ?,
        milestones = ?, notes = ?, updatedAt = ?
      WHERE id = ?
    `,
    args: [
      p.code,
      p.title,
      p.category,
      p.allocatedBudget || 0,
      p.realizedBudget || 0,
      p.progressPercentage || 0,
      p.status,
      p.urgencyLevel,
      p.responsiblePerson,
      p.contractorVendor || null,
      p.startDate,
      p.targetEndDate,
      p.description,
      JSON.stringify(p.milestones || []),
      p.notes || null,
      p.updatedAt,
      p.id,
    ],
  });
}

// ---------------- ZISWAF MUTATIONS ----------------

export async function tursoInsertSSSCan(client: Client, s: SSSCanItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO sss_cans (
        id, canCode, rt, houseNumber, holderName, phone, distributionDate,
        lastCollectionDate, lastAmount, totalCollected, status, collectorOfficer, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      s.id,
      s.canCode,
      s.rt,
      s.houseNumber,
      s.holderName,
      s.phone,
      s.distributionDate,
      s.lastCollectionDate,
      s.lastAmount || 0,
      s.totalCollected || 0,
      s.status,
      s.collectorOfficer,
      s.notes,
    ],
  });
}

export async function tursoUpdateSSSCan(client: Client, s: SSSCanItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE sss_cans SET
        canCode = ?, rt = ?, houseNumber = ?, holderName = ?, phone = ?,
        distributionDate = ?, lastCollectionDate = ?, lastAmount = ?,
        totalCollected = ?, status = ?, collectorOfficer = ?, notes = ?
      WHERE id = ?
    `,
    args: [
      s.canCode,
      s.rt,
      s.houseNumber,
      s.holderName,
      s.phone,
      s.distributionDate,
      s.lastCollectionDate,
      s.lastAmount || 0,
      s.totalCollected || 0,
      s.status,
      s.collectorOfficer,
      s.notes,
      s.id,
    ],
  });
}

export async function tursoInsertSSSRecord(client: Client, r: SSSCollectionRecord): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO sss_records (
        id, canId, canCode, collectionDate, amount, rt, collector, depositedToCash, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      r.id,
      r.canId,
      r.canCode,
      r.collectionDate,
      r.amount,
      r.rt,
      r.collector,
      r.depositedToCash ? 1 : 0,
      r.notes || null,
    ],
  });
}

export async function tursoInsertZiswafAid(client: Client, a: ZiswafAidItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      INSERT INTO ziswaf_aids (
        id, aidNumber, jamaahId, recipientName, recipientCategory, rt, address,
        phone, aidType, amountValue, goodsDescription, distributionDate,
        disbursedBy, status, receiptNumber, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      a.id,
      a.aidNumber,
      a.jamaahId || null,
      a.recipientName,
      a.recipientCategory,
      a.rt,
      a.address,
      a.phone || null,
      a.aidType,
      a.amountValue || 0,
      a.goodsDescription || null,
      a.distributionDate,
      a.disbursedBy,
      a.status,
      a.receiptNumber || null,
      a.notes,
    ],
  });
}

export async function tursoUpdateZiswafAid(client: Client, a: ZiswafAidItem): Promise<void> {
  await initTursoSchema(client);
  await client.execute({
    sql: `
      UPDATE ziswaf_aids SET
        aidNumber = ?, jamaahId = ?, recipientName = ?, recipientCategory = ?,
        rt = ?, address = ?, phone = ?, aidType = ?, amountValue = ?,
        goodsDescription = ?, distributionDate = ?, disbursedBy = ?,
        status = ?, receiptNumber = ?, notes = ?
      WHERE id = ?
    `,
    args: [
      a.aidNumber,
      a.jamaahId || null,
      a.recipientName,
      a.recipientCategory,
      a.rt,
      a.address,
      a.phone || null,
      a.aidType,
      a.amountValue || 0,
      a.goodsDescription || null,
      a.distributionDate,
      a.disbursedBy,
      a.status,
      a.receiptNumber || null,
      a.notes,
      a.id,
    ],
  });
}

// ---------------- USER MUTATIONS ----------------
export async function tursoGetUsers(client: Client): Promise<User[]> {
  await initTursoSchema(client);
  const res = await client.execute('SELECT * FROM users ORDER BY id ASC');
  return res.rows.map((r) => parseUser(r as unknown as Record<string, unknown>));
}

export async function tursoGetUserById(client: Client, id: string): Promise<User | null> {
  await initTursoSchema(client);
  const res = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
    args: [id],
  });
  if (res.rows.length === 0) return null;
  return parseUser(res.rows[0] as unknown as Record<string, unknown>);
}

export async function tursoInsertUser(client: Client, user: User): Promise<User> {
  await initTursoSchema(client);
  const now = new Date().toISOString();
  await client.execute({
    sql: `
      INSERT INTO users (
        id, name, title, role, roleLabel, email, phone, department,
        isReadOnly, pinHash, status, bio, avatarUrl, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      user.id,
      user.name,
      user.title,
      user.role,
      user.roleLabel,
      user.email,
      user.phone,
      user.department,
      user.isReadOnly ? 1 : 0,
      user.pinHash || '',
      user.status || 'AKTIF',
      user.bio || null,
      user.avatarUrl || null,
      now,
      now,
    ],
  });
  return user;
}

export async function tursoUpdateUserPin(client: Client, userId: string, pinHash: string): Promise<boolean> {
  await initTursoSchema(client);
  const res = await client.execute({
    sql: 'UPDATE users SET pinHash = ?, updatedAt = ? WHERE id = ?',
    args: [pinHash, new Date().toISOString(), userId],
  });
  return res.rowsAffected > 0;
}

export async function tursoUpdateUserStatus(
  client: Client,
  userId: string,
  status: 'AKTIF' | 'NON_AKTIF'
): Promise<boolean> {
  await initTursoSchema(client);
  const res = await client.execute({
    sql: 'UPDATE users SET status = ?, updatedAt = ? WHERE id = ?',
    args: [status, new Date().toISOString(), userId],
  });
  return res.rowsAffected > 0;
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
    totalKhatib,
    totalFridaySchedules,
    totalRamadhanSchedules,
    totalKajianSchedules,
    totalPhysicalProjects,
    totalSssCans,
    totalSssRecords,
    totalZiswafAids,
    totalUsers,
  ] = await Promise.all([
    getCount('letters'),
    getCount('minutes'),
    getCount('jamaah'),
    getCount('transactions'),
    getCount('donors'),
    getCount('assets'),
    getCount('approvals'),
    getCount('audit_logs'),
    getCount('khatib_database'),
    getCount('friday_schedules'),
    getCount('ramadhan_schedules'),
    getCount('kajian_schedules'),
    getCount('physical_projects'),
    getCount('sss_cans'),
    getCount('sss_records'),
    getCount('ziswaf_aids'),
    getCount('users'),
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
    totalKhatib,
    totalFridaySchedules,
    totalRamadhanSchedules,
    totalKajianSchedules,
    totalPhysicalProjects,
    totalSssCans,
    totalSssRecords,
    totalZiswafAids,
    totalUsers,
    managedTablesCount: 19,
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
      khatibList?: KhatibItem[];
      fridaySchedules?: FridayScheduleItem[];
      ramadhanSchedules?: RamadhanScheduleItem[];
      kajianSchedules?: KajianScheduleItem[];
      physicalProjects?: PhysicalProjectItem[];
      sssCans?: SSSCanItem[];
      sssRecords?: SSSCollectionRecord[];
      ziswafAids?: ZiswafAidItem[];
      users?: User[];
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

    // Khatib Database
    if (snapshot.data.khatibList && Array.isArray(snapshot.data.khatibList)) {
      batchStatements.push({ sql: 'DELETE FROM khatib_database;', args: [] });
      for (const k of snapshot.data.khatibList) {
        batchStatements.push({
          sql: `
            INSERT INTO khatib_database (
              id, name, title, specialization, institution, phone, address,
              totalAppearances, status, notes, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            k.id,
            k.name,
            k.title,
            k.specialization,
            k.institution,
            k.phone,
            k.address,
            k.totalAppearances || 0,
            k.status,
            k.notes || null,
            k.createdAt,
          ],
        });
      }
    }

    // Friday Schedules
    if (snapshot.data.fridaySchedules && Array.isArray(snapshot.data.fridaySchedules)) {
      batchStatements.push({ sql: 'DELETE FROM friday_schedules;', args: [] });
      for (const f of snapshot.data.fridaySchedules) {
        batchStatements.push({
          sql: `
            INSERT INTO friday_schedules (
              id, year, date, dateHijri, khatibName, khatibTitle, imamName, khutbahTopic,
              phone, status, incentiveAmount, notes, isCompleted, attendanceCount,
              actualHonorDisbursed, summaryNotes, completedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            f.id,
            f.year || 2026,
            f.date,
            f.dateHijri,
            f.khatibName,
            f.khatibTitle || null,
            f.imamName,
            f.khutbahTopic,
            f.phone,
            f.status,
            f.incentiveAmount || 0,
            f.notes || null,
            f.isCompleted ? 1 : 0,
            f.attendanceCount || null,
            f.actualHonorDisbursed || null,
            f.summaryNotes || null,
            f.completedAt || null,
          ],
        });
      }
    }

    // Ramadhan Schedules
    if (snapshot.data.ramadhanSchedules && Array.isArray(snapshot.data.ramadhanSchedules)) {
      batchStatements.push({ sql: 'DELETE FROM ramadhan_schedules;', args: [] });
      for (const r of snapshot.data.ramadhanSchedules) {
        batchStatements.push({
          sql: `
            INSERT INTO ramadhan_schedules (
              id, year, hijriYear, nightNumber, date, penceramahTarawih, topicKultum,
              honorPenceramah, imamTarawih, honorImamTarawih, bukberHost, bukberPax,
              itikafStatus, isCompleted, attendanceCount, actualHonorDisbursed, summaryNotes, completedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            r.id,
            r.year || 2026,
            r.hijriYear || '1448 H',
            r.nightNumber,
            r.date,
            r.penceramahTarawih,
            r.topicKultum,
            r.honorPenceramah || 0,
            r.imamTarawih,
            r.honorImamTarawih || 0,
            r.bukberHost,
            r.bukberPax || 0,
            r.itikafStatus || null,
            r.isCompleted ? 1 : 0,
            r.attendanceCount || null,
            r.actualHonorDisbursed || null,
            r.summaryNotes || null,
            r.completedAt || null,
          ],
        });
      }
    }

    // Kajian Schedules
    if (snapshot.data.kajianSchedules && Array.isArray(snapshot.data.kajianSchedules)) {
      batchStatements.push({ sql: 'DELETE FROM kajian_schedules;', args: [] });
      for (const k of snapshot.data.kajianSchedules) {
        batchStatements.push({
          sql: `
            INSERT INTO kajian_schedules (
              id, title, type, speakerName, speakerTitle, bookOrTopic, dayTime,
              location, fundingSource, contactPerson, notes, isCompleted,
              attendanceCount, actualHonorDisbursed, summaryNotes, completedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            k.id,
            k.title,
            k.type,
            k.speakerName,
            k.speakerTitle || null,
            k.bookOrTopic,
            k.dayTime,
            k.location,
            k.fundingSource,
            k.contactPerson,
            k.notes || null,
            k.isCompleted ? 1 : 0,
            k.attendanceCount || null,
            k.actualHonorDisbursed || null,
            k.summaryNotes || null,
            k.completedAt || null,
          ],
        });
      }
    }

    // Physical Projects
    if (snapshot.data.physicalProjects && Array.isArray(snapshot.data.physicalProjects)) {
      batchStatements.push({ sql: 'DELETE FROM physical_projects;', args: [] });
      for (const p of snapshot.data.physicalProjects) {
        batchStatements.push({
          sql: `
            INSERT INTO physical_projects (
              id, code, title, category, allocatedBudget, realizedBudget, progressPercentage,
              status, urgencyLevel, responsiblePerson, contractorVendor, startDate,
              targetEndDate, description, milestones, notes, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            p.id,
            p.code,
            p.title,
            p.category,
            p.allocatedBudget || 0,
            p.realizedBudget || 0,
            p.progressPercentage || 0,
            p.status,
            p.urgencyLevel,
            p.responsiblePerson,
            p.contractorVendor || null,
            p.startDate,
            p.targetEndDate,
            p.description,
            JSON.stringify(p.milestones || []),
            p.notes || null,
            p.updatedAt,
          ],
        });
      }
    }

    // SSS Cans
    if (snapshot.data.sssCans && Array.isArray(snapshot.data.sssCans)) {
      batchStatements.push({ sql: 'DELETE FROM sss_cans;', args: [] });
      for (const s of snapshot.data.sssCans) {
        batchStatements.push({
          sql: `
            INSERT INTO sss_cans (
              id, canCode, rt, houseNumber, holderName, phone, distributionDate,
              lastCollectionDate, lastAmount, totalCollected, status, collectorOfficer, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            s.id,
            s.canCode,
            s.rt,
            s.houseNumber,
            s.holderName,
            s.phone,
            s.distributionDate,
            s.lastCollectionDate,
            s.lastAmount || 0,
            s.totalCollected || 0,
            s.status,
            s.collectorOfficer,
            s.notes,
          ],
        });
      }
    }

    // SSS Records
    if (snapshot.data.sssRecords && Array.isArray(snapshot.data.sssRecords)) {
      batchStatements.push({ sql: 'DELETE FROM sss_records;', args: [] });
      for (const r of snapshot.data.sssRecords) {
        batchStatements.push({
          sql: `
            INSERT INTO sss_records (
              id, canId, canCode, collectionDate, amount, rt, collector, depositedToCash, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            r.id,
            r.canId,
            r.canCode,
            r.collectionDate,
            r.amount,
            r.rt,
            r.collector,
            r.depositedToCash ? 1 : 0,
            r.notes || null,
          ],
        });
      }
    }

    // Ziswaf Aids
    if (snapshot.data.ziswafAids && Array.isArray(snapshot.data.ziswafAids)) {
      batchStatements.push({ sql: 'DELETE FROM ziswaf_aids;', args: [] });
      for (const a of snapshot.data.ziswafAids) {
        batchStatements.push({
          sql: `
            INSERT INTO ziswaf_aids (
              id, aidNumber, jamaahId, recipientName, recipientCategory, rt, address,
              phone, aidType, amountValue, goodsDescription, distributionDate,
              disbursedBy, status, receiptNumber, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            a.id,
            a.aidNumber,
            a.jamaahId || null,
            a.recipientName,
            a.recipientCategory,
            a.rt,
            a.address,
            a.phone || null,
            a.aidType,
            a.amountValue || 0,
            a.goodsDescription || null,
            a.distributionDate,
            a.disbursedBy,
            a.status,
            a.receiptNumber || null,
            a.notes,
          ],
        });
      }
    }

    // Users
    if (snapshot.data.users && Array.isArray(snapshot.data.users)) {
      batchStatements.push({ sql: 'DELETE FROM users;', args: [] });
      const now = new Date().toISOString();
      for (const u of snapshot.data.users) {
        batchStatements.push({
          sql: `
            INSERT INTO users (
              id, name, title, role, roleLabel, email, phone, department,
              isReadOnly, pinHash, status, bio, avatarUrl, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            u.id,
            u.name,
            u.title,
            u.role,
            u.roleLabel,
            u.email,
            u.phone,
            u.department,
            u.isReadOnly ? 1 : 0,
            u.pinHash || '',
            u.status || 'AKTIF',
            u.bio || null,
            u.avatarUrl || null,
            now,
            now,
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
