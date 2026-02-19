import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../utils/AuthContext';
import { KPICard } from './KPICard';
import { PerformanceChart } from './PerformanceChart';
import { OpportunityMap } from './OpportunityMap';
import { VenueTable } from './VenueTable';
import { CompetitionChart } from './CompetitionChart';
import { OpportunityBreakdown } from './OpportunityBreakdown';
import { ActivationTimeline } from './ActivationTimeline';
import { VenueDetail } from './VenueDetail';
import { FilterChip } from './FilterChip';
import { TrendingUp, TrendingDown, Minus, Target, Store, Users, DollarSign } from 'lucide-react';

interface ManagerDashboardProps {
  session: any;
  readOnly?: boolean;
  isDemo?: boolean;
}

interface Region {
  id: string;
  nombre: string;
}

// Mock data para modo demo
const DEMO_DATA = {
  kpis: {
    visitedVenues: 142,
    visitedVenuesTrend: 12.5,
    compliance: 87.3,
    complianceTrend: 5.2,
    activations: 28,
    activationsTrend: -3.4,
    roi: 234.5,
    roiTrend: 18.7,
  },
  inspections: [
    {
      id: '1',
      venue_name: 'La Terraza Premium',
      visit_date: '2026-01-14',
      compliance_score: 95,
      brand_presence: 'Alta',
      competitor_presence: 'Media',
      observations: 'Excelente ejecución, producto destacado',
    },
    {
      id: '2',
      venue_name: 'Bar Central',
      visit_date: '2026-01-13',
      compliance_score: 78,
      brand_presence: 'Media',
      competitor_presence: 'Alta',
      observations: 'Requiere refuerzo de material POP',
    },
    {
      id: '3',
      venue_name: 'Discoteca Eclipse',
      visit_date: '2026-01-13',
      compliance_score: 92,
      brand_presence: 'Alta',
      competitor_presence: 'Baja',
      observations: 'Buena visibilidad, personal capacitado',
    },
  ],
  activations: [
    { id: 'a1', venue: 'The Dead Rabbit', date: '2025-12-15', type: 'Completed', impact: '+28%', status: 'success' },
    { id: 'a2', venue: 'Dante NYC', date: '2026-01-08', type: 'Completed', impact: '+32%', status: 'success' },
    { id: 'a3', venue: 'Employees Only', date: '2026-01-22', type: 'In Progress', impact: 'TBD', status: 'active' },
  ]
};

export function ManagerDashboard({ readOnly = false, isDemo = false }: ManagerDashboardProps) {
  const [inspections, setInspections] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [activations, setActivations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('30d');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    if (isDemo) {
      // Usar datos de demo
      setKpis(DEMO_DATA.kpis);
      setInspections(DEMO_DATA.inspections);
      setActivations(DEMO_DATA.activations);
      setLoading(false);
    } else {
      loadDashboardData();
    }
  }, [dateFilter, regionFilter, isDemo]);

  const loadRegions = async () => {
    try {
      const { data } = await supabase
        .from('btl_regiones')
        .select('id, nombre')
        .order('nombre');

      if (data) {
        setRegions(data);
      }
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  // Admin View Logic
  const { dbRole } = useAuth();
  const [allVenues, setAllVenues] = useState<any[]>([]);

  useEffect(() => {
    if (dbRole === 'admin') {
      loadAllVenues();
    }
  }, [dbRole, regionFilter]); // Reload if region changes

  const loadAllVenues = async () => {
    try {
      let query = supabase
        .from('btl_puntos_venta')
        .select('*')
        .order('nombre');

      if (regionFilter !== 'all') {
        query = query.eq('region_id', regionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAllVenues(data || []);
    } catch (err) {
      console.error('Error loading all venues for admin:', err);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Cargar Inspecciones
      let inspectionsQuery = supabase
        .from('btl_inspecciones')
        .select('*, btl_puntos_venta!btl_inspecciones_punto_venta_id_fkey(id, nombre, region_id)')
        .order('fecha_inspeccion', { ascending: false })
        .limit(100);

      if (regionFilter !== 'all') {
        inspectionsQuery = inspectionsQuery.eq('btl_puntos_venta.region_id', regionFilter);
      }

      const date = new Date();
      if (dateFilter === '7d') date.setDate(date.getDate() - 7);
      else if (dateFilter === '30d') date.setDate(date.getDate() - 30);
      else if (dateFilter === '90d') date.setDate(date.getDate() - 90);

      if (dateFilter !== 'all') { // Asumiendo que podría haber un filtro 'all' aunque no está en el state inicial
        inspectionsQuery = inspectionsQuery.gte('fecha_inspeccion', date.toISOString());
      }

      const { data: inspectionsData, error: inspectionsError } = await inspectionsQuery;
      if (inspectionsError) throw inspectionsError;

      setInspections(inspectionsData || []);

      // 2. Cargar Tickets de Activación BTL (Futuros/Programados)
      let ticketsQuery = supabase
        .from('btl_reportes')
        .select('*, btl_puntos_venta!btl_reportes_punto_venta_id_fkey(id, nombre, region_id)')
        .eq('categoria', 'accion_btl')
        .neq('estado', 'cerrado') // Solo activos o pendientes
        .order('fecha_activacion_solicitada', { ascending: true });

      if (regionFilter !== 'all') {
        ticketsQuery = ticketsQuery.eq('btl_puntos_venta.region_id', regionFilter);
      }

      // Para tickets futuros, tal vez queramos ver más allá del filtro de fecha pasado, 
      // pero por coherencia podríamos aplicar algo similar o simplemente traer los próximos.
      // Aquí traeremos todos los futuros relevantes.

      const { data: ticketsData, error: ticketsError } = await ticketsQuery;
      if (ticketsError) console.error("Error loading tickets:", ticketsError); // No bloqueante

      // 3. Procesar Activaciones (Combinar Pasadas y Futuras)
      const pastActivations = (inspectionsData || [])
        .filter((i: any) => i.activacion_ejecutada)
        .map((i: any) => ({
          id: `insp-${i.id}`,
          venue: i.btl_puntos_venta?.nombre || 'Unknown Venue',
          date: i.fecha_inspeccion,
          type: 'Ejecutada',
          impact: 'N/A', // Se podría calcular si tuviéramos métricas específicas
          status: 'success',
          rawDate: new Date(i.fecha_inspeccion)
        }));

      const futureActivations = (ticketsData || [])
        .map((t: any) => ({
          id: `ticket-${t.id}`,
          venue: t.btl_puntos_venta?.nombre || 'Unknown Venue',
          date: t.fecha_activacion_solicitada || t.created_at,
          type: t.tipo_activacion || 'Activación BTL',
          impact: t.impacto_esperado ? `Est. ${t.impacto_esperado}` : 'TBD',
          status: t.estado === 'en_progreso' ? 'active' : 'scheduled',
          rawDate: new Date(t.fecha_activacion_solicitada || t.created_at)
        }));

      // Combinar y ordenar por fecha (más reciente a más futuro, o cronológico inverso)
      // Para el timeline, suele ser útil ver lo próximo primero, o lo más reciente ejecutado.
      // Vamos a ordenar cronológicamente descendente (lo más nuevo arriba)
      const allActivations = [...pastActivations, ...futureActivations].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

      setActivations(allActivations);

      // Calcular KPIs basados en datos reales con comparación de períodos
      const now = new Date();
      let startDate = new Date();
      if (dateFilter === '7d') startDate.setDate(now.getDate() - 7);
      else if (dateFilter === '30d') startDate.setDate(now.getDate() - 30);
      else if (dateFilter === '90d') startDate.setDate(now.getDate() - 90);
      else startDate = new Date(0); // All time

      const previousStartDate = new Date(startDate);
      if (dateFilter === '7d') previousStartDate.setDate(startDate.getDate() - 7);
      else if (dateFilter === '30d') previousStartDate.setDate(startDate.getDate() - 30);
      else if (dateFilter === '90d') previousStartDate.setDate(startDate.getDate() - 90);

      const currentInspections = (inspectionsData || []) as any[];

      const totalVenues = new Set(currentInspections.map((i: any) => i.punto_venta_id)).size;
      const avgCompliance = currentInspections.length > 0
        ? Math.round(currentInspections.reduce((acc: number, i: any) => acc + (i.compliance_score || 0), 0) / currentInspections.length)
        : 0;
      const totalActivations = currentInspections.filter((i: any) => i.activacion_ejecutada).length;

      setKpis({
        visitedVenues: totalVenues,
        visitedVenuesTrend: 0, // Trends require historical data query - setting to 0 for now to avoid fake data
        compliance: avgCompliance,
        complianceTrend: 0,
        activations: totalActivations,
        activationsTrend: 0,
        roi: 0, // ROI requires sales data we don't have
        roiTrend: 0,
        totalRegisteredVenues: allVenues.length // Add this KPI maybe?
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Leave state empty — don't fall back to demo data in real mode
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-400';
    if (trend < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  if (loading && !kpis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className={`max-w-[1600px] mx-auto py-6 space-y-6 ${readOnly ? '' : 'px-4 sm:px-8'}`}>

        {/* Filters Section */}
        <div className="flex flex-wrap gap-3">
          <FilterChip
            label="Últimos 7 días"
            active={dateFilter === '7d'}
            onClick={() => setDateFilter('7d')}
          />
          <FilterChip
            label="Últimos 30 días"
            active={dateFilter === '30d'}
            onClick={() => setDateFilter('30d')}
          />
          <FilterChip
            label="Últimos 90 días"
            active={dateFilter === '90d'}
            onClick={() => setDateFilter('90d')}
          />

          <div className="border-l border-slate-700 mx-2"></div>

          {/* Dynamic Region Filters */}
          <FilterChip
            label="Todas las regiones"
            active={regionFilter === 'all'}
            onClick={() => setRegionFilter('all')}
          />

          {regions.map((region) => (
            <FilterChip
              key={region.id}
              label={region.nombre}
              active={regionFilter === region.id}
              onClick={() => setRegionFilter(region.id)}
            />
          ))}

          {/* Fallback if no regions loaded and no filters active */}
          {regions.length === 0 && (
            <span className="text-xs text-slate-500 flex items-center px-2">
              Cargando regiones...
            </span>
          )}
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Puntos de Venta Visitados"
              value={kpis.visitedVenues.toString()}
              icon={<Store className="w-6 h-6" />}
              trend={{
                value: kpis.visitedVenuesTrend,
                label: `${Math.abs(kpis.visitedVenuesTrend)}% vs período anterior`,
                color: getTrendColor(kpis.visitedVenuesTrend),
                icon: getTrendIcon(kpis.visitedVenuesTrend),
              }}
              color="blue"
            />
            <KPICard
              title="Cumplimiento Promedio"
              value={`${kpis.compliance.toFixed(1)}%`}
              icon={<Target className="w-6 h-6" />}
              trend={{
                value: kpis.complianceTrend,
                label: `${Math.abs(kpis.complianceTrend)}% vs período anterior`,
                color: getTrendColor(kpis.complianceTrend),
                icon: getTrendIcon(kpis.complianceTrend),
              }}
              color="green"
            />
            <KPICard
              title="Activaciones Ejecutadas"
              value={kpis.activations.toString()}
              icon={<Users className="w-6 h-6" />}
              trend={{
                value: kpis.activationsTrend,
                label: kpis.activationsTrend !== 0 ? `${Math.abs(kpis.activationsTrend)}% vs período anterior` : 'Sin datos anteriores',
                color: getTrendColor(kpis.activationsTrend),
                icon: getTrendIcon(kpis.activationsTrend),
              }}
              color="purple"
            />
            {/* ROI Card - Only show in Demo Mode or if we have real ROI data (which we don't yet) */}
            {isDemo && (
              <KPICard
                title="ROI Activaciones"
                value={`${kpis.roi}%`}
                icon={<DollarSign className="w-6 h-6" />}
                trend={{
                  value: kpis.roiTrend,
                  label: `${Math.abs(kpis.roiTrend)}% vs período anterior`,
                  color: getTrendColor(kpis.roiTrend),
                  icon: getTrendIcon(kpis.roiTrend),
                }}
                color="amber"
              />
            )}
          </div>
        )}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart inspections={inspections} />
          <CompetitionChart inspections={inspections} isDemo={isDemo} />
        </div>

        {/* Map Section */}
        <OpportunityMap
          inspections={inspections}
          onVenueSelect={(venue) => {
            console.log('🗺️ Map selected venue:', venue);
            // Ensure ID is number to match VenueDetail expectation
            setSelectedVenue({
              ...venue,
              id: typeof venue.id === 'string' ? parseInt(venue.id, 10) : venue.id
            });
          }}
        />

        {/* Opportunity Breakdown */}
        <OpportunityBreakdown inspections={inspections} isDemo={isDemo} />

        {/* Venue Table */}
        <VenueTable
          inspections={inspections}
          readOnly={readOnly}
          onVenueClick={(venue) => setSelectedVenue(venue)}
        />

        {/* Activation Timeline */}
        <ActivationTimeline activations={activations} />

      </div>

      {/* Venue Detail Modal */}
      {selectedVenue && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
          <div className="h-full overflow-y-auto">
            <VenueDetail
              venueId={selectedVenue.id}
              onBack={() => {
                setSelectedVenue(null);
                // Refresh data when returning from detail
                loadDashboardData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}