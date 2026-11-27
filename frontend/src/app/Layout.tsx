import { NavLink, Outlet, useNavigate } from 'react-router';
import { useAuth } from '../auth/AuthContext';
import {
  Users,
  UserCircle,
  Mail,
  LogOut,
  Shield,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, role, signOut, sessionMessage, clearSessionMessage } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    navigate('/signin', { replace: true });
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      {sessionMessage && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200 px-4 py-3 flex items-center justify-between">
          <span className="text-yellow-800 text-sm">{sessionMessage}</span>
          <button onClick={clearSessionMessage} className="text-yellow-600 hover:text-yellow-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex">
        {/* Mobile menu button */}
        <button
          className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white rounded-md shadow-sm border border-gray-200"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-64 bg-white border-r border-gray-200 flex flex-col transition-transform lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-lg font-semibold text-gray-900">NFolks Admin</h1>
            <p className="text-xs text-gray-500 mt-1">User Management</p>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {role === 'admin' && (
              <>
                <NavLink to="/users" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                  <Users className="w-4 h-4" />
                  Users
                </NavLink>
                <NavLink to="/invitations" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
                  <Mail className="w-4 h-4" />
                  Invitations
                </NavLink>
              </>
            )}
            <NavLink to="/profile" className={navLinkClass} onClick={() => setSidebarOpen(false)}>
              <UserCircle className="w-4 h-4" />
              My Profile
            </NavLink>
          </nav>

          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.first_name} {user?.last_name}
                </p>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500 capitalize">{role}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:ml-0">
          <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
