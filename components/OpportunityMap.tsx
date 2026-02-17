import { FilterChip } from "./FilterChip";
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  Layers,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import * as L from "leaflet";
import { useLanguage } from '../utils/LanguageContext';

interface OpportunityMapProps {
  inspections?: any[];
  filter?: string;
  onFilterChange?: (filter: string) => void;
  onVenueSelect?: (venue: any) => void;
}

interface ImportedVenue {
  id: string;
  name: string;
  address: string;
  zone: string;
  channel: string;
  city: string;
  lat: number | null;
  lng: number | null;
  imported: boolean;
  importedAt: string;
  // Campos adicionales para coincidir con VenueTable
  image?: string;
  brandPresence?: number;
  perfectServe?: number;
  materialStatus?: string;
  shareOfMenu?: number;
  competitor?: string;
}

// Coordenadas base de Buenos Aires
const BA_CENTER: [number, number] = [-34.6037, -58.3816];

// Mock data sincronizada con VenueTable pero ubicada en BA para el mapa
const DEMO_VENUES: ImportedVenue[] = [
  {
    id: "1",
    name: "The Dead Rabbit",
    address: "Av. Alvear 1891",
    zone: "Recoleta",
    channel: "Bar",
    city: "Buenos Aires",
    lat: -34.5883,
    lng: -58.3963,
    imported: true,
    importedAt: "2026-01-10",
    image:
      "https://images.unsplash.com/photo-1617524455280-327a0ffc561b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGludGVyaW9yfGVufDF8fHx8MTc2NzY4NTc0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    brandPresence: 92,
    perfectServe: 88,
    materialStatus: "Complete",
    shareOfMenu: 28,
    competitor: "Tanqueray",
  },
  {
    id: "2",
    name: "Employees Only",
    address: "Av. Corrientes 1500",
    zone: "Centro",
    channel: "Bar",
    city: "Buenos Aires",
    lat: -34.6037,
    lng: -58.3816,
    imported: true,
    importedAt: "2026-01-10",
    image:
      "https://images.unsplash.com/photo-1739799120521-c5f44a9335a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVha2Vhc3klMjBiYXJ8ZW58MXx8fHwxNzY3NzMwNzAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    brandPresence: 85,
    perfectServe: 91,
    materialStatus: "Complete",
    shareOfMenu: 22,
    competitor: "Bombay Sapphire",
  },
  {
    id: "3",
    name: "The Up & Up",
    address: "Av. del Libertador 5000",
    zone: "Belgrano",
    channel: "Club",
    city: "Buenos Aires",
    lat: -34.5625,
    lng: -58.4402,
    imported: true,
    importedAt: "2026-01-11",
    image:
      "https://images.unsplash.com/photo-1702814160779-4a88cfb330c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBsb3VuZ2V8ZW58MXx8fHwxNzY3NzMwNzAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    brandPresence: 78,
    perfectServe: 72,
    materialStatus: "Partial",
    shareOfMenu: 18,
    competitor: "Beefeater",
  },
  {
    id: "4",
    name: "Eleven Madison Park",
    address: "Puerto Madero",
    zone: "Puerto Madero",
    channel: "Restaurant",
    city: "Buenos Aires",
    lat: -34.6128,
    lng: -58.3615,
    imported: true,
    importedAt: "2026-01-11",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3Njc2MTMyNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    brandPresence: 94,
    perfectServe: 96,
    materialStatus: "Complete",
    shareOfMenu: 31,
    competitor: "Roku Gin",
  },
  {
    id: "5",
    name: "Attaboy",
    address: "Av. de Mayo 825",
    zone: "San Telmo",
    channel: "Bar",
    city: "Buenos Aires",
    lat: -34.6215,
    lng: -58.3732,
    imported: true,
    importedAt: "2026-01-12",
    image:
      "https://images.unsplash.com/photo-1617524455280-327a0ffc561b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGludGVyaW9yfGVufDF8fHx8MTc2NzY4NTc0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    brandPresence: 81,
    perfectServe: 79,
    materialStatus: "Partial",
    shareOfMenu: 25,
    competitor: "Tanqueray",
  },
  {
    id: "6",
    name: "Dante NYC",
    address: "Av. Santa Fe 3200",
    zone: "Palermo",
    channel: "Bar",
    city: "Buenos Aires",
    lat: -34.5889,
    lng: -58.4105,
    imported: true,
    importedAt: "2026-01-12",
    image:
      "https://images.unsplash.com/photo-1674033746275-e898356e0d27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cHNjYWxlJTIwbmlnaHRjbHVifGVufDF8fHx8MTc2NzczMDcwMXww&ixlib=rb-4.1.0&q=80&w=1080",
    brandPresence: 88,
    perfectServe: 84,
    materialStatus: "Complete",
    shareOfMenu: 27,
    competitor: "Monkey 47",
  },
  {
    id: "7",
    name: "Please Don't Tell",
    address: "Av. Rivadavia 4900",
    zone: "Caballito",
    channel: "Bar",
    city: "Buenos Aires",
    lat: -34.6186,
    lng: -58.4357,
    imported: true,
    importedAt: "2026-01-13",
    image:
      "https://images.unsplash.com/photo-1739799120521-c5f44a9335a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGVha2Vhc3klMjBiYXJ8ZW58MXx8fHwxNzY3NzMwNzAyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    brandPresence: 76,
    perfectServe: 68,
    materialStatus: "Missing",
    shareOfMenu: 15,
    competitor: "Aviation Gin",
  },
  {
    id: "8",
    name: "Death & Co",
    address: "Av. Juan B. Justo",
    zone: "Villa Crespo",
    channel: "Bar",
    city: "Buenos Aires",
    lat: -34.5954,
    lng: -58.4398,
    imported: true,
    importedAt: "2026-01-13",
    image:
      "https://images.unsplash.com/photo-1617524455280-327a0ffc561b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGludGVyaW9yfGVufDF8fHx8MTc2NzY4NTc0Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    brandPresence: 90,
    perfectServe: 87,
    materialStatus: "Complete",
    shareOfMenu: 29,
    competitor: "Tanqueray",
  },
];

export function OpportunityMap({
  inspections = [],
  filter: externalFilter,
  onFilterChange: externalOnFilterChange,
  onVenueSelect,
}: OpportunityMapProps) {
  const { t, language } = useLanguage();
  const [importedVenues, setImportedVenues] = useState<
    ImportedVenue[]
  >([]);
  const [internalFilter, setInternalFilter] = useState("all");

  // Refs for Leaflet
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Inject Leaflet CSS
  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.crossOrigin = "";
      document.head.appendChild(link);
    }
  }, []);

  // Use external filter/onChange if provided, otherwise use internal state
  const filter =
    externalFilter !== undefined
      ? externalFilter
      : internalFilter;
  const onFilterChange =
    externalOnFilterChange || setInternalFilter;

  // Load imported venues from localStorage or use demo data
  useEffect(() => {
    const venuesData = localStorage.getItem("imported_venues");
    if (venuesData) {
      try {
        const parsed = JSON.parse(venuesData);
        if (parsed.length > 0) {
          setImportedVenues(parsed);
          console.log(
            "📍 Loaded venues for map:",
            parsed.length,
          );
          return;
        }
      } catch (err) {
        console.error("Error loading venues:", err);
      }
    }

    console.log("📍 Using demo venues for map");
    setImportedVenues(DEMO_VENUES);
  }, []);

  // Genera coordenadas reales basadas en la zona si faltan
  const getCoordinatesFromZone = (
    zone: string,
    index: number,
  ): [number, number] => {
    const zoneCoordinates: { [key: string]: [number, number] } =
      {
        palermo: [-34.5889, -58.4305],
        recoleta: [-34.5883, -58.3963],
        belgrano: [-34.5625, -58.4602],
        "puerto madero": [-34.6128, -58.3615],
        "san telmo": [-34.6215, -58.3732],
        microcentro: [-34.6037, -58.3816],
        retiro: [-34.5937, -58.3768],
        caballito: [-34.6186, -58.4457],
        "villa crespo": [-34.5954, -58.4498],
        almagro: [-34.6098, -58.4223],
        nuñez: [-34.5457, -58.4651],
        colegiales: [-34.5746, -58.4485],
        boca: [-34.6353, -58.3648],
        centro: [-34.6037, -58.3816],
      };

    const zoneLower = zone.toLowerCase();
    let baseCoords: [number, number] = BA_CENTER;

    for (const [key, coords] of Object.entries(
      zoneCoordinates,
    )) {
      if (zoneLower.includes(key)) {
        baseCoords = coords;
        break;
      }
    }

    const jitter = 0.005;
    const randomLat =
      baseCoords[0] + (Math.random() - 0.5) * jitter;
    const randomLng =
      baseCoords[1] + (Math.random() - 0.5) * jitter;

    return [randomLat, randomLng];
  };

  const getVenueType = (
    venue: ImportedVenue,
    index: number,
  ): "strategic" | "opportunity" | "activated" | "risk" => {
    if (
      venue.channel?.toLowerCase().includes("premium") ||
      venue.channel?.toLowerCase().includes("high")
    ) {
      return "strategic";
    }
    const types: Array<
      "strategic" | "opportunity" | "activated" | "risk"
    > = ["strategic", "opportunity", "activated", "risk"];
    return types[index % 4];
  };

  const getVenueScore = (venueId: string): number => {
    const hash = venueId
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Number((6.5 + (hash % 35) / 10).toFixed(1));
  };

  const locations = useMemo(() => {
    return importedVenues.map((venue, index) => {
      let lat = venue.lat;
      let lng = venue.lng;

      if (!lat || !lng) {
        const coords = getCoordinatesFromZone(
          venue.zone,
          index,
        );
        lat = coords[0];
        lng = coords[1];
      }

      return {
        ...venue,
        lat: lat,
        lng: lng,
        type: getVenueType(venue, index),
        score: getVenueScore(venue.id),
      };
    });
  }, [importedVenues]);

  const filteredLocations = useMemo(() => {
    return filter === "all"
      ? locations
      : locations.filter((loc) => loc.type === filter);
  }, [filter, locations]);

  const filters = [
    { id: "all", label: t('map.all_venues'), color: "amber" },
    { id: "strategic", label: t('map.strategic'), color: "green" },
    { id: "opportunity", label: t('map.opportunity'), color: "blue" },
    { id: "risk", label: t('map.risk'), color: "red" },
    { id: "activated", label: t('map.activated'), color: "amber" },
  ];

  const createCustomIcon = (type: string, score: number) => {
    let colorClass = "bg-slate-500";

    switch (type) {
      case "strategic":
        colorClass = "bg-green-500";
        break;
      case "opportunity":
        colorClass = "bg-blue-500";
        break;
      case "risk":
        colorClass = "bg-red-500";
        break;
      case "activated":
        colorClass = "bg-amber-500";
        break;
    }

    return L.divIcon({
      className: "custom-marker-icon",
      html: `
        <div class="relative group">
          <div class="absolute -inset-2 ${colorClass} opacity-20 rounded-full animate-pulse group-hover:opacity-40 transition-opacity"></div>
          <div class="relative w-4 h-4 rounded-full ${colorClass} border-2 border-white/90 shadow-[0_0_15px_rgba(0,0,0,0.5)] transform transition-transform group-hover:scale-125"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const createPopupContent = (loc: any) => {
    const typeColor =
      loc.type === "strategic"
        ? "text-green-300 bg-green-500/20 border-green-500/30"
        : loc.type === "opportunity"
          ? "text-blue-300 bg-blue-500/20 border-blue-500/30"
          : loc.type === "risk"
            ? "text-red-300 bg-red-500/20 border-red-500/30"
            : "text-amber-300 bg-amber-500/20 border-amber-500/30";

    return `
      <div class="p-1 min-w-[200px] font-sans">
        <h4 class="font-bold text-white text-base mb-1">${loc.name}</h4>
        <div class="flex items-center gap-2 mb-3">
          <span class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${typeColor}">
            ${loc.type}
          </span>
          <span class="text-xs font-bold text-amber-400">★ ${loc.score}</span>
        </div>
        <div class="space-y-1">
          <p class="text-slate-300 text-xs m-0">
            <span class="text-slate-500">Zona:</span> ${loc.zone}
          </p>
          <p class="text-slate-300 text-xs m-0">
            <span class="text-slate-500">Dirección:</span> ${loc.address}
          </p>
          <p class="text-slate-400 text-xs mt-2 pt-2 border-t border-slate-700/50 italic m-0">
            ${loc.channel}
          </p>
        </div>
        <button 
          class="w-full mt-3 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded border border-slate-600 hover:border-slate-500 transition-colors flex items-center justify-center gap-2 venue-detail-btn cursor-pointer"
          data-venue-id="${loc.id}"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Ver Detalle de Venue
        </button>
      </div>
    `;
  };

  // Handle Venue Detail Click from Popup
  useEffect(() => {
    const handleDetailClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Buscar el botón o su padre si el click fue en el icono
      const btn = target.closest(".venue-detail-btn");

      if (btn) {
        e.preventDefault();
        const id = btn.getAttribute("data-venue-id");
        const venue = filteredLocations.find(
          (l) => l.id.toString() === id,
        );

        if (venue && onVenueSelect) {
          console.log("📍 Opening venue detail:", venue.name);
          onVenueSelect(venue);
        }
      }
    };

    // Usar delegación de eventos en el document o body
    document.addEventListener("click", handleDetailClick);
    return () =>
      document.removeEventListener("click", handleDetailClick);
  }, [filteredLocations, onVenueSelect]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Already initialized

    // Small delay to ensure container is ready
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      try {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView(BA_CENTER, 13);

        // CartoDB Positron (Light Minimalist) with custom styling
        const tileLayer = L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 20,
          },
        );

        tileLayer.addTo(map);

        // Apply CSS filter to tone down the brightness and blend with dashboard
        // Brightness 0.9 (slightly dim), Sepia 0.1 (slight warmth), Contrast 0.9 (softer)
        tileLayer
          .getContainer()
          ?.style.setProperty(
            "filter",
            "brightness(0.9) sepia(0.1) contrast(0.7)",
          );

        L.control
          .zoom({
            position: "bottomright",
          })
          .addTo(map);

        mapInstanceRef.current = map;

        // Initial markers render
        renderMarkers();
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers
  const renderMarkers = () => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    filteredLocations.forEach((loc) => {
      const marker = L.marker([loc.lat, loc.lng], {
        icon: createCustomIcon(loc.type, loc.score),
      });

      marker.bindPopup(createPopupContent(loc), {
        className: "custom-popup-dark",
        maxWidth: 300,
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });
  };

  // Update markers when filteredLocations changes
  useEffect(() => {
    renderMarkers();
  }, [filteredLocations]);

  return (
    <div className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-xl flex flex-col h-[650px]">
      <style>{`
        .leaflet-container {
          background: #0f172a;
          font-family: inherit;
        }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(8px);
          color: #e2e8f0;
          border: 1px solid rgba(51, 65, 85, 0.5);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
          border-radius: 0.75rem;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          line-height: 1.5;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: #94a3b8 !important;
          padding: 8px !important;
          width: 24px !important;
          height: 24px !important;
          font-size: 18px !important;
        }
        .leaflet-container a.leaflet-popup-close-button:hover {
          color: #fff !important;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg text-white font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            {t('map.title')}
            <span className="text-slate-400 text-sm font-normal">
              ({filteredLocations.length} {language === 'es' ? 'puntos de venta' : 'venues'})
            </span>
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <FilterChip
              key={f.id}
              label={f.label}
              active={filter === f.id}
              onClick={() => onFilterChange(f.id)}
              color={f.color as any}
            />
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 rounded-xl overflow-hidden border border-slate-700/50 shadow-inner bg-slate-950">
        <div
          ref={mapContainerRef}
          className="w-full h-full z-0"
        />

        {/* Overlay Gradients for "Glass" effect on edges */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-slate-900/50 to-transparent pointer-events-none z-[400]" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none z-[400]" />
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-xs sm:text-sm flex-wrap px-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-500/30" />
          <span className="text-slate-400">{t('map.strategic')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />
          <span className="text-slate-400">{t('map.opportunity')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-500/30" />
          <span className="text-slate-400">{t('map.risk')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-500/30" />
          <span className="text-slate-400">{t('map.activated')}</span>
        </div>
      </div>
    </div>
  );
}