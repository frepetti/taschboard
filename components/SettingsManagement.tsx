import React, { useState } from 'react';
import { Settings, Save, Loader2, Key, ShieldAlert, Palette, Plus, Edit2, Check, X } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { useTheme, Theme, ThemeConfig } from '../context/ThemeContext';

interface ThemeFormData {
  id?: string;
  nombre: string;
  slug: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  border_color: string;
  badge_style: string;
}

const DEFAULT_FORM_DATA: ThemeFormData = {
  nombre: '',
  slug: '',
  primary_color: '#7c3aed',
  secondary_color: '#4c1d95',
  accent_color: '#ec4899',
  border_color: '#334155',
  badge_style: 'default',
};

export function SettingsManagement() {
  const [demoKeyword, setDemoKeyword] = useState('');
  const [isSavingKeyword, setIsSavingKeyword] = useState(false);

  // Theme Management
  const { themes, currentTheme, setTheme, refreshThemes } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ThemeFormData>(DEFAULT_FORM_DATA);
  const [isSavingTheme, setIsSavingTheme] = useState(false);

  // Handle Demo Keyword
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

    setIsSavingKeyword(true);
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
      setIsSavingKeyword(false);
    }
  };

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingThemeId(null);
    setFormData(DEFAULT_FORM_DATA);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (theme: Theme) => {
    setEditingThemeId(theme.id);
    setFormData({
      id: theme.id,
      nombre: theme.nombre,
      slug: theme.slug,
      primary_color: theme.primary_color,
      secondary_color: theme.secondary_color,
      accent_color: theme.accent_color,
      border_color: theme.border_color,
      badge_style: theme.config?.badge_style || 'default',
    });
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingThemeId(null);
    setFormData(DEFAULT_FORM_DATA);
  };

  // Save Theme (Create or Update)
  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast.error('El nombre del tema es obligatorio');
      return;
    }

    const cleanSlug = formData.slug.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    if (!cleanSlug) {
      toast.error('El identificador (slug) es obligatorio y debe contener solo caracteres alfanuméricos');
      return;
    }

    // Hex color format validator
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (
      !hexRegex.test(formData.primary_color) ||
      !hexRegex.test(formData.secondary_color) ||
      !hexRegex.test(formData.accent_color) ||
      !hexRegex.test(formData.border_color)
    ) {
      toast.error('Todos los colores deben ser códigos hexadecimales válidos (ej. #008200)');
      return;
    }

    setIsSavingTheme(true);

    const themeConfig: ThemeConfig = {
      badge_style: formData.badge_style,
      score_shape: formData.badge_style === 'heineken_star' ? 'red_star' : 'default',
    };

    const payload = {
      nombre: formData.nombre.trim(),
      slug: cleanSlug,
      primary_color: formData.primary_color,
      secondary_color: formData.secondary_color,
      accent_color: formData.accent_color,
      border_color: formData.border_color,
      config: themeConfig,
      activo: true,
    };

    try {
      if (editingThemeId) {
        // Update existing theme
        const { error } = await supabase
          .from('btl_temas')
          .update(payload)
          .eq('id', editingThemeId);

        if (error) throw error;
        toast.success(`Tema "${formData.nombre}" actualizado correctamente`);
      } else {
        // Insert new theme
        const { error } = await supabase
          .from('btl_temas')
          .insert([payload]);

        if (error) {
          if (error.code === '23505') {
            throw new Error(`El identificador "${cleanSlug}" ya está en uso.`);
          }
          throw error;
        }
        toast.success(`Tema "${formData.nombre}" creado exitosamente`);
      }

      await refreshThemes();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving theme:', err);
      toast.error(err.message || 'Error al guardar el tema en la base de datos');
    } finally {
      setIsSavingTheme(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-theme-primary/20 text-theme-primary border border-theme-primary/30 rounded-lg">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-content-main">Ajustes del Sistema</h2>
          <p className="text-sm text-content-muted">Configuraciones generales, de seguridad y personalización visual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security / Demo Settings Card */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-content-main">Seguridad de Acceso Demo</h3>
            </div>

            <p className="text-sm text-content-muted mb-6">
              Define o actualiza la palabra clave requerida para que los usuarios puedan entrar al modo demostración desde la landing page.
            </p>

            <form onSubmit={handleSaveDemoKeyword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-content-main mb-2">
                  Palabra Clave (Keyword)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="w-5 h-5 text-content-muted" />
                  </div>
                  <input
                    type="password"
                    value={demoKeyword}
                    onChange={(e) => setDemoKeyword(e.target.value)}
                    placeholder="Nueva palabra clave..."
                    className="w-full bg-surface-card-subtle border border-border-subtle rounded-lg pl-10 pr-4 py-2.5 text-content-main placeholder:text-content-muted focus:outline-none focus:border-theme-primary focus:ring-1 focus:ring-theme-primary transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSavingKeyword || !demoKeyword.trim()}
                className="w-full flex items-center justify-center gap-2 bg-theme-primary hover:brightness-95 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingKeyword ? (
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

        {/* Multi-Tenant Theming Card */}
        <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-theme-primary" />
                <h3 className="text-lg font-semibold text-content-main">Gestión de Temas Visuales</h3>
              </div>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="flex items-center gap-1.5 bg-theme-primary hover:brightness-95 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Tema</span>
              </button>
            </div>

            <p className="text-sm text-content-muted mb-4">
              Configura paletas corporativas y estilos de marca (Multi-Tenant). Los cambios se aplican en caliente a toda la plataforma.
            </p>

            {/* Themes list */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {themes.map((theme) => {
                const isActive = theme.slug === currentTheme.slug;
                return (
                  <div
                    key={theme.id || theme.slug}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'bg-theme-primary/10 border-theme-primary/40 ring-1 ring-theme-primary/20'
                        : 'bg-surface-card-subtle border-border-subtle hover:border-theme-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Color swatches */}
                      <div className="flex items-center -space-x-1.5 shrink-0">
                        <span
                          className="w-4 h-4 rounded-full border border-slate-900 shadow-sm"
                          style={{ backgroundColor: theme.primary_color }}
                          title={`Primario: ${theme.primary_color}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-900 shadow-sm"
                          style={{ backgroundColor: theme.secondary_color }}
                          title={`Secundario: ${theme.secondary_color}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-900 shadow-sm"
                          style={{ backgroundColor: theme.accent_color }}
                          title={`Acento: ${theme.accent_color}`}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-slate-900 shadow-sm"
                          style={{ backgroundColor: theme.border_color }}
                          title={`Borde: ${theme.border_color}`}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-content-main truncate">{theme.nombre}</span>
                          {theme.config?.badge_style === 'heineken_star' && (
                            <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-1.5 py-0.2 rounded font-medium">
                              Estrella Roja
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-content-muted block truncate">slug: {theme.slug}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(theme)}
                        className="p-1.5 rounded-md text-content-muted hover:text-content-main hover:bg-surface-card-subtle transition-colors"
                        title="Editar paleta"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {isActive ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-md">
                          <Check className="w-3.5 h-3.5" />
                          Activo
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setTheme(theme.slug)}
                          className="text-xs font-medium bg-surface-card hover:bg-surface-card-subtle text-content-main px-2.5 py-1 rounded-md border border-border-subtle transition-colors"
                        >
                          Aplicar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Creación / Edición de Tema */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-surface-card border border-border-subtle rounded-2xl p-6 max-w-lg w-full shadow-2xl relative text-content-main">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-content-muted hover:text-content-main transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-theme-primary/20 text-theme-primary border border-theme-primary/30 rounded-lg">
                <Palette className="w-5 h-5 text-theme-primary" />
              </div>
              <h3 className="text-lg font-bold text-content-main">
                {editingThemeId ? 'Editar Tema Visual' : 'Nuevo Tema Visual'}
              </h3>
            </div>

            <form onSubmit={handleSaveTheme} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-content-muted mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Heineken Brand"
                    className="w-full bg-surface-card-subtle border border-border-subtle rounded-lg px-3 py-2 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:border-theme-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-content-muted mb-1">Slug (Identificador)</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingThemeId)}
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ej. heineken"
                    className="w-full bg-surface-card-subtle border border-border-subtle rounded-lg px-3 py-2 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:border-theme-primary disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-content-muted mb-1">Color Primario (HEX)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      className="w-8 h-8 rounded border border-border-subtle bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                      placeholder="#008200"
                      className="flex-1 bg-surface-card-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-content-main uppercase focus:outline-none focus:border-theme-primary font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-content-muted mb-1">Color Secundario (HEX)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      className="w-8 h-8 rounded border border-border-subtle bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                      placeholder="#205527"
                      className="flex-1 bg-surface-card-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-content-main uppercase focus:outline-none focus:border-theme-primary font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-content-muted mb-1">Color Acento (HEX)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      className="w-8 h-8 rounded border border-border-subtle bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={formData.accent_color}
                      onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                      placeholder="#ff2b00"
                      className="flex-1 bg-surface-card-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-content-main uppercase focus:outline-none focus:border-theme-primary font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-content-muted mb-1">Color de Borde (HEX)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.border_color}
                      onChange={(e) => setFormData({ ...formData, border_color: e.target.value })}
                      className="w-8 h-8 rounded border border-border-subtle bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      required
                      value={formData.border_color}
                      onChange={(e) => setFormData({ ...formData, border_color: e.target.value })}
                      placeholder="#c3c3c3"
                      className="flex-1 bg-surface-card-subtle border border-border-subtle rounded-lg px-2.5 py-1.5 text-xs text-content-main uppercase focus:outline-none focus:border-theme-primary font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Badge Style */}
              <div>
                <label className="block text-xs font-medium text-content-muted mb-1">
                  Estilo de Badge de Scoring
                </label>
                <select
                  value={formData.badge_style}
                  onChange={(e) => setFormData({ ...formData, badge_style: e.target.value })}
                  className="w-full bg-surface-card-subtle border border-border-subtle rounded-lg px-3 py-2 text-sm text-content-main focus:outline-none focus:border-theme-primary"
                >
                  <option value="default">Estándar (Círculo / Rectángulo Numérico)</option>
                  <option value="heineken_star">Estrella Roja Heineken (Identidad de Marca)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-content-muted hover:text-content-main bg-surface-card-subtle border border-border-subtle rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingTheme}
                  className="flex items-center gap-2 bg-theme-primary hover:brightness-95 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
                >
                  {isSavingTheme ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingThemeId ? 'Guardar Cambios' : 'Crear Tema'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
