import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  try {
    const minutes = store.getMinutes();
    return NextResponse.json({
      success: true,
      data: minutes,
      total: minutes.length,
    });
  } catch (error) {
    console.error('Error getting minutes:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data notulensi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, date, location, attendees, summary, decisions, actionItems, rawNotes } = body;

    if (!title || !date) {
      return NextResponse.json(
        { success: false, error: 'Judul dan tanggal rapat wajib diisi' },
        { status: 400 }
      );
    }

    const saved = store.addMinutes({
      title,
      date,
      location: location || 'Masjid Babul Khaer',
      attendees: attendees || '',
      summary: summary || '',
      decisions: Array.isArray(decisions) ? decisions : [],
      actionItems: Array.isArray(actionItems) ? actionItems : [],
      rawNotes: rawNotes || '',
    });

    return NextResponse.json({
      success: true,
      data: saved,
      message: 'Notulensi dan daftar tugas berhasil disimpan',
    });
  } catch (error) {
    console.error('Error saving minutes:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan notulensi' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { minuteId, actionId } = body;

    if (!minuteId || !actionId) {
      return NextResponse.json(
        { success: false, error: 'minuteId dan actionId wajib disertakan' },
        { status: 400 }
      );
    }

    const success = store.toggleActionItemStatus(minuteId, actionId);
    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Tugas tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Status tugas berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error toggling action item:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status tugas' },
      { status: 500 }
    );
  }
}
