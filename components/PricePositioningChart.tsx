import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useLanguage } from '../utils/LanguageContext';

interface PricePositioningChartProps {
  inspections: any[];
}

const COLORS = {
  premium: '#f59e0b',  // amber
  equal: '#3b82f6',    // blue
  lower: '#10b981',    // green
};

const LABELS: Record<string, Record<string, string>> = {
  es: { premium: 'Más Alto', equal: 'Precio Similar', lower: 'Más Bajo' },
  en: { premium: 'Higher', equal: 'Similar', lower: 'Lower' },
};

export function PricePositioningChart({ inspections }: PricePositioningChartProps) {
  const { language } = useLanguage();
  const labels = LABELS[language] || LABELS.es;

  // Aggregate priceComparison from detalles.competitors[]
  const counts: Record<string, number> = { premium: 0, equal: 0, lower: 0 };

  for (const insp of inspections) {
    if (insp.detalles?.competitors && Array.isArray(insp.detalles.competitors)) {
      for (const comp of insp.detalles.competitors) {
        const pc = comp.priceComparison;
        if (pc && counts[pc] !== undefined) {
          counts[pc]++;
        }
      }
    } else if (insp.detalles?.priceComparison) {
      const pc = insp.detalles.priceComparison;
      if (counts[pc] !== undefined) {
        counts[pc]++;
      }
    }
  }

  const total = counts.premium + counts.equal + counts.lower;

  if (total < 3) {
    return null; // Not enough data to show
  }

  const data = [
    { name: labels.premium, value: counts.premium, key: 'premium' },
    { name: labels.equal, value: counts.equal, key: 'equal' },
    { name: labels.lower, value: counts.lower, key: 'lower' },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl min-w-0 overflow-hidden">
      <h3 className="text-lg text-white font-semibold mb-1">
        {language === 'es' ? 'Posicionamiento de Precio vs Competencia' : 'Price Positioning vs Competition'}
      </h3>
      <p className="text-xs text-slate-400 mb-6">
        {language === 'es'
          ? 'Distribución del precio de nuestro producto respecto a competidores observados'
          : 'Our product price distribution relative to observed competitors'}
      </p>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell
                key={entry.key}
                fill={COLORS[entry.key as keyof typeof COLORS]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #475569',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number, name: string) => [
              `${value} ${language === 'es' ? 'registros' : 'records'} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={(value: string) => {
              const item = data.find((d) => d.name === value);
              const pct = item && total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <span className="text-slate-300 text-xs sm:text-sm">
                  {value} ({pct}%)
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-slate-700/50 text-sm text-slate-400">
        {language === 'es'
          ? `Basado en ${total} comparaciones de precio en ${inspections.length} inspecciones`
          : `Based on ${total} price comparisons across ${inspections.length} inspections`}
      </div>
    </div>
  );
}
