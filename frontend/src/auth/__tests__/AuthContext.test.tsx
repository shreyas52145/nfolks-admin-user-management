import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../AuthContext';
import ProtectedRoute from '../ProtectedRoute';
import AdminRoute from '../AdminRoute';
import { clearTokens } from '../token-manager';

function renderWithProviders(ui: React.ReactNode, { route = '/' } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  clearTokens();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('ProtectedRoute', () => {
  it('redirects to signin when not authenticated', async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/signin" element={<div>Sign In Page</div>} />
      </Routes>,
    );

    await waitFor(() => {
      expect(screen.getByText('Sign In Page')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    localStorage.setItem('refresh_token', 'some-token');

    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));

    renderWithProviders(
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/signin" element={<div>Sign In</div>} />
      </Routes>,
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('redirects to signin when not authenticated', async () => {
    renderWithProviders(
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>Admin Content</div>
            </AdminRoute>
          }
        />
        <Route path="/signin" element={<div>Sign In Page</div>} />
      </Routes>,
      { route: '/admin' },
    );

    await waitFor(() => {
      expect(screen.getByText('Sign In Page')).toBeInTheDocument();
      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });
  });
});
