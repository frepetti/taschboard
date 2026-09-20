import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { useLanguage } from '../utils/LanguageContext';
import { toast } from 'sonner';
import { LoadingSpinner } from './LoadingSpinner';

interface TicketManagementProps {
  session: any;
  onUpdate: () => void;
  initialTicketId?: string | null;
}

export function TicketManagement({ session: _session, onUpdate, initialTicketId }: TicketManagementProps) {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  useEffect(() => {
    loadTickets();
  }, []);

  // Effect to select ticket when loaded
  useEffect(() => {
    if (initialTicketId && tickets.length > 0) {
      const ticketToSelect = tickets.find(t => t.id === initialTicketId);
      if (ticketToSelect) {
        setSelectedTicket(ticketToSelect);
        // Clear the URL parameter so refreshing doesn't keep reopening it if navigated away?
        // Actually, keeping it is fine, but maybe we want to be able to close it.
        // For now, just open it.
      }
    }
  }, [initialTicketId, tickets]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const [ticketsResponse, productsResponse] = await Promise.all([
        supabase
          .from('btl_reportes')
          .select(`
            *,
            btl_usuarios!btl_reportes_creado_por_fkey (
              id,
              nombre,
              email,
              empresa
            ),
            btl_puntos_venta!btl_reportes_punto_venta_id_fkey (
              nombre
            )
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('btl_productos')
          .select('id, nombre')
      ]);

      if (ticketsResponse.error) throw ticketsResponse.error;
      const productsMap = new Map((productsResponse.data || []).map(p => [p.id, p.nombre]));

      const data = ticketsResponse.data;

      // Format data to match expected structure
      const formattedTickets = (data || []).map((ticket: any) => ({
        id: ticket.id,
        subject: ticket.asunto || ticket.titulo,
        description: ticket.descripcion,
        category: ticket.categoria || ticket.tipo,
        priority: ticket.prioridad,
        status: ticket.estado,
        type: ticket.tipo,
        user_id: ticket.creado_por,
        user_name: ticket.btl_usuarios?.nombre,
        user_email: ticket.btl_usuarios?.email,
        company: ticket.btl_usuarios?.empresa,
        venue_name: ticket.btl_puntos_venta?.nombre,
        productos_nombres: ticket.productos_involucrados && Array.isArray(ticket.productos_involucrados)
          ? ticket.productos_involucrados.map((id: string) => productsMap.get(id)).filter(Boolean)
          : [],
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        metadata: ticket.metadata
      }));

      setTickets(formattedTickets);
    } catch (error) {
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('btl_reportes')
        .update({ estado: newStatus })
        .eq('id', ticketId);

      if (error) throw error;

      await loadTickets();
      setSelectedTicket(null);
      onUpdate();
      toast.success(t('tickets.success_update'));
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error(t('common.error'));
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.company?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getPriorityLabel = (p: string) => {
    if (['high', 'alta'].includes(p)) return t('tickets.prio_high');
    if (['urgent', 'critica'].includes(p)) return t('tickets.prio_critical');
    if (['medium', 'media'].includes(p)) return t('tickets.prio_medium');
    return t('tickets.prio_low');
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'general': return 'Soporte General';
      case 'capacitacion': return 'Capacitación';
      case 'accion_btl': return 'Acción BTL';
      case 'material_pop': return 'Material POP';
      default: return 'Solicitud';
    }
  };

  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'general': return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'capacitacion': return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'accion_btl': return 'bg-theme-primary/10 text-theme-primary border border-theme-primary/30';
      case 'material_pop': return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default: return 'bg-theme-primary/10 text-theme-primary border border-theme-primary/30';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'general': return '🎫 ';
      case 'capacitacion': return '🎓 ';
      case 'accion_btl': return '🚀 ';
      case 'material_pop': return '📦 ';
      default: return '📋 ';
    }
  };

  const getStatusLabel = (s: string) => {
    switch (s) {
      case 'abierto': return t('tickets.status_open');
      case 'en_progreso': return t('tickets.status_progress');
      case 'resuelto': return t('tickets.status_resolved');
      case 'cerrado': return t('tickets.status_closed');
      default: return s;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-content-main font-semibold">{t('tickets.title')}</h2>
        <p className="text-content-muted text-sm">{t('common.total')}: {tickets.length} {t('tickets.ticket').toLowerCase()}s</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-surface-card-subtle border border-border-subtle text-content-main px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
        >
          <option value="all">{t('common.filter_all')}</option>
          <option value="abierto">{t('tickets.status_open')}</option>
          <option value="en_progreso">{t('tickets.status_progress')}</option>
          <option value="resuelto">{t('tickets.status_resolved')}</option>
          <option value="cerrado">{t('tickets.status_closed')}</option>
        </select>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-sm hover:border-theme-primary/50 transition-all cursor-pointer"
            onClick={() => setSelectedTicket(ticket)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryStyle(ticket.category)}`}>
                    {getCategoryIcon(ticket.category)}
                    {getCategoryLabel(ticket.category)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${['high', 'alta', 'critica', 'urgent'].includes(ticket.priority)
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                      : ['medium', 'media'].includes(ticket.priority)
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    }`}>
                    {['high', 'alta'].includes(ticket.priority) ? '🟠 ' :
                      ['critica', 'urgent'].includes(ticket.priority) ? '🔴 ' :
                        ['medium', 'media'].includes(ticket.priority) ? '🟡 ' : '🟢 '}
                    {getPriorityLabel(ticket.priority)}
                  </span>
                </div>
                <h3 className="text-lg text-content-main font-semibold mb-1">{ticket.subject}</h3>
                <p className="text-sm text-content-muted line-clamp-2">{ticket.description}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border-subtle">
              <div>
                <div className="text-xs text-content-muted">{t('common.user')}</div>
                <div className="text-sm text-content-main">{ticket.user_name}</div>
              </div>
              {ticket.company && (
                <div>
                  <div className="text-xs text-content-muted">{t('common.company')}</div>
                  <div className="text-sm text-content-main">{ticket.company}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-content-muted">
                {new Date(ticket.created_at).toLocaleDateString()}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${ticket.status === 'abierto'
                  ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                  : ticket.status === 'en_progreso'
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    : ticket.status === 'resuelto'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-surface-card-subtle text-content-muted border border-border-subtle'
                }`}>
                {getStatusLabel(ticket.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="bg-surface-card border border-border-subtle rounded-xl p-12 shadow-sm text-center">
          <p className="text-content-muted">{t('common.no_data')}</p>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface-card border border-border-subtle rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-surface-card border-b border-border-subtle p-6 z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl text-content-main font-semibold mb-2">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryStyle(selectedTicket.category)}`}>
                      {getCategoryIcon(selectedTicket.category)}
                      {getCategoryLabel(selectedTicket.category)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${['high', 'alta', 'critica', 'urgent'].includes(selectedTicket.priority)
                        ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                        : ['medium', 'media'].includes(selectedTicket.priority)
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      }`}>
                      {t('tickets.priority')}: {getPriorityLabel(selectedTicket.priority)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-content-muted hover:text-content-main transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-content-muted font-semibold mb-2">{t('tickets.description')}</h4>
                <p className="text-content-main whitespace-pre-wrap bg-surface-card-subtle p-4 rounded-lg border border-border-subtle">{selectedTicket.description}</p>
              </div>

              {/* Punto de Venta y Productos */}
              {(selectedTicket.venue_name || (selectedTicket.productos_nombres && selectedTicket.productos_nombres.length > 0)) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedTicket.venue_name && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-content-muted font-semibold mb-2">Punto de Venta</h4>
                      <p className="text-content-main font-medium">{selectedTicket.venue_name}</p>
                    </div>
                  )}
                  {selectedTicket.productos_nombres && selectedTicket.productos_nombres.length > 0 && (
                    <div className={!selectedTicket.venue_name ? "col-span-2" : ""}>
                      <h4 className="text-xs uppercase tracking-wider text-content-muted font-semibold mb-2">Productos Involucrados</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTicket.productos_nombres.map((prod: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-surface-card-subtle rounded-md text-content-main border border-border-subtle text-xs">{prod}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-content-muted font-semibold mb-2">{t('common.user')}</h4>
                  <p className="text-content-main font-medium">{selectedTicket.user_name}</p>
                  <p className="text-sm text-content-muted">{selectedTicket.user_email}</p>
                </div>
                {selectedTicket.company && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-content-muted font-semibold mb-2">{t('common.company')}</h4>
                    <p className="text-content-main font-medium">{selectedTicket.company}</p>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs uppercase tracking-wider text-content-muted font-semibold mb-2">{t('tickets.created_at')}</h4>
                  <p className="text-content-main">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
                {selectedTicket.updated_at && (
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-content-muted font-semibold mb-2">{t('tickets.updated_at')}</h4>
                    <p className="text-content-main">{new Date(selectedTicket.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-content-muted font-semibold mb-3">{t('tickets.change_status')}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { status: 'abierto', label: t('tickets.status_open'), icon: Eye, activeClass: 'bg-red-500/10 border-red-500/30 text-red-500' },
                    { status: 'en_progreso', label: t('tickets.status_progress'), icon: Clock, activeClass: 'bg-amber-500/10 border-amber-500/30 text-amber-500' },
                    { status: 'resuelto', label: t('tickets.status_resolved'), icon: CheckCircle, activeClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' },
                    { status: 'cerrado', label: t('tickets.status_closed'), icon: XCircle, activeClass: 'bg-surface-card-subtle border-border-subtle text-content-main ring-1 ring-border-subtle font-semibold' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = selectedTicket.status === item.status;

                    return (
                      <button
                        key={item.status}
                        onClick={() => handleUpdateStatus(selectedTicket.id, item.status)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${isActive
                            ? item.activeClass
                            : 'bg-surface-card-subtle border-border-subtle text-content-muted hover:text-content-main hover:bg-surface-card'
                          }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}