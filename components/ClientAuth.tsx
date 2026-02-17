import React, { useState } from 'react';
import { supabase } from '../utils/supabase/client';
import { Loader2, Mail, Lock, User, AlertCircle, LogIn, ArrowLeft, UserPlus } from 'lucide-react';
import { authAPI } from '../utils/api';

interface ClientAuthProps {
  onAuthSuccess: (session: any) => void;
}

export function ClientAuth({ onAuthSuccess }: ClientAuthProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>('login');
  const [resetStep, setResetStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

      // Verify role is client
      if (data.session && data.session.user.user_metadata?.role !== 'client') {
        setError('Acceso denegado. Esta cuenta no está registrada como cliente.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      // Check approval status in btl_usuarios
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('btl_usuarios')
          .select('estado_aprobacion')
          .eq('email', data.user.email)
          .single();

        if (userError) {
          console.error('Error checking user approval status:', userError);
          setError('Error al verificar el estado de la cuenta. Por favor contacta al administrador.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (userData?.estado_aprobacion === 'pending') {
          setError('⏳ Tu cuenta está pendiente de aprobación. Un administrador debe aprobar tu solicitud antes de que puedas acceder.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        if (userData?.estado_aprobacion === 'rejected') {
          setError('❌ Tu solicitud de cuenta fue rechazada. Por favor contacta al administrador para más información.');
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }
      }

      if (data.session) {
        onAuthSuccess(data.session);
      }
    } catch (err: any) {
      setError(err.message || 'Error durante el login');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create client user via backend
      const result = await authAPI.signup(email, password, name, 'client', company);

      if (!result.success) {
        // Provide more specific error messages for signup
        const errorMsg = result.error || 'Error durante el registro';
        if (errorMsg.includes('already registered') || errorMsg.includes('already exists')) {
          setError('Este email ya está registrado. Por favor, intenta iniciar sesión.');
          setMode('login');
        } else if (errorMsg.includes('invalid') || errorMsg.includes('credentials')) {
          setError('Error al crear la cuenta. Verifica que el email sea válido y la contraseña tenga al menos 6 caracteres.');
        } else {
          setError(errorMsg);
        }
        setLoading(false);
        return;
      }

      // Now sign in with the created credentials
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If auto-login fails, show success message and switch to login
        setSuccessMessage('✅ Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
        setMode('login');
        setLoading(false);
        return;
      }

      if (data.session) {
        onAuthSuccess(data.session);
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Error inesperado durante el registro';
      if (errorMsg.includes('already registered') || errorMsg.includes('already exists')) {
        setError('Este email ya está registrado. Por favor, intenta iniciar sesión.');
        setMode('login');
      } else if (errorMsg.includes('invalid') || errorMsg.includes('credentials')) {
        setError('Error al crear la cuenta. Verifica que el email sea válido y la contraseña tenga al menos 6 caracteres.');
      } else {
        setError(errorMsg);
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver al Inicio</span>
        </a>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h1 className="text-3xl text-white font-bold mb-2">Client Login</h1>
          <p className="text-slate-400">Acceso al Dashboard Ejecutivo</p>
        </div>

        {/* Auth Form */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 shadow-2xl">
          {/* Mode Tabs - DISABLED (Sign Up removed from UI) */}
          {/*
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === 'login'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>
          */}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400">{error}</p>
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
                      <label className="block text-sm text-slate-300 mb-2">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@empresa.com"
                        required
                        className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                      <Mail className="w-5 h-5" />
                      <span>{loading ? 'Enviando...' : 'Enviar Código de Recuperación'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSkipToOtp}
                      className="w-full text-sm text-slate-400 hover:text-white transition-colors py-2 mt-2"
                    >
                      ¿Ya tienes un código? Ingrésalo aquí
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                     <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
                        <p className="text-sm text-amber-300 text-center">
                           {successMessage || <>Ingresa el código enviado a <strong>{email}</strong></>}
                        </p>
                     </div>
                     <div>
                      <label className="block text-sm text-slate-300 mb-2">Código de Verificación</label>
                      <input
                        type="text"
                        value={otpToken}
                        onChange={(e) => setOtpToken(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="123456"
                        required
                        className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-center text-2xl tracking-widest font-mono"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || otpToken.length < 6}
                      className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-green-500/20 disabled:shadow-none flex items-center justify-center gap-2"
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
                      className="w-full text-sm text-slate-400 hover:text-white transition-colors py-2"
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
                  className="w-full text-sm text-slate-400 hover:text-white transition-colors py-2 border-t border-slate-700/50 mt-4"
                >
                  Volver al Login
                </button>
             </div>
          ) : (
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Nombre Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    required={mode === 'signup'}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Empresa</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nombre de tu empresa"
                    required={mode === 'signup'}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@empresa.com"
                required
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-300 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              {mode === 'signup' && (
                <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres</p>
              )}
               {mode === 'login' && (
                    <div className="flex justify-end mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setMode('forgot_password');
                            setError('');
                            setSuccessMessage('');
                          }}
                          className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none"
            >
              {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>
          )}

          {/* Footer - HIDDEN */}
          {/*
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center">
              {mode === 'login' 
                ? '¿Nuevo cliente? Cambia a Sign Up' 
                : '¿Ya tienes cuenta? Cambia a Login'}
            </p>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}