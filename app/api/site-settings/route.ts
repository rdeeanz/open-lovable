import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/admin/store';

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    defaultModel: settings.defaultModel,
    maintenanceMode: settings.maintenanceMode,
    allowPublicGeneration: settings.allowPublicGeneration,
  });
}
