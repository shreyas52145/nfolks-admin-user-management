import { useState } from 'react';
import { Search, ChevronUp, ChevronDown, Pencil, UserX, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUsers, useDeactivateUser, useReactivateUser } from './hooks';
import EditUserDialog from './EditUserDialog';
import { useAuth } from '../../auth/AuthContext';
import type { User, Status, UserListParams } from '../../types';

export default function UserListPage() {
  const { user: currentUser } = useAuth();
  const [params, setParams] = useState<UserListParams>({
    page: 1,
    page_size: 10,
    sort: 'created_at',
    order: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, isLoading, error } = useUsers(params);
  const deactivateUser = useDeactivateUser();
  const reactivateUser = useReactivateUser();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setParams((p) => ({ ...p, search: searchInput || undefined, page: 1 }));
  }

  function handleSort(field: 'name' | 'email' | 'created_at') {
    setParams((p) => ({
      ...p,
      sort: field,
      order: p.sort === field && p.order === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  }

  function handleStatusFilter(status: Status | undefined) {
    setParams((p) => ({ ...p, status, page: 1 }));
  }

  function SortIcon({ field }: { field: string }) {
    if (params.sort !== field) return null;
    return params.order === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline" />
    ) : (
      <ChevronDown className="w-4 h-4 inline" />
    );
  }

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">User Management</h2>

      {/* Search and Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Search
          </button>
        </form>

        <select
          value={params.status || ''}
          onChange={(e) => handleStatusFilter(e.target.value as Status || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="deactivated">Deactivated</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          Failed to load users. Please try again.
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No users found.</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th
                    className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort('name')}
                  >
                    Name <SortIcon field="name" />
                  </th>
                  <th
                    className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort('email')}
                  >
                    Email <SortIcon field="email" />
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Role</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                  <th
                    className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer hover:text-gray-900"
                    onClick={() => handleSort('created_at')}
                  >
                    Created <SortIcon field="created_at" />
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            title="Edit user"
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {!isSelf && user.status === 'active' && (
                            <button
                              title="Deactivate user"
                              onClick={() => deactivateUser.mutate(user.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          )}

                          {user.status === 'deactivated' && (
                            <button
                              title="Reactivate user"
                              onClick={() => reactivateUser.mutate(user.id)}
                              className="p-1.5 text-gray-400 hover:text-green-600 rounded hover:bg-green-50"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-600">
              Showing {(data.page - 1) * data.page_size + 1}–
              {Math.min(data.page * data.page_size, data.total)} of {data.total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={data.page <= 1}
                onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) - 1 }))}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600">
                Page {data.page} of {totalPages}
              </span>
              <button
                disabled={data.page >= totalPages}
                onClick={() => setParams((p) => ({ ...p, page: (p.page || 1) + 1 }))}
                className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit User Dialog */}
      {editingUser && currentUser && (
        <EditUserDialog
          user={editingUser}
          currentUserId={currentUser.id}
          onClose={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}
