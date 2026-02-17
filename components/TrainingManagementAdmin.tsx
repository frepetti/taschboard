import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, Calendar, Users, BookOpen, X, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface TrainingManagementProps {
  session: any;
}

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
  estado: string;
  asistencia_real: number;
  asistencia_esperada: number;
  created_at: string;
}

export function TrainingManagementAdmin({ session }: TrainingManagementProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [trainingToDelete, setTrainingToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    objetivo: '',
    categoria: 'Producto',
    tipo: 'Presencial',
    nivel: 'Básico',
    fecha_inicio: '',
    fecha_fin: '',
    duracion_horas: 0,
    modalidad: 'presencial',
    ubicacion: '',
    instructor_nombre: '',
    cupo_maximo: 20,
    cupo_minimo: 1,
    estado: 'programada',
    asistencia_esperada: 0,
  });

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('btl_capacitaciones')
        .select('*')
        .order('fecha_inicio', { ascending: false });

      if (error) throw error;
      setTrainings(data || []);
    } catch (error: any) {
      console.error('Error loading trainings:', error);
      toast.error('Error al cargar las capacitaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (training?: Training) => {
    if (training) {
      setEditingTraining(training);
      setFormData({
        titulo: training.titulo,
        descripcion: training.descripcion || '',
        objetivo: training.objetivo || '',
        categoria: training.categoria || 'Producto',
        tipo: training.tipo || 'Presencial',
        nivel: training.nivel || 'Básico',
        fecha_inicio: training.fecha_inicio ? new Date(training.fecha_inicio).toISOString().slice(0, 16) : '',
        fecha_fin: training.fecha_fin ? new Date(training.fecha_fin).toISOString().slice(0, 16) : '',
        duracion_horas: training.duracion_horas || 0,
        modalidad: training.modalidad || 'presencial',
        ubicacion: training.ubicacion || '',
        instructor_nombre: training.instructor_nombre || '',
        cupo_maximo: training.cupo_maximo || 20,
        cupo_minimo: 1,
        estado: training.estado || 'programada',
        asistencia_esperada: training.asistencia_esperada || 0,
      });
    } else {
      setEditingTraining(null);
      setFormData({
        titulo: '',
        descripcion: '',
        objetivo: '',
        categoria: 'Producto',
        tipo: 'Presencial',
        nivel: 'Básico',
        fecha_inicio: '',
        fecha_fin: '',
        duracion_horas: 0,
        modalidad: 'presencial',
        ubicacion: '',
        instructor_nombre: '',
        cupo_maximo: 20,
        cupo_minimo: 1,
        estado: 'programada',
        asistencia_esperada: 0,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTraining(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTraining) {
        // Update existing training
        const { error } = await supabase
          .from('btl_capacitaciones')
          .update(formData)
          .eq('id', editingTraining.id);

        if (error) throw error;
        toast.success('Capacitación actualizada exitosamente');
      } else {
        // Create new training
        const { error } = await supabase
          .from('btl_capacitaciones')
          .insert([{
            ...formData,
            creado_por: session.user.id,
          }]);

        if (error) throw error;
        toast.success('Capacitación creada exitosamente');
      }

      handleCloseModal();
      await loadTrainings();
    } catch (error: any) {
      console.error('Error saving training:', error);
      toast.error('Error al guardar la capacitación');
    }
  };

  const handleDelete = (id: string) => {
    setTrainingToDelete(id);
  };

  const confirmDelete = async () => {
    if (!trainingToDelete) return;
    const id = trainingToDelete;

    try {
      const { error } = await supabase
        .from('btl_capacitaciones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Capacitación eliminada exitosamente');
      await loadTrainings();
    } catch (error: any) {
      console.error('Error deleting training:', error);
      toast.error('Error al eliminar la capacitación');
    } finally {
      setTrainingToDelete(null);
    }
  };

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = 
      training.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.instructor_nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      training.categoria?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || training.estado === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'programada': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'en_curso': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'completada': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'cancelada': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'pospuesta': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'programada': return 'Programada';
      case 'en_curso': return 'En Curso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      case 'pospuesta': return 'Pospuesta';
      default: return estado;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl text-white font-semibold">Gestión de Capacitaciones</h2>
          <p className="text-slate-400 text-sm">Total: {trainings.length} capacitaciones</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Capacitación</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por título, instructor o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          <option value="all">Todos los estados</option>
          <option value="programada">Programada</option>
          <option value="en_curso">En Curso</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
          <option value="pospuesta">Pospuesta</option>
        </select>
      </div>

      {/* Trainings List */}
      {filteredTrainings.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">
            {searchQuery || filterStatus !== 'all' 
              ? 'No se encontraron capacitaciones con los filtros aplicados'
              : 'No hay capacitaciones registradas. Crea la primera capacitación.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTrainings.map((training) => (
            <div
              key={training.id}
              className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-slate-600/50 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Main Info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg text-white font-semibold mb-1">{training.titulo}</h3>
                      {training.descripcion && (
                        <p className="text-sm text-slate-400 line-clamp-2">{training.descripcion}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getStatusColor(training.estado)}`}>
                      {getStatusLabel(training.estado)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(training.fecha_inicio)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{training.categoria || 'Sin categoría'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>
                        {training.asistencia_real || 0}/{training.cupo_maximo} asistentes
                      </span>
                    </div>
                    <div className="text-slate-400">
                      <span className="font-medium">Instructor:</span> {training.instructor_nombre || 'No asignado'}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400">
                      {training.tipo || 'Presencial'}
                    </span>
                    <span className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400">
                      {training.nivel || 'Básico'}
                    </span>
                    <span className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400">
                      {training.duracion_horas}h
                    </span>
                    <span className="px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400">
                      {training.modalidad || 'presencial'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2">
                  <button
                    onClick={() => handleOpenModal(training)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Editar</span>
                  </button>
                  <button
                    onClick={() => handleDelete(training.id)}
                    className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!trainingToDelete}
        onClose={() => setTrainingToDelete(null)}
        onConfirm={confirmDelete}
        title="Eliminar Capacitación"
        message="¿Estás seguro de que deseas eliminar esta capacitación? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        variant="danger"
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl max-w-3xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl text-white font-semibold">
                {editingTraining ? 'Editar Capacitación' : 'Nueva Capacitación'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Título */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Título <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Ej: Introducción a Productos Premium 2026"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="Descripción de la capacitación..."
                />
              </div>

              {/* Objetivo */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Objetivo</label>
                <textarea
                  value={formData.objetivo}
                  onChange={(e) => setFormData({ ...formData, objetivo: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="Objetivo de aprendizaje..."
                />
              </div>

              {/* Categoría, Tipo, Nivel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Categoría</label>
                  <select
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="Producto">Producto</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Trade Marketing">Trade Marketing</option>
                    <option value="Técnica">Técnica</option>
                    <option value="Seguridad">Seguridad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Tipo</label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Virtual">Virtual</option>
                    <option value="Híbrida">Híbrida</option>
                    <option value="E-learning">E-learning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Nivel</label>
                  <select
                    value={formData.nivel}
                    onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              {/* Fechas y Duración */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Fecha Inicio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    required
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Fecha Fin</label>
                  <input
                    type="datetime-local"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Duración (horas)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.duracion_horas}
                    onChange={(e) => setFormData({ ...formData, duracion_horas: parseFloat(e.target.value) })}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>
              </div>

              {/* Modalidad y Ubicación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Modalidad</label>
                  <select
                    value={formData.modalidad}
                    onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="virtual">Virtual</option>
                    <option value="hibrida">Híbrida</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    placeholder="Ej: Oficina Central - Sala A"
                  />
                </div>
              </div>

              {/* Instructor */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">Instructor</label>
                <input
                  type="text"
                  value={formData.instructor_nombre}
                  onChange={(e) => setFormData({ ...formData, instructor_nombre: e.target.value })}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Nombre del instructor"
                />
              </div>

              {/* Cupos y Estado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Cupo Máximo</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.cupo_maximo}
                    onChange={(e) => setFormData({ ...formData, cupo_maximo: parseInt(e.target.value) })}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Asistencia Esperada</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.asistencia_esperada}
                    onChange={(e) => setFormData({ ...formData, asistencia_esperada: parseInt(e.target.value) })}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <option value="programada">Programada</option>
                    <option value="en_curso">En Curso</option>
                    <option value="completada">Completada</option>
                    <option value="cancelada">Cancelada</option>
                    <option value="pospuesta">Pospuesta</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  {editingTraining ? 'Guardar Cambios' : 'Crear Capacitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}