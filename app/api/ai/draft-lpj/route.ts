import { NextRequest, NextResponse } from 'next/server';
import { generateLPJExecutiveSummary } from '@/lib/gemini';
import { getSessionUser } from '@/lib/auth-session';
import { aiLpjSchema, validateRequestBody } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    // 1. Otorisasi Sesi Pengurus (API-Level Auth)
    const user = await getSessionUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak: Fitur Narasi LPJ AI hanya dapat diakses oleh pengurus DKM yang sedang login.' },
        { status: 401 }
      );
    }

    // 2. Validasi Input Zod
    const rawBody = await request.json().catch(() => ({}));
    const validation = validateRequestBody(aiLpjSchema, rawBody);
    if (!validation.success) {
      return validation.response;
    }

    const {
      period,
      divisionScope,
      authorRole,
      authorName,
      totalLetters,
      totalJamaah,
      totalIncome,
      totalExpense,
      netBalance,
      phbiBalance,
      totalAssetsCount,
      maintenanceCompliancePercent,
      userPrompt,
    } = validation.data;

    const result = await generateLPJExecutiveSummary({
      period,
      divisionScope: divisionScope as any,
      authorRole,
      authorName,
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
