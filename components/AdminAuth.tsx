import React, { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { Mail, Lock, AlertCircle, LogIn, ArrowLeft } from 'lucide-react';

interface AdminAuthProps {
  onAuthSuccess: (session: any) => void;
}

export function AdminAuth({ onAuthSuccess }: AdminAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [resetStep, setResetStep] = useState<'email' | 'otp'>('email');
  const [otpToken, setOtpToken] = useState('');

  const handleSkipToOtp = () => {
    if (!email || !email.includes('@')) {
      setError('Por favor ingresa tu email primero para validar el código.');
      return;
    }
    setError('');
    setSuccessMessage('');
    setResetStep('otp');
  };

  const handleSendRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Use SignInWithOtp
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (error) {
        if (error.message.includes('security purposes')) {
          const secondsMatch = error.message.match(/after (\d+) seconds/);
          const seconds = secondsMatch ? secondsMatch[1] : 'unos';
          setError(`⏳ Por seguridad, debes esperar ${seconds} segundos antes de solicitar otro código.`);
        } else {
          setError(error.message);
        }
      } else {
        setSuccessMessage('✅ Código enviado. Por favor revisa tu correo e ingresa el código numérico.');
        setResetStep('otp');
      }
    } catch (err: any) {
      setError(err.message || 'Error al enviar código');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Verify the OTP
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpToken,
        type: 'email',
      });

      if (error) {
        setError('El código ingresado es inválido o ha expirado.');
        setLoading(false);
        return;
      }

      if (data.session) {
        // Set flag to force Password Update screen
        sessionStorage.setItem('auth_reset_mode', 'true');
        // Reload to trigger AppRouter redirection
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || 'Error al verificar código');
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Verify role in public table (Source of Truth) instead of metadata
      if (data.session && data.user) {
        console.log('🔍 Checking user role for:', data.user.email, 'Auth ID:', data.user.id);

        const { data: userData, error: userError } = await supabase
          .from('btl_usuarios')
          .select('rol, estado_aprobacion')
          .eq('auth_user_id', data.user.id) // Use auth_user_id for lookup
          .single();

        console.log('📊 Query by auth_user_id result:', { userData, userError });

        if (userError) {
          // Fallback: try email lookup if auth_user_id fails (migration support)
          console.log('⚠️ auth_user_id lookup failed, trying email fallback');

          const { data: userDataByEmail, error: emailError } = await supabase
            .from('btl_usuarios')
            .select('rol, estado_aprobacion')
            .eq('email', data.user.email!)
            .single();

          console.log('📊 Query by email result:', { userDataByEmail, emailError });

          if (emailError) {
            console.error('❌ Both lookups failed:', { userError, emailError });
            setError('Error al verificar permisos. Contacta soporte.');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          console.log('✅ Found user by email, checking role:', userDataByEmail?.rol);

          if (userDataByEmail?.rol !== 'admin') {
            console.error('❌ User role is not admin:', userDataByEmail?.rol);
            setError('Acceso denegado. Esta cuenta no tiene permisos de administrador.');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
        } else {
          console.log('✅ Found user by auth_user_id, checking role:', userData?.rol);

          if (userData?.rol !== 'admin') {
            console.error('❌ User role is not admin:', userData?.rol);
            setError('Acceso denegado. Esta cuenta no tiene permisos de administrador.');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          if (userData?.estado_aprobacion === 'pending') {
            console.warn('⏳ User pending approval');
            setError('⏳ Tu cuenta está pendiente de aprobación.');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }

          if (userData?.estado_aprobacion === 'rejected') {
            console.warn('❌ User rejected');
            setError('❌ Tu solicitud de cuenta fue rechazada.');
            await supabase.auth.signOut();
            setLoading(false);
            return;
          }
        }

        console.log('✅ All checks passed, proceeding with login');
      }

      if (data.session) {
        onAuthSuccess(data.session);
      }
    } catch (err: any) {
      setError(err.message || 'Error durante el login');
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: 'admin',
            name: name,
          },
        },
      });

      if (error) {
        // Provide more specific error messages
        if (error.message.includes('already registered')) {
          setError('Este email ya está registrado. Por favor, intenta iniciar sesión.');
          setMode('login');
        } else if (error.message.includes('invalid') || error.message.includes('credentials')) {
          setError('Error al crear la cuenta. Verifica que el email sea válido y la contraseña tenga al menos 6 caracteres.');
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        onAuthSuccess(data.session);
      } else if (data.user) {
        // User created but needs email confirmation
        setError('✅ Cuenta creada exitosamente. Revisa tu email para confirmar tu cuenta antes de iniciar sesión.');
        setMode('login');
        setLoading(false);
      } else {
        // Unknown state
        setError('Cuenta creada pero requiere configuración adicional. Contacta al administrador del sistema.');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado durante el registro. Por favor, intenta nuevamente.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-app flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-content-muted hover:text-content-main transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al Inicio</span>
        </a>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-theme-primary/10 border border-theme-primary/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚙️</span>
          </div>
          <h1 className="text-3xl text-content-main font-bold mb-2">
            {mode === 'login' ? 'Admin Login' : mode === 'register' ? 'Registrar Admin' : 'Recuperar Acceso'}
          </h1>
          <p className="text-content-muted">Panel de Administración del Sistema</p>
        </div>

        {/* Auth Form */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-8 shadow-2xl">
          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${error.includes('✅') ? 'bg-green-500/10 border border-green-500/50' : 'bg-red-500/10 border border-red-500/50'}`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${error.includes('✅') ? 'text-green-400' : 'text-red-400'}`} />
              <div className="flex-1">
                <p className={`text-sm ${error.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-green-400">{successMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          {mode === 'forgot_password' ? (
            <div className="space-y-4">
              {resetStep === 'email' ? (
                <form onSubmit={handleSendRecoveryCode} className="space-y-4">
                  <div>
                    <label className="block text-sm text-content-muted mb-2">Email de Administrador</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@empresa.com"
                      required
                      className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted px-4 py-3 rounded-lg focus:outline-none focus:border-theme-primary/50"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-theme-primary hover:brightness-95 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    <span>{loading ? 'Enviando...' : 'Enviar Código de Recuperación'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSkipToOtp}
                    className="w-full text-sm text-content-muted hover:text-content-main transition-colors py-2 mt-2"
                  >
                    ¿Ya tienes un código? Ingrésalo aquí
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div className="p-4 bg-theme-primary/10 border border-theme-primary/30 rounded-lg mb-4">
                    <p className="text-sm text-theme-primary text-center">
                      {successMessage || <>Ingresa el código enviado a <strong>{email}</strong></>}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-content-muted mb-2">Código de Verificación</label>
                    <input
                      type="text"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="123456"
                      required
                      className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted px-4 py-3 rounded-lg focus:outline-none focus:border-theme-primary/50 text-center text-2xl tracking-widest font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || otpToken.length < 6}
                    className="w-full bg-theme-primary hover:brightness-95 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    <span>{loading ? 'Verificando...' : 'Verificar y Cambiar Password'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('email');
                      setOtpToken('');
                      setError('');
                    }}
                    className="w-full text-sm text-content-muted hover:text-content-main transition-colors py-2"
                  >
                    Volver a ingresar email
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setResetStep('email');
                  setError('');
                  setSuccessMessage('');
                }}
                className="w-full text-sm text-content-muted hover:text-content-main transition-colors py-2 border-t border-border-subtle mt-4"
              >
                Volver al Login
              </button>
            </div>
          ) : (
            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm text-content-muted mb-2">Email de Administrador</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                  required
                  className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted px-4 py-3 rounded-lg focus:outline-none focus:border-theme-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm text-content-muted mb-2">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted px-4 py-3 rounded-lg focus:outline-none focus:border-theme-primary/50"
                />
                {mode === 'login' && (
                  <div className="flex justify-end mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot_password');
                        setError('');
                      }}
                      className="text-xs text-theme-primary hover:underline transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}
              </div>

              {mode === 'register' && (
                <div>
                  <label className="block text-sm text-content-muted mb-2">Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nombre del Administrador"
                    required
                    className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted px-4 py-3 rounded-lg focus:outline-none focus:border-theme-primary/50"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-theme-primary hover:brightness-95 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>{loading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</span>
              </button>
            </form>
          )}

          {/* Warning */}
          {mode !== 'forgot_password' && (
            <div className="mt-6 pt-6 border-t border-border-subtle">
              <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
                <p className="text-xs text-amber-400 text-center">
                  ⚠️ Acceso restringido solo para administradores del sistema
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}