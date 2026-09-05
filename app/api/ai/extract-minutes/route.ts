import { NextRequest, NextResponse } from 'next/server';
import { extractMeetingMinutesAI } from '@/lib/gemini';
import { store } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawNotes, saveToStore = false } = body;

    if (!rawNotes || rawNotes.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'Silakan masukkan teks notulensi rapat mentah' },
        { status: 400 }
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
