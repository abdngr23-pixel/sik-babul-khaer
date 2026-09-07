'use client';

import React, { useState, useEffect } from 'react';
import {
  LetterCategory,
  LETTER_CATEGORIES,
  LetterDepartment,
  LETTER_DEPARTMENTS,
  OfficialLetter,
  LetterStatus,
} from '@/types/letter';
import { DKM_INFO, generateLetterNumber, generateVerificationCode } from '@/lib/letter-numbering';
import { useToast } from '@/lib/toast-context';
import {
  Sparkles,
  Save,
  Eye,
  X,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';

interface CreateLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLetterCreated: (letter: OfficialLetter) => void;
  onPreviewLetter: (letter: OfficialLetter) => void;
}

const LETTER_PRESET_TEMPLATES: {
  id: string;
  label: string;
  category: LetterCategory;
  department: LetterDepartment;
  subject: string;
  recipientName: string;
  recipientTitle: string;
  recipientAddress: string;
  eventLocation: string;
  content: string;
}[] = [
  {
    id: 'tpl-tgs-khutbah',
    label: 'Surat Tugas Khotib Jumat',
    category: 'TGS',
    department: 'DKW',
    subject: 'Surat Penugasan Khotib Sholat Jumat & Penceramah Agama Islam',
    recipientName: 'Ustadz Pemateri / Da\'i Tamu',
    recipientTitle: 'Khotib & Da\'i Pembina Jamaah',
    recipientAddress: 'Kota Makassar',
    eventLocation: 'Masjid Babul Khaer BTP Blok AE',
    content: `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Ba'da tahmid dan shalawat, semoga Allah Subhanahu Wa Ta'ala senantiasa melimpahkan hidayah dan taufik-Nya kepada Ustadz dalam mengemban amanah dakwah di tengah-tengah umat.

Sehubungan dengan agenda rutin peribadatan di Masjid Babul Khaer Kompleks BTP Blok AE, Pengurus DKM melalui Bidang I (Peribadatan & Dakwah) dengan ini menugaskan kepada:

  Nama Khotib / Da'i : Ustadz Pemateri
  Amanah Penugasan   : Khotib Sholat Jumat & Imam Berjamaah
  Lokasi Ibadah      : Masjid Babul Khaer, Kompleks BTP Blok AE Tamalanrea
  Ketentuan Waktu    : Hadir 20 menit sebelum Adzan (Durasi Khutbah: 15 - 20 menit)
  Konfirmasi Kontak  : Firman (Marbot Masjid) - 0812-4211-9876

Besar harapan kami Ustadz berkenan meluangkan waktu guna membimbing serta memberikan santapan rohani bagi segenap jamaah warga Kompleks BTP Blok AE.

Demikian surat penugasan resmi ini kami sampaikan. Atas kesediaan, dedikasi, dan keikhlasan Ustadz dalam membina umat, kami haturkan terima kasih yang setinggi-tingginya. Jazakumullahu Khairan Katsiran.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  },
  {
    id: 'tpl-und-rapat',
    label: 'Undangan Rapat Pleno DKM',
    category: 'UND',
    department: 'SEKR',
    subject: 'Undangan Rapat Musyawarah Pleno & Evaluasi Program Kerja DKM Babul Khaer',
    recipientName: 'Seluruh Jajaran Pengurus DKM & Dewan Pengawas',
    recipientTitle: 'Pengurus Harian, Koordinator Bidang & Dewan Pengawas',
    recipientAddress: 'Kompleks BTP Blok AE, Tamalanrea, Makassar',
    eventLocation: 'Ruang Rapat Utama Masjid Babul Khaer',
    content: `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Segala puji bagi Allah Subhanahu Wa Ta'ala atas limpahan rahmat dan karunia-Nya. Shalawat dan salam semoga senantiasa tercurah kepada baginda Rasulullah Muhammad Shallallahu 'Alaihi Wasallam.

Sehubungan dengan evaluasi berkala pelaksanaan program kerja DKM Masjid Babul Khaer periode 2026-2029, dengan ini Sekretariat Umum mengundang Bapak/Ibu/Saudara(i) untuk menghadiri Rapat Musyawarah Pleno dengan agenda pembahasan:
  1. Laporan Keuangan Kas Berjalan & Realisasi Buku Kas DKM.
  2. Progres Fisik Pembangunan & Renovasi Sarpras (Plafon Lantai 2 & Saluran Air).
  3. Evaluasi Kegiatan Peribadatan & Kesiapan Agenda PHBI/Ramadhan.
  4. Laporan Penyaluran ZISWAF & Program Sedekah Seribu Sehari (SSS) 5 RT.

Mengingat pentingnya musyawarah ini demi kemaslahatan dan transparansi tata kelola masjid, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktunya.

Demikian surat undangan resmi ini kami sampaikan. Atas perhatian, dedikasi, dan kehadirannya, kami haturkan terima kasih. Jazakumullahu Khairan Katsiran.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  },
  {
    id: 'tpl-moh-bantuan',
    label: 'Permohonan Donasi Sarpras (BSI DKM)',
    category: 'PER',
    department: 'SAR',
    subject: 'Permohonan Bantuan Dana Donasi & Infaq Renovasi Plafon Lantai 2 Masjid Babul Khaer',
    recipientName: 'Para Muhsinin, Agniya, dan Jamaah Dermawan',
    recipientTitle: 'Bapak/Ibu Donatur Pemerhati Umat',
    recipientAddress: 'Di Tempat',
    eventLocation: 'Masjid Babul Khaer BTP Blok AE',
    content: `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Segala puji dan syukur hanya milik Allah Rabb Semesta Alam. Shalawat teriring salam senantiasa tercurah kepada junjungan Nabi Besar Muhammad Shallallahu 'Alaihi Wasallam.

Dalam rangka menjaga kelayakan fasilitas, kekhusyukan ibadah sholat berjamaah, dan mengatasi kebocoran atap saat musim hujan, Pengurus DKM Masjid Babul Khaer melalui Bidang II (Sarana & Prasarana) sedang melaksanakan Program Pembangunan & Renovasi Plafon Lantai 2 (Pagu Anggaran Rp 350.000.000,-).

Sehubungan dengan hal tersebut, kami membuka kesempatan amal jariyah bagi Bapak/Ibu para muhsinin, agniya, dan dermawan untuk turut berpartisipasi menyisihkan sebagian rezekinya. Infaq dan sedekah jariyah dapat disalurkan langsung melalui rekening resmi:

  Nama Bank      : Bank Syariah Indonesia (BSI)
  Nomor Rekening : 7182938475
  Atas Nama      : DKM Babul Khaer BTP
  Konfirmasi WA  : 0812-4211-9876 (Sekretariat / Bendahara DKM)

Setiap rupiah dana yang disalurkan akan dicatat secara transparan dan dipertanggungjawabkan dalam laporan pembukuan kas DKM. Semoga Allah SWT melipatgandakan rezeki dan menjadikan sedekah ini sebagai amal jariyah yang pahalanya terus mengalir.

Demikian permohonan ini kami sampaikan, atas kebaikan dan kepedulian Bapak/Ibu kami haturkan terima kasih. Jazakumullahu Khairan Katsiran.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  },
  {
    id: 'tpl-ket-mustahiq',
    label: 'Keterangan Rekomendasi Mustahiq Sensus',
    category: 'SKET',
    department: 'SOS',
    subject: 'Surat Keterangan Domisili Jamaah & Rekomendasi Mustahiq Sensus BTP Blok AE',
    recipientName: 'Badan Amil Zakat / Lembaga Penyalur Bantuan Sosial',
    recipientTitle: 'Pimpinan Lembaga / Instansi Penyalur Bantuan',
    recipientAddress: 'Kota Makassar',
    eventLocation: 'Masjid Babul Khaer BTP Blok AE',
    content: `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Yang bertanda tangan di bawah ini, Pengurus Dewan Kemakmuran Masjid (DKM) Babul Khaer Kompleks BTP Blok AE, Kelurahan Tamalanrea, Kecamatan Tamalanrea, Kota Makassar, dengan ini menerangkan bahwa:

Adalah benar warga tetap yang berdomisili sah di lingkungan Kompleks BTP Blok AE (Wilayah RT 01 s/d RT 05) dan tercatat dalam basis data Sensus Jamaah DKM Babul Khaer sebagai keluarga mustahiq yang memenuhi kriteria syar'i (Asnaf Fakir/Miskin/Dhuafa) penerima manfaat santunan sosial & beasiswa pendidikan.

Surat keterangan ini diberikan atas dasar survei lapangan terverifikasi oleh Tim Sosial & UPZ DKM Babul Khaer, untuk dapat dipergunakan sebagai rekomendasi kelayakan bantuan sebagaimana mestinya.

Demikian surat keterangan ini kami terbitkan dengan sebenarnya untuk dapat dipergunakan sesuai peruntukannya. Semoga Allah Subhanahu Wa Ta'ala senantiasa membalas kebaikan kita semua.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  },
  {
    id: 'tpl-und-phbi',
    label: 'Undangan Tabligh Akbar PHBI',
    category: 'UND',
    department: 'PHBI',
    subject: 'Undangan Tabligh Akbar & Dzikir Bersama Peringatan Hari Besar Islam (PHBI)',
    recipientName: 'Bapak/Ibu Jamaah Kompleks BTP Blok AE',
    recipientTitle: 'Warga Jamaah RT 01 s.d. RT 05',
    recipientAddress: 'Kompleks BTP Blok AE Tamalanrea, Makassar',
    eventLocation: 'Masjid Babul Khaer BTP Blok AE',
    content: `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Alhamdulillahi Rabbil 'Alamin, puji syukur senantiasa kita panjatkan ke hadirat Allah Azza Wa Jalla yang telah memberikan kita nikmat iman, Islam, serta kesehatan.

Dalam rangka mempererat tali ukhuwah Islamiyah antar warga Kompleks BTP Blok AE dan menyemarakkan syiar dakwah keumatan, Panitia Peringatan Hari Besar Islam (PHBI) Masjid Babul Khaer dengan penuh rasa takzim mengundang Bapak/Ibu/Saudara(i) sekeluarga untuk hadir dalam agenda Tabligh Akbar & Dzikir Bersama.

Besar harapan kami Bapak/Ibu berkenan hadir bersama keluarga guna menyemarakkan majelis ilmu ini. Semoga Allah Subhanahu Wa Ta'ala senantiasa melimpahkan berkah dan meridhai langkah kita bersama.

Demikian undangan ini kami sampaikan, atas kehadiran dan doa restu Bapak/Ibu, kami ucapkan terima kasih.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`,
  },
];

export default function CreateLetterModal({
  isOpen,
  onClose,
  onLetterCreated,
  onPreviewLetter,
}: CreateLetterModalProps) {
  const { toast } = useToast();
  const [category, setCategory] = useState<LetterCategory>('UND');
  const [department, setDepartment] = useState<LetterDepartment>('SEKR');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split('T')[0]);
  const [nextNumber, setNextNumber] = useState('');
  const [sequenceNumber, setSequenceNumber] = useState(1);

  // Form Fields
  const [recipientName, setRecipientName] = useState('');
  const [recipientTitle, setRecipientTitle] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('Kompleks BTP Blok AE, Makassar');
  const [subject, setSubject] = useState('');
  const [attachmentCount, setAttachmentCount] = useState('-');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('Masjid Babul Khaer BTP Blok AE');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<LetterStatus>('DRAFT');

  // Kolom Pintar State berdasarkan Kategori Surat
  // UND (Undangan)
  const [eventAgenda, setEventAgenda] = useState('Musyawarah Kerja & Evaluasi Program');
  const [eventDresscode, setEventDresscode] = useState('Busana Muslim Bebas Rapi');

  // PER (Permohonan)
  const [applicantName, setApplicantName] = useState(DKM_INFO.defaultChairman);
  const [applicantRole, setApplicantRole] = useState('Ketua Umum DKM Babul Khaer');
  const [applicantAddress, setApplicantAddress] = useState('Kompleks BTP Blok AE, Tamalanrea, Makassar');
  const [requestType, setRequestType] = useState('Permohonan Bantuan Dana & Sarana Prasarana');
  const [requestDetails, setRequestDetails] = useState('');

  // SKET (Keterangan / Rekomendasi)
  const [subjectPersonName, setSubjectPersonName] = useState('');
  const [subjectPersonId, setSubjectPersonId] = useState('');
  const [subjectPersonBirth, setSubjectPersonBirth] = useState('Makassar');
  const [subjectPersonAddress, setSubjectPersonAddress] = useState('Kompleks BTP Blok AE, RT 02');
  const [subjectPersonJob, setSubjectPersonJob] = useState('Wiraswasta / Buruh');
  const [statementType, setStatementType] = useState('Rekomendasi Mustahiq / Bantuan Sosial ZISWAF');
  const [statementPurpose, setStatementPurpose] = useState('');

  // TGS (Surat Tugas)
  const [assignedName, setAssignedName] = useState('');
  const [assignedRole, setAssignedRole] = useState("Khotib / Da'i Pembina");
  const [taskAssignment, setTaskAssignment] = useState('Khotib Sholat Jumat & Pengisi Kajian');
  const [taskLocation, setTaskLocation] = useState('Masjid Babul Khaer BTP Blok AE');

  // PEM (Pemberitahuan)
  const [targetAudience, setTargetAudience] = useState('Seluruh Jamaah & Warga Muslim Kompleks BTP Blok AE');
  const [announcementPoints, setAnnouncementPoints] = useState('');

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Fungsi Kompilasi Naskah Otomatis dari Kolom Pintar
  const handleCompileSmartContent = () => {
    let generated = '';

    if (category === 'UND') {
      generated = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Segala puji bagi Allah Subhanahu Wa Ta'ala atas limpahan rahmat dan hidayah-Nya. Shalawat teriring salam senantiasa tercurah kepada junjungan Nabi Besar Muhammad Shallallahu 'Alaihi Wasallam.

Sehubungan dengan agenda kelembagaan dan kemaslahatan jamaah Masjid Babul Khaer, bersama surat ini kami mengundang Bapak/Ibu/Saudara(i) untuk berkenan hadir dalam kegiatan yang insya Allah akan diselenggarakan pada:

  Hari / Tanggal : ${eventDate || 'Ahad, 13 September 2026'}
  Waktu / Pukul  : ${eventTime || '20.00 WITA (Ba\'da Isya) s.d Selesai'}
  Tempat         : ${eventLocation || 'Masjid Babul Khaer BTP Blok AE'}
  Agenda Acara   : ${eventAgenda || subject || 'Musyawarah DKM Babul Khaer'}
  Pakaian        : ${eventDresscode || 'Busana Muslim Rapi'}

Mengingat pentingnya agenda musyawarah ini, kehadiran Bapak/Ibu sangat kami harapkan tepat pada waktunya demi kelancaran amanah keumatan bersama.

Demikian undangan ini kami sampaikan. Atas perhatian, kesediaan, dan kehadirannya, kami ucapkan terima kasih. Jazakumullahu Khairan Katsiran.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;
    } else if (category === 'PER') {
      generated = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Alhamdulillahi Rabbil 'Alamin, puji dan syukur kita panjatkan ke hadirat Allah SWT atas limpahan karunia-Nya. Shalawat dan salam semoga senantiasa tercurah kepada baginda Rasulullah SAW beserta keluarga dan para sahabatnya.

Yang bertanda tangan di bawah ini:
  Nama      : ${applicantName || DKM_INFO.defaultChairman}
  Jabatan   : ${applicantRole || 'Ketua Umum DKM Babul Khaer'}
  Alamat    : ${applicantAddress || 'Kompleks BTP Blok AE, Tamalanrea, Makassar'}

Dengan ini mengajukan permohonan kepada Bapak/Ibu mengenai:
  Bentuk Permohonan : ${requestType || 'Permohonan Bantuan / Rekomendasi'}
  Maksud / Rincian  : ${requestDetails || subject || 'Dukungan pelaksanaan program kemaslahatan jamaah masjid'}

Besar harapan kami Bapak/Ibu berkenan mengabulkan permohonan ini demi kelancaran dan kemakmuran syiar keumatan di lingkungan Masjid Babul Khaer BTP Blok AE.

Demikian surat permohonan ini kami sampaikan dengan sebenarnya. Atas perhatian, perkenan, dan kerjasamanya, kami haturkan banyak terima kasih. Jazakumullahu Khairan Katsiran.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;
    } else if (category === 'SKET') {
      generated = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Yang bertanda tangan di bawah ini, Pengurus Dewan Kemakmuran Masjid (DKM) Babul Khaer Kompleks BTP Blok AE, Kelurahan Tamalanrea, Kecamatan Tamalanrea, Kota Makassar, dengan ini menerangkan bahwa:

  Nama Lengkap        : ${subjectPersonName || '[Nama Warga / Jamaah]'}
  No. Identitas / NIK : ${subjectPersonId || '- (Terdata dalam SIK-MBH)'}
  Tempat / Tgl. Lahir : ${subjectPersonBirth || 'Makassar'}
  Pekerjaan           : ${subjectPersonJob || 'Wiraswasta / Buruh'}
  Alamat Domisili     : ${subjectPersonAddress || 'Kompleks BTP Blok AE, Makassar'}

Adalah benar warga jamaah yang berdomisili di lingkungan Kompleks BTP Blok AE Tamalanrea Makassar dan tercatat aktif dalam pembinaan kemasyarakatan DKM Babul Khaer.

Berdasarkan verifikasi faktual pengurus, surat keterangan ini diberikan dalam rangka:
  Kategori Keterangan : ${statementType || 'Rekomendasi Mustahiq / Bantuan ZISWAF'}
  Keperluan / Tujuan  : ${statementPurpose || subject || 'Memenuhi kelengkapan permohonan bantuan'}

Demikian surat keterangan / rekomendasi ini kami buat dengan sebenar-benarnya sesuai data lapangan, agar dapat dipergunakan sebagaimana mestinya.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;
    } else if (category === 'TGS') {
      generated = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Ba'da tahmid dan shalawat ke hadirat Allah SWT dan Rasulullah SAW, semoga kita senantiasa dalam limpahan taufik dan hidayah-Nya.

Berdasarkan ketetapan musyawarah Pengurus DKM Babul Khaer BTP Blok AE Makassar, dengan ini memberikan penugasan resmi kepada:

  Nama Petugas   : ${assignedName || '[Nama Ustadz / Petugas]'}
  Amanah / Peran : ${assignedRole || "Khotib / Da'i Pembina"}

Untuk melaksanakan tugas keumatan:
  Bentuk Tugas   : ${taskAssignment || 'Khotib Shalat Jumat & Imam'}
  Hari / Waktu   : ${eventDate || 'Jumat'} ${eventTime ? `(${eventTime})` : ''}
  Lokasi Tugas   : ${taskLocation || 'Masjid Babul Khaer BTP Blok AE'}

Diharapkan kepada yang bersangkutan dapat menjalankan amanah dakwah ini dengan sebaik-baiknya dengan penuh rasa ikhlas dan tanggung jawab.

Demikian surat tugas resmi ini dibuat untuk dapat dipergunakan sebagaimana mestinya.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;
    } else if (category === 'PEM') {
      generated = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

Segala puji bagi Allah Rabbul 'Alamin, shalawat dan salam semoga tercurah kepada Nabi Muhammad SAW.

Diberitahukan kepada:
  Yth. ${targetAudience || 'Seluruh Jamaah & Warga Muslim Kompleks BTP Blok AE'}

Sehubungan dengan ${subject || 'agenda kemaslahatan masjid'}, Pengurus DKM Babul Khaer menyampaikan beberapa hal penting sebagai berikut:

${announcementPoints ? announcementPoints.split('\n').map((p, i) => `  ${i + 1}. ${p}`).join('\n') : '  1. Diharapkan partisipasi aktif seluruh warga jamaah dalam menyukseskan agenda ini.\n  2. Informasi lebih lanjut dapat berkoordinasi dengan pengurus RT setempat atau sekretariat DKM.'}

Demikian surat pemberitahuan ini kami sampaikan agar menjadi perhatian dan maklum adanya. Atas kerja sama dan kebersamaan seluruh jamaah, kami haturkan terima kasih.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;
    } else {
      generated = `Assalamu'alaikum Warahmatullahi Wabarakatuh.

${subject}

Demikian surat resmi ini disampaikan. Atas perhatian dan kerjasamanya kami haturkan terima kasih.

Wassalamu'alaikum Warahmatullahi Wabarakatuh.`;
    }

    setContent(generated);
    setAiMessage({
      text: 'Naskah surat resmi berhasil disusun otomatis dari Kolom Pintar!',
      type: 'success',
    });
  };

  // Submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch or calculate next number
  useEffect(() => {
    if (!isOpen) return;

    const fetchNextNumber = async () => {
      try {
        const res = await fetch(
          `/api/letters/next-number?category=${category}&department=${department}&date=${letterDate}`
        );
        const data = await res.json();
        if (data.success) {
          setNextNumber(data.letterNumber);
          setSequenceNumber(data.sequenceNumber);
        }
      } catch {
        // Fallback local calc
        setNextNumber(generateLetterNumber(14, category, letterDate, department));
      }
    };

    fetchNextNumber();
  }, [category, department, letterDate, isOpen]);

  if (!isOpen) return null;

  const handleGenerateAi = async () => {
    if (!subject && !aiPrompt) {
      const msg = 'Silakan isi Perihal atau ketik poin arahan surat terlebih dahulu.';
      setAiMessage({
        text: msg,
        type: 'error',
      });
      toast.error(msg);
      return;
    }

    setIsAiLoading(true);
    setAiMessage(null);

    try {
      const res = await fetch('/api/ai/draft-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt || subject,
          category,
          recipientName: recipientName || 'Bapak/Ibu Jamaah',
          recipientTitle,
          subject: subject || 'Surat Resmi DKM',
          eventDate,
          eventTime,
          eventLocation,
        }),
      });

      const data = await res.json();
      if (data.success && data.content) {
        setContent(data.content);
        const successMsg = data.isAiGenerated
          ? 'Draf surat berhasil dibuat dengan Gemini 2.5 Flash!'
          : 'Draf surat berhasil disusun dengan Template Cerdas DKM.';
        setAiMessage({
          text: successMsg,
          type: 'success',
        });
        toast.success(successMsg);
      } else {
        const errMsg = data.error || 'Gagal menghasilkan draf surat';
        setAiMessage({
          text: errMsg,
          type: 'error',
        });
        toast.error(errMsg);
      }
    } catch {
      const errMsg = 'Terjadi kesalahan saat menghubungkan ke asisten AI.';
      setAiMessage({
        text: errMsg,
        type: 'error',
      });
      toast.error(errMsg);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent, previewOnly = false) => {
    e.preventDefault();
    setErrorMessage('');

    if (!recipientName.trim() || !subject.trim() || !content.trim()) {
      const msg = 'Mohon lengkapi Nama Penerima, Perihal, dan Isi Surat.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const payload = {
      category,
      department,
      verificationCode: generateVerificationCode(sequenceNumber, department, new Date(letterDate).getFullYear()),
      recipientName,
      recipientTitle,
      recipientAddress,
      subject,
      letterDate,
      attachmentCount,
      eventDate,
      eventTime,
      eventLocation,
      content,
      status,
      signatory1: {
        name: DKM_INFO.defaultChairman,
        role: 'Ketua Umum DKM',
      },
      signatory2: {
        name: DKM_INFO.defaultSecretary,
        role: 'Sekretaris Umum',
      },
      letterDetails: {
        category,
        eventDate,
        eventTime,
        eventLocation,
        eventAgenda,
        eventDresscode,
        applicantName,
        applicantRole,
        applicantAddress,
        requestType,
        requestDetails,
        subjectPersonName,
        subjectPersonId,
        subjectPersonBirth,
        subjectPersonAddress,
        subjectPersonJob,
        statementType,
        statementPurpose,
        assignedName,
        assignedRole,
        taskAssignment,
        taskLocation,
        targetAudience,
        announcementPoints,
      },
    };

    if (previewOnly) {
      const tempLetter: OfficialLetter = {
        ...payload,
        id: `preview-temp-${Date.now()}`,
        letterNumber: nextNumber,
        sequenceNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onPreviewLetter(tempLetter);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.data) {
        toast.success(`Surat resmi ${data.data.letterNumber || ''} berhasil dibuat & tersimpan!`);
        onLetterCreated(data.data);
        onClose();
      } else {
        const msg = data.error || 'Gagal menyimpan surat';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'Terjadi kendala koneksi ke server';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-letter-title"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end md:justify-center md:items-center p-0 md:p-4 overflow-hidden"
    >
      <div className="bg-white w-full md:max-w-4xl rounded-t-3xl md:rounded-2xl shadow-2xl border-t md:border border-slate-200 overflow-hidden flex flex-col h-[88dvh] max-h-[90dvh] md:h-auto md:max-h-[92dvh] text-slate-800 animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
        {/* Drag Handle Bar (Mobile Only) */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 md:hidden shrink-0" />

        {/* Header Modal */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 id="create-letter-title" className="font-bold text-sm sm:text-base leading-tight">Buat Surat Resmi Baru</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 leading-tight">
                Penomoran otomatis & integrasi asisten Gemini AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup modal pembuatan surat resmi"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1 text-slate-800 overscroll-contain">
          {errorMessage && (
            <div role="alert" aria-live="polite" className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nomor Surat & Kategori Bar */}
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                  Nomor Surat Resmi DKM (Otomatis)
                </span>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded-full font-bold">
                  Anti-Collision Aktif
                </span>
              </div>
              <p className="text-base md:text-lg font-mono font-extrabold text-emerald-950 mt-0.5">
                {nextNumber || 'Memuat...'}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-[11px] text-emerald-700 font-medium">
                  Format Baku AD/ART: [No.Urut]/[Kode Bidang]/DKM-BK/[Bulan Romawi]/[Tahun]
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Terpusat (Sekretaris I, II & Panitia PHBI)</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit / Bidang Pengirim
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as LetterDepartment)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {Object.values(LETTER_DEPARTMENTS).map((dept) => (
                    <option key={dept.code} value={dept.code}>
                      [{dept.code}] {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Surat
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as LetterCategory)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {Object.values(LETTER_CATEGORIES).map((cat) => (
                    <option key={cat.code} value={cat.code}>
                      [{cat.code}] {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Surat
                </label>
                <input
                  type="date"
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="w-full text-xs font-semibold border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Quick Template Selector Chips (ui-style.md Section 5.D) */}
          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Pilih Format Baku Cepat (Template Resmi DKM):</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                1-Klik Isi Draf
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {LETTER_PRESET_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => {
                    setCategory(tpl.category);
                    setDepartment(tpl.department);
                    setSubject(tpl.subject);
                    setRecipientName(tpl.recipientName);
                    setRecipientTitle(tpl.recipientTitle);
                    setRecipientAddress(tpl.recipientAddress);
                    setEventLocation(tpl.eventLocation);
                    setContent(tpl.content);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200/80 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <span className="text-[10px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                    {tpl.department}
                  </span>
                  <span>{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Perihal Surat <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Contoh: Undangan Peringatan Maulid Nabi Muhammad SAW"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lampiran Dokumen
              </label>
              <input
                type="text"
                value={attachmentCount}
                onChange={(e) => setAttachmentCount(e.target.value)}
                placeholder="Contoh: 1 (Satu) Berkas atau -"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ditujukan Kepada (Nama / Pihak) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Contoh: Bapak/Ibu Jamaah RT 01 s.d RT 05"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gelar / Jabatan Penerima (Opsional)
              </label>
              <input
                type="text"
                value={recipientTitle}
                onChange={(e) => setRecipientTitle(e.target.value)}
                placeholder="Contoh: Ustadz / Ketua RT / Tokoh Masyarakat"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat / Kota Penerima
              </label>
              <input
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="Contoh: Kompleks BTP Blok AE, Makassar"
                className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2.5 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Kolom Pintar Dinamis Berdasarkan Jenis Surat */}
          <div className="bg-gradient-to-br from-emerald-50/60 via-slate-50 to-emerald-50/40 border border-emerald-200/90 rounded-2xl p-4 space-y-3.5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span>Kolom Pintar Naskah:</span>
                    <span className="text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-mono text-[11px]">
                      [{category}] {LETTER_CATEGORIES[category]?.name}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Formulir adaptif menyesuaikan struktur baku jenis surat yang dipilih
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCompileSmartContent}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
                title="Rangkai data kolom pintar menjadi naskah isi surat resmi"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Susun Naskah Otomatis</span>
              </button>
            </div>

            {/* Smart Fields for UND (Undangan) */}
            {category === 'UND' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Hari & Tanggal Acara
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="Ahad, 13 September 2026"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Waktu / Pukul (WITA)
                  </label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    placeholder="20.00 WITA (Ba'da Isya) - Selesai"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Tempat / Lokasi Kegiatan
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="Masjid Babul Khaer BTP Blok AE"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Agenda / Topik Musyawarah
                  </label>
                  <input
                    type="text"
                    value={eventAgenda}
                    onChange={(e) => setEventAgenda(e.target.value)}
                    placeholder="Musyawarah Kerja DKM & Pembahasan Kas Berjalan"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Ketentuan Pakaian / Dresscode
                  </label>
                  <input
                    type="text"
                    value={eventDresscode}
                    onChange={(e) => setEventDresscode(e.target.value)}
                    placeholder="Busana Muslim Bebas Rapi"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Smart Fields for PER (Permohonan) */}
            {category === 'PER' && (
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200/60">
                  Data Pemohon (&quot;Yang bertanda tangan di bawah ini:&quot;)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Pemohon
                    </label>
                    <input
                      type="text"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="Drs. Muhammad Hasri, M. Hum."
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Jabatan / Amanah
                    </label>
                    <input
                      type="text"
                      value={applicantRole}
                      onChange={(e) => setApplicantRole(e.target.value)}
                      placeholder="Ketua Umum DKM Babul Khaer"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Alamat Pemohon
                    </label>
                    <input
                      type="text"
                      value={applicantAddress}
                      onChange={(e) => setApplicantAddress(e.target.value)}
                      placeholder="Kompleks BTP Blok AE, Makassar"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Bentuk Permohonan
                    </label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium"
                    >
                      <option value="Permohonan Bantuan Dana & Sarana Prasarana">Bantuan Dana / Infaq Sarpras</option>
                      <option value="Permohonan Kesediaan Menjadi Pemateri / Khotib">Kesediaan Pemateri / Khotib</option>
                      <option value="Permohonan Peminjaman Tempat / Fasilitas">Peminjaman Tempat / Fasilitas</option>
                      <option value="Permohonan Izin Kegiatan / Audiensi">Izin Kegiatan / Audiensi</option>
                      <option value="Permohonan Bantuan Logistik Acara">Bantuan Logistik Acara</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Maksud & Rincian Permohonan
                    </label>
                    <input
                      type="text"
                      value={requestDetails}
                      onChange={(e) => setRequestDetails(e.target.value)}
                      placeholder="Contoh: Pengadaan 2 unit AC 2 PK untuk ruang sholat utama masjid"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Smart Fields for SKET (Keterangan / Rekomendasi) */}
            {category === 'SKET' && (
              <div className="space-y-3">
                <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200/60">
                  Data Warga yang Diterangkan / Direkomendasikan (&quot;Menerangkan bahwa:&quot;)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nama Lengkap Jamaah
                    </label>
                    <input
                      type="text"
                      value={subjectPersonName}
                      onChange={(e) => setSubjectPersonName(e.target.value)}
                      placeholder="Ibu St. Aminah / Bpk. Bahar"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      No. Identitas / NIK (Opsional)
                    </label>
                    <input
                      type="text"
                      value={subjectPersonId}
                      onChange={(e) => setSubjectPersonId(e.target.value)}
                      placeholder="7371xxxxxxxxxxxx / Terdata SIK-MBH"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Tempat & Tanggal Lahir
                    </label>
                    <input
                      type="text"
                      value={subjectPersonBirth}
                      onChange={(e) => setSubjectPersonBirth(e.target.value)}
                      placeholder="Makassar, 10 Mei 1968"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Alamat di BTP Blok AE
                    </label>
                    <input
                      type="text"
                      value={subjectPersonAddress}
                      onChange={(e) => setSubjectPersonAddress(e.target.value)}
                      placeholder="Kompleks BTP Blok AE No. 15, RT 02"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Pekerjaan / Status
                    </label>
                    <input
                      type="text"
                      value={subjectPersonJob}
                      onChange={(e) => setSubjectPersonJob(e.target.value)}
                      placeholder="Buruh Harian / Lansia Dhuafa"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kategori Rekomendasi
                    </label>
                    <select
                      value={statementType}
                      onChange={(e) => setStatementType(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium"
                    >
                      <option value="Rekomendasi Mustahiq / Bantuan Sosial ZISWAF">Mustahiq ZISWAF</option>
                      <option value="Keterangan Domisili & Jamaah Aktif Masjid">Domisili & Jamaah Aktif</option>
                      <option value="Rekomendasi Bantuan Biaya Pendidikan / Beasiswa">Beasiswa Pendidikan</option>
                      <option value="Keterangan Kematian Jamaah">Keterangan Kematian</option>
                      <option value="Surat Pengantar Nikah Jamaah">Pengantar Nikah KUA</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Keperluan / Maksud Penggunaan Surat
                    </label>
                    <input
                      type="text"
                      value={statementPurpose}
                      onChange={(e) => setStatementPurpose(e.target.value)}
                      placeholder="Contoh: Persyaratan pengajuan bantuan santunan dhuafa ke BAZNAS Kota Makassar"
                      className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Smart Fields for TGS (Surat Tugas) */}
            {category === 'TGS' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Nama Petugas / Da&apos;i Ditugaskan
                  </label>
                  <input
                    type="text"
                    value={assignedName}
                    onChange={(e) => setAssignedName(e.target.value)}
                    placeholder="Ustadz Dr. H. Syahrir, M.Th.I"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Amanah / Peran
                  </label>
                  <input
                    type="text"
                    value={assignedRole}
                    onChange={(e) => setAssignedRole(e.target.value)}
                    placeholder="Khotib / Da'i Pembina"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Bentuk Penugasan
                  </label>
                  <input
                    type="text"
                    value={taskAssignment}
                    onChange={(e) => setTaskAssignment(e.target.value)}
                    placeholder="Khotib Shalat Jumat & Imam"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Waktu Penugasan
                  </label>
                  <input
                    type="text"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    placeholder="Jumat, 11 September 2026 (11.45 WITA)"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Lokasi Penugasan
                  </label>
                  <input
                    type="text"
                    value={taskLocation}
                    onChange={(e) => setTaskLocation(e.target.value)}
                    placeholder="Masjid Babul Khaer BTP Blok AE"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Smart Fields for PEM (Pemberitahuan / Edaran) */}
            {category === 'PEM' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Sasaran / Ditujukan Kepada
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Seluruh Jamaah & Warga Muslim Kompleks BTP Blok AE"
                    className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Poin-poin Penting Pemberitahuan (1 baris per poin)
                  </label>
                  <textarea
                    rows={3}
                    value={announcementPoints}
                    onChange={(e) => setAnnouncementPoints(e.target.value)}
                    placeholder="Contoh:&#10;Pelaksanaan kerja bakti akbar pada hari Ahad pukul 07.00 WITA&#10;Diharapkan membawa peralatan kebersihan masing-masing&#10;Disediakan sarapan pagi bersama di pelataran masjid"
                    className="w-full text-xs border border-slate-300 rounded-lg p-2.5 bg-white text-slate-800"
                  />
                </div>
              </div>
            )}

            {/* Smart Fields for SK (Keputusan) */}
            {category === 'SK' && (
              <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-1">Format Baku Surat Keputusan (SK) DKM:</p>
                <p>Klik tombol <strong>&quot;Susun Naskah Otomatis&quot;</strong> di atas untuk memuat struktur Menimbang, Mengingat, dan Diktum Memutuskan (Kesatu, Kedua, Ketiga) sesuai tata naskah dinas DKM.</p>
              </div>
            )}
          </div>

          {/* AI Drafting Card (ui-style.md Section 5.D) */}
          <div className="border border-emerald-200/90 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white rounded-2xl p-4 space-y-3 shadow-soft-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-emerald-950">
                  Asisten Naskah Dinas Islami (Gemini AI Studio)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/70 shadow-2xs">
                Gemini 3.7 Flash
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Ketikkan poin ringkas atau instruksi surat, lalu asisten AI akan menyusun salam Islami, muqaddimah syar&apos;i, uraian formal, dan penutup santun secara instan.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Contoh: 'Undangan musyawarah persiapan Maulid Nabi hari Ahad malam ba'da Isya di masjid'"
                className="flex-1 text-xs border border-emerald-200 rounded-xl px-3 py-2 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={isAiLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#059669] hover:bg-[#047857] disabled:bg-emerald-300 text-white rounded-xl text-xs font-bold shadow-soft-sm hover:shadow-soft-md transition-all shrink-0 cursor-pointer active:scale-95"
              >
                {isAiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Menyusun Naskah...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Drafkan Otomatis</span>
                  </>
                )}
              </button>
            </div>

            {aiMessage && (
              <div
                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                  aiMessage.type === 'success'
                    ? 'bg-emerald-100/80 text-emerald-800 border border-emerald-200'
                    : aiMessage.type === 'error'
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-slate-100 text-slate-800'
                }`}
              >
                {aiMessage.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{aiMessage.text}</span>
              </div>
            )}
          </div>

          {/* Isi Surat Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Naskah Isi Surat (Dari Salam Pembuka hingga Penutup){' '}
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {content.length} karakter
              </span>
            </div>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Assalamu'alaikum Warahmatullahi Wabarakatuh... (Ketik atau gunakan Buat Draf AI di atas)"
              className="w-full text-xs font-serif leading-relaxed border border-slate-300 rounded-lg p-3 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              required
            />
          </div>

          {/* Status & Penandatangan */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-700">Status Surat:</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LetterStatus)}
                className="text-xs font-medium border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800"
              >
                <option value="DRAFT">Draf (Watermark)</option>
                <option value="APPROVED">Disetujui Ketua</option>
                <option value="SENT">Terkirim ke Penerima</option>
              </select>
            </div>

            <div className="text-[11px] text-slate-500 text-right">
              Penandatangan: <strong>{DKM_INFO.defaultChairman}</strong> (Ketua) & <strong>{DKM_INFO.defaultSecretary}</strong> (Sekretaris)
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer text-center flex items-center justify-center"
          >
            Batal
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-100 active:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Pratinjau Surat A4</span>
            </button>

            <button
              type="button"
              onClick={(e) => handleSubmit(e, false)}
              disabled={isSubmitting}
              className="min-h-[44px] flex items-center justify-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-emerald-400 text-white rounded-xl text-xs font-semibold shadow-soft-sm transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan ke E-Arsip</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
