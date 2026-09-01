import { useState, useEffect, useRef, useCallback } from 'react';
import * as L from 'leaflet';
import { MapPin, Loader2, AlertCircle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { geocodeAddress } from '../utils/geocoding';

// ─── Leaflet CSS (inyectado una sola vez, igual que OpportunityMap) ───────────
function useLeafletCSS() {
  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);
}

// ─── Tipos ────────────────────────────────────────────────────────────────────
type GeocodingStatus = 'idle' | 'searching' | 'found' | 'error';

export interface VenueLocationPickerProps {
  /** Valor actual de la dirección */
  address: string;
  /** Latitud actual (puede ser undefined en un venue nuevo) */
  latitud?: number | null;
  /** Longitud actual (puede ser undefined en un venue nuevo) */
  longitud?: number | null;
  /** Callback para cuando cambia dirección, lat o lng */
  onChange: (field: 'direccion' | 'latitud' | 'longitud', value: string | number | null) => void;
  /** Si true, muestra los inputs manuales de lat/lng (Admin). Default: false */
  showCoordinateInputs?: boolean;
  /** Si true, el mapa empieza colapsado y hay botón para abrirlo (Inspector). Default: false */
  collapsible?: boolean;
  /** Altura visual del mapa en px. Default: 260 */
  mapHeight?: number;
  /** Placeholder para el input de dirección */
  placeholder?: string;
}

// Coordenadas por defecto (Buenos Aires)
const DEFAULT_CENTER: [number, number] = [-34.6037, -58.3816];
const DEFAULT_ZOOM = 13;

export function VenueLocationPicker({
  address,
  latitud,
  longitud,
  onChange,
  showCoordinateInputs = false,
  collapsible = false,
  mapHeight = 260,
  placeholder = 'Ej. Av. Corrientes 1234, Buenos Aires',
}: VenueLocationPickerProps) {
  useLeafletCSS();

  const [geocodingStatus, setGeocodingStatus] = useState<GeocodingStatus>('idle');
  const [isMapOpen, setIsMapOpen] = useState(!collapsible);

  // Internal lat/lng state for controlled inputs
  const [latInput, setLatInput] = useState(latitud != null ? String(latitud) : '');
  const [lngInput, setLngInput] = useState(longitud != null ? String(longitud) : '');

  // Leaflet refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapInitializedRef = useRef(false);

  // ─── Sincronizar props → estado interno ──────────────────────────────────
  useEffect(() => {
    setLatInput(latitud != null ? String(latitud) : '');
    setLngInput(longitud != null ? String(longitud) : '');
  }, [latitud, longitud]);

  // ─── Inicializar / destruir mapa ─────────────────────────────────────────
  useEffect(() => {
    if (!isMapOpen) return;
    if (mapInitializedRef.current) return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;
      if (mapInitializedRef.current) return;

      try {
        const initialCenter: [number, number] =
          latitud && longitud ? [latitud, longitud] : DEFAULT_CENTER;
        const initialZoom = latitud && longitud ? 15 : DEFAULT_ZOOM;

        const map = L.map(mapContainerRef.current, {
          zoomControl: true,
          attributionControl: false,
          scrollWheelZoom: true,
        }).setView(initialCenter, initialZoom);

        const cartoKey = (import.meta as any).env?.VITE_CARTO_API_KEY;
        const tileUrl = cartoKey
          ? `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${cartoKey}`
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

        const tileLayer = L.tileLayer(tileUrl, {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 20,
        }).addTo(map);

        tileLayer
          .getContainer()
          ?.style.setProperty('filter', 'brightness(0.82) sepia(0.12) contrast(1.15)');

        L.control
          .attribution({
            position: 'bottomright',
            prefix: false,
          })
          .addAttribution(
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
          )
          .addTo(map);

        // Pin arrastrable
        const icon = L.divIcon({
          className: 'venue-picker-icon',
          html: `
            <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
              <div style="position:absolute;width:40px;height:40px;border-radius:50%;background:rgba(245,158,11,0.2);animation:pulse 2s infinite;top:-4px;left:-4px;"></div>
              <div style="width:20px;height:20px;border-radius:50%;background:#f59e0b;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);"></div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker(initialCenter, {
          draggable: true,
          icon,
        }).addTo(map);

        // Al arrastrar el pin → actualizar lat/lng
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          const newLat = parseFloat(pos.lat.toFixed(7));
          const newLng = parseFloat(pos.lng.toFixed(7));
          setLatInput(String(newLat));
          setLngInput(String(newLng));
          onChange('latitud', newLat);
          onChange('longitud', newLng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        mapInitializedRef.current = true;

        // Si ya hay coords, mostrar el pin en la posición correcta
        if (latitud && longitud) {
          marker.setLatLng([latitud, longitud]);
          map.setView([latitud, longitud], 15);
        }
      } catch (err) {
        console.error('❌ [VenueLocationPicker] Error initializing map:', err);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [isMapOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup en unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        mapInitializedRef.current = false;
      }
    };
  }, []);

  // ─── Mover el pin a nuevas coordenadas (llamado después de geocodificar) ──
  const flyToCoords = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    const latlng: [number, number] = [lat, lng];
    markerRef.current.setLatLng(latlng);
    mapInstanceRef.current.flyTo(latlng, 16, { animate: true, duration: 0.8 });
  }, []);

  // ─── Geocodificación con debounce ─────────────────────────────────────────
  const handleAddressChange = (value: string) => {
    onChange('direccion', value);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!value || value.trim().length < 7) {
      setGeocodingStatus('idle');
      return;
    }

    setGeocodingStatus('searching');

    debounceTimerRef.current = setTimeout(async () => {
      const result = await geocodeAddress(value);
      if (result) {
        setGeocodingStatus('found');
        setLatInput(String(result.lat));
        setLngInput(String(result.lng));
        onChange('latitud', result.lat);
        onChange('longitud', result.lng);

        // Abrir el mapa y volar a la ubicación si estaba colapsado
        if (collapsible && !isMapOpen) {
          setIsMapOpen(true);
          // El mapa se inicializará en el useEffect de isMapOpen
          // Dar tiempo para que el mapa se inicialice y luego volar
          setTimeout(() => flyToCoords(result.lat, result.lng), 400);
        } else {
          flyToCoords(result.lat, result.lng);
        }
      } else {
        setGeocodingStatus('error');
      }
    }, 900);
  };

  // ─── Edición manual de lat/lng (solo Admin) ───────────────────────────────
  const handleLatChange = (value: string) => {
    setLatInput(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onChange('latitud', num);
      const lng = parseFloat(lngInput);
      if (!isNaN(lng)) flyToCoords(num, lng);
    } else if (value === '' || value === '-') {
      onChange('latitud', null);
    }
  };

  const handleLngChange = (value: string) => {
    setLngInput(value);
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onChange('longitud', num);
      const lat = parseFloat(latInput);
      if (!isNaN(lat)) flyToCoords(lat, num);
    } else if (value === '' || value === '-') {
      onChange('longitud', null);
    }
  };

  // ─── Toggle mapa colapsable ───────────────────────────────────────────────
  const handleToggleMap = () => {
    setIsMapOpen((prev) => !prev);
  };

  // ─── Status indicator ─────────────────────────────────────────────────────
  const StatusIndicator = () => {
    if (geocodingStatus === 'searching') {
      return (
        <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-1.5">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Buscando ubicación...</span>
        </div>
      );
    }
    if (geocodingStatus === 'found') {
      return (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1.5">
          <CheckCircle2 className="w-3 h-3" />
          <span>Ubicación encontrada y pin actualizado</span>
        </div>
      );
    }
    if (geocodingStatus === 'error') {
      return (
        <div className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5">
          <AlertCircle className="w-3 h-3" />
          <span>No se pudo encontrar la ubicación. Podés mover el pin manualmente.</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {/* ── Dirección ── */}
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">
          Dirección Completa
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>
        <StatusIndicator />
      </div>

      {/* ── Inputs lat/lng (solo Admin) ── */}
      {showCoordinateInputs && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Latitud
            </label>
            <input
              type="text"
              value={latInput}
              onChange={(e) => handleLatChange(e.target.value)}
              placeholder="-34.603700"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Longitud
            </label>
            <input
              type="text"
              value={lngInput}
              onChange={(e) => handleLngChange(e.target.value)}
              placeholder="-58.381600"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
      )}

      {/* ── Mini-mapa (colapsable) ── */}
      <div className="rounded-xl overflow-hidden border border-slate-700/50">
        {/* Header del mapa — siempre visible en modo colapsable */}
        {collapsible && (
          <button
            type="button"
            onClick={handleToggleMap}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-sm font-medium"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              {isMapOpen ? 'Ocultar mapa de ubicación' : 'Ver mapa de ubicación'}
            </span>
            {isMapOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Contenedor del mapa */}
        {isMapOpen && (
          <div className="relative bg-slate-950">
            <style>{`
              @keyframes pulse {
                0%, 100% { opacity: 0.6; transform: scale(1); }
                50% { opacity: 0.3; transform: scale(1.3); }
              }
              .venue-picker-icon { background: transparent !important; border: none !important; }
              .leaflet-control-zoom {
                border: 1px solid rgba(51,65,85,0.8) !important;
                border-radius: 8px !important;
                overflow: hidden;
              }
              .leaflet-control-zoom a {
                background: rgba(15,23,42,0.9) !important;
                color: #94a3b8 !important;
                border-bottom: 1px solid rgba(51,65,85,0.5) !important;
                width: 28px !important;
                height: 28px !important;
                line-height: 28px !important;
              }
              .leaflet-control-zoom a:hover {
                background: rgba(30,41,59,0.95) !important;
                color: #fff !important;
              }
            `}</style>
            <div
              ref={mapContainerRef}
              style={{ height: `${mapHeight}px` }}
              className="w-full"
            />
            {/* Hint drag */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
              <span className="text-[10px] bg-slate-900/80 text-slate-400 px-2 py-1 rounded-full backdrop-blur-sm border border-slate-700/40">
                Arrastrá el pin para ajustar la posición
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
