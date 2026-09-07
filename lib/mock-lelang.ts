import { LelangItem } from '@/types/lelang';

export const INITIAL_LELANG_ITEMS: LelangItem[] = [
  {
    id: 'llg-001',
    itemName: 'Jam Dinding Kaligrafi Kayu Jati Ukir Jepara',
    description:
      'Donasi wakaf barang dari keluarga H. Ambo Tuo (RT 01). Bahan kayu jati TPK perhutani berukir ayat kursi dengan mesin sweep silent movement berkualitas tinggi. 100% hasil lelang dialokasikan untuk kelanjutan renovasi plafon lantai 2.',
    photoUrls: [
      'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
    ],
    startingBid: 750000,
    currentHighestBid: 1250000,
    currentBidderName: 'Hamba Allah (Warga Blok AE)',
    deadlineDate: '2026-09-25',
    status: 'BERLANGSUNG',
    coordinatorContact: '0812-4000-0003', // H. Sahali (Bendahara)
    division: 'Seksi Dana & Usaha Swadaya',
    createdBy: 'H. Sahali, S.E.',
  },
  {
    id: 'llg-002',
    itemName: 'Sepeda Lipat Polygon Urbano 3 Modifikasi Wakaf',
    description:
      'Sepeda lipat 20 inch kondisi mulus 95%, disumbangkan oleh donatur jamaah subuh untuk kas operasional dakwah. Sudah diservis lengkap dengan rak boncengan dan tas stang.',
    photoUrls: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80',
    ],
    startingBid: 1500000,
    currentHighestBid: 2100000,
    currentBidderName: 'Bpk. Ir. Rahmat Hidayat',
    deadlineDate: '2026-09-30',
    status: 'BERLANGSUNG',
    coordinatorContact: '0812-4000-0004', // Dr. Ir. H. Ruslan (Sarpras)
    division: 'Seksi Sarana & Prasarana',
    createdBy: 'Dr. Ir. H. Ruslan, M.T.',
  },
  {
    id: 'llg-003',
    itemName: 'Lukisan Kanvas Kaligrafi "Babul Khaer di Waktu Fajar"',
    description:
      'Karya seni lukis cat minyak ukuran 100x70cm karya santriwati TPA Babul Khaer binaan Remaja Masjid. Telah selesai dilelang pada perayaan Tahun Baru Islam 1448 H.',
    photoUrls: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
    ],
    startingBid: 500000,
    currentHighestBid: 1650000,
    currentBidderName: 'H. Sudirman, S.H.',
    deadlineDate: '2026-08-20',
    status: 'SELESAI',
    winnerName: 'H. Sudirman, S.H.',
    finalPrice: 1650000,
    coordinatorContact: '0812-4000-0002', // Muh. Ilham (Sekretaris)
    division: 'Seksi Kepemudaan & Remaja Masjid',
    createdBy: 'Muh. Ilham, S.Kom.',
  },
];
