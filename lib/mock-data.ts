import { OfficialLetter, MeetingMinutes } from '@/types/letter';
import { DKM_INFO } from './letter-numbering';

export const INITIAL_LETTERS: OfficialLetter[] = [
  {
    id: 'ltr-009',
    letterNumber: `009/${DKM_INFO.code}/UND/VIII/2026`,
    sequenceNumber: 9,
    category: 'UND',
    recipientName: 'Seluruh Pengurus DKM & Tokoh Masyarakat BTP Blok AE',
    recipientTitle: 'Bapak/Ibu Jamaah',
    recipientAddress: 'Kompleks BTP Blok AE, Makassar',
    subject: 'Undangan Rapat Pembubaran & Evaluasi Panitia Idul Adha 1447 H',
    letterDate: '2026-08-20',
    attachmentCount: '1 (Satu) Berkas',
    eventDate: '2026-08-24',
    eventTime: '20.00 WITA (Ba\'da Isya) s.d Selesai',
    eventLocation: 'Ruang Pertemuan / Serambi Masjid Babul Khaer',
    content: `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Segala puji bagi Allah Subhanahu wa Ta'ala yang senantiasa melimpahkan taufiq dan inayah-Nya kepada kita semua. Shalawat dan salam semoga tercurah kepada junjungan kita Nabi Muhammad SAW.

Sehubungan dengan telah terlaksananya seluruh rangkaian ibadah dan penyembelihan hewan Qurban 1447 H di Masjid Babul Khaer, kami mengundang Bapak/Ibu pengurus serta panitia untuk menghadiri rapat evaluasi dan laporan pertanggungjawaban panitia.

Mengingat pentingnya agenda ini untuk perbaikan pelaksanaan kegiatan di masa mendatang, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktunya.

Demikian undangan ini kami sampaikan. Atas perhatian dan kesediaan Bapak/Ibu, kami haturkan jazakumullahu khairan katsiran.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
    status: 'ARCHIVED',
    signatory1: {
      name: DKM_INFO.defaultChairman,
      role: 'Ketua Umum DKM',
    },
    signatory2: {
      name: DKM_INFO.defaultSecretary,
      role: 'Sekretaris Umum',
    },
    createdAt: '2026-08-20T08:30:00.000Z',
    updatedAt: '2026-08-25T10:00:00.000Z',
  },
  {
    id: 'ltr-010',
    letterNumber: `010/${DKM_INFO.code}/PER/VIII/2026`,
    sequenceNumber: 10,
    category: 'PER',
    recipientName: 'Ustadz Dr. H. Syahrir, Lc., M.Th.I',
    recipientTitle: 'Pimpinan Ponpes / Dosen FAI UMI',
    recipientAddress: 'Makassar',
    subject: 'Permohonan Kesediaan Menjadi Penceramah Kajian Subuh Ahad',
    letterDate: '2026-08-28',
    attachmentCount: '-',
    eventDate: '2026-09-13',
    eventTime: '05.15 WITA (Ba\'da Shalat Subuh) s.d 06.30 WITA',
    eventLocation: 'Masjid Babul Khaer BTP Blok AE',
    content: `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Alhamdulillah, puji syukur senantiasa kita panjatkan ke hadirat Allah SWT atas segala nikmat dan karunia-Nya. Shalawat dan salam semoga senantiasa tercurah kepada Nabi Muhammad SAW beserta keluarga dan sahabatnya.

Dalam rangka meningkatkan syiar dakwah dan pemahaman keislaman jamaah Masjid Babul Khaer, Bidang Dakwah & Ibadah DKM Babul Khaer bermaksud menyelenggarakan "Kajian Tematik Subuh Ahad Berjamaah".

Sehubungan dengan hal tersebut, kami memohon kesediaan Ustadz untuk berkenan hadir memberikan tausiyah dengan tema: "Menjaga Keikhlasan dalam Amal dan Mempererat Ukhuwah Islamiyah".

Demikian permohonan ini kami ajukan. Besar harapan kami atas perkenan Ustadz untuk hadir. Atas kesediaan dan kebaikan Ustadz, kami ucapkan terima kasih yang sebesar-besarnya.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
    status: 'SENT',
    signatory1: {
      name: DKM_INFO.defaultChairman,
      role: 'Ketua Umum DKM',
    },
    signatory2: {
      name: DKM_INFO.defaultSecretary,
      role: 'Sekretaris Umum',
    },
    createdAt: '2026-08-28T09:00:00.000Z',
    updatedAt: '2026-08-29T14:20:00.000Z',
  },
  {
    id: 'ltr-011',
    letterNumber: `011/${DKM_INFO.code}/PEM/IX/2026`,
    sequenceNumber: 11,
    category: 'PEM',
    recipientName: 'Ketua RT 01 s.d RT 05 RW 08',
    recipientTitle: 'Bapak/Ibu Ketua RT',
    recipientAddress: 'Kompleks BTP Blok AE',
    subject: 'Pemberitahuan Kerja Bakti Lingkungan Masjid dan Perawatan Sarpras',
    letterDate: '2026-09-01',
    attachmentCount: '-',
    eventDate: '2026-09-06',
    eventTime: '07.00 WITA s.d Selesai',
    eventLocation: 'Halaman dan Area Sekitar Masjid Babul Khaer',
    content: `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Puji dan syukur kita panjatkan kepada Allah SWT atas limpahan rahmat, hidayah, dan taufik-Nya. Shalawat dan salam semoga senantiasa terlimpahkan kepada junjungan kita Rasulullah SAW.

Diberitahukan kepada seluruh Ketua RT di lingkungan BTP Blok AE, bahwa dalam rangka menjaga kebersihan, kenyamanan beribadah, serta persiapan menyambut agenda Peringatan Hari Besar Islam (PHBI), DKM Babul Khaer akan melaksanakan Kerja Bakti Bersama dan Pembersihan Saluran Air di sekitar masjid.

Kami mengimbau kepada Bapak/Ibu Ketua RT untuk dapat meneruskan informasi ini kepada seluruh warga jamaah agar dapat berpartisipasi dan membawa perlengkapan kerja bakti seperlunya.

Demikian surat pemberitahuan ini kami sampaikan. Atas sinergi dan partisipasi warga, kami ucapkan terima kasih.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
    status: 'APPROVED',
    signatory1: {
      name: DKM_INFO.defaultChairman,
      role: 'Ketua Umum DKM',
    },
    signatory2: {
      name: DKM_INFO.defaultSecretary,
      role: 'Sekretaris Umum',
    },
    createdAt: '2026-09-01T10:15:00.000Z',
    updatedAt: '2026-09-02T11:00:00.000Z',
  },
  {
    id: 'ltr-012',
    letterNumber: `012/${DKM_INFO.code}/SKET/IX/2026`,
    sequenceNumber: 12,
    category: 'SKET',
    recipientName: 'Muhammad Rizky Ramadhan',
    recipientTitle: 'Mahasiswa / Jamaah Remaja Masjid',
    recipientAddress: 'BTP Blok AE No. 42, Makassar',
    subject: 'Surat Keterangan Aktif Jamaah dan Remaja Masjid Babul Khaer',
    letterDate: '2026-09-03',
    attachmentCount: '-',
    content: `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Yang bertanda tangan di bawah ini, Pengurus Dewan Kemakmuran Masjid (DKM) Babul Khaer BTP Blok AE Tamalanrea Makassar, menerangkan bahwa:

Nama              : Muhammad Rizky Ramadhan
Tempat/Tgl Lahir  : Makassar, 14 Mei 2004
Alamat            : BTP Blok AE No. 42, Tamalanrea, Makassar
Status            : Mahasiswa Universitas Hasanuddin

Adalah benar warga jamaah tetap dan merupakan anggota aktif Remaja Masjid Babul Khaer (IRMA Babul Khaer) yang senantiasa berkontribusi dalam kegiatan ketakmiran, kepanitiaan dakwah, serta pembinaan TPA/TPQ di lingkungan Masjid Babul Khaer.

Surat keterangan ini diberikan atas permohonan yang bersangkutan sebagai dokumen kelengkapan administrasi pengajuan Beasiswa Kepemimpinan Mahasiswa Muslim.

Demikian surat keterangan ini kami buat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
    status: 'APPROVED',
    signatory1: {
      name: DKM_INFO.defaultChairman,
      role: 'Ketua Umum DKM',
    },
    signatory2: {
      name: DKM_INFO.defaultSecretary,
      role: 'Sekretaris Umum',
    },
    createdAt: '2026-09-03T11:20:00.000Z',
    updatedAt: '2026-09-03T13:00:00.000Z',
  },
  {
    id: 'ltr-013',
    letterNumber: `013/${DKM_INFO.code}/UND/IX/2026`,
    sequenceNumber: 13,
    category: 'UND',
    recipientName: 'Seluruh Jamaah & Warga Muslim Blok AE',
    recipientTitle: 'Bapak/Ibu/Saudara(i)',
    recipientAddress: 'BTP Blok AE, Makassar',
    subject: 'Undangan Rapat Pembentukan Panitia Peringatan Maulid Nabi 1448 H',
    letterDate: '2026-09-04',
    attachmentCount: '-',
    eventDate: '2026-09-07',
    eventTime: '20.00 WITA (Ba\'da Isya)',
    eventLocation: 'Ruang Utama Masjid Babul Khaer',
    content: `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Puji syukur kita panjatkan ke hadirat Allah SWT, shalawat serta salam senantiasa tercurah kepada junjungan kita Nabi Besar Muhammad SAW.

Dalam rangka menyambut Peringatan Hari Besar Islam (PHBI) Maulid Nabi Muhammad SAW 1448 H, DKM Babul Khaer bermaksud membentuk Panitia Pelaksana satu pintu dengan sistem pendanaan swadaya jamaah yang tertib dan transparan.

Kami mengundang Bapak/Ibu pengurus, tokoh masyarakat, dan perwakilan remaja masjid untuk menghadiri musyawarah pembentukan panitia pelaksana.

Kehadiran dan sumbangsih pemikiran Bapak/Ibu sangat kami harapkan demi kesuksesan syiar dakwah di lingkungan kita.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
    status: 'DRAFT',
    signatory1: {
      name: DKM_INFO.defaultChairman,
      role: 'Ketua Umum DKM',
    },
    signatory2: {
      name: DKM_INFO.defaultSecretary,
      role: 'Sekretaris Umum',
    },
    createdAt: '2026-09-04T14:00:00.000Z',
    updatedAt: '2026-09-04T14:00:00.000Z',
  }
];

export const INITIAL_MINUTES: MeetingMinutes[] = [
  {
    id: 'min-001',
    title: 'Rapat Pleno DKM: Evaluasi Idul Adha & Persiapan Agenda PHBI Semester II',
    date: '2026-08-24',
    location: 'Serambi Masjid Babul Khaer',
    attendees: 'Ketua DKM, Sekretaris Umum, Bendahara, Koordinator Sarpras, Koordinator Dakwah, Ketua RW 08',
    summary: 'Rapat menyepakati penutupan laporan keuangan Idul Adha dengan saldo surplus Rp 4.250.000 yang dialihkan ke kas operasional masjid. Diputuskan juga jadwal servis berkala AC duduk, serta persiapan pembentukan panitia Maulid Nabi 1448 H satu pintu.',
    decisions: [
      'Laporan Pertanggungjawaban Qurban 1447 H disahkan oleh Ketua Umum.',
      'Sistem donasi kegiatan PHBI wajib satu pintu melalui rekening DKM dan dicatat terpisah oleh bendahara.',
      'Jadwal servis berkala 6 unit AC dan pembersihan filter sound system dilakukan sebelum tanggal 10 September 2026.'
    ],
    actionItems: [
      {
        id: 'act-001',
        task: 'Menerbitkan surat undangan pembentukan panitia Maulid Nabi ke warga RT 01-05',
        pic: 'Sekretaris Umum (Ahmad Fauzi)',
        deadline: '2026-09-05',
        priority: 'HIGH',
        status: 'COMPLETED'
      },
      {
        id: 'act-002',
        task: 'Koordinasi teknisi pendingin untuk servis berkala AC utama masjid',
        pic: 'Seksi Sarana & Prasarana',
        deadline: '2026-09-08',
        priority: 'HIGH',
        status: 'IN_PROGRESS'
      },
      {
        id: 'act-003',
        task: 'Penyusunan rincian draf estimasi anggaran Maulid Nabi 1448 H',
        pic: 'Bendahara DKM',
        deadline: '2026-09-11',
        priority: 'MEDIUM',
        status: 'PENDING'
      }
    ],
    createdAt: '2026-08-25T09:00:00.000Z'
  }
];
