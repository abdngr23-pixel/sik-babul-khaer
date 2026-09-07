export type SantriLevel = 'Iqro 1-2' | 'Iqro 3-4' | 'Iqro 5-6' | 'Al-Quran Dasar' | 'Tahfidz Juz 30' | 'Tahfidz Lanjutan';

export type SppStatus = 'LUNAS' | 'MENUNGGAK' | 'BEASISWA_DKM';

export interface Santri {
  id: string;
  nis: string; // Nomor Induk Santri
  name: string;
  gender: 'L' | 'P';
  birthDate?: string;
  age: number;
  level: SantriLevel;
  parentName: string;
  parentPhone: string;
  address: string;
  sppStatus: SppStatus;
  monthlyFee: number;
  joinDate: string;
  teacherId: string;
  teacherName: string;
  hafalanCount?: string; // e.g. 'Juz 30 (Surah An-Naba s.d An-Nas)'
  lastAssessment?: string;
}

export interface TpaTeacher {
  id: string;
  name: string;
  phone: string;
  specialization: string;
  schedule: string;
  studentCount: number;
  allowanceMonthly: number;
  status: 'AKTIF' | 'CUTI';
}

export interface TpaSummary {
  totalSantri: number;
  totalTeachers: number;
  activeLevels: number;
  monthlyRevenue: number;
  monthlyDisbursement: number;
}
