import { randomUUID } from 'crypto';
import type { D1Database } from '@cloudflare/workers-types';
import type { PublicUser, SessionUser, UserRole } from '@/lib/auth/types';
import { hashPassword, verifyPassword } from '@/lib/admin/password';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/admin/settings';
import { getDb } from '@/lib/db/cloudflare';

interface DbUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  password_hash: string;
  active: number;
  created_at: string;
  updated_at: string;
}

function requireDb(): D1Database {
  const db = getDb();
  if (!db) throw new Error('D1 database not available');
  return db;
}

function toPublicUser(row: DbUser): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    active: row.active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toSessionUser(row: DbUser): SessionUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  };
}

async function seedUsers(db: D1Database) {
  const now = new Date().toISOString();
  const users = [
    {
      id: randomUUID(),
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      name: process.env.ADMIN_NAME || 'Admin',
      role: 'admin' as const,
      password_hash: hashPassword(process.env.ADMIN_PASSWORD || 'admin123'),
      active: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: randomUUID(),
      email: process.env.MEMBER_EMAIL || 'member@example.com',
      name: process.env.MEMBER_NAME || 'Member',
      role: 'member' as const,
      password_hash: hashPassword(process.env.MEMBER_PASSWORD || 'password123'),
      active: 1,
      created_at: now,
      updated_at: now,
    },
  ];

  for (const user of users) {
    await db
      .prepare(
        `INSERT INTO users (id, email, name, role, password_hash, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        user.id,
        user.email,
        user.name,
        user.role,
        user.password_hash,
        user.active,
        user.created_at,
        user.updated_at
      )
      .run();
  }
}

async function listDbUsers(db: D1Database): Promise<DbUser[]> {
  const result = await db.prepare('SELECT * FROM users ORDER BY created_at ASC').all<DbUser>();
  let users = result.results ?? [];
  if (users.length === 0) {
    await seedUsers(db);
    const seeded = await db.prepare('SELECT * FROM users ORDER BY created_at ASC').all<DbUser>();
    users = seeded.results ?? [];
  }
  return users;
}

export async function authenticateUser(email: string, password: string): Promise<SessionUser | null> {
  const db = requireDb();
  const normalizedEmail = email.trim().toLowerCase();
  const row = await db
    .prepare('SELECT * FROM users WHERE lower(email) = ? AND active = 1 LIMIT 1')
    .bind(normalizedEmail)
    .first<DbUser>();

  if (!row || !verifyPassword(password, row.password_hash)) return null;
  return toSessionUser(row);
}

export async function listUsers(): Promise<PublicUser[]> {
  const users = await listDbUsers(requireDb());
  return users.map(toPublicUser);
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}): Promise<PublicUser> {
  const db = requireDb();
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = await db
    .prepare('SELECT id FROM users WHERE lower(email) = ? LIMIT 1')
    .bind(normalizedEmail)
    .first();

  if (existing) throw new Error('Email sudah terdaftar');

  const now = new Date().toISOString();
  const user: DbUser = {
    id: randomUUID(),
    email: input.email.trim(),
    name: input.name.trim(),
    role: input.role,
    password_hash: hashPassword(input.password),
    active: 1,
    created_at: now,
    updated_at: now,
  };

  await db
    .prepare(
      `INSERT INTO users (id, email, name, role, password_hash, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      user.id,
      user.email,
      user.name,
      user.role,
      user.password_hash,
      user.active,
      user.created_at,
      user.updated_at
    )
    .run();

  return toPublicUser(user);
}

export async function updateUser(
  id: string,
  input: Partial<{
    email: string;
    name: string;
    password: string;
    role: UserRole;
    active: boolean;
  }>
): Promise<PublicUser> {
  const db = requireDb();
  const current = await db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').bind(id).first<DbUser>();
  if (!current) throw new Error('User tidak ditemukan');

  let email = current.email;
  let name = current.name;
  let role = current.role;
  let active = current.active;
  let password_hash = current.password_hash;

  if (input.email) {
    const normalizedEmail = input.email.trim().toLowerCase();
    const duplicate = await db
      .prepare('SELECT id FROM users WHERE lower(email) = ? AND id != ? LIMIT 1')
      .bind(normalizedEmail, id)
      .first();
    if (duplicate) throw new Error('Email sudah terdaftar');
    email = input.email.trim();
  }
  if (input.name) name = input.name.trim();
  if (input.role) role = input.role;
  if (typeof input.active === 'boolean') active = input.active ? 1 : 0;
  if (input.password) password_hash = hashPassword(input.password);

  const updated_at = new Date().toISOString();

  await db
    .prepare(
      `UPDATE users SET email = ?, name = ?, role = ?, active = ?, password_hash = ?, updated_at = ? WHERE id = ?`
    )
    .bind(email, name, role, active, password_hash, updated_at, id)
    .run();

  const activeAdmin = await db
    .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND active = 1")
    .first<{ count: number }>();
  if ((activeAdmin?.count ?? 0) === 0) {
    throw new Error('Minimal harus ada satu admin aktif');
  }

  return toPublicUser({
    id,
    email,
    name,
    role,
    password_hash,
    active,
    created_at: current.created_at,
    updated_at,
  });
}

export async function deleteUser(id: string): Promise<void> {
  const db = requireDb();
  const user = await db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').bind(id).first<DbUser>();
  if (!user) throw new Error('User tidak ditemukan');

  const activeAdmins = await db
    .prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin' AND active = 1 AND id != ?")
    .bind(id)
    .first<{ count: number }>();

  if (user.role === 'admin' && user.active === 1 && (activeAdmins?.count ?? 0) === 0) {
    throw new Error('Tidak dapat menghapus admin terakhir');
  }

  await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const db = requireDb();
  const row = await db.prepare('SELECT data FROM site_settings WHERE id = 1 LIMIT 1').first<{ data: string }>();
  if (!row?.data) {
    const defaults = { ...DEFAULT_SITE_SETTINGS, updatedAt: new Date().toISOString() };
    await db.prepare('INSERT INTO site_settings (id, data) VALUES (1, ?)').bind(JSON.stringify(defaults)).run();
    return defaults;
  }
  return { ...DEFAULT_SITE_SETTINGS, ...(JSON.parse(row.data) as SiteSettings) };
}

export async function updateSiteSettings(
  input: Partial<Omit<SiteSettings, 'updatedAt'>>
): Promise<SiteSettings> {
  const db = requireDb();
  const current = await getSiteSettings();
  const next: SiteSettings = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  await db
    .prepare(
      `INSERT INTO site_settings (id, data) VALUES (1, ?)
       ON CONFLICT(id) DO UPDATE SET data = excluded.data`
    )
    .bind(JSON.stringify(next))
    .run();

  return next;
}

export async function getAdminStats() {
  const users = await listUsers();
  const settings = await getSiteSettings();
  return {
    totalUsers: users.length,
    activeUsers: users.filter((user) => user.active).length,
    adminCount: users.filter((user) => user.role === 'admin').length,
    maintenanceMode: settings.maintenanceMode,
    defaultModel: settings.defaultModel,
    visualTheme: settings.visualTheme,
    colorMode: settings.colorMode,
  };
}
