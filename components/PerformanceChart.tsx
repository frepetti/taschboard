import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FilterChip } from './FilterChip';
import { useLanguage } from '../utils/LanguageContext';
import { getDemoPerformanceData } from '../utils/demoData';

interface PerformanceChartProps {
  inspections?: any[];
  dateFilter?: string;
  regionFilter?: string;
  isDemo?: boolean;
}

export function PerformanceChart({
  inspections = [],
  dateFilter = '6M',
  regionFilter = 'all',
  isDemo = false
}: PerformanceChartProps) {
  const { t } = useLanguage();
  const [metric, setMetric] = useState('compliance');

  // Construir o rebanar la serie activa y el período anterior
  const { currentData, previousData } = useMemo(() => {
    // Si estamos en modo demo o no hay inspecciones reales, usar dataset histórico estandarizado
    if (isDemo || !inspections || inspections.length === 0) {
      const demoResult = getDemoPerformanceData(dateFilter, regionFilter);
      return {
        currentData: demoResult.currentData,
        previousData: demoResult.previousData
      };
    }

    // Modo real: filtrar inspecciones según región seleccionada
    let filteredInspections = inspections;
    if (regionFilter && regionFilter !== 'all') {
      filteredInspections = inspections.filter((insp: any) => {
        const rId = insp.btl_puntos_venta?.region_id || insp.region_id;
        return rId === regionFilter;
      });
    }

    // Agrupar inspecciones reales por mes calendario
    const monthMap = new Map<string, { month: string; compliance: number[]; hasProduct: number; hasMaterial: number; count: number }>();

    for (const insp of filteredInspections) {
      const date = new Date(insp.fecha_inspeccion);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }).toLowerCase();

      if (!monthMap.has(key)) {
        monthMap.set(key, { month: label, compliance: [], hasProduct: 0, hasMaterial: 0, count: 0 });
      }
      const entry = monthMap.get(key)!;
      entry.count++;
      if (insp.compliance_score != null) entry.compliance.push(insp.compliance_score);
      if (insp.tiene_producto) entry.hasProduct++;
      if (insp.tiene_material_pop) entry.hasMaterial++;
    }

    const aggregated = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({
        month: v.month,
        compliance: v.compliance.length > 0
          ? Math.round(v.compliance.reduce((a, b) => a + b, 0) / v.compliance.length)
          : 0,
        presencia: v.count > 0 ? Math.round((v.hasProduct / v.count) * 100) : 0,
        material: v.count > 0 ? Math.round((v.hasMaterial / v.count) * 100) : 0,
        visitas: v.count,
      }));

    let n = 6;
    if (dateFilter === '1M') n = 1;
    else if (dateFilter === '3M') n = 3;
    else if (dateFilter === '6M') n = 6;
    else if (dateFilter === '1Y') n = 12;
    else if (dateFilter === 'YTD') {
      const currentYear = new Date().getFullYear();
      const thisYearMonths = Array.from(monthMap.keys()).filter(k => k.startsWith(String(currentYear))).length;
      n = Math.max(1, thisYearMonths);
    }

    const total = aggregated.length;
    const curr = aggregated.slice(Math.max(0, total - n));
    const prev = aggregated.slice(Math.max(0, total - (2 * n)), Math.max(0, total - n));

    return {
      currentData: curr,
      previousData: prev
    };
  }, [inspections, isDemo, dateFilter, regionFilter]);

  const metrics = [
    { id: 'compliance', label: t('charts.execution_index') },
    { id: 'presencia', label: t('charts.visibility') },
    { id: 'material', label: 'Material POP' },
    { id: 'visitas', label: 'Visitas' },
  ];

  // Métricas del pie recalculadas dinámicamente
  const cutOffPoint = currentData.length > 0 ? currentData[currentData.length - 1] : null;
  const currentValue = cutOffPoint ? Number(cutOffPoint[metric as keyof typeof cutOffPoint] || 0) : 0;

  // Cálculo de variación contra el período anterior equivalente
  const calcPeriodMetric = (slice: any[], metricKey: string) => {
    if (!slice || slice.length === 0) return 0;
    if (metricKey === 'visitas') {
      return slice.reduce((acc, curr) => acc + (Number(curr[metricKey]) || 0), 0);
    }
    const sum = slice.reduce((acc, curr) => acc + (Number(curr[metricKey]) || 0), 0);
    return sum / slice.length;
  };

  const currPeriodVal = calcPeriodMetric(currentData, metric);
  const prevPeriodVal = calcPeriodMetric(previousData, metric);

  const change = useMemo(() => {
    if (previousData.length === 0) return '—';
    if (prevPeriodVal === 0 && currPeriodVal === 0) return '0.0';
    if (prevPeriodVal === 0) return '—'; // Protección contra división por cero
    const delta = ((currPeriodVal - prevPeriodVal) / prevPeriodVal) * 100;
    if (!Number.isFinite(delta)) return '—';
    return delta.toFixed(1);
  }, [currPeriodVal, prevPeriodVal, previousData.length]);

  if (currentData.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl h-full flex items-center justify-center">
        <p className="text-slate-400 text-sm text-center">Sin datos de inspecciones para graficar.</p>
      </div>
    );
  }

  const changeNum = change !== '—' ? Number(change) : 0;
  const changeColor = change === '—'
    ? 'text-slate-400'
    : changeNum > 0
      ? 'text-green-400'
      : changeNum < 0
        ? 'text-red-400'
        : 'text-slate-400';

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl h-full min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-lg text-white font-semibold">{t('charts.brand_execution')}</h3>

        {/* Desktop Chips (≥ lg) */}
        <div className="hidden lg:flex gap-2 flex-wrap">
          {metrics.map((m) => (
            <FilterChip
              key={m.id}
              label={m.label}
              active={metric === m.id}
              onClick={() => setMetric(m.id)}
            />
          ))}
        </div>

        {/* Mobile Select (< lg) */}
        <div className="flex lg:hidden w-full sm:w-auto">
          <select
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            className="w-full sm:w-48 px-3 py-2 bg-slate-800/80 border border-slate-700/50 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500/50 appearance-none pr-8 cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
            aria-label="Seleccionar métrica de rendimiento"
          >
            {metrics.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-800 text-white">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={currentData}>
          <defs>
            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#DA407C" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#DA407C" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="month"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8' }}
            axisLine={{ stroke: '#475569' }}
          />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8' }}
            axisLine={{ stroke: '#475569' }}
            domain={metric === 'visitas' ? ['auto', 'auto'] : [0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#fff'
            }}
            formatter={(val: any) => [
              metric === 'visitas' ? `${val} visitas` : `${val}%`,
              metrics.find(m => m.id === metric)?.label || metric
            ]}
          />
          <Area
            type="monotone"
            dataKey={metric}
            stroke="#DA407C"
            strokeWidth={3}
            fill="url(#colorMetric)"
            dot={{ r: 4, fill: '#DA407C', stroke: '#ffffff', strokeWidth: 1 }}
            activeDot={{ r: 6, fill: '#DA407C' }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-4 border-t border-slate-700/50 grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">{t('charts.current')}</div>
          <div className="text-2xl text-white font-bold">
            {currentValue}{metric !== 'visitas' ? '%' : ''}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">{t('charts.vs_last_period')}</div>
          <div className={`text-2xl font-bold ${changeColor}`}>
            {change !== '—' ? `${changeNum > 0 ? '+' : ''}${change}%` : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Meses</div>
          <div className="text-2xl text-amber-400 font-bold">{currentData.length}</div>
        </div>
      </div>
    </div>
  );
}