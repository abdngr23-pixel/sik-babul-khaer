import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { authorizeMutation } from '@/lib/auth-session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : undefined;

    const [khatibList, fridaySchedules, ramadhanSchedules, kajianSchedules] = await Promise.all([
      store.getKhatibList(),
      store.getFridaySchedules(year),
      store.getRamadhanSchedules(year),
      store.getKajianSchedules(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        khatibList,
        fridaySchedules,
        ramadhanSchedules,
        kajianSchedules,
      },
    });
  } catch (error) {
    console.error('Error fetching dakwah data:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data dakwah & peribadatan' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['SUPER_ADMIN', 'KETUA_UMUM', 'SEKSI_PERIBADATAN_DAKWAH'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { action } = body;

    // 1. Create Khatib
    if (action === 'create-khatib') {
      const { name, title, specialization, institution, phone, address, notes, status, totalAppearances } = body;
      if (!name || !phone) {
        return NextResponse.json(
          { success: false, error: 'Nama dan nomor telepon/WA khatib wajib diisi' },
          { status: 400 }
        );
      }

      const created = await store.addKhatib({
        name,
        title: title || 'Ust.',
        specialization: specialization || 'Fiqih & Ibadah',
        institution: institution || 'DKM Babul Khaer',
        phone,
        address: address || '',
        totalAppearances: Number(totalAppearances) || 0,
        status: status || 'AKTIF',
        notes: notes || '',
      });

      return NextResponse.json({
        success: true,
        data: created,
        message: 'Khatib berhasil ditambahkan ke database',
      });
    }

    // 2. Update Khatib
    if (action === 'update-khatib') {
      const { id, updates } = body;
      if (!id || !updates) {
        return NextResponse.json({ success: false, error: 'ID dan data update wajib diisi' }, { status: 400 });
      }

      const updated = await store.updateKhatib(id, updates);
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Data khatib berhasil diperbarui',
      });
    }

    // 3. Delete Khatib
    if (action === 'delete-khatib') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'ID khatib wajib disertakan' }, { status: 400 });
      }

      await store.deleteKhatib(id);
      return NextResponse.json({
        success: true,
        message: 'Data khatib berhasil dihapus',
      });
    }

    // 4. Update Friday Schedule (termasuk konfirmasi status)
    if (action === 'update-friday') {
      const { id, updates } = body;
      if (!id || !updates) {
        return NextResponse.json({ success: false, error: 'ID dan data update wajib diisi' }, { status: 400 });
      }

      const updated = await store.updateFridaySchedule(id, updates);
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Jadwal shalat Jumat berhasil diperbarui',
      });
    }

    // 5. Bulk Upsert Friday Schedules (Import Excel)
    if (action === 'bulk-friday') {
      const { items } = body;
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, error: 'Daftar jadwal kosong' }, { status: 400 });
      }

      await store.bulkUpsertFridaySchedules(items);
      return NextResponse.json({
        success: true,
        message: `Berhasil mengimpor ${items.length} jadwal shalat Jumat`,
      });
    }

    // 6. Update Ramadhan Schedule
    if (action === 'update-ramadhan') {
      const { id, updates } = body;
      if (!id || !updates) {
        return NextResponse.json({ success: false, error: 'ID dan data update wajib diisi' }, { status: 400 });
      }

      const updated = await store.updateRamadhanSchedule(id, updates);
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Jadwal amaliyah Ramadhan berhasil diperbarui',
      });
    }

    // 7. Bulk Upsert Ramadhan Schedules (Import Excel)
    if (action === 'bulk-ramadhan') {
      const { items } = body;
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, error: 'Daftar jadwal ramadhan kosong' }, { status: 400 });
      }

      await store.bulkUpsertRamadhanSchedules(items);
      return NextResponse.json({
        success: true,
        message: `Berhasil mengimpor ${items.length} jadwal amaliyah Ramadhan`,
      });
    }

    // 8. Create Kajian Schedule
    if (action === 'create-kajian') {
      const { item } = body;
      if (!item || !item.title || !item.speakerName) {
        return NextResponse.json({ success: false, error: 'Data kajian tidak lengkap' }, { status: 400 });
      }

      const created = await store.addKajianSchedule(item);
      return NextResponse.json({
        success: true,
        data: created,
        message: 'Agenda kajian berhasil ditambahkan',
      });
    }

    // 9. Update Kajian Schedule
    if (action === 'update-kajian') {
      const { id, updates } = body;
      if (!id || !updates) {
        return NextResponse.json({ success: false, error: 'ID dan data update wajib diisi' }, { status: 400 });
      }

      const updated = await store.updateKajianSchedule(id, updates);
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Jadwal kajian berhasil diperbarui',
      });
    }

    // 9. Complete Agenda (Tandai Selesai & Realisasi)
    if (action === 'complete-agenda') {
      const { type, id, attendanceCount, actualHonorDisbursed, summaryNotes } = body;
      if (!type || !id) {
        return NextResponse.json({ success: false, error: 'Tipe agenda dan ID wajib diisi' }, { status: 400 });
      }

      const completedAt = new Date().toISOString();
      const updates = {
        isCompleted: true,
        attendanceCount: attendanceCount ? Number(attendanceCount) : undefined,
        actualHonorDisbursed: actualHonorDisbursed ? Number(actualHonorDisbursed) : undefined,
        summaryNotes: summaryNotes || '',
        completedAt,
      };

      if (type === 'FRIDAY') {
        await store.updateFridaySchedule(id, {
          ...updates,
          status: 'SELESAI',
        });
      } else if (type === 'RAMADHAN') {
        await store.updateRamadhanSchedule(id, updates);
      } else if (type === 'KAJIAN') {
        await store.updateKajianSchedule(id, updates);
      }

      return NextResponse.json({
        success: true,
        message: 'Agenda dakwah berhasil ditandai selesai dan data realisasi tersimpan',
      });
    }

    return NextResponse.json({ success: false, error: `Action '${action}' tidak dikenali` }, { status: 400 });
  } catch (error) {
    console.error('Error mutating dakwah data:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memproses data dakwah' },
      { status: 500 }
    );
  }
}
