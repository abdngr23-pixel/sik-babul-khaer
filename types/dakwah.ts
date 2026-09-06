export type FridayConfirmationStatus = 'TERKONFIRMASI' | 'MENUNGGU' | 'SELESAI';

export interface FridayScheduleItem {
  id: string;
  date: string; // Format YYYY-MM-DD
  dateHijri: string;
  khatibName: string;
  khatibTitle?: string;
  imamName: string;
  khutbahTopic: string;
  phone: string;
  status: FridayConfirmationStatus;
  incentiveAmount: number;
  notes?: string;
}

export interface RawatibScheduleItem {
  id: string;
  name: string;
  role: 'IMAM_RAWATIB' | 'MARBOT_AZAN';
  roleLabel: string;
  assignedPrayers: string[]; // ['Subuh', 'Maghrib', 'Isya'] dll
  monthlyIncentive: number; // Standar Raker: Rp 1.500.000 / imam
  phone: string;
  status: 'AKTIF' | 'CUTI' | 'CADANGAN';
  notes?: string;
}

export type KajianType = 'PEKANAN' | 'BULANAN' | 'TABLIGH_AKBAR' | 'TAHSIN';

export interface KajianScheduleItem {
  id: string;
  title: string;
  type: KajianType;
  speakerName: string;
  speakerTitle?: string;
  bookOrTopic: string;
  dayTime: string; // Misal: "Setiap Ahad Ba'da Subuh"
  location: string;
  fundingSource: 'SWADAYA_JAMAAH' | 'KAS_MASJID' | 'SPONSOR_DONATUR';
  contactPerson: string;
  notes?: string;
}

export interface RamadhanScheduleItem {
  id: string;
  nightNumber: number; // Malam ke-1 s.d. 30
  date: string;
  penceramahTarawih: string;
  topicKultum: string;
  honorPenceramah: number; // Standar Raker: Rp 400.000/malam
  imamTarawih: string;
  honorImamTarawih: number; // Standar Raker: Rp 300.000/malam
  bukberHost: string; // Swadaya Warga / Donatur RT
  bukberPax: number;
  itikafStatus?: 'TERJADWAL' | 'TERBUKA' | 'TIDAK_ADA';
}
