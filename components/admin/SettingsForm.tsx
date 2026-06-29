"use client";

import { FormEvent, useRef, useState } from "react";
import { toast } from "sonner";
import ButtonUI from "@/components/ui/shadcn/button";
import Input from "@/components/ui/shadcn/input";
import { appConfig } from "@/config/app.config";
import type { SiteSettings } from "@/lib/admin/settings";
import { COLOR_MODE_LABELS, VISUAL_THEME_LABELS } from "@/lib/theme/types";
import type { ColorMode, VisualTheme } from "@/lib/theme/types";

export default function SettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);


  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload-logo", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal mengunggah logo");
      setSettings((prev) => ({ ...prev, logoUrl: data.logoUrl }));
      window.dispatchEvent(new Event("site-settings-updated"));
      toast.success("Logo berhasil diunggah");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengunggah logo");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan");
      setSettings(data.settings);
      window.dispatchEvent(new Event("site-settings-updated"));
      toast.success("Pengaturan website berhasil disimpan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-20">
      <section className="bg-white rounded-20 border border-border-faint p-24 space-y-16">
        <h2 className="text-title-h5 text-accent-black">Informasi Website</h2>
        <Field label="Nama Website">
          <Input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
        </Field>
        <Field label="Deskripsi">
          <Input value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} />
        </Field>
        <Field label="Judul Hero">
          <Input value={settings.heroTitle} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} />
        </Field>
        <Field label="Subjudul Hero">
          <Input value={settings.heroSubtitle} onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })} />
        </Field>
      </section>

      <section className="bg-white rounded-20 border border-border-faint p-24 space-y-16">
        <h2 className="text-title-h5 text-accent-black">AI & Sandbox</h2>
        <Field label="Model Default">
          <select
            className="w-full px-12 py-10 rounded-8 border border-black-alpha-8 bg-white text-body-medium"
            value={settings.defaultModel}
            onChange={(e) => setSettings({ ...settings, defaultModel: e.target.value })}
          >
            {appConfig.ai.availableModels.map((model) => (
              <option key={model} value={model}>
                {appConfig.ai.modelDisplayNames[model] || model}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sandbox Timeout (menit)">
          <Input
            type="number"
            min={5}
            max={120}
            value={settings.sandboxTimeoutMinutes}
            onChange={(e) => setSettings({ ...settings, sandboxTimeoutMinutes: Number(e.target.value) })}
          />
        </Field>
      </section>



      <section className="bg-white rounded-20 border border-border-faint p-24 space-y-16">
        <h2 className="text-title-h5 text-accent-black">Branding & Header</h2>
        <p className="text-body-small text-black-alpha-64">
          Atur logo, tombol header, badge hero, dan teks powered-by di beranda.
        </p>

        <Toggle
          label="Tampilkan Logo"
          description="Logo/teks brand di header beranda dan halaman lain"
          checked={settings.showLogo}
          onChange={(checked) => setSettings({ ...settings, showLogo: checked })}
        />

        <Field label="Logo Website">
          {settings.logoUrl ? (
            <div className="mb-12 flex items-center gap-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.logoUrl} alt="Preview logo" className="h-40 w-auto max-w-[200px] object-contain border border-border-faint rounded-8 p-8" />
              <ButtonUI
                type="button"
                variant="secondary"
                onClick={() => setSettings({ ...settings, logoUrl: "" })}
              >
                Hapus Logo
              </ButtonUI>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-8 items-center">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              onChange={handleLogoUpload}
              className="text-body-small"
            />
            {isUploadingLogo ? <span className="text-body-small text-black-alpha-64">Mengunggah...</span> : null}
          </div>
          <Input
            className="mt-8"
            value={settings.logoUrl}
            placeholder="atau URL logo (https://...)"
            onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
          />
        </Field>

        <Field label="Teks Logo (jika tanpa gambar)">
          <Input
            value={settings.logoText}
            placeholder="Kosongkan untuk logo Firecrawl bawaan"
            onChange={(e) => setSettings({ ...settings, logoText: e.target.value })}
          />
        </Field>

        <Toggle
          label="Tampilkan Ikon Brand"
          description="Ikon api di sebelah logo/teks brand"
          checked={settings.showBrandIcon}
          onChange={(checked) => setSettings({ ...settings, showBrandIcon: checked })}
        />

        <Toggle
          label="Tampilkan Tombol Header"
          description={'Tombol "Use this Template" / GitHub di header'}
          checked={settings.showHeaderCta}
          onChange={(checked) => setSettings({ ...settings, showHeaderCta: checked })}
        />

        <Field label="Tombol Header (Desktop)">
          <Input
            value={settings.headerCtaText}
            onChange={(e) => setSettings({ ...settings, headerCtaText: e.target.value })}
          />
        </Field>
        <Field label="Tombol Header (Mobile)">
          <Input
            value={settings.headerCtaTextMobile}
            onChange={(e) => setSettings({ ...settings, headerCtaTextMobile: e.target.value })}
          />
        </Field>
        <Field label="URL Tombol Header">
          <Input
            value={settings.headerCtaUrl}
            onChange={(e) => setSettings({ ...settings, headerCtaUrl: e.target.value })}
          />
        </Field>

        <Toggle
          label="Tampilkan Badge Hero"
          description={'Badge "Website Builder" di atas judul hero'}
          checked={settings.showHeroBadge}
          onChange={(checked) => setSettings({ ...settings, showHeroBadge: checked })}
        />

        <Field label="Teks Badge Hero">
          <Input
            value={settings.heroBadgeText}
            onChange={(e) => setSettings({ ...settings, heroBadgeText: e.target.value })}
          />
        </Field>
        <Field label="URL Badge Hero">
          <Input
            value={settings.heroBadgeUrl}
            placeholder="#"
            onChange={(e) => setSettings({ ...settings, heroBadgeUrl: e.target.value })}
          />
        </Field>

        <Toggle
          label="Tampilkan Powered By"
          description={'Teks "Powered by..." di bawah subjudul hero'}
          checked={settings.showHeroPoweredBy}
          onChange={(checked) => setSettings({ ...settings, showHeroPoweredBy: checked })}
        />

        <Field label="Teks Powered By">
          <Input
            value={settings.heroPoweredByText}
            onChange={(e) => setSettings({ ...settings, heroPoweredByText: e.target.value })}
          />
        </Field>
        <Field label="URL Powered By">
          <Input
            value={settings.heroPoweredByUrl}
            placeholder="#"
            onChange={(e) => setSettings({ ...settings, heroPoweredByUrl: e.target.value })}
          />
        </Field>
      </section>

      <section className="bg-white rounded-20 border border-border-faint p-24 space-y-16">
        <h2 className="text-title-h5 text-accent-black">Tema Tampilan</h2>
        <p className="text-body-small text-black-alpha-64">
          Tema Claude mengikuti panduan desain warm cream, coral, dan navy. Pengunjung dapat
          mengganti mode terang/gelap lewat tombol di header.
        </p>
        <Field label="Tema Visual">
          <div className="grid sm:grid-cols-2 gap-12">
            {(Object.keys(VISUAL_THEME_LABELS) as VisualTheme[]).map((theme) => (
              <label
                key={theme}
                className={`theme-card cursor-pointer p-16 transition-all ${
                  settings.visualTheme === theme
                    ? "ring-2 ring-[var(--heat-100)] border-[var(--heat-100)]"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="visualTheme"
                  value={theme}
                  checked={settings.visualTheme === theme}
                  onChange={() => setSettings({ ...settings, visualTheme: theme })}
                  className="sr-only"
                />
                <p className="text-label-medium text-accent-black">{VISUAL_THEME_LABELS[theme]}</p>
                {theme === "claude" ? (
                  <div className="mt-12 flex gap-8">
                    <span className="h-20 w-20 rounded-full bg-[#faf9f5] border border-[#e6dfd8]" title="Canvas" />
                    <span className="h-20 w-20 rounded-full bg-[#cc785c]" title="Primary" />
                    <span className="h-20 w-20 rounded-full bg-[#141413]" title="Ink" />
                    <span className="h-20 w-20 rounded-full bg-[#181715]" title="Dark surface" />
                  </div>
                ) : (
                  <p className="mt-8 text-body-small text-black-alpha-64">Tema oranye Firecrawl bawaan</p>
                )}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Mode Warna Default">
          <select
            className="w-full px-12 py-10 rounded-8 border border-black-alpha-8 bg-white text-body-medium"
            value={settings.colorMode}
            onChange={(e) => setSettings({ ...settings, colorMode: e.target.value as ColorMode })}
          >
            {(Object.keys(COLOR_MODE_LABELS) as ColorMode[]).map((mode) => (
              <option key={mode} value={mode}>
                {COLOR_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
          <p className="mt-8 text-body-small text-black-alpha-64">
            Default untuk pengunjung baru. Mode terang/gelap dapat diubah kapan saja via toggle di header.
          </p>
        </Field>
      </section>

      <section className="bg-white rounded-20 border border-border-faint p-24 space-y-16">
        <h2 className="text-title-h5 text-accent-black">Akses & Status</h2>
        <Toggle
          label="Mode Maintenance"
          description="Tampilkan peringatan maintenance di beranda"
          checked={settings.maintenanceMode}
          onChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
        />
        <Toggle
          label="Izinkan Generation Publik"
          description="Pengunjung dapat membuat website tanpa login"
          checked={settings.allowPublicGeneration}
          onChange={(checked) => setSettings({ ...settings, allowPublicGeneration: checked })}
        />
      </section>

      <ButtonUI type="submit" variant="primary" isLoading={isSaving} loadingLabel="Menyimpan...">
        Simpan Pengaturan
      </ButtonUI>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-label-small text-black-alpha-64 mb-8 block">{label}</label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-16 cursor-pointer">
      <div>
        <p className="text-body-medium text-accent-black">{label}</p>
        <p className="text-body-small text-black-alpha-64">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-4 h-16 w-16 accent-[var(--heat-100)]"
      />
    </label>
  );
}
