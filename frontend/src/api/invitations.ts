import apiClient from './client';
import type {
  Invitation,
  InvitationLookupResponse,
  InviteUserRequest,
  AcceptInvitationRequest,
  AcceptInvitationResponse,
} from '../types';

export async function listInvitations(): Promise<Invitation[]> {
  const { data } = await apiClient.get<Invitation[]>('/invitations');
  return data;
}

export async function createInvitation(request: InviteUserRequest): Promise<Invitation> {
  const { data } = await apiClient.post<Invitation>('/invitations', request);
  return data;
}

export async function revokeInvitation(id: string): Promise<void> {
  await apiClient.delete(`/invitations/${id}`);
}

export async function lookupInvitation(token: string): Promise<InvitationLookupResponse> {
  const { data } = await apiClient.get<InvitationLookupResponse>('/invitations/lookup', {
    params: { token },
    headers: { 'Skip-Auth': 'true' },
  });
  return data;
}

export async function acceptInvitation(request: AcceptInvitationRequest): Promise<AcceptInvitationResponse> {
  const { data } = await apiClient.post<AcceptInvitationResponse>('/invitations/accept', request, {
    headers: { 'Skip-Auth': 'true' },
  });
  return data;
}
