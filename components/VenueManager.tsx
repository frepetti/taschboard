import { useState, useEffect } from 'react';
import { VenueImporter } from './VenueImporter';
import { MapPin, Edit2, Trash2, Loader2, Plus, Save, X, Map, Phone, Briefcase, TrendingUp } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface VenueManagerProps {
  session: any;
}

interface Region {
  id: string;
  nombre: string;
}

export function VenueManager({ session }: VenueManagerProps) {
  const [venues, setVenues] = useState<any[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImporter, setShowImporter] = useState(false);
  
  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentVenue, setCurrentVenue] = useState<any>({});
  const [venueToDelete, setVenueToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadVenues(), loadRegions()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('btl_regiones')
        .select('id, nombre')
        .order('nombre', { ascending: true });
      
      if (!error && data) {
        setRegions(data);
      }
    } catch (err) {
      console.log('Regiones table might not exist yet');
    }
  };

  const loadVenues = async () => {
    try {
      console.log('📍 VenueManager: Loading venues...');
      
      let data, error;
      
      // Intentamos cargar con la relación de region_id
      try {
        const result = await supabase
          .from('btl_puntos_venta')
          .select('*, region_rel:region_id(id, nombre)')
          .order('nombre', { ascending: true });
          
        data = result.data;
        error = result.error;
      } catch (e) {
        // Fallback si la relación falla
        const result = await supabase
          .from('btl_puntos_venta')
          .select('*')
          .order('nombre', { ascending: true });
          
        data = result.data;
        error = result.error;
      }

      if (error) {
        // Retry simple
        const result = await supabase
          .from('btl_puntos_venta')
          .select('*')
          .order('nombre', { ascending: true });
          
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      
      console.log('✅ Loaded venues:', data?.length || 0);
      setVenues(data || []);
      
    } catch (error: any) {
      console.error('❌ Error loading venues:', error);
      toast.error('Error al cargar los puntos de venta');
      setVenues([]);
    }
  };

  const handleImportComplete = () => {
    setShowImporter(false);
    loadVenues();
  };

  const handleDelete = (venueId: string) => {
    setVenueToDelete(venueId);
  };

  const confirmDelete = async () => {
    if (!venueToDelete) return;
    const venueId = venueToDelete;

    try {
      const { error } = await supabase
        .from('btl_puntos_venta')
        .delete()
        .eq('id', venueId);

      if (error) throw error;
      
      toast.success('Punto de venta eliminado exitosamente');
      await loadVenues();
    } catch (error: any) {
      console.error('Error deleting venue:', error);
      toast.error('Error al eliminar el punto de venta');
    } finally {
      setVenueToDelete(null);
    }
  };

  const openEditModal = (venue: any) => {
    // Preparar el objeto para edición, asegurando que region_id esté mapeado
    // Si no tiene region_id pero tiene texto en 'region', intentamos buscar el ID
    let regionId = venue.region_id;
    if (!regionId && venue.region) {
      const matchingRegion = regions.find(r => r.nombre.toLowerCase() === venue.region.toLowerCase());
      if (matchingRegion) regionId = matchingRegion.id;
    }

    setCurrentVenue({ 
      ...venue,
      region_id: regionId
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    try {
      // Obtenemos el nombre de la región seleccionada para mantener consistencia 
      // si aún se usa el campo de texto 'region'
      const selectedRegion = regions.find(r => r.id === currentVenue.region_id);
      
      const updates: any = {
        nombre: currentVenue.nombre,
        direccion: currentVenue.direccion,
        ciudad: currentVenue.ciudad, // Antes 'zona'
        tipo: currentVenue.tipo, // Antes 'canal'
        segmento: currentVenue.segmento,
        potencial_ventas: currentVenue.potencial_ventas,
        contacto_nombre: currentVenue.contacto_nombre,
        contacto_telefono: currentVenue.contacto_telefono,
        
        // Guardamos tanto el ID como el texto para compatibilidad
        region_id: currentVenue.region_id || null,
        region: selectedRegion ? selectedRegion.nombre : currentVenue.region
      };

      const { error } = await supabase
        .from('btl_puntos_venta')
        .update(updates)
        .eq('id', currentVenue.id);

      if (error) throw error;

      toast.success('Punto de venta actualizado');
      setShowEditModal(false);
      loadVenues();
    } catch (error: any) {
      console.error('Error updating venue:', error);
      toast.error('Error al actualizar el punto de venta');
    }
  };

  // Helper to get region name safely
  const getRegionName = (venue: any) => {
    // Prioridad 1: Relación cargada por Supabase
    if (venue.region_rel && venue.region_rel.nombre) return venue.region_rel.nombre;
    
    // Prioridad 2: ID que coincide con la lista de regiones
    if (venue.region_id) {
      const r = regions.find(reg => reg.id === venue.region_id);
      if (r) return r.nombre;
    }
    
    // Prioridad 3: Texto plano guardado en campo 'region'
    if (venue.region) return venue.region;
    
    return '-';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white font-bold">Gestión de Venues</h2>
          <p className="text-slate-400 mt-1">
            {venues.length} venues registrados
          </p>
        </div>
        <button
          onClick={() => setShowImporter(!showImporter)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-2 rounded-lg transition-all"
        >
          {showImporter ? (
            <>
              <MapPin className="w-4 h-4" />
              Ver Lista de Venues
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Importar desde Excel
            </>
          )}
        </button>
      </div>

      {/* Importer */}
      {showImporter && (
        <VenueImporter session={session} onImportComplete={handleImportComplete} />
      )}

      {/* Venues List */}
      {!showImporter && (
        <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
          ) : venues.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No hay venues registrados</p>
              <button
                onClick={() => setShowImporter(true)}
                className="mt-4 text-amber-400 hover:text-amber-300 font-medium"
              >
                Importar venues desde Excel
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/50">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Nombre</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Región</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Ciudad</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Dirección</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Tipo/Segmento</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Contacto</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-medium text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue) => (
                    <tr key={venue.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-white font-medium">{venue.nombre}</td>
                      <td className="py-3 px-4 text-slate-300">
                        {getRegionName(venue) !== '-' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                            <Map className="w-3 h-3" />
                            {getRegionName(venue)}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs">Sin asignar</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-300 text-sm">{venue.ciudad || '-'}</td>
                      <td className="py-3 px-4 text-slate-400 text-sm max-w-xs truncate" title={venue.direccion}>{venue.direccion}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                            <span className="inline-block px-2 py-1 bg-amber-500/20 text-amber-300 text-xs rounded w-fit">
                              {venue.tipo || 'General'}
                            </span>
                            {venue.segmento && (
                                <span className="text-xs text-slate-500">{venue.segmento}</span>
                            )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-sm">
                        <div className="flex flex-col">
                            <span>{venue.contacto_nombre || '-'}</span>
                            {venue.contacto_telefono && <span className="text-xs text-slate-500">{venue.contacto_telefono}</span>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(venue)}
                            className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(venue.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!venueToDelete}
        onClose={() => setVenueToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar Venue"
        message="¿Estás seguro de que deseas eliminar este punto de venta? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <h3 className="text-xl text-white font-bold">Editar Venue</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Nombre del Venue</label>
                    <input
                    type="text"
                    value={currentVenue.nombre || ''}
                    onChange={(e) => setCurrentVenue({ ...currentVenue, nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Región</label>
                    <select
                    value={currentVenue.region_id || ''}
                    onChange={(e) => setCurrentVenue({ ...currentVenue, region_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                    <option value="">Seleccionar Región...</option>
                    {regions.map(r => (
                        <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Ciudad</label>
                    <input
                    type="text"
                    value={currentVenue.ciudad || ''}
                    onChange={(e) => setCurrentVenue({ ...currentVenue, ciudad: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Dirección Completa</label>
                <input
                  type="text"
                  value={currentVenue.direccion || ''}
                  onChange={(e) => setCurrentVenue({ ...currentVenue, direccion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Classification */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tipo</label>
                  <input
                    type="text"
                    value={currentVenue.tipo || ''}
                    onChange={(e) => setCurrentVenue({ ...currentVenue, tipo: e.target.value })}
                    placeholder="Ej. Bar, Discoteca"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Segmento</label>
                  <input
                    type="text"
                    value={currentVenue.segmento || ''}
                    onChange={(e) => setCurrentVenue({ ...currentVenue, segmento: e.target.value })}
                    placeholder="Ej. Premium, High Energy"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Potencial Ventas</label>
                  <input
                    type="text"
                    value={currentVenue.potencial_ventas || ''}
                    onChange={(e) => setCurrentVenue({ ...currentVenue, potencial_ventas: e.target.value })}
                    placeholder="Ej. Alto, Medio"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nombre Contacto</label>
                  <input
                    type="text"
                    value={currentVenue.contacto_nombre || ''}
                    onChange={(e) => setCurrentVenue({ ...currentVenue, contacto_nombre: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Teléfono Contacto</label>
                  <input
                    type="text"
                    value={currentVenue.contacto_telefono || ''}
                    onChange={(e) => setCurrentVenue({ ...currentVenue, contacto_telefono: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800 bg-slate-900/50">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdate}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
              >
                <Save className="w-4 h-4" />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
