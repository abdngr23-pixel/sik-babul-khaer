import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Helper validasi request body menggunakan schema Zod.
 * Mengembalikan data yang tervalidasi atau NextResponse 400 dengan pesan kesalahan terperinci.
 */
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorDetails = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));

    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Validasi input gagal: ${errorDetails.map((e) => `${e.field}: ${e.message}`).join(', ')}`,
          details: errorDetails,
        },
        { status: 400 }
      ),
    };
  }

  return { success: true, data: result.data };
}

// -----------------------------------------------------------------------------
// 1. Skema Autentikasi Pengurus
// -----------------------------------------------------------------------------
export const authLoginSchema = z.object({
  userId: z.string().trim().min(1, 'ID akun pengurus wajib dipilih'),
  pin: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'PIN harus terdiri dari tepat 6 digit angka'),
});

// -----------------------------------------------------------------------------
// 2. Skema Transaksi Kas & Keuangan
// -----------------------------------------------------------------------------
export const financeTransactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE'], {
    message: "Tipe transaksi harus 'INCOME' atau 'EXPENSE'",
  }),
  category: z.string().trim().min(1, 'Kategori pos dana wajib diisi'),
  amount: z
    .number({ message: 'Nominal harus berupa angka' })
    .positive('Nominal transaksi harus lebih besar dari 0'),
  date: z.string().trim().optional(),
  description: z.string().trim().min(2, 'Keterangan transaksi minimal 2 karakter'),
  paymentMethod: z
    .enum(['TUNAI', 'TRANSFER_BANK', 'QRIS', 'CASH', 'TRANSFER'])
    .default('TUNAI'),
  receiptNumber: z.string().trim().optional(),
  payerOrPayee: z.string().trim().optional(),
  donorName: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  programKerjaId: z.string().trim().optional(),
  status: z.enum(['VERIFIED', 'PENDING', 'REJECTED']).default('VERIFIED'),
});

// -----------------------------------------------------------------------------
// 3. Skema Manajemen Donatur
// -----------------------------------------------------------------------------
export const donorSchema = z.object({
  name: z.string().trim().min(2, 'Nama donatur minimal 2 karakter'),
  type: z.enum(['RUTIN_BULANAN', 'INSIDENTIL', 'LEMBAGA'], {
    message: 'Tipe donatur harus RUTIN_BULANAN, INSIDENTIL, atau LEMBAGA',
  }),
  monthlyCommitment: z.number().min(0, 'Komitmen bulanan tidak boleh negatif').default(0),
  phone: z.string().trim().optional().default(''),
  address: z.string().trim().optional().default(''),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

// -----------------------------------------------------------------------------
// 4. Skema Sensus Warga Jamaah
// -----------------------------------------------------------------------------
export const jamaahSchema = z.object({
  namaLengkap: z.string().trim().min(2, 'Nama lengkap minimal 2 karakter'),
  nik: z
    .string()
    .trim()
    .regex(/^(\d{16}|\d{6}\*{6}\d{4})$/, 'NIK harus 16 digit angka atau berformat tersamar (masking)'),
  nomorKK: z.string().trim().optional().default(''),
  jenisKelamin: z.enum(['L', 'P'], { message: "Jenis kelamin harus 'L' atau 'P'" }),
  statusKeluarga: z.enum(['KEPALA_KELUARGA', 'ISTRI', 'ANAK', 'FAMILI_LAIN'], {
    message: 'Status keluarga tidak valid',
  }),
  alamat: z.string().trim().min(2, 'Alamat domisili minimal 2 karakter'),
  rt: z.string().trim().optional().default('01'),
  rw: z.string().trim().optional().default('01'),
  telepon: z.string().trim().optional().default(''),
  pekerjaan: z.string().trim().optional().default(''),
  statusEkonomi: z.enum(['MAMPU', 'SEDANG', 'MUSTAHIK_MISKIN', 'MUSTAHIK_DHUAFA']).default('SEDANG'),
});

// -----------------------------------------------------------------------------
// 5. Skema Persuratan Resmi DKM
// -----------------------------------------------------------------------------
export const letterSchema = z.object({
  letterNumber: z.string().trim().optional(),
  category: z.enum(['UND', 'PBR', 'MOU', 'SK', 'PENG', 'KET', 'REK', 'TGS'], {
    message: 'Kategori surat resmi tidak valid',
  }),
  subject: z.string().trim().min(3, 'Perihal surat minimal 3 karakter'),
  recipientName: z.string().trim().min(2, 'Nama penerima surat minimal 2 karakter'),
  recipientTitle: z.string().trim().optional().default(''),
  recipientAddress: z.string().trim().optional().default(''),
  department: z.string().trim().optional(),
  letterDate: z.string().trim().optional(),
  attachmentCount: z.string().trim().optional().default('-'),
  eventDate: z.string().trim().optional(),
  eventTime: z.string().trim().optional(),
  eventLocation: z.string().trim().optional(),
  content: z.string().trim().min(3, 'Isi draf surat minimal 3 karakter'),
  status: z.enum(['DRAFT', 'SIGNED', 'SENT', 'ARCHIVED']).default('DRAFT'),
  signatoryRole: z.string().trim().optional(),
});

// -----------------------------------------------------------------------------
// 6. Skema Generator AI (Gemini)
// -----------------------------------------------------------------------------
export const aiDraftLetterSchema = z
  .object({
    prompt: z.string().trim().optional(),
    subject: z.string().trim().optional(),
    category: z.enum(['UND', 'PBR', 'MOU', 'SK', 'PENG', 'KET', 'REK', 'TGS']).default('UND'),
    recipientName: z.string().trim().default('Jamaah / Undangan'),
    recipientTitle: z.string().trim().optional().default(''),
    eventDate: z.string().trim().optional().default(''),
    eventTime: z.string().trim().optional().default(''),
    eventLocation: z.string().trim().optional().default(''),
  })
  .refine(
    (data) => (data.prompt && data.prompt.length > 0) || (data.subject && data.subject.length > 0),
    {
      message: 'Silakan berikan perihal surat atau poin instruksi untuk draf AI',
      path: ['prompt'],
    }
  );

export const aiMinutesSchema = z.object({
  rawNotes: z
    .string()
    .trim()
    .min(5, 'Teks notulensi rapat mentah minimal 5 karakter')
    .max(30000, 'Teks notulensi rapat maksimal 30.000 karakter'),
  saveToStore: z.boolean().optional().default(false),
});

export const aiLpjSchema = z.object({
  period: z.string().trim().default('Tahun Anggaran 2026'),
  divisionScope: z.string().trim().default('ALL'),
  authorRole: z.string().trim().default('Sekretaris Umum'),
  authorName: z.string().trim().optional().default(''),
  totalLetters: z.number().nonnegative().optional().default(15),
  totalJamaah: z.number().nonnegative().optional().default(350),
  totalIncome: z.number().nonnegative().optional().default(125000000),
  totalExpense: z.number().nonnegative().optional().default(98000000),
  netBalance: z.number().optional().default(45000000),
  phbiBalance: z.number().optional().default(15000000),
  totalAssetsCount: z.number().nonnegative().optional().default(8),
  maintenanceCompliancePercent: z.number().min(0).max(100).optional().default(88),
  userPrompt: z.string().trim().optional().default(''),
});
