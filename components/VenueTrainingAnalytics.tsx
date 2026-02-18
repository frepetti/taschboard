import { useState, useEffect } from 'react';
import { GraduationCap, X, Search, MapPin, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';

interface VenueTrainingAnalyticsProps {
  session: any;
}

interface TrainingStats {
  totalVenues: number;
  venuesWithTraining: number;
  venuesWithoutTraining: number;
  percentageTrained: number;
  totalTrainings: number;
  totalAttendees: number;
}

interface VenueWithTraining {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
  tipo: string | null;
  trainedStaff: number;
  totalStaff: number;
  lastTrainingDate?: string;
  hasTrained: boolean;
}

export function VenueTrainingAnalytics({ session: _session }: VenueTrainingAnalyticsProps) {
  const [stats, setStats] = useState<TrainingStats>({
    totalVenues: 0,
    venuesWithTraining: 0,
    venuesWithoutTraining: 0,
    percentageTrained: 0,
    totalTrainings: 0,
    totalAttendees: 0
  });
  const [venues, setVenues] = useState<VenueWithTraining[]>([]);
  const [_loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailFilter, setDetailFilter] = useState<'all' | 'trained' | 'untrained'>('untrained');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadTrainingData();
  }, []);

  const loadTrainingData = async () => {
    setLoading(true);
    try {
      // Get all venues
      const { data: venuesData, error: venuesError } = await supabase
        .from('btl_puntos_venta')
        .select('*')
        .order('nombre');

      if (venuesError) throw venuesError;

      // Get all training attendees with their venue associations
      // We'll get inspectors who attended trainings and their assigned venues from visits
      const { data: trainingsData, error: trainingsError } = await supabase
        .from('btl_capacitacion_asistentes')
        .select(`
          id,
          usuario_id,
          asistio,
          capacitacion_id,
          btl_capacitaciones!inner (
            id,
            titulo,
            fecha_inicio,
            estado
          )
        `)
        .eq('asistio', true);

      if (trainingsError) throw trainingsError;

      // Get visits to associate venues with trained inspectors
      const { data: visitsData, error: visitsError } = await supabase
        .from('btl_inspecciones')
        .select('punto_venta_id, usuario_id')
        .order('fecha_inspeccion', { ascending: false });

      if (visitsError) throw visitsError;

      // Create a map of trained inspectors
      const trainedInspectors = new Set(
        trainingsData?.map(t => t.usuario_id) || []
      );

      // Create a map of venues to trained inspectors
      const venueTrainingMap = new Map<string, {
        trainedStaff: Set<string>,
        totalStaff: Set<string>,
        lastTrainingDate?: string
      }>();

      // Process visits to associate venues with staff
      visitsData?.forEach(visit => {
        if (!venueTrainingMap.has(visit.punto_venta_id)) {
          venueTrainingMap.set(visit.punto_venta_id, {
            trainedStaff: new Set(),
            totalStaff: new Set(),
          });
        }

        const venueData = venueTrainingMap.get(visit.punto_venta_id)!;
        venueData.totalStaff.add(visit.usuario_id);

        if (trainedInspectors.has(visit.usuario_id)) {
          venueData.trainedStaff.add(visit.usuario_id);
        }
      });

      // Get latest training dates
      const latestTrainingDates = new Map<string, string>();
      trainingsData?.forEach(training => {
        const date = training.btl_capacitaciones.fecha_inicio;
        if (date) {
          if (!latestTrainingDates.has(training.usuario_id) ||
            new Date(date) > new Date(latestTrainingDates.get(training.usuario_id)!)) {
            latestTrainingDates.set(training.usuario_id, date);
          }
        }
      });

      // Process venues with training data
      const processedVenues: VenueWithTraining[] = (venuesData || []).map(venue => {
        const trainingData = venueTrainingMap.get(venue.id);
        const trainedCount = trainingData?.trainedStaff.size || 0;
        const totalCount = trainingData?.totalStaff.size || 0;

        // Get most recent training date from staff
        let lastTrainingDate: string | undefined;
        if (trainingData?.trainedStaff) {
          for (const inspectorId of trainingData.trainedStaff) {
            const date = latestTrainingDates.get(inspectorId);
            if (date && (!lastTrainingDate || new Date(date) > new Date(lastTrainingDate))) {
              lastTrainingDate = date;
            }
          }
        }

        return {
          id: venue.id,
          nombre: venue.nombre,
          direccion: venue.direccion,
          ciudad: venue.ciudad,
          tipo: venue.tipo,
          trainedStaff: trainedCount,
          totalStaff: totalCount,
          lastTrainingDate,
          hasTrained: trainedCount > 0
        };
      });

      // Calculate stats
      const venuesWithTraining = processedVenues.filter(v => v.hasTrained).length;
      const totalVenues = processedVenues.length;

      setStats({
        totalVenues,
        venuesWithTraining,
        venuesWithoutTraining: totalVenues - venuesWithTraining,
        percentageTrained: totalVenues > 0 ? (venuesWithTraining / totalVenues) * 100 : 0,
        totalTrainings: trainingsData?.length || 0,
        totalAttendees: trainedInspectors.size
      });

      setVenues(processedVenues);
    } catch (error) {
      console.error('Error loading training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(venue => {
    // Filter by training status
    if (detailFilter === 'trained' && !venue.hasTrained) return false;
    if (detailFilter === 'untrained' && venue.hasTrained) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        venue.nombre.toLowerCase().includes(query) ||
        venue.ciudad?.toLowerCase().includes(query) ||
        venue.direccion?.toLowerCase().includes(query) ||
        venue.tipo?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl text-white font-semibold mb-1">Análisis de Capacitación</h3>
          <p className="text-slate-400 text-sm">
            Seguimiento de capacitación del personal por venue
          </p>
        </div>
        <button
          onClick={() => setShowDetailModal(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
        >
          <GraduationCap className="w-4 h-4 hidden sm:inline-block" />
          <span>Ver Detalle</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Venues */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalVenues}</div>
          <div className="text-slate-400 text-sm">Total de Venues</div>
        </div>

        {/* Venues with Training */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-green-700/30 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-green-400 text-sm font-medium">
              {stats.percentageTrained.toFixed(1)}%
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.venuesWithTraining}</div>
          <div className="text-slate-400 text-sm">Con Personal Capacitado</div>
        </div>

        {/* Venues without Training */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-red-700/30 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-red-400 text-sm font-medium">
              {(100 - stats.percentageTrained).toFixed(1)}%
            </span>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.venuesWithoutTraining}</div>
          <div className="text-slate-400 text-sm">Sin Personal Capacitado</div>
        </div>

        {/* Total Trainings */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-amber-700/30 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-amber-600/20 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-1">{stats.totalTrainings}</div>
          <div className="text-slate-400 text-sm">Capacitaciones Completadas</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-medium">Progreso de Capacitación</span>
          <span className="text-slate-400 text-sm">
            {stats.venuesWithTraining} de {stats.totalVenues} venues
          </span>
        </div>
        <div className="w-full h-4 bg-slate-700/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
            style={{ width: `${stats.percentageTrained}%` }}
          />
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
              <div>
                <h3 className="text-xl text-white font-semibold mb-1">
                  Detalle de Capacitación por Venue
                </h3>
                <p className="text-slate-400 text-sm">
                  {filteredVenues.length} venues mostrados
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-slate-700/50 space-y-4">
              {/* Status Filter */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setDetailFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${detailFilter === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                >
                  Todos ({venues.length})
                </button>
                <button
                  onClick={() => setDetailFilter('trained')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${detailFilter === 'trained'
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                >
                  Con Capacitación ({stats.venuesWithTraining})
                </button>
                <button
                  onClick={() => setDetailFilter('untrained')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${detailFilter === 'untrained'
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                    }`}
                >
                  Sin Capacitación ({stats.venuesWithoutTraining})
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, ciudad o tipo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {/* Venues List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {filteredVenues.map((venue) => (
                  <div
                    key={venue.id}
                    className="bg-slate-900/30 border border-slate-700/50 rounded-lg p-4 hover:bg-slate-900/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Venue Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-white font-medium">{venue.nombre}</h4>
                          {venue.hasTrained ? (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Capacitado
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              Sin Capacitar
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-slate-400">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">{venue.ciudad || venue.direccion}</span>
                          </div>
                          {venue.tipo && (
                            <div className="text-slate-500">
                              {venue.tipo}
                            </div>
                          )}
                          {venue.lastTrainingDate && (
                            <div className="flex items-center gap-2 text-slate-500">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Última: {new Date(venue.lastTrainingDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Staff Training Progress */}
                        {venue.totalStaff > 0 && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-slate-400">
                                Personal capacitado: {venue.trainedStaff} de {venue.totalStaff}
                              </span>
                              <span className="text-xs text-slate-400">
                                {((venue.trainedStaff / venue.totalStaff) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-700/50 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${venue.trainedStaff === venue.totalStaff
                                  ? 'bg-green-500'
                                  : venue.trainedStaff > 0
                                    ? 'bg-amber-500'
                                    : 'bg-red-500'
                                  }`}
                                style={{ width: `${(venue.trainedStaff / venue.totalStaff) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredVenues.length === 0 && (
                  <div className="text-center py-12">
                    <GraduationCap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No se encontraron venues</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}