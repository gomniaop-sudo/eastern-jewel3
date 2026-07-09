/**
 * Authentication Service
 */

import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export const authService = {
  async signIn(credentials: SignInCredentials): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) {
      return { user: null, session: null, error: { message: 'Supabase is not configured', name: 'AuthError' } as AuthError };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email: credentials.email, password: credentials.password });
    return { user: data.user, session: data.session, error };
  },

  async signOut(): Promise<{ error: AuthError | null }> {
    if (!isSupabaseConfigured()) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getCurrentSession(): Promise<Session | null> {
    if (!isSupabaseConfigured()) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthStateChange(callback: (event: string, session: Session | null) => void): { subscription: { unsubscribe: () => void } } | null {
    if (!isSupabaseConfigured()) return null;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => callback(event, session));
    return { subscription };
  },

  async resetPassword(email: string, redirectTo?: string): Promise<{ error: AuthError | null }> {
    if (!isSupabaseConfigured()) return { error: { message: 'Supabase is not configured', name: 'AuthError' } as AuthError };
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error };
  },

  async updatePassword(newPassword: string): Promise<AuthResponse> {
    if (!isSupabaseConfigured()) return { user: null, session: null, error: { message: 'Supabase is not configured', name: 'AuthError' } as AuthError };
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    return { user: data.user, session: null, error };
  },
};
