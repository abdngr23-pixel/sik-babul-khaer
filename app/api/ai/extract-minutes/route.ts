import { NextRequest, NextResponse } from 'next/server';
import { extractMeetingMinutesAI } from '@/lib/gemini';
import { store } from '@/lib/store';
import { getSessionUser } from '@/lib/auth-session';
import { aiMinutesSchema, validateRequestBody } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // 1. Otorisasi Sesi Pengurus (API-Level Auth)
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Fitur AI Ekstraksi Notulensi hanya dapat diakses oleh pengurus DKM yang sedang login.' },
        { status: 401 }
      );
    }

    // 2. Validasi Input Zod
    const rawBody = await request.json().catch(() => ({}));
    const validation = validateRequestBody(aiMinutesSchema, rawBody);
    if (!validation.success) {
      return validation.response;
    }

    const { rawNotes, saveToStore } = validation.data;

    if (saveToStore && user.isReadOnly) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Akun Pengawas (Read-Only) tidak diizinkan menyimpan hasil notulensi ke database.' },
        { status: 403 }
      );
    }

    const extracted = await extractMeetingMinutesAI(rawNotes);

    let savedMinute = null;
    if (saveToStore) {
      savedMinute = store.addMinutes({
        title: extracted.title,
        date: extracted.date,
        location: extracted.location,
        attendees: extracted.attendees,
        summary: extracted.summary,
        decisions: extracted.decisions,
        actionItems: extracted.actionItems.map((item, idx) => ({
          ...item,
          id: `act-${Date.now()}-${idx}`,
          status: 'PENDING' as const,
        })),
        rawNotes,
      });
    }

    return NextResponse.json({
      success: true,
      data: extracted,
      savedMinute,
      isAiGenerated: extracted.isAiGenerated,
      message: extracted.isAiGenerated
        ? 'Notulensi berhasil dianalisis dan diekstrak oleh Gemini AI'
        : 'Notulensi berhasil diproses oleh sistem ekstraksi DKM',
    });
  } catch (error) {
    console.error('Error extracting minutes:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengekstrak notulensi rapat' },
      { status: 500 }
    );
  }
}
