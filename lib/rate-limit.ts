/**
 * In-Memory Rate Limiter untuk Pengamanan Autentikasi PIN SIK-MBH
 * Melindungi dari serangan brute force PIN 6 digit pengurus.
 * Standar: Maksimal 5 percobaan gagal per userId / IP dalam jendela waktu 15 menit.
 */

interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
  firstAttempt: number;
  lastAttempt: number;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 menit

// Global cache (disimpan di globalThis agar aman saat hot-reload Turbopack di local dev)
const globalKey = Symbol.for('sik_auth_rate_limit_cache');
const attemptsMap: Map<string, AttemptRecord> =
  (globalThis as unknown as Record<symbol, Map<string, AttemptRecord>>)[globalKey] ||
  new Map<string, AttemptRecord>();

(globalThis as unknown as Record<symbol, Map<string, AttemptRecord>>)[globalKey] = attemptsMap;

/**
 * Memeriksa apakah suatu identitas (userId atau IP) sedang terkunci karena melebihi batas percobaan.
 */
export function checkRateLimit(key: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  remainingSeconds: number;
} {
  const record = attemptsMap.get(key);
  const now = Date.now();

  if (!record) {
    return { isBlocked: false, remainingAttempts: MAX_ATTEMPTS, remainingSeconds: 0 };
  }

  // Jika sedang terkunci
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
    return { isBlocked: true, remainingAttempts: 0, remainingSeconds };
  }

  // Jika masa kunci sudah lewat, reset otomatis
  if (record.lockedUntil && record.lockedUntil <= now) {
    attemptsMap.delete(key);
    return { isBlocked: false, remainingAttempts: MAX_ATTEMPTS, remainingSeconds: 0 };
  }

  // Jika jendela percobaan sudah lebih dari 15 menit tanpa lockout, reset
  if (now - record.firstAttempt > LOCKOUT_DURATION_MS) {
    attemptsMap.delete(key);
    return { isBlocked: false, remainingAttempts: MAX_ATTEMPTS, remainingSeconds: 0 };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
  return { isBlocked: false, remainingAttempts: remaining, remainingSeconds: 0 };
}

/**
 * Mencatat percobaan autentikasi yang gagal.
 * Mengembalikan status apakah sekarang akun terkunci.
 */
export function recordFailedAttempt(key: string): {
  isBlocked: boolean;
  remainingAttempts: number;
  remainingSeconds: number;
  totalFailed: number;
} {
  const now = Date.now();
  let record = attemptsMap.get(key);

  if (!record || now - record.firstAttempt > LOCKOUT_DURATION_MS) {
    record = {
      count: 1,
      lockedUntil: null,
      firstAttempt: now,
      lastAttempt: now,
    };
  } else {
    record.count += 1;
    record.lastAttempt = now;
  }

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    attemptsMap.set(key, record);
    return {
      isBlocked: true,
      remainingAttempts: 0,
      remainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      totalFailed: record.count,
    };
  }

  attemptsMap.set(key, record);
  return {
    isBlocked: false,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.count),
    remainingSeconds: 0,
    totalFailed: record.count,
  };
}

/**
 * Reset catatan percobaan setelah login berhasil.
 */
export function resetRateLimit(key: string): void {
  attemptsMap.delete(key);
}
