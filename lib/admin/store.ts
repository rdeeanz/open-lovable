import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import type { PublicUser, SessionUser, UserRole } from '@/lib/auth/types';
import { hashPassword, verifyPassword } from '@/lib/admin/password';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/admin/settings';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'site-settings.json');

interface StoredUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersFile {
  users: StoredUser[];
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

function toPublicUser(user: StoredUser): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    active: user.active,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function toSessionUser(user: StoredUser): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

async function seedUsers(): Promise<UsersFile> {
  const now = new Date().toISOString();
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin';
  const memberEmail = process.env.MEMBER_EMAIL || 'member@example.com';
  const memberPassword = process.env.MEMBER_PASSWORD || 'password123';
  const memberName = process.env.MEMBER_NAME || 'Member';

  return {
    users: [
      {
        id: randomUUID(),
        email: adminEmail,
        name: adminName,
        role: 'admin',
        passwordHash: hashPassword(adminPassword),
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: randomUUID(),
        email: memberEmail,
        name: memberName,
        role: 'member',
        passwordHash: hashPassword(memberPassword),
        active: true,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

async function readUsersFile(): Promise<UsersFile> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(raw) as UsersFile;
  } catch {
    const seeded = await seedUsers();
    await fs.writeFile(USERS_FILE, JSON.stringify(seeded, null, 2));
    return seeded;
  }
}

async function writeUsersFile(data: UsersFile) {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(data, null, 2));
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const { users } = await readUsersFile();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail && entry.active
  );
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return toSessionUser(user);
}

export async function listUsers(): Promise<PublicUser[]> {
  const { users } = await readUsersFile();
  return users.map(toPublicUser);
}

export async function createUser(input: {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}): Promise<PublicUser> {
  const data = await readUsersFile();
  const normalizedEmail = input.email.trim().toLowerCase();
  if (data.users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Email sudah terdaftar');
  }

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: randomUUID(),
    email: input.email.trim(),
    name: input.name.trim(),
    role: input.role,
    passwordHash: hashPassword(input.password),
    active: true,
    createdAt: now,
    updatedAt: now,
  };
  data.users.push(user);
  await writeUsersFile(data);
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
  const data = await readUsersFile();
  const index = data.users.findIndex((user) => user.id === id);
  if (index === -1) throw new Error('User tidak ditemukan');

  const current = data.users[index];
  if (input.email) {
    const normalizedEmail = input.email.trim().toLowerCase();
    if (
      data.users.some(
        (user, userIndex) =>
          userIndex !== index && user.email.toLowerCase() === normalizedEmail
      )
    ) {
      throw new Error('Email sudah terdaftar');
    }
    current.email = input.email.trim();
  }
  if (input.name) current.name = input.name.trim();
  if (input.role) current.role = input.role;
  if (typeof input.active === 'boolean') current.active = input.active;
  if (input.password) current.passwordHash = hashPassword(input.password);

  current.updatedAt = new Date().toISOString();
  data.users[index] = current;

  const activeAdminCount = data.users.filter(
    (user) => user.role === 'admin' && user.active
  ).length;
  if (activeAdminCount === 0) {
    throw new Error('Minimal harus ada satu admin aktif');
  }
  await writeUsersFile(data);
  return toPublicUser(current);
}

export async function deleteUser(id: string): Promise<void> {
  const data = await readUsersFile();
  const user = data.users.find((entry) => entry.id === id);
  if (!user) throw new Error('User tidak ditemukan');

  const activeAdmins = data.users.filter(
    (entry) => entry.role === 'admin' && entry.active && entry.id !== id
  );
  if (user.role === 'admin' && user.active && activeAdmins.length === 0) {
    throw new Error('Tidak dapat menghapus admin terakhir');
  }

  data.users = data.users.filter((entry) => entry.id !== id);
  await writeUsersFile(data);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf8');
    return { ...DEFAULT_SITE_SETTINGS, ...(JSON.parse(raw) as SiteSettings) };
  } catch {
    const defaults = { ...DEFAULT_SITE_SETTINGS, updatedAt: new Date().toISOString() };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaults, null, 2));
    return defaults;
  }
}

export async function updateSiteSettings(
  input: Partial<Omit<SiteSettings, 'updatedAt'>>
): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const next: SiteSettings = {
    ...current,
    ...input,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(next, null, 2));
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
  };
}
