import { ChevronRight } from 'lucide-react';

interface Venue {
  id: number;
  name: string;
  image: string;
  channel: string;
  brandPresence: number;
  perfectServe: number;
  materialStatus: string;
  shareOfMenu: number;
  competitor: string;
}

interface VenueTableProps {
  onVenueClick?: (venue: Venue) => void;
  inspections?: any[];
  readOnly?: boolean;
}

export function VenueTable({ onVenueClick, inspections = [], readOnly = false }: VenueTableProps) {
  const venues: Venue[] = [
    {
      id: 1,
      name: 'The Dead Rabbit',
      image: 'https://images.unsplash.com/photo-1617524455280-327a0ffc561b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGludGVyaW9yfGVufDF8fHx8MTc2NzY4NTc0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      channel: 'Bar',
      brandPresence: 92,
      perfectServe: 88,
      materialStatus: 'Complete',
      shareOfMenu: 28,
      competitor: 'Tanqueray'
    },
    {
      id: 2,
      name: 'Employees Only',
      image: 'https://images.unsplash.com/photo-1739799120521-c5f44a9335a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVha2Vhc3klMjBiYXJ8ZW58MXx8fHwxNzY3NzMwNzAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      channel: 'Bar',
      brandPresence: 85,
      perfectServe: 91,
      materialStatus: 'Complete',
      shareOfMenu: 22,
      competitor: 'Bombay Sapphire'
    },
    {
      id: 3,
      name: 'The Up & Up',
      image: 'https://images.unsplash.com/photo-1702814160779-4a88cfb330c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsb3VuZ2V8ZW58MXx8fHwxNzY3NzMwNzAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      channel: 'Club',
      brandPresence: 78,
      perfectServe: 72,
      materialStatus: 'Partial',
      shareOfMenu: 18,
      competitor: 'Beefeater'
    },
    {
      id: 4,
      name: 'Eleven Madison Park',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3Njc2MTMyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      channel: 'Restaurant',
      brandPresence: 94,
      perfectServe: 96,
      materialStatus: 'Complete',
      shareOfMenu: 31,
      competitor: 'Roku Gin'
    },
    {
      id: 5,
      name: 'Attaboy',
      image: 'https://images.unsplash.com/photo-1617524455280-327a0ffc561b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGludGVyaW9yfGVufDF8fHx8MTc2NzY4NTc0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      channel: 'Bar',
      brandPresence: 81,
      perfectServe: 79,
      materialStatus: 'Partial',
      shareOfMenu: 25,
      competitor: 'Tanqueray'
    },
    {
      id: 6,
      name: 'Dante NYC',
      image: 'https://images.unsplash.com/photo-1674033746275-e898356e0d27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cHNjYWxlJTIwbmlnaHRjbHVifGVufDF8fHx8MTc2NzczMDcwMXww&ixlib=rb-4.1.0&q=80&w=1080',
      channel: 'Bar',
      brandPresence: 88,
      perfectServe: 84,
      materialStatus: 'Complete',
      shareOfMenu: 27,
      competitor: 'Monkey 47'
    },
    {
      id: 7,
      name: 'Please Don\'t Tell',
      image: 'https://images.unsplash.com/photo-1739799120521-c5f44a9335a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVha2Vhc3klMjBiYXJ8ZW58MXx8fHwxNzY3NzMwNzAyfDA&ixlib=rb-4.1.0&q=80&w=1080',
      channel: 'Bar',
      brandPresence: 76,
      perfectServe: 68,
      materialStatus: 'Missing',
      shareOfMenu: 15,
      competitor: 'Aviation Gin'
    },
    {
      id: 8,
      name: 'Death & Co',
      image: 'https://images.unsplash.com/photo-1617524455280-327a0ffc561b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGludGVyaW9yfGVufDF8fHx8MTc2NzY4NTc0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
      channel: 'Bar',
      brandPresence: 90,
      perfectServe: 87,
      materialStatus: 'Complete',
      shareOfMenu: 29,
      competitor: 'Tanqueray'
    },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-red-400';
  };

  const getMaterialColor = (status: string) => {
    if (status === 'Complete') return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (status === 'Partial') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-xl overflow-hidden">
      {/* Desktop Table Header - Hidden on mobile */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-700/50 bg-slate-900/30">
        <div className="col-span-3 text-xs uppercase tracking-wider text-slate-400 font-semibold">Venue</div>
        <div className="col-span-1 text-xs uppercase tracking-wider text-slate-400 font-semibold">Channel</div>
        <div className="col-span-1 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center">Brand Presence</div>
        <div className="col-span-1 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center">Perfect Serve</div>
        <div className="col-span-2 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center">Material Status</div>
        <div className="col-span-1 text-xs uppercase tracking-wider text-slate-400 font-semibold text-center">Share of Menu</div>
        <div className="col-span-2 text-xs uppercase tracking-wider text-slate-400 font-semibold">Main Competitor</div>
        <div className="col-span-1"></div>
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
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4">
              <div className="col-span-3 flex items-center gap-3">
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-700/50"
                />
                <span className="text-white font-medium">{venue.name}</span>
              </div>
              
              <div className="col-span-1 flex items-center">
                <span className="px-3 py-1 rounded-full text-xs bg-slate-700/30 text-slate-300 border border-slate-600/30">
                  {venue.channel}
                </span>
              </div>
              
              <div className="col-span-1 flex items-center justify-center">
                <span className={`text-lg font-bold ${getScoreColor(venue.brandPresence)}`}>
                  {venue.brandPresence}
                </span>
              </div>
              
              <div className="col-span-1 flex items-center justify-center">
                <span className={`text-lg font-bold ${getScoreColor(venue.perfectServe)}`}>
                  {venue.perfectServe}
                </span>
              </div>
              
              <div className="col-span-2 flex items-center justify-center">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getMaterialColor(venue.materialStatus)}`}>
                  {venue.materialStatus}
                </span>
              </div>
              
              <div className="col-span-1 flex items-center justify-center">
                <span className="text-white font-semibold">{venue.shareOfMenu}%</span>
              </div>
              
              <div className="col-span-2 flex items-center">
                <span className="text-slate-400 text-sm">{venue.competitor}</span>
              </div>
              
              <div className="col-span-1 flex items-center justify-end">
                {!readOnly && <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 transition-colors" />}
              </div>
            </div>

            {/* Mobile Layout - Compact Card */}
            <div className="lg:hidden px-4 py-3">
              <div className="flex items-center gap-3">
                {/* Venue Image & Name */}
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-700/50 shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  {/* Venue Name */}
                  <div className="text-white font-medium text-sm mb-1 truncate">
                    {venue.name}
                  </div>
                  
                  {/* Key Metrics in compact format */}
                  <div className="flex items-center gap-2 text-xs">
                    {/* Brand Presence */}
                    <span className={`font-bold ${getScoreColor(venue.brandPresence)}`}>
                      {venue.brandPresence}
                    </span>
                    <span className={`font-bold ${getScoreColor(venue.perfectServe)}`}>
                      {venue.perfectServe}
                    </span>
                    
                    {/* Material Status Badge */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${getMaterialColor(venue.materialStatus)}`}>
                      {venue.materialStatus}
                    </span>
                    
                    {/* Share of Menu */}
                    <span className="text-white font-semibold">
                      {venue.shareOfMenu}%
                    </span>
                    
                    {/* Competitor */}
                    <span className="text-slate-400 text-[10px] truncate">
                      {venue.competitor}
                    </span>
                  </div>
                </div>
                
                {/* Arrow */}
                {!readOnly && (
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}