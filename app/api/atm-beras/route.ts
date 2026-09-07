import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { authorizeMutation } from '@/lib/auth-session';

export async function GET() {
  try {
    const [snapshot, deposits, withdrawals] = await Promise.all([
      store.getRiceStockSnapshot(),
      store.getRiceDeposits(),
      store.getRiceWithdrawals(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        snapshot,
        deposits,
        withdrawals,
      },
    });
  } catch (error) {
    console.error('Error fetching ATM Beras data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data ATM Beras' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['SUPER_ADMIN', 'KETUA_UMUM', 'SEKSI_HUMAS_SOSIAL'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { action } = body;

    // 1. Catat Setoran Beras (Deposit)
    if (action === 'deposit') {
      const { donorName, weightKg, date, notes, recordedBy } = body;
      const weight = Number(weightKg);
      if (!weight || weight <= 0) {
        return NextResponse.json(
          { success: false, error: 'Berat beras (Kg) wajib diisi dengan angka positif' },
          { status: 400 }
        );
      }

      const deposit = await store.addRiceDeposit({
        date: date || new Date().toISOString().split('T')[0],
        donorName: donorName?.trim() || '',
        weightKg: weight,
        notes: notes?.trim() || '',
        recordedBy: recordedBy || 'Petugas Piket',
      });

      const updatedSnapshot = await store.getRiceStockSnapshot();

      return NextResponse.json({
        success: true,
        data: { deposit, snapshot: updatedSnapshot },
        message: `Alhamdulillah, setoran ${weight} Kg beras berhasil dicatat`,
      });
    }

    // 2. Catat Estimasi Pengeluaran / Refill Dispenser (Withdrawal)
    if (action === 'withdrawal') {
      const { estimatedWeightKg, date, notes, recordedBy } = body;
      const weight = Number(estimatedWeightKg);
      if (!weight || weight <= 0) {
        return NextResponse.json(
          { success: false, error: 'Estimasi beras keluar (Kg) wajib diisi dengan angka positif' },
          { status: 400 }
        );
      }

      const withdrawal = await store.addRiceWithdrawal({
        date: date || new Date().toISOString().split('T')[0],
        estimatedWeightKg: weight,
        recordedBy: recordedBy || 'Petugas Piket',
        notes: notes?.trim() || '',
      });

      const updatedSnapshot = await store.getRiceStockSnapshot();

      return NextResponse.json({
        success: true,
        data: { withdrawal, snapshot: updatedSnapshot },
        message: `Estimasi pengeluaran ${weight} Kg beras berhasil dicatat`,
      });
    }

    // 3. Perbarui Ambang Batas Stok Menipis
    if (action === 'update-threshold') {
      const { thresholdKg } = body;
      const threshold = Number(thresholdKg);
      if (threshold < 0) {
        return NextResponse.json(
          { success: false, error: 'Ambang batas tidak boleh negatif' },
          { status: 400 }
        );
      }

      const updatedSnapshot = await store.updateRiceStockThreshold(threshold);
      return NextResponse.json({
        success: true,
        data: updatedSnapshot,
        message: 'Ambang batas stok berhasil diperbarui',
      });
    }

    return NextResponse.json({ success: false, error: `Action '${action}' tidak dikenali` }, { status: 400 });
  } catch (error) {
    console.error('Error mutating ATM Beras data:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan sistem saat memproses transaksi ATM Beras' },
      { status: 500 }
    );
  }
}
