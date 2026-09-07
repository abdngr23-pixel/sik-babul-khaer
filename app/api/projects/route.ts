import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { authorizeMutation } from '@/lib/auth-session';

export async function GET() {
  try {
    const projects = await store.getPhysicalProjects();
    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Error fetching physical projects:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memuat data proyek fisik' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authorizeMutation(request, {
      allowedRoles: ['KETUA_UMUM', 'SARPRAS', 'SUPER_ADMIN', 'BENDAHARA', 'SEKRETARIS'],
    });
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = await request.json();
    const { action } = body;

    // 1. Toggle Milestone
    if (action === 'toggle-milestone') {
      const { projectId, milestoneId } = body;
      if (!projectId || !milestoneId) {
        return NextResponse.json(
          { success: false, error: 'Project ID dan Milestone ID wajib disertakan' },
          { status: 400 }
        );
      }

      const updated = await store.toggleProjectMilestone(projectId, milestoneId);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Proyek tidak ditemukan' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Tahapan milestone berhasil diperbarui',
      });
    }

    // 2. Update Progress & Realized Budget
    if (action === 'update-progress') {
      const { projectId, progressPercentage, realizedBudget, status, photos } = body;
      if (!projectId) {
        return NextResponse.json({ success: false, error: 'Project ID wajib diisi' }, { status: 400 });
      }

      const updateData: Partial<import('@/types/project').PhysicalProjectItem> = {
        progressPercentage: Number(progressPercentage) || 0,
        realizedBudget: Number(realizedBudget) || 0,
        status,
      };
      if (Array.isArray(photos)) {
        updateData.photos = photos;
      }

      const updated = await store.updatePhysicalProject(projectId, updateData);

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Kemajuan fisik proyek berhasil disimpan',
      });
    }

    // 3. Create Project
    if (action === 'create-project') {
      const {
        code,
        title,
        category,
        allocatedBudget,
        realizedBudget,
        progressPercentage,
        status,
        urgencyLevel,
        responsiblePerson,
        contractorVendor,
        startDate,
        targetEndDate,
        description,
        milestones,
        notes,
      } = body;

      if (!title || !category || !startDate || !targetEndDate) {
        return NextResponse.json(
          { success: false, error: 'Judul, kategori, dan tanggal proyek wajib diisi' },
          { status: 400 }
        );
      }

      const created = await store.addPhysicalProject({
        code: code || `PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
        title,
        category,
        allocatedBudget: Number(allocatedBudget) || 0,
        realizedBudget: Number(realizedBudget) || 0,
        progressPercentage: Number(progressPercentage) || 0,
        status: status || 'PERENCANAAN',
        urgencyLevel: urgencyLevel || 'SEDANG',
        responsiblePerson: responsiblePerson || 'Bidang II Sarpras',
        contractorVendor: contractorVendor || '',
        startDate,
        targetEndDate,
        description: description || '',
        milestones: Array.isArray(milestones) ? milestones : [],
        notes: notes || '',
      });

      return NextResponse.json({
        success: true,
        data: created,
        message: 'Proyek fisik baru berhasil ditambahkan',
      });
    }

    // 4. Update General Project Details
    if (action === 'update-project') {
      const { projectId, updates } = body;
      if (!projectId || !updates) {
        return NextResponse.json({ success: false, error: 'Project ID dan data update wajib diisi' }, { status: 400 });
      }

      const updated = await store.updatePhysicalProject(projectId, updates);
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Data proyek fisik berhasil diperbarui',
      });
    }

    return NextResponse.json({ success: false, error: `Action '${action}' tidak dikenali` }, { status: 400 });
  } catch (error) {
    console.error('Error mutating physical projects:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memproses data proyek' },
      { status: 500 }
    );
  }
}
