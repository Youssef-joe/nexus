import { useAuthStore } from '@/store/authStore';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const location = useLocation();
  const token = localStorage.getItem('auth_token');
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'user:', user, 'token:', !!token);

  useEffect(() => {
    if (token && !isAuthenticated && !user) {
      console.log('Attempting to restore auth state');
      checkAuth();
    }
  }, [token, isAuthenticated, user, checkAuth]);

  // Show loading while checking auth
  if (token && !isAuthenticated && !user) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated || !token) {
    console.log('Redirecting to login - no auth');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};