"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import ButtonUI from "@/components/ui/shadcn/button";
import Input from "@/components/ui/shadcn/input";
import type { PublicUser, UserRole } from "@/lib/auth/types";

type FormMode = "create" | "edit";

export default function UserManagement({ initialUsers }: { initialUsers: PublicUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [mode, setMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("member");
  const [active, setActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const editingUser = useMemo(
    () => users.find((user) => user.id === editingId) || null,
    [users, editingId]
  );

  const resetForm = () => {
    setMode("create");
    setEditingId(null);
    setEmail("");
    setName("");
    setPassword("");
    setRole("member");
    setActive(true);
  };

  const startEdit = (user: PublicUser) => {
    setMode("edit");
    setEditingId(user.id);
    setEmail(user.email);
    setName(user.name);
    setPassword("");
    setRole(user.role);
    setActive(user.active);
  };

  const refreshUsers = async () => {
    const response = await fetch("/api/admin/users");
    const data = await response.json();
    if (response.ok) setUsers(data.users);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const isEdit = mode === "edit" && editingId;
      const response = await fetch(isEdit ? `/api/admin/users/${editingId}` : "/api/admin/users", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name,
          password: password || undefined,
          role,
          active,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menyimpan user");
      toast.success(isEdit ? "User diperbarui" : "User ditambahkan");
      resetForm();
      await refreshUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus user ini?")) return;
    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal menghapus");
      toast.success("User dihapus");
      if (editingId === id) resetForm();
      await refreshUsers();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menghapus");
    }
  };

  return (
    <div className="space-y-24">
      <section className="bg-white rounded-20 border border-border-faint p-24">
        <h2 className="text-title-h5 text-accent-black mb-16">
          {mode === "edit" ? "Edit User" : "Tambah User Baru"}
        </h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-16">
          <Field label="Nama">
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label={mode === "edit" ? "Password Baru (opsional)" : "Password"}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={mode === "create"}
            />
          </Field>
          <Field label="Role">
            <select
              className="w-full px-12 py-10 rounded-8 border border-black-alpha-8 bg-white text-body-medium"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
          {mode === "edit" && (
            <label className="flex items-center gap-8 md:col-span-2">
              <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
              <span className="text-body-medium">Akun aktif</span>
            </label>
          )}
          <div className="md:col-span-2 flex gap-8">
            <ButtonUI type="submit" variant="primary" isLoading={isSaving}>
              {mode === "edit" ? "Simpan Perubahan" : "Tambah User"}
            </ButtonUI>
            {mode === "edit" && (
              <ButtonUI type="button" variant="tertiary" onClick={resetForm}>
                Batal
              </ButtonUI>
            )}
          </div>
        </form>
      </section>

      <section className="bg-white rounded-20 border border-border-faint overflow-hidden">
        <div className="px-24 py-16 border-b border-border-faint">
          <h2 className="text-title-h5 text-accent-black">Daftar User ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black-alpha-2 text-label-small text-black-alpha-64">
              <tr>
                <th className="px-24 py-12">Nama</th>
                <th className="px-24 py-12">Email</th>
                <th className="px-24 py-12">Role</th>
                <th className="px-24 py-12">Status</th>
                <th className="px-24 py-12">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border-faint">
                  <td className="px-24 py-14 text-body-medium">{user.name}</td>
                  <td className="px-24 py-14 text-body-small text-black-alpha-64">{user.email}</td>
                  <td className="px-24 py-14">
                    <span className={`text-label-small px-8 py-4 rounded-6 ${user.role === "admin" ? "bg-heat-4 text-heat-100" : "bg-black-alpha-4 text-black-alpha-64"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-24 py-14 text-body-small">{user.active ? "Aktif" : "Nonaktif"}</td>
                  <td className="px-24 py-14">
                    <div className="flex gap-8">
                      <ButtonUI variant="secondary" onClick={() => startEdit(user)}>Edit</ButtonUI>
                      <ButtonUI variant="tertiary" onClick={() => handleDelete(user.id)}>Hapus</ButtonUI>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
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
