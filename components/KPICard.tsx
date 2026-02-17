import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPICardProps {
  title?: string; // Nueva prop
  label?: string; // Mantener compatibilidad
  value: string;
  icon?: React.ReactNode; // Nueva prop
  trend?: {
    value: number;
    label: string;
    color: string;
    icon: React.ReactNode;
  } | string; // Soportar ambos formatos
  positive?: boolean; // Mantener compatibilidad
  sparkline?: number[]; // Hacer opcional
  color?: 'blue' | 'green' | 'purple' | 'amber'; // Nueva prop
}

export function KPICard({ title, label, value, icon, trend, positive, sparkline, color = 'amber' }: KPICardProps) {
  // Determinar si sparkline está disponible
  const hasSparkline = sparkline && sparkline.length > 0;
  const max = hasSparkline ? Math.max(...sparkline) : 0;
  const min = hasSparkline ? Math.min(...sparkline) : 0;
  const range = max - min;

  // Soportar ambos formatos de trend
  const trendObj = typeof trend === 'object' ? trend : null;
  const trendText = typeof trend === 'string' ? trend : trendObj?.label;
  const isPositive = trendObj ? trendObj.value > 0 : positive;
  const trendColor = trendObj?.color || (isPositive ? 'text-green-400' : 'text-red-400');

  // Color mapping para el ícono
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl hover:border-slate-600/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="text-sm text-slate-400">{title || label}</div>
        {icon && (
          <div className={`${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="text-3xl text-white font-bold mb-3">{value}</div>
      
      <div className="flex items-center justify-between">
        <div className={`flex items-center gap-1 text-sm font-medium ${trendColor}`}>
          {trendObj?.icon || (isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          ))}
          <span>{trendText}</span>
        </div>

        {/* Sparkline - solo mostrar si hay datos */}
        {hasSparkline && (
          <div className="flex items-end gap-0.5 h-8">
            {sparkline.map((value, i) => {
              const height = range > 0 ? ((value - min) / range) * 100 : 50;
              return (
                <div
                  key={i}
                  className="w-1 bg-gradient-to-t from-amber-600 to-amber-400 rounded-full opacity-60"
                  style={{ height: `${Math.max(height, 10)}%` }}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}