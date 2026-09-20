import { useState, useEffect } from 'react';
import { Search, MapPin, X, Plus, Trash2, Store } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from './LoadingSpinner';

interface ClientVenueManagerProps {
  clientId: string;
  clientName: string;
  onClose?: () => void;
  embedded?: boolean;
}

interface AssignedVenue {
  id: string;
  venue: {
    id: string;
    nombre: string;
    direccion: string | null;
    ciudad: string | null;
  };
}

interface Venue {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
}

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
    <div className={`${embedded ? 'h-full border-0 shadow-none bg-transparent' : 'bg-surface-card border border-border-subtle shadow-2xl max-h-[85vh]'} rounded-xl w-full flex flex-col overflow-hidden text-content-main`}>
      {/* Header - Only show if NOT embedded */}
      {!embedded && (
        <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-surface-card">
          <div>
            <h3 className="text-xl text-content-main font-bold flex items-center gap-2">
              <Store className="w-5 h-5 text-theme-primary" />
              Asignar Venues
            </h3>
            <p className="text-content-muted text-sm mt-1">
              Cliente: <span className="text-content-main font-medium">{clientName}</span>
            </p>
          </div>
          <button onClick={onClose} className="text-content-muted hover:text-content-main transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      <div className={`flex-1 overflow-hidden flex flex-col md:flex-row ${embedded ? 'min-h-[400px]' : ''}`}>
        {/* Left Panel: Available Venues */}
        <div className="flex-1 p-4 border-r border-border-subtle overflow-y-auto bg-surface-card-subtle">
          <h4 className="text-sm font-semibold text-content-muted mb-3 uppercase tracking-wider">
            Disponibles ({filteredAvailable.length})
          </h4>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder="Buscar venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-card border border-border-subtle rounded-lg pl-9 pr-3 py-2 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
            />
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : filteredAvailable.length === 0 ? (
              <p className="text-content-muted text-center text-sm py-4">
                No hay venues disponibles con ese criterio.
              </p>
            ) : (
              filteredAvailable.map(venue => (
                <div
                  key={venue.id}
                  className="flex items-center justify-between p-3 bg-surface-card border border-border-subtle rounded-lg hover:border-theme-primary/50 transition-colors group"
                >
                  <div className="min-w-0">
                    <p className="text-content-main font-medium text-sm truncate">{venue.nombre}</p>
                    <div className="flex items-center gap-1 text-xs text-content-muted">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{venue.ciudad || 'Sin ciudad'}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAssign(venue.id)}
                    disabled={assigning}
                    className="p-1.5 bg-surface-card-subtle text-content-muted hover:text-white hover:bg-theme-primary border border-border-subtle rounded transition-all"
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
        <div className="flex-1 p-4 overflow-y-auto bg-surface-card">
          <h4 className="text-sm font-semibold text-content-muted mb-3 uppercase tracking-wider">
            Asignados ({assignedVenues.length})
          </h4>

          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : assignedVenues.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-xl">
                <Store className="w-8 h-8 text-content-muted mx-auto mb-2" />
                <p className="text-content-muted text-sm">Este cliente no tiene venues asignados.</p>
              </div>
            ) : (
              assignedVenues.map(assignment => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-theme-primary/10 border border-theme-primary/20 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="text-theme-primary font-medium text-sm truncate">{assignment.venue.nombre}</p>
                    <p className="text-xs text-content-muted truncate">{assignment.venue.ciudad}</p>
                  </div>
                  <button
                    onClick={() => handleUnassign(assignment.id)}
                    className="p-1.5 hover:bg-red-500/20 rounded text-content-muted hover:text-red-500 transition-colors"
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
        <div className="p-4 border-t border-border-subtle bg-surface-card flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-card-subtle hover:bg-surface-card border border-border-subtle text-content-main rounded-lg transition-colors text-sm font-medium"
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
