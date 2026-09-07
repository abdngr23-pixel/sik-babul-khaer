export type AppNavTab =
  | 'dashboard'
  | 'archive'
  | 'create'
  | 'minutes'
  | 'jamaah'
  | 'mustahiq'
  | 'dakwah'
  | 'finance'
  | 'donors'
  | 'assets'
  | 'reports'
  | 'approvals'
  | 'superadmin'
  | 'program-kerja'
  | 'meetings'
  | 'adhoc'
  | 'tpa'
  | 'umkm';

export const TAB_LABELS: Record<AppNavTab, string> = {
  dashboard: 'Pusat Kendali',
  archive: 'E-Arsip Surat',
  create: 'Buat Surat',
  minutes: 'Notulensi Rapat AI',
  jamaah: 'Basis Data Warga',
  mustahiq: 'Mustahiq & ZISWAF',
  dakwah: 'Peribadatan & Dakwah',
  finance: 'Buku Kas Satu Pintu',
  donors: 'Donatur Rutin',
  assets: 'Inventaris Sarpras',
  reports: 'Evaluasi & LPJ',
  approvals: 'Pengesahan Satu Pintu',
  superadmin: 'Pusat Data & Super Admin',
  'program-kerja': 'Monitoring 74 Program Kerja',
  meetings: 'Rapat Terpadu & Presensi',
  adhoc: 'Kepanitiaan Ad-hoc & SK',
  tpa: 'Modul TPA & Santri',
  umkm: 'UMKM & Gerai Muslimah',
};
