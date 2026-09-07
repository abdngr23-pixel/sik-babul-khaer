import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromRequest, verifySessionToken } from '@/lib/auth-session';
import { put } from '@vercel/blob';
import path from 'path';
import fs from 'fs/promises';

// Batasan ukuran: 5MB per file
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: NextRequest) {
  try {
    // 1. Otorisasi Sesi Pengguna
    const token = extractTokenFromRequest(req);
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Akses ditolak. Silakan login terlebih dahulu.' },
        { status: 401 }
      );
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Sesi tidak valid atau telah kedaluwarsa.' },
        { status: 401 }
      );
    }

    // 2. Baca Multipart Form Data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada file gambar yang diunggah.' },
        { status: 400 }
      );
    }

    // 3. Validasi Tipe MIME
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Format gambar '${file.type}' tidak didukung. Harap gunakan JPEG, PNG, atau WebP.`,
        },
        { status: 400 }
      );
    }

    // 4. Validasi Ukuran File
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `Ukuran file melebihi batas 5MB (${(file.size / (1024 * 1024)).toFixed(2)}MB).`,
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Buat nama file aman dengan timestamp
    const cleanExt = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const sanitizedBase = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30);
    const uniqueFileName = `mbh_${Date.now()}_${sanitizedBase || 'upload'}.${cleanExt}`;

    // 5. Upload ke @vercel/blob jika token tersedia
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

    if (blobToken) {
      try {
        const blob = await put(`uploads/${uniqueFileName}`, buffer, {
          access: 'public',
          token: blobToken,
          contentType: file.type,
        });

        return NextResponse.json({
          success: true,
          url: blob.url,
          fileName: uniqueFileName,
          size: file.size,
          provider: 'vercel-blob',
        });
      } catch (blobErr) {
        console.error('Vercel Blob upload failed, attempting local fallback:', blobErr);
      }
    }

    // 6. Fallback Lokal (untuk pengembangan offline/local dev tanpa Vercel Blob Token)
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadsDir, { recursive: true });

      const localFilePath = path.join(uploadsDir, uniqueFileName);
      await fs.writeFile(localFilePath, buffer);

      const publicUrl = `/uploads/${uniqueFileName}`;

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: uniqueFileName,
        size: file.size,
        provider: 'local-storage',
      });
    } catch (fsErr) {
      console.warn('Local disk write failed, falling back to base64 Data URL:', fsErr);
      const base64Data = buffer.toString('base64');
      const dataUrl = `data:${file.type};base64,${base64Data}`;

      return NextResponse.json({
        success: true,
        url: dataUrl,
        fileName: uniqueFileName,
        size: file.size,
        provider: 'base64-data-url',
      });
    }
  } catch (error: unknown) {
    console.error('Error during image upload:', error);
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan sistem saat mengunggah gambar.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
