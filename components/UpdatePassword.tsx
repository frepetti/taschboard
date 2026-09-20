import React, { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { Loader2, Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      // Sign out to prevent auto-login
      await supabase.auth.signOut();
      
      // Clear recovery locks
      sessionStorage.removeItem('recovery_pending');
      sessionStorage.removeItem('auth_reset_mode');

      setSuccess(true);
      
      // Redirect after delay
      setTimeout(() => {
        window.location.href = '/?mode=login'; // Explicitly go to login
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-app flex items-center justify-center p-4">
        <div className="bg-surface-card border border-border-subtle rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl text-content-main font-bold mb-4">¡Contraseña Actualizada!</h2>
          <p className="text-content-muted mb-6">
            Tu contraseña ha sido modificada exitosamente. Serás redirigido al inicio de sesión en unos segundos.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-theme-primary hover:brightness-95 text-white px-6 py-3 rounded-lg font-medium transition-colors w-full shadow-sm"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-app flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-theme-primary/10 flex items-center justify-center mx-auto mb-4 border border-theme-primary/30">
            <Lock className="w-8 h-8 text-theme-primary" />
          </div>
          <h1 className="text-3xl text-content-main font-bold mb-2">Nueva Contraseña</h1>
          <p className="text-content-muted">Ingresa tu nueva contraseña para recuperar el acceso</p>
        </div>

        <div className="bg-surface-card border border-border-subtle rounded-xl p-8 shadow-xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm text-content-muted mb-2">Nueva Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted px-4 py-3 rounded-lg focus:outline-none focus:border-theme-primary/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm text-content-muted mb-2">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted px-4 py-3 rounded-lg focus:outline-none focus:border-theme-primary/50 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-theme-primary hover:brightness-95 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Actualizando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Actualizar Contraseña</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border-subtle text-center">
            <a href="/" className="text-sm text-content-muted hover:text-content-main transition-colors inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al inicio</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}