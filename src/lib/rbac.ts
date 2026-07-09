/**
 * Role-Based Access Control (RBAC) Configuration
 */

export type Role = 'super_admin' | 'admin' | 'editor' | 'moderator' | 'viewer';

export type Permission =
  | 'dashboard.view'
  | 'gallery.view'
  | 'gallery.create'
  | 'gallery.edit'
  | 'gallery.delete'
  | 'journal.view'
  | 'journal.create'
  | 'journal.edit'
  | 'journal.delete'
  | 'messages.view'
  | 'messages.manage'
  | 'newsletter.view'
  | 'newsletter.manage'
  | 'settings.view'
  | 'settings.edit'
  | 'users.manage';

export interface RoleConfig {
  name: string;
  description: string;
  permissions: Permission[];
  level: number;
}

export const ROLES: Record<Role, RoleConfig> = {
  super_admin: {
    name: 'Super Admin',
    description: 'Full system access with all permissions',
    level: 100,
    permissions: [
      'dashboard.view',
      'gallery.view',
      'gallery.create',
      'gallery.edit',
      'gallery.delete',
      'journal.view',
      'journal.create',
      'journal.edit',
      'journal.delete',
      'messages.view',
      'messages.manage',
      'newsletter.view',
      'newsletter.manage',
      'settings.view',
      'settings.edit',
      'users.manage',
    ],
  },
  admin: {
    name: 'Admin',
    description: 'Administrative access with most permissions',
    level: 80,
    permissions: [
      'dashboard.view',
      'gallery.view',
      'gallery.create',
      'gallery.edit',
      'gallery.delete',
      'journal.view',
      'journal.create',
      'journal.edit',
      'journal.delete',
      'messages.view',
      'messages.manage',
      'newsletter.view',
      'newsletter.manage',
      'settings.view',
      'settings.edit',
    ],
  },
  editor: {
    name: 'Editor',
    description: 'Content management permissions',
    level: 60,
    permissions: [
      'dashboard.view',
      'gallery.view',
      'gallery.create',
      'gallery.edit',
      'journal.view',
      'journal.create',
      'journal.edit',
      'messages.view',
      'newsletter.view',
    ],
  },
  moderator: {
    name: 'Moderator',
    description: 'Content moderation permissions',
    level: 40,
    permissions: [
      'dashboard.view',
      'gallery.view',
      'journal.view',
      'messages.view',
      'messages.manage',
      'newsletter.view',
    ],
  },
  viewer: {
    name: 'Viewer',
    description: 'Read-only access',
    level: 20,
    permissions: [
      'dashboard.view',
      'gallery.view',
      'journal.view',
      'messages.view',
      'newsletter.view',
      'settings.view',
    ],
  },
};

export const PERMISSION_LABELS: Record<Permission, string> = {
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

export const ROLE_HIERARCHY: Role[] = ['super_admin', 'admin', 'editor', 'moderator', 'viewer'];

export function getRolePermissions(role: Role): Permission[] {
  return ROLES[role]?.permissions || [];
}

export function hasPermissionByRole(role: Role, permission: Permission): boolean {
  return getRolePermissions(role).includes(permission);
}

export function hasAnyPermissionByRole(role: Role, permissions: Permission[]): boolean {
  const rolePermissions = getRolePermissions(role);
  return permissions.some((p) => rolePermissions.includes(p));
}

export function hasAllPermissionsByRole(role: Role, permissions: Permission[]): boolean {
  const rolePermissions = getRolePermissions(role);
  return permissions.every((p) => rolePermissions.includes(p));
}

export function getRoleLevel(role: Role): number {
  return ROLES[role]?.level || 0;
}

export function isRoleAtLeast(role: Role, minimumRole: Role): boolean {
  return getRoleLevel(role) >= getRoleLevel(minimumRole);
}

export function isSuperAdminRole(role: Role): boolean {
  return role === 'super_admin';
}

export function isAdminRole(role: Role): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function getRoleFromUser<T extends { user_metadata?: Record<string, unknown> }>(user: T | null): Role {
  if (!user?.user_metadata) return 'viewer';
  const role = user.user_metadata.role as Role | undefined;
  if (role && ROLES[role]) return role;
  return 'viewer';
}

export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/admin': 'dashboard.view',
  '/admin/gallery': 'gallery.view',
  '/admin/journal': 'journal.view',
  '/admin/messages': 'messages.view',
  '/admin/newsletter': 'newsletter.view',
  '/admin/settings': 'settings.view',
  '/admin/profile': 'dashboard.view',
};

export const ACTION_PERMISSIONS = {
  gallery: {
    create: 'gallery.create' as Permission,
    edit: 'gallery.edit' as Permission,
    delete: 'gallery.delete' as Permission,
  },
  journal: {
    create: 'journal.create' as Permission,
    edit: 'journal.edit' as Permission,
    delete: 'journal.delete' as Permission,
    publish: 'journal.edit' as Permission,
  },
  messages: {
    manage: 'messages.manage' as Permission,
  },
  newsletter: {
    manage: 'newsletter.manage' as Permission,
  },
  settings: {
    edit: 'settings.edit' as Permission,
  },
  users: {
    manage: 'users.manage' as Permission,
  },
};
