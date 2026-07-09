/**
 * Authorization Hook and Utilities
 */

import { useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { type Permission, type Role, ACTION_PERMISSIONS, ROLES } from '../lib/rbac';

export interface AuthorizationResult {
  role: Role;
  permissions: Permission[];
  isSuperAdmin: boolean;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  isRole: (role: Role) => boolean;
  isAtLeast: (minimumRole: Role) => boolean;
  canCreateGallery: boolean;
  canEditGallery: boolean;
  canDeleteGallery: boolean;
  canCreateJournal: boolean;
  canEditJournal: boolean;
  canDeleteJournal: boolean;
  canPublishJournal: boolean;
  canManageMessages: boolean;
  canManageNewsletter: boolean;
  canEditSettings: boolean;
  canManageUsers: boolean;
}

export function useAuthorization(): AuthorizationResult {
  const {
    role,
    permissions,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isAtLeast,
  } = useAuth();

  const can = useCallback(
    (permission: Permission) => hasPermission(permission),
    [hasPermission]
  );

  const canAny = useCallback(
    (requiredPermissions: Permission[]) => hasAnyPermission(requiredPermissions),
    [hasAnyPermission]
  );

  const canAll = useCallback(
    (requiredPermissions: Permission[]) => hasAllPermissions(requiredPermissions),
    [hasAllPermissions]
  );

  const isRole = useCallback(
    (requiredRole: Role) => hasRole(requiredRole),
    [hasRole]
  );

  const canCreateGallery = useMemo(
    () => hasPermission(ACTION_PERMISSIONS.gallery.create),
    [hasPermission]
  );

  const canEditGallery = useMemo(
    () => hasPermission(ACTION_PERMISSIONS.gallery.edit),
    [hasPermission]
  );

  const canDeleteGallery = useMemo(
    () => hasPermission(ACTION_PERMISSIONS.gallery.delete),
    [hasPermission]
  );

  const canCreateJournal = useMemo(
    () => hasPermission(ACTION_PERMISSIONS.journal.create),
    [hasPermission]
  );

  const canEditJournal = useMemo(
    () => hasPermission(ACTION_PERMISSIONS.journal.edit),
    [hasPermission]
  );

  const canDeleteJournal = useMemo(
    () => hasPermission(ACTION_PERMISSIONS.journal.delete),
    [hasPermission]
  );

  const canPublishJournal = useMemo(
    () => hasPermission(ACTION_PERMISSIONS.journal.publish),
    [hasPermission]
  );

  const canManageMessages = useMemo(
    () => hasPermission(ACTION_PERMISSIONS.messages.manage),
    [hasPermission]
  );

  const canManageNewsletter = useMemo(
    () => hasPermission(ACTION_PERMISSIONS.newsletter.manage),
    [hasPermission]
  );

  const canEditSettings = useMemo(
    () => hasPermission(ACTION_PERMISSIONS.settings.edit),
    [hasPermission]
  );

  const canManageUsers = useMemo(
    () => hasPermission(ACTION_PERMISSIONS.users.manage),
    [hasPermission]
  );

  return {
    role,
    permissions,
    isSuperAdmin,
    can,
    canAny,
    canAll,
    isRole,
    isAtLeast,
    canCreateGallery,
    canEditGallery,
    canDeleteGallery,
    canCreateJournal,
    canEditJournal,
    canDeleteJournal,
    canPublishJournal,
    canManageMessages,
    canManageNewsletter,
    canEditSettings,
    canManageUsers,
  };
}

export function useRoleName(role: Role): string {
  return useMemo(() => ROLES[role]?.name || role, [role]);
}

export function usePermissionLabel(permission: Permission): string {
  return useMemo(() => {
    const labels: Record<Permission, string> = {
      'dashboard.view': 'View Dashboard',
      'gallery.view': 'View Gallery',
      'gallery.create': 'Create Gallery Items',
      'gallery.edit': 'Edit Gallery Items',
      'gallery.delete': 'Delete Gallery Items',
      'journal.view': 'View Journal',
      'journal.create': 'Create Journal Posts',
      'journal.edit': 'Edit Journal Posts',
      'journal.delete': 'Delete Journal Posts',
      'messages.view': 'View Messages',
      'messages.manage': 'Manage Messages',
      'newsletter.view': 'View Newsletter',
      'newsletter.manage': 'Manage Newsletter',
      'settings.view': 'View Settings',
      'settings.edit': 'Edit Settings',
      'users.manage': 'Manage Users',
    };
    return labels[permission] || permission;
  }, [permission]);
}
