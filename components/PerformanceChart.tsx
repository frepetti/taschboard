import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FilterChip } from './FilterChip';
import { useLanguage } from '../utils/LanguageContext';

interface PerformanceChartProps {
  inspections?: any[];
}

export function PerformanceChart({ inspections = [] }: PerformanceChartProps) {
  const { t } = useLanguage();
  const [metric, setMetric] = useState('compliance');

  // Build monthly aggregated data from real inspections
  const data = useMemo(() => {
    const monthMap = new Map<string, { month: string; compliance: number[]; hasProduct: number; hasMaterial: number; count: number }>();

    for (const insp of inspections) {
      const date = new Date(insp.fecha_inspeccion);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = date.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' });

      if (!monthMap.has(key)) {
        monthMap.set(key, { month: label, compliance: [], hasProduct: 0, hasMaterial: 0, count: 0 });
      }
      const entry = monthMap.get(key)!;
      entry.count++;
      if (insp.compliance_score != null) entry.compliance.push(insp.compliance_score);
      if (insp.tiene_producto) entry.hasProduct++;
      if (insp.tiene_material_pop) entry.hasMaterial++;
    }

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7) // last 7 months
      .map(([, v]) => ({
        month: v.month,
        compliance: v.compliance.length > 0
          ? Math.round(v.compliance.reduce((a, b) => a + b, 0) / v.compliance.length)
          : 0,
        presencia: v.count > 0 ? Math.round((v.hasProduct / v.count) * 100) : 0,
        material: v.count > 0 ? Math.round((v.hasMaterial / v.count) * 100) : 0,
        visitas: v.count,
      }));
  }, [inspections]);

  const metrics = [
    { id: 'compliance', label: t('charts.execution_index') },
    { id: 'presencia', label: t('charts.visibility') },
    { id: 'material', label: 'Material POP' },
    { id: 'visitas', label: 'Visitas' },
  ];

  const currentValue = data.length > 0 ? Number(data[data.length - 1][metric as keyof typeof data[0]]) : 0;
  const prevValue = data.length > 1 ? Number(data[data.length - 2][metric as keyof typeof data[0]]) : 0;
  const change = prevValue > 0 ? (((currentValue) - (prevValue)) / (prevValue) * 100).toFixed(1) : '—';

  if (data.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl h-full flex items-center justify-center">
        <p className="text-slate-400 text-sm text-center">Sin datos de inspecciones para graficar.</p>
      </div>
    );
  }

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
        <AreaChart data={data}>
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
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Area
            type="monotone"
            dataKey={metric}
            stroke="#DA407C"
            strokeWidth={3}
            fill="url(#colorMetric)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-4 border-t border-slate-700/50 grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">{t('charts.current')}</div>
          <div className="text-2xl text-white font-bold">{currentValue}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">{t('charts.vs_last_period')}</div>
          <div className={`text-2xl font-bold ${change !== '—' && Number(change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change !== '—' ? `${Number(change) >= 0 ? '+' : ''}${change}%` : '—'}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Meses</div>
          <div className="text-2xl text-amber-400 font-bold">{data.length}</div>
        </div>
      </div>
    </div>
  );
}