import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import {
  Calendar, TrendingUp, X, Filter, MapPin, DollarSign, FileText,
  Clock, Zap, CheckCircle2, AlertCircle, RotateCcw, Package,
  Tag, Layers, AlertTriangle, ChevronRight, Star
} from 'lucide-react';

export interface Activation {
  id: string;
  venue: string;
  date: string;
  type: string;
  impact: string;
  status: 'success' | 'active' | 'scheduled' | 'pending';
  rawDate?: Date;
  numericImpact?: number | null;
  // Campos enriquecidos (provenientes de btl_reportes)
  asunto?: string | null;
  titulo?: string | null;
  descripcion?: string | null;
  notas?: string | null;
  ubicacion?: string | null;
  presupuesto?: string | number | null;
  tipo_activacion?: string | null;
  // Campos BTL adicionales
  productos_involucrados?: string[] | null;
  tipo_material?: string | null;
  cantidad_solicitada?: number | null;
  marca_producto?: string | null;
  fecha_entrega_requerida?: string | null;
  prioridad?: string | null;
}

interface ProductInfo {
  id: string;
  nombre: string;
  marca: string;
}

interface ActivationTimelineProps {
  activations?: Activation[];
}

export function ActivationTimeline({ activations = [] }: ActivationTimelineProps) {
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedActivation, setSelectedActivation] = useState<Activation | null>(null);
  const [resolvedProducts, setResolvedProducts] = useState<ProductInfo[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch product details when a modal is opened with productos_involucrados
  useEffect(() => {
    if (
      selectedActivation?.productos_involucrados &&
      selectedActivation.productos_involucrados.length > 0
    ) {
      fetchProducts(selectedActivation.productos_involucrados);
    } else {
      setResolvedProducts([]);
    }
  }, [selectedActivation]);

  const fetchProducts = async (ids: string[]) => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase
        .from('btl_productos')
        .select('id, nombre, marca')
        .in('id', ids);

      if (error) throw error;
      setResolvedProducts((data as ProductInfo[]) || []);
    } catch (err) {
      console.error('Error fetching productos:', err);
      setResolvedProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'active': return <Zap className="w-4 h-4 text-amber-400" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-400" />;
      case 'pending': return <RotateCcw className="w-4 h-4 text-slate-400" />;
      default: return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success': return 'Completada';
      case 'active': return 'En Progreso';
      case 'scheduled': return 'Abierta';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const getPrioridadStyles = (prioridad: string | null | undefined) => {
    switch (prioridad?.toLowerCase()) {
      case 'critica': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'alta': return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'media': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'baja': return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
      default: return null;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const filteredActivations = filterType === 'all'
    ? displayActivations
    : displayActivations.filter(a => a.status === filterType);

  // ─── DETAIL MODAL ──────────────────────────────────────────────────
  const renderDetailModal = () => {
    if (!selectedActivation) return null;

    const av = selectedActivation;

    const headerBg =
      av.status === 'success' ? 'bg-green-900/10' :
      av.status === 'active'  ? 'bg-amber-900/10' :
      'bg-blue-900/10';

    const iconBg =
      av.status === 'success' ? 'bg-green-500/15' :
      av.status === 'active'  ? 'bg-amber-500/15' :
      'bg-blue-500/15';

    const iconColor =
      av.status === 'success' ? 'text-green-400' :
      av.status === 'active'  ? 'text-amber-400' :
      'text-blue-400';

    const statusTextColor =
      av.status === 'success' ? 'text-green-400' :
      av.status === 'active'  ? 'text-amber-400' :
      'text-blue-400';

    const displayTitle = av.asunto || av.titulo || av.venue;
    const hasRichContent =
      av.descripcion || av.tipo_material || av.cantidad_solicitada ||
      av.marca_producto || av.fecha_entrega_requerida || av.prioridad ||
      (av.productos_involucrados && av.productos_involucrados.length > 0);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        onClick={() => setSelectedActivation(null)}
      >
        <div
          className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl shadow-black/60 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* ── HEADER ── */}
          <div className={`p-5 border-b border-slate-800 flex items-start justify-between gap-4 ${headerBg}`}>
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className={`p-2.5 rounded-xl flex-shrink-0 ${iconBg}`}>
                <Zap className={`w-5 h-5 ${iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-white font-bold text-lg leading-tight">
                  {displayTitle}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-slate-400 text-sm">{av.venue}</span>
                  {av.prioridad && getPrioridadStyles(av.prioridad) && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${getPrioridadStyles(av.prioridad)}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {av.prioridad.charAt(0).toUpperCase() + av.prioridad.slice(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedActivation(null)}
              className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── BODY (scrollable) ── */}
          <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">

            {/* Row 1: Estado + Tipo */}
            <div className="grid grid-cols-2 gap-3">
              {/* Estado */}
              <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/40">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5">Estado</p>
                <div className="flex items-center gap-2">
                  {getStatusIcon(av.status)}
                  <span className={`text-sm font-semibold ${statusTextColor}`}>
                    {getStatusLabel(av.status)}
                  </span>
                </div>
              </div>
              {/* Tipo */}
              <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/40">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5">Tipo</p>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <p className="text-sm font-semibold text-white">
                    {av.tipo_activacion || av.type || '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Row 2: Fecha Programada + Impacto */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/40">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5">Fecha Programada</p>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <p className="text-sm font-semibold text-white">{formatDate(av.date)}</p>
                </div>
              </div>
              {av.impact && av.impact !== 'N/A' && av.impact !== 'TBD' ? (
                <div className="bg-green-900/20 rounded-xl p-3.5 border border-green-700/30">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5">Impacto</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <p className="text-lg font-bold text-green-400">{av.impact}</p>
                  </div>
                </div>
              ) : av.fecha_entrega_requerida ? (
                <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/40">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1.5">Entrega Requerida</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <p className="text-sm font-semibold text-white">{formatDate(av.fecha_entrega_requerida)}</p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Material + Cantidad */}
            {(av.tipo_material || av.cantidad_solicitada || av.marca_producto) && (
              <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/40">
                <div className="flex items-center gap-2 mb-3">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Material y Logística</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {av.tipo_material && (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Tipo de material</p>
                      <p className="text-sm text-white font-medium">{av.tipo_material}</p>
                    </div>
                  )}
                  {av.cantidad_solicitada && (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Cantidad solicitada</p>
                      <p className="text-sm text-white font-medium">{av.cantidad_solicitada} unidades</p>
                    </div>
                  )}
                  {av.marca_producto && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-500 mb-0.5">Marca del producto</p>
                      <p className="text-sm text-white font-medium">{av.marca_producto}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Productos involucrados */}
            {av.productos_involucrados && av.productos_involucrados.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-3.5 border border-amber-700/20">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-4 h-4 text-amber-400" />
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Productos Involucrados</p>
                </div>
                {loadingProducts ? (
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-3 h-3 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                    <span className="text-xs text-slate-400">Cargando productos...</span>
                  </div>
                ) : resolvedProducts.length > 0 ? (
                  <div className="space-y-2">
                    {resolvedProducts.map(p => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-700/30"
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white leading-tight">{p.nombre}</p>
                          <p className="text-xs text-slate-400">{p.marca}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {av.productos_involucrados.length} producto(s) referenciado(s) — sin detalle disponible.
                  </p>
                )}
              </div>
            )}

            {/* Ubicación */}
            {av.ubicacion && (
              <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/40 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Ubicación / Venue</p>
                  <p className="text-sm text-white">{av.ubicacion}</p>
                </div>
              </div>
            )}

            {/* Presupuesto */}
            {av.presupuesto && (
              <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/40 flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Presupuesto Asignado</p>
                  <p className="text-sm text-white font-semibold">{av.presupuesto}</p>
                </div>
              </div>
            )}

            {/* Descripción */}
            {av.descripcion && (
              <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/40">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Descripción</p>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {av.descripcion}
                </p>
              </div>
            )}

            {/* Notas adicionales */}
            {av.notas && av.notas !== av.descripcion && (
              <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/40">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Notas Adicionales</p>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {av.notas}
                </p>
              </div>
            )}

            {/* Fallback: sin contenido enriquecido */}
            {!hasRichContent && (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-slate-500" />
                </div>
                <p className="text-slate-500 text-sm italic text-center">
                  Sin información adicional registrada para esta activación.
                </p>
              </div>
            )}
          </div>

          {/* ── FOOTER ── */}
          <div className="px-5 pb-5 pt-3 border-t border-slate-800">
            <button
              onClick={() => setSelectedActivation(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors text-sm font-medium border border-slate-700/50 hover:border-slate-600"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  };

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
                <div
                  key={activation.id}
                  className="relative flex items-start gap-4 pl-14 cursor-pointer group"
                  onClick={() => setSelectedActivation(activation)}
                >
                  {/* Timeline dot */}
                  <div className={`absolute left-5 w-3 h-3 rounded-full border-2 transition-transform group-hover:scale-125 ${
                    activation.status === 'success' ? 'bg-green-500 border-green-400' :
                    activation.status === 'active' ? 'bg-amber-500 border-amber-400 animate-pulse' :
                    'bg-slate-600 border-slate-500'
                  }`} />

                  <div className="flex-1 bg-slate-800/30 rounded-lg border border-slate-700/30 p-4 hover:border-amber-500/40 hover:bg-slate-800/50 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-amber-500/5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-white font-semibold">
                            {activation.asunto || activation.venue}
                          </h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusStyles(activation.status)}`}>
                            {activation.tipo_activacion || activation.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span>{activation.venue}</span>
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
                      {/* Click hint */}
                      <div className="flex items-center gap-1 text-xs text-slate-600 group-hover:text-amber-500/60 transition-colors mt-1">
                        <span>Ver</span>
                        <ChevronRight className="w-3 h-3" />
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

      {/* ═══════════════════════════════════════════════
          DETAIL MODAL
          ═══════════════════════════════════════════════ */}
      {renderDetailModal()}

      {/* ═══════════════════════════════════════════════
          FULL CALENDAR MODAL
          ═══════════════════════════════════════════════ */}
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
              {[
                { key: 'all', label: 'Todos' },
                { key: 'active', label: 'En Progreso' },
                { key: 'scheduled', label: 'Abiertos' },
                { key: 'success', label: 'Completados' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterType(key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    filterType === key
                      ? key === 'active'
                        ? 'bg-amber-900/50 text-amber-400 border border-amber-500/30'
                        : key === 'scheduled'
                          ? 'bg-blue-900/50 text-blue-400 border border-blue-500/30'
                          : key === 'success'
                            ? 'bg-green-900/50 text-green-400 border border-green-500/30'
                            : 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Scrollable List */}
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
                      <div
                        key={activation.id}
                        className="relative flex items-start gap-4 pl-14 group cursor-pointer"
                        onClick={() => setSelectedActivation(activation)}
                      >
                        {/* Timeline dot */}
                        <div className={`absolute left-5 mt-1.5 w-3 h-3 rounded-full border-2 z-10 transition-transform group-hover:scale-125 ${
                          activation.status === 'success' ? 'bg-green-500 border-green-400' :
                          activation.status === 'active' ? 'bg-amber-500 border-amber-400 animate-pulse' :
                          'bg-slate-600 border-slate-500'
                        }`} />

                        <div className="flex-1 bg-slate-800/40 rounded-xl border border-slate-700/50 p-5 hover:border-amber-500/30 hover:bg-slate-800/60 transition-all duration-300">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h4 className="text-lg text-white font-bold">
                                  {activation.asunto || activation.venue}
                                </h4>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusStyles(activation.status)}`}>
                                  {getStatusLabel(activation.status)}
                                </span>
                                {activation.tipo_activacion && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-slate-700/40 text-slate-300 border-slate-600/40">
                                    {activation.tipo_activacion}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{activation.venue}</span>
                              </div>
                              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{formatDate(activation.date)}</span>
                              </div>
                              {activation.descripcion && (
                                <p className="text-sm text-slate-400 line-clamp-2 mt-1">
                                  {activation.descripcion}
                                </p>
                              )}
                              {activation.tipo_material && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                  <Layers className="w-3 h-3" />
                                  <span>{activation.tipo_material}{activation.cantidad_solicitada ? ` · ${activation.cantidad_solicitada} unid.` : ''}</span>
                                </div>
                              )}
                            </div>

                            {/* Impact Section */}
                            {activation.impact && activation.impact !== 'N/A' && activation.impact !== 'TBD' && (
                              <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50 self-start">
                                <div className={`p-2 rounded-lg ${activation.status === 'success' ? 'bg-green-500/10' : 'bg-slate-700/50'}`}>
                                  <TrendingUp className={`w-5 h-5 ${activation.status === 'success' ? 'text-green-400' : 'text-slate-400'}`} />
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Impacto</p>
                                  <p className={`text-lg font-bold ${activation.status === 'success' ? 'text-green-400' : 'text-slate-300'}`}>
                                    {activation.impact}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Ver detalles hint */}
                          <div className="flex items-center gap-1 text-xs text-slate-600 group-hover:text-amber-500/60 transition-colors mt-3 justify-end">
                            <span>Ver detalles</span>
                            <ChevronRight className="w-3 h-3" />
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