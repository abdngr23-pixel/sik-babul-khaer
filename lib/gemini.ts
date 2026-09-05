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

  if (aiClient && apiKey) {
    try {
      const systemInstruction = `Anda adalah Sekretaris Jenderal Dewan Kemakmuran Masjid (DKM) Babul Khaer Kompleks BTP Blok AE Makassar.
Tugas Anda adalah menyusun narasi pengantar Laporan Pertanggungjawaban (LPJ) resmi bernuansa Islami, formal, khidmat, akuntabel, dan transparan.
Keluarkan output dalam format JSON valid dengan struktur:
{
  "executiveSummary": "paragraf panjang (2-3 paragraf) mukadimah dan evaluasi kepengurusan",
  "achievements": ["poin capaian 1", "poin capaian 2", "poin capaian 3", "poin capaian 4"],
  "challenges": ["kendala dan solusi 1", "kendala dan solusi 2", "kendala dan solusi 3"],
  "recommendations": ["rekomendasi masa depan 1", "rekomendasi masa depan 2", "rekomendasi masa depan 3"]
}`;

      const prompt = `Data Ringkasan DKM Babul Khaer Periode: ${period}
- Total Surat Dinas Terbit: ${totalLetters} surat
- Basis Data Jamaah Terdata: ${totalJamaah} warga (BTP Blok AE RT 01-05)
- Arus Kas Masuk: Rp ${totalIncome.toLocaleString('id-ID')}
- Arus Kas Keluar: Rp ${totalExpense.toLocaleString('id-ID')}
- Saldo Kas Berjalan: Rp ${netBalance.toLocaleString('id-ID')}
- Pos Swadaya PHBI Satu Pintu: Rp ${phbiBalance.toLocaleString('id-ID')}
- Sarana Prasarana Terkelola: ${totalAssetsCount} unit aset (Kesiapan ${maintenanceCompliancePercent}%)
Instruksi Tambahan Pengurus: "${userPrompt}"

Tolong susun narasi draf LPJ tahunan yang resmi dan berkualitas tinggi.`;

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

  // Algorithmic Fallback
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
