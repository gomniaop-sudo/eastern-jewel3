/**
 * Authentication Context - Production Grade
 */

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { authService, type SignInCredentials } from '../services/auth.service';
import { isSupabaseConfigured } from '../lib/supabase';

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initializing: boolean;
  signIn: (credentials: SignInCredentials) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  sessionExpiresAt: number | null;
  refreshSession: () => Promise<void>;
  notification: NotificationState | null;
  clearNotification: () => void;
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000;
const SESSION_WARNING_THRESHOLD = 5 * 60 * 1000;
const INACTIVITY_CHECK_INTERVAL = 60 * 1000;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [countdown, setCountdown] = useState<number | null>(null);

  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const sessionCheckRef = useRef<number | null>(null);
  const inactivityCheckRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const signOut = useCallback(async (showMessage = true) => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSession(null);
      setSessionExpiresAt(null);
      setShowSessionWarning(false);
      setCountdown(null);
      if (showMessage) {
        setNotification({ message: 'You have been signed out', type: 'success' });
      }
    } catch (error) {
      console.error('Error signing out:', error);
      setNotification({ message: 'Error signing out', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const currentSession = await authService.getCurrentSession();
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        setSessionExpiresAt(currentSession.expires_at ? currentSession.expires_at * 1000 : null);
        setShowSessionWarning(false);
        setCountdown(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  }, []);

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setLoading(true);
    try {
      const result = await authService.signIn(credentials);
      if (result.error) {
        setNotification({ message: result.error.message || 'Sign in failed', type: 'error' });
        return { error: result.error };
      }
      setUser(result.user);
      setSession(result.session);
      if (result.session?.expires_at) {
        setSessionExpiresAt(result.session.expires_at * 1000);
      }
      setNotification({ message: 'Signed in successfully', type: 'success' });
      return { error: null };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Sign in failed');
      setNotification({ message: err.message, type: 'error' });
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleContinueSession = useCallback(async () => {
    await refreshSession();
    setShowSessionWarning(false);
    setCountdown(null);
    setNotification({ message: 'Session extended', type: 'success' });
  }, [refreshSession]);

  const isAuthenticated = !!session && !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        setInitializing(false);
        return;
      }

      try {
        const currentSession = await authService.getCurrentSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setSessionExpiresAt(currentSession.expires_at ? currentSession.expires_at * 1000 : null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
        setInitializing(false);
      }
    };

    initializeAuth();

    const authSubscription = authService.onAuthStateChange((event, newSession) => {
      switch (event) {
        case 'SIGNED_IN':
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.expires_at) {
            setSessionExpiresAt(newSession.expires_at * 1000);
          }
          break;
        case 'SIGNED_OUT':
          setSession(null);
          setUser(null);
          setSessionExpiresAt(null);
          setShowSessionWarning(false);
          setCountdown(null);
          break;
        case 'TOKEN_REFRESHED':
          setSession(newSession);
          setUser(newSession?.user ?? null);
          if (newSession?.expires_at) {
            setSessionExpiresAt(newSession.expires_at * 1000);
          }
          setNotification({ message: 'Session refreshed', type: 'info' });
          break;
        case 'USER_UPDATED':
          setUser(newSession?.user ?? null);
          break;
        default:
          break;
      }
    });

    if (authSubscription) {
      subscriptionRef.current = authSubscription.subscription;
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  useEffect(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    if (!sessionExpiresAt || !isAuthenticated) {
      return;
    }

    const checkSessionExpiry = () => {
      const now = Date.now();
      const timeUntilExpiry = sessionExpiresAt - now;

      if (timeUntilExpiry <= 0) {
        setShowSessionWarning(false);
        signOut(false);
        setNotification({ message: 'Session expired. Please sign in again.', type: 'warning' });
      } else if (timeUntilExpiry <= SESSION_WARNING_THRESHOLD && timeUntilExpiry > 0) {
        setShowSessionWarning(true);
        const minutesLeft = Math.ceil(timeUntilExpiry / 60000);
        setCountdown(minutesLeft);
      }
    };

    sessionCheckRef.current = window.setInterval(checkSessionExpiry, 30000);

    return () => {
      if (sessionCheckRef.current) {
        clearInterval(sessionCheckRef.current);
      }
    };
  }, [sessionExpiresAt, isAuthenticated, signOut]);

  useEffect(() => {
    if (countdown === null || !showSessionWarning) {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      return;
    }

    countdownRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, 60000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, [showSessionWarning, countdown]);

  useEffect(() => {
    if (!isAuthenticated) {
      if (inactivityCheckRef.current) {
        clearInterval(inactivityCheckRef.current);
        inactivityCheckRef.current = null;
      }
      return;
    }

    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'keydown', 'touchstart', 'touchmove', 'scroll'];
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    const checkInactivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivity;

      if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
        signOut(false);
        setNotification({ message: 'Signed out due to inactivity', type: 'warning' });
      }
    };

    inactivityCheckRef.current = window.setInterval(checkInactivity, INACTIVITY_CHECK_INTERVAL);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
      if (inactivityCheckRef.current) {
        clearInterval(inactivityCheckRef.current);
      }
    };
  }, [isAuthenticated, lastActivity, signOut]);

  const handleSignOutFromWarning = useCallback(async () => {
    await signOut(false);
    setShowSessionWarning(false);
    setNotification({ message: 'You have been signed out', type: 'info' });
  }, [signOut]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    initializing,
    signIn,
    signOut: () => signOut(true),
    isAuthenticated,
    sessionExpiresAt,
    refreshSession,
    notification,
    clearNotification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showSessionWarning && (
        <SessionWarningModal
          countdown={countdown}
          onContinue={handleContinueSession}
          onSignOut={handleSignOutFromWarning}
        />
      )}
    </AuthContext.Provider>
  );
}

interface SessionWarningModalProps {
  countdown: number | null;
  onContinue: () => void;
  onSignOut: () => void;
}

function SessionWarningModal({ countdown, onContinue, onSignOut }: SessionWarningModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-luxury-black border border-gold-500/30 rounded-sm w-full max-w-md shadow-2xl">
        <div className="p-6 border-b border-gold-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-display text-white">Session Expiring</h3>
              <p className="text-gray-400 text-sm">Your session is about to expire</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-300 text-sm mb-4">
            For your security, you will be automatically signed out soon.
          </p>
          {countdown !== null && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-sm">
              <span className="text-yellow-500 font-display text-2xl">{countdown}</span>
              <span className="text-yellow-400 text-sm">minutes remaining</span>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gold-500/20 flex gap-3">
          <button
            onClick={onContinue}
            className="flex-1 px-4 py-2 bg-gold-500 hover:bg-gold-400 text-luxury-black text-sm font-medium rounded-sm transition-colors"
          >
            Continue Session
          </button>
          <button
            onClick={onSignOut}
            className="flex-1 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-sm font-medium rounded-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
