import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from './supabase/client';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signOut: async () => { },
});

// Variable global para rastrear si ya hay un listener activo
declare global {
  interface Window {
    __auth_listener_active__: boolean;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Ref to track session state across closures/events without dependencies
  // This prevents "Session Expired" loops when already on the login screen
  const isSessionActiveRef = useRef(false);

  // Sync ref with session state
  useEffect(() => {
    isSessionActiveRef.current = !!session;
  }, [session]);

  useEffect(() => {
    // Prevenir múltiples listeners globalmente usando window
    if (window.__auth_listener_active__) {
      console.log('⚠️ AuthProvider: Auth listener already active globally, skipping');
      return;
    }

    window.__auth_listener_active__ = true;

    console.log('🔐 AuthProvider: Initializing (SINGLE LISTENER)');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Initial session:', session ? `User: ${session.user.email}` : 'No session');
      setSession(session);
      setLoading(false);
    }).catch((error) => {
      console.error('❌ Error getting initial session:', error);
      setLoading(false);
    });

    // Listen for auth changes - ONLY ONE LISTENER FOR THE ENTIRE APP
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session ? `User: ${session.user.email}` : 'No session');

      // Handle token refresh
      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token refreshed successfully');
      }

      // Handle session expiry or sign out
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        console.log('👋 User signed out or session expired');
        handleSessionExpired(session, false); // Don't show toast for voluntary logout
      }

      // Handle token expired
      if (event === 'TOKEN_EXPIRED') {
        console.log('⏰ Token expired, redirecting to login...');
        handleSessionExpired(session, true);
      }

      setSession(session);
    });

    // Handle 401 from API calls
    const handleUnauthorized = () => {
      console.log('🚫 Received auth:unauthorized event, handling expiration...');
      // Get current session for redirect logic
      supabase.auth.getSession().then(({ data }) => {
        // Always trigger if we receive an explicit unauthorized event from API
        handleSessionExpired(data.session, true);
      });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    // Check session on window focus/visibility change
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // Only check if we haven't just processed an event
        console.log('👀 Window visible, checking session...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();

        if (error || !currentSession) {
          // IMPORTANT: Only trigger expiration if we thought we were logged in.
          // This prevents infinite reload loops on the login page.
          if (isSessionActiveRef.current) {
            console.log('❌ Session invalid on resume, logging out...');
            handleSessionExpired(null, true);
          } else {
            console.log('ℹ️ No session found, but user was already logged out. No action needed.');
          }
        } else {
          // Verify if token is close to expiry (within 5 mins)
          const expiresAt = currentSession.expires_at || 0;
          const now = Math.floor(Date.now() / 1000);
          if (expiresAt - now < 300) {
            console.log('⚠️ Token expiring soon, attempting refresh...');
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.log('❌ Refresh failed on resume:', refreshError.message);
              // Only expire if we were logged in
              if (isSessionActiveRef.current) {
                handleSessionExpired(currentSession, true);
              }
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      console.log('🔐 AuthProvider: Cleaning up listener');
      subscription.unsubscribe();
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.__auth_listener_active__ = false;
    };
  }, []);

  // Helper function to handle session expiration
  const handleSessionExpired = (expiredSession: Session | null, showToast: boolean = true) => {
    // Clear session state
    setSession(null);

    // Clear any stored data
    localStorage.clear();
    sessionStorage.clear();

    // Determine which login page to redirect to based on user role
    const role = expiredSession?.user?.user_metadata?.role;
    const currentParams = new URLSearchParams(window.location.search);
    const currentMode = currentParams.get('mode');

    // If we can determine the role from session or current URL mode, redirect there
    let redirectPath = '/';

    if (role === 'inspector' || currentMode === 'inspector') {
      redirectPath = '/?mode=inspector';
    } else if (role === 'client' || currentMode === 'client') {
      redirectPath = '/?mode=client';
    } else if (role === 'admin' || currentMode === 'admin') {
      redirectPath = '/?mode=admin';
    }

    // SMART REDIRECT: Don't reload if we are already at the target
    const currentUrl = new URL(window.location.href);
    const targetUrl = new URL(redirectPath, window.location.origin);

    const isSamePath = currentUrl.pathname === targetUrl.pathname;
    const isSameMode = currentUrl.searchParams.get('mode') === targetUrl.searchParams.get('mode');

    if (isSamePath && isSameMode) {
      console.log('ℹ️ Already on the correct login/entry page. Skipping reload.');
      return;
    }

    if (showToast) {
      // Show notification to user
      const showExpirationNotice = () => {
        // Create a temporary toast notification
        const toast = document.createElement('div');
        toast.innerHTML = `
            <div style="
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              z-index: 9999;
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              padding: 16px 24px;
              border-radius: 12px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
              font-family: system-ui, -apple-system, sans-serif;
              font-size: 14px;
              font-weight: 500;
              animation: slideDown 0.3s ease-out;
            ">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">⏰</span>
                <div>
                  <div style="font-weight: 600; margin-bottom: 4px;">Sesión Expirada</div>
                  <div style="opacity: 0.9; font-size: 13px;">Tu sesión ha expirado. Por favor inicia sesión nuevamente.</div>
                </div>
              </div>
            </div>
          `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
              }
            }
          `;
        document.head.appendChild(style);
        document.body.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
          toast.remove();
          style.remove();
        }, 3000);
      };
      showExpirationNotice();
    }

    console.log('🔄 Redirecting to login page:', redirectPath);

    // Redirect after showing the notice
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 1000);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}