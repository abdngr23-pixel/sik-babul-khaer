import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { authorizeMutation } from '@/lib/auth-session';

export async function GET() {
  try {
    const items = await store.getLelangItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('Error fetching lelang items:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data lelang infaq' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Semua koordinator divisi dapat mengelola lelang
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['SUPER_ADMIN', 'KETUA_UMUM', 'SEKRETARIS', 'BENDAHARA', 'SARPRAS', 'KEMASJIDAN'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { action } = body;

    // 1. Buat Lelang Baru
    if (action === 'create-lelang') {
      const { item } = body;
      if (!item || !item.itemName || !item.startingBid || !item.deadlineDate) {
        return NextResponse.json(
          { success: false, error: 'Nama barang, harga awal, dan batas waktu lelang wajib diisi' },
          { status: 400 }
        );
      }

      const created = await store.addLelangItem({
        itemName: item.itemName.trim(),
        description: item.description?.trim() || '',
        photoUrls: Array.isArray(item.photoUrls) ? item.photoUrls : [],
        startingBid: Number(item.startingBid),
        currentHighestBid: Number(item.startingBid),
        currentBidderName: undefined,
        deadlineDate: item.deadlineDate,
        status: 'BERLANGSUNG',
        coordinatorContact: item.coordinatorContact?.trim() || '0812-4000-0003',
        division: item.division?.trim() || 'DKM Masjid Babul Khaer',
        createdBy: authResult.user.name || 'Pengurus DKM',
      });

      return NextResponse.json({
        success: true,
        data: created,
        message: 'Barang lelang infaq berhasil didaftarkan',
      });
    }

    // 2. Catat Tawaran Baru (Manual oleh panitia setelah tawar via WA)
    if (action === 'place-bid') {
      const { id, bidAmount, bidderName } = body;
      if (!id || !bidAmount) {
        return NextResponse.json(
          { success: false, error: 'ID lelang dan nominal tawaran wajib diisi' },
          { status: 400 }
        );
      }

      try {
        const updated = await store.placeLelangBid(id, Number(bidAmount), bidderName);
        return NextResponse.json({
          success: true,
          data: updated,
          message: 'Tawaran baru berhasil dicatat',
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Gagal mencatat tawaran';
        return NextResponse.json(
          { success: false, error: message },
          { status: 400 }
        );
      }
    }

    // 3. Selesaikan Lelang (Tetapkan Pemenang)
    if (action === 'complete-lelang') {
      const { id, winnerName, finalPrice } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'ID lelang wajib diisi' }, { status: 400 });
      }

      const updated = await store.completeLelang(
        id,
        winnerName,
        finalPrice ? Number(finalPrice) : undefined
      );

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Lelang berhasil diselesaikan dan pemenang telah ditetapkan',
      });
    }

    // 4. Batalkan Lelang
    if (action === 'cancel-lelang') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'ID lelang wajib diisi' }, { status: 400 });
      }

      const updated = await store.cancelLelang(id);
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Status lelang diubah menjadi Dibatalkan',
      });
    }

    return NextResponse.json({ success: false, error: `Action '${action}' tidak dikenal` }, { status: 400 });
  } catch (error) {
    console.error('Error mutating lelang data:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat memproses data lelang' },
      { status: 500 }
    );
  }
}
