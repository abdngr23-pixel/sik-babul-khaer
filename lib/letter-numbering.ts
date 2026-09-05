import { LetterCategory } from '@/types/letter';

export const DKM_INFO = {
  name: 'DEWAN KEMAKMURAN MASJID BABUL KHAER',
  shortName: 'DKM Babul Khaer',
  code: 'DKM-MBH',
  address: 'BTP Blok AE, Kelurahan Tamalanrea, Kec. Tamalanrea, Kota Makassar, Sulawesi Selatan 90245',
  contact: 'Telp/WA: 0812-3456-7890 | Email: dkm.babulkhaer.btp@gmail.com',
  period: 'Periode 2026 - 2029',
  defaultChairman: 'Drs. H. Muhammad Arifin, M.Pd.I',
  defaultSecretary: 'Ahmad Fauzi, S.Kom',
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
 * Menghasilkan nomor surat dinas resmi DKM Babul Khaer
 * Format: [Nomor Urut 3 Digit]/DKM-MBH/[Kode Kategori]/[Bulan Romawi]/[Tahun]
 * Contoh: 014/DKM-MBH/UND/IX/2026
 */
export function generateLetterNumber(
  sequenceNumber: number,
  category: LetterCategory,
  dateStr: string = new Date().toISOString().split('T')[0]
): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const romanMonth = getRomanMonth(month);
  const paddedSeq = formatSequenceNumber(sequenceNumber);

  return `${paddedSeq}/${DKM_INFO.code}/${category}/${romanMonth}/${year}`;
}

/**
 * Parsing nomor surat resmi untuk mendapatkan detail komponen
 */
export function parseLetterNumber(letterNumber: string): {
  sequence: number | null;
  code: string | null;
  category: string | null;
  romanMonth: string | null;
  year: number | null;
} {
  const parts = letterNumber.split('/');
  if (parts.length === 5) {
    return {
      sequence: parseInt(parts[0], 10) || null,
      code: parts[1],
      category: parts[2],
      romanMonth: parts[3],
      year: parseInt(parts[4], 10) || null,
    };
  }
  return {
    sequence: null,
    code: null,
    category: null,
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
