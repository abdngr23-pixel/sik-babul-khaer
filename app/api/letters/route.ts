import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { LetterStatus } from '@/types/letter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;

    const letters = store.getLetters({ search, category, status });
    return NextResponse.json({
      success: true,
      data: letters,
      total: letters.length,
    });
  } catch (error) {
    console.error('Error fetching letters:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat daftar surat' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.category || !body.recipientName || !body.subject || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Data surat tidak lengkap' },
        { status: 400 }
      );
    }

    const newLetter = store.addLetter({
      category: body.category,
      recipientName: body.recipientName,
      recipientTitle: body.recipientTitle || '',
      recipientAddress: body.recipientAddress || '',
      subject: body.subject,
      letterDate: body.letterDate || new Date().toISOString().split('T')[0],
      attachmentCount: body.attachmentCount || '-',
      eventDate: body.eventDate,
      eventTime: body.eventTime,
      eventLocation: body.eventLocation,
      content: body.content,
      status: (body.status as LetterStatus) || 'DRAFT',
      signatory1: body.signatory1 || {
        name: 'Drs. H. Muhammad Arifin, M.Pd.I',
        role: 'Ketua Umum DKM',
      },
      signatory2: body.signatory2 || {
        name: 'Ahmad Fauzi, S.Kom',
        role: 'Sekretaris Umum',
      },
      customNumber: body.customNumber,
      physicalArchiveLocation: body.physicalArchiveLocation || body.physicalLocation,
      letterDetails: body.letterDetails,
    });

    return NextResponse.json({
      success: true,
      data: newLetter,
      message: 'Surat resmi berhasil dibuat dan diarsipkan',
    });
  } catch (error) {
    console.error('Error creating letter:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan surat baru' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID dan status surat wajib disertakan' },
        { status: 400 }
      );
    }

    const updated = store.updateLetterStatus(id, status as LetterStatus);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Surat tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Status surat berhasil diperbarui menjadi ${status}`,
    });
  } catch (error) {
    console.error('Error updating letter status:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status surat' },
      { status: 500 }
    );
  }
}
