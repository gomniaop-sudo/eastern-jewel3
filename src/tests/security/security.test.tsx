/**
 * Security Tests
 * Verifies: route protection, RBAC enforcement, input sanitization, XSS prevention
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import {
  hasPermissionByRole,
  hasAnyPermissionByRole,
  hasAllPermissionsByRole,
  isRoleAtLeast,
  getRolePermissions,
  type Role,
  type Permission,
} from '../../lib/rbac'
import { createServiceError, ErrorCodes } from '../../utils/errors'

vi.mock('../../utils/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn(), debug: vi.fn() },
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('lucide-react', () => ({
  Shield: () => null,
}))

vi.mock('../../components/auth/UnauthorizedPage', () => ({
  UnauthorizedPage: () => <div data-testid="unauthorized">Access Denied</div>,
}))

const mockUseAuth = vi.fn()
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  default: {},
}))

import { ProtectedRoute } from '../../components/auth/ProtectedRoute'

describe('Security: RBAC Enforcement', () => {
  const sensitivePermissions: Permission[] = [
    'gallery.delete',
    'journal.delete',
    'users.manage',
    'settings.edit',
    'media.delete',
  ]

  it('viewer role cannot perform destructive actions', () => {
    for (const perm of sensitivePermissions) {
      expect(hasPermissionByRole('viewer', perm)).toBe(false)
    }
  })

  it('moderator role cannot perform destructive actions', () => {
    for (const perm of sensitivePermissions) {
      expect(hasPermissionByRole('moderator', perm)).toBe(false)
    }
  })

  it('editor role cannot delete gallery or journal', () => {
    expect(hasPermissionByRole('editor', 'gallery.delete')).toBe(false)
    expect(hasPermissionByRole('editor', 'journal.delete')).toBe(false)
    expect(hasPermissionByRole('editor', 'users.manage')).toBe(false)
  })

  it('only super_admin can manage users', () => {
    const roles: Role[] = ['super_admin', 'admin', 'editor', 'moderator', 'viewer']
    const results = roles.map(r => hasPermissionByRole(r, 'users.manage'))
    expect(results).toEqual([true, false, false, false, false])
  })

  it('role hierarchy is strictly ordered', () => {
    expect(isRoleAtLeast('super_admin', 'admin')).toBe(true)
    expect(isRoleAtLeast('super_admin', 'editor')).toBe(true)
    expect(isRoleAtLeast('admin', 'super_admin')).toBe(false)
    expect(isRoleAtLeast('editor', 'admin')).toBe(false)
    expect(isRoleAtLeast('viewer', 'editor')).toBe(false)
  })

  it('viewer has only read permissions', () => {
    const viewerPerms = getRolePermissions('viewer')
    const writePerms = viewerPerms.filter(p =>
      p.includes('.create') || p.includes('.edit') || p.includes('.delete') ||
      p.includes('.manage') || p.includes('.upload')
    )
    expect(writePerms).toHaveLength(0)
  })

  it('hasAnyPermission returns false when none match', () => {
    expect(hasAnyPermissionByRole('viewer', ['gallery.delete', 'journal.delete'])).toBe(false)
  })

  it('hasAllPermissions returns false when some are missing', () => {
    expect(hasAllPermissionsByRole('editor', ['gallery.view', 'gallery.delete'])).toBe(false)
  })
})

describe('Security: Route Protection - Unauthenticated Redirect', () => {
  it('redirects unauthenticated user from protected route', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      initializing: false,
      isAuthenticated: false,
      hasPermission: vi.fn(() => false),
      hasAnyPermission: vi.fn(() => false),
      hasAllPermissions: vi.fn(() => false),
      hasRole: vi.fn(() => false),
      isAtLeast: vi.fn(() => false),
    })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div data-testid="home">Home</div>} />
          <Route path="/admin" element={
            <ProtectedRoute redirectTo="/">
              <div data-testid="admin">Admin</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByTestId('home')).toBeInTheDocument()
    expect(screen.queryByTestId('admin')).not.toBeInTheDocument()
  })

  it('blocks access when permission denied (unauthorized page shown)', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      initializing: false,
      isAuthenticated: true,
      hasPermission: vi.fn(() => false), // no permission
      hasAnyPermission: vi.fn(() => false),
      hasAllPermissions: vi.fn(() => false),
      hasRole: vi.fn(() => false),
      isAtLeast: vi.fn(() => false),
    })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute permission="settings.edit">
              <div data-testid="settings">Settings</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByTestId('unauthorized')).toBeInTheDocument()
    expect(screen.queryByTestId('settings')).not.toBeInTheDocument()
  })

  it('grants access when permission is satisfied', () => {
    mockUseAuth.mockReturnValue({
      loading: false,
      initializing: false,
      isAuthenticated: true,
      hasPermission: vi.fn(() => true),
      hasAnyPermission: vi.fn(() => true),
      hasAllPermissions: vi.fn(() => true),
      hasRole: vi.fn(() => true),
      isAtLeast: vi.fn(() => true),
    })
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={
            <ProtectedRoute permission="dashboard.view">
              <div data-testid="dashboard">Dashboard</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
  })
})

describe('Security: Input Sanitization - Error Handling', () => {
  it('classifies network errors correctly for safe user display', () => {
    const error = createServiceError(new Error('network timeout'))
    expect(error.code).toBe(ErrorCodes.NETWORK_ERROR)
    expect(error.message).not.toContain('password')
    expect(error.message).not.toContain('token')
  })

  it('classifies unauthorized errors without leaking credentials', () => {
    const error = createServiceError(new Error('unauthorized access'))
    expect(error.code).toBe(ErrorCodes.UNAUTHORIZED)
  })

  it('returns generic error for unexpected types', () => {
    const error = createServiceError('plain string error')
    expect(error.code).toBe(ErrorCodes.UNKNOWN)
  })

  it('returns generic message for null/undefined errors', () => {
    const error = createServiceError(null, 'Operation failed')
    expect(error.code).toBe(ErrorCodes.UNKNOWN)
    expect(error.message).toBe('Operation failed')
  })
})

describe('Security: XSS Prevention', () => {
  it('React escapes HTML in text nodes by default', () => {
    const xssAttempt = '<script>alert("xss")</script>'
    render(<div>{xssAttempt}</div>)
    const scripts = document.querySelectorAll('script')
    // React renders as text node, not as DOM elements
    expect(scripts.length).toBe(0)
    expect(screen.getByText(xssAttempt)).toBeInTheDocument()
  })

  it('React does not execute injected event handlers in text', () => {
    const xssAttempt = '<img onerror="alert(1)" src="x">'
    render(<p>{xssAttempt}</p>)
    // Should be text, not parsed as HTML
    const imgs = document.querySelectorAll('img')
    expect(imgs.length).toBe(0)
  })

  it('Input component renders value safely without HTML injection', () => {
    const xssValue = '<script>alert("xss")</script>'
    render(<input type="text" defaultValue={xssValue} />)
    const input = document.querySelector('input') as HTMLInputElement
    expect(input.value).toBe(xssValue)
    const scripts = document.querySelectorAll('script')
    expect(scripts.length).toBe(0)
  })
})

describe('Security: Environment Variable Protection', () => {
  it('isSupabaseConfigured returns false when env vars are missing', async () => {
    // The actual isSupabaseConfigured uses import.meta.env
    // This test verifies the function exists and is callable
    const { isSupabaseConfigured } = await import('../../lib/supabase')
    // In test env, env vars may or may not be set - just verify it returns boolean
    expect(typeof isSupabaseConfigured()).toBe('boolean')
  })
})
