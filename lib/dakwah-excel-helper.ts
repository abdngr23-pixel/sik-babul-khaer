import * as XLSX from 'xlsx';
import { FridayScheduleItem, RamadhanScheduleItem, KhatibItem } from '@/types/dakwah';

// Helper to parse Excel dates (serial numbers or strings)
export function parseExcelDateString(val: unknown): string {
  if (!val) return '';
  if (typeof val === 'number') {
    try {
      const date = XLSX.SSF.parse_date_code(val);
      if (date && date.y && date.m && date.d) {
        const y = date.y;
        const m = String(date.m).padStart(2, '0');
        const d = String(date.d).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } catch {
      return String(val);
    }
  }
  const str = String(val).trim();
  // If format DD/MM/YYYY or DD-MM-YYYY
  if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(str)) {
    const parts = str.split(/[/-]/);
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  }
  return str;
}

// -----------------------------------------------------------------------------
// 1. TEMPLATE & EXPORT JADWAL KHATIB JUMAT
// -----------------------------------------------------------------------------

export function downloadFridayScheduleTemplate(year: number, asatidzList: KhatibItem[] = []) {
  const sampleFridayData = [
    {
      'Tanggal (YYYY-MM-DD)*': `${year}-09-04`,
      'Tanggal Hijriah': '22 Safar 1448 H',
      'Nama Khatib*': 'Dr. Drs. H. Andi Hasanuddin, M.M.',
      'Gelar / Keterangan Dai': 'Dewan Penasihat DKM / Ulama Makassar',
      'Nama Imam*': 'Drs. Manai, M.M.',
      'Judul / Tema Khutbah*': 'Rasa Syukur dan Semangat Kebersamaan Mengawali Amanah Kepengurusan Baru',
      'Nomor WhatsApp*': '0812-4111-2200',
      'Insentif / Honor (Rp)': 1500000,
      'Status (TERKONFIRMASI/MENUNGGU)': 'TERKONFIRMASI',
      'Catatan': 'Khutbah Jumat perdana, mikrofon nirkabel telah disiapkan',
    },
    {
      'Tanggal (YYYY-MM-DD)*': `${year}-09-11`,
      'Tanggal Hijriah': '29 Safar 1448 H',
      'Nama Khatib*': 'Drs. H. Muh. Rusdi Lahajji, M. Pd.',
      'Gelar / Keterangan Dai': 'Dosen / Pengurus PC DMI Biringkanaya',
      'Nama Imam*': 'Drs. Manai, M.M.',
      'Judul / Tema Khutbah*': 'Menjaga Kesucian Niat dan Mengokohkan Kemakmuran Masjid',
      'Nomor WhatsApp*': '0812-4111-2201',
      'Insentif / Honor (Rp)': 1500000,
      'Status (TERKONFIRMASI/MENUNGGU)': 'TERKONFIRMASI',
      'Catatan': 'Durasi khutbah maksimal 20 menit',
    },
    {
      'Tanggal (YYYY-MM-DD)*': `${year}-09-18`,
      'Tanggal Hijriah': '7 Rabiul Awal 1448 H',
      'Nama Khatib*': 'Drs. Ahmad Sumadiana',
      'Gelar / Keterangan Dai': 'Tokoh Agama Katimbang',
      'Nama Imam*': 'Drs. Manai, M.M.',
      'Judul / Tema Khutbah*': 'Ukhuwah Islamiyah sebagai Pondasi Kekuatan Umat di Lingkungan Warga',
      'Nomor WhatsApp*': '0812-4111-2202',
      'Insentif / Honor (Rp)': 1500000,
      'Status (TERKONFIRMASI/MENUNGGU)': 'TERKONFIRMASI',
      'Catatan': 'Konfirmasi via WhatsApp',
    },
    {
      'Tanggal (YYYY-MM-DD)*': `${year}-09-25`,
      'Tanggal Hijriah': '14 Rabiul Awal 1448 H',
      'Nama Khatib*': 'Ust. Habibi, S.H.',
      'Gelar / Keterangan Dai': 'Dai Muda Biringkanaya',
      'Nama Imam*': 'Fathan Mubin Hasri, S. Pd.I.',
      'Judul / Tema Khutbah*': 'Keteladanan Akhlak Rasulullah SAW dalam Membangun Generasi Qurani',
      'Nomor WhatsApp*': '0812-4111-2203',
      'Insentif / Honor (Rp)': 1500000,
      'Status (TERKONFIRMASI/MENUNGGU)': 'MENUNGGU',
      'Catatan': 'Menunggu konfirmasi kehadiran H-3',
    },
  ];

  const asatidzRefData = asatidzList.map((a) => ({
    'Nama Lengkap & Gelar': a.name,
    'Gelar / Keterangan': a.title,
    'Fokus Keilmuan / Materi': a.specialization,
    'Asal Lembaga / Ormas': a.institution,
    'Nomor WhatsApp': a.phone,
    'Domisili': a.address,
    'Status Ketersediaan': a.status,
    'Jam Terbang Penugasan': `${a.totalAppearances}x`,
  }));

  const guideData = [
    { 'Panduan Kolom': 'Tanggal (YYYY-MM-DD)*', 'Ketentuan': 'Wajib diisi tanggal pelaksanaan hari Jumat (format tahun-bulan-tanggal, contoh: 2026-09-11)' },
    { 'Panduan Kolom': 'Nama Khatib*', 'Ketentuan': 'Wajib diisi nama khatib beserta gelar resmi' },
    { 'Panduan Kolom': 'Nama Imam*', 'Ketentuan': 'Wajib diisi nama imam sholat Jumat (utamakan Imam Rawatib DKM)' },
    { 'Panduan Kolom': 'Judul / Tema Khutbah*', 'Ketentuan': 'Wajib diisi tema atau judul materi khutbah' },
    { 'Panduan Kolom': 'Nomor WhatsApp*', 'Ketentuan': 'Wajib diisi nomor HP/WA untuk koordinasi penugasan' },
    { 'Panduan Kolom': 'Insentif / Honor (Rp)', 'Ketentuan': 'Standar insentif Raker 2026: Rp 1.500.000 / Jumat' },
    { 'Panduan Kolom': 'Status', 'Ketentuan': 'Pilihan: TERKONFIRMASI atau MENUNGGU' },
  ];

  const wb = XLSX.utils.book_new();

  const wsTemplate = XLSX.utils.json_to_sheet(sampleFridayData);
  wsTemplate['!cols'] = [
    { wch: 22 }, // Tanggal
    { wch: 20 }, // Hijriah
    { wch: 32 }, // Khatib
    { wch: 30 }, // Gelar
    { wch: 26 }, // Imam
    { wch: 45 }, // Tema
    { wch: 18 }, // WA
    { wch: 20 }, // Honor
    { wch: 22 }, // Status
    { wch: 35 }, // Catatan
  ];
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template Jadwal Jumat');

  if (asatidzRefData.length > 0) {
    const wsAsatidz = XLSX.utils.json_to_sheet(asatidzRefData);
    wsAsatidz['!cols'] = [
      { wch: 32 },
      { wch: 30 },
      { wch: 30 },
      { wch: 28 },
      { wch: 18 },
      { wch: 25 },
      { wch: 18 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, wsAsatidz, 'Referensi Asatidz DKM');
  }

  const wsGuide = XLSX.utils.json_to_sheet(guideData);
  wsGuide['!cols'] = [{ wch: 30 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Petunjuk Pengisian');

  XLSX.writeFile(wb, `Template_Jadwal_Khatib_Jumat_Tahun_${year}.xlsx`);
}

export function parseFridayExcelFile(
  file: File,
  targetYear: number
): Promise<{ valid: FridayScheduleItem[]; errors: { row: number; reason: string }[]; detectedYear: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) {
          throw new Error('File spreadsheet kosong atau tidak memiliki lembar kerja.');
        }

        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

        if (rawRows.length === 0) {
          throw new Error('Tidak ada baris data yang ditemukan di sheet pertama.');
        }

        const validItems: FridayScheduleItem[] = [];
        const errorList: { row: number; reason: string }[] = [];
        let detectedYear = targetYear;

        rawRows.forEach((row, index) => {
          const rowNum = index + 2; // header is row 1

          // Normalisasi key
          const getField = (...keys: string[]): unknown => {
            for (const k of keys) {
              const foundKey = Object.keys(row).find(
                (orig) => orig.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')
              );
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
                return row[foundKey];
              }
            }
            return '';
          };

          const rawDate = getField('tanggal', 'date', 'tanggal (yyyy-mm-dd)*');
          const dateStr = parseExcelDateString(rawDate);
          const khatibName = String(getField('namakhatib', 'khatib', 'namakhatib*')).trim();
          const imamName = String(getField('namaimam', 'imam', 'namaimam*')).trim() || 'Drs. Manai, M.M.';
          const khutbahTopic = String(getField('judultemakhutbah', 'temakhutbah', 'judulkhutbah', 'tema', 'judultemakhutbah*')).trim();
          const phone = String(getField('nomorwhatsapp', 'whatsapp', 'nohp', 'nomorwhatsapp*')).trim() || '0812-4000-0001';
          const khatibTitle = String(getField('gelarketerangandai', 'gelar', 'jabatan')).trim();
          const dateHijri = String(getField('tanggalhijriah', 'hijriah', 'hijri')).trim() || 'Safar / Rabiul Awal 1448 H';
          const rawHonor = getField('insentifhonorrp', 'insentif', 'honor');
          const incentiveAmount = Number(rawHonor) > 0 ? Number(rawHonor) : 1500000;
          const rawStatus = String(getField('status', 'status (terkonfirmasi/menunggu)')).toUpperCase().trim();
          const status = rawStatus.includes('KONFIRMASI') ? 'TERKONFIRMASI' : 'MENUNGGU';
          const notes = String(getField('catatan', 'notes', 'keterangan')).trim();

          // Validasi wajib
          if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            errorList.push({
              row: rowNum,
              reason: `Tanggal tidak valid: "${String(rawDate)}". Gunakan format YYYY-MM-DD.`,
            });
            return;
          }

          if (!khatibName) {
            errorList.push({
              row: rowNum,
              reason: 'Kolom Nama Khatib wajib diisi.',
            });
            return;
          }

          if (!khutbahTopic) {
            errorList.push({
              row: rowNum,
              reason: 'Kolom Judul/Tema Khutbah wajib diisi.',
            });
            return;
          }

          // Extract year from date
          const rowYear = parseInt(dateStr.slice(0, 4), 10);
          if (rowYear && index === 0) {
            detectedYear = rowYear;
          }

          validItems.push({
            id: `fri-upload-${Date.now()}-${index}`,
            year: rowYear || targetYear,
            date: dateStr,
            dateHijri: dateHijri,
            khatibName: khatibName,
            khatibTitle: khatibTitle || undefined,
            imamName: imamName,
            khutbahTopic: khutbahTopic,
            phone: phone,
            status: status,
            incentiveAmount: incentiveAmount,
            notes: notes || undefined,
            isCompleted: false,
          });
        });

        resolve({ valid: validItems, errors: errorList, detectedYear });
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Gagal memproses file Excel jadwal Jumat.'));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file dari komputer.'));
    reader.readAsArrayBuffer(file);
  });
}

export function exportFridayScheduleToExcel(schedules: FridayScheduleItem[], year: number) {
  const exportRows = schedules.map((s, idx) => ({
    'No': idx + 1,
    'Tanggal (Masehi)': s.date,
    'Tanggal Hijriah': s.dateHijri,
    'Nama Khatib': s.khatibName,
    'Gelar / Keterangan': s.khatibTitle || '-',
    'Imam Sholat': s.imamName,
    'Judul / Tema Khutbah': s.khutbahTopic,
    'Kontak WhatsApp': s.phone,
    'Insentif Terjadwal (Rp)': s.incentiveAmount,
    'Status Konfirmasi': s.status,
    'Status Pelaksanaan': s.isCompleted ? 'SUDAH DIKERJAKAN' : 'BELUM',
    'Jumlah Jamaah Hadir': s.attendanceCount || '-',
    'Realisasi Honor (Rp)': s.actualHonorDisbursed || '-',
    'Intisari / Evaluasi Khutbah': s.summaryNotes || s.notes || '-',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportRows);
  ws['!cols'] = [
    { wch: 6 },
    { wch: 18 },
    { wch: 20 },
    { wch: 32 },
    { wch: 28 },
    { wch: 26 },
    { wch: 45 },
    { wch: 18 },
    { wch: 22 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 22 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, `Jadwal Jumat ${year}`);
  XLSX.writeFile(wb, `Jadwal_Resmi_Khatib_Jumat_Tahun_${year}.xlsx`);
}

// -----------------------------------------------------------------------------
// 2. TEMPLATE & EXPORT JADWAL PENCERAMAH RAMADHAN
// -----------------------------------------------------------------------------

export function downloadRamadhanScheduleTemplate(
  year: number,
  hijriYear: string,
  asatidzList: KhatibItem[] = []
) {
  // Generate 30 nights template prefilled with standard Raker values
  const sampleRamadhanData = Array.from({ length: 30 }, (_, i) => {
    const night = i + 1;
    let sampleSpeaker = '';
    let sampleTopic = '';
    let sampleHost = `Warga RT 0${(night % 5) + 1} BTP Blok AE`;

    if (night === 1) {
      sampleSpeaker = 'Drs. Muhammad Hasri, M. Hum.';
      sampleTopic = 'Marhaban Ya Ramadhan: Momentum Pembersihan Jiwa dan Harta';
      sampleHost = 'Pengurus DKM & Tokoh Masyarakat BTP Blok AE';
    } else if (night === 2) {
      sampleSpeaker = 'Drs. H. Suardi, M. Pd.';
      sampleTopic = 'Puasa Menumbuhkan Empati dan Kepedulian Sosial kepada Kaum Dhuafa';
    } else if (night === 3) {
      sampleSpeaker = 'Ust. Habibi, S.H.';
      sampleTopic = 'Keutamaan Al-Qur\'an dan Menjaga Keistiqamahan Tadarrus';
    } else if (night === 21) {
      sampleSpeaker = 'Dr. Andi Fiptar Abdi Alam, M. Si.';
      sampleTopic = 'Menjemput Lailatul Qadar dengan Qiyamul Lail dan I\'tikaf Khusyuk';
      sampleHost = 'Majelis Taklim Muslimah & Donatur Swadaya';
    }

    return {
      'Malam Ke (1-30)*': night,
      'Tanggal Masehi / Hijriah*': `${night} Ramadhan ${hijriYear}`,
      'Penceramah Tarawih / Kultum*': sampleSpeaker || (asatidzList[night % asatidzList.length]?.name || 'Ust. Dai Ramadhan'),
      'Judul / Tema Kultum*': sampleTopic || `Kultum Tarawih Malam Ke-${night}: Meraih Derajat Taqwa`,
      'Honor Penceramah (Rp)': 400000, // Standar Raker 2026
      'Imam Sholat Tarawih*': night % 2 === 1 ? 'Drs. Manai, M.M.' : 'Drs. Ahmad Sumadiana',
      'Honor Imam Tarawih (Rp)': 300000, // Standar Raker 2026
      'Tuan Rumah Buka Puasa (RT / Donatur)': sampleHost,
      'Estimasi Porsi Bukber': 120,
      'Status Itikaf (TERJADWAL/TIDAK_ADA)': night >= 21 ? 'TERJADWAL' : 'TIDAK_ADA',
    };
  });

  const asatidzRefData = asatidzList.map((a) => ({
    'Nama Lengkap & Gelar': a.name,
    'Gelar / Keterangan': a.title,
    'Fokus Keilmuan / Materi': a.specialization,
    'Asal Lembaga / Ormas': a.institution,
    'Nomor WhatsApp': a.phone,
    'Domisili': a.address,
    'Status': a.status,
  }));

  const guideData = [
    { 'Panduan Kolom': 'Malam Ke (1-30)*', 'Keterangan': 'Nomor malam Ramadhan ke-1 sampai ke-30' },
    { 'Panduan Kolom': 'Penceramah Tarawih / Kultum*', 'Keterangan': 'Wajib diisi nama ustadz penceramah' },
    { 'Panduan Kolom': 'Honor Penceramah (Rp)', 'Keterangan': 'Standar revisi Pleno Raker 2026: Rp 400.000 / malam' },
    { 'Panduan Kolom': 'Imam Sholat Tarawih*', 'Keterangan': 'Wajib diisi nama imam sholat tarawih' },
    { 'Panduan Kolom': 'Honor Imam Tarawih (Rp)', 'Keterangan': 'Standar revisi Pleno Raker 2026: Rp 300.000 / malam' },
    { 'Panduan Kolom': 'Tuan Rumah Buka Puasa', 'Keterangan': 'Giliran RT warga Blok AE (Partisipasi swadaya jamaah Rp 0 Kas Masjid)' },
    { 'Panduan Kolom': 'Status Itikaf', 'Keterangan': 'Pilihan: TERJADWAL atau TIDAK_ADA (Khusus 10 malam terakhir)' },
  ];

  const wb = XLSX.utils.book_new();

  const wsTemplate = XLSX.utils.json_to_sheet(sampleRamadhanData);
  wsTemplate['!cols'] = [
    { wch: 18 }, // Malam Ke
    { wch: 26 }, // Tanggal
    { wch: 32 }, // Penceramah
    { wch: 45 }, // Tema Kultum
    { wch: 22 }, // Honor Penceramah
    { wch: 28 }, // Imam Tarawih
    { wch: 22 }, // Honor Imam
    { wch: 35 }, // Bukber Host
    { wch: 20 }, // Porsi Bukber
    { wch: 26 }, // Itikaf
  ];
  XLSX.utils.book_append_sheet(wb, wsTemplate, 'Template Jadwal Ramadhan');

  if (asatidzRefData.length > 0) {
    const wsAsatidz = XLSX.utils.json_to_sheet(asatidzRefData);
    wsAsatidz['!cols'] = [
      { wch: 32 },
      { wch: 30 },
      { wch: 30 },
      { wch: 28 },
      { wch: 18 },
      { wch: 25 },
      { wch: 18 },
    ];
    XLSX.utils.book_append_sheet(wb, wsAsatidz, 'Referensi Asatidz DKM');
  }

  const wsGuide = XLSX.utils.json_to_sheet(guideData);
  wsGuide['!cols'] = [{ wch: 30 }, { wch: 70 }];
  XLSX.utils.book_append_sheet(wb, wsGuide, 'Standar Raker 2026');

  const cleanHijri = hijriYear.replace(/\s+/g, '_');
  XLSX.writeFile(wb, `Template_Jadwal_Ramadhan_${cleanHijri}_Tahun_${year}.xlsx`);
}

export function parseRamadhanExcelFile(
  file: File,
  targetYear: number,
  defaultHijriYear: string
): Promise<{ valid: RamadhanScheduleItem[]; errors: { row: number; reason: string }[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) {
          throw new Error('File spreadsheet kosong atau tidak memiliki lembar kerja.');
        }

        const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

        if (rawRows.length === 0) {
          throw new Error('Tidak ada baris data yang ditemukan di sheet pertama.');
        }

        const validItems: RamadhanScheduleItem[] = [];
        const errorList: { row: number; reason: string }[] = [];

        rawRows.forEach((row, index) => {
          const rowNum = index + 2;

          const getField = (...keys: string[]): unknown => {
            for (const k of keys) {
              const foundKey = Object.keys(row).find(
                (orig) => orig.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, '')
              );
              if (foundKey && row[foundKey] !== undefined && row[foundKey] !== '') {
                return row[foundKey];
              }
            }
            return '';
          };

          const rawNight = getField('malamke', 'malamke130', 'malam');
          const nightNumber = parseInt(String(rawNight), 10);
          const dateStr = String(getField('tanggalmasehihijriah', 'tanggal', 'date')).trim() || `${nightNumber} Ramadhan ${defaultHijriYear}`;
          const penceramah = String(getField('penceramahtarawihkultum', 'penceramah', 'penceramahtarawih')).trim();
          const topic = String(getField('judultemakultum', 'temakultum', 'topik', 'tema')).trim() || `Kultum Tarawih Malam Ke-${nightNumber}`;
          const rawHonorCeramah = getField('honorpenceramahrp', 'honorpenceramah', 'honorceramah');
          const honorPenceramah = Number(rawHonorCeramah) > 0 ? Number(rawHonorCeramah) : 400000;
          const imamTarawih = String(getField('imamsholattarawih', 'imamtarawih', 'imam')).trim() || 'Drs. Manai, M.M.';
          const rawHonorImam = getField('honorimamtarawihrp', 'honorimamtarawih', 'honorimam');
          const honorImamTarawih = Number(rawHonorImam) > 0 ? Number(rawHonorImam) : 300000;
          const bukberHost = String(getField('tuanrumahbukapuasa', 'bukberhost', 'bukapuasa')).trim() || 'Swadaya Jamaah RT';
          const bukberPax = parseInt(String(getField('estimasiporsibukber', 'bukberpax', 'porsi')), 10) || 120;
          const rawItikaf = String(getField('statusitikaf', 'itikaf')).toUpperCase();
          const itikafStatus = rawItikaf.includes('TERJADWAL') ? 'TERJADWAL' : 'TIDAK_ADA';

          if (isNaN(nightNumber) || nightNumber < 1 || nightNumber > 30) {
            errorList.push({
              row: rowNum,
              reason: `Malam Ke tidak valid: "${String(rawNight)}". Harus berupa angka 1 sampai 30.`,
            });
            return;
          }

          if (!penceramah) {
            errorList.push({
              row: rowNum,
              reason: `Malam Ke-${nightNumber}: Kolom Penceramah Tarawih / Kultum wajib diisi.`,
            });
            return;
          }

          validItems.push({
            id: `rmd-upload-${Date.now()}-${nightNumber}`,
            year: targetYear,
            hijriYear: defaultHijriYear,
            nightNumber: nightNumber,
            date: dateStr,
            penceramahTarawih: penceramah,
            topicKultum: topic,
            honorPenceramah: honorPenceramah,
            imamTarawih: imamTarawih,
            honorImamTarawih: honorImamTarawih,
            bukberHost: bukberHost,
            bukberPax: bukberPax,
            itikafStatus: itikafStatus,
            isCompleted: false,
          });
        });

        // Sort by nightNumber ascending
        validItems.sort((a, b) => a.nightNumber - b.nightNumber);

        resolve({ valid: validItems, errors: errorList });
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Gagal memproses file Excel jadwal Ramadhan.'));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file spreadsheet.'));
    reader.readAsArrayBuffer(file);
  });
}

export function exportRamadhanScheduleToExcel(
  schedules: RamadhanScheduleItem[],
  hijriYear: string,
  year: number
) {
  const exportRows = schedules.map((r) => ({
    'Malam Ke': r.nightNumber,
    'Tanggal / Hijriah': r.date,
    'Penceramah Tarawih': r.penceramahTarawih,
    'Tema Kultum': r.topicKultum,
    'Honor Penceramah (Rp)': r.honorPenceramah,
    'Imam Tarawih': r.imamTarawih,
    'Honor Imam Tarawih (Rp)': r.honorImamTarawih,
    'Tuan Rumah Buka Puasa': r.bukberHost,
    'Estimasi Porsi': r.bukberPax,
    'Status I\'tikaf': r.itikafStatus || 'TIDAK_ADA',
    'Status Pelaksanaan': r.isCompleted ? 'SUDAH DIKERJAKAN' : 'TERJADWAL',
    'Jamaah Hadir': r.attendanceCount || '-',
    'Realisasi Honor (Rp)': r.actualHonorDisbursed || (r.honorPenceramah + r.honorImamTarawih),
    'Catatan / Evaluasi': r.summaryNotes || '-',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportRows);
  ws['!cols'] = [
    { wch: 12 },
    { wch: 24 },
    { wch: 32 },
    { wch: 45 },
    { wch: 22 },
    { wch: 28 },
    { wch: 22 },
    { wch: 35 },
    { wch: 16 },
    { wch: 18 },
    { wch: 20 },
    { wch: 16 },
    { wch: 22 },
    { wch: 40 },
  ];
  const cleanHijri = hijriYear.replace(/\s+/g, '_');
  XLSX.utils.book_append_sheet(wb, ws, `Ramadhan ${cleanHijri}`);
  XLSX.writeFile(wb, `Jadwal_Resmi_Ramadhan_${cleanHijri}_Tahun_${year}.xlsx`);
}
