/**
 * Layanan Notifikasi Terpadu WhatsApp DKM Masjid Babul Khaer
 * Format nomor standar internasional Indonesia (62xxx) dan template resmi.
 */

export function formatWhatsAppNumber(rawPhone: string): string {
  // Hapus semua karakter non-digit
  let cleaned = rawPhone.replace(/\D/g, '');
  
  // Jika diawali 0, ganti dengan 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '628' + cleaned.slice(1);
  }
  
  return cleaned;
}

export function buildWhatsAppLink(phone: string, text: string): string {
  const formattedPhone = formatWhatsAppNumber(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(phone: string, text: string): void {
  const link = buildWhatsAppLink(phone, text);
  if (typeof window !== 'undefined') {
    window.open(link, '_blank', 'noopener,noreferrer');
  }
}

// ==========================================
// TEMPLATE NOTIFIKASI RESMI DKM BABUL KHAER
// ==========================================

export const WhatsAppTemplates = {
  /**
   * Konfirmasi Jadwal Khatib & Imam Sholat Jumat
   */
  khatibConfirmation: (data: {
    khatibName: string;
    date: string;
    time: string;
    topic?: string;
  }) => {
    return (
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
      `Yth. Ustadz ${data.khatibName},\n\n` +
      `Pengurus DKM Masjid Babul Khaer (BTP Blok AE Tamalanrea) memohon konfirmasi kehadiran Ustadz sebagai KHATIB & IMAM Sholat Jumat pada:\n` +
      `🗓 Hari/Tanggal: ${data.date}\n` +
      `⏰ Waktu: ${data.time} WITA\n` +
      `${data.topic ? `📖 Rencana Tema: "${data.topic}"\n` : ''}` +
      `📍 Lokasi: Masjid Babul Khaer, BTP Blok AE Tamalanrea, Makassar\n\n` +
      `Mohon kiranya Ustadz dapat hadir 15 menit sebelum adzan berkumandang. Konfirmasi balasan Ustadz sangat kami harapkan.\n\n` +
      `Jazakumullahu Khairan Katsiran.\n` +
      `Wassalamu'alaikum Wr. Wb.\n\n` +
      `*Seksi Peribadatan & Dakwah DKM Babul Khaer*`
    );
  },

  /**
   * Notifikasi Usulan Persetujuan ke Ketua DKM
   */
  approvalRequired: (data: {
    title: string;
    submittedBy: string;
    role: string;
    amount?: number;
    referenceNumber?: string;
  }) => {
    const formattedAmount = data.amount
      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(data.amount)
      : null;

    return (
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
      `Yth. Ketua Pengurus DKM Masjid Babul Khaer,\n\n` +
      `Terdapat permohonan persetujuan/disposisi satu pintu baru yang membutuhkan arahan dan persetujuan Bapak:\n\n` +
      `📋 *Judul:* ${data.title}\n` +
      `${data.referenceNumber ? `🔢 *No. Ref:* ${data.referenceNumber}\n` : ''}` +
      `👤 *Diajukan Oleh:* ${data.submittedBy} (${data.role})\n` +
      `${formattedAmount ? `💰 *Anggaran:* ${formattedAmount}\n` : ''}` +
      `\nSilakan tinjau dan berikan disposisi melalui aplikasi SIK Babul Khaer pada modul *Persetujuan Satu Pintu*.\n\n` +
      `Syukran Jazakumullah Khair.\n` +
      `*Sekretariat DKM Babul Khaer*`
    );
  },

  /**
   * Peringatan Kerusakan / Pemeliharaan Sarpras Mendesak
   */
  assetMaintenanceAlert: (data: {
    assetName: string;
    location: string;
    issue: string;
    reportedBy: string;
  }) => {
    return (
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
      `*PERINGATAN PEMELIHARAAN SARPRAS (URGENT)*\n\n` +
      `Telah dilaporkan kendala teknis pada fasilitas masjid:\n` +
      `🔧 *Aset:* ${data.assetName}\n` +
      `📍 *Lokasi:* ${data.location}\n` +
      `⚠️ *Kendala:* ${data.issue}\n` +
      `👤 *Pelapor:* ${data.reportedBy}\n\n` +
      `Mohon tim Seksi Sarana & Prasarana segera memeriksa ke lokasi demi kenyamanan ibadah jamaah.\n\n` +
      `*DKM Masjid Babul Khaer*`
    );
  },

  /**
   * Tanda Terima Pembayaran Zakat / Donasi Resmi
   */
  muzakkiReceipt: (data: {
    muzakkiName: string;
    receiptNumber: string;
    zakatType: string;
    amountRp: number;
    riceKg?: number;
  }) => {
    const formattedAmount = data.amountRp > 0
      ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(data.amountRp)
      : '';

    return (
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
      `Bapak/Ibu *${data.muzakkiName}* yang dirahmati Allah,\n\n` +
      `Alhamdulillah, setoran *${data.zakatType}* Anda telah resmi diterima dan dicatat oleh Amil UPZ Masjid Babul Khaer:\n\n` +
      `🧾 *No. Bukti Setor:* ${data.receiptNumber}\n` +
      `${formattedAmount ? `💵 *Nominal:* ${formattedAmount}\n` : ''}` +
      `${data.riceKg ? `🌾 *Beras:* ${data.riceKg} Kg\n` : ''}` +
      `\n_\"Ajarakallahu fi ma a'thaita, wa baraka fi ma abqaita, wa ja'alahu laka thahuran.\"_\n` +
      `(Semoga Allah memberi pahala atas apa yang engkau berikan, memberkahi apa yang tersisa, dan menjadikannya pembersih jiwa bagimu).\n\n` +
      `Jazakumullahu Khairan Katsiran.\n` +
      `*UPZ DKM Masjid Babul Khaer & BAZNAS Kota Makassar*`
    );
  },

  /**
   * Pengingat Angsuran Qardhul Hasan Bebas Riba
   */
  qardhReminder: (data: {
    ownerName: string;
    businessName: string;
    monthlyInstallment: number;
    remainingAmount: number;
  }) => {
    const formatRp = (num: number) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    return (
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
      `Bapak/Ibu *${data.ownerName}* (${data.businessName}),\n\n` +
      `Sekadar mengingatkan jadwal setoran angsuran bulanan dana bergulir Qardhul Hasan DKM Babul Khaer:\n` +
      `💵 *Angsuran Bulan Ini:* ${formatRp(data.monthlyInstallment)}\n` +
      `📊 *Sisa Pokok Pinjaman:* ${formatRp(data.remainingAmount)}\n\n` +
      `Setoran dapat diserahkan ke Bendahara DKM (H. Sahali) atau transfer ke Rekening BSI Masjid (Bebas Bunga/Riba).\n` +
      `Semoga usaha Bapak/Ibu senantiasa dilimpahkan keberkahan dan kelancaran rezeki.\n\n` +
      `*Seksi Pemberdayaan Ekonomi & Gerai Muslimah DKM*`
    );
  },

  /**
   * Peringatan Stok ATM Beras Menipis / Kritis ke Bendahara & Sarpras
   */
  riceStockAlert: (data: {
    currentStockKg: number;
    thresholdKg: number;
    lastRefillDate?: string;
  }) => {
    const isCritical = data.currentStockKg <= data.thresholdKg / 2;
    const statusLabel = isCritical ? 'KRITIS 🚨' : 'MENIPIS ⚠️';

    return (
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
      `*PERINGATAN STOK ATM BERAS: ${statusLabel}*\n\n` +
      `Lumbung pangan swadaya ATM Beras Masjid Babul Khaer memerlukan perhatian segera:\n` +
      `🌾 *Sisa Stok Saat Ini:* *${data.currentStockKg} Kg*\n` +
      `⚠️ *Batas Minimum (Threshold):* ${data.thresholdKg} Kg\n` +
      `${data.lastRefillDate ? `🗓 *Refill Terakhir:* ${data.lastRefillDate}\n` : ''}` +
      `\nMohon Bapak Bendahara / Seksi ZISWAF & Sarpras dapat mengoordinasikan pembukaan donasi beras atau alokasi dana kas sosial agar dispenser beras tetap terisi untuk jamaah dhuafa.\n\n` +
      `Syukran Jazakumullah Khair.\n` +
      `*Pengelola ATM Beras & UPZ DKM Babul Khaer*`
    );
  },

  /**
   * Konfirmasi Donasi / Infaq Jamaah dari Portal Publik
   */
  publicDonationConfirmation: (data: {
    category: string;
    amountRp?: number;
    donorName?: string;
  }) => {
    const formatRp = (num: number) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    return (
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
      `Yth. Pengurus DKM Masjid Babul Khaer (BTP Blok AE),\n\n` +
      `Saya ingin mengonfirmasi komitmen / bukti transfer donasi melalui Portal Publik:\n` +
      `📌 *Program/Kategori:* ${data.category}\n` +
      `${data.amountRp && data.amountRp > 0 ? `💰 *Nominal:* ${formatRp(data.amountRp)}\n` : ''}` +
      `${data.donorName ? `👤 *Nama:* ${data.donorName}\n` : ''}` +
      `\nMohon konfirmasi jika dana sudah masuk ke Rekening Resmi BSI 7123456789. Semoga menjadi amal jariyah yang berkah bagi keluarga kami.\n\n` +
      `Jazakumullahu Khairan Katsiran.`
    );
  },

  /**
   * Pengajuan Tawaran Lelang Infaq dari Jamaah ke Koordinator Panitia
   */
  lelangBidInquiry: (data: {
    itemName: string;
    currentBid: number;
    bidderName?: string;
    bidAmount?: number;
    coordinatorContact?: string;
  }) => {
    const formatRp = (num: number) =>
      new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

    return (
      `Assalamu'alaikum Warahmatullahi Wabarakatuh.\n\n` +
      `Yth. Panitia Koordinator Lelang Infaq Masjid Babul Khaer,\n\n` +
      `Saya ingin mengajukan tawaran infaq lelang untuk barang:\n` +
      `🏷️ *Barang Lelang:* ${data.itemName}\n` +
      `📈 *Tawaran Tertinggi Saat Ini:* ${formatRp(data.currentBid)}\n` +
      `${data.bidAmount ? `💎 *Tawaran Saya:* *${formatRp(data.bidAmount)}*\n` : ''}` +
      `${data.bidderName ? `👤 *Nama Penawar:* ${data.bidderName}\n` : '👤 *Nama Penawar:* Hamba Allah (Anonim)\n'}` +
      `\nMohon dicatat dalam sistem buku lelang. Semoga infaq ini membawa keberkahan bagi pembangunan dan kemakmuran Masjid Babul Khaer.\n\n` +
      `Jazakumullahu Khairan Katsiran.`
    );
  },
};
