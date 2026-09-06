import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { JamaahFilterParams } from '@/types/jamaah';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const rt = searchParams.get('rt') || undefined;
    const economicStatus = searchParams.get('economicStatus') || undefined;
    const residencyStatus = searchParams.get('residencyStatus') || undefined;
    const isYouth = searchParams.get('isYouthMember');

    const params: JamaahFilterParams = {
      search,
      rt,
      economicStatus,
      residencyStatus,
      isYouthMember: isYouth === 'true' ? true : undefined,
    };

    const jamaah = await store.getJamaah(params);
    const stats = await store.getJamaahStats();

    return NextResponse.json({
      success: true,
      data: jamaah,
      total: jamaah.length,
      stats,
    });
  } catch (error) {
    console.error('Error getting jamaah:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data jamaah' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.fullName || !body.rt || !body.houseNumber || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Nama lengkap, RT, nomor rumah, dan kontak WA wajib diisi' },
        { status: 400 }
      );
    }

    const newJamaah = await store.addJamaah({
      fullName: body.fullName,
      nik: body.nik || '',
      gender: body.gender || 'L',
      birthPlace: body.birthPlace || '',
      birthDate: body.birthDate || '',
      rt: body.rt,
      houseNumber: body.houseNumber,
      fullAddress: body.fullAddress || `Kompleks BTP ${body.houseNumber}, Makassar`,
      phone: body.phone,
      email: body.email || '',
      residencyStatus: body.residencyStatus || 'TETAP',
      economicStatus: body.economicStatus || 'MAMPU',
      familyRole: body.familyRole || 'KEPALA_KELUARGA',
      familyMemberCount: Number(body.familyMemberCount) || 1,
      occupation: body.occupation || '',
      bloodType: body.bloodType || '-',
      isYouthMember: Boolean(body.isYouthMember),
      notes: body.notes || '',
    });

    return NextResponse.json({
      success: true,
      data: newJamaah,
      message: 'Data jamaah berhasil ditambahkan ke basis data',
    });
  } catch (error) {
    console.error('Error adding jamaah:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan data jamaah' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID jamaah wajib disertakan' },
        { status: 400 }
      );
    }

    const updated = await store.updateJamaah(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Data jamaah tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Data profil jamaah berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating jamaah:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data jamaah' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID jamaah wajib disertakan' },
        { status: 400 }
      );
    }

    const deleted = await store.deleteJamaah(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Data jamaah tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data jamaah berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting jamaah:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus data jamaah' },
      { status: 500 }
    );
  }
}
