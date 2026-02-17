import { useState, useEffect } from 'react';
import { Search, Loader2, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../utils/supabase/client';
import { useLanguage } from '../utils/LanguageContext';
import { toast } from 'sonner@2.0.3';

interface TicketManagementProps {
  session: any;
  onUpdate: () => void;
  initialTicketId?: string | null;
}

export function TicketManagement({ session, onUpdate, initialTicketId }: TicketManagementProps) {
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
      const { data, error } = await supabase
        .from('btl_reportes')
        .select(`
          *,
          btl_usuarios!btl_reportes_creado_por_fkey (
            id,
            nombre,
            email,
            empresa
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

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

  const getStatusLabel = (s: string) => {
    switch(s) {
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
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-white font-semibold">{t('tickets.title')}</h2>
        <p className="text-slate-400 text-sm">{t('common.total')}: {tickets.length} {t('tickets.ticket').toLowerCase()}s</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800/50 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
            className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl hover:border-slate-600/50 transition-all cursor-pointer"
            onClick={() => setSelectedTicket(ticket)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ticket.type === 'ticket'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  }`}>
                    {ticket.type === 'ticket' ? '🎫 ' + t('tickets.ticket') : '📋 ' + t('tickets.request')}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ['high', 'alta', 'critica', 'urgent'].includes(ticket.priority)
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : ['medium', 'media'].includes(ticket.priority)
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {['high', 'alta'].includes(ticket.priority) ? '🟠 ' : 
                     ['critica', 'urgent'].includes(ticket.priority) ? '🔴 ' :
                     ['medium', 'media'].includes(ticket.priority) ? '🟡 ' : '🟢 '}
                    {getPriorityLabel(ticket.priority)}
                  </span>
                </div>
                <h3 className="text-lg text-white font-semibold mb-1">{ticket.subject}</h3>
                <p className="text-sm text-slate-400 line-clamp-2">{ticket.description}</p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-700/50">
              <div>
                <div className="text-xs text-slate-500">{t('common.user')}</div>
                <div className="text-sm text-slate-300">{ticket.user_name}</div>
              </div>
              {ticket.company && (
                <div>
                  <div className="text-xs text-slate-500">{t('common.company')}</div>
                  <div className="text-sm text-slate-300">{ticket.company}</div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">
                {new Date(ticket.created_at).toLocaleDateString()}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                ticket.status === 'abierto'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : ticket.status === 'en_progreso'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : ticket.status === 'resuelto'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                {getStatusLabel(ticket.status)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-12 shadow-xl text-center">
          <p className="text-slate-400">{t('common.no_data')}</p>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl text-white font-semibold mb-2">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedTicket.type === 'ticket'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    }`}>
                      {selectedTicket.type === 'ticket' ? t('tickets.ticket') : t('tickets.request')}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      ['high', 'alta', 'critica', 'urgent'].includes(selectedTicket.priority)
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : ['medium', 'media'].includes(selectedTicket.priority)
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-green-500/20 text-green-400 border border-green-500/30'
                    }`}>
                      {t('tickets.priority')}: {getPriorityLabel(selectedTicket.priority)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-slate-400 mb-2">{t('tickets.description')}</h4>
                <p className="text-slate-300 whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-slate-400 mb-2">{t('common.user')}</h4>
                  <p className="text-white">{selectedTicket.user_name}</p>
                  <p className="text-sm text-slate-400">{selectedTicket.user_email}</p>
                </div>
                {selectedTicket.company && (
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-slate-400 mb-2">{t('common.company')}</h4>
                    <p className="text-white">{selectedTicket.company}</p>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-slate-400 mb-2">{t('tickets.created_at')}</h4>
                  <p className="text-slate-300">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
                {selectedTicket.updated_at && (
                  <div>
                    <h4 className="text-sm uppercase tracking-wider text-slate-400 mb-2">{t('tickets.updated_at')}</h4>
                    <p className="text-slate-300">{new Date(selectedTicket.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>

              {/* Status Update */}
              <div>
                <h4 className="text-sm uppercase tracking-wider text-slate-400 mb-3">{t('tickets.change_status')}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { status: 'abierto', label: t('tickets.status_open'), icon: Eye, color: 'red' },
                    { status: 'en_progreso', label: t('tickets.status_progress'), icon: Clock, color: 'amber' },
                    { status: 'resuelto', label: t('tickets.status_resolved'), icon: CheckCircle, color: 'green' },
                    { status: 'cerrado', label: t('tickets.status_closed'), icon: XCircle, color: 'slate' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = selectedTicket.status === item.status;

                    return (
                      <button
                        key={item.status}
                        onClick={() => handleUpdateStatus(selectedTicket.id, item.status)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                          isActive
                            ? `bg-${item.color}-500/20 border-${item.color}-500/50 text-${item.color}-400`
                            : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600'
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