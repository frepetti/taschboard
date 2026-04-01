import { useState } from 'react';
import { Settings, Save, Loader2, Key, ShieldAlert } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

export function SettingsManagement() {
  const [demoKeyword, setDemoKeyword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDemoKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoKeyword.trim()) {
      toast.error('La palabra clave no puede estar vacía');
      return;
    }

    if (demoKeyword.length < 4) {
      toast.error('La palabra clave debe tener al menos 4 caracteres');
      return;
    }

    setIsSaving(true);
    try {
      // @ts-ignore - Supabase type definition not updated yet with the new RPC
      const { data, error } = await supabase.rpc('set_demo_keyword', {
        new_keyword: demoKeyword.trim()
      });

      if (error) throw error;
      
      if (data) {
        toast.success('Palabra clave del modo demo actualizada exitosamente');
        setDemoKeyword(''); // Clear the input after success
      }
    } catch (error: any) {
      console.error('Error saving demo keyword:', error);
      toast.error(error.message || 'Error al actualizar la palabra clave');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Settings className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Ajustes del Sistema</h2>
          <p className="text-sm text-slate-400">Configuraciones generales y de seguridad</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security / Demo Settings Card */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-white">Seguridad de Acceso Demo</h3>
          </div>

          <p className="text-sm text-slate-400 mb-6">
            Define u actualiza la palabra clave requerida para que los usuarios puedan entrar al modo demostración desde la landing page.
          </p>

          <form onSubmit={handleSaveDemoKeyword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Palabra Clave (Keyword)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="w-5 h-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={demoKeyword}
                  onChange={(e) => setDemoKeyword(e.target.value)}
                  placeholder="Nueva palabra clave..."
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || !demoKeyword.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Actualizar Keyword
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
