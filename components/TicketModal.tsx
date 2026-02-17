import { useState, useEffect } from 'react';
import { X, Send, Loader2, GraduationCap, Zap, Package, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { sendAdminNotification } from '../utils/notifications';
import { toast } from 'sonner';

interface TicketModalProps {
  session: any;
  onClose: () => void;
}

type TicketCategory = 'general' | 'capacitacion' | 'accion_btl' | 'material_pop';

interface Training {
  id: string;
  titulo: string;
  fecha_inicio: string;
  instructor_nombre: string;
  estado: string;
}

interface Venue {
  id: string;
  nombre: string;
  ciudad: string;
  tipo: string;
}

interface Product {
  id: string;
  nombre: string;
  marca: string;
  categoria: string;
}

interface MaterialItem {
  tipo: string;
  cantidad: number;
}

export function TicketModal({ session, onClose }: TicketModalProps) {
  const [category, setCategory] = useState<TicketCategory>('general');
  const [loading, setLoading] = useState(false);
  
  // Datos para selects
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Campos generales
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Campos de Capacitación
  const [selectedTraining, setSelectedTraining] = useState('');
  const [participantesEstimados, setParticipantesEstimados] = useState<number>(1);
  const [temasInteres, setTemasInteres] = useState('');

  // Campos de Acción BTL
  const [tipoActivacion, setTipoActivacion] = useState('');
  const [fechaActivacion, setFechaActivacion] = useState('');
  const [ubicacionActivacion, setUbicacionActivacion] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');
  const [presupuestoEstimado, setPresupuestoEstimado] = useState<number>(0);
  const [impactoEsperado, setImpactoEsperado] = useState<number>(0);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Campos de Material POP
  const [materialItems, setMaterialItems] = useState<MaterialItem[]>([
    { tipo: '', cantidad: 1 }
  ]);
  const [dimensiones, setDimensiones] = useState('');
  const [materialEspecificaciones, setMaterialEspecificaciones] = useState('');
  const [fechaEntregaRequerida, setFechaEntregaRequerida] = useState('');
  const [direccionEntrega, setDireccionEntrega] = useState('');
  const [marcaProducto, setMarcaProducto] = useState('');

  useEffect(() => {
    loadData();
  }, [category]);

  const loadData = async () => {
    try {
      // Cargar capacitaciones si es necesario
      if (category === 'capacitacion') {
        const { data } = await supabase
          .from('btl_capacitaciones')
          .select('id, titulo, fecha_inicio, instructor_nombre, estado')
          .in('estado', ['programada', 'en_curso'])
          .order('fecha_inicio');
        
        if (data) setTrainings(data);
      }

      // Cargar puntos de venta si es necesario
      if (category === 'accion_btl') {
        const { data } = await supabase
          .from('btl_puntos_venta')
          .select('id, nombre, ciudad, tipo')
          .order('nombre');
        
        if (data) setVenues(data);
      }

      // Cargar productos del cliente si es necesario
      if (category === 'accion_btl' || category === 'material_pop') {
        // Primero obtener el usuario actual
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: btlUser } = await supabase
            .from('btl_usuarios')
            .select('id')
            .eq('auth_user_id', user.id)
            .single();

          if (btlUser) {
            // Obtener productos asignados a este cliente
            const { data: clienteProductos } = await supabase
              .from('btl_cliente_productos')
              .select(`
                producto_id,
                activo,
                prioridad,
                btl_productos!inner (
                  id,
                  nombre,
                  marca,
                  categoria
                )
              `)
              .eq('usuario_id', btlUser.id)
              .eq('activo', true)
              .eq('visible_dashboard', true)
              .order('prioridad', { ascending: false });

            if (clienteProductos) {
              const productosFormateados = clienteProductos.map((cp: any) => ({
                id: cp.btl_productos.id,
                nombre: cp.btl_productos.nombre,
                marca: cp.btl_productos.marca,
                categoria: cp.btl_productos.categoria
              }));
              setProducts(productosFormateados);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const addMaterialItem = () => {
    setMaterialItems([...materialItems, { tipo: '', cantidad: 1 }]);
  };

  const removeMaterialItem = (index: number) => {
    if (materialItems.length > 1) {
      setMaterialItems(materialItems.filter((_, i) => i !== index));
    }
  };

  const updateMaterialItem = (index: number, field: keyof MaterialItem, value: string | number) => {
    const newItems = [...materialItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setMaterialItems(newItems);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: btlUser } = await supabase
        .from('btl_usuarios')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!btlUser) return;

      // Construir el objeto base
      const ticketData: any = {
        creado_por: btlUser.id,
        categoria: category,
        tipo: category === 'general' ? 'soporte' : 'Solicitud',
        titulo: subject,
        asunto: subject,
        descripcion: description,
        prioridad: priority === 'urgent' ? 'critica' : priority === 'high' ? 'alta' : priority === 'medium' ? 'media' : 'baja',
        urgente: priority === 'urgent', // Automatico cuando la prioridad es urgente
        estado: 'abierto'
      };

      // Agregar campos específicos según categoría
      if (category === 'capacitacion') {
        ticketData.capacitacion_id = selectedTraining || null;
        ticketData.participantes_estimados = participantesEstimados;
        ticketData.temas_interes = temasInteres ? temasInteres.split(',').map(t => t.trim()) : [];
      } else if (category === 'accion_btl') {
        ticketData.tipo_activacion = tipoActivacion;
        ticketData.fecha_activacion_solicitada = fechaActivacion || null;
        ticketData.ubicacion_activacion = ubicacionActivacion;
        ticketData.punto_venta_id = selectedVenue || null;
        ticketData.presupuesto_estimado = presupuestoEstimado;
        ticketData.impacto_esperado = impactoEsperado;
        ticketData.productos_involucrados = selectedProducts.length > 0 ? selectedProducts : null;
      } else if (category === 'material_pop') {
        ticketData.material_items = materialItems;
        ticketData.dimensiones = dimensiones;
        ticketData.material_especificaciones = materialEspecificaciones;
        ticketData.fecha_entrega_requerida = fechaEntregaRequerida || null;
        ticketData.direccion_entrega = direccionEntrega;
        ticketData.marca_producto = marcaProducto;
      }

      const { data: newTicket, error } = await supabase
        .from('btl_reportes')
        .insert([ticketData])
        .select()
        .single();

      if (error) throw error;

      // Send notification to admins
      sendAdminNotification({
        ticketId: newTicket.id,
        title: ticketData.titulo,
        description: ticketData.descripcion,
        category: ticketData.categoria,
        priority: ticketData.prioridad,
        createdBy: btlUser.id,
        createdByEmail: user.email
      }).catch(err => console.error('Failed to send background notification:', err));

      toast.success(category === 'general' ? 'Ticket Creado' : 'Solicitud Enviada', {
        description: `Tu ${category === 'general' ? 'ticket' : 'solicitud'} ha sido enviado correctamente.`
      });
      onClose();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Error al crear el ticket. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 p-6 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl text-white font-semibold">Nueva Solicitud / Ticket</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm text-slate-300 mb-3 font-medium">Categoría de Solicitud</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setCategory('capacitacion')}
                  className={`p-4 rounded-lg font-medium transition-all border-2 ${
                    category === 'capacitacion'
                      ? 'bg-amber-600/20 border-amber-600 text-white'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <GraduationCap className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">Capacitación</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('accion_btl')}
                  className={`p-4 rounded-lg font-medium transition-all border-2 ${
                    category === 'accion_btl'
                      ? 'bg-amber-600/20 border-amber-600 text-white'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <Zap className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">Acción BTL</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('material_pop')}
                  className={`p-4 rounded-lg font-medium transition-all border-2 ${
                    category === 'material_pop'
                      ? 'bg-amber-600/20 border-amber-600 text-white'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <Package className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">Material POP</div>
                </button>
                <button
                  type="button"
                  onClick={() => setCategory('general')}
                  className={`p-4 rounded-lg font-medium transition-all border-2 ${
                    category === 'general'
                      ? 'bg-amber-600/20 border-amber-600 text-white'
                      : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <div className="text-sm">General</div>
                </button>
              </div>
            </div>

            {/* Campos Generales */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Asunto *</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Describe brevemente el asunto"
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Descripción General *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe los detalles de tu solicitud..."
                  required
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">Prioridad</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                >
                  <option value="low">🟢 Baja</option>
                  <option value="medium">🟡 Media</option>
                  <option value="high">🟠 Alta</option>
                  <option value="urgent">🔴 Urgente</option>
                </select>
                {priority === 'urgent' && (
                  <p className="text-xs text-red-400 mt-1">⚠️ Esta solicitud será marcada como urgente y recibirá atención prioritaria.</p>
                )}
              </div>
            </div>

            {/* Campos Específicos por Categoría */}
            {category === 'capacitacion' && (
              <div className="border-t border-slate-700/50 pt-6 space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  Detalles de Capacitación
                </h3>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Capacitación Solicitada</label>
                  <select
                    value={selectedTraining}
                    onChange={(e) => setSelectedTraining(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="">Selecciona una capacitación o deja en blanco para nueva</option>
                    {trainings.map((training) => (
                      <option key={training.id} value={training.id}>
                        {training.titulo} - {new Date(training.fecha_inicio).toLocaleDateString('es-MX')}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Si la capacitación que necesitas no está en la lista, déjala en blanco y descríbela en la descripción.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Participantes Estimados</label>
                    <input
                      type="number"
                      min="1"
                      value={participantesEstimados}
                      onChange={(e) => setParticipantesEstimados(Number(e.target.value))}
                      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Temas de Interés</label>
                    <input
                      type="text"
                      value={temasInteres}
                      onChange={(e) => setTemasInteres(e.target.value)}
                      placeholder="Ej: Productos, Merchandising, Ventas"
                      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {category === 'accion_btl' && (
              <div className="border-t border-slate-700/50 pt-6 space-y-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Detalles de Acción BTL
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Tipo de Activación *</label>
                    <select
                      value={tipoActivacion}
                      onChange={(e) => setTipoActivacion(e.target.value)}
                      required
                      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      <option value="">Selecciona...</option>
                      <option value="Degustación">Degustación</option>
                      <option value="Sampling">Sampling</option>
                      <option value="Evento">Evento Especial</option>
                      <option value="Demo">Demostración</option>
                      <option value="Promoción">Promoción</option>
                      <option value="Activación de Marca">Activación de Marca</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Fecha Solicitada *</label>
                    <input
                      type="date"
                      value={fechaActivacion}
                      onChange={(e) => setFechaActivacion(e.target.value)}
                      required
                      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Punto de Venta</label>
                  <select
                    value={selectedVenue}
                    onChange={(e) => setSelectedVenue(e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  >
                    <option value="">Selecciona un punto de venta</option>
                    {venues.map((venue) => (
                      <option key={venue.id} value={venue.id}>
                        {venue.nombre} - {venue.ciudad} ({venue.tipo})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Ubicación / Dirección</label>
                  <input
                    type="text"
                    value={ubicacionActivacion}
                    onChange={(e) => setUbicacionActivacion(e.target.value)}
                    placeholder="Si no está en la lista, especifica la ubicación"
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-3">Productos Involucrados</label>
                  {products.length > 0 ? (
                    <div className="bg-slate-900/30 border border-slate-700/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {products.map((product) => (
                          <label
                            key={product.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                              selectedProducts.includes(product.id)
                                ? 'bg-amber-600/10 border-amber-600 shadow-sm shadow-amber-500/20'
                                : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => toggleProduct(product.id)}
                              className="w-5 h-5 rounded border-slate-600 text-amber-600 focus:ring-2 focus:ring-amber-500/50 focus:ring-offset-0 bg-slate-700"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-medium truncate">{product.nombre}</div>
                              <div className="text-slate-400 text-xs truncate">{product.marca}</div>
                              {product.categoria && (
                                <div className="text-slate-500 text-xs mt-0.5">{product.categoria}</div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                      {selectedProducts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                          <p className="text-xs text-amber-400">
                            ✓ {selectedProducts.length} producto{selectedProducts.length !== 1 ? 's' : ''} seleccionado{selectedProducts.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-900/30 border border-slate-700/50 rounded-lg p-6 text-center">
                      <p className="text-slate-400 text-sm">
                        No tienes productos asignados. Contacta al administrador para asignar productos a tu cuenta.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Presupuesto Estimado ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={presupuestoEstimado}
                      onChange={(e) => setPresupuestoEstimado(Number(e.target.value))}
                      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Impacto Esperado (personas)</label>
                    <input
                      type="number"
                      min="0"
                      value={impactoEsperado}
                      onChange={(e) => setImpactoEsperado(Number(e.target.value))}
                      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {category === 'material_pop' && (
              <div className="border-t border-slate-700/50 pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-400" />
                    Materiales Solicitados
                  </h3>
                  <button
                    type="button"
                    onClick={addMaterialItem}
                    className="flex items-center gap-2 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar Material
                  </button>
                </div>

                {/* Lista de Materiales */}
                <div className="space-y-3">
                  {materialItems.map((item, index) => (
                    <div key={index} className="bg-slate-900/30 border border-slate-700/50 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm text-slate-400">Material #{index + 1}</span>
                        {materialItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMaterialItem(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Tipo de Material *</label>
                          <select
                            value={item.tipo}
                            onChange={(e) => updateMaterialItem(index, 'tipo', e.target.value)}
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                          >
                            <option value="">Selecciona...</option>
                            <option value="Display">Display de Piso</option>
                            <option value="Banner">Banner</option>
                            <option value="Cartel">Cartel/Póster</option>
                            <option value="Refrigerador">Refrigerador Branded</option>
                            <option value="Cenefa">Cenefa</option>
                            <option value="Wobbler">Wobbler</option>
                            <option value="Menu">Menú de Mesa</option>
                            <option value="Otro">Otro</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Cantidad *</label>
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => updateMaterialItem(index, 'cantidad', Number(e.target.value))}
                            required
                            className="w-full bg-slate-900/50 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Marca de Producto *</label>
                    <input
                      type="text"
                      value={marcaProducto}
                      onChange={(e) => setMarcaProducto(e.target.value)}
                      placeholder="Ej: Corona, Modelo, etc."
                      required
                      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Dimensiones</label>
                    <input
                      type="text"
                      value={dimensiones}
                      onChange={(e) => setDimensiones(e.target.value)}
                      placeholder="Ej: 180cm x 60cm x 40cm"
                      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-2">Especificaciones Adicionales</label>
                  <textarea
                    value={materialEspecificaciones}
                    onChange={(e) => setMaterialEspecificaciones(e.target.value)}
                    rows={3}
                    placeholder="Detalles adicionales: colores, acabados, materiales específicos, etc."
                    className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Fecha de Entrega Requerida</label>
                    <input
                      type="date"
                      value={fechaEntregaRequerida}
                      onChange={(e) => setFechaEntregaRequerida(e.target.value)}
                      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Dirección de Entrega</label>
                    <input
                      type="text"
                      value={direccionEntrega}
                      onChange={(e) => setDireccionEntrega(e.target.value)}
                      placeholder="Dirección completa"
                      className="w-full bg-slate-900/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-amber-900/20 border border-amber-600/30 rounded-lg p-4">
              <p className="text-sm text-amber-400">
                💡 Tu solicitud será recibida por el equipo de Brand Monitor y te contactaremos lo antes posible.
                {priority === 'urgent' && ' Esta solicitud será marcada como urgente y recibirá atención prioritaria.'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex-shrink-0 border-t border-slate-700/50 p-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-slate-700/50 hover:bg-slate-700 disabled:bg-slate-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 disabled:from-slate-700 disabled:to-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-amber-500/20 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Enviar Solicitud</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}