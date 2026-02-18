import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Edit2, Trash2, Map, Save, X } from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface Region {
  id: string;
  nombre: string;
  descripcion?: string | null;
  created_at?: string;
}

interface RegionManagerProps {
  session: any;
}

export function RegionManager({ session: _session }: RegionManagerProps) {
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRegion, setCurrentRegion] = useState<Partial<Region>>({});
  const [showModal, setShowModal] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('btl_regiones')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      setRegions(data || []);
    } catch (error: any) {
      console.error('Error loading regions:', error);
      // Handle Supabase specific error codes
      if (error.code === 'PGRST205' || error.code === '42P01') {
        toast.error('La tabla de regiones no está configurada. Ejecuta el script de migración.');
      } else {
        toast.error('Error al cargar regiones');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!currentRegion.nombre) {
      toast.error('El nombre de la región es obligatorio');
      return;
    }

    try {
      if (currentRegion.id) {
        // Update
        const { error } = await supabase
          .from('btl_regiones')
          .update({
            nombre: currentRegion.nombre,
            descripcion: currentRegion.descripcion
          })
          .eq('id', currentRegion.id);

        if (error) throw error;
        toast.success('Región actualizada exitosamente');
      } else {
        // Create
        const { error } = await supabase
          .from('btl_regiones')
          .insert([{
            nombre: currentRegion.nombre,
            descripcion: currentRegion.descripcion
          }]);

        if (error) throw error;
        toast.success('Región creada exitosamente');
      }

      setShowModal(false);
      setCurrentRegion({});
      loadRegions();
    } catch (error: any) {
      console.error('Error saving region:', error);
      toast.error('Error al guardar la región');
    }
  };

  const handleDelete = (id: string) => {
    setRegionToDelete(id);
  };

  const confirmDelete = async () => {
    if (!regionToDelete) return;
    const id = regionToDelete;

    try {
      const { error } = await supabase
        .from('btl_regiones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Región eliminada');
      loadRegions();
    } catch (error: any) {
      console.error('Error deleting region:', error);
      toast.error('Error al eliminar la región');
    } finally {
      setRegionToDelete(null);
    }
  };

  const openModal = (region?: Region) => {
    if (region) {
      setCurrentRegion(region);
      setIsEditing(true);
    } else {
      setCurrentRegion({});
      setIsEditing(false);
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white font-bold flex items-center gap-2">
            <Map className="w-6 h-6 text-amber-500" />
            Gestión de Regiones
          </h2>
          <p className="text-slate-400 mt-1">
            Administra las zonas geográficas y territorios de venta.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Región
        </button>
      </div>

      {/* Regions Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : regions.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
          <Map className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No hay regiones configuradas</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {regions.map((region) => (
            <div
              key={region.id}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-amber-500/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Map className="w-5 h-5" />
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openModal(region)}
                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(region.id)}
                    className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-lg text-white font-semibold mb-2">{region.nombre}</h3>
              <p className="text-slate-400 text-sm h-10 overflow-hidden text-ellipsis">
                {region.descripcion || 'Sin descripción'}
              </p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!regionToDelete}
        onClose={() => setRegionToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar Región"
        message="¿Estás seguro de eliminar esta región? Esto podría afectar a los venues asignados."
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-xl text-white font-bold">
                {isEditing ? 'Editar Región' : 'Nueva Región'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Nombre de la Región <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentRegion.nombre || ''}
                  onChange={(e) => setCurrentRegion({ ...currentRegion, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  placeholder="Ej: Zona Norte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Descripción
                </label>
                <textarea
                  value={currentRegion.descripcion || ''}
                  onChange={(e) => setCurrentRegion({ ...currentRegion, descripcion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors h-24 resize-none"
                  placeholder="Descripción opcional del territorio..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
