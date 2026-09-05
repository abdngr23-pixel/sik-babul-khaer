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

export type LetterStatus = 'DRAFT' | 'APPROVED' | 'SENT' | 'ARCHIVED';

export interface OfficialLetter {
  id: string;
  letterNumber: string;
  sequenceNumber: number;
  category: LetterCategory;
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
