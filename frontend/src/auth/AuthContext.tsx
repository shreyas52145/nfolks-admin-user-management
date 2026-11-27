import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { User, Role } from '../types';
import {
  setTokens,
  clearTokens,
  getRefreshToken,
  decodeAccessToken,
  refreshTokens,
  onTokensChanged,
} from './token-manager';
import * as authApi from '../api/auth';

interface AuthState {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionMessage: string | null;
}

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
  clearSessionMessage: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
    sessionMessage: null,
  });

  const checkRoleChange = useCallback(() => {
    const claims = decodeAccessToken();
    if (!claims) return;

    setState((prev) => {
      if (prev.role && prev.role !== claims.role) {
        return {
          ...prev,
          role: claims.role as Role,
          user: prev.user ? { ...prev.user, role: claims.role as Role } : null,
        };
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onTokensChanged(checkRoleChange);
    return unsubscribe;
  }, [checkRoleChange]);

  useEffect(() => {
    async function restoreSession() {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        await refreshTokens();
        const user = await authApi.fetchCurrentUser();
        const claims = decodeAccessToken();
        setState({
          user,
          role: (claims?.role as Role) || user.role,
          isAuthenticated: true,
          isLoading: false,
          sessionMessage: null,
        });
      } catch {
        clearTokens();
        setState({
          user: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
          sessionMessage: null,
        });
      }
    }

    restoreSession();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await authApi.signIn(email, password);
    setTokens(response.access_token, response.refresh_token);
    const claims = decodeAccessToken();
    setState({
      user: response.user,
      role: (claims?.role as Role) || response.user.role,
      isAuthenticated: true,
      isLoading: false,
      sessionMessage: null,
    });
  }, []);

  const signOut = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.signOut(refreshToken);
      } catch {
        // Sign out should succeed even if the API call fails
      }
    }
    clearTokens();
    setState({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
      sessionMessage: null,
    });
  }, []);

  const updateUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const clearSessionMessage = useCallback(() => {
    setState((prev) => ({ ...prev, sessionMessage: null }));
  }, []);

  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === 'refresh_token' && !e.newValue) {
        setState({
          user: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
          sessionMessage: 'You have been signed out in another tab.',
        });
      }
    }

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signOut,
        updateUser,
        clearSessionMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
