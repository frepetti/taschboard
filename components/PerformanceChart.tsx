import { useState } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FilterChip } from './FilterChip';
import { useLanguage } from '../utils/LanguageContext';

interface PerformanceChartProps {
  inspections?: any[];
}

export function PerformanceChart({ inspections = [] }: PerformanceChartProps) {
  const { t } = useLanguage();
  const [metric, setMetric] = useState('execution');

  const data = [
    { month: t('charts.months.jan'), execution: 65, visibility: 72, rotation: 58, activations: 45 },
    { month: t('charts.months.feb'), execution: 68, visibility: 75, rotation: 62, activations: 48 },
    { month: t('charts.months.mar'), execution: 71, visibility: 78, rotation: 65, activations: 52 },
    { month: t('charts.months.apr'), execution: 75, visibility: 81, rotation: 68, activations: 55 },
    { month: t('charts.months.may'), execution: 78, visibility: 84, rotation: 72, activations: 58 },
    { month: t('charts.months.jun'), execution: 82, visibility: 87, rotation: 75, activations: 61 },
    { month: t('charts.months.jul'), execution: 87, visibility: 91, rotation: 79, activations: 64 },
  ];

  const metrics = [
    { id: 'execution', label: t('charts.execution_index') },
    { id: 'visibility', label: t('charts.visibility') },
    { id: 'rotation', label: t('charts.rotation') },
    { id: 'activations', label: t('charts.activations') },
  ];

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg text-white font-semibold">{t('charts.brand_execution')}</h3>
        <div className="flex gap-2 flex-wrap">
          {metrics.map((m) => (
            <FilterChip
              key={m.id}
              label={m.label}
              active={metric === m.id}
              onClick={() => setMetric(m.id)}
            />
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
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
            stroke="#f59e0b" 
            strokeWidth={3}
            fill="url(#colorMetric)" 
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 pt-4 border-t border-slate-700/50 grid grid-cols-3 gap-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">{t('charts.current')}</div>
          <div className="text-2xl text-white font-bold">87.2</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">{t('charts.vs_last_period')}</div>
          <div className="text-2xl text-green-400 font-bold">+12.3%</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">{t('charts.target')}</div>
          <div className="text-2xl text-amber-400 font-bold">90.0</div>
        </div>
      </div>
    </div>
  );
}