import { useState } from 'react';
import { Calendar, TrendingUp, X, Filter } from 'lucide-react';

interface Activation {
  id: string;
  venue: string;
  date: string;
  type: string;
  impact: string;
  status: 'success' | 'active' | 'scheduled' | 'pending';
  rawDate?: Date;
}

interface ActivationTimelineProps {
  activations?: Activation[];
}

export function ActivationTimeline({ activations = [] }: ActivationTimelineProps) {
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  // Si no hay activaciones, mostrar un mensaje vacío o usar un fallback visual
  const displayActivations = activations.length > 0 ? activations : [];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'active':
        return 'bg-amber-500/20 border-amber-500/50 text-amber-400';
      case 'scheduled':
      case 'pending':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      default:
        return 'bg-slate-500/20 border-slate-500/50 text-slate-400';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const filteredActivations = filterType === 'all' 
    ? displayActivations 
    : displayActivations.filter(a => a.status === filterType);

  return (
    <>
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl h-full flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg text-white font-semibold">Calendario de Activaciones</h3>
        </div>

        <div className="relative flex-1 min-h-[400px]">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700/50" />

          <div className="space-y-4">
            {displayActivations.length === 0 ? (
              <div className="pl-14 py-8 text-slate-400 text-sm">
                No hay activaciones registradas para este período.
              </div>
            ) : (
              displayActivations.slice(0, 6).map((activation) => (
                <div key={activation.id} className="relative flex items-start gap-4 pl-14">
                  {/* Timeline dot */}
                  <div className={`absolute left-5 w-3 h-3 rounded-full border-2 ${
                    activation.status === 'success' ? 'bg-green-500 border-green-400' :
                    activation.status === 'active' ? 'bg-amber-500 border-amber-400 animate-pulse' :
                    'bg-slate-600 border-slate-500'
                  }`} />

                  <div className="flex-1 bg-slate-800/30 rounded-lg border border-slate-700/30 p-4 hover:border-slate-600/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-white font-semibold">{activation.venue}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusStyles(activation.status)}`}>
                            {activation.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>{formatDate(activation.date)}</span>
                          {activation.impact && activation.impact !== 'N/A' && (
                            <>
                              <span>•</span>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                <span className={activation.status === 'success' ? 'text-green-400 font-semibold' : ''}>
                                  {activation.impact}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <button 
            onClick={() => setShowFullCalendar(true)}
            className="w-full text-sm text-amber-400 hover:text-amber-300 transition-colors font-medium flex items-center justify-center gap-2"
          >
            Ver Calendario Completo →
          </button>
        </div>
      </div>

      {/* Full Calendar Modal */}
      {showFullCalendar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 rounded-xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <Calendar className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Calendario de Activaciones</h2>
                  <p className="text-slate-400 text-sm">Historial completo y próximos eventos</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFullCalendar(false)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex gap-2 overflow-x-auto">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'all' 
                    ? 'bg-slate-700 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button 
                onClick={() => setFilterType('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'active' 
                    ? 'bg-amber-900/50 text-amber-400 border border-amber-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                En Progreso
              </button>
              <button 
                onClick={() => setFilterType('scheduled')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'scheduled' 
                    ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Programados
              </button>
              <button 
                onClick={() => setFilterType('success')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === 'success' 
                    ? 'bg-green-900/50 text-green-400 border border-green-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Completados
              </button>
            </div>

            {/* Modal Content - Scrollable List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-800" />
                
                <div className="space-y-6">
                  {filteredActivations.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Filter className="w-8 h-8 text-slate-500" />
                      </div>
                      <h3 className="text-lg font-medium text-white mb-1">No se encontraron activaciones</h3>
                      <p className="text-slate-400">Intenta cambiar los filtros seleccionados</p>
                    </div>
                  ) : (
                    filteredActivations.map((activation) => (
                      <div key={activation.id} className="relative flex items-start gap-4 pl-14 group">
                        {/* Timeline dot */}
                        <div className={`absolute left-5 mt-1.5 w-3 h-3 rounded-full border-2 z-10 transition-transform group-hover:scale-125 ${
                          activation.status === 'success' ? 'bg-green-500 border-green-400' :
                          activation.status === 'active' ? 'bg-amber-500 border-amber-400 animate-pulse' :
                          'bg-slate-600 border-slate-500'
                        }`} />

                        <div className="flex-1 bg-slate-800/40 rounded-xl border border-slate-700/50 p-5 hover:border-amber-500/30 hover:bg-slate-800/60 transition-all duration-300">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="text-lg text-white font-bold">{activation.venue}</h4>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(activation.status)}`}>
                                  {activation.type}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(activation.date)}</span>
                              </div>
                              {/* Observation or extra details if we had them */}
                              {activation.status === 'scheduled' && (
                                <p className="text-sm text-slate-400 italic">
                                  Pendiente de ejecución. Contactar al venue para confirmar detalles.
                                </p>
                              )}
                            </div>

                            {/* Impact Section */}
                            {activation.impact && activation.impact !== 'N/A' && (
                              <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
                                <div className={`p-2 rounded-lg ${
                                  activation.status === 'success' ? 'bg-green-500/10' : 'bg-slate-700/50'
                                }`}>
                                  <TrendingUp className={`w-5 h-5 ${
                                    activation.status === 'success' ? 'text-green-400' : 'text-slate-400'
                                  }`} />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Impacto</p>
                                  <p className={`text-lg font-bold ${
                                    activation.status === 'success' ? 'text-green-400' : 'text-slate-300'
                                  }`}>
                                    {activation.impact}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
              <button 
                onClick={() => setShowFullCalendar(false)}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}