import { NextRequest, NextResponse } from 'next/server';
import { generateLetterDraft } from '@/lib/gemini';
import { LetterCategory } from '@/types/letter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      category = 'UND',
      recipientName = 'Jamaah / Undangan',
      recipientTitle = '',
      subject = 'Surat Resmi DKM',
      eventDate = '',
      eventTime = '',
      eventLocation = '',
    } = body;

    if (!prompt && !subject) {
      return NextResponse.json(
        { success: false, error: 'Silakan masukkan perihal atau poin instruksi surat' },
        { status: 400 }
      );
    }

    const result = await generateLetterDraft({
      prompt: prompt || subject,
      category: category as LetterCategory,
      recipientName,
      recipientTitle,
      subject,
      eventDate,
      eventTime,
      eventLocation,
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
