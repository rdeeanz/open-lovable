import { NextResponse } from 'next/server';
import { getSiteSettings } from '@/lib/admin/store';
import type { PublicSiteSettings } from '@/lib/admin/settings';

export async function GET() {
  const settings = await getSiteSettings();
  const publicSettings: PublicSiteSettings = {
    siteName: settings.siteName,
    siteDescription: settings.siteDescription,
    heroTitle: settings.heroTitle,
    heroSubtitle: settings.heroSubtitle,
    defaultModel: settings.defaultModel,
    maintenanceMode: settings.maintenanceMode,
    allowPublicGeneration: settings.allowPublicGeneration,
    visualTheme: settings.visualTheme,
    colorMode: settings.colorMode,
    logoUrl: settings.logoUrl,
    logoText: settings.logoText,
    showBrandIcon: settings.showBrandIcon,
    showLogo: settings.showLogo,
    showHeaderCta: settings.showHeaderCta,
    showHeroBadge: settings.showHeroBadge,
    showHeroPoweredBy: settings.showHeroPoweredBy,
    headerCtaText: settings.headerCtaText,
    headerCtaTextMobile: settings.headerCtaTextMobile,
    headerCtaUrl: settings.headerCtaUrl,
    heroBadgeText: settings.heroBadgeText,
    heroBadgeUrl: settings.heroBadgeUrl,
    heroPoweredByText: settings.heroPoweredByText,
    heroPoweredByUrl: settings.heroPoweredByUrl,
  };
  return NextResponse.json(publicSettings);
}
