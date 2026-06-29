import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin/require-admin';
import { createUser, listUsers } from '@/lib/admin/store';
import type { UserRole } from '@/lib/auth/types';

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const users = await listUsers();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email, name, password, role } = await request.json();
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Email, nama, dan password wajib diisi' }, { status: 400 });
    }
    const user = await createUser({
      email,
      name,
      password,
      role: (role === 'admin' ? 'admin' : 'member') as UserRole,
    });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal membuat user' },
      { status: 400 }
    );
  }
}
