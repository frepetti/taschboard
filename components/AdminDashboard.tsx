import { useState, useEffect } from 'react';
import { Users, Ticket, BarChart3, RefreshCw, Loader2, MapPin, Package, UserCheck, GraduationCap, Map } from 'lucide-react';
import { UserManagement } from './UserManagement';
import { TicketManagement } from './TicketManagement';
import { AdminStats } from './AdminStats';
import { VenueManager } from './VenueManager';
import { ClientProductManagement } from './ClientProductManagement';
import { ProductManagement } from './ProductManagement';
import { PendingUsersManagement } from './PendingUsersManagement';
import { TrainingManagementAdmin } from './TrainingManagementAdmin';
import { RegionManager } from './RegionManager';
import { supabase } from '../utils/supabase/client';

interface AdminDashboardProps {
  session: any;
  onViewChange?: (view: 'admin' | 'inspector' | 'client') => void;
  initialTicketId?: string | null;
}

export function AdminDashboard({ session, initialTicketId }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'tickets' | 'venues' | 'regions' | 'products' | 'pending' | 'trainings'>(
    initialTicketId ? 'tickets' : 'stats'
  );
  const [productSubTab, setProductSubTab] = useState<'catalog' | 'assignment'>('catalog');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    loadStats();
    loadPendingCount();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Loading admin stats...');
      console.log('🔑 User ID:', session?.user?.id);

      // Load real stats from Supabase
      console.log('📊 Loading real stats from Supabase...');

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from('btl_usuarios')
        .select('id, rol') as { data: { id: string; rol: string }[] | null; error: any };

      if (usersError) {
        console.error('❌ Error loading users:', usersError);
      }

      // Load venues
      const { data: venuesData, error: venuesError } = await supabase
        .from('btl_puntos_venta')
        .select('id');

      if (venuesError) {
        console.error('❌ Error loading venues:', venuesError);
      }

      // Load inspections
      const { data: inspectionsData, error: inspectionsError } = await supabase
        .from('btl_inspecciones')
        .select('id');

      if (inspectionsError) {
        console.error('❌ Error loading inspections:', inspectionsError);
      }

      // Load tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('btl_reportes')
        .select('id, estado') as { data: { id: string; estado: string }[] | null; error: any };

      if (ticketsError) {
        console.error('❌ Error loading tickets:', ticketsError);
      }

      // Calculate stats
      const totalUsers = usersData?.length || 0;
      const totalVenues = venuesData?.length || 0;
      const totalInspections = inspectionsData?.length || 0;
      const totalTickets = ticketsData?.length || 0;

      // Users by role
      const usersByRole = {
        inspector: usersData?.filter(u => u.rol === 'inspector').length || 0,
        client: usersData?.filter(u => u.rol === 'client').length || 0,
        admin: usersData?.filter(u => u.rol === 'admin').length || 0,
      };

      // Tickets by status
      const ticketsByStatus = {
        open: ticketsData?.filter(t => t.estado === 'abierto').length || 0,
        'in-progress': ticketsData?.filter(t => t.estado === 'en_progreso').length || 0,
        resolved: ticketsData?.filter(t => t.estado === 'resuelto').length || 0,
      };

      const openTickets = ticketsByStatus.open;

      setStats({
        totalUsers,
        totalInspections,
        totalTickets,
        totalVenues,
        openTickets,
        usersByRole,
        ticketsByStatus
      });

      console.log('✅ Stats loaded:', {
        totalUsers,
        totalVenues,
        totalInspections,
        totalTickets,
        usersByRole,
        ticketsByStatus
      });

    } catch (error: any) {
      console.error('❌ Error loading stats:', error);

      // Show empty stats
      setStats({
        totalUsers: 0,
        totalInspections: 0,
        totalTickets: 0,
        totalVenues: 0,
        openTickets: 0,
        usersByRole: { inspector: 0, client: 0, admin: 0 },
        ticketsByStatus: { open: 0, 'in-progress': 0, resolved: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPendingCount = async () => {
    try {
      const { data, error } = await supabase
        .from('btl_usuarios')
        .select('id')
        .eq('estado_aprobacion', 'pending');

      if (error) {
        console.error('❌ Error loading pending users count:', error);
        setPendingCount(0);
      } else {
        setPendingCount(data?.length || 0);
      }
    } catch (error: any) {
      console.error('❌ Error loading pending users count:', error);
      setPendingCount(0);
    }
  };

  return (
    <main className="max-w-[1600px] mx-auto px-4 sm:px-8 py-8">
      {/* Tab Navigation */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 mb-8">
        <div className="flex-1 w-full overflow-x-auto pb-2 lg:pb-0 custom-scrollbar">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${activeTab === 'stats'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Estadísticas</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
            >
              <Users className="w-5 h-5" />
              <span>Usuarios</span>
              {stats && <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">{stats.totalUsers}</span>}
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${activeTab === 'tickets'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
            >
              <Ticket className="w-5 h-5" />
              <span>Tickets</span>
              {stats && <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">{stats.openTickets}</span>}
            </button>
            <button
              onClick={() => setActiveTab('venues')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${activeTab === 'venues'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
            >
              <MapPin className="w-5 h-5" />
              <span>Lugares</span>
              {stats && <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">{stats.totalVenues}</span>}
            </button>
            <button
              onClick={() => setActiveTab('regions')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${activeTab === 'regions'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
            >
              <Map className="w-5 h-5" />
              <span>Regiones</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${activeTab === 'products'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
            >
              <Package className="w-5 h-5" />
              <span>Productos</span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${activeTab === 'pending'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
            >
              <UserCheck className="w-5 h-5" />
              <span>Usuarios Pendientes</span>
              {pendingCount > 0 && <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-xs">{pendingCount}</span>}
            </button>
            <button
              onClick={() => setActiveTab('trainings')}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${activeTab === 'trainings'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                }`}
            >
              <GraduationCap className="w-5 h-5" />
              <span>Capacitaciones</span>
            </button>
          </div>
        </div>

        <button
          onClick={loadStats}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-auto lg:ml-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-8 text-center">
          <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">⚠️</span>
          </div>
          <h3 className="text-xl text-white font-bold mb-2">Error de Autenticación</h3>
          <p className="text-slate-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <>
          {activeTab === 'stats' && <AdminStats stats={stats} session={session} />}
          {activeTab === 'users' && <UserManagement session={session} onUpdate={loadStats} />}
          {activeTab === 'tickets' && <TicketManagement session={session} onUpdate={loadStats} initialTicketId={initialTicketId} />}
          {activeTab === 'venues' && <VenueManager session={session} />}
          {activeTab === 'regions' && <RegionManager session={session} />}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex p-1 bg-slate-800/50 rounded-lg w-fit border border-slate-700/50">
                <button
                  onClick={() => setProductSubTab('catalog')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${productSubTab === 'catalog'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                  Catálogo y Objetivos
                </button>
                <button
                  onClick={() => setProductSubTab('assignment')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${productSubTab === 'assignment'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                >
                  Asignación por Cliente
                </button>
              </div>

              {productSubTab === 'catalog' ? (
                <ProductManagement />
              ) : (
                <ClientProductManagement session={session} />
              )}
            </div>
          )}
          {activeTab === 'pending' && <PendingUsersManagement session={session} onUpdate={() => { loadStats(); loadPendingCount(); }} />}
          {activeTab === 'trainings' && <TrainingManagementAdmin session={session} />}
        </>
      )}
    </main>
  );
}