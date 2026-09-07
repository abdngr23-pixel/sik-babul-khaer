import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { Jamaah } from '@/types/jamaah';
import { authorizeMutation } from '@/lib/auth-session';

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['SUPER_ADMIN', 'KETUA_UMUM', 'SEKSI_PERIBADATAN_DAKWAH'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { jamaahList } = body;

    if (!Array.isArray(jamaahList) || jamaahList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Daftar data jamaah kosong atau tidak valid' },
        { status: 400 }
      );
    }

    // Filter valid rows
    const validRows: Omit<Jamaah, 'id' | 'createdAt' | 'updatedAt'>[] = [];
    for (const item of jamaahList) {
      if (item.fullName && item.rt && item.houseNumber && item.phone) {
        validRows.push({
          fullName: String(item.fullName).trim(),
          nik: item.nik ? String(item.nik).trim() : '',
          gender: item.gender === 'P' ? 'P' : 'L',
          birthPlace: item.birthPlace || '',
          birthDate: item.birthDate || '',
          rt: ['RT 01', 'RT 02', 'RT 03', 'RT 04', 'RT 05'].includes(item.rt)
            ? item.rt
            : 'RT 01',
          houseNumber: String(item.houseNumber).trim(),
          fullAddress: item.fullAddress || `Kompleks BTP ${item.houseNumber}, Makassar`,
          phone: String(item.phone).trim(),
          email: item.email || '',
          residencyStatus: ['TETAP', 'KONTRAK', 'KOST'].includes(item.residencyStatus)
            ? item.residencyStatus
            : 'TETAP',
          economicStatus: ['MUZAKKI', 'MAMPU', 'MUSTAHIQ_DHUAFA', 'YATIM_PIATU', 'LANSIA_DHUAFA'].includes(item.economicStatus)
            ? item.economicStatus
            : 'MAMPU',
          familyRole: ['KEPALA_KELUARGA', 'ISTRI', 'ANAK', 'LANSIA_TANGGUNGAN'].includes(item.familyRole)
            ? item.familyRole
            : 'KEPALA_KELUARGA',
          familyMemberCount: Number(item.familyMemberCount) || 1,
          occupation: item.occupation || '',
          bloodType: item.bloodType || '-',
          isYouthMember: Boolean(item.isYouthMember),
          notes: item.notes || '',
        });
      }
    }

    if (validRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada baris data valid yang memenuhi kriteria (Nama, RT, No.Rumah, dan Kontak WA wajib diisi)' },
        { status: 400 }
      );
    }

    const added = await store.addBulkJamaah(validRows);
    const stats = await store.getJamaahStats();

    return NextResponse.json({
      success: true,
      count: added.length,
      data: added,
      stats,
      message: `Berhasil mengimpor ${added.length} data jamaah ke basis data DKM`,
    });
  } catch (error) {
    console.error('Error in bulk import jamaah:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses import data massal' },
      { status: 500 }
    );
  }
}
