import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { FinanceCategory, TransactionType, PaymentMethod } from '@/types/finance';
import { authorizeMutation } from '@/lib/auth-session';
import { financeTransactionSchema, validateRequestBody } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const type = searchParams.get('type') || undefined;
    const search = searchParams.get('search') || undefined;

    const transactions = await store.getTransactions({ category, type, search });
    const summary = await store.getFinanceSummary();

    return NextResponse.json({
      success: true,
      data: transactions,
      total: transactions.length,
      summary,
    });
  } catch (error) {
    console.error('Error fetching finance transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat catatan keuangan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['KETUA_UMUM', 'BENDAHARA'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const rawBody = await request.json().catch(() => ({}));
    const validation = validateRequestBody(financeTransactionSchema, rawBody);
    if (!validation.success) {
      return validation.response;
    }

    const validData = validation.data;

    const newTrx = await store.addTransaction({
      date: validData.date || new Date().toISOString().split('T')[0],
      type: validData.type as TransactionType,
      category: validData.category as FinanceCategory,
      description: validData.description.trim(),
      amount: validData.amount,
      receiptNumber: validData.receiptNumber || `BK-${Date.now().toString().slice(-6)}`,
      payerOrPayee: validData.payerOrPayee || '-',
      paymentMethod: (validData.paymentMethod as PaymentMethod) || 'TUNAI',
      notes: validData.notes || '',
      programKerjaId: validData.programKerjaId || undefined,
    });

    const summary = await store.getFinanceSummary();

    return NextResponse.json({
      success: true,
      data: newTrx,
      summary,
      message: 'Transaksi kas berhasil dicatat dalam pembukuan DKM',
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mencatat transaksi kas' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['KETUA_UMUM', 'BENDAHARA'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID transaksi wajib disertakan' },
        { status: 400 }
      );
    }

    const updated = await store.updateTransaction(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    const summary = await store.getFinanceSummary();
    return NextResponse.json({
      success: true,
      data: updated,
      summary,
      message: 'Transaksi berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui transaksi kas' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['KETUA_UMUM', 'BENDAHARA'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID transaksi wajib disertakan' },
        { status: 400 }
      );
    }

    const deleted = await store.deleteTransaction(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Transaksi tidak ditemukan' },
        { status: 404 }
      );
    }

    const summary = await store.getFinanceSummary();
    return NextResponse.json({
      success: true,
      summary,
      message: 'Transaksi kas berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus transaksi kas' },
      { status: 500 }
    );
  }
}

