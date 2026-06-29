"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SITE_SETTINGS, type PublicSiteSettings } from "@/lib/admin/settings";

export function usePublicSiteSettings() {
  const [settings, setSettings] = useState<PublicSiteSettings>({
    siteName: DEFAULT_SITE_SETTINGS.siteName,
    siteDescription: DEFAULT_SITE_SETTINGS.siteDescription,
    heroTitle: DEFAULT_SITE_SETTINGS.heroTitle,
    heroSubtitle: DEFAULT_SITE_SETTINGS.heroSubtitle,
    defaultModel: DEFAULT_SITE_SETTINGS.defaultModel,
    maintenanceMode: DEFAULT_SITE_SETTINGS.maintenanceMode,
    allowPublicGeneration: DEFAULT_SITE_SETTINGS.allowPublicGeneration,
    visualTheme: DEFAULT_SITE_SETTINGS.visualTheme,
    colorMode: DEFAULT_SITE_SETTINGS.colorMode,
    logoUrl: DEFAULT_SITE_SETTINGS.logoUrl,
    logoText: DEFAULT_SITE_SETTINGS.logoText,
    showBrandIcon: DEFAULT_SITE_SETTINGS.showBrandIcon,
    showLogo: DEFAULT_SITE_SETTINGS.showLogo,
    showHeaderCta: DEFAULT_SITE_SETTINGS.showHeaderCta,
    showHeroBadge: DEFAULT_SITE_SETTINGS.showHeroBadge,
    showHeroPoweredBy: DEFAULT_SITE_SETTINGS.showHeroPoweredBy,
    headerCtaText: DEFAULT_SITE_SETTINGS.headerCtaText,
    headerCtaTextMobile: DEFAULT_SITE_SETTINGS.headerCtaTextMobile,
    headerCtaUrl: DEFAULT_SITE_SETTINGS.headerCtaUrl,
    heroBadgeText: DEFAULT_SITE_SETTINGS.heroBadgeText,
    heroBadgeUrl: DEFAULT_SITE_SETTINGS.heroBadgeUrl,
    heroPoweredByText: DEFAULT_SITE_SETTINGS.heroPoweredByText,
    heroPoweredByUrl: DEFAULT_SITE_SETTINGS.heroPoweredByUrl,
  });
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/site-settings");
      if (!res.ok) return;
      const data = (await res.json()) as PublicSiteSettings;
      setSettings((prev) => ({ ...prev, ...data }));
    } catch {
      // keep defaults
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => {
      refresh();
    };
    window.addEventListener("site-settings-updated", handler);
    return () => window.removeEventListener("site-settings-updated", handler);
  }, [refresh]);

  return { settings, loaded, refresh };
}
