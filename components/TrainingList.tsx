import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { 
  GraduationCap, Calendar, Clock, MapPin, Users, 
  Award, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Training {
  id: string;
  titulo: string;
  descripcion: string;
  objetivo: string;
  categoria: string;
  tipo: string;
  nivel: string;
  fecha_inicio: string;
  fecha_fin: string;
  duracion_horas: number;
  modalidad: string;
  ubicacion: string;
  instructor_nombre: string;
  cupo_maximo: number;
  certificado_emitido: boolean;
  estado: string;
  asistencia_real?: number;
}

interface TrainingAttendee {
  estado_inscripcion: string;
  asistio?: boolean;
  calificacion_evaluacion?: number;
  aprobo?: boolean;
  certificado_emitido: boolean;
}

interface TrainingWithAttendance extends Training {
  attendee?: TrainingAttendee;
}

export function TrainingList() {
  const [trainings, setTrainings] = useState<TrainingWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'my-trainings'>('upcoming');

  useEffect(() => {
    loadTrainings();
  }, [filter]);

  const loadTrainings = async () => {
    try {
      setLoading(true);

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: btlUser } = await supabase
        .from('btl_usuarios')
        .select('id, rol')
        .eq('auth_user_id', user.id)
        .single();

      if (!btlUser) return;

      let query = supabase
        .from('btl_capacitaciones')
        .select('*');

      // Aplicar filtros
      if (filter === 'upcoming') {
        query = query
          .in('estado', ['programada', 'en_curso'])
          .gte('fecha_inicio', new Date().toISOString());
      } else if (filter === 'completed') {
        query = query.eq('estado', 'completada');
      } else if (filter === 'my-trainings') {
        // Solo capacitaciones donde el usuario está inscrito
        const { data: myAttendances } = await supabase
          .from('btl_capacitacion_asistentes')
          .select('capacitacion_id')
          .eq('usuario_id', btlUser.id);

        if (myAttendances && myAttendances.length > 0) {
          const capacitacionIds = myAttendances.map(a => a.capacitacion_id);
          query = query.in('id', capacitacionIds);
        } else {
          setTrainings([]);
          setLoading(false);
          return;
        }
      }

      const { data: trainingsData, error } = await query.order('fecha_inicio', { ascending: false });

      if (error) throw error;

      // Si es "mis capacitaciones", obtener info de asistencia
      if (filter === 'my-trainings' && trainingsData) {
        const trainingsWithAttendance = await Promise.all(
          trainingsData.map(async (training) => {
            const { data: attendee } = await supabase
              .from('btl_capacitacion_asistentes')
              .select('*')
              .eq('capacitacion_id', training.id)
              .eq('usuario_id', btlUser.id)
              .single();

            return {
              ...training,
              attendee: attendee || undefined
            };
          })
        );

        setTrainings(trainingsWithAttendance);
      } else {
        setTrainings(trainingsData || []);
      }
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (trainingId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: btlUser } = await supabase
        .from('btl_usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!btlUser) return;

      const { error } = await supabase
        .from('btl_capacitacion_asistentes')
        .insert([{
          capacitacion_id: trainingId,
          usuario_id: btlUser.id,
          estado_inscripcion: 'inscrito'
        }]);

      if (error) throw error;

      toast.success('¡Inscripción exitosa!');
      loadTrainings();
    } catch (error: any) {
      console.error('Error enrolling:', error);
      if (error.code === '23505') {
        toast.info('Ya estás inscrito en esta capacitación');
      } else {
        toast.error('Error al inscribirse');
      }
    }
  };

  const getStatusBadge = (estado: string) => {
    const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
      programada: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: Calendar, label: 'Programada' },
      en_curso: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'En Curso' },
      completada: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Completada' },
      cancelada: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, label: 'Cancelada' },
      pospuesta: { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', icon: AlertCircle, label: 'Pospuesta' }
    };

    const config = statusConfig[estado] || statusConfig.programada;
    const Icon = config.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color} flex items-center gap-1.5 w-fit`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-white font-bold mb-1">Capacitaciones</h2>
        <p className="text-slate-400">
          Consulta y registra tu asistencia a capacitaciones
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'upcoming'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Próximas
        </button>
        <button
          onClick={() => setFilter('my-trainings')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'my-trainings'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Mis Capacitaciones
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'completed'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Completadas
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Todas
        </button>
      </div>

      {/* Trainings List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : trainings.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
          <GraduationCap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl text-white font-semibold mb-2">
            No hay capacitaciones
          </h3>
          <p className="text-slate-400">
            {filter === 'upcoming' && 'No hay capacitaciones programadas próximamente'}
            {filter === 'my-trainings' && 'No te has inscrito en ninguna capacitación'}
            {filter === 'completed' && 'No hay capacitaciones completadas'}
            {filter === 'all' && 'No hay capacitaciones disponibles'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-600/20 to-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h3 className="text-white font-semibold mb-1">{training.titulo}</h3>
                      <p className="text-slate-400 text-sm line-clamp-2">{training.descripcion}</p>
                    </div>
                    {getStatusBadge(training.estado)}
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  {new Date(training.fecha_inicio).toLocaleDateString('es-MX', { 
                    day: '2-digit', 
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  {training.duracion_horas}h
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin className="w-4 h-4" />
                  {training.modalidad === 'presencial' ? 'Presencial' : 'Virtual'}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Users className="w-4 h-4" />
                  {training.asistencia_real || 0}/{training.cupo_maximo}
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                  {training.categoria}
                </span>
                <span className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded">
                  {training.nivel}
                </span>
                {training.certificado_emitido && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Certificado
                  </span>
                )}
              </div>

              {/* Instructor */}
              <div className="mb-4">
                <p className="text-slate-400 text-xs mb-1">Instructor</p>
                <p className="text-white text-sm font-medium">{training.instructor_nombre}</p>
              </div>

              {/* My Training Status */}
              {training.attendee && (
                <div className="border-t border-slate-700/50 pt-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-xs mb-1">Mi Estado</p>
                      <p className="text-white text-sm font-medium capitalize">
                        {training.attendee.estado_inscripcion.replace('_', ' ')}
                      </p>
                    </div>
                    {training.attendee.calificacion_evaluacion && (
                      <div className="text-right">
                        <p className="text-slate-400 text-xs mb-1">Calificación</p>
                        <p className={`text-lg font-bold ${
                          training.attendee.aprobo ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {training.attendee.calificacion_evaluacion.toFixed(1)}
                        </p>
                      </div>
                    )}
                  </div>
                  {training.attendee.certificado_emitido && (
                    <div className="mt-3 p-2 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-xs flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Certificado emitido
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              {!training.attendee && training.estado === 'programada' && (
                <button
                  onClick={() => handleEnroll(training.id)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all font-medium"
                >
                  Inscribirme
                </button>
              )}

              {training.attendee && training.estado === 'programada' && (
                <div className="w-full px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg text-center font-medium">
                  Inscrito
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
