import { v4 as uuid } from 'uuid';
import { invitations, users } from '../data/seed.js';
import type { StoredInvitation } from '../data/seed.js';
import type { Invitation, Role } from '../data/types.js';
import { toPublicUser, createTokenResponse } from './auth-service.js';

function toPublicInvitation(inv: StoredInvitation): Invitation {
  return {
    id: inv.id,
    email: inv.email,
    role: inv.role,
    expires_at: inv.expires_at,
  };
}

export function listPendingInvitations(): Invitation[] {
  const now = new Date();
  return invitations
    .filter((inv) => !inv.used && !inv.revoked && new Date(inv.expires_at) > now)
    .map(toPublicInvitation);
}

export function createInvitation(email: string, role: Role): { invitation: Invitation; inviteToken: string } | { error: { code: string; message: string; status: number } } {
  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return { error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.', status: 409 } };
  }

  const pendingInvite = invitations.find(
    (inv) => inv.email === email && !inv.used && !inv.revoked && new Date(inv.expires_at) > new Date(),
  );
  if (pendingInvite) {
    return { error: { code: 'INVITATION_PENDING', message: 'An invitation for this email is already pending.', status: 409 } };
  }

  const token = uuid();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  const invitation: StoredInvitation = {
    id: uuid(),
    email,
    role,
    token,
    expires_at: expiresAt.toISOString(),
    used: false,
    revoked: false,
  };

  invitations.push(invitation);

  return { invitation: toPublicInvitation(invitation), inviteToken: token };
}

export function revokeInvitation(id: string): boolean {
  const invitation = invitations.find((inv) => inv.id === id);
  if (!invitation) return false;

  invitation.revoked = true;
  return true;
}

export function lookupInvitation(token: string): { email: string; role: Role } | { error: { code: string; message: string; status: number } } {
  const invitation = invitations.find((inv) => inv.token === token);

  if (!invitation) {
    return { error: { code: 'INVITATION_NOT_FOUND', message: 'Invitation not found.', status: 404 } };
  }

  if (invitation.used) {
    return { error: { code: 'INVITATION_USED', message: 'This invitation has already been used.', status: 410 } };
  }

  if (invitation.revoked) {
    return { error: { code: 'INVITATION_REVOKED', message: 'This invitation has been revoked.', status: 410 } };
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return { error: { code: 'INVITATION_EXPIRED', message: 'This invitation has expired.', status: 410 } };
  }

  return { email: invitation.email, role: invitation.role };
}

export function acceptInvitation(
  token: string,
  firstName: string,
  lastName: string,
  password: string,
): { user: ReturnType<typeof toPublicUser>; tokens: ReturnType<typeof createTokenResponse> } | { error: { code: string; message: string; status: number } } {
  const lookupResult = lookupInvitation(token);
  if ('error' in lookupResult) return lookupResult;

  const invitation = invitations.find((inv) => inv.token === token)!;

  const newUser = {
    id: uuid(),
    first_name: firstName,
    last_name: lastName,
    email: invitation.email,
    role: invitation.role,
    status: 'active' as const,
    created_at: new Date().toISOString(),
    password,
  };

  users.push(newUser);
  invitation.used = true;

  const tokens = createTokenResponse(newUser);
  return { user: toPublicUser(newUser), tokens };
}
