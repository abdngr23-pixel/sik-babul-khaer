export type Gender = 'L' | 'P';

export type ResidencyStatus = 'TETAP' | 'KONTRAK' | 'KOST';

export type EconomicStatus = 'MUZAKKI' | 'MAMPU' | 'MUSTAHIQ_DHUAFA' | 'YATIM_PIATU' | 'LANSIA_DHUAFA';

export type FamilyRole = 'KEPALA_KELUARGA' | 'ISTRI' | 'ANAK' | 'LANSIA_TANGGUNGAN';

export interface Jamaah {
  id: string;
  fullName: string;
  nik?: string; // Sensor: 7371xxxxxxxxxxxx
  gender: Gender;
  birthPlace?: string;
  birthDate?: string; // YYYY-MM-DD
  rt: 'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05';
  houseNumber: string; // e.g. "Blok AE No. 15"
  fullAddress: string;
  phone: string; // WhatsApp active
  email?: string;
  residencyStatus: ResidencyStatus;
  economicStatus: EconomicStatus;
  familyRole: FamilyRole;
  familyMemberCount?: number;
  occupation?: string;
  bloodType?: string;
  isYouthMember?: boolean; // Anggota IRMA / Remaja Masjid
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JamaahFilterParams {
  search?: string;
  rt?: string;
  economicStatus?: string;
  residencyStatus?: string;
  isYouthMember?: boolean;
}

export interface JamaahStats {
  totalJamaah: number;
  totalKK: number;
  totalMustahiq: number;
  totalYouth: number;
  byRT: Record<string, number>;
}
