import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import {
  GraduationCap, Plus, Edit2, Trash2, Search, X, Check,
  Calendar, Users, MapPin, Clock, Award, TrendingUp,
  CheckCircle, XCircle, AlertCircle, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface Training {
  id?: string;
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
  plataforma?: string;
  link_sesion?: string;
  instructor_nombre: string;
  instructor_empresa?: string;
  instructor_contacto?: string;
  cupo_maximo: number;
  cupo_minimo: number;
  certificado_emitido: boolean;
  requiere_evaluacion: boolean;
  nota_minima_aprobacion?: number;
  estado: string;
  asistencia_esperada: number;
  asistencia_real?: number;
  porcentaje_asistencia?: number;
  promedio_calificacion?: number;
  promedio_satisfaccion?: number;
  temas?: string[];
  costo_total?: number;
}

interface TrainingManagementProps {
  session?: any;
}

export function TrainingManagement({ session }: TrainingManagementProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [trainingToDelete, setTrainingToDelete] = useState<string | null>(null);

  const emptyTraining: Training = {
    titulo: '',
    descripcion: '',
    objetivo: '',
    categoria: 'Producto',
    tipo: 'Presencial',
    nivel: 'Básico',
    fecha_inicio: '',
    fecha_fin: '',
    duracion_horas: 4,
    modalidad: 'presencial',
    ubicacion: '',
    instructor_nombre: '',
    cupo_maximo: 30,
    cupo_minimo: 10,
    certificado_emitido: true,
    requiere_evaluacion: true,
    nota_minima_aprobacion: 7.0,
    estado: 'programada',
    asistencia_esperada: 25,
    temas: []
  };

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('btl_capacitaciones')
        .select('*')
        .order('fecha_inicio', { ascending: false });

      if (error) throw error;
      setTrainings(data || []);
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTraining = async (training: Training) => {
    try {
      // Obtener usuario actual (usar session si existe, sino getUser)
      let userId = session?.user?.id;

      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        userId = user.id;
      }

      const { data: btlUser } = await supabase
        .from('btl_usuarios')
        .select('id')
        .eq('auth_user_id', userId)
        .single();

      if (training.id) {
        // Update
        const { error } = await supabase
          .from('btl_capacitaciones')
          .update(training)
          .eq('id', training.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('btl_capacitaciones')
          .insert([{
            ...training,
            creado_por: btlUser?.id
          }]);

        if (error) throw error;
      }

      await loadTrainings();
      setShowForm(false);
      setEditingTraining(null);
      toast.success('Capacitación guardada correctamente');
    } catch (error) {
      console.error('Error saving training:', error);
      toast.error('Error al guardar la capacitación');
    }
  };

  const handleDeleteTraining = (id: string) => {
    setTrainingToDelete(id);
  };

  const confirmDeleteTraining = async () => {
    if (!trainingToDelete) return;
    const id = trainingToDelete;

    try {
      const { error } = await supabase
        .from('btl_capacitaciones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadTrainings();
      toast.success('Capacitación eliminada correctamente');
    } catch (error) {
      console.error('Error deleting training:', error);
      toast.error('Error al eliminar la capacitación');
    } finally {
      setTrainingToDelete(null);
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

  const filteredTrainings = trainings.filter(t => {
    const matchesSearch = t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.instructor_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || t.estado === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: trainings.length,
    programadas: trainings.filter(t => t.estado === 'programada').length,
    completadas: trainings.filter(t => t.estado === 'completada').length,
    enCurso: trainings.filter(t => t.estado === 'en_curso').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-white font-bold mb-1">Gestión de Capacitaciones</h2>
          <p className="text-slate-400">
            Administra el programa de capacitación para el equipo
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTraining(emptyTraining);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nueva Capacitación
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total</p>
              <p className="text-2xl text-white font-bold">{stats.total}</p>
            </div>
            <GraduationCap className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 backdrop-blur-sm border border-blue-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm">Programadas</p>
              <p className="text-2xl text-white font-bold">{stats.programadas}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 backdrop-blur-sm border border-yellow-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm">En Curso</p>
              <p className="text-2xl text-white font-bold">{stats.enCurso}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 backdrop-blur-sm border border-green-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm">Completadas</p>
              <p className="text-2xl text-white font-bold">{stats.completadas}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar capacitaciones..."
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
        >
          <option value="all">Todos los estados</option>
          <option value="programada">Programadas</option>
          <option value="en_curso">En Curso</option>
          <option value="completada">Completadas</option>
          <option value="cancelada">Canceladas</option>
        </select>
      </div>

      {/* Trainings List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTrainings.map((training) => (
            <div
              key={training.id}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-600/20 to-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <h3 className="text-white font-semibold text-lg mb-1">{training.titulo}</h3>
                          <p className="text-slate-400 text-sm line-clamp-2">{training.descripcion}</p>
                        </div>
                        {getStatusBadge(training.estado)}
                      </div>

                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(training.fecha_inicio).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-4 h-4" />
                          {training.duracion_horas}h
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-4 h-4" />
                          {training.modalidad === 'presencial' ? training.ubicacion : 'Virtual'}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Users className="w-4 h-4" />
                          {training.asistencia_real || 0}/{training.cupo_maximo}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 ml-16">
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Instructor</p>
                      <p className="text-white text-sm font-medium">{training.instructor_nombre}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Categoría</p>
                      <p className="text-white text-sm font-medium">{training.categoria}</p>
                    </div>
                    <div className="bg-slate-700/30 rounded-lg p-3">
                      <p className="text-slate-400 text-xs mb-1">Nivel</p>
                      <p className="text-white text-sm font-medium">{training.nivel}</p>
                    </div>
                    {training.estado === 'completada' && training.promedio_satisfaccion && (
                      <div className="bg-slate-700/30 rounded-lg p-3">
                        <p className="text-slate-400 text-xs mb-1">Satisfacción</p>
                        <p className="text-green-400 text-sm font-medium flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {training.promedio_satisfaccion.toFixed(1)}/10
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingTraining(training);
                      setShowForm(true);
                    }}
                    className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => training.id && handleDeleteTraining(training.id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredTrainings.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl text-white font-semibold mb-2">
                No hay capacitaciones
              </h3>
              <p className="text-slate-400">
                {searchTerm ? 'No se encontraron resultados' : 'Crea la primera capacitación para comenzar'}
              </p>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!trainingToDelete}
        onClose={() => setTrainingToDelete(null)}
        onConfirm={confirmDeleteTraining}
        title="Eliminar Capacitación"
        message="¿Estás seguro de que deseas eliminar esta capacitación? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Training Form Modal */}
      {showForm && editingTraining && (
        <TrainingForm
          training={editingTraining}
          onSave={handleSaveTraining}
          onClose={() => {
            setShowForm(false);
            setEditingTraining(null);
          }}
        />
      )}
    </div>
  );
}

// Training Form Component
function TrainingForm({
  training,
  onSave,
  onClose
}: {
  training: Training;
  onSave: (training: Training) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState(training);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl max-w-4xl w-full my-8">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="p-6 border-b border-slate-700/50 sticky top-0 bg-slate-900/95 backdrop-blur-sm z-10 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-white font-bold">
                {formData.id ? 'Editar Capacitación' : 'Nueva Capacitación'}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Información Básica */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                Información Básica
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Título *</label>
                  <input
                    type="text"
                    required
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Descripción</label>
                  <textarea
                    rows={3}
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Objetivo de Aprendizaje</label>
                  <textarea
                    rows={2}
                    value={formData.objetivo}
                    onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Categoría</label>
                    <select
                      value={formData.categoria}
                      onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option>Producto</option>
                      <option>Ventas</option>
                      <option>Trade Marketing</option>
                      <option>Técnica</option>
                      <option>Seguridad</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Tipo</label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option>Presencial</option>
                      <option>Virtual</option>
                      <option>Híbrida</option>
                      <option>E-learning</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Nivel</label>
                    <select
                      value={formData.nivel}
                      onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option>Básico</option>
                      <option>Intermedio</option>
                      <option>Avanzado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Programación */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                Programación
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Fecha Inicio *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Fecha Fin</label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Duración (horas)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.duracion_horas}
                    onChange={(e) => setFormData({ ...formData, duracion_horas: Number(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400" />
                Ubicación
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Modalidad</label>
                  <select
                    value={formData.modalidad}
                    onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="hibrida">Híbrida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Ubicación/Plataforma</label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    placeholder="Dirección o nombre de plataforma"
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Instructor */}
            <div>
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                Instructor
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Nombre *</label>
                  <input
                    type="text"
                    required
                    value={formData.instructor_nombre}
                    onChange={(e) => setFormData({ ...formData, instructor_nombre: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Empresa</label>
                  <input
                    type="text"
                    value={formData.instructor_empresa || ''}
                    onChange={(e) => setFormData({ ...formData, instructor_empresa: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-sm mb-2">Contacto</label>
                  <input
                    type="text"
                    value={formData.instructor_contacto || ''}
                    onChange={(e) => setFormData({ ...formData, instructor_contacto: e.target.value })}
                    placeholder="Email o teléfono"
                    className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Capacidad y Evaluación */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-white font-semibold mb-4">Capacidad</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Cupo Máximo</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.cupo_maximo}
                      onChange={(e) => setFormData({ ...formData, cupo_maximo: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Cupo Mínimo</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.cupo_minimo}
                      onChange={(e) => setFormData({ ...formData, cupo_minimo: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Asistencia Esperada</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.asistencia_esperada}
                      onChange={(e) => setFormData({ ...formData, asistencia_esperada: Number(e.target.value) })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">Evaluación</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.requiere_evaluacion}
                      onChange={(e) => setFormData({ ...formData, requiere_evaluacion: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-800/50 border-slate-700/50 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-300">Requiere Evaluación</span>
                  </label>
                  {formData.requiere_evaluacion && (
                    <div>
                      <label className="block text-slate-300 text-sm mb-2">Nota Mínima Aprobación</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={formData.nota_minima_aprobacion || 7.0}
                        onChange={(e) => setFormData({ ...formData, nota_minima_aprobacion: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.certificado_emitido}
                      onChange={(e) => setFormData({ ...formData, certificado_emitido: e.target.checked })}
                      className="w-5 h-5 rounded bg-slate-800/50 border-slate-700/50 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-slate-300">Emite Certificado</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-slate-300 text-sm mb-2">Estado</label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="programada">Programada</option>
                <option value="en_curso">En Curso</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
                <option value="pospuesta">Pospuesta</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-700/50 bg-slate-800/30 flex justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-700/50 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-500 hover:to-amber-400 transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
