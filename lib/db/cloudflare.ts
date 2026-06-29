import type { D1Database, R2Bucket } from '@cloudflare/workers-types';

export interface CloudflareBindings {
  DB: D1Database;
  UPLOADS: R2Bucket;
}

export function getCloudflareBindings(): Partial<CloudflareBindings> | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getCloudflareContext } = require('@opennextjs/cloudflare') as {
      getCloudflareContext: () => { env: Partial<CloudflareBindings> };
    };
    return getCloudflareContext()?.env ?? null;
  } catch {
    return null;
  }
}

export function getDb(): D1Database | null {
  return getCloudflareBindings()?.DB ?? null;
}

export function getUploadsBucket(): R2Bucket | null {
  return getCloudflareBindings()?.UPLOADS ?? null;
}

export function isD1Enabled(): boolean {
  return !!getDb();
}
