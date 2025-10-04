import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  redirectTo = '/login'
}: ProtectedRouteProps) {
  const { isAuthenticated, loading, sessionRestoring } = useAuth();
  const location = useLocation();

  console.log('[ProtectedRoute] Checking auth, path:', location.pathname, {
    isAuthenticated,
    loading,
    sessionRestoring
  });

  // Show loading state while checking authentication or restoring session
  if (loading || sessionRestoring) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">
            {sessionRestoring ? 'Restoring quantum connection...' : 'Entering the quantum realm...'}
          </p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Save the attempted location for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: string;
}

export function RoleProtectedRoute({ 
  children, 
  requiredRoles = [],
  fallback = '/dashboard' 
}: RoleProtectedRouteProps) {
  const { user } = useAuth();
  
  // If no roles required, just check authentication
  if (requiredRoles.length === 0) {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }
  
  // Check if user has required roles
  // For now, assume all authenticated users can access basic admin features
  // TODO: Implement proper role system when User interface is updated
  const hasRequiredRole = requiredRoles.length === 0 || user?.id;
  
  if (!hasRequiredRole) {
    return <Navigate to={fallback} replace />;
  }
  
  return <ProtectedRoute>{children}</ProtectedRoute>;
}