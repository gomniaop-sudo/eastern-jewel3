import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  ROLES,
  getRolePermissions,
  hasPermissionByRole,
  hasAnyPermissionByRole,
  hasAllPermissionsByRole,
  getRoleLevel,
  isRoleAtLeast,
  isSuperAdminRole,
  isAdminRole,
  getRoleFromUser,
  type Role,
} from '../../lib/rbac';

describe('rbac module', () => {
  describe('ROLES constant', () => {
    it('defines all 5 roles', () => {
      expect(Object.keys(ROLES).sort()).toEqual(
        ['admin', 'editor', 'moderator', 'super_admin', 'viewer']
      );
    });
  });

  describe('getRolePermissions', () => {
    it('returns an array of permissions for super_admin', () => {
      const perms = getRolePermissions('super_admin');
      expect(Array.isArray(perms)).toBe(true);
      expect(perms.length).toBeGreaterThan(0);
      // super_admin should have every permission defined
      expect(perms).toContain('users.manage');
      expect(perms).toContain('settings.edit');
      expect(perms).toContain('gallery.delete');
    });

    it('returns an array for admin', () => {
      const perms = getRolePermissions('admin');
      expect(Array.isArray(perms)).toBe(true);
      expect(perms).toContain('gallery.delete');
    });

    it('returns an array for editor', () => {
      const perms = getRolePermissions('editor');
      expect(Array.isArray(perms)).toBe(true);
      expect(perms).toContain('gallery.edit');
      expect(perms).not.toContain('gallery.delete');
    });

    it('returns an array for moderator', () => {
      const perms = getRolePermissions('moderator');
      expect(Array.isArray(perms)).toBe(true);
      expect(perms).toContain('messages.manage');
      expect(perms).not.toContain('gallery.create');
    });

    it('returns an array for viewer (read-only)', () => {
      const perms = getRolePermissions('viewer');
      expect(Array.isArray(perms)).toBe(true);
      // viewer should only have view perms
      expect(perms).toContain('gallery.view');
      expect(perms).toContain('journal.view');
      expect(perms).not.toContain('gallery.create');
      expect(perms).not.toContain('settings.edit');
    });

    it('returns empty array for unknown role (defensive)', () => {
      const perms = getRolePermissions('unknown_role' as Role);
      expect(perms).toEqual([]);
    });
  });

  describe('hasPermissionByRole', () => {
    it('returns true when super_admin has a permission', () => {
      expect(hasPermissionByRole('super_admin', 'users.manage')).toBe(true);
      expect(hasPermissionByRole('super_admin', 'gallery.delete')).toBe(true);
      expect(hasPermissionByRole('super_admin', 'settings.edit')).toBe(true);
    });

    it('returns false when viewer lacks a write permission', () => {
      expect(hasPermissionByRole('viewer', 'gallery.create')).toBe(false);
      expect(hasPermissionByRole('viewer', 'gallery.edit')).toBe(false);
      expect(hasPermissionByRole('viewer', 'gallery.delete')).toBe(false);
    });

    it('returns true when viewer has a view permission', () => {
      expect(hasPermissionByRole('viewer', 'gallery.view')).toBe(true);
      expect(hasPermissionByRole('viewer', 'journal.view')).toBe(true);
    });

    it('only super_admin has users.manage (admin and editor do not)', () => {
      expect(hasPermissionByRole('super_admin', 'users.manage')).toBe(true);
      expect(hasPermissionByRole('admin', 'users.manage')).toBe(false);
      expect(hasPermissionByRole('editor', 'users.manage')).toBe(false);
    });
  });

  describe('hasAnyPermissionByRole', () => {
    it('returns true if the role has at least one of the requested permissions', () => {
      expect(
        hasAnyPermissionByRole('editor', ['gallery.delete', 'gallery.edit'])
      ).toBe(true);
    });

    it('returns false if the role has none of the requested permissions', () => {
      expect(
        hasAnyPermissionByRole('viewer', ['gallery.create', 'gallery.delete'])
      ).toBe(false);
    });

    it('returns true for super_admin with any permission list', () => {
      expect(
        hasAnyPermissionByRole('super_admin', ['users.manage', 'settings.edit'])
      ).toBe(true);
    });

    it('returns false for an empty permission list', () => {
      expect(hasAnyPermissionByRole('admin', [])).toBe(false);
    });
  });

  describe('hasAllPermissionsByRole', () => {
    it('returns true when the role has every requested permission', () => {
      expect(
        hasAllPermissionsByRole('admin', ['gallery.view', 'gallery.create', 'gallery.edit'])
      ).toBe(true);
    });

    it('returns false when the role is missing at least one', () => {
      expect(
        hasAllPermissionsByRole('editor', ['gallery.view', 'gallery.delete'])
      ).toBe(false);
    });

    it('returns true for an empty permission list (vacuous truth)', () => {
      expect(hasAllPermissionsByRole('viewer', [])).toBe(true);
    });

    it('super_admin has all permissions', () => {
      expect(
        hasAllPermissionsByRole('super_admin', [
          'users.manage',
          'settings.edit',
          'gallery.delete',
          'journal.delete',
        ])
      ).toBe(true);
    });
  });

  describe('getRoleLevel', () => {
    it('returns 100 for super_admin', () => {
      expect(getRoleLevel('super_admin')).toBe(100);
    });

    it('returns 80 for admin', () => {
      expect(getRoleLevel('admin')).toBe(80);
    });

    it('returns 60 for editor', () => {
      expect(getRoleLevel('editor')).toBe(60);
    });

    it('returns 40 for moderator', () => {
      expect(getRoleLevel('moderator')).toBe(40);
    });

    it('returns 20 for viewer', () => {
      expect(getRoleLevel('viewer')).toBe(20);
    });

    it('returns 0 for unknown role (defensive)', () => {
      expect(getRoleLevel('unknown_role' as Role)).toBe(0);
    });
  });

  describe('isRoleAtLeast', () => {
    it('super_admin is at least every role', () => {
      expect(isRoleAtLeast('super_admin', 'super_admin')).toBe(true);
      expect(isRoleAtLeast('super_admin', 'admin')).toBe(true);
      expect(isRoleAtLeast('super_admin', 'editor')).toBe(true);
      expect(isRoleAtLeast('super_admin', 'moderator')).toBe(true);
      expect(isRoleAtLeast('super_admin', 'viewer')).toBe(true);
    });

    it('viewer is not at least editor', () => {
      expect(isRoleAtLeast('viewer', 'editor')).toBe(false);
    });

    it('viewer is at least viewer (equal)', () => {
      expect(isRoleAtLeast('viewer', 'viewer')).toBe(true);
    });

    it('editor is at least moderator but not admin', () => {
      expect(isRoleAtLeast('editor', 'moderator')).toBe(true);
      expect(isRoleAtLeast('editor', 'admin')).toBe(false);
    });

    it('admin is at least editor and admin but not super_admin', () => {
      expect(isRoleAtLeast('admin', 'editor')).toBe(true);
      expect(isRoleAtLeast('admin', 'admin')).toBe(true);
      expect(isRoleAtLeast('admin', 'super_admin')).toBe(false);
    });
  });

  describe('isSuperAdminRole', () => {
    it('returns true only for super_admin', () => {
      expect(isSuperAdminRole('super_admin')).toBe(true);
    });

    it('returns false for every other role', () => {
      expect(isSuperAdminRole('admin')).toBe(false);
      expect(isSuperAdminRole('editor')).toBe(false);
      expect(isSuperAdminRole('moderator')).toBe(false);
      expect(isSuperAdminRole('viewer')).toBe(false);
    });
  });

  describe('isAdminRole', () => {
    it('returns true for super_admin', () => {
      expect(isAdminRole('super_admin')).toBe(true);
    });

    it('returns true for admin', () => {
      expect(isAdminRole('admin')).toBe(true);
    });

    it('returns false for editor, moderator, viewer', () => {
      expect(isAdminRole('editor')).toBe(false);
      expect(isAdminRole('moderator')).toBe(false);
      expect(isAdminRole('viewer')).toBe(false);
    });
  });

  describe('getRoleFromUser', () => {
    it('returns viewer for null user', () => {
      expect(getRoleFromUser(null)).toBe('viewer');
    });

    it('returns viewer for undefined user', () => {
      expect(getRoleFromUser(undefined as unknown as null)).toBe('viewer');
    });

    it('returns viewer when user has no user_metadata', () => {
      expect(getRoleFromUser({} as { user_metadata?: Record<string, unknown> })).toBe('viewer');
    });

    it('returns viewer when user_metadata has no role', () => {
      const user = { user_metadata: { foo: 'bar' } };
      expect(getRoleFromUser(user)).toBe('viewer');
    });

    it('returns the role when user_metadata.role is valid (admin)', () => {
      const user = { user_metadata: { role: 'admin' } };
      expect(getRoleFromUser(user)).toBe('admin');
    });

    it('returns the role when user_metadata.role is valid (editor)', () => {
      const user = { user_metadata: { role: 'editor' } };
      expect(getRoleFromUser(user)).toBe('editor');
    });

    it('returns the role when user_metadata.role is valid (super_admin)', () => {
      const user = { user_metadata: { role: 'super_admin' } };
      expect(getRoleFromUser(user)).toBe('super_admin');
    });

    it('returns viewer when user_metadata.role is an invalid string', () => {
      const user = { user_metadata: { role: 'hacker' } };
      expect(getRoleFromUser(user)).toBe('viewer');
    });

    it('returns viewer when user_metadata.role is not a string', () => {
      const user = { user_metadata: { role: 123 } };
      expect(getRoleFromUser(user)).toBe('viewer');
    });

    it('preserves extra user_metadata fields', () => {
      const user = {
        user_metadata: { role: 'moderator', full_name: 'Jane', username: 'jane' },
      };
      expect(getRoleFromUser(user)).toBe('moderator');
    });
  });
});
