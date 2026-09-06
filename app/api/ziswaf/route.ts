import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { authorizeMutation } from '@/lib/auth-session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rt = searchParams.get('rt') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const [sssCans, sssRecords, ziswafAids] = await Promise.all([
      store.getSssCans({ rt, status, search }),
      store.getSssRecords(),
      store.getZiswafAids({ rt, search }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        sssCans,
        sssRecords,
        ziswafAids,
      },
    });
  } catch (error) {
    console.error('Error fetching ziswaf data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data ZISWAF & SSS' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['KETUA_UMUM', 'KEMASJIDAN', 'BENDAHARA', 'SUPER_ADMIN', 'SEKRETARIS'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { action } = body;

    // 1. Catat Tarikan SSS (Record Collection)
    if (action === 'record-collection') {
      const { canId, amount, collectionDate, collector, notes } = body;
      if (!canId || !amount || Number(amount) <= 0) {
        return NextResponse.json(
          { success: false, error: 'ID kaleng dan nominal setoran wajib valid' },
          { status: 400 }
        );
      }

      const newRecord = await store.recordSssCollection({
        canId,
        amount: Number(amount),
        collectionDate,
        collector,
        notes,
      });

      return NextResponse.json({
        success: true,
        data: newRecord,
        message: 'Setoran Sedekah Subuh (SSS) berhasil dicatat dan disetorkan ke kas masjid',
      });
    }

    // 2. Tambah Kaleng SSS Baru
    if (action === 'add-can') {
      const { canCode, rt, houseNumber, holderName, phone, collectorOfficer, notes } = body;
      if (!canCode || !holderName || !houseNumber) {
        return NextResponse.json(
          { success: false, error: 'Kode kaleng, nama pemegang, dan nomor rumah wajib diisi' },
          { status: 400 }
        );
      }

      const today = new Date().toISOString().split('T')[0];
      const created = await store.addSssCan({
        canCode,
        rt: rt || 'RT 01',
        houseNumber,
        holderName,
        phone: phone || '',
        distributionDate: today,
        lastCollectionDate: today,
        status: 'TERDISTRIBUSI',
        collectorOfficer: collectorOfficer || 'Petugas Marbot',
        notes: notes || '',
      });

      return NextResponse.json({
        success: true,
        data: created,
        message: `Kaleng SSS ${canCode} berhasil didaftarkan`,
      });
    }

    // 3. Update Kaleng SSS
    if (action === 'update-can') {
      const { id, updates } = body;
      if (!id || !updates) {
        return NextResponse.json({ success: false, error: 'ID dan data update kaleng wajib diisi' }, { status: 400 });
      }

      const updated = await store.updateSssCan(id, updates);
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Data kaleng SSS berhasil diperbarui',
      });
    }

    // 4. Salurkan Bantuan Bansos / ZISWAF
    if (action === 'create-aid') {
      const {
        aidNumber,
        jamaahId,
        recipientName,
        recipientCategory,
        rt,
        address,
        phone,
        aidType,
        amountValue,
        goodsDescription,
        distributionDate,
        disbursedBy,
        receiptNumber,
        notes,
      } = body;

      if (!recipientName || !recipientCategory || !aidType || !amountValue) {
        return NextResponse.json(
          { success: false, error: 'Nama penerima, kategori mustahiq, jenis bantuan, dan estimasi nilai wajib diisi' },
          { status: 400 }
        );
      }

      const today = new Date().toISOString().split('T')[0];
      const created = await store.addZiswafAid({
        aidNumber: aidNumber || `BS-2026/${Math.floor(1000 + Math.random() * 9000)}`,
        jamaahId: jamaahId || undefined,
        recipientName,
        recipientCategory,
        rt: rt || 'RT 01',
        address: address || '',
        phone: phone || '',
        aidType,
        amountValue: Number(amountValue) || 0,
        goodsDescription: goodsDescription || '',
        distributionDate: distributionDate || today,
        disbursedBy: disbursedBy || 'Bidang III ZISWAF',
        status: 'DISALURKAN',
        receiptNumber: receiptNumber || `RCP-${Date.now().toString().slice(-6)}`,
        notes: notes || '',
      });

      return NextResponse.json({
        success: true,
        data: created,
        message: 'Penyaluran bantuan bansos ZISWAF berhasil dicatat',
      });
    }

    // 5. Update Status Bantuan
    if (action === 'update-aid') {
      const { id, updates } = body;
      if (!id || !updates) {
        return NextResponse.json({ success: false, error: 'ID dan data update bantuan wajib diisi' }, { status: 400 });
      }

      const updated = await store.updateZiswafAid(id, updates);
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Status bantuan ZISWAF berhasil diperbarui',
      });
    }

    return NextResponse.json({ success: false, error: `Action '${action}' tidak dikenali` }, { status: 400 });
  } catch (error) {
    console.error('Error mutating ziswaf data:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memproses data ZISWAF' },
      { status: 500 }
    );
  }
}
