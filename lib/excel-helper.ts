import * as XLSX from 'xlsx';
import { Jamaah } from '@/types/jamaah';

export function downloadJamaahTemplate() {
  // Sample template rows
  const sampleData = [
    {
      'Nama Lengkap*': 'H. Syarifuddin, SE',
      'Jenis Kelamin (L/P)': 'L',
      'NIK (KTP)': '7371111205700001',
      'Tempat Lahir': 'Makassar',
      'Tanggal Lahir (YYYY-MM-DD)': '1970-05-12',
      'RT (RT 01 s.d RT 05)*': 'RT 01',
      'Nomor Rumah (Blok AE)*': 'Blok AE No. 05',
      'Alamat Lengkap': 'Jl. Kerukunan Blok AE No. 05, Tamalanrea',
      'Nomor WhatsApp*': '081234567890',
      'Email': 'syarifuddin@gmail.com',
      'Status Domisili (TETAP/KONTRAK/KOST)': 'TETAP',
      'Kategori ZISWAF (MAMPU/MUZAKKI/MUSTAHIQ_DHUAFA/YATIM_PIATU/LANSIA_DHUAFA)': 'MUZAKKI',
      'Peran Keluarga (KEPALA_KELUARGA/ISTRI/ANAK/LANSIA_TANGGUNGAN)': 'KEPALA_KELUARGA',
      'Jumlah Jiwa KK': 4,
      'Pekerjaan': 'Wiraswasta',
      'Golongan Darah': 'O',
      'Remaja IRMA (YA/TIDAK)': 'TIDAK',
      'Catatan Khusus': 'Tokoh masyarakat RT 01',
    },
    {
      'Nama Lengkap*': 'Ibu Rabiah Daeng Bau',
      'Jenis Kelamin (L/P)': 'P',
      'NIK (KTP)': '7371115503600002',
      'Tempat Lahir': 'Gowa',
      'Tanggal Lahir (YYYY-MM-DD)': '1960-03-15',
      'RT (RT 01 s.d RT 05)*': 'RT 02',
      'Nomor Rumah (Blok AE)*': 'Blok AE No. 18',
      'Alamat Lengkap': 'Kompleks BTP Blok AE No. 18, Tamalanrea',
      'Nomor WhatsApp*': '085299112233',
      'Email': '',
      'Status Domisili (TETAP/KONTRAK/KOST)': 'TETAP',
      'Kategori ZISWAF (MAMPU/MUZAKKI/MUSTAHIQ_DHUAFA/YATIM_PIATU/LANSIA_DHUAFA)': 'MUSTAHIQ_DHUAFA',
      'Peran Keluarga (KEPALA_KELUARGA/ISTRI/ANAK/LANSIA_TANGGUNGAN)': 'LANSIA_TANGGUNGAN',
      'Jumlah Jiwa KK': 1,
      'Pekerjaan': 'Tidak Bekerja (Janda Lansia)',
      'Golongan Darah': 'B',
      'Remaja IRMA (YA/TIDAK)': 'TIDAK',
      'Catatan Khusus': 'Prioritas bansos sembako rutin bulanan',
    },
    {
      'Nama Lengkap*': 'Fajar Ramadhan',
      'Jenis Kelamin (L/P)': 'L',
      'NIK (KTP)': '7371111405050003',
      'Tempat Lahir': 'Makassar',
      'Tanggal Lahir (YYYY-MM-DD)': '2005-05-14',
      'RT (RT 01 s.d RT 05)*': 'RT 03',
      'Nomor Rumah (Blok AE)*': 'Blok AE No. 33',
      'Alamat Lengkap': 'Kompleks BTP Blok AE No. 33, Tamalanrea',
      'Nomor WhatsApp*': '087811223344',
      'Email': 'fajar.ramadhan@student.unhas.ac.id',
      'Status Domisili (TETAP/KONTRAK/KOST)': 'TETAP',
      'Kategori ZISWAF (MAMPU/MUZAKKI/MUSTAHIQ_DHUAFA/YATIM_PIATU/LANSIA_DHUAFA)': 'MAMPU',
      'Peran Keluarga (KEPALA_KELUARGA/ISTRI/ANAK/LANSIA_TANGGUNGAN)': 'ANAK',
      'Jumlah Jiwa KK': 5,
      'Pekerjaan': 'Mahasiswa',
      'Golongan Darah': 'A',
      'Remaja IRMA (YA/TIDAK)': 'YA',
      'Catatan Khusus': 'Anggota aktif Remaja Masjid IRMA Babul Khaer',
    }
  ];

  const guideData = [
    { 'Kolom': 'Nama Lengkap*', 'Keterangan': 'Wajib diisi nama warga lengkap beserta gelar jika ada' },
    { 'Kolom': 'Jenis Kelamin', 'Keterangan': 'Isi L untuk Laki-laki, atau P untuk Perempuan' },
    { 'Kolom': 'RT*', 'Keterangan': 'Pilihan: RT 01, RT 02, RT 03, RT 04, RT 05' },
    { 'Kolom': 'Nomor Rumah*', 'Keterangan': 'Contoh format: Blok AE No. 12 atau Blok AE No. 05A' },
    { 'Kolom': 'Nomor WhatsApp*', 'Keterangan': 'Nomor HP/WA aktif (cth: 08123456789 atau 628123456789)' },
    { 'Kolom': 'Status Domisili', 'Keterangan': 'Pilihan: TETAP, KONTRAK, atau KOST' },
    { 'Kolom': 'Kategori ZISWAF', 'Keterangan': 'Pilihan: MAMPU, MUZAKKI, MUSTAHIQ_DHUAFA, YATIM_PIATU, LANSIA_DHUAFA' },
    { 'Kolom': 'Peran Keluarga', 'Keterangan': 'Pilihan: KEPALA_KELUARGA, ISTRI, ANAK, LANSIA_TANGGUNGAN' },
    { 'Kolom': 'Remaja IRMA', 'Keterangan': 'Isi YA jika pemuda/remaja masjid, atau TIDAK' },
  ];

  const wb = XLSX.utils.book_new();

  const wsTemplate = XLSX.utils.json_to_sheet(sampleData);
  // Set column widths
  wsTemplate['!cols'] = [
    { wch: 25 }, // Nama Lengkap
    { wch: 18 }, // Gender
    { wch: 20 }, // NIK
    { wch: 16 }, // Tempat Lahir
    { wch: 25 }, // Tgl Lahir
    { wch: 20 }, // RT
    { wch: 24 }, // No Rumah
    { wch: 35 }, // Alamat
    { wch: 20 }, // WA
    { wch: 26 }, // Email
    { wch: 28 }, // Domisili
    { wch: 36 }, // Kategori ZISWAF
    { wch: 30 }, // Peran Keluarga
    { wch: 16 }, // Jumlah Jiwa
    { wch: 24 }, // Pekerjaan
    { wch: 16 }, // Gol Darah
    { wch: 20 }, // IRMA
    { wch: 35 }, // Catatan
  ];

  const wsGuide = XLSX.utils.json_to_sheet(guideData);
  wsGuide['!cols'] = [{ wch: 25 }, { wch: 60 }];

  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Data Jamaah');
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk Pengisian');

  XLSX.writeFile(wb, 'template_input_jamaah_dkm_babul_khaer.xlsx');
}

export function exportJamaahToExcel(jamaahList: Jamaah[]) {
  const exportData = jamaahList.map((j, index) => ({
    'No': index + 1,
    'Nama Lengkap': j.fullName,
    'Jenis Kelamin': j.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    'NIK': j.nik || '-',
    'Tempat Lahir': j.birthPlace || '-',
    'Tanggal Lahir': j.birthDate || '-',
    'RT': j.rt,
    'Nomor Rumah': j.houseNumber,
    'Alamat Lengkap': j.fullAddress,
    'Nomor WhatsApp': j.phone,
    'Email': j.email || '-',
    'Status Domisili': j.residencyStatus,
    'Kategori ZISWAF': j.economicStatus,
    'Peran Keluarga': j.familyRole,
    'Jumlah Jiwa KK': j.familyMemberCount || 1,
    'Pekerjaan': j.occupation || '-',
    'Golongan Darah': j.bloodType || '-',
    'Anggota IRMA': j.isYouthMember ? 'YA' : 'TIDAK',
    'Catatan Pengurus': j.notes || '-',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);
  XLSX.utils.book_append_sheet(wb, ws, 'Database Jamaah Blok AE');

  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `database_jamaah_btp_blok_ae_${today}.xlsx`);
}

export interface ParsedExcelResult {
  valid: Omit<Jamaah, 'id' | 'createdAt' | 'updatedAt'>[];
  errors: { row: number; reason: string }[];
  totalRows: number;
}

export async function parseJamaahExcelFile(file: File): Promise<ParsedExcelResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });

        // Use first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });

        const valid: Omit<Jamaah, 'id' | 'createdAt' | 'updatedAt'>[] = [];
        const errors: { row: number; reason: string }[] = [];

        rawRows.forEach((row, index) => {
          const rowNum = index + 2; // Excel row numbering (1 is header)

          // Flexible key lookup
          const getVal = (keys: string[]): string => {
            for (const k of Object.keys(row)) {
              for (const searchKey of keys) {
                if (k.toLowerCase().includes(searchKey.toLowerCase())) {
                  return String(row[k]).trim();
                }
              }
            }
            return '';
          };

          const fullName = getVal(['nama lengkap', 'nama']);
          const rawGender = getVal(['jenis kelamin', 'gender']).toUpperCase();
          const gender = rawGender.startsWith('P') ? 'P' : 'L';
          const nik = getVal(['nik', 'ktp']);
          const birthPlace = getVal(['tempat lahir']);
          const birthDate = getVal(['tanggal lahir', 'tgl lahir']);

          let rawRt = getVal(['rt', 'rukun tetangga']).toUpperCase();
          if (!rawRt.startsWith('RT')) {
            const num = rawRt.replace(/\D/g, '');
            rawRt = num ? `RT ${num.padStart(2, '0')}` : 'RT 01';
          }
          const validRts = ['RT 01', 'RT 02', 'RT 03', 'RT 04', 'RT 05'] as const;
          const rt = (validRts.find((r) => r === rawRt) || 'RT 01') as 'RT 01' | 'RT 02' | 'RT 03' | 'RT 04' | 'RT 05';

          const houseNumber = getVal(['nomor rumah', 'no rumah', 'rumah']);
          const fullAddress = getVal(['alamat lengkap', 'alamat']);
          const phone = getVal(['whatsapp', 'wa', 'telepon', 'hp', 'kontak']);
          const email = getVal(['email']);

          const rawResidency = getVal(['domisili', 'status domisili']).toUpperCase();
          const residencyStatus = rawResidency.includes('KONTRAK')
            ? 'KONTRAK'
            : rawResidency.includes('KOST')
            ? 'KOST'
            : 'TETAP';

          const rawZiswaf = getVal(['ziswaf', 'kategori', 'ekonomi']).toUpperCase();
          let economicStatus: Jamaah['economicStatus'] = 'MAMPU';
          if (rawZiswaf.includes('MUZAKKI')) economicStatus = 'MUZAKKI';
          else if (rawZiswaf.includes('MUSTAHIQ') || rawZiswaf.includes('DHUAFA')) economicStatus = 'MUSTAHIQ_DHUAFA';
          else if (rawZiswaf.includes('YATIM')) economicStatus = 'YATIM_PIATU';
          else if (rawZiswaf.includes('LANSIA')) economicStatus = 'LANSIA_DHUAFA';

          const rawRole = getVal(['peran keluarga', 'peran', 'status keluarga']).toUpperCase();
          let familyRole: Jamaah['familyRole'] = 'KEPALA_KELUARGA';
          if (rawRole.includes('ISTRI')) familyRole = 'ISTRI';
          else if (rawRole.includes('ANAK')) familyRole = 'ANAK';
          else if (rawRole.includes('LANSIA') || rawRole.includes('TANGGUNGAN')) familyRole = 'LANSIA_TANGGUNGAN';

          const rawJiwa = getVal(['jumlah jiwa', 'jiwa', 'anggota']);
          const familyMemberCount = parseInt(rawJiwa, 10) || 1;

          const occupation = getVal(['pekerjaan', 'profesi']);
          const bloodType = getVal(['darah', 'golongan darah']) || '-';

          const rawIrma = getVal(['irma', 'remaja']).toUpperCase();
          const isYouthMember = rawIrma.includes('YA') || rawIrma.includes('TRUE') || rawIrma.includes('1');

          const notes = getVal(['catatan', 'keterangan']);

          // Validation
          if (!fullName) {
            errors.push({ row: rowNum, reason: 'Nama lengkap kosong' });
            return;
          }
          if (!houseNumber) {
            errors.push({ row: rowNum, reason: `Nomor rumah kosong untuk "${fullName}"` });
            return;
          }
          if (!phone) {
            errors.push({ row: rowNum, reason: `Nomor WhatsApp kosong untuk "${fullName}"` });
            return;
          }

          valid.push({
            fullName,
            gender,
            nik,
            birthPlace,
            birthDate,
            rt,
            houseNumber,
            fullAddress: fullAddress || `Kompleks BTP ${houseNumber}, Makassar`,
            phone,
            email,
            residencyStatus,
            economicStatus,
            familyRole,
            familyMemberCount,
            occupation,
            bloodType,
            isYouthMember,
            notes,
          });
        });

        resolve({
          valid,
          errors,
          totalRows: rawRows.length,
        });
      } catch (err) {
        reject(new Error(`Gagal membaca file Excel: ${err instanceof Error ? err.message : String(err)}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file'));
    };

    reader.readAsBinaryString(file);
  });
}
