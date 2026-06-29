"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import ButtonUI from "@/components/ui/shadcn/button";
import Input from "@/components/ui/shadcn/input";
import { appConfig } from "@/config/app.config";
import type { SiteSettings } from "@/lib/admin/settings";

export default function SettingsForm({ initialSettings }: { initialSettings: SiteSettings }) {
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);

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
