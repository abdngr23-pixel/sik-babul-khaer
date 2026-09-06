import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { ApprovalStatus, ApprovalType } from '@/types/reports';
import { authorizeMutation } from '@/lib/auth-session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const approvals = await store.getApprovals(status);

    const pendingCount = approvals.filter((a) => a.status === 'MENUNGGU_VERIFIKASI').length;
    const approvedCount = approvals.filter((a) => a.status === 'DISETUJUI').length;
    const revisionCount = approvals.filter((a) => a.status === 'PERLU_REVISI').length;

    return NextResponse.json({
      success: true,
      data: approvals,
      stats: {
        total: approvals.length,
        pending: pendingCount,
        approved: approvedCount,
        needRevision: revisionCount,
      },
    });
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat daftar pengesahan satu pintu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorizeMutation(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();

    if (!body.title || !body.type || !body.submittedBy) {
      return NextResponse.json(
        { success: false, error: 'Judul pengajuan, tipe pengesahan, dan pengaju wajib diisi' },
        { status: 400 }
      );
    }

    const newItem = await store.addApproval({
      type: body.type as ApprovalType,
      title: body.title.trim(),
      referenceNumber: body.referenceNumber ? body.referenceNumber.trim() : undefined,
      category: body.category ? body.category.trim() : 'Umum',
      submittedBy: body.submittedBy.trim(),
      submittedRole: body.submittedRole ? body.submittedRole.trim() : 'Pengurus DKM',
      amount: body.amount ? Number(body.amount) : undefined,
      description: body.description ? body.description.trim() : '',
      dispositionNotes: body.dispositionNotes || undefined,
    });

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Permohonan disposisi/pengesahan berhasil diajukan ke Ketua Umum',
    });
  } catch (error) {
    console.error('Error adding approval item:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengajukan pengesahan' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['KETUA_UMUM'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { id, status, dispositionNotes, verifiedBy } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID pengajuan dan status pengesahan wajib disertakan' },
        { status: 400 }
      );
    }

    const updated = await store.verifyApproval(
      id,
      status as ApprovalStatus,
      dispositionNotes,
      verifiedBy || 'Drs. Muhammad Hasri, M. Hum. (Ketua Umum)'
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Pengajuan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message:
        status === 'DISETUJUI'
          ? 'Pengajuan telah resmi disahkan dan dicatat dalam buku disposisi DKM'
          : 'Pengajuan telah dikembalikan untuk revisi pengurus pemohon',
    });
  } catch (error) {
    console.error('Error verifying approval:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui status pengesahan' },
      { status: 500 }
    );
  }
}
