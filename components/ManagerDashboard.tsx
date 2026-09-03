import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../utils/AuthContext';
import { KPICard } from './KPICard';
import { PerformanceChart } from './PerformanceChart';
import { OpportunityMap } from './OpportunityMap';
import { VenueTable } from './VenueTable';
import { CompetitionChart } from './CompetitionChart';
import { PricePositioningChart } from './PricePositioningChart';
import { OpportunityBreakdown } from './OpportunityBreakdown';
import { ActivationTimeline } from './ActivationTimeline';
import { VenueDetail } from './VenueDetail';
import { DEMO_DATA } from '../utils/demoData';
import { FilterChip } from './FilterChip';
import { TrendingUp, TrendingDown, Minus, Target, Store, Users, DollarSign } from 'lucide-react';

interface ManagerDashboardProps {
  session: any;
  readOnly?: boolean;
  isDemo?: boolean;
  dateFilter?: string;
  setDateFilter?: (filter: string) => void;
  regionFilter?: string;
  setRegionFilter?: (filter: string) => void;
  productId?: string | null;
}

interface Region {
  id: string;
  nombre: string;
}

export function ManagerDashboard({
  readOnly = false,
  isDemo = false,
  dateFilter: propDateFilter,
  setDateFilter: propSetDateFilter,
  regionFilter: propRegionFilter,
  setRegionFilter: propSetRegionFilter,
  productId = null
}: ManagerDashboardProps) {
  const [inspections, setInspections] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [activations, setActivations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Internal state for uncontrolled mode
  const [internalDateFilter, setInternalDateFilter] = useState('6M');
  const [internalRegionFilter, setInternalRegionFilter] = useState('all');

  // Use props if available (Controlled), else use internal state (Uncontrolled)
  const dateFilter = propDateFilter !== undefined ? propDateFilter : internalDateFilter;
  const setDateFilter = propSetDateFilter || setInternalDateFilter;

  const regionFilter = propRegionFilter !== undefined ? propRegionFilter : internalRegionFilter;
  const setRegionFilter = propSetRegionFilter || setInternalRegionFilter;

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
  }, [dateFilter, regionFilter, isDemo, productId]);

  const loadRegions = async () => {
    // 🚨 DEMO MODE BYPASS — evita query a Supabase (RLS lo bloquea en demo)
    if (isDemo) {
      setRegions([
        { id: 'norte', nombre: 'Norte' },
        { id: 'sur', nombre: 'Sur' },
        { id: 'centro', nombre: 'Centro' },
      ]);
      return;
    }

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

      if (productId) {
        inspectionsQuery = inspectionsQuery.eq('producto_id', productId);
      }

      const date = new Date();
      if (dateFilter === '1M') date.setDate(date.getDate() - 30);
      else if (dateFilter === '3M') date.setDate(date.getDate() - 90);
      else if (dateFilter === '6M') date.setDate(date.getDate() - 180);
      else if (dateFilter === '1Y') date.setDate(date.getDate() - 365);
      else if (dateFilter === 'YTD') date.setMonth(0, 1); // Jan 1st of current year

      if (dateFilter !== 'all') { // Asumiendo que podr├¡a haber un filtro 'all' aunque no est├í en el state inicial
        inspectionsQuery = inspectionsQuery.gte('fecha_inspeccion', date.toISOString());
      }

      const { data: inspectionsData, error: inspectionsError } = await inspectionsQuery;
      if (inspectionsError) throw inspectionsError;

      setInspections(inspectionsData || []);

      // 2. Cargar Tickets de Activación BTL (Todos los estados)
      let ticketsQuery = supabase
        .from('btl_reportes')
        .select('*, btl_puntos_venta!btl_reportes_punto_venta_id_fkey(id, nombre, region_id)')
        .eq('categoria', 'accion_btl')
        .order('fecha_activacion_solicitada', { ascending: false });

      if (regionFilter !== 'all') {
        ticketsQuery = ticketsQuery.eq('btl_puntos_venta.region_id', regionFilter);
      }

      const { data: ticketsData, error: ticketsError } = await ticketsQuery;
      if (ticketsError) console.error("Error loading tickets:", ticketsError);

      // 3. Procesar Activaciones desde Tickets BTL (fuente única)
      // IMPORTANTE: currentInspections debe declararse ANTES del .map() para el cálculo de impacto
      const currentInspections = (inspectionsData || []) as any[];

      const getTicketStatus = (estado: string | null | undefined): 'success' | 'active' | 'scheduled' => {
        if (!estado) return 'scheduled';
        const s = estado.toLowerCase().trim();
        if (s === 'resuelto' || s === 'cerrado' || s === 'cerrada' || s === 'completado' || s === 'completada') return 'success';
        if (s === 'en_progreso' || s === 'en progreso' || s === 'en_curso') return 'active';
        return 'scheduled'; // 'abierto' u otros
      };

      const allActivations = (ticketsData || [])
        .map((t: any) => {
          const ticketStatus = getTicketStatus(t.estado);
          let impact = 'N/A';
          let numericImpact: number | null = null;

          if (ticketStatus === 'success') {
            const venueId = t.punto_venta_id;
            const actDate = new Date(t.fecha_activacion_solicitada || t.created_at);
            const venueInspections = currentInspections.filter((i: any) => i.punto_venta_id === venueId);
            const beforeInspections = venueInspections.filter((i: any) => new Date(i.fecha_inspeccion) <= actDate);
            const afterInspections = venueInspections.filter((i: any) => new Date(i.fecha_inspeccion) > actDate);
            if (beforeInspections.length > 0 && afterInspections.length > 0) {
              const avgBefore = beforeInspections.reduce((sum: number, i: any) => sum + (i.compliance_score || 0), 0) / beforeInspections.length;
              const avgAfter = afterInspections.reduce((sum: number, i: any) => sum + (i.compliance_score || 0), 0) / afterInspections.length;
              if (avgBefore > 0) {
                const uplift = ((avgAfter - avgBefore) / avgBefore) * 100;
                numericImpact = uplift;
                impact = `${uplift > 0 ? '+' : ''}${uplift.toFixed(1)}%`;
              }
            } else {
              impact = '-';
            }
          }

          return {
            id: `ticket-${t.id}`,
            venue: t.btl_puntos_venta?.nombre || 'Venue sin asignar',
            date: t.fecha_activacion_solicitada || t.created_at,
            type: t.tipo_activacion || 'Activación BTL',
            impact,
            status: ticketStatus,
            rawDate: new Date(t.fecha_activacion_solicitada || t.created_at),
            numericImpact,
            asunto: t.asunto || null,
            titulo: t.titulo || null,
            descripcion: t.descripcion || null,
            tipo_activacion: t.tipo_activacion || null,
            notas: null,
            ubicacion: t.btl_puntos_venta?.nombre || null,
            presupuesto: null,
            productos_involucrados: t.productos_involucrados || null,
            tipo_material: t.tipo_material || null,
            cantidad_solicitada: t.cantidad_solicitada || null,
            marca_producto: t.marca_producto || null,
            fecha_entrega_requerida: t.fecha_entrega_requerida || null,
            prioridad: t.prioridad || null,
          };
        })
        .sort((a: any, b: any) => b.rawDate.getTime() - a.rawDate.getTime());

      setActivations(allActivations);

      // Calcular KPIs basados en datos reales
      const now = new Date();
      let startDate = new Date();
      if (dateFilter === '1M') startDate.setDate(now.getDate() - 30);
      else if (dateFilter === '3M') startDate.setDate(now.getDate() - 90);
      else if (dateFilter === '6M') startDate.setDate(now.getDate() - 180);
      else if (dateFilter === '1Y') startDate.setDate(now.getDate() - 365);
      else if (dateFilter === 'YTD') startDate.setMonth(0, 1);
      else startDate = new Date(0);

      const previousStartDate = new Date(startDate);
      if (dateFilter === '1M') previousStartDate.setDate(startDate.getDate() - 30);
      else if (dateFilter === '3M') previousStartDate.setDate(startDate.getDate() - 90);
      else if (dateFilter === '6M') previousStartDate.setDate(startDate.getDate() - 180);
      else if (dateFilter === '1Y') previousStartDate.setDate(startDate.getDate() - 365);
      else if (dateFilter === 'YTD') previousStartDate.setFullYear(startDate.getFullYear() - 1);


      const totalVenues = new Set(currentInspections.map((i: any) => i.punto_venta_id)).size;
      const avgCompliance = currentInspections.length > 0
        ? Math.round(currentInspections.reduce((acc: number, i: any) => acc + (i.compliance_score || 0), 0) / currentInspections.length)
        : 0;
      // Contar activaciones completadas desde tickets BTL
      const totalActivations = (ticketsData || []).filter((t: any) => getTicketStatus(t.estado) === 'success').length;

      setKpis({
        visitedVenues: totalVenues,
        visitedVenuesTrend: 0,
        compliance: avgCompliance,
        complianceTrend: 0,
        activations: totalActivations,
        activationsTrend: 0,
        roi: 0,
        roiTrend: 0,
        totalRegisteredVenues: allVenues.length
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
        {/* ── Mobile Filters (< lg) ── */}
        <div className="flex lg:hidden gap-3">
          <div className="flex-1">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="1M">1 Mes</option>
              <option value="3M">3 Meses</option>
              <option value="6M">6 Meses</option>
              <option value="1Y">1 Año</option>
              <option value="YTD">YTD</option>
            </select>
          </div>
          <div className="flex-1">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
            >
              <option value="all">Todas las regiones</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>{region.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Desktop Filters (≥ lg) ── */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Time Filters */}
          <div className="flex gap-2 flex-shrink-0">
            <FilterChip
              label="1 Mes"
              active={dateFilter === '1M'}
              onClick={() => setDateFilter('1M')}
            />
            <FilterChip
              label="3 Meses"
              active={dateFilter === '3M'}
              onClick={() => setDateFilter('3M')}
            />
            <FilterChip
              label="6 Meses"
              active={dateFilter === '6M'}
              onClick={() => setDateFilter('6M')}
            />
            <FilterChip
              label="1 Año"
              active={dateFilter === '1Y'}
              onClick={() => setDateFilter('1Y')}
            />
            <FilterChip
              label="YTD"
              active={dateFilter === 'YTD'}
              onClick={() => setDateFilter('YTD')}
            />
          </div>

          <div className="border-l border-slate-700 h-8 mx-1 flex-shrink-0"></div>

          {/* Region Filters — single row with horizontal scroll */}
          <div className="flex gap-2 flex-nowrap overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pb-1 min-w-0">
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

            {regions.length === 0 && (
              <span className="text-xs text-slate-500 flex items-center px-2 whitespace-nowrap">
                Cargando regiones...
              </span>
            )}
          </div>
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
          <PerformanceChart
            inspections={inspections}
            dateFilter={dateFilter}
            regionFilter={regionFilter}
            isDemo={isDemo}
          />
          <CompetitionChart inspections={inspections} isDemo={isDemo} />
        </div>

        {/* Price Positioning Chart — only rendered when there's sufficient data */}
        <PricePositioningChart inspections={inspections} />

        {/* Map Section */}
        <OpportunityMap
          inspections={inspections}
          selectedProductId={productId}
          isDemo={isDemo}
          demoVenues={isDemo ? (DEMO_DATA as any).demoVenues : []}
          onVenueSelect={(venue) => {
            console.log('­ƒù║´©Å Map selected venue:', venue);
            setSelectedVenue(venue);
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
              selectedProductId={productId}
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
