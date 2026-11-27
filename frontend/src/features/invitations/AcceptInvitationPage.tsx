import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { lookupInvitation, acceptInvitation } from '../../api/invitations';
import { setTokens } from '../../auth/token-manager';
import type { ApiError } from '../../types';
import axios from 'axios';

const acceptSchema = z.object({
  first_name: z.string().min(1, 'Required').max(50, 'Max 50 characters'),
  last_name: z.string().min(1, 'Required').max(50, 'Max 50 characters'),
  password: z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[a-zA-Z]/, 'Must contain at least one letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type AcceptForm = z.infer<typeof acceptSchema>;

export default function AcceptInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState<string | null>(null);
  const [inviteRole, setInviteRole] = useState<string | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AcceptForm>({
    resolver: zodResolver(acceptSchema),
  });

  useEffect(() => {
    async function lookup() {
      if (!token) {
        setLookupError('No invitation token provided.');
        setLoading(false);
        return;
      }

      try {
        const result = await lookupInvitation(token);
        setInviteEmail(result.email);
        setInviteRole(result.role);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const apiErr = err.response?.data as ApiError | undefined;
          setLookupError(apiErr?.error?.message || 'Invalid invitation.');
        } else {
          setLookupError('Failed to look up invitation.');
        }
      } finally {
        setLoading(false);
      }
    }

    lookup();
  }, [token]);

  async function onSubmit(data: AcceptForm) {
    if (!token) return;
    setApiError(null);
    try {
      const response = await acceptInvitation({
        token,
        first_name: data.first_name,
        last_name: data.last_name,
        password: data.password,
      });
      setTokens(response.access_token, response.refresh_token);
      window.location.href = '/';
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiErr = err.response?.data as ApiError | undefined;
        setApiError(apiErr?.error?.message || 'Failed to accept invitation.');
      } else {
        setApiError('An unexpected error occurred.');
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (lookupError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{lookupError}</p>
          <button
            onClick={() => navigate('/signin')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Accept Invitation</h1>
            <p className="text-gray-500 mt-1">Set up your account</p>
          </div>

          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <p className="text-blue-800">
              You&apos;ve been invited as <strong className="capitalize">{inviteRole}</strong> with
              email <strong>{inviteEmail}</strong>.
            </p>
          </div>

          {apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="accept-first-name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                id="accept-first-name"
                {...register('first_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>}
            </div>

            <div>
              <label htmlFor="accept-last-name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                id="accept-last-name"
                {...register('last_name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
            </div>

            <div>
              <label htmlFor="accept-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="accept-password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="accept-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                id="accept-confirm"
                type="password"
                autoComplete="new-password"
                {...register('confirm_password')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {errors.confirm_password && <p className="mt-1 text-sm text-red-600">{errors.confirm_password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
