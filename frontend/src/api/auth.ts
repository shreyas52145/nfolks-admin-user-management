import apiClient from './client';
import type { SignInResponse, User } from '../types';

export async function signIn(email: string, password: string): Promise<SignInResponse> {
  const { data } = await apiClient.post<SignInResponse>('/auth/signin', { email, password });
  return data;
}

export async function signOut(refreshToken: string): Promise<void> {
  await apiClient.post('/auth/signout', { refresh_token: refreshToken }, {
    headers: { 'Skip-Auth': 'true' },
  });
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me');
  return data;
}
