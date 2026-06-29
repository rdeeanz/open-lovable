import { appConfig } from '@/config/app.config';

export interface SiteSettings {
  siteName: string;
  siteDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  defaultModel: string;
  maintenanceMode: boolean;
  allowPublicGeneration: boolean;
  sandboxTimeoutMinutes: number;
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
  updatedAt: new Date().toISOString(),
};

export type PublicSiteSettings = Pick<
  SiteSettings,
  'siteName' | 'siteDescription' | 'heroTitle' | 'heroSubtitle' | 'defaultModel' | 'maintenanceMode' | 'allowPublicGeneration'
>;
