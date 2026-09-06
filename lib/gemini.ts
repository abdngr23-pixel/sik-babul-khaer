import { GoogleGenAI } from '@google/genai';
import { LetterCategory } from '@/types/letter';
import { DKM_INFO } from './letter-numbering';

const apiKey = process.env.GEMINI_API_KEY || '';

let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({ apiKey });
}

interface DraftLetterParams {
  prompt: string;
  category: LetterCategory;
  recipientName: string;
  recipientTitle?: string;
  subject: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
}

export async function generateLetterDraft(params: DraftLetterParams): Promise<{
  content: string;
  isAiGenerated: boolean;
}> {
  const { prompt, category, recipientName, recipientTitle, subject, eventDate, eventTime, eventLocation } = params;

  if (aiClient && apiKey) {
    try {
      const systemInstruction = `Anda adalah asisten kesekretariatan resmi untuk ${DKM_INFO.name} (${DKM_INFO.code}), beralamat di ${DKM_INFO.address}.
Tugas Anda adalah menyusun naskah surat dinas resmi bernuansa Islami, formal, santun, dan tertib administrasi.
Gunakan format bahasa Indonesia baku, diawali salam "Assalamu'alaikum Warahmatullahi Wabarakatuh" dan muqaddimah singkat, dilanjutkan maksud/tujuan surat, rincian waktu/tempat jika ada, penegasan harapan/tindak lanjut, dan diakhiri penutup serta salam "Wassalamu'alaikum Warahmatullahi Wabarakatuh".
HANYA berikan isi naskah surat dari salam pembuka hingga salam penutup. JANGAN menyertakan kop surat, nomor surat, atau tempat tanda tangan karena itu sudah otomatis dibuat oleh template sistem.`;

      const userPrompt = `
Kategori Surat: ${category}
Perihal: ${subject}
Penerima: ${recipientName} (${recipientTitle || 'Penerima'})
Tanggal Kegiatan: ${eventDate || '-'}
Waktu: ${eventTime || '-'}
Tempat: ${eventLocation || '-'}
Catatan/Poin Inti dari Pengurus:
"${prompt}"

Tolong buatkan draf isi surat resmi yang lengkap, rapi, dan santun.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }] }
        ],
      });

      if (response.text) {
        return {
          content: response.text.trim(),
          isAiGenerated: true,
        };
      }
    } catch (err) {
      console.warn('Gagal memanggil Gemini API, menggunakan fallback template cerdas:', err);
    }
  }

  // Fallback Template Cerdas
  const fallbackDraft = createFallbackLetterDraft(params);
  return {
    content: fallbackDraft,
    isAiGenerated: false,
  };
}

function createFallbackLetterDraft(params: DraftLetterParams): string {
  const { prompt, category, recipientName, subject, eventDate, eventTime, eventLocation } = params;

  let activitySection = '';
  if (eventDate || eventTime || eventLocation) {
    activitySection = `
Adapun agenda kegiatan insya Allah akan dilaksanakan pada:
  Hari / Tanggal : ${eventDate || 'Menyesuaikan'}
  Waktu          : ${eventTime || 'Ba\'da Shalat Berjamaah'}
  Tempat         : ${eventLocation || 'Masjid Babul Khaer BTP Blok AE'}
`;
  }

  switch (category) {
    case 'UND':
      return `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Segala puji bagi Allah SWT yang senantiasa melimpahkan rahmat, taufiq, dan inayah-Nya kepada kita semua. Shalawat serta salam semoga tercurahkan kepada junjungan kita Baginda Nabi Besar Muhammad SAW, keluarga, dan para sahabatnya.

Sehubungan dengan ${subject.toLowerCase()}, Pengurus Dewan Kemakmuran Masjid (DKM) Babul Khaer bermaksud mengundang Bapak/Ibu/Saudara(i) untuk berkenan hadir dalam kegiatan tersebut.
${activitySection}
Catatan Tambahan:
${prompt || 'Diharapkan kehadiran Bapak/Ibu tepat pada waktunya demi kelancaran agenda musyawarah/kegiatan kita bersama.'}

Demikian surat undangan ini kami sampaikan. Atas perhatian, keringanan langkah, dan kehadiran Bapak/Ibu sekalian, kami haturkan ucapan terima kasih dan jazakumullahu khairan katsiran.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;

    case 'PER':
      return `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Alhamdulillah, puji dan syukur kita panjatkan ke hadirat Allah Subhanahu wa Ta'ala atas segala curahan nikmat dan karunia-Nya. Shalawat dan salam semoga senantiasa tercurah kepada junjungan alam Nabi Muhammad SAW.

Dalam rangka menunjang kelancaran syiar dakwah dan kegiatan kemakmuran masjid di lingkungan BTP Blok AE, melalui surat ini kami memohon kesediaan ${recipientName} sehubungan dengan: ${subject}.
${activitySection}
Uraian Permohonan:
${prompt || 'Besar harapan kami kiranya permohonan ini dapat dipertimbangkan dan disetujui demi kemaslahatan jamaah dan umat.'}

Demikian surat permohonan ini kami ajukan. Atas perhatian, dukungan, dan kerja sama yang baik, kami ucapkan terima kasih yang tulus. Semoga Allah SWT membalas segala kebaikan dengan pahala yang berlipat ganda.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;

    case 'PEM':
      return `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Puji dan syukur senantiasa kita panjatkan ke hadirat Allah SWT, Rabb semesta alam. Shalawat serta salam semoga terlimpahkan kepada Nabi Muhammad SAW.

Diberitahukan dengan hormat kepada ${recipientName}, bahwa sehubungan dengan ${subject.toLowerCase()}, DKM Babul Khaer menyampaikan informasi sebagai berikut:
${activitySection}
Poin Pemberitahuan:
${prompt || 'Diharapkan seluruh pihak terkait dan warga jamaah dapat memaklumi serta mendukung kelancaran kegiatan ini.'}

Demikian pemberitahuan ini kami sampaikan agar menjadi perhatian bersama. Atas perhatian dan kerja sama yang baik, kami haturkan terima kasih.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;

    case 'SKET':
      return `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Yang bertanda tangan di bawah ini, Pengurus Dewan Kemakmuran Masjid (DKM) Babul Khaer BTP Blok AE, Kelurahan Tamalanrea, Kecamatan Tamalanrea, Kota Makassar, dengan ini menerangkan bahwa:

Nama / Pihak Bersangkutan: ${recipientName}
Perihal                  : ${subject}

Keterangan:
${prompt || 'Yang bersangkutan adalah benar warga jamaah aktif di lingkungan Masjid Babul Khaer BTP Blok AE dan memiliki rekam jejak yang baik dalam kegiatan keagamaan dan kemasyarakatan.'}

Surat keterangan ini diterbitkan dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya oleh pihak yang berkepentingan.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;

    default:
      return `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Puji syukur kita panjatkan ke hadirat Allah Subhanahu wa Ta'ala. Shalawat dan salam semoga senantiasa tercurah kepada Rasulullah SAW.

Sehubungan dengan ${subject}, Pengurus DKM Babul Khaer menyampaikan hal-hal sebagai berikut:
${activitySection}
${prompt || 'Demikian surat resmi ini kami sampaikan untuk diketahui dan ditindaklanjuti bersama.'}

Atas perhatian dan kerja samanya, kami ucapkan terima kasih.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;
  }
}

export interface ExtractedMinutesResult {
  title: string;
  date: string;
  location: string;
  attendees: string;
  summary: string;
  decisions: string[];
  actionItems: Array<{
    task: string;
    pic: string;
    deadline: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }>;
  isAiGenerated: boolean;
}

export async function extractMeetingMinutesAI(rawNotes: string): Promise<ExtractedMinutesResult> {
  if (aiClient && apiKey && rawNotes.trim().length > 20) {
    try {
      const prompt = `Anda adalah asisten sekretaris eksekutif DKM Babul Khaer.
Tugas Anda adalah mengekstraksi dan merapikan catatan mentah notulensi rapat pengurus masjid menjadi struktur JSON yang valid dan rapi.
Format JSON yang WAJIB dihasilkan (tanpa markdown codeblock pembungkus):
{
  "title": "Judul ringkas dan jelas rapat",
  "date": "YYYY-MM-DD atau tanggal rapat yang tertera",
  "location": "Lokasi rapat jika ada (misal: Serambi Masjid Babul Khaer)",
  "attendees": "Daftar peserta yang hadir jika ada",
  "summary": "Ringkasan hasil rapat dalam 2-3 kalimat",
  "decisions": ["Poin keputusan 1", "Poin keputusan 2"],
  "actionItems": [
    {
      "task": "Tindakan yang harus dilakukan",
      "pic": "Nama penanggung jawab atau seksi/bidang",
      "deadline": "YYYY-MM-DD atau estimasi tenggat waktu",
      "priority": "HIGH" | "MEDIUM" | "LOW"
    }
  ]
}

Catatan Notulensi Mentah:
"""
${rawNotes}
"""`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const text = response.text?.trim() || '';
      // Clean possible json codeblocks
      const cleaned = text.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        title: parsed.title || 'Rapat Pengurus DKM Babul Khaer',
        date: parsed.date || new Date().toISOString().split('T')[0],
        location: parsed.location || 'Masjid Babul Khaer',
        attendees: parsed.attendees || 'Pengurus DKM Babul Khaer',
        summary: parsed.summary || 'Rapat koordinasi program kerja DKM.',
        decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
        actionItems: Array.isArray(parsed.actionItems)
          ? parsed.actionItems.map((item: { task?: string; pic?: string; deadline?: string; priority?: string }) => ({
              task: item.task || 'Tugas tindak lanjut',
              pic: item.pic || 'Seksi Terkait',
              deadline: item.deadline || new Date().toISOString().split('T')[0],
              priority: (['HIGH', 'MEDIUM', 'LOW'].includes(item.priority || '') ? item.priority : 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW',
            }))
          : [],
        isAiGenerated: true,
      };
    } catch (err) {
      console.warn('Gagal memproses notulensi dengan Gemini, beralih ke parser cerdas:', err);
    }
  }

  // Fallback parser cerdas berbasis baris & kata kunci
  return parseFallbackMeetingNotes(rawNotes);
}

function parseFallbackMeetingNotes(notes: string): ExtractedMinutesResult {
  const lines = notes.split('\n').map((l) => l.trim()).filter(Boolean);
  const title = lines[0] || 'Rapat Koordinasi DKM Babul Khaer';
  const today = new Date().toISOString().split('T')[0];

  const decisions: string[] = [];
  const actionItems: Array<{
    task: string;
    pic: string;
    deadline: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
  }> = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.toLowerCase().includes('putusan') || line.toLowerCase().includes('sepakat') || line.toLowerCase().includes('hasil')) {
      decisions.push(line.replace(/^[-*•\d.)\s]+/, ''));
    } else if (line.toLowerCase().includes('pj:') || line.toLowerCase().includes('pic:') || line.toLowerCase().includes('tugas') || line.toLowerCase().includes('tindak lanjut')) {
      const parts = line.split(/pic:|pj:|oleh:/i);
      const task = parts[0].replace(/^[-*•\d.)\s]+/, '').trim();
      const pic = parts[1] ? parts[1].trim() : 'Pengurus Terkait';
      actionItems.push({
        task: task || 'Pelaksanaan tindak lanjut rapat',
        pic: pic,
        deadline: today,
        priority: 'HIGH',
      });
    }
  }

  if (decisions.length === 0) {
    decisions.push(
      'Menyetujui agenda kerja tindak lanjut sesuai kesepakatan bersama peserta rapat.',
      'Koordinasi teknis lapangan diserahkan kepada masing-masing koordinator bidang.'
    );
  }

  if (actionItems.length === 0) {
    actionItems.push(
      {
        task: 'Menerbitkan surat resmi dan pemberitahuan hasil rapat kepada jamaah',
        pic: 'Sekretariat DKM',
        deadline: today,
        priority: 'HIGH',
      },
      {
        task: 'Penyusunan rincian teknis anggaran dan logistik kegiatan',
        pic: 'Bendahara & Seksi Sarpras',
        deadline: today,
        priority: 'MEDIUM',
      }
    );
  }

  return {
    title,
    date: today,
    location: 'Masjid Babul Khaer BTP Blok AE',
    attendees: 'Pengurus Harian DKM Babul Khaer',
    summary: `Rapat membahas poin-poin penting operasional dan program kerja keumatan dengan menghasilkan ${decisions.length} poin ketetapan serta ${actionItems.length} agenda tindak lanjut.`,
    decisions,
    actionItems,
    isAiGenerated: false,
  };
}

export interface GenerateLPJSummaryParams {
  period: string;
  divisionScope?: 'ALL' | 'KESEKRETARIATAN' | 'KEMASJIDAN_JAMAAH' | 'KEUANGAN_PERBENDAHARAAN' | 'SARANA_PRASARANA';
  authorRole?: string;
  authorName?: string;
  theme?: string;
  totalLetters: number;
  totalJamaah: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  phbiBalance: number;
  totalAssetsCount: number;
  maintenanceCompliancePercent: number;
  userPrompt?: string;
}

export async function generateLPJExecutiveSummary(params: GenerateLPJSummaryParams): Promise<{
  executiveSummary: string;
  achievements: string[];
  challenges: string[];
  recommendations: string[];
  isAiGenerated: boolean;
}> {
  const {
    period,
    divisionScope = 'ALL',
    authorRole = 'Sekretaris Umum',
    authorName = '',
    totalLetters,
    totalJamaah,
    totalIncome,
    totalExpense,
    netBalance,
    phbiBalance,
    totalAssetsCount,
    maintenanceCompliancePercent,
    userPrompt = '',
  } = params;

  const divisionTitles: Record<string, string> = {
    ALL: 'Kompilasi Pleno Gabungan Seluruh Bidang DKM Babul Khaer',
    KESEKRETARIATAN: 'Bidang Kesekretariatan & Tata Usaha Administrasi',
    KEMASJIDAN_JAMAAH: 'Bidang Keagamaan, Dakwah & Sensus Kependudukan Jamaah',
    KEUANGAN_PERBENDAHARAAN: 'Bidang Keuangan, Perbendaharaan & Kas Swadaya PHBI',
    SARANA_PRASARANA: 'Bidang Pembangunan, Sarana Prasarana & Fasilitas Fisik',
  };

  const targetTitle = divisionTitles[divisionScope] || divisionTitles.ALL;

  if (aiClient && apiKey) {
    try {
      const systemInstruction = `Anda adalah ${authorRole || 'Pengurus Harian'} Dewan Kemakmuran Masjid (DKM) Babul Khaer Kompleks BTP Blok AE Makassar.
Tugas Anda adalah menyusun narasi Laporan Pertanggungjawaban (LPJ) resmi bernuansa Islami, formal, khidmat, akuntabel, dan transparan.
Cakupan Laporan: ${targetTitle} (Lingkup: ${divisionScope}).
Keluarkan output dalam format JSON valid dengan struktur:
{
  "executiveSummary": "paragraf panjang (2-3 paragraf) mukadimah dan evaluasi kinerja spesifik bidang tersebut",
  "achievements": ["poin capaian 1", "poin capaian 2", "poin capaian 3", "poin capaian 4"],
  "challenges": ["kendala dan solusi 1", "kendala dan solusi 2", "kendala dan solusi 3"],
  "recommendations": ["rekomendasi masa depan 1", "rekomendasi masa depan 2", "rekomendasi masa depan 3"]
}`;

      const prompt = `Data Statistik DKM Babul Khaer Periode: ${period}
- Lingkup Bidang: ${targetTitle}
${authorName ? `- Penyusun / Penanggung Jawab: ${authorName} (${authorRole})` : ''}
- Total Surat Dinas Terbit: ${totalLetters} surat
- Basis Data Jamaah Terdata: ${totalJamaah} warga (BTP Blok AE RT 01-05)
- Arus Kas Masuk: Rp ${totalIncome.toLocaleString('id-ID')}
- Arus Kas Keluar: Rp ${totalExpense.toLocaleString('id-ID')}
- Saldo Kas Berjalan: Rp ${netBalance.toLocaleString('id-ID')}
- Pos Swadaya PHBI Satu Pintu: Rp ${phbiBalance.toLocaleString('id-ID')}
- Sarana Prasarana Terkelola: ${totalAssetsCount} unit aset (Kesiapan ${maintenanceCompliancePercent}%)
Instruksi Tambahan Pengurus: "${userPrompt}"

Tolong susun narasi LPJ yang fokus, berbobot, dan merefleksikan akuntabilitas amanah umat Islam.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }
        ],
      });

      if (response.text) {
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          executiveSummary: parsed.executiveSummary || '',
          achievements: parsed.achievements || [],
          challenges: parsed.challenges || [],
          recommendations: parsed.recommendations || [],
          isAiGenerated: true,
        };
      }
    } catch (err) {
      console.warn('Gemini LPJ generation error, fallback to algorithmic template:', err);
    }
  }

  // Algorithmic Fallbacks per Division Scope
  if (divisionScope === 'KEUANGAN_PERBENDAHARAAN') {
    return {
      executiveSummary: `Bismillahi ar-Rahman ar-Rahim. Segala puji bagi Allah Subhanahu Wa Ta'ala atas limpahan berkah dan taufiq-Nya, sehingga Bidang Keuangan dan Perbendaharaan DKM Babul Khaer BTP Blok AE dapat menyampaikan Laporan Pertanggungjawaban Keuangan untuk periode ${period}. Sesuai amanah Rapat Kerja 2026 dan ketentuan ART Pasal 7, pengelolaan kas masjid dijalankan dengan prinsip transparansi mutlak, pembukuan terverifikasi, dan pemisahan tegas rekening kas rutin dengan pos dana swadaya PHBI satu pintu. Kebijakan ini terbukti efektif menjaga kestabilan likuiditas operasional dan meminimalisir risiko tumpang-tindih anggaran kegiatan syiar.`,
      achievements: [
        `Pengelolaan saldo kas operasional berjalan sebesar Rp ${netBalance.toLocaleString('id-ID')} dengan pembukuan real-time terdistribusi.`,
        `Penyelenggaraan pos dana swadaya PHBI satu pintu dengan akumulasi saldo Rp ${phbiBalance.toLocaleString('id-ID')}, mendukung seluruh peringatan hari besar Islam secara mandiri.`,
        `Akumulasi penerimaan kas masuk sebesar Rp ${totalIncome.toLocaleString('id-ID')} dan realisasi belanja tepat sasaran sebesar Rp ${totalExpense.toLocaleString('id-ID')}.`,
        `Pelaporan berkala saldo kas mimbar Sholat Jumat secara terbuka dan tertib setiap pekan kepada jamaah BTP Blok AE.`,
      ],
      challenges: [
        'Optimalisasi pencatatan infak digital QRIS masjid memerlukan koordinasi sinkronisasi settlement bank syariah secara harian.',
        'Fluktuasi kebutuhan taktis belanja logistik Ramadhan dan Idul Adha diantisipasi melalui penetapan plafon persetujuan bertingkat.',
        'Penyesuaian tertib administrasi nota belanja fisik oleh panitia kegiatan kini diperketat sebelum proses reimbursement disetujui.',
      ],
      recommendations: [
        'Mempertahankan audit independen berkala bersama Koordinator Dewan Pengawas & Pemeriksa Keuangan DKM.',
        'Memperluas edukasi literasi sedekah nontunai (QRIS & transfer bank) kepada jamaah Kompleks BTP Blok AE.',
        'Menyusun proyeksi anggaran kas operasional triwulanan sebagai mitigasi dini inflasi biaya perawatan sarana ibadah.',
      ],
      isAiGenerated: false,
    };
  }

  if (divisionScope === 'SARANA_PRASARANA') {
    return {
      executiveSummary: `Alhamdulillah, puji dan syukur kita persembahkan ke hadirat Allah Ta'ala, Koordinator Bidang Sarana dan Prasarana DKM Babul Khaer mempersembahkan Laporan Pertanggungjawaban Fisik dan Inventaris untuk periode ${period}. Di bawah arahan Ketua II Bidang Pembangunan, seksi sarpras telah menginventarisasi seluruh kekayaan fisik masjid, memelihara kelayakan utilitas listrik, sistem tata suara (sound system), pendingin ruangan (AC Daikin), serta memastikan kelaikan mesin genset otomatis agar ibadah sholat berjamaah senantiasa berlangsung khusyuk, aman, dan nyaman.`,
      achievements: [
        `Terkelolanya ${totalAssetsCount} unit aset fisik utama masjid dengan indeks kepatuhan perawatan preventif mencapai ${maintenanceCompliancePercent}%.`,
        `Penyelesaian relokasi modul otomatis genset dan instalasi jalur distribusi listrik cadangan berdaya tinggi hasil rekomendasi Raker 2026.`,
        `Pembersihan dan servis kimia berkala pada seluruh unit AC ruang sholat utama ikhwan dan serambi akhwat tanpa jeda operasional.`,
        `Penataan gudang inventaris perlengkapan jenazah, sound outdoor, dan tenda kegiatan warga Kompleks BTP Blok AE secara rapi dan tercatat.`,
      ],
      challenges: [
        'Kerapuhan frekuensi mikrofon nirkabel di ruang serambi luar akibat interferensi frekuensi diselesaikan dengan penggantian modul UHF.',
        'Penurunan efisiensi pendingin udara saat sholat Jumat dihadapi dengan penyusunan SOP buka-tutup pintu kaca otomatis.',
        'Tingginya kelembaban dinding belakang mihrab memerlukan pengecatan anti-bocor berkala sebelum musim hujan.',
      ],
      recommendations: [
        'Menerapkan sistem pelabelan kode inventaris digital QR Code pada setiap unit aset untuk memudahkan inspeksi lapangan.',
        'Menyiapkan cadangan suku cadang primer (lampu LED hemat daya, kabel XLR, filter AC) dalam stok gudang sarpras.',
        'Merencanakan pengadaan sistem tata suara digital terintegrasi untuk memperluas jangkauan suara ke area parkir dan lantai dua.',
      ],
      isAiGenerated: false,
    };
  }

  if (divisionScope === 'KEMASJIDAN_JAMAAH') {
    return {
      executiveSummary: `Segala puji bagi Allah Subhanahu Wa Ta'ala, Rabb semesta alam. Bidang Keagamaan, Peribadatan, dan Dakwah DKM Babul Khaer mempersembahkan Laporan Pertanggungjawaban Program Keumatan periode ${period}. Di bawah naungan Ketua I, bidang kemasjidan telah mengawal kelancaran sholat fardhu lima waktu, jadwal imam dan khatib Jumat, penyelenggaraan tarhib dan pesantren kilat Ramadhan, pemutakhiran sensus jamaah RT 01-05 BTP Blok AE, serta verifikasi mustahiq penerima zakat dan santunan sosial kemasjidan.`,
      achievements: [
        `Pemutakhiran basis data sensus kependudukan jamaah sebanyak ${totalJamaah} warga Muslim Kompleks BTP Blok AE.`,
        `Penyusunan dan kepatuhan 100% jadwal khatib Jumat, muadzin, dan imam rawatib dengan dukungan insentif tetap hasil keputusan Raker 2026.`,
        `Verifikasi data mustahiq fakir miskin dan dhuafa di lingkungan sekitar masjid guna penyaluran bantuan sosial tepat sasaran.`,
        `Pengaktifan majelis ta'lim pekanan jamaah akhwat dan pembinaan kepengurusan Ikatan Remaja Masjid Babul Khaer (IRMBH).`,
      ],
      challenges: [
        'Penyesuaian mendadak jadwal khatib tamu karena agenda luar kota dimitigasi dengan kesiapan imam cadangan internal pengurus.',
        'Pendataan warga baru dan mahasiswa penghuni kos di area RT 04-05 membutuhkan pendekatan koordinasi ekstra bersama Ketua RT.',
        'Optimalisasi kehadiran jamaah sholat subuh berjamaah terus dimotivasi melalui gerakan subuh berkah sarapan bersama.',
      ],
      recommendations: [
        'Menggelar program kaderisasi imam muda dan muadzin dari kalangan remaja masjid binaan IRMBH.',
        'Mempersiapkan buku panduan dakwah tematik bulanan yang kontekstual dengan dinamika kehidupan warga perkotaan.',
        'Memperkuat sinergi sosial bersama lembaga amil zakat resmi untuk program pemberdayaan ekonomi mustahiq mandiri.',
      ],
      isAiGenerated: false,
    };
  }

  if (divisionScope === 'KESEKRETARIATAN') {
    return {
      executiveSummary: `Bismillahi ar-Rahman ar-Rahim. Puji syukur kita haturkan ke hadirat Allah SWT, Sekretariat Umum DKM Babul Khaer Kompleks BTP Blok AE menyampaikan Laporan Pertanggungjawaban Administrasi dan Tata Usaha Organisasi periode ${period}. Mengacu pada ART Bagian Kelima Pasal 6, seksi kesekretariatan bertugas menegakkan tertib korespondensi dinas, penyimpanan e-arsip digital, penyelenggaraan rapat kerja dan rapat pleno berkala, penyusunan notulensi cerdas, serta penyiapan draf kebijakan kelembagaan demi mewujudkan tata pamong masjid yang profesional.`,
      achievements: [
        `Penerbitan dan penomoran resmi ${totalLetters} surat dinas DKM (surat keputusan, undangan rapat, permohonan, dan pemberitahuan) dengan nomor surat otomatis SIK-MBH.`,
        `Digitalisasi 100% dokumen kesekretariatan dan notulensi rapat pleno, lengkap dengan ekstraksi tindak lanjut keputusan.`,
        `Penyusunan draf Surat Keputusan kepanitiaan PHBI (Maulid, Isra Mi'raj, Panitia Ramadhan) tepat waktu sebelum pelaksanaan agenda.`,
        `Integrasi lembar disposisi satu pintu bersama Ketua Umum untuk percepatan izin kegiatan dan administrasi jamaah.`,
      ],
      challenges: [
        'Transisi pengurus dari pencatatan manual fisik ke format e-arsip digital memerlukan sosialisasi berkala.',
        'Sinkronisasi jadwal rapat pleno antar seksi yang memiliki kesibukan profesi diatasi dengan sistem pengingat digital.',
        'Pengarsipan surat masuk dari instansi luar yang masih berformat kertas fisik kini secara rutin dipindai ke format digital.',
      ],
      recommendations: [
        'Melakukan digital backup berkala atas seluruh dokumen persuratan dan notulensi pada penyimpanan cloud ganda.',
        'Menyempurnakan template persuratan resmi dan SOP penerbitan rekomendasi nikah atau keterangan jamaah.',
        'Menyediakan loket informasi sekretariat digital yang dapat diakses oleh warga BTP Blok AE secara daring.',
      ],
      isAiGenerated: false,
    };
  }

  // Fallback Gabungan Pleno (ALL)
  return {
    executiveSummary: `Segala puji dan syukur senantiasa kita panjatkan ke hadirat Allah Subhanahu Wa Ta'ala atas taufiq dan hidayah-Nya, sehingga Dewan Kemakmuran Masjid (DKM) Babul Khaer Kompleks BTP Blok AE dapat menuntaskan amanah pelaksanaan program kerja pada periode ${period} dengan tertib, transparan, dan penuh rasa tanggung jawab. Melalui pemanfaatan platform SIK-MBH, kepengurusan telah mengukuhkan akuntabilitas tata pamong masjid, mulai dari penomoran surat otomatis, pemutakhiran data jamaah, hingga pemisahan tegas dana swadaya PHBI satu pintu demi menjaga kepercayaan umat.`,
    achievements: [
      `Penertiban 100% e-arsip kesekretariatan dengan total ${totalLetters} surat dinas resmi dan notulensi rapat berkala.`,
      `Konsolidasi basis data kependudukan ${totalJamaah} warga Kompleks BTP Blok AE dengan pemetaan mustahiq zakat yang presisi.`,
      `Penerapan Rekening Kas Satu Pintu Swadaya PHBI (saldo Rp ${phbiBalance.toLocaleString('id-ID')}) yang sukses mendukung syiar dakwah tanpa membebani kas rutin.`,
      `Pengelolaan ${totalAssetsCount} unit aset sarpras vital dengan indeks kesiapan fisik mencapai ${maintenanceCompliancePercent}%.`,
    ],
    challenges: [
      'Kebutuhan peningkatan pemeliharaan akustik dan sound system ruang serambi akhwat telah diakomodasi melalui pengajuan pengadaan perangkat baru.',
      'Fluktuasi beban puncak daya listrik PLN saat agenda keumatan besar dimitigasi melalui perawatan berkala mesin genset silent.',
      'Optimalisasi koordinasi tindak lanjut hasil rapat pleno kini terbantu secara signifikan melalui ekstraksi agenda tugas digital.',
    ],
    recommendations: [
      'Memperkuat sinergi berkesinambungan bersama Ketua RT 01-05 Kompleks BTP Blok AE dalam pemutakhiran sensus jamaah tahunan.',
      'Mengembangkan pembinaan generasi muda melalui Ikatan Remaja Masjid Babul Khaer (IRMBH) sebagai pelopor syiar dakwah digital.',
      'Mempertahankan rasio ketahanan kas operasional dan keterbukaan buku kas mingguan secara konsisten.',
    ],
    isAiGenerated: false,
  };
}
