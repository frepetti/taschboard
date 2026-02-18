import { ChevronRight } from 'lucide-react';
import { useLanguage } from '../utils/LanguageContext';

interface VenueTableProps {
  onVenueClick?: (venue: any) => void;
  inspections?: any[];
  readOnly?: boolean;
}

export function VenueTable({ onVenueClick, inspections = [], readOnly = false }: VenueTableProps) {
  const { language } = useLanguage();

  // Derive venue rows from real inspection data
  const venueMap = new Map<string, any>();
  for (const insp of inspections) {
    const venue = insp.btl_puntos_venta;
    if (!venue) continue;
    const key = String(venue.id);
    if (!venueMap.has(key)) {
      venueMap.set(key, {
        id: venue.id,
        name: venue.nombre || '—',
        channel: venue.canal || '—',
        inspections: [],
      });
    }
    venueMap.get(key).inspections.push(insp);
  }

  const venues = Array.from(venueMap.values()).map((v) => {
    const count = v.inspections.length;
    const avgCompliance = count > 0
      ? Math.round(v.inspections.reduce((acc: number, i: any) => acc + (i.compliance_score || 0), 0) / count)
      : 0;
    const hasProduct = v.inspections.some((i: any) => i.tiene_producto);
    const hasMaterial = v.inspections.some((i: any) => i.tiene_material_pop);
    const materialStatus = hasMaterial ? 'Completo' : hasProduct ? 'Parcial' : 'Sin material';
    return { ...v, avgCompliance, materialStatus, count };
  });

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getMaterialColor = (status: string) => {
    if (status === 'Completo') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (status === 'Parcial') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  if (venues.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl p-8 text-center">
        <p className="text-slate-400 text-sm">
          {language === 'es' ? 'No hay inspecciones registradas para este período.' : 'No inspections recorded for this period.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl overflow-hidden">
      {/* Desktop Table Header */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-700/50 bg-slate-900/30">
        <div className="col-span-4 text-xs uppercase tracking-wider text-slate-400 font-semibold">
          {language === 'es' ? 'Punto de Venta' : 'Venue'}
        </div>
        <div className="col-span-2 text-xs uppercase tracking-wider text-slate-400 font-semibold">Canal</div>
        <div className="col-span-2 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center">
          {language === 'es' ? 'Cumplimiento' : 'Compliance'}
        </div>
        <div className="col-span-2 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center">Material POP</div>
        <div className="col-span-1 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center">Visitas</div>
        <div className="col-span-1" />
      </div>

      {/* Table Body */}
      <div className="divide-y divide-slate-700/30">
        {venues.map((venue) => (
          <div
            key={venue.id}
            onClick={() => onVenueClick && onVenueClick(venue)}
            className={`${!readOnly && 'hover:bg-slate-800/40 transition-colors cursor-pointer group'}`}
          >
            {/* Desktop Layout */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 items-center">
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 text-xs font-bold">
                  {venue.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-white font-medium">{venue.name}</span>
              </div>

              <div className="col-span-2 flex items-center">
                <span className="px-3 py-1 rounded-full text-xs bg-slate-700/30 text-slate-300 border border-slate-600/30">
                  {venue.channel}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-center">
                <span className={`text-lg font-bold ${getScoreColor(venue.avgCompliance)}`}>
                  {venue.avgCompliance > 0 ? `${venue.avgCompliance}%` : '—'}
                </span>
              </div>

              <div className="col-span-2 flex items-center justify-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getMaterialColor(venue.materialStatus)}`}>
                  {venue.materialStatus}
                </span>
              </div>

              <div className="col-span-1 flex items-center justify-center">
                <span className="text-white font-semibold">{venue.count}</span>
              </div>

              <div className="col-span-1 flex items-center justify-end">
                {!readOnly && <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />}
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 text-xs font-bold shrink-0">
                  {venue.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm mb-1 truncate">{venue.name}</div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`font-bold ${getScoreColor(venue.avgCompliance)}`}>
                      {venue.avgCompliance > 0 ? `${venue.avgCompliance}%` : '—'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getMaterialColor(venue.materialStatus)}`}>
                      {venue.materialStatus}
                    </span>
                    <span className="text-slate-400">{venue.count} visitas</span>
                  </div>
                </div>
                {!readOnly && <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}