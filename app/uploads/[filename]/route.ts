import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    // Sanitasi nama file untuk mencegah directory traversal
    const safeName = path.basename(filename);
    const filePath = path.join(process.cwd(), 'public', 'uploads', safeName);

    const fileBuffer = await fs.readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const contentType =
      ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new NextResponse('File tidak ditemukan', { status: 404 });
  }
}
