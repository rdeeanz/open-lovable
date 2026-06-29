import AdminShell from "@/components/admin/AdminShell";
import SettingsForm from "@/components/admin/SettingsForm";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { getSiteSettings } from "@/lib/admin/store";

export default async function AdminSettingsPage() {
  const session = await requireAdminSession();
  const settings = await getSiteSettings();

  return (
    <AdminShell activePath="/admin/settings" adminName={session!.name}>
      <div className="space-y-16 mb-24">
        <h1 className="text-title-h3 text-accent-black">Pengaturan Website</h1>
        <p className="text-body-medium text-black-alpha-64">
          Atur branding, model AI default, dan kebijakan akses website.
        </p>
      </div>
      <SettingsForm initialSettings={settings} />
    </AdminShell>
  );
}
