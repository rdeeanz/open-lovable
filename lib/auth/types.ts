export type UserRole = 'admin' | 'member';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface SessionPayload extends SessionUser {
  exp: number;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
