import { useState } from 'react';
import { Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, KeyRound } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { updateProfile } from '../../api/users';
import type { ApiError } from '../../types';
import axios from 'axios';

const profileSchema = z.object({
  first_name: z.string().min(1, 'Required').max(50, 'Max 50 characters'),
  last_name: z.string().min(1, 'Required').max(50, 'Max 50 characters'),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
    },
  });

  async function onSubmit(data: ProfileForm) {
    setApiError(null);
    setSuccess(false);
    try {
      const updated = await updateProfile(data);
      updateUser(updated);
      setSuccess(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiErr = err.response?.data as ApiError | undefined;
        setApiError(apiErr?.error?.message || 'Failed to update profile.');
      } else {
        setApiError('An unexpected error occurred.');
      }
    }
  }

  if (!user) return null;

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">My Profile</h2>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {apiError}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            Profile updated successfully.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="profile-email"
              type="text"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="profile-first-name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              id="profile-first-name"
              {...register('first_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>}
          </div>

          <div>
            <label htmlFor="profile-last-name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              id="profile-last-name"
              {...register('last_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <p className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500 capitalize">
              {user.role}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              to="/change-password"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <KeyRound className="w-4 h-4" />
              Change Password
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
