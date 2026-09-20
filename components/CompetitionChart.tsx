import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '../utils/LanguageContext';
import { parseInspectionCompetition } from '../utils/competitionUtils';

interface CompetitionChartProps {
  inspections?: any[];
  isDemo?: boolean;
  dateFilter?: string;
}

export function CompetitionChart({ inspections = [], isDemo = false, dateFilter }: CompetitionChartProps) {
  const { language } = useLanguage();

  // Demo data — only shown in demo mode
  const demoData = [
    { brand: "Hendrick's", count: 23 },
    { brand: 'Tanqueray', count: 19 },
    { brand: 'Bombay Sapphire', count: 16 },
    { brand: 'Monkey 47', count: 12 },
    { brand: 'Aviation', count: 10 },
    { brand: 'Roku', count: 9 },
    { brand: 'Otros', count: 8 },
  ];

  if (isDemo) {
    return (
      <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-xl">
        <h3 className="text-lg text-content-main font-semibold mb-6">
          {language === 'es' ? 'Comparativa Share of Menu' : 'Share of Menu Comparison'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={demoData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle, #d5d9e2)" opacity={0.5} />
            <XAxis type="number" stroke="var(--text-muted, #64748b)" tick={{ fill: 'var(--text-muted, #64748b)' }} axisLine={{ stroke: 'var(--border-subtle, #d5d9e2)' }} />
            <YAxis type="category" dataKey="brand" stroke="var(--text-muted, #64748b)" tick={{ fill: 'var(--text-muted, #64748b)' }} axisLine={{ stroke: 'var(--border-subtle, #d5d9e2)' }} width={120} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-subtle, #d5d9e2)', borderRadius: '8px', color: 'var(--text-main, #0f172a)' }} />
            <Bar dataKey="count" fill="#DA407C" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 pt-4 border-t border-border-subtle text-sm text-content-muted">
          <span className="text-theme-primary font-semibold">Hendrick's</span> {language === 'es' ? 'lidera con 23.4% de participación en 247 puntos de venta' : 'leads with 23.4% share across 247 venues'}
        </div>
      </div>
    );
  }

  // Real mode: compute competitor frequency from inspection data
  const competitorMap = new Map<string, number>();
  const visibilityMap = { Alta: 0, Media: 0, Baja: 0 };

  for (const insp of inspections) {
    const compData = parseInspectionCompetition(insp);

    if (compData.competitors && compData.competitors.length > 0) {
      compData.competitors.forEach((c) => {
        // Conteo condicionado estrictamente a presencia física afirmativa
        if (c.name && c.name !== 'Ninguno' && c.name !== 'N/A' && c.present === true) {
          competitorMap.set(c.name, (competitorMap.get(c.name) || 0) + 1);

          if (c.visibility === 'high') visibilityMap.Alta++;
          else if (c.visibility === 'medium') visibilityMap.Media++;
          else if (c.visibility === 'low') visibilityMap.Baja++;
        }
      });
    } else if (compData.mainCompetitor && compData.mainCompetitor !== 'Ninguno' && compData.mainCompetitor !== 'N/A') {
      competitorMap.set(compData.mainCompetitor, (competitorMap.get(compData.mainCompetitor) || 0) + 1);
      if (compData.competitorVisibility === 'high') visibilityMap.Alta++;
      else if (compData.competitorVisibility === 'medium') visibilityMap.Media++;
      else if (compData.competitorVisibility === 'low') visibilityMap.Baja++;
    }
  }

  const hasNamedCompetitors = competitorMap.size > 0;
  const hasVisibilityData = Object.values(visibilityMap).some(v => v > 0);

  if (!hasNamedCompetitors && !hasVisibilityData) {
    return (
      <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-xl h-full flex flex-col justify-center items-center gap-3">
        <p className="text-content-muted text-sm text-center">
          {language === 'es'
            ? 'Sin datos de competencia registrados. Los inspectores deben completar la sección de competencia en las inspecciones.'
            : 'No competition data recorded yet. Inspectors must fill the competition section in inspections.'}
        </p>
      </div>
    );
  }

  let chartData: { label: string; count: number; color: string }[] = [];

  if (hasNamedCompetitors) {
    // Sort by count desc, take top 7
    chartData = Array.from(competitorMap.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 7)
      .map(([label, count], i) => ({
        label,
        count,
        color: ['#DA407C', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'][i % 7],
      }));
  } else {
    // Fall back to visibility level breakdown
    chartData = [
      { label: language === 'es' ? 'Alta presencia' : 'High presence', count: visibilityMap.Alta, color: '#ef4444' },
      { label: language === 'es' ? 'Presencia media' : 'Medium presence', count: visibilityMap.Media, color: '#DA407C' },
      { label: language === 'es' ? 'Baja presencia' : 'Low presence', count: visibilityMap.Baja, color: '#10b981' },
    ].filter(d => d.count > 0);
  }

  const title = hasNamedCompetitors
    ? (language === 'es' ? 'Competidores Principales' : 'Main Competitors')
    : (language === 'es' ? 'Presencia de Competencia' : 'Competitor Presence');

  const subtitle = hasNamedCompetitors
    ? (language === 'es' ? 'Frecuencia de aparición en inspecciones' : 'Frequency in inspections')
    : (language === 'es' ? 'Nivel de visibilidad de competidores' : 'Competitor visibility level');

  const getPeriodLabel = () => {
    if (language === 'es') {
      if (dateFilter === '1M') return '(último mes)';
      if (dateFilter === '3M') return '(últimos 3 meses)';
      if (dateFilter === '6M') return '(últimos 6 meses)';
      if (dateFilter === '1Y') return '(último año)';
      if (dateFilter === 'YTD') return '(año a la fecha)';
      if (dateFilter === 'all') return '(período completo)';
      return '';
    } else {
      if (dateFilter === '1M') return '(last month)';
      if (dateFilter === '3M') return '(last 3 months)';
      if (dateFilter === '6M') return '(last 6 months)';
      if (dateFilter === '1Y') return '(last year)';
      if (dateFilter === 'YTD') return '(year to date)';
      if (dateFilter === 'all') return '(full period)';
      return '';
    }
  };

  const periodLabel = getPeriodLabel();

  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-xl">
      <h3 className="text-lg text-content-main font-semibold mb-1">{title}</h3>
      <p className="text-xs text-content-muted mb-6">{subtitle}</p>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle, #d5d9e2)" opacity={0.5} />
          <XAxis
            type="number"
            stroke="var(--text-muted, #64748b)"
            tick={{ fill: 'var(--text-muted, #64748b)' }}
            axisLine={{ stroke: 'var(--border-subtle, #d5d9e2)' }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="label"
            stroke="var(--text-muted, #64748b)"
            tick={{ fill: 'var(--text-muted, #64748b)' }}
            axisLine={{ stroke: 'var(--border-subtle, #d5d9e2)' }}
            width={130}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'var(--bg-card, #ffffff)', border: '1px solid var(--border-subtle, #d5d9e2)', borderRadius: '8px', color: 'var(--text-main, #0f172a)' }}
            formatter={(value: any) => [value, language === 'es' ? 'Inspecciones' : 'Inspections']}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 pt-4 border-t border-border-subtle text-sm text-content-muted">
        {language === 'es'
          ? `Basado en ${inspections.length} inspecciones registradas ${periodLabel}`.trim()
          : `Based on ${inspections.length} recorded inspections ${periodLabel}`.trim()}
      </div>
    </div>
  );
}