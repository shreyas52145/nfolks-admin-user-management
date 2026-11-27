import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useUpdateUser } from './hooks';
import type { User, ApiError } from '../../types';
import axios from 'axios';

const editUserSchema = z.object({
  first_name: z.string().min(1, 'Required').max(50, 'Max 50 characters'),
  last_name: z.string().min(1, 'Required').max(50, 'Max 50 characters'),
  role: z.enum(['admin', 'member']),
});

type EditUserForm = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  user: User;
  currentUserId: string;
  onClose: () => void;
}

export default function EditUserDialog({ user, currentUserId, onClose }: EditUserDialogProps) {
  const updateUser = useUpdateUser();
  const [apiError, setApiError] = useState<string | null>(null);
  const isSelf = user.id === currentUserId;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditUserForm>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    },
  });

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  async function onSubmit(data: EditUserForm) {
    setApiError(null);
    try {
      await updateUser.mutateAsync({ id: user.id, updates: data });
      onClose();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiErr = err.response?.data as ApiError | undefined;
        setApiError(apiErr?.error?.message || 'Failed to update user.');
      } else {
        setApiError('An unexpected error occurred.');
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {apiError && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="edit-email"
              type="text"
              value={user.email}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500"
            />
          </div>

          <div>
            <label htmlFor="edit-first-name" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              id="edit-first-name"
              {...register('first_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>}
          </div>

          <div>
            <label htmlFor="edit-last-name" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              id="edit-last-name"
              {...register('last_name')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
          </div>

          <div>
            <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              id="edit-role"
              {...register('role')}
              disabled={isSelf}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
            {isSelf && <p className="mt-1 text-xs text-gray-500">You cannot change your own role.</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
