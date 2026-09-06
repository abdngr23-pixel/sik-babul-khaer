import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  try {
    const kpis = await store.getFieldKPIs();

    // Calculate overall organization health index
    const totalScore = kpis.reduce((sum, k) => sum + k.score, 0);
    const averageScore = Math.round(totalScore / (kpis.length || 1));

    let overallGrade = 'A (Sangat Baik)';
    if (averageScore < 75) overallGrade = 'C (Cukup)';
    else if (averageScore < 88) overallGrade = 'B (Baik)';

    return NextResponse.json({
      success: true,
      data: kpis,
      overallScore: averageScore,
      overallGrade,
      message: 'Indikator kinerja bidang Dewan Penasehat & Pengawas berhasil dimuat',
    });
  } catch (error) {
    console.error('Error fetching field KPIs:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat capaian kinerja bidang' },
      { status: 500 }
    );
  }
}
