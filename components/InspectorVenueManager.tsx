import { useState, useEffect } from 'react';
import { Search, MapPin, X, Plus, Trash2, UserCheck, ShieldCheck } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from './LoadingSpinner';

interface InspectorVenueManagerProps {
  inspectorId?: string;
  inspectorName?: string;
  venueId?: string;
  venueName?: string;
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

interface AssignedInspector {
  id: string;
  inspector: {
    id: string;
    nombre: string;
    email: string;
    empresa: string | null;
  };
}

interface VenueItem {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
}

interface InspectorItem {
  id: string;
  nombre: string;
  email: string;
  empresa: string | null;
}

export function InspectorVenueManager({
  inspectorId,
  inspectorName,
  venueId,
  venueName,
  onClose,
  embedded = false
}: InspectorVenueManagerProps) {
  // Mode 1: Managing venues for a single inspector (when inspectorId is provided)
  // Mode 2: Managing inspectors for a single venue (when venueId is provided)
  const isInspectorMode = Boolean(inspectorId);

  // Inspector Mode State
  const [assignedVenues, setAssignedVenues] = useState<AssignedVenue[]>([]);
  const [availableVenues, setAvailableVenues] = useState<VenueItem[]>([]);

  // Venue Mode State
  const [assignedInspectors, setAssignedInspectors] = useState<AssignedInspector[]>([]);
  const [availableInspectors, setAvailableInspectors] = useState<InspectorItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [inspectorId, venueId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isInspectorMode && inspectorId) {
        // Load venues assigned to this inspector
        const { data: assignments, error: assignmentsError } = await (supabase.from('btl_inspector_puntos_venta' as any) as any)
          .select(`
            id,
            venue:btl_puntos_venta (
              id,
              nombre,
              ciudad,
              direccion
            )
          `)
          .eq('inspector_id', inspectorId);

        if (assignmentsError) throw assignmentsError;

        // Load all venues
        const { data: allVenues, error: venuesError } = await supabase
          .from('btl_puntos_venta')
          .select('id, nombre, ciudad, direccion')
          .order('nombre');

        if (venuesError) throw venuesError;

        const formatted = (assignments || [])
          .filter((a: any) => a.venue)
          .map((a: any) => ({
            id: a.id,
            venue: a.venue
          }));

        setAssignedVenues(formatted);

        const assignedIds = new Set(formatted.map((a: AssignedVenue) => a.venue.id));
        setAvailableVenues((allVenues || []).filter((v: any) => !assignedIds.has(v.id)));

      } else if (venueId) {
        // Load inspectors assigned to this venue
        const { data: assignments, error: assignmentsError } = await (supabase.from('btl_inspector_puntos_venta' as any) as any)
          .select(`
            id,
            inspector:btl_usuarios!btl_inspector_puntos_venta_inspector_id_fkey (
              id,
              nombre,
              email,
              empresa
            )
          `)
          .eq('punto_venta_id', venueId);

        if (assignmentsError) throw assignmentsError;

        // Load all inspectors
        const { data: allInspectors, error: inspectorsError } = await supabase
          .from('btl_usuarios')
          .select('id, nombre, email, empresa')
          .eq('rol', 'inspector')
          .order('nombre');

        if (inspectorsError) throw inspectorsError;

        const formatted = (assignments || [])
          .filter((a: any) => a.inspector)
          .map((a: any) => ({
            id: a.id,
            inspector: a.inspector
          }));

        setAssignedInspectors(formatted);

        const assignedIds = new Set(formatted.map((a: AssignedInspector) => a.inspector.id));
        setAvailableInspectors((allInspectors || []).filter((i: any) => !assignedIds.has(i.id)));
      }
    } catch (error: any) {
      console.error('Error loading inspector venue assignments:', error);
      toast.error('Error al cargar datos de asignación');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (targetId: string) => {
    setActionLoading(true);
    try {
      const payload = isInspectorMode
        ? { inspector_id: inspectorId, punto_venta_id: targetId }
        : { inspector_id: targetId, punto_venta_id: venueId };

      const { error } = await (supabase.from('btl_inspector_puntos_venta' as any) as any)
        .insert(payload);

      if (error) throw error;

      toast.success('Asignación creada correctamente');
      await loadData();
    } catch (error: any) {
      console.error('Error assigning:', error);
      toast.error('Error al crear la asignación: ' + (error.message || ''));
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnassign = async (assignmentId: string) => {
    try {
      const { error } = await (supabase.from('btl_inspector_puntos_venta' as any) as any)
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast.success('Asignación eliminada');
      await loadData();
    } catch (error: any) {
      console.error('Error unassigning:', error);
      toast.error('Error al eliminar asignación');
    }
  };

  const filteredAvailableVenues = availableVenues.filter(v =>
    v.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.ciudad?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAvailableInspectors = availableInspectors.filter(i =>
    i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const content = (
    <div className={`${embedded ? 'h-full border-0 shadow-none bg-transparent' : 'bg-surface-card border border-border-subtle shadow-2xl max-h-[85vh]'} rounded-xl w-full flex flex-col overflow-hidden text-content-main`}>
      {!embedded && (
        <div className="flex items-center justify-between p-6 border-b border-border-subtle bg-surface-card">
          <div>
            <h3 className="text-xl text-content-main font-bold flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-theme-primary" />
              {isInspectorMode ? 'Asignar Puntos de Venta (PDVs)' : 'Inspectores Asignados'}
            </h3>
            <p className="text-content-muted text-sm mt-1">
              {isInspectorMode ? (
                <>Inspector: <span className="text-content-main font-medium">{inspectorName}</span></>
              ) : (
                <>Punto de Venta: <span className="text-content-main font-medium">{venueName}</span></>
              )}
            </p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-content-muted hover:text-content-main transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
      )}

      <div className={`flex-1 overflow-hidden flex flex-col md:flex-row ${embedded ? 'min-h-[400px]' : ''}`}>
        {/* Left Panel: Available Items */}
        <div className="flex-1 p-4 border-r border-border-subtle overflow-y-auto bg-surface-card-subtle">
          <h4 className="text-sm font-semibold text-content-muted mb-3 uppercase tracking-wider">
            Disponibles ({isInspectorMode ? filteredAvailableVenues.length : filteredAvailableInspectors.length})
          </h4>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
            <input
              type="text"
              placeholder={isInspectorMode ? "Buscar PDV por nombre o ciudad..." : "Buscar inspector por nombre o email..."}
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
            ) : isInspectorMode ? (
              filteredAvailableVenues.length === 0 ? (
                <p className="text-content-muted text-center text-sm py-4">
                  No hay locales disponibles con ese criterio.
                </p>
              ) : (
                filteredAvailableVenues.map(venue => (
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
                      disabled={actionLoading}
                      className="p-1.5 bg-surface-card-subtle text-content-muted hover:text-white hover:bg-theme-primary border border-border-subtle rounded transition-all"
                      title="Asignar"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )
            ) : (
              filteredAvailableInspectors.length === 0 ? (
                <p className="text-content-muted text-center text-sm py-4">
                  No hay inspectores disponibles con ese criterio.
                </p>
              ) : (
                filteredAvailableInspectors.map(inspector => (
                  <div
                    key={inspector.id}
                    className="flex items-center justify-between p-3 bg-surface-card border border-border-subtle rounded-lg hover:border-theme-primary/50 transition-colors group"
                  >
                    <div className="min-w-0">
                      <p className="text-content-main font-medium text-sm truncate">{inspector.nombre}</p>
                      <p className="text-xs text-content-muted truncate">{inspector.email}</p>
                    </div>
                    <button
                      onClick={() => handleAssign(inspector.id)}
                      disabled={actionLoading}
                      className="p-1.5 bg-surface-card-subtle text-content-muted hover:text-white hover:bg-theme-primary border border-border-subtle rounded transition-all"
                      title="Asignar Inspector"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )
            )}
          </div>
        </div>

        {/* Right Panel: Assigned Items */}
        <div className="flex-1 p-4 overflow-y-auto bg-surface-card">
          <h4 className="text-sm font-semibold text-content-muted mb-3 uppercase tracking-wider">
            Asignados ({isInspectorMode ? assignedVenues.length : assignedInspectors.length})
          </h4>

          <div className="space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : isInspectorMode ? (
              assignedVenues.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-xl">
                  <ShieldCheck className="w-8 h-8 text-content-muted mx-auto mb-2" />
                  <p className="text-content-muted text-sm">Este inspector no tiene locales asignados.</p>
                </div>
              ) : (
                assignedVenues.map(assignment => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-theme-primary/10 border border-theme-primary/20 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-theme-primary font-medium text-sm truncate">{assignment.venue.nombre}</p>
                      <p className="text-xs text-content-muted truncate">{assignment.venue.ciudad || 'Sin ciudad'}</p>
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
              )
            ) : (
              assignedInspectors.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-xl">
                  <UserCheck className="w-8 h-8 text-content-muted mx-auto mb-2" />
                  <p className="text-content-muted text-sm">Este local no tiene inspectores asignados.</p>
                </div>
              ) : (
                assignedInspectors.map(assignment => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-theme-primary/10 border border-theme-primary/20 rounded-lg"
                  >
                    <div className="min-w-0">
                      <p className="text-theme-primary font-medium text-sm truncate">{assignment.inspector.nombre}</p>
                      <p className="text-xs text-content-muted truncate">{assignment.inspector.email}</p>
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
              )
            )}
          </div>
        </div>
      </div>

      {!embedded && onClose && (
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
