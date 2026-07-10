import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock supabase with auth methods + isSupabaseConfigured guard.
vi.mock('../../lib/supabase', () => {
  const auth = {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    resetPasswordForEmail: vi.fn(),
    updateUser: vi.fn(),
  };
  return {
    supabase: { auth },
    isSupabaseConfigured: vi.fn(() => true),
  };
});

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { authService } from '../../services/auth.service';

// Typed shorthand to the mocked auth object.
const mockAuth = supabase.auth as unknown as {
  signInWithPassword: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  getUser: ReturnType<typeof vi.fn>;
  getSession: ReturnType<typeof vi.fn>;
  onAuthStateChange: ReturnType<typeof vi.fn>;
  resetPasswordForEmail: ReturnType<typeof vi.fn>;
  updateUser: ReturnType<typeof vi.fn>;
};

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: supabase is configured.
    (isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(true);
  });

  describe('signIn', () => {
    it('calls supabase.auth.signInWithPassword with the given credentials', async () => {
      const user = { id: 'u1', email: 'test@example.com' };
      const session = { access_token: 'token-123', user };
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user, session },
        error: null,
      });

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'secret',
      });

      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'secret',
      });
      expect(result.user).toEqual(user);
      expect(result.session).toEqual(session);
      expect(result.error).toBeNull();
    });

    it('returns the error when supabase.auth.signInWithPassword errors', async () => {
      const authError = { message: 'Invalid credentials', name: 'AuthError' };
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      const result = await authService.signIn({
        email: 'bad@example.com',
        password: 'wrong',
      });

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(authError);
    });

    it('returns an error object (does NOT throw) when supabase is not configured', async () => {
      (isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = await authService.signIn({
        email: 'test@example.com',
        password: 'secret',
      });

      expect(mockAuth.signInWithPassword).not.toHaveBeenCalled();
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).not.toBeNull();
      expect(result.error?.message).toContain('not configured');
    });
  });

  describe('signOut', () => {
    it('calls supabase.auth.signOut', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      const result = await authService.signOut();

      expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
      expect(result.error).toBeNull();
    });

    it('returns the error from signOut when one occurs', async () => {
      const authError = { message: 'Session missing', name: 'AuthError' };
      mockAuth.signOut.mockResolvedValue({ error: authError });

      const result = await authService.signOut();
      expect(result.error).toEqual(authError);
    });

    it('returns { error: null } without calling signOut when not configured', async () => {
      (isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = await authService.signOut();
      expect(mockAuth.signOut).not.toHaveBeenCalled();
      expect(result.error).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('calls supabase.auth.getUser and returns the user', async () => {
      const user = { id: 'u1', email: 'me@example.com' };
      mockAuth.getUser.mockResolvedValue({ data: { user } });

      const result = await authService.getCurrentUser();
      expect(mockAuth.getUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(user);
    });

    it('returns null when supabase is not configured', async () => {
      (isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = await authService.getCurrentUser();
      expect(mockAuth.getUser).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null when getUser returns no user', async () => {
      mockAuth.getUser.mockResolvedValue({ data: { user: null } });

      const result = await authService.getCurrentUser();
      expect(result).toBeNull();
    });
  });

  describe('getCurrentSession', () => {
    it('calls supabase.auth.getSession and returns the session', async () => {
      const session = { access_token: 'tok', user: { id: 'u1' } };
      mockAuth.getSession.mockResolvedValue({ data: { session } });

      const result = await authService.getCurrentSession();
      expect(mockAuth.getSession).toHaveBeenCalledTimes(1);
      expect(result).toEqual(session);
    });

    it('returns null when supabase is not configured', async () => {
      (isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = await authService.getCurrentSession();
      expect(mockAuth.getSession).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('returns null when getSession returns no session', async () => {
      mockAuth.getSession.mockResolvedValue({ data: { session: null } });

      const result = await authService.getCurrentSession();
      expect(result).toBeNull();
    });
  });

  describe('onAuthStateChange', () => {
    it('subscribes to supabase.auth.onAuthStateChange and returns the subscription', () => {
      const callback = vi.fn();
      const result = authService.onAuthStateChange(callback);

      expect(mockAuth.onAuthStateChange).toHaveBeenCalledTimes(1);
      expect(result).not.toBeNull();
      expect(result?.subscription).toBeDefined();
      expect(typeof result?.subscription.unsubscribe).toBe('function');
    });

    it('returns null when supabase is not configured', () => {
      (isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = authService.onAuthStateChange(vi.fn());
      expect(mockAuth.onAuthStateChange).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('calls supabase.auth.resetPasswordForEmail with the email', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({ error: null });

      const result = await authService.resetPassword('me@example.com');
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith('me@example.com', {
        redirectTo: undefined,
      });
      expect(result.error).toBeNull();
    });

    it('returns an error (does not throw) when not configured', async () => {
      (isSupabaseConfigured as ReturnType<typeof vi.fn>).mockReturnValue(false);

      const result = await authService.resetPassword('me@example.com');
      expect(mockAuth.resetPasswordForEmail).not.toHaveBeenCalled();
      expect(result.error).not.toBeNull();
    });
  });
});
