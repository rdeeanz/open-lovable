import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { requireAdminSession } from '@/lib/admin/require-admin';
import { updateSiteSettings } from '@/lib/admin/store';
import { getUploadsBucket } from '@/lib/db/cloudflare';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/svg+xml',
]);
const MAX_SIZE = 2 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'File logo wajib diunggah' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Format tidak didukung. Gunakan PNG, JPG, WEBP, atau SVG.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 2MB' }, { status: 400 });
    }

    const extMap: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
    };
    const ext = extMap[file.type] || 'png';
    const filename = `site-logo.${ext}`;
    const objectKey = filename;
    const buffer = Buffer.from(await file.arrayBuffer());

    const bucket = getUploadsBucket();
    let logoUrl: string;

    if (bucket) {
      await bucket.put(objectKey, buffer, {
        httpMetadata: { contentType: file.type },
      });
      logoUrl = `/api/uploads/${objectKey}`;
    } else {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
      logoUrl = `/uploads/${filename}`;
    }

    await updateSiteSettings({ logoUrl });

    return NextResponse.json({ success: true, logoUrl });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal mengunggah logo' },
      { status: 400 }
    );
  }
}
