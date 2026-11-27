import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as invitationsApi from '../../api/invitations';
import type { InviteUserRequest } from '../../types';

export function useInvitations() {
  return useQuery({
    queryKey: ['invitations'],
    queryFn: invitationsApi.listInvitations,
  });
}

export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: InviteUserRequest) => invitationsApi.createInvitation(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

export function useRevokeInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => invitationsApi.revokeInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}
