import { ArrowLeft, MapPin, Phone, Check, X, Calendar, DollarSign, Award } from 'lucide-react';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';
import { useLanguage } from '../utils/LanguageContext';

interface Venue {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
  tipo: string | null;
  contacto_telefono: string | null;
  global_score: number;
  channel: string;
  // Dynamic metrics from inspections
  brandPresence?: number;
  shareOfMenu?: number;
}

interface VenueDetailProps {
  venueId: string;
  onBack: () => void;
}

export function VenueDetail({ venueId, onBack }: VenueDetailProps) {
  const { t } = useLanguage();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<string[]>([]);
  const [perfectServeScore, setPerfectServeScore] = useState(0);
  const [perfectServeChecklist, setPerfectServeChecklist] = useState<{ item: string; status: boolean }[]>([]);
  const [showBTLModal, setShowBTLModal] = useState(false);

  // Fallback images if no photos are found
  const fallbackImages = [
    'https://images.unsplash.com/photo-1617524455280-327a0ffc561b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGludGVyaW9yfGVufDF8fHx8MTc2NzY4NTc0Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1739203852867-87038459791a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJ0ZW5kZXIlMjBwb3VyaW5nJTIwY29ja3RhaWx8ZW58MXx8fHwxNzY3NzMwODA4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  ];

  useEffect(() => {
    loadVenueData();
  }, [venueId]);

  const loadVenueData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Venue Details
      const { data: venueResult, error: venueError } = await supabase
        .from('btl_puntos_venta')
        .select('*')
        .eq('id', venueId)
        .single();

      if (venueError) throw venueError;

      const venueData = venueResult as any; // Cast to any to avoid missing property errors for global_score

      // 2. Fetch Latest Inspection for this Venue
      const { data: latestInspection, error: inspectionError } = await supabase
        .from('btl_inspecciones')
        .select('*, detalles, fotos_urls')
        .eq('punto_venta_id', venueId)
        .order('fecha_inspeccion', { ascending: false })
        .limit(1)
        .single();

      // Type assertion for the inspection data since automatic types might be missing 'detalles'
      const inspection = latestInspection as any;

      // Basic Venue Object
      const newVenue: Venue = {
        id: venueData.id,
        nombre: venueData.nombre,
        direccion: venueData.direccion,
        ciudad: venueData.ciudad,
        tipo: venueData.tipo,
        contacto_telefono: venueData.contacto_telefono,
        // Prioritize the score from the actual inspection to ensure it matches the history/map
        global_score: (inspection as any)?.compliance_score ?? venueData.global_score ?? 0,
        channel: venueData.segmento || 'Estándar', // Mapping 'segmento' as channel proxy
        brandPresence: inspectionError ? 0 : (inspection?.tiene_producto ? 100 : 0) // Simple proxy
      };

      setVenue(newVenue);

      // 3. Process Photos
      if (inspection?.fotos_urls && inspection.fotos_urls.length > 0) {
        setPhotos(inspection.fotos_urls);
      } else {
        setPhotos(fallbackImages);
      }

      // 4. Calculate Perfect Serve Score & Checklist
      // Derived from `detalles` in the latest inspection
      if (inspection?.detalles) {
        const d = inspection.detalles;

        // Construct the checklist based on available data proxies
        // Since we don't have specific "Glassware" booleans, we map other quality indicators
        const checklist = [
          { item: t('venue_detail.staff_knowledge'), status: d.staffKnowledge === 'expert' || d.staffKnowledge === 'good' || d.staffKnowledge >= 7 },
          { item: t('venue_detail.certified_bartenders'), status: d.certifiedBartenders === 'yes' || (d.certifiedBartenders > 0) },
          { item: t('venue_detail.pop_visible'), status: d.backBarSignage !== 'missing' },
          { item: t('venue_detail.adequate_stock'), status: d.stockLevel !== 'critical' && d.stockLevel !== 'out_of_stock' },
          { item: t('venue_detail.shelf_position'), status: d.shelfPosition === 'eye_level' || d.shelfPosition === 'top_shelf' || d.shelfPosition === 'top' }
        ];

        setPerfectServeChecklist(checklist);

        // --- Calculate Actual Perfect Serve Score (Strictly Ritual Questions) ---
        let psScore = 0;
        let psTotal = 0;

        if (d.perfectServeAnswers) {
          // Dynamic questions
          const answerKeys = Object.keys(d.perfectServeAnswers);
          if (answerKeys.length > 0) {
            psTotal = answerKeys.length;
            psScore = answerKeys.filter(k => d.perfectServeAnswers[k]).length;
          }
        } else {
          // Legacy fields fallback
          const psFields = [
            d.properGlassware || d.glassware, // Cristalería
            d.iceQuality || d.ice,           // Hielo
            d.correctGarnish || d.garnish,   // Garnish
            d.premiumTonic || d.tonic,       // Tónica
            d.serveRitual || d.ritual        // Ritual
          ];
          // Filter out undefined/nulls to avoid skewing score if data missing? 
          // Assuming 5 standard questions for legacy
          psTotal = 5;
          psScore = psFields.filter(Boolean).length;
        }

        const calculatedPsPerc = psTotal > 0 ? Math.round((psScore / psTotal) * 100) : 0;
        (newVenue as any).actualPerfectServe = calculatedPsPerc;
        (newVenue as any).observations = (inspection.observaciones || '').split('[RECOMENDACIONES]')[0].trim();


        // Calculate Score %
        const passedItems = checklist.filter(c => c.status).length;
        const totalItems = checklist.length;
        setPerfectServeScore(totalItems > 0 ? Math.round((passedItems / totalItems) * 100) : 0);
      } else {
        // No inspection data
        setPerfectServeScore(0);
        setPerfectServeChecklist([]);
      }

    } catch (error) {
      console.error('Error loading venue details:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!venue) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-3 sm:py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">{t('venue_detail.back_to_dashboard')}</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-4 sm:py-8">
        {/* Venue Header */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-8 shadow-xl mb-4 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-0">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-4xl text-white font-bold mb-3 sm:mb-4">{venue.nombre}</h1>

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base">
                {venue.ciudad && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                    <span className="truncate">{venue.direccion || venue.ciudad}</span>
                  </div>
                )}
                {venue.contacto_telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                    <span>{venue.contacto_telefono}</span>
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm bg-slate-700/50 text-slate-300 border border-slate-600/50">
                  {venue.tipo}
                </span>
                <span className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm border ${venue.channel === 'Estratégico' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                  venue.channel === 'Oportunidad' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                    'bg-slate-700/50 text-slate-300 border-slate-600/50'
                  }`}>
                  {venue.channel}
                </span>
              </div>
            </div>

            {/* Global Score */}
            <div className="flex items-center gap-4 lg:flex-col lg:text-right lg:items-end">
              <div className="flex-1 lg:flex-initial">
                <div className="text-xs sm:text-sm text-slate-400 mb-1 sm:mb-2">{t('venue_detail.global_score')}</div>
                <div className={`text-4xl sm:text-6xl font-bold ${venue.global_score >= 90 ? 'text-green-400' :
                  venue.global_score >= 70 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                  {venue.global_score}
                </div>
                <div className="text-xs sm:text-sm text-slate-400">{t('venue_detail.out_of_100')}</div>
              </div>
              <button
                className="shrink-0 lg:w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all shadow-lg shadow-amber-500/20"
                onClick={() => setShowBTLModal(true)}
              >
                {t('venue_detail.create_btl')}
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-4 sm:mb-8">
          {/* Left Column - Photos & Checklist */}
          <div className="space-y-4 sm:space-y-6">
            {/* Photo Gallery */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-base sm:text-lg text-white font-semibold mb-3 sm:mb-4">{t('venue_detail.gallery')}</h3>
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:gap-4">
                  {photos.slice(0, 4).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Foto ${i + 1}`}
                      className="w-full h-24 sm:h-40 object-cover rounded-lg border border-slate-700/50 hover:border-amber-500/50 transition-colors cursor-pointer"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 italic">{t('venue_detail.no_photos')}</div>
              )}
            </div>

            {/* Perfect Serve Checklist -> Global Score Breakdown */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-base sm:text-lg text-white font-semibold mb-3 sm:mb-4">Desglose de Puntaje Global</h3>
              <div className="space-y-2 sm:space-y-3">
                {perfectServeChecklist.length > 0 ? (
                  perfectServeChecklist.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 sm:p-3 bg-slate-800/30 rounded-lg border border-slate-700/30">
                      <span className="text-slate-300 text-xs sm:text-sm flex-1 mr-2">{item.item}</span>
                      {item.status ? (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50 shrink-0">
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50 shrink-0">
                          <X className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-400 italic">{t('venue_detail.no_inspection')}</div>
                )}
              </div>
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-400">Cumplimiento Global</span>
                  <span className={`text-xl sm:text-2xl font-bold ${perfectServeScore >= 80 ? 'text-green-400' :
                    perfectServeScore >= 50 ? 'text-amber-400' : 'text-red-400'
                    }`}>{perfectServeScore}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - KPIs (Simplified based on available data) */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-3 sm:p-6 shadow-xl">
              <h3 className="text-base sm:text-lg text-white font-semibold mb-3">{t('venue_detail.key_metrics')}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/30 p-3 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">{t('venue_detail.brand_presence')}</div>
                  <div className="text-xl font-bold text-white">{venue.brandPresence ? t('venue_detail.yes') : t('venue_detail.no')}</div>
                </div>

                {/* Real Perfect Serve Score (Questions Only) */}
                <div className="bg-slate-800/30 p-3 rounded-lg">
                  <div className="text-xs text-slate-400 mb-1">Perfect Serve</div>
                  <div className={`text-xl font-bold ${(venue as any).actualPerfectServe >= 80 ? 'text-green-400' : (venue as any).actualPerfectServe >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                    {(venue as any).actualPerfectServe !== undefined ? `${(venue as any).actualPerfectServe}%` : 'N/A'}
                  </div>
                </div>

                {/* Share of Menu - Only show if available */}
                {venue.shareOfMenu !== undefined && (
                  <div className="bg-slate-800/30 p-3 rounded-lg">
                    <div className="text-xs text-slate-400 mb-1">{t('venue_detail.share_of_menu')}</div>
                    <div className="text-xl font-bold text-slate-200">{venue.shareOfMenu}%</div>
                  </div>
                )}
              </div>
            </div>

            {/* Qualitative Notes - Real Observation Data */}
            <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 sm:p-6 shadow-xl">
              <h3 className="text-base sm:text-lg text-white font-semibold mb-3 sm:mb-4">{t('venue_detail.qualitative_notes')}</h3>
              <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
                <p className="text-sm text-slate-300 italic whitespace-pre-wrap">
                  {(venue as any).observations ? `"${(venue as any).observations}"` : t('venue_detail.qualitative_placeholder')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations - Static examples for MVP */}
        <div className="bg-gradient-to-br from-amber-950/30 via-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4 sm:p-8 shadow-2xl">
          <h2 className="text-xl sm:text-2xl text-white font-semibold mb-4 sm:mb-6">{t('venue_detail.recommended_actions')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-4 sm:p-6 bg-slate-800/30 rounded-lg border border-slate-700/30">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-3 sm:mb-4">
                <Award className="text-amber-400 w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm sm:text-base">{t('venue_detail.rec_training')}</h3>
              <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">{t('venue_detail.rec_training_desc')}</p>
            </div>
          </div>
        </div>
      </main>

      {/* BTL Action Modal - Translated */}
      {showBTLModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-600/20 to-amber-500/20 border-b border-amber-500/30 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl text-white font-bold">{t('venue_detail.create_btl')}</h2>
                <button
                  onClick={() => setShowBTLModal(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <p className="text-sm text-slate-300 mt-2">Planificar nueva activación para {venue.nombre}</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm text-slate-300 mb-2">{t('tickets.type')}</label>
                <select className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors">
                  <option>{t('venue_detail.rec_tasting')}</option>
                  <option>{t('venue_detail.rec_training')}</option>
                  <option>{t('venue_detail.rec_social')}</option>
                  <option>Activación de Marca</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-2">{t('tickets.subject')}</label>
                <input
                  type="text"
                  placeholder="Ej. Experiencia Premium Hendrick's"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {t('tickets.activation_date')}
                  </label>
                  <input
                    type="date"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    {t('tickets.budget')} (USD)
                  </label>
                  <input
                    type="number"
                    placeholder="2800"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowBTLModal(false)}
                  className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={() => {
                    setShowBTLModal(false);
                    toast.success('BTL Action saved!', {
                      description: 'Demo mode - action would be saved to database'
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white rounded-lg font-semibold transition-all shadow-lg shadow-amber-500/20"
                >
                  {t('common.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}