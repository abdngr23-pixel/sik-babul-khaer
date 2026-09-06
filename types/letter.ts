export type LetterCategory = 'UND' | 'PER' | 'PEM' | 'SK' | 'SKET' | 'TGS';

export interface LetterCategoryInfo {
  code: LetterCategory;
  name: string;
  description: string;
}

export const LETTER_CATEGORIES: Record<LetterCategory, LetterCategoryInfo> = {
  UND: {
    code: 'UND',
    name: 'Surat Undangan',
    description: 'Undangan rapat pengurus, PHBI, kajian akbar, dan majelis taklim',
  },
  PER: {
    code: 'PER',
    name: 'Surat Permohonan',
    description: 'Permohonan pemateri kajian, bantuan logistik, audiensi, izin',
  },
  PEM: {
    code: 'PEM',
    name: 'Surat Pemberitahuan',
    description: 'Pemberitahuan kegiatan dakwah, kerja bakti, renovasi, laporan jamaah',
  },
  SK: {
    code: 'SK',
    name: 'Surat Keputusan',
    description: 'Penetapan panitia PHBI/Ramadhan/Qurban, struktur kepengurusan DKM',
  },
  SKET: {
    code: 'SKET',
    name: 'Surat Keterangan',
    description: 'Keterangan aktif jamaah, mustahiq/miskin, domisili jamaah BTP Blok AE',
  },
  TGS: {
    code: 'TGS',
    name: 'Surat Tugas',
    description: 'Penugasan perwakilan DKM untuk menghadiri musyawarah atau pelatihan',
  },
};

export type LetterDepartment = 'SEKR' | 'DKW' | 'SAR' | 'SOS' | 'PHBI' | 'DKM';

export interface LetterDepartmentInfo {
  code: LetterDepartment;
  name: string;
  leadOfficer: string;
  description: string;
}

export const LETTER_DEPARTMENTS: Record<LetterDepartment, LetterDepartmentInfo> = {
  SEKR: {
    code: 'SEKR',
    name: 'Sekretariat Umum',
    leadOfficer: 'Ahmad Fauzi, S.Kom (Sekretaris Umum)',
    description: 'Administrasi umum, persuratan dinas, tata usaha organisasi DKM',
  },
  DKW: {
    code: 'DKW',
    name: 'Bidang I - Peribadatan & Dakwah',
    leadOfficer: 'Ust. H. Ridwan (Koordinator Peribadatan & Dakwah)',
    description: 'Jadwal khatib jumat, penceramah ramadhan, imam sholat, kajian majelis taklim',
  },
  SAR: {
    code: 'SAR',
    name: 'Bidang II - Sarana & Prasarana',
    leadOfficer: 'Ir. H. Syamsuddin (Koordinator Sarpras & Pembangunan)',
    description: 'Pembangunan fisik, renovasi gedung masjid, inventaris aset, pemeliharaan',
  },
  SOS: {
    code: 'SOS',
    name: 'Bidang III - Sosial, ZISWAF & UPZ',
    leadOfficer: 'H. Sahali (Koordinator Sosial & UPZ)',
    description: 'Penyaluran zakat/infak/bansos, santunan dhuafa & yatim, program kaleng SSS',
  },
  PHBI: {
    code: 'PHBI',
    name: 'Panitia Hari Besar Islam (PHBI)',
    leadOfficer: 'Ketua Panitia PHBI Terpilih',
    description: 'Kepanitiaan Ramadhan, Idul Fitri, Idul Adha/Qurban, Maulid Nabi, Isra Miraj',
  },
  DKM: {
    code: 'DKM',
    name: 'Pimpinan Harian / Ketua Umum',
    leadOfficer: 'Drs. H. Muhammad Arifin, M.Pd.I (Ketua Umum)',
    description: 'Surat Keputusan (SK) strategis, audiensi pimpinan, kebijakan umum DKM',
  },
};

export type LetterStatus = 'DRAFT' | 'APPROVED' | 'SENT' | 'ARCHIVED';

export interface OfficialLetter {
  id: string;
  letterNumber: string;
  sequenceNumber: number;
  category: LetterCategory;
  department?: LetterDepartment;
  recipientName: string;
  recipientTitle?: string;
  recipientAddress?: string;
  subject: string;
  letterDate: string; // YYYY-MM-DD
  attachmentCount?: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  content: string;
  status: LetterStatus;
  signatory1: {
    name: string;
    role: string; // e.g. Ketua Umum DKM MBH
  };
  signatory2: {
    name: string;
    role: string; // e.g. Sekretaris Umum DKM MBH
  };
  letterDetails?: Record<string, unknown>;
  physicalArchiveLocation?: string;
  verificationCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActionItem {
  id: string;
  task: string;
  pic: string;
  deadline: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface MeetingMinutes {
  id: string;
  title: string;
  date: string;
  location?: string;
  attendees?: string;
  summary: string;
  decisions: string[];
  actionItems: ActionItem[];
  rawNotes?: string;
  createdAt: string;
}
