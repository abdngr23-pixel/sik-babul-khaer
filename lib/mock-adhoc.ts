import { AdhocCommittee } from '@/types/adhoc';

export const INITIAL_ADHOC_COMMITTEES: AdhocCommittee[] = [
  {
    id: 'adhoc-001',
    name: 'Panitia Pelaksana Peringatan Hari Besar Islam (PHBI) Maulid Nabi 1448 H',
    code: 'PAN-MLD-1448',
    skNumber: '008/SK/DKM-BK/IX/2026',
    skDate: '2026-09-02',
    eventDate: '2026-09-18',
    targetBudget: 25000000,
    description: 'Kepanitiaan terpadu penyelenggaraan Tabligh Akbar Maulid Nabi Muhammad SAW 1448 H dan pembagian 300 paket berkah maulid di halaman masjid.',
    structure: {
      ketua: { name: 'Ir. H. Syamsuddin, M.T.', phone: '0812-4455-8899', address: 'BTP Blok AE No. 42' },
      sekretaris: { name: 'Fikri Haikal (Ketua IRMA)', phone: '0852-9988-1122' },
      bendahara: { name: 'H. Rusli Hasan', phone: '0813-5566-7788' },
      sections: [
        {
          name: 'Seksi Acara & Protokoler',
          coordinator: 'Ust. Haris, S.Pd.I',
          members: ['Rahmat Dani', 'Ilham Pratama'],
        },
        {
          name: 'Seksi Perlengkapan, Panggung & Sound',
          coordinator: 'Bambang Sudarmono, S.T.',
          members: ['Marbot Firman', 'Wahyu Hidayat', 'Rizal'],
        },
        {
          name: 'Seksi Konsumsi & Penerima Tamu',
          coordinator: 'Hj. Rosdiana',
          members: ['Ibu Hj. Aminah', 'Ibu Nurhayati', 'Ibu Fatimah'],
        },
        {
          name: 'Seksi Keamanan & Penataan Parkir Lorong',
          coordinator: 'Pak Amiruddin (Satpam RW)',
          members: ['Pemuda IRMA 4 orang'],
        },
      ],
    },
    status: 'AKTIF',
    createdAt: '2026-09-02T08:00:00.000Z',
  },
  {
    id: 'adhoc-002',
    name: 'Panitia Khusus Pembangunan Menara 30 Meter Masjid Babul Khaer',
    code: 'PAN-MNR-2026',
    skNumber: '004/SK/DKM-BK/VI/2026',
    skDate: '2026-06-15',
    eventDate: '2028-06-30',
    targetBudget: 1550000000,
    description: 'Kepanitiaan ad-hoc multiyears untuk penggalangan dana donatur khusus, perizinan teknis IMB, dan pengawasan konstruksi fisik menara masjid.',
    structure: {
      ketua: { name: 'Drs. H. Suardi, M.Pd.', phone: '0811-4411-2233', address: 'BTP Blok AE No. 12' },
      sekretaris: { name: 'Ahmad Fauzi, S.Kom.', phone: '0852-3344-5566' },
      bendahara: { name: 'H. Sahali', phone: '0812-7788-9900' },
      sections: [
        {
          name: 'Seksi Teknis & Pengawasan Konstruksi',
          coordinator: 'Ir. Ruslan Effendi',
          members: ['Bambang Sudarmono, S.T.', 'H. Nancha'],
        },
        {
          name: 'Seksi Penggalangan Dana & Hubungan Donatur',
          coordinator: 'H. Arifin, S.E.',
          members: ['H. Sahali', 'Drs. H. Muh. Natsir'],
        },
      ],
    },
    status: 'AKTIF',
    createdAt: '2026-06-15T10:00:00.000Z',
  },
];
