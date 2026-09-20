import { useState, useEffect } from 'react';
import { Search, MapPin, Plus } from 'lucide-react';
import { getVenues, createVenue } from '../utils/api-direct';
import { useLanguage } from '../utils/LanguageContext';
import { VenueLocationPicker } from './VenueLocationPicker';
import { LoadingSpinner } from './LoadingSpinner';

interface VenueSelectionFormProps {
  onVenueSelect: (venue: any) => void;
}

export function VenueSelectionForm({ onVenueSelect }: VenueSelectionFormProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewVenueForm, setShowNewVenueForm] = useState(false);
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  const [newVenueChannel, setNewVenueChannel] = useState('Bar');
  const [newVenueLatitud, setNewVenueLatitud] = useState<number | null>(null);
  const [newVenueLongitud, setNewVenueLongitud] = useState<number | null>(null);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingVenue, setCreatingVenue] = useState(false);

  // Load venues from Supabase on component mount
  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    setLoading(true);
    try {
      console.log('🔄 [Venue Selection] Loading venues via Direct API...');
      const data = await getVenues();
      console.log('✅ [Venue Selection] Loaded', data.length, 'venues');
      
      // Transformar formato de Supabase a formato del componente
      const transformedVenues = data.map(v => ({
        id: v.id,
        name: v.nombre,
        address: v.direccion,
        channel: v.tipo,
        city: v.ciudad,
        zone: v.region,
      }));
      
      setVenues(transformedVenues);
    } catch (error: any) {
      console.error('❌ [Venue Selection] Error loading venues:', error);
      // Fall back to default venues on error
      console.log('⚠️ Using default venues as fallback');
      setVenues(getDefaultVenues());
    } finally {
      setLoading(false);
    }
  };

  // Default venues (fallback)
  const getDefaultVenues = () => [
    { id: 1, name: 'The Dead Rabbit', address: '30 Water St, New York', channel: 'Bar', city: 'New York' },
    { id: 2, name: 'Employees Only', address: '510 Hudson St, New York', channel: 'Bar', city: 'New York' },
    { id: 3, name: 'Attaboy', address: '134 Eldridge St, New York', channel: 'Bar', city: 'New York' },
    { id: 4, name: 'Dante NYC', address: '79-81 MacDougal St, New York', channel: 'Bar', city: 'New York' },
    { id: 5, name: 'Please Don\'t Tell', address: '113 St Marks Pl, New York', channel: 'Bar', city: 'New York' },
    { id: 6, name: 'Death & Co', address: '433 E 6th St, New York', channel: 'Bar', city: 'New York' },
    { id: 7, name: 'Eleven Madison Park', address: '11 Madison Ave, New York', channel: 'Restaurant', city: 'New York' },
    { id: 8, name: 'The Up & Up', address: '116 MacDougal St, New York', channel: 'Club', city: 'New York' },
  ];

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (venue.zone && venue.zone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddNewVenue = async () => {
    if (newVenueName && newVenueAddress) {
      setCreatingVenue(true);
      try {
        const newVenue = {
          nombre: newVenueName,
          direccion: newVenueAddress,
          tipo: newVenueChannel,
          ciudad: 'Sin especificar',
          latitud: newVenueLatitud ?? undefined,
          longitud: newVenueLongitud ?? undefined,
        };
        const createdVenue = await createVenue(newVenue);
        onVenueSelect({
          id: createdVenue.id,
          name: createdVenue.nombre,
          address: createdVenue.direccion,
          channel: createdVenue.tipo,
          city: createdVenue.ciudad,
          isNew: true
        });
      } catch (error: any) {
        console.error('❌ [Venue Selection] Error creating venue:', error);
      } finally {
        setCreatingVenue(false);
      }
    }
  };

  if (showNewVenueForm) {
    return (
      <div className="space-y-4">
        <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-xl">
          <h2 className="text-xl text-content-main font-semibold mb-6">{t('inspector.add_venue')}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-content-muted mb-2">{t('inspector.venue_name')} *</label>
              <input
                type="text"
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
                placeholder={t('inspector.enter_venue_name')}
                className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
              />
            </div>

            <div>
              <VenueLocationPicker
                address={newVenueAddress}
                latitud={newVenueLatitud}
                longitud={newVenueLongitud}
                showCoordinateInputs={false}
                collapsible={true}
                mapHeight={180}
                placeholder={t('inspector.enter_address')}
                onChange={(field, value) => {
                  if (field === 'direccion') setNewVenueAddress(value as string);
                  else if (field === 'latitud') setNewVenueLatitud(value as number | null);
                  else if (field === 'longitud') setNewVenueLongitud(value as number | null);
                }}
              />
            </div>

            <div>
              <label className="block text-sm text-content-muted mb-2">{t('inspector.channel_type')} *</label>
              <select
                value={newVenueChannel}
                onChange={(e) => setNewVenueChannel(e.target.value)}
                className="w-full bg-surface-card-subtle border border-border-subtle text-content-main px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50 cursor-pointer"
              >
                <option>Bar</option>
                <option>Club</option>
                <option>Restaurante</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowNewVenueForm(false)}
              className="flex-1 bg-surface-card-subtle hover:bg-surface-card border border-border-subtle text-content-main px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleAddNewVenue}
              disabled={!newVenueName || !newVenueAddress || creatingVenue}
              className="flex-1 bg-theme-primary hover:bg-theme-secondary disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              {creatingVenue ? t('inspector.creating') : t('inspector.continue_inspection')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border-subtle rounded-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl text-content-main font-semibold">{t('inspector.select_venue')}</h2>
          {!loading && venues.length > 0 && (
            <span className="bg-theme-primary/10 text-theme-primary border border-theme-primary/20 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-theme-primary rounded-full animate-pulse"></span>
              {venues.length} {t('inspector.venues_available')}
            </span>
          )}
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" text={t('common.loading')} />
          </div>
        )}

        {/* Content when not loading */}
        {!loading && (
          <>
            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-content-muted" />
              <input
                type="text"
                placeholder={t('inspector.search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-card-subtle border border-border-subtle text-content-main placeholder:text-content-muted pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-theme-primary/50"
              />
            </div>

            {/* Add New Venue Button */}
            <button
              onClick={() => setShowNewVenueForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-theme-primary/20 hover:bg-theme-primary/30 border border-theme-primary/50 text-content-main px-4 py-3 rounded-lg font-medium transition-colors mb-4"
            >
              <Plus className="w-5 h-5" />
              <span>{t('inspector.add_venue')}</span>
            </button>

            {/* Empty State */}
            {venues.length === 0 && !searchQuery && (
              <div className="text-center py-12 border-2 border-dashed border-border-subtle rounded-lg">
                <MapPin className="w-16 h-16 text-content-muted mx-auto mb-4" />
                <h3 className="text-lg text-content-main font-semibold mb-2">{t('common.no_data')}</h3>
                <p className="text-content-muted mb-4">{t('inspector.start_adding_venue')}</p>
                <button
                  onClick={() => setShowNewVenueForm(true)}
                  className="inline-flex items-center gap-2 bg-theme-primary hover:bg-theme-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  {t('inspector.add_venue')}
                </button>
              </div>
            )}

            {/* Venue List */}
            {venues.length > 0 && (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredVenues.map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => onVenueSelect(venue)}
                    className="w-full text-left p-4 bg-surface-card-subtle hover:bg-surface-card border border-border-subtle hover:border-theme-primary/40 rounded-lg transition-all group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-content-main font-semibold mb-1 group-hover:text-theme-primary transition-colors">
                          {venue.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-content-muted">
                          <MapPin className="w-3 h-3" />
                          <span>{venue.address}</span>
                        </div>
                        {venue.zone && (
                          <div className="text-xs text-content-muted mt-1">
                            {venue.city} • {venue.zone}
                          </div>
                        )}
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs bg-surface-card text-content-muted border border-border-subtle">
                        {venue.channel}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {filteredVenues.length === 0 && searchQuery && venues.length > 0 && (
              <div className="text-center py-8 text-content-muted">
                <p>{t('inspector.no_venues_found_query').replace('{query}', searchQuery)}</p>
                <button
                  onClick={() => setShowNewVenueForm(true)}
                  className="mt-4 text-theme-primary hover:brightness-110 font-medium"
                >
                  {t('inspector.add_as_new')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}