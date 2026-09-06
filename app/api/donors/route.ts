import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { DonorCategory, DonorStatus } from '@/types/donor';
import { PaymentMethod } from '@/types/finance';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const rt = searchParams.get('rt') || undefined;
    const paymentStatusParam = searchParams.get('paymentStatus');
    const paymentStatus =
      paymentStatusParam === 'PAID_THIS_MONTH' || paymentStatusParam === 'UNPAID_THIS_MONTH'
        ? paymentStatusParam
        : undefined;

    const donors = await store.getDonors({ search, category, status, rt, paymentStatus });
    const stats = await store.getDonorStats();

    return NextResponse.json({
      success: true,
      data: donors,
      total: donors.length,
      stats,
    });
  } catch (error) {
    console.error('Error fetching donors:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data donatur tetap' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a record payment action
    if (body.action === 'RECORD_PAYMENT') {
      const { donorId, amount, paymentMethod, date, notes } = body;
      if (!donorId) {
        return NextResponse.json(
          { success: false, error: 'ID donatur wajib disertakan' },
          { status: 400 }
        );
      }

      const result = await store.recordDonorPayment({
        donorId,
        amount: amount ? Number(amount) : undefined,
        paymentMethod,
        date,
        notes,
      });

      if (!result) {
        return NextResponse.json(
          { success: false, error: 'Donatur tidak ditemukan' },
          { status: 404 }
        );
      }

      const stats = await store.getDonorStats();
      const financeSummary = await store.getFinanceSummary();

      return NextResponse.json({
        success: true,
        data: result.donor,
        transaction: result.transaction,
        stats,
        financeSummary,
        message: `Setoran donasi sebesar Rp ${(amount || result.donor.commitmentAmount).toLocaleString('id-ID')} berhasil dicatat di Buku Kas DKM`,
      });
    }

    // Normal donor creation
    if (!body.donorName || !body.phone || !body.commitmentAmount) {
      return NextResponse.json(
        { success: false, error: 'Nama donatur, kontak WhatsApp, dan nominal komitmen wajib diisi' },
        { status: 400 }
      );
    }

    const newDonor = await store.addDonor({
      donorName: body.donorName.trim(),
      phone: body.phone.trim(),
      rt: body.rt || 'RT 01',
      address: body.address ? body.address.trim() : 'Kompleks BTP Blok AE',
      category: (body.category as DonorCategory) || 'KAS_OPERASIONAL',
      commitmentAmount: Number(body.commitmentAmount),
      billingDay: Number(body.billingDay) || 1,
      paymentMethod: (body.paymentMethod as PaymentMethod) || 'TRANSFER_BANK',
      status: (body.status as DonorStatus) || 'AKTIF',
      notes: body.notes ? body.notes.trim() : '',
    });

    const stats = await store.getDonorStats();

    return NextResponse.json({
      success: true,
      data: newDonor,
      stats,
      message: 'Donatur tetap baru berhasil didaftarkan',
    });
  } catch (error) {
    console.error('Error creating donor:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mendaftarkan donatur tetap' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID donatur wajib disertakan' },
        { status: 400 }
      );
    }

    const updated = await store.updateDonor(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Donatur tidak ditemukan' },
        { status: 404 }
      );
    }

    const stats = await store.getDonorStats();

    return NextResponse.json({
      success: true,
      data: updated,
      stats,
      message: 'Data donatur berhasil diperbarui',
    });
  } catch (error) {
    console.error('Error updating donor:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui data donatur' },
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
        { success: false, error: 'ID donatur wajib disertakan' },
        { status: 400 }
      );
    }

    const deleted = await store.deleteDonor(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Donatur tidak ditemukan' },
        { status: 404 }
      );
    }

    const stats = await store.getDonorStats();

    return NextResponse.json({
      success: true,
      stats,
      message: 'Donatur berhasil dihapus',
    });
  } catch (error) {
    console.error('Error deleting donor:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus donatur' },
      { status: 500 }
    );
  }
}
