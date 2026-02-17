import React, { Suspense, lazy, useState, useEffect } from 'react';
import { supabase } from './utils/supabase/client';
import { AuthProvider, useAuth } from './utils/AuthContext';
import { LanguageProvider } from './utils/LanguageContext';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { Loader2, LogOut } from 'lucide-react';
import { Toaster } from 'sonner@2.0.3';

// ============================================
// ULTRA-AGGRESSIVE EXTENSION BLOCKING
// ============================================
// This must run IMMEDIATELY before any other code
(function() {
  'use strict';
  
  // 1. Block ethereum provider BEFORE MetaMask can inject it
  const blockProviderProperty = (prop) => {
    try {
      // Check if property already exists
      const descriptor = Object.getOwnPropertyDescriptor(window, prop);
      
      // If it already exists and is not configurable, skip it
      if (descriptor && descriptor.configurable === false) {
        console.log(`⚠️ Property ${prop} already locked, cannot override`);
        return;
      }
      
      let blockedValue = undefined;
      Object.defineProperty(window, prop, {
        get() {
          return blockedValue;
        },
        set(value) {
          // Silently ignore any attempts to set the property
          console.log(`🚫 Blocked attempt to inject ${prop}`);
          return true;
        },
        configurable: true, // Keep it configurable to avoid conflicts
        enumerable: false
      });
    } catch (e) {
      console.log(`⚠️ Could not block ${prop}:`, e.message);
    }
  };

  // Block BEFORE page load
  const criticalProviders = [
    'ethereum',
    'web3',
    'coinbaseWalletExtension',
    'phantom',
    'solana'
  ];

  criticalProviders.forEach(blockProviderProperty);

  // 2. Intercept and block MetaMask's connection attempts
  const originalDispatchEvent = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function(event) {
    // Block MetaMask events
    if (event.type && (
      event.type.includes('metamask') ||
      event.type.includes('ethereum') ||
      event.type.includes('wallet')
    )) {
      console.log('🚫 Blocked MetaMask event:', event.type);
      return true;
    }
    return originalDispatchEvent.call(this, event);
  };

  // 3. Block addEventListener for MetaMask events
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type && (
      type.includes('metamask') ||
      type.includes('ethereum') ||
      type.includes('wallet') ||
      type === 'message' && typeof listener === 'function' && listener.toString().includes('metamask')
    )) {
      console.log('🚫 Blocked MetaMask event listener:', type);
      return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // 4. Override fetch to block MetaMask API calls
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (typeof url === 'string' && (
      url.includes('metamask') ||
      url.includes('ethereum') ||
      url.includes('infura.io') ||
      url.includes('cloudflare-eth.com')
    )) {
      console.log('🚫 Blocked MetaMask fetch:', url);
      return Promise.reject(new Error('Blocked by app security policy'));
    }
    return originalFetch.apply(this, args);
  };

  // 5. Block chrome.runtime (extension communication)
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    const blockedRuntime = {
      sendMessage: () => {
        console.log('🚫 Blocked chrome.runtime.sendMessage');
      },
      connect: () => {
        console.log('🚫 Blocked chrome.runtime.connect');
        return {
          postMessage: () => {},
          disconnect: () => {},
          onMessage: { addListener: () => {} }
        };
      },
      onMessage: {
        addListener: () => {
          console.log('🚫 Blocked chrome.runtime.onMessage');
        }
      }
    };

    try {
      Object.defineProperty(chrome, 'runtime', {
        get() { return blockedRuntime; },
        set() { return true; },
        configurable: false
      });
    } catch (e) {
      // Already defined, ignore
    }
  }

  console.log('🛡️ Ultra-aggressive extension blocking initialized');
})();

// Comprehensive protection against browser extensions
// This prevents Web3 wallets, ad blockers, and other extensions from interfering
if (typeof window !== 'undefined') {
  // 1. Suppress all extension-related errors
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  console.error = (...args: any[]) => {
    const errorString = args.join(' ').toLowerCase();
    const extensionKeywords = [
      'metamask',
      'extension',
      'chrome-extension',
      'moz-extension',
      'coinbase',
      'wallet',
      'web3',
      'ethereum',
      'phantom',
      'rabby',
      'trust wallet',
      'connect',
      'inpage.js',
      'provider',
      'injected'
    ];
    
    // Suppress if error contains extension-related keywords
    if (extensionKeywords.some(keyword => errorString.includes(keyword))) {
      // Completely silent - don't even log
      return;
    }
    
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const warnString = args.join(' ').toLowerCase();
    const extensionKeywords = [
      'metamask',
      'extension',
      'chrome-extension',
      'wallet',
      'web3',
      'ethereum'
    ];
    
    if (extensionKeywords.some(keyword => warnString.includes(keyword))) {
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };

  // 2. Block Web3 providers from all major wallet extensions
  const blockProperty = (prop: string) => {
    try {
      // First, try to get the current descriptor
      const descriptor = Object.getOwnPropertyDescriptor(window, prop);
      
      // If property already exists and is not configurable, we can't override it
      // Just log and move on
      if (descriptor && descriptor.configurable === false) {
        console.log(`⚠️ Property ${prop} already defined as non-configurable, skipping`);
        return;
      }
      
      // Try to delete first if it exists
      if (prop in window) {
        try {
          delete (window as any)[prop];
        } catch (e) {
          // Can't delete, try to override
        }
      }
      
      // Now define our blocking property
      Object.defineProperty(window, prop, {
        get() {
          return undefined;
        },
        set() {
          // Silently ignore
        },
        configurable: true, // Make it configurable so we can redefine if needed
        enumerable: false
      });
    } catch (e) {
      // If all else fails, just log and continue
      console.log(`⚠️ Could not block property ${prop}:`, e);
    }
  };

  // Block all common Web3 wallet providers
  const providersToBlock = [
    'ethereum',
    'web3',
    'coinbaseWalletExtension',
    'phantom',
    'solana',
    'tronWeb',
    'tronLink',
    'okexchain',
    'BinanceChain',
    'trustwallet',
    'rabby',
    'exodus',
    'brave',
    'xfi',
    'keplr',
    'leap',
    'station'
  ];

  providersToBlock.forEach(blockProperty);

  // 3. Prevent extensions from injecting scripts
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeName === 'SCRIPT') {
          const script = node as HTMLScriptElement;
          // Block scripts from extensions
          if (script.src && (
            script.src.includes('chrome-extension://') ||
            script.src.includes('moz-extension://') ||
            script.src.includes('safari-extension://') ||
            script.src.includes('ms-browser-extension://') ||
            script.src.includes('inpage.js') ||
            script.src.includes('metamask') ||
            script.src.includes('content-script')
          )) {
            console.log('🚫 Blocked extension script injection:', script.src);
            script.remove();
          }
        }
      });
    });
  });

  // Start observing when DOM is ready
  if (document.body) {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    });
  }

  // 4. Block extension message passing
  window.addEventListener('message', (event) => {
    // Block messages from extensions
    if (event.source !== window && (
      event.origin.includes('chrome-extension://') ||
      event.origin.includes('moz-extension://') ||
      event.origin.includes('safari-extension://') ||
      event.origin.includes('ms-browser-extension://')
    )) {
      event.stopImmediatePropagation();
      console.log('🚫 Blocked extension message:', event.origin);
      return;
    }
    
    // Also block if message data contains MetaMask-related content
    if (event.data && typeof event.data === 'object') {
      const dataStr = JSON.stringify(event.data).toLowerCase();
      if (dataStr.includes('metamask') || 
          dataStr.includes('ethereum') || 
          dataStr.includes('wallet_') ||
          dataStr.includes('eth_')) {
        event.stopImmediatePropagation();
        console.log('🚫 Blocked MetaMask message');
        return;
      }
    }
  }, true);

  // 5. Prevent extension content scripts from accessing our app data
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'postMessage');
    
    // Only override if it's configurable
    if (descriptor && descriptor.configurable === false) {
      console.log('⚠️ postMessage already locked, cannot override');
    } else {
      Object.defineProperty(window, 'postMessage', {
        value: new Proxy(window.postMessage, {
          apply(target, thisArg, args) {
            // Block MetaMask-related messages
            if (args[0] && typeof args[0] === 'object') {
              const msgStr = JSON.stringify(args[0]).toLowerCase();
              if (msgStr.includes('metamask') || 
                  msgStr.includes('ethereum') ||
                  msgStr.includes('wallet_')) {
                console.log('🚫 Blocked MetaMask postMessage');
                return;
              }
            }
            
            // Only allow postMessage from same origin
            if (args[1] && args[1] !== window.location.origin && args[1] !== '*') {
              console.log('🚫 Blocked cross-origin postMessage');
              return;
            }
            return Reflect.apply(target, thisArg, args);
          }
        }),
        writable: false,
        configurable: true // Keep configurable to avoid conflicts
      });
    }
  } catch (e) {
    console.log('⚠️ Could not override postMessage:', e);
  }

  // 6. Clear any extension-injected variables on load
  window.addEventListener('load', () => {
    providersToBlock.forEach(prop => {
      try {
        delete (window as any)[prop];
      } catch (e) {
        // Ignore if can't delete
      }
    });
    console.log('✅ Extension protection active');
  });

  // 7. Monitor and block extension API calls
  const blockGlobalAPI = (api: string) => {
    if ((window as any)[api]) {
      try {
        Object.defineProperty(window, api, {
          get() {
            return undefined;
          },
          configurable: false
        });
      } catch (e) {
        // Ignore
      }
    }
  };

  // Block common extension global APIs
  ['chrome', 'browser', 'msBrowser', 'safari'].forEach(blockGlobalAPI);

  // 8. Prevent MetaMask detection completely
  Object.defineProperty(window, 'isMetaMask', {
    get() { return false; },
    set() {},
    configurable: false
  });

  console.log('🛡️ Comprehensive extension protection initialized');
}

// Lazy load components to avoid bundling errors
const InspectorAuth = lazy(() => import('./components/InspectorAuth').then(m => ({ default: m.InspectorAuth })));
const InspectorDashboard = lazy(() => import('./components/InspectorDashboard').then(m => ({ default: m.InspectorDashboard })));
const ClientAuth = lazy(() => import('./components/ClientAuth').then(m => ({ default: m.ClientAuth })));
const ClientDashboard = lazy(() => import('./components/ClientDashboard').then(m => ({ default: m.ClientDashboard })));
const AdminAuth = lazy(() => import('./components/AdminAuth').then(m => ({ default: m.AdminAuth })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UpdatePassword = lazy(() => import('./components/UpdatePassword').then(m => ({ default: m.UpdatePassword })));

// Loading component
function LoadingScreen({ message = 'Cargando...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-amber-500/20"></div>
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
          {/* Inner pulse */}
          <div className="absolute inset-3 rounded-full bg-amber-500/20 animate-pulse"></div>
        </div>
        <p className="text-slate-400 animate-pulse">{message}</p>
      </div>
    </div>
  );
}

// Email Confirmation Handler Component
function EmailConfirmationHandler() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Procesando confirmación de email...');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the hash fragment from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (!accessToken) {
          setStatus('error');
          setMessage('Link inválido.');
          return;
        }

        if (type !== 'signup' && type !== 'recovery') {
          setStatus('error');
          setMessage('Tipo de link no soportado.');
          return;
        }

        // Exchange the token for a session
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || '',
        });

        if (error) {
          setStatus('error');
          setMessage(`Error al procesar el link: ${error.message}`);
          return;
        }

        if (data.session) {
          setStatus('success');
          
          if (type === 'recovery') {
             // Set recovery lock to prevent dashboard access
             sessionStorage.setItem('recovery_pending', 'true');
             
             setMessage('¡Identidad verificada! Redirigiendo para cambiar contraseña...');
             setTimeout(() => {
                // Force reload to apply the router lock
                window.location.href = '/?mode=update_password';
             }, 1500);
             return;
          }
          
          setMessage('¡Email confirmado exitosamente! Redirigiendo...');
          
          // Redirect based on user role
          const role = data.session.user.user_metadata?.role;
          setTimeout(() => {
            if (role === 'admin') {
              window.location.href = '/?mode=admin';
            } else if (role === 'inspector') {
              window.location.href = '/?mode=inspector';
            } else if (role === 'client') {
              window.location.href = '/?mode=client';
            } else {
              window.location.href = '/';
            }
          }, 2000);
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(`Error inesperado: ${err.message}`);
      }
    };

    handleEmailConfirmation();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl text-white font-bold mb-2">Confirmando Email</h2>
            <p className="text-slate-400">{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-xl bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">✅</span>
            </div>
            <h2 className="text-2xl text-white font-bold mb-2">¡Email Confirmado!</h2>
            <p className="text-slate-400">{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">❌</span>
            </div>
            <h2 className="text-2xl text-white font-bold mb-2">Error de Confirmación</h2>
            <p className="text-slate-400 mb-6">{message}</p>
            <a
              href="/"
              className="inline-block bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Volver al Inicio
            </a>
          </>
        )}
      </div>
    </div>
  );
}

// Landing Page Component
function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">BM</span>
          </div>
          <h1 className="text-4xl text-white font-bold mb-3">Brand Monitor</h1>
          <p className="text-slate-400 text-lg">Trade Marketing Intelligence Platform</p>
        </div>

        {/* Demo Button */}
        <div className="max-w-2xl mx-auto mb-8">
          <button
            onClick={() => window.location.href = '/?mode=demo'}
            className="w-full block group bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-xl p-6 shadow-2xl transition-all hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-3xl">✨</span>
                </div>
                <div className="text-left">
                  <h3 className="text-xl text-white font-bold mb-1">Ver Dashboard Demo</h3>
                  <p className="text-amber-100 text-sm">
                    Explora todas las funcionalidades sin necesidad de registro
                  </p>
                </div>
              </div>
              <div className="text-white text-2xl group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 max-w-2xl mx-auto mb-8">
          <div className="flex-1 h-px bg-slate-700"></div>
          <span className="text-slate-500 text-sm">o accede con tu cuenta</span>
          <div className="flex-1 h-px bg-slate-700"></div>
        </div>

        {/* Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Inspector Access */}
          <button
            onClick={() => window.location.href = '/?mode=inspector'}
            className="group bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-8 shadow-xl transition-all hover:scale-105 text-left"
          >
            <div className="w-16 h-16 rounded-lg bg-blue-600/20 flex items-center justify-center mb-6 group-hover:bg-blue-600/30 transition-colors">
              <span className="text-4xl">📋</span>
            </div>
            <h2 className="text-2xl text-white font-semibold mb-3">Inspector Access</h2>
            <p className="text-slate-400 mb-6">
              Para empleados de campo. Registra inspecciones de puntos de venta.
            </p>
            <div className="flex items-center gap-2 text-blue-400 font-medium">
              <span>Acceder como Inspector</span>
              <span>→</span>
            </div>
          </button>

          {/* Client Access */}
          <button
            onClick={() => window.location.href = '/?mode=client'}
            className="group bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 hover:border-amber-500/50 rounded-xl p-8 shadow-xl transition-all hover:scale-105 text-left"
          >
            <div className="w-16 h-16 rounded-lg bg-amber-600/20 flex items-center justify-center mb-6 group-hover:bg-amber-600/30 transition-colors">
              <span className="text-4xl">📊</span>
            </div>
            <h2 className="text-2xl text-white font-semibold mb-3">Client Access</h2>
            <p className="text-slate-400 mb-6">
              Para clientes. Visualiza el dashboard ejecutivo y métricas.
            </p>
            <div className="flex items-center gap-2 text-amber-400 font-medium">
              <span>Acceder como Cliente</span>
              <span>→</span>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-slate-500 text-sm">
          <p>© 2026 Brand Monitor. Trade Marketing Intelligence Platform.</p>
          
          {/* Hidden Admin Link */}
          <button
            onClick={() => window.location.href = '/?mode=admin'}
            className="opacity-0 hover:opacity-100 transition-opacity duration-500 inline-block mt-2 text-xs"
            title="Admin Access"
          >
            🔒 Admin
          </button>
        </div>
      </div>
    </div>
  );
}

// Inspector App Component - USANDO HOOK
function InspectorAppContent() {
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Check if user has inspector role OR admin role (admins can access all views)
  const isInspector = session?.user?.user_metadata?.role === 'inspector';
  const isAdmin = session?.user?.user_metadata?.role === 'admin';

  if (!session || (!isInspector && !isAdmin)) {
    return (
      <Suspense fallback={<LoadingScreen message="Cargando autenticación..." />}>
        <InspectorAuth onAuthSuccess={() => {}} />
      </Suspense>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = isAdmin ? '/?mode=admin' : '/?mode=inspector';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">📋</span>
              </div>
              <div>
                <h1 className="text-lg text-white font-semibold">Inspector Dashboard</h1>
                <p className="text-xs text-slate-400">
                  {session.user.user_metadata?.name || session.user.email}
                  {isAdmin && <span className="ml-2 px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded text-xs">Admin</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {isAdmin && (
                <button
                  onClick={() => window.location.href = '/?mode=admin'}
                  className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-lg transition-colors"
                >
                  <span className="text-sm">Volver a Admin</span>
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <Suspense fallback={<LoadingScreen message="Cargando dashboard..." />}>
        <InspectorDashboard session={session} />
      </Suspense>
    </div>
  );
}

function InspectorApp() {
  return <InspectorAppContent />;
}

// Client App Component - USANDO HOOK
function ClientAppContent() {
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // Check if user has client role OR admin role (admins can access all views)
  const isClient = session?.user?.user_metadata?.role === 'client';
  const isAdmin = session?.user?.user_metadata?.role === 'admin';

  if (!session || (!isClient && !isAdmin)) {
    return (
      <Suspense fallback={<LoadingScreen message="Cargando autenticación..." />}>
        <ClientAuth onAuthSuccess={() => {}} />
      </Suspense>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = isAdmin ? '/?mode=admin' : '/?mode=client';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-lg text-white font-semibold">Dashboard Cliente</h1>
                <p className="text-xs text-slate-400">
                  {session.user.user_metadata?.name || session.user.email}
                  {isAdmin && <span className="ml-2 px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded text-xs">Admin</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {isAdmin && (
                <button
                  onClick={() => window.location.href = '/?mode=admin'}
                  className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-400 px-4 py-2 rounded-lg transition-colors"
                >
                  <span className="text-sm">Volver a Admin</span>
                </button>
              )}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <Suspense fallback={<LoadingScreen message="Cargando dashboard..." />}>
        <ClientDashboard session={session} isDemo={false} />
      </Suspense>
    </div>
  );
}

function ClientApp() {
  return <ClientAppContent />;
}

// Admin App Component - USANDO HOOK
function AdminAppContent({ initialTicketId }: { initialTicketId?: string | null }) {
  const { session, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'admin' | 'inspector' | 'client'>('admin');

  if (loading) {
    return <LoadingScreen />;
  }

  // Check if user has admin role
  const isAdmin = session?.user?.user_metadata?.role === 'admin';

  if (!session || !isAdmin) {
    return (
      <Suspense fallback={<LoadingScreen message="Cargando autenticación..." />}>
        <AdminAuth onAuthSuccess={() => {}} />
      </Suspense>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/?mode=admin';
  };

  // Render different dashboards based on current view
  const renderDashboard = () => {
    switch (currentView) {
      case 'inspector':
        return (
          <Suspense fallback={<LoadingScreen message="Cargando vista inspector..." />}>
            <InspectorDashboard session={session} />
          </Suspense>
        );
      case 'client':
        return (
          <Suspense fallback={<LoadingScreen message="Cargando vista cliente..." />}>
            <ClientDashboard session={session} isDemo={false} />
          </Suspense>
        );
      default:
        return (
          <Suspense fallback={<LoadingScreen message="Cargando panel..." />}>
            <AdminDashboard session={session} initialTicketId={initialTicketId} />
          </Suspense>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4">
          {/* Title and Logout Row */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">⚙️</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-lg text-white font-semibold truncate">
                  {currentView === 'admin' && 'Panel de Administración'}
                  {currentView === 'inspector' && 'Vista Inspector (Admin)'}
                  {currentView === 'client' && 'Vista Cliente (Admin)'}
                </h1>
                <p className="text-xs text-slate-400 truncate">
                  {session.user.user_metadata?.name || session.user.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <LanguageSwitcher />
              
              {/* Logout Button */}
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm hidden sm:inline whitespace-nowrap">Cerrar Sesión</span>
              </button>
            </div>
          </div>
          
          {/* View Selector Buttons Row */}
          <div className="flex items-center justify-center sm:justify-start">
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  currentView === 'admin'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="text-base">⚙️</span>
                <span className="hidden sm:inline">Admin</span>
              </button>
              <button
                onClick={() => setCurrentView('inspector')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  currentView === 'inspector'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="text-base">📋</span>
                <span className="hidden sm:inline">Inspector</span>
              </button>
              <button
                onClick={() => setCurrentView('client')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  currentView === 'client'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <span className="text-base">📊</span>
                <span className="hidden sm:inline">Cliente</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      {renderDashboard()}
    </div>
  );
}

function AdminApp() {
  return <AdminAppContent />;
}

// Demo Mode Component
function DemoApp() {
  const demoSession = {
    user: {
      email: 'demo@brandmonitor.com',
      user_metadata: {
        name: 'Usuario Demo',
        role: 'client'
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 py-2 px-4 text-center">
        <p className="text-white text-sm font-medium">
          ✨ Modo Demostración - Todos los datos son de ejemplo • 
          <button onClick={() => window.location.href = '/'} className="underline ml-2 hover:text-amber-100">
            Crear cuenta para usar datos reales
          </button>
        </p>
      </div>
      
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">✨</span>
              </div>
              <div>
                <h1 className="text-lg text-white font-semibold">Dashboard Demo</h1>
                <p className="text-xs text-slate-400">
                  Modo demostración - Datos de ejemplo
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span className="text-sm">Volver al Inicio</span>
            </button>
          </div>
        </div>
      </header>
      <Suspense fallback={<LoadingScreen message="Cargando demo..." />}>
        <ClientDashboard session={demoSession} isDemo={true} />
      </Suspense>
    </div>
  );
}

// Main App Router
export default function App() {
  const [mode, setMode] = useState<string>('landing');
  const [ticketId, setTicketId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check query param
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    
    // 2. Check path for ticket URL: /admin/tickets/:id
    const path = window.location.pathname;
    const ticketMatch = path.match(/^\/admin\/tickets\/([a-zA-Z0-9-]+)$/);

    if (ticketMatch) {
      setMode('admin');
      setTicketId(ticketMatch[1]);
    } else if (modeParam) {
      setMode(modeParam);
    }
  }, []);

  // Wrap everything in ONE AuthProvider and LanguageProvider
  return (
    <LanguageProvider>
      <AuthProvider>
        <Toaster 
          theme="dark" 
          position="top-right" 
          richColors 
          closeButton
          toastOptions={{
            style: {
              background: 'rgba(15, 23, 42, 0.9)', // slate-900 with opacity
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
            },
            className: 'glass-toast'
          }}
        />
        <AppRouter mode={mode} ticketId={ticketId} />
      </AuthProvider>
    </LanguageProvider>
  );
}

// Internal router that uses the context
function AppRouter({ mode, ticketId }: { mode: string, ticketId: string | null }) {
  // Route based on mode
  
  // 0. Security: Enforce Password Reset if in recovery mode
  // This prevents the user from accessing the dashboard even if they are technically authenticated via the magic link
  if (typeof window !== 'undefined' && (sessionStorage.getItem('recovery_pending') === 'true' || sessionStorage.getItem('auth_reset_mode') === 'true')) {
    return (
      <Suspense fallback={<LoadingScreen message="Cargando..." />}>
        <UpdatePassword />
      </Suspense>
    );
  }

  if (mode === 'demo') {
    return <DemoApp />;
  }

  if (mode === 'inspector') {
    return <InspectorAppContent />;
  }

  if (mode === 'client') {
    return <ClientAppContent />;
  }

  if (mode === 'admin') {
    return <AdminAppContent initialTicketId={ticketId} />;
  }
  
  if (mode === 'update_password') {
    return (
      <Suspense fallback={<LoadingScreen message="Cargando..." />}>
        <UpdatePassword />
      </Suspense>
    );
  }

  // Check for email confirmation hash
  if (window.location.hash.includes('access_token')) {
    return <EmailConfirmationHandler />;
  }

  // Default to landing page
  return <LandingPage />;
}