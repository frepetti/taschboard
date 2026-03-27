import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase/client';
import { useAuth } from '../utils/AuthContext';
import { KPICard } from './KPICard';
import { PerformanceChart } from './PerformanceChart';
import { OpportunityMap } from './OpportunityMap';
import { VenueTable } from './VenueTable';
import { CompetitionChart } from './CompetitionChart';
import { OpportunityBreakdown } from './OpportunityBreakdown';
import { ActivationTimeline } from './ActivationTimeline';
import { VenueDetail } from './VenueDetail';
import { FilterChip } from './FilterChip';
import { TrendingUp, TrendingDown, Minus, Target, Store, Users, DollarSign } from 'lucide-react';

interface ManagerDashboardProps {
  session: any;
  readOnly?: boolean;
  isDemo?: boolean;
  dateFilter?: string;
  setDateFilter?: (filter: string) => void;
  regionFilter?: string;
  setRegionFilter?: (filter: string) => void;
  productId?: string | null;
}

interface Region {
  id: string;
  nombre: string;
}

// Mock data para modo demo
const DEMO_DATA = {
  kpis: {
    visitedVenues: 642,
    visitedVenuesTrend: 18.5,
    compliance: 89.4,
    complianceTrend: 3.2,
    activations: 124,
    activationsTrend: 12.4,
    roi: 312.5,
    roiTrend: 22.1,
    totalRegisteredVenues: 850
  },
  demoVenues: [
    {
        "id": "v1",
        "venue_name": "La Terraza Premium",
        "zone": "Palermo",
        "lat": -34.5689,
        "lng": -58.4305,
        "type": "strategic",
        "channel": "On Premise"
    },
    {
        "id": "v2",
        "venue_name": "Bar Central",
        "zone": "Microcentro",
        "lat": -34.6037,
        "lng": -58.3756,
        "type": "opportunity",
        "channel": "Bar"
    },
    {
        "id": "v3",
        "venue_name": "Discoteca Eclipse",
        "zone": "Palermo",
        "lat": -34.5889,
        "lng": -58.4325,
        "type": "strategic",
        "channel": "Night Club"
    },
    {
        "id": "v4",
        "venue_name": "El Refugio",
        "zone": "San Telmo",
        "lat": -34.6215,
        "lng": -58.3732,
        "type": "opportunity",
        "channel": "On Premise"
    },
    {
        "id": "v5",
        "venue_name": "Sky Lounge BA",
        "zone": "Puerto Madero",
        "lat": -34.6128,
        "lng": -58.3615,
        "type": "strategic",
        "channel": "Premium Bar"
    },
    {
        "id": "v6",
        "venue_name": "Bodegón del Sur",
        "zone": "Boca",
        "lat": -34.6353,
        "lng": -58.3648,
        "type": "risk",
        "channel": "Restaurante"
    },
    {
        "id": "v7",
        "venue_name": "Pub Los Amigos",
        "zone": "Belgrano",
        "lat": -34.5625,
        "lng": -58.4602,
        "type": "opportunity",
        "channel": "Bar"
    },
    {
        "id": "v8",
        "venue_name": "Bierhaus",
        "zone": "Palermo",
        "lat": -34.58,
        "lng": -58.42,
        "type": "activated",
        "channel": "Cervecería"
    },
    {
        "id": "v9",
        "venue_name": "Café de la Plaza",
        "zone": "Centro",
        "lat": -34.6087,
        "lng": -58.38,
        "type": "risk",
        "channel": "Café"
    },
    {
        "id": "v10",
        "venue_name": "Oasis Club",
        "zone": "Palermo",
        "lat": -34.59,
        "lng": -58.435,
        "type": "strategic",
        "channel": "Night Club"
    },
    {
        "id": "v11",
        "venue_name": "La Cantina",
        "zone": "Almagro",
        "lat": -34.605,
        "lng": -58.41,
        "type": "opportunity",
        "channel": "Restaurante"
    },
    {
        "id": "v12",
        "venue_name": "Sunset Bar",
        "zone": "Costanera Norte",
        "lat": -34.55,
        "lng": -58.4,
        "type": "strategic",
        "channel": "Premium Bar"
    },
    {
        "id": "v13",
        "venue_name": "El Escondite",
        "zone": "San Telmo",
        "lat": -34.615,
        "lng": -58.37,
        "type": "activated",
        "channel": "Bar"
    },
    {
        "id": "v14",
        "venue_name": "Cocktail Room",
        "zone": "Recoleta",
        "lat": -34.5883,
        "lng": -58.3963,
        "type": "strategic",
        "channel": "Premium Bar"
    },
    {
        "id": "v15",
        "venue_name": "Bar de Vinos",
        "zone": "Palermo",
        "lat": -34.592,
        "lng": -58.428,
        "type": "opportunity",
        "channel": "Bar"
    }
],
  inspections: [
    {
        "id": "insp-52",
        "punto_venta_id": "v1",
        "venue_name": "La Terraza Premium",
        "fecha_inspeccion": "2026-03-24",
        "visit_date": "2026-03-24",
        "compliance_score": 90,
        "brand_presence": "Alta",
        "competitor_presence": "Baja",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 52"
    },
    {
        "id": "insp-54",
        "punto_venta_id": "v8",
        "venue_name": "Bierhaus",
        "fecha_inspeccion": "2026-03-22",
        "visit_date": "2026-03-22",
        "compliance_score": 68,
        "brand_presence": "Baja",
        "competitor_presence": "Alta",
        "main_competitor": "Otros",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 54"
    },
    {
        "id": "insp-19",
        "punto_venta_id": "v13",
        "venue_name": "El Escondite",
        "fecha_inspeccion": "2026-03-21",
        "visit_date": "2026-03-21",
        "compliance_score": 70,
        "brand_presence": "Baja",
        "competitor_presence": "Baja",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 19"
    },
    {
        "id": "insp-0",
        "punto_venta_id": "v7",
        "venue_name": "Pub Los Amigos",
        "fecha_inspeccion": "2026-03-18",
        "visit_date": "2026-03-18",
        "compliance_score": 90,
        "brand_presence": "Baja",
        "competitor_presence": "Media",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 0"
    },
    {
        "id": "insp-57",
        "punto_venta_id": "v11",
        "venue_name": "La Cantina",
        "fecha_inspeccion": "2026-03-15",
        "visit_date": "2026-03-15",
        "compliance_score": 80,
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 57"
    },
    {
        "id": "insp-51",
        "punto_venta_id": "v2",
        "venue_name": "Bar Central",
        "fecha_inspeccion": "2026-03-12",
        "visit_date": "2026-03-12",
        "compliance_score": 79,
        "brand_presence": "Baja",
        "competitor_presence": "Baja",
        "main_competitor": "Otros",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 51"
    },
    {
        "id": "insp-21",
        "punto_venta_id": "v11",
        "venue_name": "La Cantina",
        "fecha_inspeccion": "2026-03-09",
        "visit_date": "2026-03-09",
        "compliance_score": 85,
        "brand_presence": "Baja",
        "competitor_presence": "Alta",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 21"
    },
    {
        "id": "insp-34",
        "punto_venta_id": "v12",
        "venue_name": "Sunset Bar",
        "fecha_inspeccion": "2026-03-05",
        "visit_date": "2026-03-05",
        "compliance_score": 85,
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Otros",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 34"
    },
    {
        "id": "insp-37",
        "punto_venta_id": "v10",
        "venue_name": "Oasis Club",
        "fecha_inspeccion": "2026-03-01",
        "visit_date": "2026-03-01",
        "compliance_score": 76,
        "brand_presence": "Media",
        "competitor_presence": "Alta",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 37"
    },
    {
        "id": "insp-50",
        "punto_venta_id": "v9",
        "venue_name": "Café de la Plaza",
        "fecha_inspeccion": "2026-02-28",
        "visit_date": "2026-02-28",
        "compliance_score": 84,
        "brand_presence": "Alta",
        "competitor_presence": "Baja",
        "main_competitor": "Aviation",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 50"
    },
    {
        "id": "insp-26",
        "punto_venta_id": "v15",
        "venue_name": "Bar de Vinos",
        "fecha_inspeccion": "2026-02-22",
        "visit_date": "2026-02-22",
        "compliance_score": 77,
        "brand_presence": "Alta",
        "competitor_presence": "Baja",
        "main_competitor": "Aviation",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 26"
    },
    {
        "id": "insp-46",
        "punto_venta_id": "v8",
        "venue_name": "Bierhaus",
        "fecha_inspeccion": "2026-02-11",
        "visit_date": "2026-02-11",
        "compliance_score": 62,
        "brand_presence": "Baja",
        "competitor_presence": "Media",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 46"
    },
    {
        "id": "insp-8",
        "punto_venta_id": "v1",
        "venue_name": "La Terraza Premium",
        "fecha_inspeccion": "2026-02-07",
        "visit_date": "2026-02-07",
        "compliance_score": 93,
        "brand_presence": "Media",
        "competitor_presence": "Baja",
        "main_competitor": "Aviation",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 8"
    },
    {
        "id": "insp-40",
        "punto_venta_id": "v8",
        "venue_name": "Bierhaus",
        "fecha_inspeccion": "2026-01-29",
        "visit_date": "2026-01-29",
        "compliance_score": 64,
        "brand_presence": "Media",
        "competitor_presence": "Media",
        "main_competitor": "Roku",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 40"
    },
    {
        "id": "insp-58",
        "punto_venta_id": "v6",
        "venue_name": "Bodegón del Sur",
        "fecha_inspeccion": "2026-01-09",
        "visit_date": "2026-01-09",
        "compliance_score": 97,
        "brand_presence": "Media",
        "competitor_presence": "Media",
        "main_competitor": "Aviation",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 58"
    },
    {
        "id": "insp-41",
        "punto_venta_id": "v6",
        "venue_name": "Bodegón del Sur",
        "fecha_inspeccion": "2025-12-31",
        "visit_date": "2025-12-31",
        "compliance_score": 90,
        "brand_presence": "Baja",
        "competitor_presence": "Media",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 41"
    },
    {
        "id": "insp-23",
        "punto_venta_id": "v4",
        "venue_name": "El Refugio",
        "fecha_inspeccion": "2025-12-22",
        "visit_date": "2025-12-22",
        "compliance_score": 63,
        "brand_presence": "Baja",
        "competitor_presence": "Alta",
        "main_competitor": "Aviation",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 23"
    },
    {
        "id": "insp-38",
        "punto_venta_id": "v4",
        "venue_name": "El Refugio",
        "fecha_inspeccion": "2025-12-21",
        "visit_date": "2025-12-21",
        "compliance_score": 83,
        "brand_presence": "Baja",
        "competitor_presence": "Alta",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 38"
    },
    {
        "id": "insp-30",
        "punto_venta_id": "v6",
        "venue_name": "Bodegón del Sur",
        "fecha_inspeccion": "2025-12-06",
        "visit_date": "2025-12-06",
        "compliance_score": 97,
        "brand_presence": "Media",
        "competitor_presence": "Baja",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 30"
    },
    {
        "id": "insp-48",
        "punto_venta_id": "v10",
        "venue_name": "Oasis Club",
        "fecha_inspeccion": "2025-12-02",
        "visit_date": "2025-12-02",
        "compliance_score": 84,
        "brand_presence": "Alta",
        "competitor_presence": "Baja",
        "main_competitor": "Aviation",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 48"
    },
    {
        "id": "insp-15",
        "punto_venta_id": "v12",
        "venue_name": "Sunset Bar",
        "fecha_inspeccion": "2025-12-01",
        "visit_date": "2025-12-01",
        "compliance_score": 80,
        "brand_presence": "Media",
        "competitor_presence": "Media",
        "main_competitor": "Roku",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 15"
    },
    {
        "id": "insp-16",
        "punto_venta_id": "v4",
        "venue_name": "El Refugio",
        "fecha_inspeccion": "2025-12-01",
        "visit_date": "2025-12-01",
        "compliance_score": 73,
        "brand_presence": "Media",
        "competitor_presence": "Baja",
        "main_competitor": "Roku",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 16"
    },
    {
        "id": "insp-22",
        "punto_venta_id": "v14",
        "venue_name": "Cocktail Room",
        "fecha_inspeccion": "2025-10-19",
        "visit_date": "2025-10-19",
        "compliance_score": 95,
        "brand_presence": "Media",
        "competitor_presence": "Media",
        "main_competitor": "Roku",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 22"
    },
    {
        "id": "insp-42",
        "punto_venta_id": "v9",
        "venue_name": "Café de la Plaza",
        "fecha_inspeccion": "2025-10-15",
        "visit_date": "2025-10-15",
        "compliance_score": 65,
        "brand_presence": "Media",
        "competitor_presence": "Media",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 42"
    },
    {
        "id": "insp-59",
        "punto_venta_id": "v15",
        "venue_name": "Bar de Vinos",
        "fecha_inspeccion": "2025-10-11",
        "visit_date": "2025-10-11",
        "compliance_score": 78,
        "brand_presence": "Baja",
        "competitor_presence": "Baja",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 59"
    },
    {
        "id": "insp-47",
        "punto_venta_id": "v11",
        "venue_name": "La Cantina",
        "fecha_inspeccion": "2025-09-21",
        "visit_date": "2025-09-21",
        "compliance_score": 86,
        "brand_presence": "Baja",
        "competitor_presence": "Baja",
        "main_competitor": "Aviation",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 47"
    },
    {
        "id": "insp-1",
        "punto_venta_id": "v10",
        "venue_name": "Oasis Club",
        "fecha_inspeccion": "2025-09-07",
        "visit_date": "2025-09-07",
        "compliance_score": 60,
        "brand_presence": "Media",
        "competitor_presence": "Alta",
        "main_competitor": "Aviation",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 1"
    },
    {
        "id": "insp-44",
        "punto_venta_id": "v5",
        "venue_name": "Sky Lounge BA",
        "fecha_inspeccion": "2025-09-04",
        "visit_date": "2025-09-04",
        "compliance_score": 72,
        "brand_presence": "Baja",
        "competitor_presence": "Baja",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 44"
    },
    {
        "id": "insp-36",
        "punto_venta_id": "v11",
        "venue_name": "La Cantina",
        "fecha_inspeccion": "2025-08-31",
        "visit_date": "2025-08-31",
        "compliance_score": 77,
        "brand_presence": "Baja",
        "competitor_presence": "Baja",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 36"
    },
    {
        "id": "insp-27",
        "punto_venta_id": "v7",
        "venue_name": "Pub Los Amigos",
        "fecha_inspeccion": "2025-08-28",
        "visit_date": "2025-08-28",
        "compliance_score": 71,
        "brand_presence": "Baja",
        "competitor_presence": "Alta",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 27"
    },
    {
        "id": "insp-10",
        "punto_venta_id": "v10",
        "venue_name": "Oasis Club",
        "fecha_inspeccion": "2025-08-18",
        "visit_date": "2025-08-18",
        "compliance_score": 80,
        "brand_presence": "Media",
        "competitor_presence": "Media",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 10"
    },
    {
        "id": "insp-11",
        "punto_venta_id": "v13",
        "venue_name": "El Escondite",
        "fecha_inspeccion": "2025-08-15",
        "visit_date": "2025-08-15",
        "compliance_score": 88,
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 11"
    },
    {
        "id": "insp-53",
        "punto_venta_id": "v9",
        "venue_name": "Café de la Plaza",
        "fecha_inspeccion": "2025-08-15",
        "visit_date": "2025-08-15",
        "compliance_score": 89,
        "brand_presence": "Alta",
        "competitor_presence": "Alta",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 53"
    },
    {
        "id": "insp-33",
        "punto_venta_id": "v1",
        "venue_name": "La Terraza Premium",
        "fecha_inspeccion": "2025-08-01",
        "visit_date": "2025-08-01",
        "compliance_score": 75,
        "brand_presence": "Alta",
        "competitor_presence": "Alta",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 33"
    },
    {
        "id": "insp-5",
        "punto_venta_id": "v6",
        "venue_name": "Bodegón del Sur",
        "fecha_inspeccion": "2025-07-29",
        "visit_date": "2025-07-29",
        "compliance_score": 96,
        "brand_presence": "Media",
        "competitor_presence": "Alta",
        "main_competitor": "Aviation",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 5"
    },
    {
        "id": "insp-55",
        "punto_venta_id": "v12",
        "venue_name": "Sunset Bar",
        "fecha_inspeccion": "2025-07-25",
        "visit_date": "2025-07-25",
        "compliance_score": 76,
        "brand_presence": "Media",
        "competitor_presence": "Media",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 55"
    },
    {
        "id": "insp-14",
        "punto_venta_id": "v10",
        "venue_name": "Oasis Club",
        "fecha_inspeccion": "2025-07-24",
        "visit_date": "2025-07-24",
        "compliance_score": 75,
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Roku",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 14"
    },
    {
        "id": "insp-9",
        "punto_venta_id": "v14",
        "venue_name": "Cocktail Room",
        "fecha_inspeccion": "2025-07-18",
        "visit_date": "2025-07-18",
        "compliance_score": 75,
        "brand_presence": "Media",
        "competitor_presence": "Baja",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 9"
    },
    {
        "id": "insp-35",
        "punto_venta_id": "v14",
        "venue_name": "Cocktail Room",
        "fecha_inspeccion": "2025-07-14",
        "visit_date": "2025-07-14",
        "compliance_score": 88,
        "brand_presence": "Media",
        "competitor_presence": "Alta",
        "main_competitor": "Roku",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 35"
    },
    {
        "id": "insp-45",
        "punto_venta_id": "v13",
        "venue_name": "El Escondite",
        "fecha_inspeccion": "2025-07-11",
        "visit_date": "2025-07-11",
        "compliance_score": 98,
        "brand_presence": "Alta",
        "competitor_presence": "Baja",
        "main_competitor": "Aviation",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 45"
    },
    {
        "id": "insp-17",
        "punto_venta_id": "v3",
        "venue_name": "Discoteca Eclipse",
        "fecha_inspeccion": "2025-07-08",
        "visit_date": "2025-07-08",
        "compliance_score": 92,
        "brand_presence": "Baja",
        "competitor_presence": "Media",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 17"
    },
    {
        "id": "insp-56",
        "punto_venta_id": "v4",
        "venue_name": "El Refugio",
        "fecha_inspeccion": "2025-07-06",
        "visit_date": "2025-07-06",
        "compliance_score": 61,
        "brand_presence": "Media",
        "competitor_presence": "Baja",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 56"
    },
    {
        "id": "insp-49",
        "punto_venta_id": "v2",
        "venue_name": "Bar Central",
        "fecha_inspeccion": "2025-07-05",
        "visit_date": "2025-07-05",
        "compliance_score": 81,
        "brand_presence": "Alta",
        "competitor_presence": "Baja",
        "main_competitor": "Otros",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 49"
    },
    {
        "id": "insp-31",
        "punto_venta_id": "v8",
        "venue_name": "Bierhaus",
        "fecha_inspeccion": "2025-06-27",
        "visit_date": "2025-06-27",
        "compliance_score": 84,
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 31"
    },
    {
        "id": "insp-29",
        "punto_venta_id": "v14",
        "venue_name": "Cocktail Room",
        "fecha_inspeccion": "2025-06-26",
        "visit_date": "2025-06-26",
        "compliance_score": 91,
        "brand_presence": "Media",
        "competitor_presence": "Alta",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 29"
    },
    {
        "id": "insp-43",
        "punto_venta_id": "v6",
        "venue_name": "Bodegón del Sur",
        "fecha_inspeccion": "2025-06-23",
        "visit_date": "2025-06-23",
        "compliance_score": 68,
        "brand_presence": "Alta",
        "competitor_presence": "Alta",
        "main_competitor": "Roku",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 43"
    },
    {
        "id": "insp-39",
        "punto_venta_id": "v12",
        "venue_name": "Sunset Bar",
        "fecha_inspeccion": "2025-06-19",
        "visit_date": "2025-06-19",
        "compliance_score": 97,
        "brand_presence": "Media",
        "competitor_presence": "Media",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 39"
    },
    {
        "id": "insp-13",
        "punto_venta_id": "v5",
        "venue_name": "Sky Lounge BA",
        "fecha_inspeccion": "2025-06-18",
        "visit_date": "2025-06-18",
        "compliance_score": 80,
        "brand_presence": "Baja",
        "competitor_presence": "Baja",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 13"
    },
    {
        "id": "insp-32",
        "punto_venta_id": "v13",
        "venue_name": "El Escondite",
        "fecha_inspeccion": "2025-06-16",
        "visit_date": "2025-06-16",
        "compliance_score": 79,
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Aviation",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 32"
    },
    {
        "id": "insp-3",
        "punto_venta_id": "v13",
        "venue_name": "El Escondite",
        "fecha_inspeccion": "2025-06-11",
        "visit_date": "2025-06-11",
        "compliance_score": 92,
        "brand_presence": "Alta",
        "competitor_presence": "Baja",
        "main_competitor": "Roku",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 3"
    },
    {
        "id": "insp-4",
        "punto_venta_id": "v14",
        "venue_name": "Cocktail Room",
        "fecha_inspeccion": "2025-06-02",
        "visit_date": "2025-06-02",
        "compliance_score": 94,
        "brand_presence": "Media",
        "competitor_presence": "Media",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 4"
    },
    {
        "id": "insp-24",
        "punto_venta_id": "v6",
        "venue_name": "Bodegón del Sur",
        "fecha_inspeccion": "2025-05-31",
        "visit_date": "2025-05-31",
        "compliance_score": 81,
        "brand_presence": "Alta",
        "competitor_presence": "Alta",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 24"
    },
    {
        "id": "insp-25",
        "punto_venta_id": "v1",
        "venue_name": "La Terraza Premium",
        "fecha_inspeccion": "2025-05-26",
        "visit_date": "2025-05-26",
        "compliance_score": 84,
        "brand_presence": "Baja",
        "competitor_presence": "Media",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 25"
    },
    {
        "id": "insp-18",
        "punto_venta_id": "v13",
        "venue_name": "El Escondite",
        "fecha_inspeccion": "2025-05-21",
        "visit_date": "2025-05-21",
        "compliance_score": 72,
        "brand_presence": "Alta",
        "competitor_presence": "Alta",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 18"
    },
    {
        "id": "insp-6",
        "punto_venta_id": "v2",
        "venue_name": "Bar Central",
        "fecha_inspeccion": "2025-05-18",
        "visit_date": "2025-05-18",
        "compliance_score": 97,
        "brand_presence": "Media",
        "competitor_presence": "Alta",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 6"
    },
    {
        "id": "insp-2",
        "punto_venta_id": "v10",
        "venue_name": "Oasis Club",
        "fecha_inspeccion": "2025-05-09",
        "visit_date": "2025-05-09",
        "compliance_score": 78,
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 2"
    },
    {
        "id": "insp-12",
        "punto_venta_id": "v5",
        "venue_name": "Sky Lounge BA",
        "fecha_inspeccion": "2025-05-05",
        "visit_date": "2025-05-05",
        "compliance_score": 84,
        "brand_presence": "Baja",
        "competitor_presence": "Alta",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "observations": "Observación autogenerada 12"
    },
    {
        "id": "insp-20",
        "punto_venta_id": "v13",
        "venue_name": "El Escondite",
        "fecha_inspeccion": "2025-04-30",
        "visit_date": "2025-04-30",
        "compliance_score": 75,
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 20"
    },
    {
        "id": "insp-28",
        "punto_venta_id": "v13",
        "venue_name": "El Escondite",
        "fecha_inspeccion": "2025-04-11",
        "visit_date": "2025-04-11",
        "compliance_score": 96,
        "brand_presence": "Media",
        "competitor_presence": "Media",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 28"
    },
    {
        "id": "insp-7",
        "punto_venta_id": "v11",
        "venue_name": "La Cantina",
        "fecha_inspeccion": "2025-03-26",
        "visit_date": "2025-03-26",
        "compliance_score": 67,
        "brand_presence": "Alta",
        "competitor_presence": "Baja",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "observations": "Observación autogenerada 7"
    }
],
  activations: [
    {
        "id": "act-9",
        "venue": "La Terraza Premium",
        "date": "2026-03-09",
        "type": "Completed",
        "impact": "+34%",
        "status": "success"
    },
    {
        "id": "act-7",
        "venue": "Cocktail Room",
        "date": "2026-02-16",
        "type": "Completed",
        "impact": "+39%",
        "status": "success"
    },
    {
        "id": "act-0",
        "venue": "El Escondite",
        "date": "2025-12-16",
        "type": "Completed",
        "impact": "+11%",
        "status": "success"
    },
    {
        "id": "act-4",
        "venue": "Oasis Club",
        "date": "2025-11-27",
        "type": "In Progress",
        "impact": "TBD",
        "status": "active"
    },
    {
        "id": "act-11",
        "venue": "El Refugio",
        "date": "2025-11-26",
        "type": "Completed",
        "impact": "+20%",
        "status": "success"
    },
    {
        "id": "act-6",
        "venue": "Sunset Bar",
        "date": "2025-09-21",
        "type": "Completed",
        "impact": "+33%",
        "status": "success"
    },
    {
        "id": "act-10",
        "venue": "El Escondite",
        "date": "2025-09-19",
        "type": "Completed",
        "impact": "+39%",
        "status": "success"
    },
    {
        "id": "act-13",
        "venue": "La Cantina",
        "date": "2025-09-11",
        "type": "Completed",
        "impact": "+26%",
        "status": "success"
    },
    {
        "id": "act-3",
        "venue": "Discoteca Eclipse",
        "date": "2025-08-30",
        "type": "Completed",
        "impact": "+14%",
        "status": "success"
    },
    {
        "id": "act-1",
        "venue": "Oasis Club",
        "date": "2025-08-20",
        "type": "Completed",
        "impact": "+23%",
        "status": "success"
    },
    {
        "id": "act-12",
        "venue": "Oasis Club",
        "date": "2025-08-15",
        "type": "In Progress",
        "impact": "TBD",
        "status": "active"
    },
    {
        "id": "act-14",
        "venue": "La Cantina",
        "date": "2025-07-26",
        "type": "In Progress",
        "impact": "TBD",
        "status": "active"
    },
    {
        "id": "act-2",
        "venue": "El Refugio",
        "date": "2025-07-24",
        "type": "Scheduled",
        "impact": "TBD",
        "status": "scheduled"
    },
    {
        "id": "act-8",
        "venue": "Bierhaus",
        "date": "2025-05-13",
        "type": "Completed",
        "impact": "+17%",
        "status": "success"
    },
    {
        "id": "act-5",
        "venue": "Bodegón del Sur",
        "date": "2025-04-11",
        "type": "Completed",
        "impact": "+34%",
        "status": "success"
    }
]
};

export function ManagerDashboard({
  readOnly = false,
  isDemo = false,
  dateFilter: propDateFilter,
  setDateFilter: propSetDateFilter,
  regionFilter: propRegionFilter,
  setRegionFilter: propSetRegionFilter,
  productId = null
}: ManagerDashboardProps) {
  const [inspections, setInspections] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [activations, setActivations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Internal state for uncontrolled mode
  const [internalDateFilter, setInternalDateFilter] = useState('6M');
  const [internalRegionFilter, setInternalRegionFilter] = useState('all');

  // Use props if available (Controlled), else use internal state (Uncontrolled)
  const dateFilter = propDateFilter !== undefined ? propDateFilter : internalDateFilter;
  const setDateFilter = propSetDateFilter || setInternalDateFilter;

  const regionFilter = propRegionFilter !== undefined ? propRegionFilter : internalRegionFilter;
  const setRegionFilter = propSetRegionFilter || setInternalRegionFilter;

  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [regions, setRegions] = useState<Region[]>([]);

  useEffect(() => {
    loadRegions();
  }, []);

  useEffect(() => {
    if (isDemo) {
      // Usar datos de demo
      setKpis(DEMO_DATA.kpis);
      setInspections(DEMO_DATA.inspections);
      setActivations(DEMO_DATA.activations);
      setLoading(false);
    } else {
      loadDashboardData();
    }
  }, [dateFilter, regionFilter, isDemo, productId]);

  const loadRegions = async () => {
    try {
      const { data } = await supabase
        .from('btl_regiones')
        .select('id, nombre')
        .order('nombre');

      if (data) {
        setRegions(data);
      }
    } catch (error) {
      console.error('Error loading regions:', error);
    }
  };

  // Admin View Logic
  const { dbRole } = useAuth();
  const [allVenues, setAllVenues] = useState<any[]>([]);

  useEffect(() => {
    if (dbRole === 'admin') {
      loadAllVenues();
    }
  }, [dbRole, regionFilter]); // Reload if region changes

  const loadAllVenues = async () => {
    try {
      let query = supabase
        .from('btl_puntos_venta')
        .select('*')
        .order('nombre');

      if (regionFilter !== 'all') {
        query = query.eq('region_id', regionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAllVenues(data || []);
    } catch (err) {
      console.error('Error loading all venues for admin:', err);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Cargar Inspecciones
      let inspectionsQuery = supabase
        .from('btl_inspecciones')
        .select('*, btl_puntos_venta!btl_inspecciones_punto_venta_id_fkey(id, nombre, region_id)')
        .order('fecha_inspeccion', { ascending: false })
        .limit(100);

      if (regionFilter !== 'all') {
        inspectionsQuery = inspectionsQuery.eq('btl_puntos_venta.region_id', regionFilter);
      }

      if (productId) {
        inspectionsQuery = inspectionsQuery.eq('producto_id', productId);
      }

      const date = new Date();
      if (dateFilter === '1M') date.setDate(date.getDate() - 30);
      else if (dateFilter === '3M') date.setDate(date.getDate() - 90);
      else if (dateFilter === '6M') date.setDate(date.getDate() - 180);
      else if (dateFilter === '1Y') date.setDate(date.getDate() - 365);
      else if (dateFilter === 'YTD') date.setMonth(0, 1); // Jan 1st of current year

      if (dateFilter !== 'all') { // Asumiendo que podría haber un filtro 'all' aunque no está en el state inicial
        inspectionsQuery = inspectionsQuery.gte('fecha_inspeccion', date.toISOString());
      }

      const { data: inspectionsData, error: inspectionsError } = await inspectionsQuery;
      if (inspectionsError) throw inspectionsError;

      setInspections(inspectionsData || []);

      // 2. Cargar Tickets de Activación BTL (Todos los estados)
      let ticketsQuery = supabase
        .from('btl_reportes')
        .select('*, btl_puntos_venta!btl_reportes_punto_venta_id_fkey(id, nombre, region_id)')
        .eq('categoria', 'accion_btl')
        .order('fecha_activacion_solicitada', { ascending: false });

      if (regionFilter !== 'all') {
        ticketsQuery = ticketsQuery.eq('btl_puntos_venta.region_id', regionFilter);
      }

      const { data: ticketsData, error: ticketsError } = await ticketsQuery;
      if (ticketsError) console.error("Error loading tickets:", ticketsError);

      // 3. Procesar Activaciones desde Tickets BTL (fuente única)
      const getTicketStatus = (estado: string | null | undefined): string => {
        if (!estado) return 'scheduled';
        const str = estado.toLowerCase().trim();
        if (str === 'resuelto' || str === 'cerrado' || str === 'cerrada' || str === 'completado' || str === 'completada' || str === 'success') return 'success';
        if (str === 'en_progreso' || str === 'en progreso' || str === 'active' || str === 'en_curso') return 'active';
        return 'scheduled'; // 'abierto' u otros
      };
// removed lines
// removed lines
// removed lines


      const allActivations = (ticketsData || [])
        .map((t: any) => {
          let impact = 'N/A';
          let numericImpact: number | null = null;

          if (getTicketStatus(t.estado) === 'success') {
            const venueId = t.punto_venta_id;
            const actDate = new Date(t.fecha_activacion_solicitada || t.created_at);
            
            const venueInspections = currentInspections.filter((i:any) => i.punto_venta_id === venueId);
            const beforeInspections = venueInspections.filter((i:any) => new Date(i.fecha_inspeccion) <= actDate);
            const afterInspections = venueInspections.filter((i:any) => new Date(i.fecha_inspeccion) > actDate);

            if (beforeInspections.length > 0 && afterInspections.length > 0) {
              const avgBefore = beforeInspections.reduce((sum: number, i: any) => sum + (i.compliance_score || 0), 0) / beforeInspections.length;
              const avgAfter = afterInspections.reduce((sum: number, i: any) => sum + (i.compliance_score || 0), 0) / afterInspections.length;
              
              if (avgBefore > 0) {
                const uplift = ((avgAfter - avgBefore) / avgBefore) * 100;
                numericImpact = uplift;
                impact = `${uplift > 0 ? '+' : ''}${uplift.toFixed(1)}%`;
              }
            } else {
              impact = '-';
            }
          }

          return {
            id: `ticket-${t.id}`,
            venue: t.btl_puntos_venta?.nombre || 'Venue sin asignar',
            date: t.fecha_activacion_solicitada || t.created_at,
            type: t.tipo_activacion || 'Activación BTL',
            impact: impact,
            status: getTicketStatus(t.estado),
            rawDate: new Date(t.fecha_activacion_solicitada || t.created_at),
            numericImpact
          };
        })
        .sort((a: any, b: any) => b.rawDate.getTime() - a.rawDate.getTime());

      setActivations(allActivations);

      // Calcular KPIs basados en datos reales
      const now = new Date();
      let startDate = new Date();
      if (dateFilter === '1M') startDate.setDate(now.getDate() - 30);
      else if (dateFilter === '3M') startDate.setDate(now.getDate() - 90);
      else if (dateFilter === '6M') startDate.setDate(now.getDate() - 180);
      else if (dateFilter === '1Y') startDate.setDate(now.getDate() - 365);
      else if (dateFilter === 'YTD') startDate.setMonth(0, 1);
      else startDate = new Date(0);

      const previousStartDate = new Date(startDate);
      if (dateFilter === '1M') previousStartDate.setDate(startDate.getDate() - 30);
      else if (dateFilter === '3M') previousStartDate.setDate(startDate.getDate() - 90);
      else if (dateFilter === '6M') previousStartDate.setDate(startDate.getDate() - 180);
      else if (dateFilter === '1Y') previousStartDate.setDate(startDate.getDate() - 365);
      else if (dateFilter === 'YTD') previousStartDate.setFullYear(startDate.getFullYear() - 1);

      const currentInspections = (inspectionsData || []) as any[];

      const totalVenues = new Set(currentInspections.map((i: any) => i.punto_venta_id)).size;
      const avgCompliance = currentInspections.length > 0
        ? Math.round(currentInspections.reduce((acc: number, i: any) => acc + (i.compliance_score || 0), 0) / currentInspections.length)
        : 0;
      // Contar activaciones completadas desde tickets BTL
      const totalActivations = (ticketsData || []).filter((t: any) => getTicketStatus(t.estado) === 'success').length;

      const impactValues = allActivations.map((a: any) => a.numericImpact).filter((v: any) => v !== null && v !== undefined);
      const avgRoi = impactValues.length > 0 
        ? impactValues.reduce((sum: number, val: number) => sum + val, 0) / impactValues.length
        : null;

      setKpis({
        visitedVenues: totalVenues,
        visitedVenuesTrend: 0,
        compliance: avgCompliance,
        complianceTrend: 0,
        activations: totalActivations,
        activationsTrend: 0,
        roi: avgRoi !== null ? avgRoi.toFixed(1) : '-',
        roiTrend: 0,
        totalRegisteredVenues: allVenues.length
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-400';
    if (trend < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  if (loading && !kpis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className={`max-w-[1600px] mx-auto py-6 space-y-6 ${readOnly ? '' : 'px-4 sm:px-8'}`}>

        {/* Filters Section */}
        <div className="flex flex-wrap gap-3">
          <FilterChip
            label="1 Mes"
            active={dateFilter === '1M'}
            onClick={() => setDateFilter('1M')}
          />
          <FilterChip
            label="3 Meses"
            active={dateFilter === '3M'}
            onClick={() => setDateFilter('3M')}
          />
          <FilterChip
            label="6 Meses"
            active={dateFilter === '6M'}
            onClick={() => setDateFilter('6M')}
          />
          <FilterChip
            label="1 Año"
            active={dateFilter === '1Y'}
            onClick={() => setDateFilter('1Y')}
          />
          <FilterChip
            label="YTD"
            active={dateFilter === 'YTD'}
            onClick={() => setDateFilter('YTD')}
          />

          <div className="border-l border-slate-700 mx-2"></div>

          {/* Dynamic Region Filters */}
          <FilterChip
            label="Todas las regiones"
            active={regionFilter === 'all'}
            onClick={() => setRegionFilter('all')}
          />

          {regions.map((region) => (
            <FilterChip
              key={region.id}
              label={region.nombre}
              active={regionFilter === region.id}
              onClick={() => setRegionFilter(region.id)}
            />
          ))}

          {/* Fallback if no regions loaded and no filters active */}
          {regions.length === 0 && (
            <span className="text-xs text-slate-500 flex items-center px-2">
              Cargando regiones...
            </span>
          )}
        </div>

        {/* KPI Cards */}
        {kpis && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Puntos de Venta Visitados"
              value={kpis.visitedVenues.toString()}
              icon={<Store className="w-6 h-6" />}
              trend={{
                value: kpis.visitedVenuesTrend,
                label: `${Math.abs(kpis.visitedVenuesTrend)}% vs período anterior`,
                color: getTrendColor(kpis.visitedVenuesTrend),
                icon: getTrendIcon(kpis.visitedVenuesTrend),
              }}
              color="turquoise"
            />
            <KPICard
              title="Cumplimiento Promedio"
              value={`${kpis.compliance.toFixed(1)}%`}
              icon={<Target className="w-6 h-6" />}
              trend={{
                value: kpis.complianceTrend,
                label: `${Math.abs(kpis.complianceTrend)}% vs período anterior`,
                color: getTrendColor(kpis.complianceTrend),
                icon: getTrendIcon(kpis.complianceTrend),
              }}
              color="turquoise"
            />
            <KPICard
              title="Activaciones Ejecutadas"
              value={kpis.activations.toString()}
              icon={<Users className="w-6 h-6" />}
              trend={{
                value: kpis.activationsTrend,
                label: kpis.activationsTrend !== 0 ? `${Math.abs(kpis.activationsTrend)}% vs período anterior` : 'Sin datos anteriores',
                color: getTrendColor(kpis.activationsTrend),
                icon: getTrendIcon(kpis.activationsTrend),
              }}
              color="turquoise"
            />
            {/* Impacto de Activación Card */}
            <KPICard
              title={isDemo ? "ROI Activaciones" : "Impacto de Activación"}
              value={kpis.roi === '-' ? '-' : `${kpis.roi}%`}
              icon={<DollarSign className="w-6 h-6" />}
              trend={{
                value: kpis.roiTrend,
                label: kpis.roi === '-' ? 'Sin datos anteriores' : `${Math.abs(kpis.roiTrend)}% vs período anterior`,
                color: getTrendColor(kpis.roiTrend),
                icon: getTrendIcon(kpis.roiTrend),
              }}
              color="turquoise"
            />
          </div>
        )}

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceChart inspections={inspections} />
          <CompetitionChart inspections={inspections} isDemo={isDemo} />
        </div>

        {/* Map Section */}
        <OpportunityMap
          inspections={inspections}
          selectedProductId={productId}
          isDemo={isDemo}
          demoVenues={isDemo ? (DEMO_DATA as any).demoVenues : []}
          onVenueSelect={(venue) => {
            console.log('🗺️ Map selected venue:', venue);
            setSelectedVenue(venue);
          }}
        />

        {/* Opportunity Breakdown */}
        <OpportunityBreakdown inspections={inspections} isDemo={isDemo} />

        {/* Venue Table */}
        <VenueTable
          inspections={inspections}
          readOnly={readOnly}
          onVenueClick={(venue) => setSelectedVenue(venue)}
        />

        {/* Activation Timeline */}
        <ActivationTimeline activations={activations} />

      </div>

      {/* Venue Detail Modal */}
      {selectedVenue && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50">
          <div className="h-full overflow-y-auto">
            <VenueDetail
              venueId={selectedVenue.id}
              selectedProductId={productId}
              onBack={() => {
                setSelectedVenue(null);
                // Refresh data when returning from detail
                loadDashboardData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}