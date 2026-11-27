import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Trash2, Copy, Check } from 'lucide-react';
import { useInvitations, useCreateInvitation, useRevokeInvitation } from './hooks';
import type { ApiError } from '../../types';
import axios from 'axios';

const inviteSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  role: z.enum(['admin', 'member']),
});

type InviteForm = z.infer<typeof inviteSchema>;

export default function InvitationsPage() {
  const { data: invitations, isLoading, error } = useInvitations();
  const createInvitation = useCreateInvitation();
  const revokeInvitation = useRevokeInvitation();
  const [apiError, setApiError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'member' },
  });

  async function onSubmit(data: InviteForm) {
    setApiError(null);
    setInviteSuccess(null);
    try {
      await createInvitation.mutateAsync(data);
      setInviteSuccess(`Invitation sent to ${data.email}. Use the copy button to get the invite link.`);
      reset();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiErr = err.response?.data as ApiError | undefined;
        setApiError(apiErr?.error?.message || 'Failed to send invitation.');
      } else {
        setApiError('An unexpected error occurred.');
      }
    }
  }

  function copyInviteLink(token: string) {
    const link = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedId(token);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Invitations</h2>

      {/* Invite Form */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Invite User</h3>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {apiError}
          </div>
        )}
        {inviteSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {inviteSuccess}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="email"
              placeholder="Email address"
              {...register('email')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          <select
            {...register('role')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Sending...' : 'Send Invite'}
          </button>
        </form>
      </div>

      {/* Pending Invitations */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pending Invitations</h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-red-700">Failed to load invitations.</div>
        ) : !invitations || invitations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No pending invitations.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Expires</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invitations.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{inv.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          inv.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {inv.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(inv.expires_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          title="Copy invite link"
                          onClick={() => copyInviteLink(inv.token)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                        >
                          {copiedId === inv.token ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          title="Revoke invitation"
                          onClick={() => revokeInvitation.mutate(inv.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
