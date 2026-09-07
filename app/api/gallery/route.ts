import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { authorizeMutation } from '@/lib/auth-session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const items = await store.getGalleryItems(category);
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data galeri kegiatan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Semua pengurus terdaftar dapat mengunggah foto galeri
    const authResult = await authorizeMutation(request, {
      allowedRoles: [
        'SUPER_ADMIN',
        'KETUA_UMUM',
        'KETUA_I',
        'KETUA_II',
        'SEKRETARIS',
        'WAKIL_SEKRETARIS',
        'BENDAHARA',
        'WAKIL_BENDAHARA',
        'SEKSI_PERIBADATAN_DAKWAH',
        'SEKSI_ORGANISASI_PENDIDIKAN_REMAJA',
        'SEKSI_HUMAS_SOSIAL',
        'SEKSI_PEMBERDAYAAN_PEREMPUAN',
        'SEKSI_PEMBANGUNAN',
        'SEKSI_SARPRAS',
        'SEKSI_KEAMANAN_KEBERSIHAN',
      ],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { action } = body;

    // 1. Tambah Foto Galeri Baru
    if (action === 'add-item') {
      const { item } = body;
      if (!item || !item.title || !item.photoUrl || !item.category) {
        return NextResponse.json(
          { success: false, error: 'Judul, URL foto, dan kategori kegiatan wajib diisi' },
          { status: 400 }
        );
      }

      const created = await store.addGalleryItem({
        title: item.title.trim(),
        caption: item.caption?.trim() || '',
        category: item.category,
        photoUrl: item.photoUrl,
        division: item.division?.trim() || authResult.user.roleLabel || 'Pengurus DKM',
        uploadedBy: authResult.user.name || 'Pengurus',
        date: item.date || new Date().toISOString().split('T')[0],
      });

      return NextResponse.json({
        success: true,
        data: created,
        message: 'Foto kegiatan berhasil ditambahkan ke galeri',
      });
    }

    // 2. Hapus Foto Galeri
    if (action === 'delete-item') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'ID foto galeri wajib disertakan' }, { status: 400 });
      }

      const deleted = await store.deleteGalleryItem(id);
      return NextResponse.json({
        success: true,
        data: { deleted },
        message: 'Foto kegiatan berhasil dihapus',
      });
    }

    return NextResponse.json({ success: false, error: `Action '${action}' tidak dikenal` }, { status: 400 });
  } catch (error) {
    console.error('Error mutating gallery data:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat memproses galeri kegiatan' },
      { status: 500 }
    );
  }
}
