/**
 * ProtectedRoute Component Tests
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

// Mock framer-motion to avoid animation dependency
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Shield: () => <svg data-testid="shield-icon" />,
}))

// Mock UnauthorizedPage
vi.mock('../../components/auth/UnauthorizedPage', () => ({
  UnauthorizedPage: () => <div data-testid="unauthorized-page">Unauthorized</div>,
}))

// Mock useAuth - we'll override per test
const mockUseAuth = vi.fn()
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
  default: {},
}))

import { ProtectedRoute } from '../../components/auth/ProtectedRoute'

function makeAuthContext(overrides: Partial<ReturnType<typeof mockUseAuth>> = {}) {
  return {
    user: null,
    session: null,
    loading: false,
    initializing: false,
    isAuthenticated: false,
    sessionExpiresAt: null,
    notification: null,
    role: 'viewer' as const,
    permissions: [] as string[],
    hasPermission: vi.fn(() => false),
    hasAnyPermission: vi.fn(() => false),
    hasAllPermissions: vi.fn(() => false),
    hasRole: vi.fn(() => false),
    isAtLeast: vi.fn(() => false),
    isSuperAdmin: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
    refreshSession: vi.fn(),
    clearNotification: vi.fn(),
    ...overrides,
  }
}

function renderWithRouter(element: React.ReactNode, initialEntry = '/admin') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/admin" element={element} />
        <Route path="/admin/gallery" element={element} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  it('shows loading/authenticating UI when initializing', () => {
    mockUseAuth.mockReturnValue(makeAuthContext({ initializing: true }))
    renderWithRouter(<ProtectedRoute><div>Protected</div></ProtectedRoute>)
    expect(screen.getByText('Authenticating')).toBeInTheDocument()
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('shows loading UI when loading=true', () => {
    mockUseAuth.mockReturnValue(makeAuthContext({ loading: true }))
    renderWithRouter(<ProtectedRoute><div>Protected</div></ProtectedRoute>)
    expect(screen.getByText('Authenticating')).toBeInTheDocument()
  })

  it('redirects to redirectTo when not authenticated', () => {
    mockUseAuth.mockReturnValue(makeAuthContext({ isAuthenticated: false }))
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/admin" element={<ProtectedRoute redirectTo="/"><div>Protected</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Home Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('renders children when authenticated and no permission required', () => {
    mockUseAuth.mockReturnValue(makeAuthContext({
      isAuthenticated: true,
      hasPermission: vi.fn(() => true),
    }))
    renderWithRouter(<ProtectedRoute><div>Protected Content</div></ProtectedRoute>)
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders UnauthorizedPage when permission check fails', () => {
    mockUseAuth.mockReturnValue(makeAuthContext({
      isAuthenticated: true,
      hasPermission: vi.fn(() => false),
    }))
    renderWithRouter(
      <ProtectedRoute permission="gallery.delete"><div>Protected</div></ProtectedRoute>
    )
    expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
    expect(screen.queryByText('Protected')).not.toBeInTheDocument()
  })

  it('renders children when permission check passes', () => {
    mockUseAuth.mockReturnValue(makeAuthContext({
      isAuthenticated: true,
      hasPermission: vi.fn(() => true),
    }))
    renderWithRouter(
      <ProtectedRoute permission="gallery.view"><div>Gallery Content</div></ProtectedRoute>
    )
    expect(screen.getByText('Gallery Content')).toBeInTheDocument()
  })

  it('renders UnauthorizedPage when role check fails', () => {
    mockUseAuth.mockReturnValue(makeAuthContext({
      isAuthenticated: true,
      hasPermission: vi.fn(() => true),
      hasRole: vi.fn(() => false),
    }))
    renderWithRouter(
      <ProtectedRoute role="admin"><div>Admin Only</div></ProtectedRoute>
    )
    expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
  })

  it('renders children when role check passes', () => {
    mockUseAuth.mockReturnValue(makeAuthContext({
      isAuthenticated: true,
      hasPermission: vi.fn(() => true),
      hasRole: vi.fn(() => true),
    }))
    renderWithRouter(
      <ProtectedRoute role="admin"><div>Admin Content</div></ProtectedRoute>
    )
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('renders UnauthorizedPage when minimumRole check fails', () => {
    mockUseAuth.mockReturnValue(makeAuthContext({
      isAuthenticated: true,
      hasPermission: vi.fn(() => true),
      isAtLeast: vi.fn(() => false),
    }))
    renderWithRouter(
      <ProtectedRoute minimumRole="editor"><div>Editor+</div></ProtectedRoute>
    )
    expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
  })

  it('uses requireAll=true to require all permissions', () => {
    const hasAllPermissions = vi.fn(() => false)
    mockUseAuth.mockReturnValue(makeAuthContext({
      isAuthenticated: true,
      hasPermission: vi.fn(() => true),
      hasAllPermissions,
    }))
    renderWithRouter(
      <ProtectedRoute
        permissions={['gallery.view', 'gallery.delete']}
        requireAll={true}
      >
        <div>Protected</div>
      </ProtectedRoute>
    )
    expect(hasAllPermissions).toHaveBeenCalledWith(['gallery.view', 'gallery.delete'])
    expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument()
  })
})
