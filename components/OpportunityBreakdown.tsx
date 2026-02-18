import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '../utils/LanguageContext';

interface OpportunityBreakdownProps {
  inspections?: any[];
  isDemo?: boolean;
}

export function OpportunityBreakdown({ inspections = [], isDemo = false }: OpportunityBreakdownProps) {
  const { language } = useLanguage();

  const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  if (isDemo) {
    const demoData = [
      { name: 'Rotation Potential', value: 32, color: COLORS[0] },
      { name: 'Profile Fit', value: 28, color: COLORS[1] },
      { name: 'Brand Presence', value: 25, color: COLORS[2] },
      { name: 'Previous Activations', value: 15, color: COLORS[3] },
    ];
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
        <div className="mb-4">
          <h3 className="text-lg text-white font-semibold mb-2">Opportunity Score</h3>
          <div className="text-5xl text-amber-400 font-bold">8.2<span className="text-2xl text-slate-400">/10</span></div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={demoData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
              {demoData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 mt-4">
          {demoData.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300">{item.name}</span>
              </div>
              <span className="text-white font-semibold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Real mode: compute from inspection data
  const total = inspections.length;

  if (total === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl flex items-center justify-center min-h-[200px]">
        <p className="text-slate-400 text-sm text-center">
          {language === 'es'
            ? 'Sin inspecciones para calcular oportunidades.'
            : 'No inspections to calculate opportunities.'}
        </p>
      </div>
    );
  }

  // Compute real opportunity metrics
  const withProduct = inspections.filter(i => i.tiene_producto).length;
  const withMaterial = inspections.filter(i => i.tiene_material_pop).length;
  const withActivation = inspections.filter(i => i.activacion_ejecutada).length;
  const withStock = inspections.filter(i =>
    i.stock_estimado != null && i.stock_estimado > 0
  ).length;

  // Opportunity score: weighted average of positive signals
  const productPct = Math.round((withProduct / total) * 100);
  const materialPct = Math.round((withMaterial / total) * 100);
  const activationPct = Math.round((withActivation / total) * 100);
  const stockPct = Math.round((withStock / total) * 100);

  const opportunityScore = ((productPct * 0.35) + (materialPct * 0.25) + (stockPct * 0.25) + (activationPct * 0.15)) / 10;

  const data = [
    {
      name: language === 'es' ? 'Presencia de Marca' : 'Brand Presence',
      value: productPct,
      color: COLORS[0],
      raw: withProduct,
    },
    {
      name: language === 'es' ? 'Material POP' : 'POS Material',
      value: materialPct,
      color: COLORS[1],
      raw: withMaterial,
    },
    {
      name: language === 'es' ? 'Stock Disponible' : 'Stock Available',
      value: stockPct,
      color: COLORS[2],
      raw: withStock,
    },
    {
      name: language === 'es' ? 'Activaciones' : 'Activations',
      value: activationPct,
      color: COLORS[3],
      raw: withActivation,
    },
  ].filter(d => d.value > 0 || d.raw >= 0); // always show all 4

  // If all zeros, show a neutral state
  const allZero = data.every(d => d.value === 0);

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg text-white font-semibold mb-2">
          {language === 'es' ? 'Análisis de Oportunidades' : 'Opportunity Analysis'}
        </h3>
        {!allZero && (
          <div className="text-5xl text-amber-400 font-bold">
            {opportunityScore.toFixed(1)}
            <span className="text-2xl text-slate-400">/10</span>
          </div>
        )}
        <p className="text-xs text-slate-500 mt-1">
          {language === 'es' ? `Basado en ${total} inspecciones` : `Based on ${total} inspections`}
        </p>
      </div>

      {allZero ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          {language === 'es'
            ? 'Los datos de oportunidad se calcularán cuando haya inspecciones con métricas registradas.'
            : 'Opportunity data will be calculated once inspections with metrics are recorded.'}
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px', color: '#fff' }}
                formatter={(value: any, name: any) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-2 mt-4">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-300">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">{item.raw}/{total}</span>
                  <span className="text-white font-semibold">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
