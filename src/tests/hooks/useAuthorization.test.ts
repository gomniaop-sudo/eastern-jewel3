/**
 * useAuthorization Hook Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuthorization, useRoleName, usePermissionLabel } from '../../hooks/useAuthorization'
import type { Role, Permission } from '../../lib/rbac'

// Mock useAuth to return controllable auth state
const mockHasPermission = vi.fn((permission: Permission) => {
  const adminPerms: Permission[] = [
    'dashboard.view', 'gallery.view', 'gallery.create', 'gallery.edit', 'gallery.delete',
    'journal.view', 'journal.create', 'journal.edit', 'journal.delete',
    'messages.view', 'messages.manage', 'newsletter.view', 'newsletter.manage',
    'settings.view', 'settings.edit', 'media.view', 'media.upload', 'media.edit', 'media.delete',
  ]
  return adminPerms.includes(permission)
})

const mockAuthContext = {
  role: 'admin' as Role,
  permissions: [] as Permission[],
  isSuperAdmin: false,
  hasPermission: mockHasPermission,
  hasAnyPermission: vi.fn(() => true),
  hasAllPermissions: vi.fn(() => true),
  hasRole: vi.fn((r: Role) => r === 'admin'),
  isAtLeast: vi.fn(() => true),
}

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  default: {},
}))

describe('useAuthorization', () => {
  it('returns role from auth context', () => {
    const { result } = renderHook(() => useAuthorization())
    expect(result.current.role).toBe('admin')
  })

  it('returns isSuperAdmin from auth context', () => {
    const { result } = renderHook(() => useAuthorization())
    expect(result.current.isSuperAdmin).toBe(false)
  })

  it('can() delegates to hasPermission', () => {
    const { result } = renderHook(() => useAuthorization())
    const canView = result.current.can('gallery.view')
    expect(mockHasPermission).toHaveBeenCalledWith('gallery.view')
    expect(canView).toBe(true)
  })

  it('canAny() delegates to hasAnyPermission', () => {
    const { result } = renderHook(() => useAuthorization())
    result.current.canAny(['gallery.view', 'gallery.edit'])
    expect(mockAuthContext.hasAnyPermission).toHaveBeenCalledWith(['gallery.view', 'gallery.edit'])
  })

  it('canAll() delegates to hasAllPermissions', () => {
    const { result } = renderHook(() => useAuthorization())
    result.current.canAll(['gallery.view', 'gallery.create'])
    expect(mockAuthContext.hasAllPermissions).toHaveBeenCalledWith(['gallery.view', 'gallery.create'])
  })

  it('isRole() delegates to hasRole', () => {
    const { result } = renderHook(() => useAuthorization())
    const isAdmin = result.current.isRole('admin')
    expect(mockAuthContext.hasRole).toHaveBeenCalledWith('admin')
    expect(isAdmin).toBe(true)
  })

  it('canCreateGallery is pre-computed from hasPermission', () => {
    const { result } = renderHook(() => useAuthorization())
    expect(result.current.canCreateGallery).toBe(true)
  })

  it('canDeleteGallery is pre-computed from hasPermission', () => {
    const { result } = renderHook(() => useAuthorization())
    expect(result.current.canDeleteGallery).toBe(true)
  })

  it('canManageUsers is pre-computed - admin does not have users.manage', () => {
    // Admin doesn't have users.manage (only super_admin does)
    const { result } = renderHook(() => useAuthorization())
    expect(result.current.canManageUsers).toBe(false)
  })

  it('canEditSettings reflects hasPermission result', () => {
    const { result } = renderHook(() => useAuthorization())
    expect(result.current.canEditSettings).toBe(true)
  })
})

describe('useRoleName', () => {
  it('returns correct name for each role', () => {
    const cases: [Role, string][] = [
      ['super_admin', 'Super Admin'],
      ['admin', 'Admin'],
      ['editor', 'Editor'],
      ['moderator', 'Moderator'],
      ['viewer', 'Viewer'],
    ]
    for (const [role, expectedName] of cases) {
      const { result } = renderHook(() => useRoleName(role))
      expect(result.current).toBe(expectedName)
    }
  })
})

describe('usePermissionLabel', () => {
  it('returns correct label for known permissions', () => {
    const cases: [Permission, string][] = [
      ['gallery.create', 'Create Gallery Items'],
      ['gallery.delete', 'Delete Gallery Items'],
      ['journal.edit', 'Edit Journal Posts'],
      ['users.manage', 'Manage Users'],
      ['settings.edit', 'Edit Settings'],
      ['media.upload', 'Upload Media'],
    ]
    for (const [perm, expectedLabel] of cases) {
      const { result } = renderHook(() => usePermissionLabel(perm))
      expect(result.current).toBe(expectedLabel)
    }
  })
})
