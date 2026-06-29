import type { SessionUser } from '@/lib/auth/types';
import { authenticateUser as authenticateStoredUser } from '@/lib/admin/store';

export async function validateCredentials(
  email: string,
  password: string
): Promise<SessionUser | null> {
  return authenticateStoredUser(email, password);
}
