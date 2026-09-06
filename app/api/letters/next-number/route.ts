import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { generateLetterNumber } from '@/lib/letter-numbering';
import { LetterCategory, LetterDepartment } from '@/types/letter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') || 'UND') as LetterCategory;
    const department = (searchParams.get('department') || 'SEKR') as LetterDepartment;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const nextSeq = await store.getNextSequenceNumber();
    const nextLetterNumber = generateLetterNumber(nextSeq, category, date, department);

    return NextResponse.json({
      success: true,
      sequenceNumber: nextSeq,
      letterNumber: nextLetterNumber,
      category,
      department,
      date,
    });
  } catch (error) {
    console.error('Error generating next letter number:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghasilkan nomor surat otomatis' },
      { status: 500 }
    );
  }
}
