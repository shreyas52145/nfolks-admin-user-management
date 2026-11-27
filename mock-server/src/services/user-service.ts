import { users } from '../data/seed.js';
import type { StoredUser } from '../data/seed.js';
import type { User, Status } from '../data/types.js';
import { toPublicUser, revokeAllForUser } from './auth-service.js';

interface UserListParams {
  page: number;
  page_size: number;
  search?: string;
  sort?: 'name' | 'email' | 'created_at';
  order?: 'asc' | 'desc';
  status?: Status;
}

export function listUsers(params: UserListParams): { items: User[]; page: number; page_size: number; total: number } {
  let filtered = [...users];

  if (params.status) {
    filtered = filtered.filter((u) => u.status === params.status);
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter((u) =>
      u.first_name.toLowerCase().includes(q) ||
      u.last_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q),
    );
  }

  const sortField = params.sort || 'created_at';
  const order = params.order || 'desc';

  filtered.sort((a, b) => {
    let cmp = 0;
    if (sortField === 'name') {
      const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
      const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
      cmp = nameA.localeCompare(nameB);
    } else if (sortField === 'email') {
      cmp = a.email.localeCompare(b.email);
    } else {
      cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    return order === 'asc' ? cmp : -cmp;
  });

  const total = filtered.length;
  const start = (params.page - 1) * params.page_size;
  const items = filtered.slice(start, start + params.page_size).map(toPublicUser);

  return { items, page: params.page, page_size: params.page_size, total };
}

export function getUserById(id: string): User | null {
  const user = users.find((u) => u.id === id);
  return user ? toPublicUser(user) : null;
}

export function getStoredUserById(id: string): StoredUser | undefined {
  return users.find((u) => u.id === id);
}

export function updateUser(
  id: string,
  updates: { first_name?: string; last_name?: string; role?: string },
): User | null {
  const user = users.find((u) => u.id === id);
  if (!user) return null;

  if (updates.first_name !== undefined) user.first_name = updates.first_name;
  if (updates.last_name !== undefined) user.last_name = updates.last_name;
  if (updates.role !== undefined) user.role = updates.role as 'admin' | 'member';

  return toPublicUser(user);
}

export function deactivateUser(id: string): User | null {
  const user = users.find((u) => u.id === id);
  if (!user) return null;

  user.status = 'deactivated';
  revokeAllForUser(user.id);

  return toPublicUser(user);
}

export function reactivateUser(id: string): User | null {
  const user = users.find((u) => u.id === id);
  if (!user) return null;

  user.status = 'active';
  return toPublicUser(user);
}

export function updateProfile(
  userId: string,
  updates: { first_name?: string; last_name?: string },
): User | null {
  return updateUser(userId, updates);
}

export function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): { success: boolean; error?: string } {
  const user = users.find((u) => u.id === userId);
  if (!user) return { success: false, error: 'User not found.' };

  if (user.password !== currentPassword) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  user.password = newPassword;
  revokeAllForUser(userId);

  return { success: true };
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return users.find((u) => u.email === email);
}
