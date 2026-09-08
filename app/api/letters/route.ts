import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { LetterStatus } from '@/types/letter';
import { authorizeMutation } from '@/lib/auth-session';
import { letterSchema, validateRequestBody } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const department = searchParams.get('department') || undefined;
    const status = searchParams.get('status') || undefined;

    const letters = await store.getLetters({ search, category, department, status });
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
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['KETUA_UMUM', 'SEKRETARIS'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const rawBody = await request.json().catch(() => ({}));
    const validation = validateRequestBody(letterSchema, rawBody);
    if (!validation.success) {
      return validation.response;
    }

    const validData = validation.data;

    const newLetter = await store.addLetter({
      category: validData.category as any,
      department: validData.department as any,
      recipientName: validData.recipientName,
      recipientTitle: validData.recipientTitle || '',
      recipientAddress: validData.recipientAddress || '',
      subject: validData.subject,
      letterDate: validData.letterDate || new Date().toISOString().split('T')[0],
      attachmentCount: validData.attachmentCount || '-',
      eventDate: validData.eventDate,
      eventTime: validData.eventTime,
      eventLocation: validData.eventLocation,
      content: validData.content,
      status: (validData.status as LetterStatus) || 'DRAFT',
      signatory1: rawBody.signatory1 || {
        name: 'Drs. H. Muhammad Arifin, M.Pd.I',
        role: 'Ketua Umum DKM',
      },
      signatory2: rawBody.signatory2 || {
        name: 'Ahmad Fauzi, S.Kom',
        role: 'Sekretaris Umum',
      },
      customNumber: rawBody.customNumber,
      verificationCode: rawBody.verificationCode,
      physicalArchiveLocation: rawBody.physicalArchiveLocation || rawBody.physicalLocation,
      letterDetails: rawBody.letterDetails,
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
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['KETUA_UMUM', 'SEKRETARIS'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID dan status surat wajib disertakan' },
        { status: 400 }
      );
    }

    const updated = await store.updateLetterStatus(id, status as LetterStatus);
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
