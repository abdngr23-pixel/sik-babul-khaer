import { NextRequest, NextResponse } from 'next/server';
import { generateLPJExecutiveSummary } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      period = 'Tahun Anggaran 2026',
      totalLetters = 15,
      totalJamaah = 350,
      totalIncome = 125000000,
      totalExpense = 98000000,
      netBalance = 45000000,
      phbiBalance = 15000000,
      totalAssetsCount = 8,
      maintenanceCompliancePercent = 88,
      userPrompt = '',
    } = body;

    const result = await generateLPJExecutiveSummary({
      period,
      totalLetters,
      totalJamaah,
      totalIncome,
      totalExpense,
      netBalance,
      phbiBalance,
      totalAssetsCount,
      maintenanceCompliancePercent,
      userPrompt,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Narasi ringkasan eksekutif LPJ berhasil disusun',
    });
  } catch (error) {
    console.error('Error generating LPJ AI draft:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal membuat narasi LPJ otomatis' },
      { status: 500 }
    );
  }
}
