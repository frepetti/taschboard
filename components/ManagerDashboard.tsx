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
        "venue_name": "Bodeg├│n del Sur",
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
        "channel": "Cervecer├¡a"
    },
    {
        "id": "v9",
        "venue_name": "Caf├® de la Plaza",
        "zone": "Centro",
        "lat": -34.6087,
        "lng": -58.38,
        "type": "risk",
        "channel": "Caf├®"
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
    // ─── Inspecciones existentes enriquecidas con btl_puntos_venta ────────
    {
        "id": "insp-52",
        "punto_venta_id": "v1",
        "venue_name": "La Terraza Premium",
        "fecha_inspeccion": "2026-03-24",
        "visit_date": "2026-03-24",
        "compliance_score": 90,
        "global_score": 90,
        "stock_nivel": "adequate",
        "fotos_urls": ["https://placehold.co/400x300/1e293b/94a3b8?text=Foto+1", "https://placehold.co/400x300/1e293b/94a3b8?text=Foto+2"],
        "brand_presence": "Alta",
        "competitor_presence": "Baja",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "activacion_ejecutada": true,
        "observations": "Excelente visibilidad de marca. Producto destacado en back bar.",
        "btl_puntos_venta": { "id": "v1", "nombre": "La Terraza Premium", "canal": "Premium Bar" }
    },
    {
        "id": "insp-54",
        "punto_venta_id": "v8",
        "venue_name": "Bierhaus",
        "fecha_inspeccion": "2026-03-22",
        "visit_date": "2026-03-22",
        "compliance_score": 68,
        "global_score": 68,
        "stock_nivel": "low",
        "fotos_urls": ["https://placehold.co/400x300/1e293b/94a3b8?text=Stock+Bajo"],
        "brand_presence": "Baja",
        "competitor_presence": "Alta",
        "main_competitor": "Otros",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "activacion_ejecutada": false,
        "observations": "Stock bajo. Competencia con alta presencia en estante.",
        "btl_puntos_venta": { "id": "v8", "nombre": "Bierhaus", "canal": "Cervecería" }
    },
    {
        "id": "insp-19",
        "punto_venta_id": "v13",
        "venue_name": "El Escondite",
        "fecha_inspeccion": "2026-03-21",
        "visit_date": "2026-03-21",
        "compliance_score": 70,
        "global_score": 70,
        "stock_nivel": "low",
        "fotos_urls": ["https://placehold.co/400x300/1e293b/94a3b8?text=Foto+Bar"],
        "brand_presence": "Baja",
        "competitor_presence": "Baja",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "activacion_ejecutada": false,
        "observations": "Visibilidad mejorable. Sin material POP en punto de venta.",
        "btl_puntos_venta": { "id": "v13", "nombre": "El Escondite", "canal": "Bar" }
    },
    {
        "id": "insp-0",
        "punto_venta_id": "v7",
        "venue_name": "Pub Los Amigos",
        "fecha_inspeccion": "2026-03-18",
        "visit_date": "2026-03-18",
        "compliance_score": 90,
        "global_score": 90,
        "stock_nivel": "adequate",
        "fotos_urls": ["https://placehold.co/400x300/1e293b/94a3b8?text=Foto+Pub"],
        "brand_presence": "Baja",
        "competitor_presence": "Media",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "activacion_ejecutada": false,
        "observations": "Buen compliance general. Oportunidad de mejorar material POP.",
        "btl_puntos_venta": { "id": "v7", "nombre": "Pub Los Amigos", "canal": "Bar" }
    },
    {
        "id": "insp-57",
        "punto_venta_id": "v11",
        "venue_name": "La Cantina",
        "fecha_inspeccion": "2026-03-15",
        "visit_date": "2026-03-15",
        "compliance_score": 80,
        "global_score": 80,
        "stock_nivel": "adequate",
        "fotos_urls": ["https://placehold.co/400x300/1e293b/94a3b8?text=Foto+Cantina"],
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "activacion_ejecutada": true,
        "observations": "Presencia de marca sólida. Stock en niveles correctos.",
        "btl_puntos_venta": { "id": "v11", "nombre": "La Cantina", "canal": "Restaurante" }
    },
    {
        "id": "insp-51",
        "punto_venta_id": "v2",
        "venue_name": "Bar Central",
        "fecha_inspeccion": "2026-03-12",
        "visit_date": "2026-03-12",
        "compliance_score": 79,
        "global_score": 79,
        "stock_nivel": "low",
        "fotos_urls": ["https://placehold.co/400x300/1e293b/94a3b8?text=Bar+Central"],
        "brand_presence": "Baja",
        "competitor_presence": "Baja",
        "main_competitor": "Otros",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "activacion_ejecutada": false,
        "observations": "Stock bajo. Se recomienda reposición urgente.",
        "btl_puntos_venta": { "id": "v2", "nombre": "Bar Central", "canal": "Bar" }
    },
    {
        "id": "insp-21",
        "punto_venta_id": "v11",
        "venue_name": "La Cantina",
        "fecha_inspeccion": "2026-03-09",
        "visit_date": "2026-03-09",
        "compliance_score": 85,
        "global_score": 85,
        "stock_nivel": "adequate",
        "fotos_urls": [],
        "brand_presence": "Baja",
        "competitor_presence": "Alta",
        "main_competitor": "Tanqueray",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "activacion_ejecutada": false,
        "observations": "Alta presencia de competencia Tanqueray. Acción recomendada.",
        "btl_puntos_venta": { "id": "v11", "nombre": "La Cantina", "canal": "Restaurante" }
    },
    {
        "id": "insp-34",
        "punto_venta_id": "v12",
        "venue_name": "Sunset Bar",
        "fecha_inspeccion": "2026-03-05",
        "visit_date": "2026-03-05",
        "compliance_score": 85,
        "global_score": 85,
        "stock_nivel": "adequate",
        "fotos_urls": ["https://placehold.co/400x300/1e293b/94a3b8?text=Sunset+Bar"],
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Otros",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "activacion_ejecutada": true,
        "observations": "Ubicación premium. Excelente ejecución de material POP.",
        "btl_puntos_venta": { "id": "v12", "nombre": "Sunset Bar", "canal": "Premium Bar" }
    },
    {
        "id": "insp-37",
        "punto_venta_id": "v10",
        "venue_name": "Oasis Club",
        "fecha_inspeccion": "2026-03-01",
        "visit_date": "2026-03-01",
        "compliance_score": 76,
        "global_score": 76,
        "stock_nivel": "low",
        "fotos_urls": ["https://placehold.co/400x300/1e293b/94a3b8?text=Oasis+Club"],
        "brand_presence": "Alta",
        "competitor_presence": "Alta",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "activacion_ejecutada": false,
        "observations": "Stock bajo. Alta competencia de Bombay Sapphire.",
        "btl_puntos_venta": { "id": "v10", "nombre": "Oasis Club", "canal": "Night Club" }
    },
    {
        "id": "insp-31",
        "punto_venta_id": "v8",
        "venue_name": "Bierhaus",
        "fecha_inspeccion": "2026-02-27",
        "visit_date": "2026-02-27",
        "compliance_score": 84,
        "global_score": 84,
        "stock_nivel": "adequate",
        "fotos_urls": [],
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "activacion_ejecutada": true,
        "observations": "Buena visibilidad. Activación BTL ejecutada exitosamente.",
        "btl_puntos_venta": { "id": "v8", "nombre": "Bierhaus", "canal": "Cervecería" }
    },
    {
        "id": "insp-29",
        "punto_venta_id": "v14",
        "venue_name": "Cocktail Room",
        "fecha_inspeccion": "2025-06-26",
        "visit_date": "2025-06-26",
        "compliance_score": 91,
        "global_score": 91,
        "stock_nivel": "adequate",
        "fotos_urls": ["https://placehold.co/400x300/1e293b/94a3b8?text=Cocktail+Room"],
        "brand_presence": "Media",
        "competitor_presence": "Alta",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "activacion_ejecutada": true,
        "observations": "Venue estratégico. Excelente nivel de servicio.",
        "btl_puntos_venta": { "id": "v14", "nombre": "Cocktail Room", "canal": "Premium Bar" }
    },
    {
        "id": "insp-43",
        "punto_venta_id": "v6",
        "venue_name": "Bodegón del Sur",
        "fecha_inspeccion": "2025-06-23",
        "visit_date": "2025-06-23",
        "compliance_score": 55,
        "global_score": 55,
        "stock_nivel": "critical",
        "fotos_urls": ["https://placehold.co/400x300/1e293b/94a3b8?text=Stock+Critico"],
        "brand_presence": "Alta",
        "competitor_presence": "Alta",
        "main_competitor": "Roku",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "activacion_ejecutada": false,
        "observations": "⚠️ Stock crítico. Requiere intervención urgente.",
        "btl_puntos_venta": { "id": "v6", "nombre": "Bodegón del Sur", "canal": "Restaurante" }
    },
    {
        "id": "insp-39",
        "punto_venta_id": "v12",
        "venue_name": "Sunset Bar",
        "fecha_inspeccion": "2025-06-19",
        "visit_date": "2025-06-19",
        "compliance_score": 97,
        "global_score": 97,
        "stock_nivel": "adequate",
        "fotos_urls": ["https://placehold.co/400x300/1e293b/94a3b8?text=Sunset+Top"],
        "brand_presence": "Media",
        "competitor_presence": "Media",
        "main_competitor": "Monkey 47",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "activacion_ejecutada": true,
        "observations": "Score máximo histórico. Referente de ejecución.",
        "btl_puntos_venta": { "id": "v12", "nombre": "Sunset Bar", "canal": "Premium Bar" }
    },
    {
        "id": "insp-13",
        "punto_venta_id": "v5",
        "venue_name": "Sky Lounge BA",
        "fecha_inspeccion": "2025-06-18",
        "visit_date": "2025-06-18",
        "compliance_score": 80,
        "global_score": 80,
        "stock_nivel": "adequate",
        "fotos_urls": [],
        "brand_presence": "Baja",
        "competitor_presence": "Baja",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "activacion_ejecutada": false,
        "observations": "Venue de alta rotación. Oportunidad de mejorar visibilidad.",
        "btl_puntos_venta": { "id": "v5", "nombre": "Sky Lounge BA", "canal": "Premium Bar" }
    },
    {
        "id": "insp-7",
        "punto_venta_id": "v11",
        "venue_name": "La Cantina",
        "fecha_inspeccion": "2025-03-26",
        "visit_date": "2025-03-26",
        "compliance_score": 67,
        "global_score": 67,
        "stock_nivel": "low",
        "fotos_urls": [],
        "brand_presence": "Alta",
        "competitor_presence": "Baja",
        "main_competitor": "Bombay Sapphire",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "activacion_ejecutada": false,
        "observations": "Stock bajo. Se sugiere activación BTL para reforzar presencia.",
        "btl_puntos_venta": { "id": "v11", "nombre": "La Cantina", "canal": "Restaurante" }
    },
    // ─── 5 Nuevas Inspecciones Demo: Heineken & Jack Daniel's ─────────────
    {
        "id": "insp-hk-01",
        "punto_venta_id": "v1",
        "venue_name": "La Terraza Premium",
        "producto_nombre": "Heineken",
        "fecha_inspeccion": "2026-03-28",
        "visit_date": "2026-03-28",
        "compliance_score": 92,
        "global_score": 92,
        "stock_nivel": "adequate",
        "fotos_urls": [
            "https://placehold.co/400x300/166534/86efac?text=Heineken+Terraza",
            "https://placehold.co/400x300/166534/86efac?text=Back+Bar"
        ],
        "brand_presence": "Alta",
        "competitor_presence": "Baja",
        "main_competitor": "Corona",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "activacion_ejecutada": true,
        "observations": "Heineken con presencia dominante en back bar. Material POP completo y en buen estado. Stock óptimo.",
        "btl_puntos_venta": { "id": "v1", "nombre": "La Terraza Premium", "canal": "Premium Bar" }
    },
    {
        "id": "insp-hk-02",
        "punto_venta_id": "v10",
        "venue_name": "Oasis Club",
        "producto_nombre": "Heineken",
        "fecha_inspeccion": "2026-03-25",
        "visit_date": "2026-03-25",
        "compliance_score": 58,
        "global_score": 58,
        "stock_nivel": "critical",
        "fotos_urls": [
            "https://placehold.co/400x300/7f1d1d/fca5a5?text=Stock+Critico"
        ],
        "brand_presence": "Baja",
        "competitor_presence": "Alta",
        "main_competitor": "Corona",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "activacion_ejecutada": false,
        "observations": "⚠️ Heineken: stock crítico. Sin material POP. Competencia Corona con alta presencia. Acción urgente requerida.",
        "btl_puntos_venta": { "id": "v10", "nombre": "Oasis Club", "canal": "Night Club" }
    },
    {
        "id": "insp-jd-01",
        "punto_venta_id": "v14",
        "venue_name": "Cocktail Room",
        "producto_nombre": "Jack Daniel's",
        "fecha_inspeccion": "2026-03-27",
        "visit_date": "2026-03-27",
        "compliance_score": 88,
        "global_score": 88,
        "stock_nivel": "adequate",
        "fotos_urls": [
            "https://placehold.co/400x300/1e293b/fbbf24?text=Jack+Daniel's+Bar",
            "https://placehold.co/400x300/1e293b/fbbf24?text=Menu+Display"
        ],
        "brand_presence": "Alta",
        "competitor_presence": "Media",
        "main_competitor": "Jim Beam",
        "tiene_producto": true,
        "tiene_material_pop": true,
        "activacion_ejecutada": true,
        "observations": "Jack Daniel's con excelente posicionamiento. Degustación ejecutada. Material POP en perfectas condiciones.",
        "btl_puntos_venta": { "id": "v14", "nombre": "Cocktail Room", "canal": "Premium Bar" }
    },
    {
        "id": "insp-jd-02",
        "punto_venta_id": "v3",
        "venue_name": "Discoteca Eclipse",
        "producto_nombre": "Jack Daniel's",
        "fecha_inspeccion": "2026-03-23",
        "visit_date": "2026-03-23",
        "compliance_score": 72,
        "global_score": 72,
        "stock_nivel": "low",
        "fotos_urls": [
            "https://placehold.co/400x300/1e293b/fbbf24?text=Eclipse+Bar"
        ],
        "brand_presence": "Media",
        "competitor_presence": "Alta",
        "main_competitor": "Jameson",
        "tiene_producto": true,
        "tiene_material_pop": false,
        "activacion_ejecutada": false,
        "observations": "Stock bajo de Jack Daniel's. Jameson con alta rotación. Se recomienda activación BTL y reposición.",
        "btl_puntos_venta": { "id": "v3", "nombre": "Discoteca Eclipse", "canal": "Night Club" }
    },
    {
        "id": "insp-jd-03",
        "punto_venta_id": "v5",
        "venue_name": "Sky Lounge BA",
        "producto_nombre": "Jack Daniel's",
        "fecha_inspeccion": "2026-03-20",
        "visit_date": "2026-03-20",
        "compliance_score": 50,
        "global_score": 50,
        "stock_nivel": "out_of_stock",
        "fotos_urls": [
            "https://placehold.co/400x300/7f1d1d/fca5a5?text=Sin+Stock"
        ],
        "brand_presence": "Baja",
        "competitor_presence": "Alta",
        "main_competitor": "Jameson",
        "tiene_producto": false,
        "tiene_material_pop": false,
        "activacion_ejecutada": false,
        "observations": "🚨 RIESGO: Jack Daniel's sin stock. Sin presencia de marca. Venue estratégico requiere atención inmediata.",
        "btl_puntos_venta": { "id": "v5", "nombre": "Sky Lounge BA", "canal": "Premium Bar" }
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
        "venue": "Bodeg├│n del Sur",
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
    // 🚨 DEMO MODE BYPASS — evita query a Supabase (RLS lo bloquea en demo)
    if (isDemo) {
      setRegions([
        { id: 'norte', nombre: 'Norte' },
        { id: 'sur', nombre: 'Sur' },
        { id: 'centro', nombre: 'Centro' },
      ]);
      return;
    }

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

      if (dateFilter !== 'all') { // Asumiendo que podr├¡a haber un filtro 'all' aunque no est├í en el state inicial
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
      // IMPORTANTE: currentInspections debe declararse ANTES del .map() para el cálculo de impacto
      const currentInspections = (inspectionsData || []) as any[];

      const getTicketStatus = (estado: string | null | undefined): 'success' | 'active' | 'scheduled' => {
        if (!estado) return 'scheduled';
        const s = estado.toLowerCase().trim();
        if (s === 'resuelto' || s === 'cerrado' || s === 'cerrada' || s === 'completado' || s === 'completada') return 'success';
        if (s === 'en_progreso' || s === 'en progreso' || s === 'en_curso') return 'active';
        return 'scheduled'; // 'abierto' u otros
      };

      const allActivations = (ticketsData || [])
        .map((t: any) => {
          const ticketStatus = getTicketStatus(t.estado);
          let impact = 'N/A';
          let numericImpact: number | null = null;

          if (ticketStatus === 'success') {
            const venueId = t.punto_venta_id;
            const actDate = new Date(t.fecha_activacion_solicitada || t.created_at);
            const venueInspections = currentInspections.filter((i: any) => i.punto_venta_id === venueId);
            const beforeInspections = venueInspections.filter((i: any) => new Date(i.fecha_inspeccion) <= actDate);
            const afterInspections = venueInspections.filter((i: any) => new Date(i.fecha_inspeccion) > actDate);
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
            impact,
            status: ticketStatus,
            rawDate: new Date(t.fecha_activacion_solicitada || t.created_at),
            numericImpact,
            asunto: t.asunto || null,
            titulo: t.titulo || null,
            descripcion: t.descripcion || null,
            tipo_activacion: t.tipo_activacion || null,
            notas: null,
            ubicacion: t.btl_puntos_venta?.nombre || null,
            presupuesto: null,
            productos_involucrados: t.productos_involucrados || null,
            tipo_material: t.tipo_material || null,
            cantidad_solicitada: t.cantidad_solicitada || null,
            marca_producto: t.marca_producto || null,
            fecha_entrega_requerida: t.fecha_entrega_requerida || null,
            prioridad: t.prioridad || null,
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


      const totalVenues = new Set(currentInspections.map((i: any) => i.punto_venta_id)).size;
      const avgCompliance = currentInspections.length > 0
        ? Math.round(currentInspections.reduce((acc: number, i: any) => acc + (i.compliance_score || 0), 0) / currentInspections.length)
        : 0;
      // Contar activaciones completadas desde tickets BTL
      const totalActivations = (ticketsData || []).filter((t: any) => getTicketStatus(t.estado) === 'success').length;

      setKpis({
        visitedVenues: totalVenues,
        visitedVenuesTrend: 0,
        compliance: avgCompliance,
        complianceTrend: 0,
        activations: totalActivations,
        activationsTrend: 0,
        roi: 0,
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
            label="1 A├▒o"
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
                label: `${Math.abs(kpis.visitedVenuesTrend)}% vs per├¡odo anterior`,
                color: getTrendColor(kpis.visitedVenuesTrend),
                icon: getTrendIcon(kpis.visitedVenuesTrend),
              }}
              color="blue"
            />
            <KPICard
              title="Cumplimiento Promedio"
              value={`${kpis.compliance.toFixed(1)}%`}
              icon={<Target className="w-6 h-6" />}
              trend={{
                value: kpis.complianceTrend,
                label: `${Math.abs(kpis.complianceTrend)}% vs per├¡odo anterior`,
                color: getTrendColor(kpis.complianceTrend),
                icon: getTrendIcon(kpis.complianceTrend),
              }}
              color="green"
            />
            <KPICard
              title="Activaciones Ejecutadas"
              value={kpis.activations.toString()}
              icon={<Users className="w-6 h-6" />}
              trend={{
                value: kpis.activationsTrend,
                label: kpis.activationsTrend !== 0 ? `${Math.abs(kpis.activationsTrend)}% vs per├¡odo anterior` : 'Sin datos anteriores',
                color: getTrendColor(kpis.activationsTrend),
                icon: getTrendIcon(kpis.activationsTrend),
              }}
              color="purple"
            />
            {/* ROI Card - Only show in Demo Mode or if we have real ROI data (which we don't yet) */}
            {isDemo && (
              <KPICard
                title="ROI Activaciones"
                value={`${kpis.roi}%`}
                icon={<DollarSign className="w-6 h-6" />}
                trend={{
                  value: kpis.roiTrend,
                  label: `${Math.abs(kpis.roiTrend)}% vs per├¡odo anterior`,
                  color: getTrendColor(kpis.roiTrend),
                  icon: getTrendIcon(kpis.roiTrend),
                }}
                color="amber"
              />
            )}
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
            console.log('­ƒù║´©Å Map selected venue:', venue);
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
