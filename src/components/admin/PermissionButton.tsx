/**
 * Permission Button Component
 */

import { forwardRef } from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { type Permission } from '../../lib/rbac';

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  reason?: string;
  children: React.ReactNode;
}

export const PermissionButton = forwardRef<HTMLButtonElement, PermissionButtonProps>(
  ({ permission, permissions, requireAll = false, reason, children, disabled, className = '', title, ...props }, ref) => {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

    let isAuthorized = true;
    if (permission) {
      isAuthorized = hasPermission(permission);
    }
    if (permissions && permissions.length > 0) {
      isAuthorized = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
    }

    const isDisabled = !isAuthorized || disabled;

    const disabledStyles = !isAuthorized
      ? 'opacity-50 cursor-not-allowed text-gray-500 bg-luxury-light/5 border-luxury-light/10'
      : '';

    const buttonTitle = !isAuthorized
      ? reason || 'You do not have permission to perform this action'
      : title;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center gap-2 ${disabledStyles} ${className}`}
        title={buttonTitle}
        {...props}
      >
        {!isAuthorized && <Lock className="w-3 h-3" />}
        {children}
      </button>
    );
  }
);

PermissionButton.displayName = 'PermissionButton';

interface PermissionGuardProps {
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  permissions,
  requireAll = false,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let isAuthorized = true;
  if (permission) {
    isAuthorized = hasPermission(permission);
  }
  if (permissions && permissions.length > 0) {
    isAuthorized = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  return isAuthorized ? <>{children}</> : <>{fallback}</>;
}

export default PermissionButton;
