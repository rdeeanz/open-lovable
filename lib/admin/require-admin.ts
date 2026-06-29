import { cookies } from 'next/headers';
import type { SessionPayload } from '@/lib/auth/types';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth/session';

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session?.id || !session.role) return null;
  return session;
}

export async function requireAdminSession(): Promise<SessionPayload | null> {
  const session = await getSession();
  if (!session || session.role !== 'admin') return null;
  return session;
}
