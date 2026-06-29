import { isD1Enabled } from '@/lib/db/cloudflare';
import * as d1Store from '@/lib/admin/store-d1';
import * as fsStore from '@/lib/admin/store-fs';

async function pickStoreBackend() {
  return isD1Enabled();
}

export async function authenticateUser(email: string, password: string) {
  return (await pickStoreBackend()) ? d1Store.authenticateUser(email, password) : fsStore.authenticateUser(email, password);
}

export async function listUsers() {
  return (await pickStoreBackend()) ? d1Store.listUsers() : fsStore.listUsers();
}

export async function createUser(input: Parameters<typeof fsStore.createUser>[0]) {
  return (await pickStoreBackend()) ? d1Store.createUser(input) : fsStore.createUser(input);
}

export async function updateUser(id: string, input: Parameters<typeof fsStore.updateUser>[1]) {
  return (await pickStoreBackend()) ? d1Store.updateUser(id, input) : fsStore.updateUser(id, input);
}

export async function deleteUser(id: string) {
  return (await pickStoreBackend()) ? d1Store.deleteUser(id) : fsStore.deleteUser(id);
}

export async function getSiteSettings() {
  return (await pickStoreBackend()) ? d1Store.getSiteSettings() : fsStore.getSiteSettings();
}

export async function updateSiteSettings(input: Parameters<typeof fsStore.updateSiteSettings>[0]) {
  return (await pickStoreBackend()) ? d1Store.updateSiteSettings(input) : fsStore.updateSiteSettings(input);
}

export async function getAdminStats() {
  return (await pickStoreBackend()) ? d1Store.getAdminStats() : fsStore.getAdminStats();
}
