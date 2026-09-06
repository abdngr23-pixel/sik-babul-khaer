import { LetterCategory, LetterDepartment } from '@/types/letter';

export const DKM_INFO = {
  name: 'DEWAN KEMAKMURAN MASJID BABUL KHAER',
  shortName: 'DKM Babul Khaer',
  code: 'DKM-BK',
  address: 'BTP Blok AE, Kelurahan Tamalanrea, Kec. Tamalanrea, Kota Makassar, Sulawesi Selatan 90245',
  contact: 'Telp/WA: 0812-4211-9876 | Email: sekretariat@babulkhaer.id',
  period: 'Periode 2026 - 2029',
  defaultChairman: 'Drs. H. Muhammad Arifin, M.Pd.I',
  defaultSecretary: 'Ahmad Fauzi, S.Kom',
  bankAccount: {
    bank: 'Bank Syariah Indonesia (BSI)',
    number: '7182938475',
    holder: 'DKM Babul Khaer BTP',
  },
};

const ROMAN_MONTHS = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'
];

export function getRomanMonth(monthIndex1Based: number): string {
  if (monthIndex1Based < 1 || monthIndex1Based > 12) {
    return 'I';
  }
  return ROMAN_MONTHS[monthIndex1Based - 1];
}

export function formatSequenceNumber(seq: number): string {
  return String(seq).padStart(3, '0');
}

/**
 * Menghasilkan nomor surat dinas resmi standar AD/ART DKM Babul Khaer
 * Format Baku: [Nomor Urut 3 Digit]/[Kode Bidang]/DKM-BK/[Bulan Romawi]/[Tahun]
 * Contoh: 015/SEKR/DKM-BK/IX/2026, 016/DKW/DKM-BK/IX/2026, 017/PHBI/DKM-BK/IX/2026
 */
export function generateLetterNumber(
  sequenceNumber: number,
  category: LetterCategory = 'UND',
  dateStr: string = new Date().toISOString().split('T')[0],
  department: LetterDepartment = 'SEKR'
): string {
  void category;
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const romanMonth = getRomanMonth(month);
  const paddedSeq = formatSequenceNumber(sequenceNumber);

  return `${paddedSeq}/${department}/DKM-BK/${romanMonth}/${year}`;
}

/**
 * Parsing nomor surat resmi untuk mendapatkan detail komponen
 */
export function parseLetterNumber(letterNumber: string): {
  sequence: number | null;
  departmentOrCode: string | null;
  codeOrCategory: string | null;
  romanMonth: string | null;
  year: number | null;
} {
  const parts = letterNumber.split('/');
  if (parts.length === 5) {
    return {
      sequence: parseInt(parts[0], 10) || null,
      departmentOrCode: parts[1],
      codeOrCategory: parts[2],
      romanMonth: parts[3],
      year: parseInt(parts[4], 10) || null,
    };
  }
  return {
    sequence: null,
    departmentOrCode: null,
    codeOrCategory: null,
    romanMonth: null,
    year: null,
  };
}

export function formatIndonesianDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generate kode verifikasi unik untuk keabsahan surat resmi DKM
 */
export function generateVerificationCode(seq: number, department: string, year: number): string {
  return `VERIF-DKMBK-${formatSequenceNumber(seq)}-${department}-${year}`;
}

/**
 * URL verifikasi publik dokumen
 */
export function getVerificationUrl(letterNumber: string): string {
  const encoded = encodeURIComponent(letterNumber.trim());
  return `https://babulkhaer.id/verifikasi?no=${encoded}`;
}
