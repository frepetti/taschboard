import { useState } from 'react';
import { Bug, X, RefreshCw } from 'lucide-react';
// import { projectId, publicAnonKey } from '../utils/supabase/info';
import { checkAuthStatus } from '../utils/api-direct';

interface DebugPanelProps {
  session: any;
}

export function DebugPanel({ session }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [debugResults, setDebugResults] = useState<any>(null);
  const [testing, setTesting] = useState(false);

  const runDebugTests = async () => {
    setTesting(true);
    const results: any = {
      session: {},
      directAPI: {},
      timestamp: new Date().toISOString(),
    };

    // Test 1: Session info
    results.session = {
      exists: !!session,
      hasAccessToken: !!session?.access_token,
      tokenLength: session?.access_token?.length || 0,
      tokenPreview: session?.access_token?.substring(0, 20) + '...' || 'N/A',
      user: {
        id: session?.user?.id || 'N/A',
        email: session?.user?.email || 'N/A',
        emailConfirmed: session?.user?.email_confirmed_at ? '✅ Yes' : '❌ No',
        role: session?.user?.role || session?.user?.user_metadata?.role || 'N/A',
      },
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'N/A',
      isExpired: session?.expires_at ? Date.now() > session.expires_at * 1000 : 'Unknown',
    };

    // Test 2: Direct API Auth Check
    try {
      console.log('🔍 Testing Direct API auth...');
      const authStatus = await checkAuthStatus();

      results.directAPI.authCheck = {
        status: authStatus.authenticated ? '✅ Authenticated' : '❌ Not Authenticated',
        authenticated: authStatus.authenticated,
        user: authStatus.user || null,
        error: authStatus.error || null,
      };
    } catch (error: any) {
      results.directAPI.authCheck = {
        status: '❌ Failed',
        error: error.message,
      };
    }

    setDebugResults(results);
    setTesting(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-theme-primary hover:brightness-95 text-white p-3 rounded-full shadow-lg z-50 transition-colors"
        title="Open Debug Panel"
      >
        <Bug className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface-card border border-border-subtle text-content-main rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-surface-card-subtle px-6 py-4 flex items-center justify-between border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <Bug className="w-6 h-6 text-theme-primary" />
            <h2 className="text-xl font-bold text-content-main">Debug Panel</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-content-muted hover:text-content-main transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-content-muted">
              This panel shows your session info and tests the Edge Function connection.
            </p>
            <button
              onClick={runDebugTests}
              disabled={testing}
              className="flex items-center gap-2 bg-theme-primary hover:brightness-95 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              Run Tests
            </button>
          </div>

          {debugResults && (
            <div className="space-y-6">
              {/* Session Info */}
              <div className="bg-surface-card-subtle border border-border-subtle rounded-lg p-4">
                <h3 className="text-lg font-semibold text-content-main mb-3">1. Session Information</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-content-muted">Session exists:</span>
                    <span className={debugResults.session.exists ? 'text-green-400' : 'text-red-400'}>
                      {debugResults.session.exists ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted">Has access token:</span>
                    <span className={debugResults.session.hasAccessToken ? 'text-green-400' : 'text-red-400'}>
                      {debugResults.session.hasAccessToken ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted">Token length:</span>
                    <span className="text-content-main">{debugResults.session.tokenLength} chars</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted">Token preview:</span>
                    <span className="text-content-main text-xs">{debugResults.session.tokenPreview}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted">User email:</span>
                    <span className="text-content-main">{debugResults.session.user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted">Email confirmed:</span>
                    <span className={debugResults.session.user.emailConfirmed.includes('✅') ? 'text-green-400' : 'text-red-400'}>
                      {debugResults.session.user.emailConfirmed}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted">Token expires:</span>
                    <span className="text-content-main text-xs">{debugResults.session.expiresAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-content-muted">Is expired:</span>
                    <span className={!debugResults.session.isExpired ? 'text-green-400' : 'text-red-400'}>
                      {debugResults.session.isExpired ? '❌ Yes (expired!)' : '✅ No (valid)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Direct API Auth Check */}
              <div className="bg-surface-card-subtle border border-border-subtle rounded-lg p-4">
                <h3 className="text-lg font-semibold text-content-main mb-3">2. Direct API Auth Check</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-content-muted">Status:</span>
                    <span className={debugResults.directAPI.authCheck.authenticated ? 'text-green-400' : 'text-red-400'}>
                      {debugResults.directAPI.authCheck.status}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-content-muted">Response:</span>
                    <pre className="mt-1 bg-surface-card p-2 rounded overflow-x-auto text-xs text-green-400 border border-border-subtle">
                      {JSON.stringify(debugResults.directAPI.authCheck.user || debugResults.directAPI.authCheck.error, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-theme-primary/10 border border-theme-primary/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-theme-primary mb-2">📊 Summary</h3>
                <div className="text-sm space-y-1">
                  {debugResults.session.exists && debugResults.session.hasAccessToken ? (
                    <p className="text-green-400">✅ Session is valid and has access token</p>
                  ) : (
                    <p className="text-red-400">❌ Session is missing or invalid</p>
                  )}

                  {debugResults.directAPI.authCheck.authenticated ? (
                    <p className="text-green-400">✅ Direct API auth check passed</p>
                  ) : (
                    <p className="text-red-400">❌ Direct API auth check failed - Status: {debugResults.directAPI.authCheck.status}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {!debugResults && (
            <div className="text-center py-12 text-content-muted">
              Click &quot;Run Tests&quot; to check the connection
            </div>
          )}
        </div>
      </div>
    </div>
  );
}