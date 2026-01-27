import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireTester?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  requireTester = false,
}: ProtectedRouteProps) {
  const { user, loading, isAdmin, isTester } = useAuth();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-foreground/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Server-side check: Only nova@moondreams.dev can access admin routes
  if (requireAdmin && user.email !== 'nova@moondreams.dev') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-foreground/70">
            Admin dashboard is restricted to nova@moondreams.dev
          </p>
        </div>
      </div>
    );
  }

  if (requireTester && !isTester) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-foreground/70">You need tester privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
