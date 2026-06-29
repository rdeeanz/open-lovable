import { NextRequest, NextResponse } from 'next/server';
import { getUploadsBucket } from '@/lib/db/cloudflare';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const bucket = getUploadsBucket();
  if (!bucket) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 404 });
  }

  const { key } = await params;
  const objectKey = key.join('/');

  const object = await bucket.get(objectKey);
  if (!object) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    'Content-Type',
    object.httpMetadata?.contentType || 'application/octet-stream'
  );
  headers.set('Cache-Control', 'public, max-age=86400');

  return new Response(object.body as BodyInit, { headers });
}
