import apiClient from './client';
import type {
  User,
  PaginatedResponse,
  UserListParams,
  UpdateUserRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types';

export async function listUsers(params: UserListParams): Promise<PaginatedResponse<User>> {
  const { data } = await apiClient.get<PaginatedResponse<User>>('/users', { params });
  return data;
}

export async function getUser(id: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/users/${id}`);
  return data;
}

export async function updateUser(id: string, updates: UpdateUserRequest): Promise<User> {
  const { data } = await apiClient.patch<User>(`/users/${id}`, updates);
  return data;
}

export async function deactivateUser(id: string): Promise<User> {
  const { data } = await apiClient.post<User>(`/users/${id}/deactivate`);
  return data;
}

export async function reactivateUser(id: string): Promise<User> {
  const { data } = await apiClient.post<User>(`/users/${id}/reactivate`);
  return data;
}

export async function updateProfile(updates: UpdateProfileRequest): Promise<User> {
  const { data } = await apiClient.patch<User>('/users/me', updates);
  return data;
}

export async function changePassword(request: ChangePasswordRequest): Promise<void> {
  await apiClient.post('/users/me/password', request);
}
