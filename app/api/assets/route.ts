import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { AssetCategory, AssetCondition } from '@/types/asset';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const condition = searchParams.get('condition') || undefined;
    const search = searchParams.get('search') || undefined;
    const dueOnly = searchParams.get('maintenanceDueOnly') === 'true';

    const assets = store.getAssets({
      category,
      condition,
      search,
      maintenanceDueOnly: dueOnly,
    });
    const stats = store.getAssetStats();

    return NextResponse.json({
      success: true,
      data: assets,
      total: assets.length,
      stats,
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat katalog inventaris aset' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.category || !body.location) {
      return NextResponse.json(
        { success: false, error: 'Nama aset, kategori, dan lokasi wajib diisi' },
        { status: 400 }
      );
    }

    const newAsset = store.addAsset({
      code: body.code ? body.code.trim() : `AST-${Date.now().toString().slice(-5)}`,
      name: body.name.trim(),
      category: body.category as AssetCategory,
      location: body.location.trim(),
      purchaseDate: body.purchaseDate || new Date().toISOString().split('T')[0],
      purchaseCost: Number(body.purchaseCost) || 0,
      condition: (body.condition as AssetCondition) || 'BAIK',
      maintenanceCycleMonths: Number(body.maintenanceCycleMonths) || 3,
      lastMaintenanceDate: body.lastMaintenanceDate || '',
      nextMaintenanceDate: body.nextMaintenanceDate || '',
      maintenanceNotes: body.maintenanceNotes || '',
    });

    const stats = store.getAssetStats();

    return NextResponse.json({
      success: true,
      data: newAsset,
      stats,
      message: 'Aset inventaris berhasil didaftarkan',
    });
  } catch (error) {
    console.error('Error adding asset:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menambahkan aset inventaris' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, notes, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID aset wajib disertakan' },
        { status: 400 }
      );
    }

    if (action === 'RECORD_MAINTENANCE') {
      const updated = store.recordMaintenanceDone(id, notes);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: 'Aset tidak ditemukan' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        data: updated,
        stats: store.getAssetStats(),
        message: 'Pemeliharaan aset berhasil dicatat dan jadwal servis berikutnya diperbarui!',
      });
    }

    const updated = store.updateAsset(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Aset tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      stats: store.getAssetStats(),
      message: 'Data aset berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui aset' },
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
        { success: false, error: 'ID aset wajib disertakan' },
        { status: 400 }
      );
    }

    const deleted = store.deleteAsset(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Aset tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      stats: store.getAssetStats(),
      message: 'Aset berhasil dihapus dari inventaris',
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus aset' },
      { status: 500 }
    );
  }
}
