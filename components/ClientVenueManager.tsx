import { useState, useEffect } from 'react';
import { Search, MapPin, X, Plus, Trash2, Loader2, Store } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

interface ClientVenueManagerProps {
  clientId: string;
  clientName: string;
  onClose?: () => void;
  embedded?: boolean;
}

// ... imports and interfaces ...

export function ClientVenueManager({ clientId, clientName, onClose, embedded = false }: ClientVenueManagerProps) {
  const [assignedVenues, setAssignedVenues] = useState<AssignedVenue[]>([]);
  const [availableVenues, setAvailableVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, [clientId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load assigned venues
      const { data: assignments, error: assignmentsError } = await supabase
        .from('btl_clientes_venues')
        .select(`
          id,
          venue:btl_puntos_venta (
            id,
            nombre,
            ciudad,
            direccion
          )
        `)
        .eq('cliente_id', clientId);

      if (assignmentsError) throw assignmentsError;

      // 2. Load all venues (to filter later)
      const { data: allVenues, error: venuesError } = await supabase
        .from('btl_puntos_venta')
        .select('id, nombre, ciudad, direccion')
        .order('nombre');

      if (venuesError) throw venuesError;

      // Transform assigned data
      const formattedAssignments = (assignments || [])
        .filter((a: any) => a.venue) // Filter out null venues if referential integrity failed
        .map((a: any) => ({
          id: a.id,
          venue: a.venue
        }));

      setAssignedVenues(formattedAssignments);

      // Filter available venues (exclude already assigned)
      const assignedIds = new Set(formattedAssignments.map(a => a.venue.id));
      const available = (allVenues || []).filter((v: any) => !assignedIds.has(v.id));
      setAvailableVenues(available);

    } catch (error: any) {
      console.error('Error loading client venues:', error);
      toast.error('Error al cargar asignaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (venueId: string) => {
    setAssigning(true);
    try {
      const { error } = await supabase
        .from('btl_clientes_venues')
        .insert({
          cliente_id: clientId,
          venue_id: venueId
        });

      if (error) throw error;
      
      toast.success('Venue asignado correctamente');
      loadData(); // Reload to refresh lists
    } catch (error: any) {
      console.error('Error assigning venue:', error);
      toast.error('Error al asignar el venue');
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('btl_clientes_venues')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Asignación eliminada');
      loadData(); // Reload
    } catch (error: any) {
      console.error('Error unassigning venue:', error);
      toast.error('Error al eliminar asignación');
    }
  };

  // Filter available venues for the dropdown/list
  const filteredAvailable = availableVenues.filter(v => 
    v.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.ciudad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const content = (
      <div className={`${embedded ? 'h-full border-0 shadow-none bg-transparent' : 'bg-slate-900 border border-slate-700 shadow-2xl max-h-[85vh]'} rounded-xl w-full flex flex-col overflow-hidden`}>
        {/* Header - Only show if NOT embedded */}
        {!embedded && (
            <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900">
            <div>
                <h3 className="text-xl text-white font-bold flex items-center gap-2">
                <Store className="w-5 h-5 text-amber-500" />
                Asignar Venues
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                Cliente: <span className="text-white font-medium">{clientName}</span>
                </p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
            </button>
            </div>
        )}

        <div className={`flex-1 overflow-hidden flex flex-col md:flex-row ${embedded ? 'min-h-[400px]' : ''}`}>
          {/* Left Panel: Available Venues */}
          <div className="flex-1 p-4 border-r border-slate-800 overflow-y-auto bg-slate-900/50">
            {/* ... existing content ... */}
            <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              Disponibles ({filteredAvailable.length})
            </h4>
            
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar venue..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
              ) : filteredAvailable.length === 0 ? (
                <p className="text-slate-500 text-center text-sm py-4">
                  No hay venues disponibles con ese criterio.
                </p>
              ) : (
                filteredAvailable.map(venue => (
                  <div 
                    key={venue.id}
                    className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700/30 rounded-lg hover:border-amber-500/30 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-slate-200 font-medium text-sm truncate">{venue.nombre}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{venue.ciudad || 'Sin ciudad'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAssign(venue.id)}
                      disabled={assigning}
                      className="p-1.5 bg-slate-700 text-slate-300 rounded hover:bg-amber-600 hover:text-white transition-colors"
                      title="Asignar"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Panel: Assigned Venues */}
          <div className="flex-1 p-4 overflow-y-auto bg-slate-950/30">
            {/* ... existing content ... */}
            <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              Asignados ({assignedVenues.length})
            </h4>

            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
                </div>
              ) : assignedVenues.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                  <Store className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">Este cliente no tiene venues asignados.</p>
                </div>
              ) : (
                assignedVenues.map(assignment => (
                  <div 
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-purple-200 font-medium text-sm truncate">{assignment.venue.nombre}</p>
                      <p className="text-xs text-purple-300/60 truncate">{assignment.venue.ciudad}</p>
                    </div>
                    <button
                      onClick={() => handleUnassign(assignment.id)}
                      className="p-1.5 hover:bg-red-500/20 rounded text-slate-400 hover:text-red-400 transition-colors"
                      title="Remover asignación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer - Only show if NOT embedded */}
        {!embedded && (
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-end">
            <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
                Cerrar
            </button>
            </div>
        )}
      </div>
  );

  if (embedded) {
      return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="w-full max-w-2xl">
            {content}
        </div>
    </div>
  );
}
