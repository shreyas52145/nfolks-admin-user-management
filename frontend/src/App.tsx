import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminRoute from './auth/AdminRoute';
import GuestRoute from './auth/GuestRoute';
import Layout from './components/Layout';
import SignInPage from './features/sign-in/SignInPage';
import UserListPage from './features/users/UserListPage';
import ProfilePage from './features/profile/ProfilePage';
import ChangePasswordPage from './features/profile/ChangePasswordPage';
import InvitationsPage from './features/invitations/InvitationsPage';
import AcceptInvitationPage from './features/invitations/AcceptInvitationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route
              path="/signin"
              element={
                <GuestRoute>
                  <SignInPage />
                </GuestRoute>
              }
            />

            <Route
              path="/invite"
              element={<AcceptInvitationPage />}
            />

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
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
