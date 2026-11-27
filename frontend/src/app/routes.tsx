import { Routes, Route, Navigate } from 'react-router';
import ProtectedRoute from '../auth/ProtectedRoute';
import AdminRoute from '../auth/AdminRoute';
import GuestRoute from '../auth/GuestRoute';
import Layout from './Layout';
import { SignInPage } from '../features/sign-in';
import { UserListPage } from '../features/users';
import { ProfilePage, ChangePasswordPage } from '../features/profile';
import { InvitationsPage, AcceptInvitationPage } from '../features/invitations';

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/signin"
        element={
          <GuestRoute>
            <SignInPage />
          </GuestRoute>
        }
      />

      <Route path="/invite" element={<AcceptInvitationPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/profile" replace />} />

        <Route
          path="users"
          element={
            <AdminRoute>
              <UserListPage />
            </AdminRoute>
          }
        />

        <Route
          path="invitations"
          element={
            <AdminRoute>
              <InvitationsPage />
            </AdminRoute>
          }
        />

        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
