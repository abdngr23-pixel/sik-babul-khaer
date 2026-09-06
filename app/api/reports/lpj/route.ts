import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'Tahun Anggaran 2026';

    const lpjData = await store.generateLPJData(period);

    return NextResponse.json({
      success: true,
      data: lpjData,
      message: 'Draf Laporan Pertanggungjawaban berhasil diagregasikan secara otomatis dari seluruh modul DKM',
    });
  } catch (error) {
    console.error('Error generating LPJ report:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengagregasikan draf LPJ tahunan' },
      { status: 500 }
    );
  }
}
