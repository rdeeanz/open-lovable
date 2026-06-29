import { appConfig } from '@/config/app.config';
import type { ColorMode, VisualTheme } from '@/lib/theme/types';

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  defaultModel: string;
  maintenanceMode: boolean;
  allowPublicGeneration: boolean;
  sandboxTimeoutMinutes: number;
  visualTheme: VisualTheme;
  colorMode: ColorMode;
  logoUrl: string;
  logoText: string;
  showBrandIcon: boolean;
  showLogo: boolean;
  showHeaderCta: boolean;
  showHeroBadge: boolean;
  showHeroPoweredBy: boolean;
  headerCtaText: string;
  headerCtaTextMobile: string;
  headerCtaUrl: string;
  heroBadgeText: string;
  heroBadgeUrl: string;
  heroPoweredByText: string;
  heroPoweredByUrl: string;
  updatedAt: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteName: 'Open Lovable',
  siteDescription: 'Re-imagine any website in seconds with AI-powered website builder.',
  heroTitle: 'Open Lovable',
  heroSubtitle: 'Re-imagine any website, in seconds.',
  defaultModel: appConfig.ai.defaultModel,
  maintenanceMode: false,
  allowPublicGeneration: true,
  sandboxTimeoutMinutes: appConfig.vercelSandbox.timeoutMinutes,
  visualTheme: 'claude',
  colorMode: 'light',
  logoUrl: '',
  logoText: '',
  showBrandIcon: true,
  showLogo: true,
  showHeaderCta: true,
  showHeroBadge: true,
  showHeroPoweredBy: true,
  headerCtaText: 'Use this Template',
  headerCtaTextMobile: 'GitHub',
  headerCtaUrl: 'https://github.com/mendableai/open-lovable',
  heroBadgeText: 'Website Builder',
  heroBadgeUrl: '#',
  heroPoweredByText: 'Powered by Firecrawl.',
  heroPoweredByUrl: '#',
  updatedAt: new Date().toISOString(),
};

export type PublicSiteSettings = Pick<
  SiteSettings,
  'siteName' | 'siteDescription' | 'heroTitle' | 'heroSubtitle' | 'defaultModel' | 'maintenanceMode' | 'allowPublicGeneration' | 'visualTheme' | 'colorMode' | 'logoUrl' | 'logoText' | 'showBrandIcon' | 'showLogo' | 'showHeaderCta' | 'showHeroBadge' | 'showHeroPoweredBy' | 'headerCtaText' | 'headerCtaTextMobile' | 'headerCtaUrl' | 'heroBadgeText' | 'heroBadgeUrl' | 'heroPoweredByText' | 'heroPoweredByUrl'
>;
