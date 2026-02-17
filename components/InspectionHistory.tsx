import { Clock, MapPin, RefreshCw, CheckCircle, XCircle, ArrowLeft, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';

interface InspectionHistoryProps {
  inspections: any[];
  onRefresh?: () => void;
  onBack?: () => void;
}

export function InspectionHistory({ inspections, onRefresh, onBack }: InspectionHistoryProps) {
  const [selectedInspection, setSelectedInspection] = useState<any>(null);
  const [venueNames, setVenueNames] = useState<Record<string, string>>({});

  // Cargar los nombres de los puntos de venta
  useEffect(() => {
    const loadVenueNames = async () => {
      if (!inspections || inspections.length === 0) return;

      const venueIds = [...new Set(inspections.map(i => i.punto_venta_id).filter(Boolean))];
      
      if (venueIds.length === 0) return;

      const { data, error } = await supabase
        .from('btl_puntos_venta')
        .select('id, nombre')
        .in('id', venueIds);

      if (!error && data) {
        const namesMap: Record<string, string> = {};
        data.forEach(venue => {
          namesMap[venue.id] = venue.nombre;
        });
        setVenueNames(namesMap);
      }
    };

    loadVenueNames();
  }, [inspections]);

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle undefined or null inspections
  const safeInspections = inspections || [];

  if (safeInspections.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 shadow-xl text-center">
        <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h3 className="text-xl text-white font-semibold mb-2">No hay inspecciones aún</h3>
        <p className="text-slate-400">Tus inspecciones completadas aparecerán aquí</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl text-white font-semibold mb-2">Historial de Inspecciones</h2>
              <p className="text-slate-400 text-sm">{safeInspections.length} inspección{safeInspections.length !== 1 ? 'es' : ''} completada{safeInspections.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-slate-300 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Actualizar</span>
                </button>
              )}
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Nueva Inspección</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {safeInspections.map((inspection, index) => {
            // Calcular ID secuencial (el más reciente es #1)
            const sequentialId = safeInspections.length - index;
            
            return (
              <div
                key={inspection.id}
                onClick={() => setSelectedInspection(inspection)}
                className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-5 shadow-xl hover:border-amber-500/50 hover:shadow-amber-500/10 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg text-white font-semibold mb-1">
                      Inspección #{sequentialId}
                    </h3>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mb-2">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{venueNames[inspection.punto_venta_id] || 'Cargando...'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{formatDate(inspection.fecha_inspeccion || inspection.created_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-lg ${
                      inspection.tiene_producto
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {inspection.tiene_producto ? (
                        <>
                          <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Producto Presente</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Sin Producto</span>
                        </>
                      )}
                    </div>
                    <Eye className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors hidden sm:block" />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-700/50">
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs text-slate-400 mb-1">Stock</div>
                    <div className="text-sm sm:text-lg text-white font-semibold">
                      {inspection.stock_estimado || 'N/A'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs text-slate-400 mb-1">Temp.</div>
                    <div className="text-sm sm:text-lg text-white font-semibold">
                      {inspection.temperatura_refrigeracion ? `${inspection.temperatura_refrigeracion}°C` : 'N/A'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[10px] sm:text-xs text-slate-400 mb-1">Material POP</div>
                    <div className="text-sm sm:text-lg text-white font-semibold">
                      {inspection.tiene_material_pop ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 mx-auto" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspection Detail Modal */}
      {selectedInspection && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedInspection(null)}
        >
          <div 
            className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-600/20 to-amber-500/20 border-b border-amber-500/30 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl text-white font-bold">
                    Inspección #{safeInspections.length - safeInspections.findIndex(i => i.id === selectedInspection.id)}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">{venueNames[selectedInspection.punto_venta_id] || 'Punto de Venta'}</p>
                </div>
                <button 
                  onClick={() => setSelectedInspection(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Fecha */}
              <div>
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Fecha de Inspección</span>
                </div>
                <p className="text-white text-lg">{formatDate(selectedInspection.fecha_inspeccion || selectedInspection.created_at)}</p>
              </div>

              {/* Estado del Producto */}
              <div>
                <h3 className="text-sm text-slate-400 mb-3">Estado del Producto</h3>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
                  selectedInspection.tiene_producto
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {selectedInspection.tiene_producto ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Producto Presente</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Sin Producto</span>
                    </>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-400 mb-1">Stock Estimado</div>
                  <div className="text-2xl text-white font-bold">{selectedInspection.stock_estimado || 'N/A'}</div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-400 mb-1">Temperatura</div>
                  <div className="text-2xl text-white font-bold">
                    {selectedInspection.temperatura_refrigeracion ? `${selectedInspection.temperatura_refrigeracion}°C` : 'N/A'}
                  </div>
                </div>
                <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                  <div className="text-xs text-slate-400 mb-1">Material POP</div>
                  <div className="text-2xl text-white font-bold">
                    {selectedInspection.tiene_material_pop ? (
                      <CheckCircle className="w-8 h-8 text-green-400 mx-auto" />
                    ) : (
                      <XCircle className="w-8 h-8 text-red-400 mx-auto" />
                    )}
                  </div>
                </div>
              </div>

              {/* Material POP Details */}
              {selectedInspection.material_pop_detalle && (
                <div>
                  <h3 className="text-sm text-slate-400 mb-2">Material POP Detalle</h3>
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                    <p className="text-slate-300">
                      {typeof selectedInspection.material_pop_detalle === 'string' 
                        ? selectedInspection.material_pop_detalle 
                        : JSON.stringify(selectedInspection.material_pop_detalle)}
                    </p>
                  </div>
                </div>
              )}

              {/* Observations */}
              {selectedInspection.observaciones && (
                <div>
                  <h3 className="text-sm text-slate-400 mb-2">Observaciones</h3>
                  <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                    <p className="text-slate-300 italic">&ldquo;{selectedInspection.observaciones}&rdquo;</p>
                  </div>
                </div>
              )}

              {/* Photos */}
              {selectedInspection.fotos_urls && selectedInspection.fotos_urls.length > 0 && (
                <div>
                  <h3 className="text-sm text-slate-400 mb-3">Fotos ({selectedInspection.fotos_urls.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedInspection.fotos_urls.map((url: string, idx: number) => (
                      <div key={idx} className="aspect-square bg-slate-700 rounded-lg overflow-hidden">
                        <img src={url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}