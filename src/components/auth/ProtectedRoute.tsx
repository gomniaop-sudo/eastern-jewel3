/**
 * Protected Route Component - Production Grade with RBAC
 */

import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { type Permission, type Role, ROUTE_PERMISSIONS } from '../../lib/rbac';
import { UnauthorizedPage } from './UnauthorizedPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  role?: Role;
  minimumRole?: Role;
}

export function ProtectedRoute({
  children,
  redirectTo = '/',
  permission,
  permissions,
  requireAll = false,
  role,
  minimumRole,
}: ProtectedRouteProps) {
  const { loading, initializing, isAuthenticated, hasPermission, hasAnyPermission, hasAllPermissions, hasRole, isAtLeast } = useAuth();
  const location = useLocation();

  if (initializing || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-luxury-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-sm bg-luxury-black border border-gold-500/30 flex items-center justify-center">
              <Shield className="w-10 h-10 text-gold-500" />
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="text-center">
            <p className="text-white font-display text-lg">Authenticating</p>
            <p className="text-gray-500 text-sm mt-1">Please wait while we verify your session...</p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-gold-500 rounded-full"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = location.pathname !== '/' ? `?redirect=${encodeURIComponent(location.pathname)}` : '';
    return <Navigate to={`${redirectTo}${redirectPath}`} replace state={{ from: location }} />;
  }

  const routePermission = ROUTE_PERMISSIONS[location.pathname];
  const requiredPermission = permission || routePermission;

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <UnauthorizedPage />;
  }

  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
    if (!hasAccess) {
      return <UnauthorizedPage />;
    }
  }

  if (role && !hasRole(role)) {
    return <UnauthorizedPage />;
  }

  if (minimumRole && !isAtLeast(minimumRole)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
