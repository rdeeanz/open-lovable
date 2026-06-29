import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono, Roboto_Mono } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import SiteThemeProvider from "@/components/theme/SiteThemeProvider";
import { getSiteSettings } from "@/lib/admin/store";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata: Metadata = {
  title: "Open Lovable v3",
  description: "Re-imagine any website in seconds with AI-powered website builder.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-visual-theme={settings.visualTheme}
    >
      <body
        className={`${inter.variable} ${cormorant.variable} ${jetbrainsMono.variable} ${geistSans.variable} ${geistMono.variable} ${robotoMono.variable} font-sans`}
      >
        <SiteThemeProvider
          initialVisualTheme={settings.visualTheme}
          initialColorMode={settings.colorMode}
        >
          {children}
          <Toaster position="top-center" richColors />
        </SiteThemeProvider>
      </body>
    </html>
  );
}
