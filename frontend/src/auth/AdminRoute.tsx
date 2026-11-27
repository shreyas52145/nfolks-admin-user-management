import { Navigate } from 'react-router';
import { useAuth } from './AuthContext';
import Spinner from '../shared/components/Spinner';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
