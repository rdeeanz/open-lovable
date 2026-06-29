import AdminShell from "@/components/admin/AdminShell";
import UserManagement from "@/components/admin/UserManagement";
import { requireAdminSession } from "@/lib/admin/require-admin";
import { listUsers } from "@/lib/admin/store";

export default async function AdminUsersPage() {
  const session = await requireAdminSession();
  const users = await listUsers();

  return (
    <AdminShell activePath="/admin/users" adminName={session!.name}>
      <div className="space-y-16 mb-24">
        <h1 className="text-title-h3 text-accent-black">Kelola User</h1>
        <p className="text-body-medium text-black-alpha-64">
          Tambah, edit, atau nonaktifkan akun member dan admin.
        </p>
      </div>
      <UserManagement initialUsers={users} />
    </AdminShell>
  );
}
