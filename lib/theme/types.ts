export type VisualTheme = 'default' | 'claude';
export type ColorMode = 'light' | 'dark' | 'system';

export const VISUAL_THEME_LABELS: Record<VisualTheme, string> = {
  default: 'Default (Firecrawl)',
  claude: 'Claude',
};

export const COLOR_MODE_LABELS: Record<ColorMode, string> = {
  light: 'Terang',
  dark: 'Gelap',
  system: 'Sistem',
};
