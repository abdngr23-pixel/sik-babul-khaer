import { NextRequest, NextResponse } from 'next/server';
import { generateLetterDraft } from '@/lib/gemini';
import { LetterCategory } from '@/types/letter';
import { getSessionUser } from '@/lib/auth-session';
import { aiDraftLetterSchema, validateRequestBody } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // 1. Otorisasi Sesi Pengurus (API-Level Auth)
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Fitur AI Generator Surat hanya dapat diakses oleh pengurus DKM yang sedang login.' },
        { status: 401 }
      );
    }

    // 2. Validasi Input Zod
    const rawBody = await request.json().catch(() => ({}));
    const validation = validateRequestBody(aiDraftLetterSchema, rawBody);
    if (!validation.success) {
      return validation.response;
    }

    const {
      prompt,
      category,
      recipientName,
      recipientTitle,
      subject,
      eventDate,
      eventTime,
      eventLocation,
    } = validation.data;

    const result = await generateLetterDraft({
      prompt: prompt || subject || 'Surat Resmi DKM',
      category: category as LetterCategory,
      recipientName: recipientName || 'Jamaah / Undangan',
      recipientTitle: recipientTitle || '',
      subject: subject || prompt || 'Surat Resmi DKM',
      eventDate: eventDate || '',
      eventTime: eventTime || '',
      eventLocation: eventLocation || '',
    });

    return NextResponse.json({
      success: true,
      content: result.content,
      isAiGenerated: result.isAiGenerated,
      message: result.isAiGenerated
        ? 'Draf surat berhasil disusun oleh Gemini AI'
        : 'Draf surat berhasil disusun menggunakan template cerdas DKM',
    });
  } catch (error) {
    console.error('Error generating letter draft:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyusun draf surat' },
      { status: 500 }
    );
  }
}
