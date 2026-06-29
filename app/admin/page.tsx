import AdminShell from "@/components/admin/AdminShell";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { getAdminStats, getSiteSettings } from "@/lib/admin/store";

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  const [stats, settings] = await Promise.all([getAdminStats(), getSiteSettings()]);

  return (
    <AdminShell activePath="/admin" adminName={session!.name}>
      <div className="space-y-24">
        <div>
          <p className="text-label-small text-heat-100 mb-8">Admin Dashboard</p>
          <h1 className="text-title-h3 text-accent-black">Ringkasan Website</h1>
          <p className="text-body-medium text-black-alpha-64 mt-8">
            Kelola pengaturan website dan user dari satu tempat.
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-16">
          <StatCard label="Total User" value={String(stats.totalUsers)} />
          <StatCard label="User Aktif" value={String(stats.activeUsers)} />
          <StatCard label="Admin" value={String(stats.adminCount)} />
          <StatCard label="Maintenance" value={stats.maintenanceMode ? "Aktif" : "Nonaktif"} />
        </div>

        <section className="bg-white rounded-20 border border-border-faint p-24">
          <h2 className="text-title-h5 text-accent-black mb-12">Pengaturan Saat Ini</h2>
          <dl className="grid md:grid-cols-2 gap-12 text-body-small">
            <Item label="Nama Website" value={settings.siteName} />
            <Item label="Model Default" value={settings.defaultModel} />
            <Item label="Generation Publik" value={settings.allowPublicGeneration ? "Diizinkan" : "Diblokir"} />
            <Item label="Sandbox Timeout" value={`${settings.sandboxTimeoutMinutes} menit`} />
          </dl>
        </section>
      </div>
    </AdminShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-20 border border-border-faint p-20">
      <p className="text-label-small text-black-alpha-64 mb-8">{label}</p>
      <p className="text-title-h4 text-accent-black">{value}</p>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-black-alpha-48">{label}</dt>
      <dd className="text-accent-black mt-4">{value}</dd>
    </div>
  );
}
