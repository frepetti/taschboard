import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface SecurityCheck {
  name: string;
  status: 'protected' | 'vulnerable' | 'unknown';
  description: string;
}

export function SecurityStatus() {
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    performSecurityChecks();
  }, []);

  const performSecurityChecks = () => {
    const securityChecks: SecurityCheck[] = [
      {
        name: 'Ethereum Provider',
        status: typeof (window as any).ethereum === 'undefined' ? 'protected' : 'vulnerable',
        description: 'MetaMask and Web3 wallet detection'
      },
      {
        name: 'Web3 Provider',
        status: typeof (window as any).web3 === 'undefined' ? 'protected' : 'vulnerable',
        description: 'Legacy Web3 provider blocking'
      },
      {
        name: 'Chrome Extension API',
        status: typeof (window as any).chrome === 'undefined' ? 'protected' : 'vulnerable',
        description: 'Chrome extension API access'
      },
      {
        name: 'Phantom Wallet',
        status: typeof (window as any).phantom === 'undefined' ? 'protected' : 'vulnerable',
        description: 'Solana wallet detection'
      },
      {
        name: 'Coinbase Wallet',
        status: typeof (window as any).coinbaseWalletExtension === 'undefined' ? 'protected' : 'vulnerable',
        description: 'Coinbase wallet extension'
      },
      {
        name: 'Extension Scripts',
        status: checkForExtensionScripts() ? 'vulnerable' : 'protected',
        description: 'Extension-injected scripts'
      }
    ];

    setChecks(securityChecks);
  };

  const checkForExtensionScripts = (): boolean => {
    const scripts = Array.from(document.getElementsByTagName('script'));
    return scripts.some(script => 
      script.src.includes('chrome-extension://') ||
      script.src.includes('moz-extension://') ||
      script.src.includes('safari-extension://')
    );
  };

  const protectedCount = checks.filter(c => c.status === 'protected').length;
  const vulnerableCount = checks.filter(c => c.status === 'vulnerable').length;
  const totalChecks = checks.length;
  const securityScore = totalChecks > 0 ? Math.round((protectedCount / totalChecks) * 100) : 0;

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development' && !window.location.search.includes('debug=true')) {
    return null;
  }

  return (
    <>
      {/* Floating Security Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 ${
          securityScore === 100
            ? 'bg-green-600 hover:bg-green-500'
            : securityScore >= 50
            ? 'bg-yellow-600 hover:bg-yellow-500'
            : 'bg-red-600 hover:bg-red-500'
        }`}
        title={`Security Score: ${securityScore}%`}
      >
        <Shield className="w-6 h-6 text-white" />
      </button>

      {/* Security Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 bg-surface-card border border-border-subtle rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className={`p-4 border-b border-border-subtle ${
            securityScore === 100
              ? 'bg-green-600/20'
              : securityScore >= 50
              ? 'bg-yellow-600/20'
              : 'bg-red-600/20'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-theme-primary" />
                <h3 className="text-content-main font-semibold">Security Status</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-content-muted hover:text-content-main transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-surface-card-subtle rounded-full h-2 overflow-hidden border border-border-subtle/50">
                <div
                  className={`h-full transition-all duration-500 ${
                    securityScore === 100
                      ? 'bg-green-500'
                      : securityScore >= 50
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${securityScore}%` }}
                />
              </div>
              <span className="text-content-main font-bold text-sm">{securityScore}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 border-b border-border-subtle bg-surface-card-subtle/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{protectedCount}</div>
              <div className="text-xs text-content-muted">Protected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{vulnerableCount}</div>
              <div className="text-xs text-content-muted">Vulnerable</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-content-main">{totalChecks}</div>
              <div className="text-xs text-content-muted">Total Checks</div>
            </div>
          </div>

          {/* Security Checks List */}
          <div className="p-4 max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {checks.map((check, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all ${
                    check.status === 'protected'
                      ? 'bg-green-500/10 border-green-500/30'
                      : check.status === 'vulnerable'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-surface-card-subtle border-border-subtle'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {check.status === 'protected' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : check.status === 'vulnerable' ? (
                        <XCircle className="w-5 h-5 text-red-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-content-main font-medium text-sm">{check.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            check.status === 'protected'
                              ? 'bg-green-500/20 text-green-400'
                              : check.status === 'vulnerable'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {check.status === 'protected' ? '✓' : check.status === 'vulnerable' ? '✗' : '?'}
                        </span>
                      </div>
                      <p className="text-xs text-content-muted mt-1">{check.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border-subtle bg-surface-card-subtle">
            <div className="flex items-center justify-between text-xs">
              <span className="text-content-muted">Extension Protection</span>
              <button
                onClick={performSecurityChecks}
                className="text-theme-primary hover:underline transition-colors font-medium"
              >
                Refresh ↻
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
