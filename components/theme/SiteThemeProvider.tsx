"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { ThemeProvider, useTheme } from "next-themes";
import type { ColorMode, VisualTheme } from "@/lib/theme/types";

interface SiteThemeContextValue {
  visualTheme: VisualTheme;
  adminColorMode: ColorMode;
  refreshSettings: () => Promise<void>;
}

const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

export function useSiteTheme() {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) {
    throw new Error("useSiteTheme must be used within SiteThemeProvider");
  }
  return ctx;
}

function ThemeSync({ adminColorMode }: { adminColorMode: ColorMode }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    const handler = () => {
      fetch("/api/site-settings")
        .then((res) => res.json())
        .then((data) => {
          document.documentElement.setAttribute(
            "data-visual-theme",
            data.visualTheme || "default"
          );
          if (data.colorMode === "system") {
            setTheme("system");
          } else {
            setTheme(data.colorMode);
          }
        })
        .catch(() => undefined);
    };

    window.addEventListener("site-settings-updated", handler);
    return () => window.removeEventListener("site-settings-updated", handler);
  }, [setTheme]);

  useEffect(() => {
    if (adminColorMode === "system") {
      setTheme("system");
    }
  }, [adminColorMode, setTheme]);

  return null;
}

export default function SiteThemeProvider({
  children,
  initialVisualTheme,
  initialColorMode,
}: {
  children: ReactNode;
  initialVisualTheme: VisualTheme;
  initialColorMode: ColorMode;
}) {
  const [visualTheme, setVisualTheme] = useState(initialVisualTheme);
  const [adminColorMode, setAdminColorMode] = useState(initialColorMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-visual-theme", visualTheme);
  }, [visualTheme]);

  const refreshSettings = useCallback(async () => {
    const res = await fetch("/api/site-settings");
    const data = await res.json();
    setVisualTheme(data.visualTheme || "default");
    setAdminColorMode(data.colorMode || "light");
    document.documentElement.setAttribute(
      "data-visual-theme",
      data.visualTheme || "default"
    );
  }, []);

  useEffect(() => {
    const handler = () => {
      refreshSettings();
    };
    window.addEventListener("site-settings-updated", handler);
    return () => window.removeEventListener("site-settings-updated", handler);
  }, [refreshSettings]);

  return (
    <SiteThemeContext.Provider value={{ visualTheme, adminColorMode, refreshSettings }}>
      <ThemeProvider
        attribute="class"
        defaultTheme={initialColorMode}
        enableSystem={initialColorMode === "system"}
        storageKey="open-lovable-color-mode"
        disableTransitionOnChange
      >
        <ThemeSync adminColorMode={adminColorMode} />
        {children}
      </ThemeProvider>
    </SiteThemeContext.Provider>
  );
}
