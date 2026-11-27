import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminRoute from './auth/AdminRoute';
import GuestRoute from './auth/GuestRoute';
import Layout from './components/Layout';
import SignInPage from './features/sign-in/SignInPage';
import UserListPage from './features/users/UserListPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function PlaceholderPage({ title }: { title: string }) {
  return <h2 className="text-xl font-semibold text-gray-800">{title}</h2>;
}

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
              element={<PlaceholderPage title="Accept Invitation" />}
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
                    <PlaceholderPage title="Invitations" />
                  </AdminRoute>
                }
              />

              <Route path="profile" element={<PlaceholderPage title="My Profile" />} />
              <Route path="change-password" element={<PlaceholderPage title="Change Password" />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
