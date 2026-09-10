// Dataset centralizado y estandarizado para Modo Demo
// Contiene exactamente 5 venues (v1 a v5) con datos completos de auditoría, pricing y competencia.

export interface DemoCompetitor {
  name: string;
  price: number;
  priceComparison: 'premium' | 'equal' | 'lower';
}

export interface DemoInspection {
  id: string;
  punto_venta_id: string;
  venue_name: string;
  fecha_inspeccion: string;
  visit_date: string;
  auditor_name: string;
  compliance_score: number;
  global_score: number;
  stock_nivel: 'adequate' | 'low' | 'critical' | 'out_of_stock';
  fotos_urls: string[];
  brand_presence: 'Alta' | 'Media' | 'Baja';
  competitor_presence: 'Alta' | 'Media' | 'Baja';
  main_competitor: string;
  tiene_producto: boolean;
  tiene_material_pop: boolean;
  activacion_ejecutada: boolean;
  precio_venta: number;
  precio_referencia: number;
  competitors: DemoCompetitor[];
  observations: string;
  observaciones?: string;
  btl_puntos_venta: {
    id: string;
    nombre: string;
    canal: string;
  };
  detalles: {
    staffKnowledge: string;
    certifiedBartenders: string | number;
    backBarSignage: string;
    stockLevel: string;
    shelfPosition: string;
    perfectServeAnswers?: Record<string, boolean>;
    properGlassware?: boolean;
    iceQuality?: boolean;
    correctGarnish?: boolean;
    premiumTonic?: boolean;
    serveRitual?: boolean;
  };
}

export interface DemoVenue {
  id: string;
  venue_name: string;
  nombre: string;
  zone: string;
  ciudad: string;
  direccion: string;
  contacto_telefono: string;
  lat: number;
  lng: number;
  type: 'strategic' | 'opportunity' | 'risk' | 'activated';
  tipo: string;
  channel: string;
  segmento: string;
  global_score: number;
  materialStatus: 'Completo' | 'Parcial' | 'Sin material';
  visitas: number;
}

export interface DemoActivation {
  id: string;
  venue: string;
  date: string;
  type: string;
  impact: string;
  status: 'success' | 'active' | 'scheduled';
}

export interface DemoVenueDetailResult {
  venue: {
    id: string;
    nombre: string;
    direccion: string;
    ciudad: string;
    tipo: string;
    contacto_telefono: string;
    global_score: number;
    channel: string;
    brandPresence: number;
    shareOfMenu?: number;
    actualPerfectServe?: number;
    observations?: string;
  };
  photos: string[];
  perfectServeScore: number;
  perfectServeChecklist: { item: string; status: boolean }[];
  avgProductScore: number | null;
  inspections: DemoInspection[];
}

// ─── 1. Los 5 Venues Estandarizados (v1 - v5) ─────────────────────────────
export const DEMO_VENUES: DemoVenue[] = [
  {
    id: 'v1',
    venue_name: 'La Terraza Premium',
    nombre: 'La Terraza Premium',
    zone: 'Palermo',
    ciudad: 'Buenos Aires',
    direccion: 'Av. del Libertador 4100, Palermo',
    contacto_telefono: '+54 11 4771-8899',
    lat: -34.5689,
    lng: -58.4305,
    type: 'strategic',
    tipo: 'Bar Premium',
    channel: 'Premium Bar',
    segmento: 'Premium Bar',
    global_score: 91,
    materialStatus: 'Completo',
    visitas: 2
  },
  {
    id: 'v2',
    venue_name: 'Bierhaus',
    nombre: 'Bierhaus',
    zone: 'Palermo',
    ciudad: 'Buenos Aires',
    direccion: 'Fitz Roy 1650, Palermo',
    contacto_telefono: '+54 11 4778-2233',
    lat: -34.5800,
    lng: -58.4200,
    type: 'activated',
    tipo: 'Cervecería',
    channel: 'Cervecería',
    segmento: 'Cervecería',
    global_score: 76,
    materialStatus: 'Completo',
    visitas: 2
  },
  {
    id: 'v3',
    venue_name: 'El Escondite',
    nombre: 'El Escondite',
    zone: 'San Telmo',
    ciudad: 'Buenos Aires',
    direccion: 'Defensa 820, San Telmo',
    contacto_telefono: '+54 11 4361-9922',
    lat: -34.6150,
    lng: -58.3700,
    type: 'opportunity',
    tipo: 'Bar',
    channel: 'Bar',
    segmento: 'Bar',
    global_score: 70,
    materialStatus: 'Parcial',
    visitas: 1
  },
  {
    id: 'v4',
    venue_name: 'Pub Los Amigos',
    nombre: 'Pub Los Amigos',
    zone: 'Belgrano',
    ciudad: 'Buenos Aires',
    direccion: 'Av. Cabildo 2100, Belgrano',
    contacto_telefono: '+54 11 4784-5511',
    lat: -34.5625,
    lng: -58.4602,
    type: 'strategic',
    tipo: 'Bar',
    channel: 'Bar',
    segmento: 'Bar',
    global_score: 90,
    materialStatus: 'Parcial',
    visitas: 1
  },
  {
    id: 'v5',
    venue_name: 'Bar Central',
    nombre: 'Bar Central',
    zone: 'Microcentro',
    ciudad: 'Buenos Aires',
    direccion: 'Florida 450, Microcentro',
    contacto_telefono: '+54 11 4322-1100',
    lat: -34.6037,
    lng: -58.3756,
    type: 'risk',
    tipo: 'Bar Tradicional',
    channel: 'Bar Tradicional',
    segmento: 'Bar Tradicional',
    global_score: 55,
    materialStatus: 'Sin material',
    visitas: 1
  }
];

// ─── 2. Inspecciones Históricas Detalladas con Pricing y Competencia ─────────
export const DEMO_INSPECTIONS: DemoInspection[] = [
  // v1 - La Terraza Premium (2 visitas: 92% y 90% -> avg 91%, Completo)
  {
    id: 'insp-v1-1',
    punto_venta_id: 'v1',
    venue_name: 'La Terraza Premium',
    fecha_inspeccion: '2026-03-24',
    visit_date: '2026-03-24',
    auditor_name: 'Carlos Gómez',
    compliance_score: 92,
    global_score: 92,
    stock_nivel: 'adequate',
    fotos_urls: [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=800&q=80'
    ],
    brand_presence: 'Alta',
    competitor_presence: 'Media',
    main_competitor: 'Tanqueray',
    tiene_producto: true,
    tiene_material_pop: true,
    activacion_ejecutada: true,
    precio_venta: 14500,
    precio_referencia: 14000,
    competitors: [
      { name: 'Tanqueray', price: 14000, priceComparison: 'equal' },
      { name: 'Monkey 47', price: 18500, priceComparison: 'premium' }
    ],
    observations: 'Excelente ejecución. Botella destacada en back bar principal y carta con perfect serve oficial.',
    observaciones: 'Excelente ejecución. Botella destacada en back bar principal y carta con perfect serve oficial.',
    btl_puntos_venta: { id: 'v1', nombre: 'La Terraza Premium', canal: 'Premium Bar' },
    detalles: {
      staffKnowledge: 'expert',
      certifiedBartenders: 'yes',
      backBarSignage: 'present',
      stockLevel: 'adequate',
      shelfPosition: 'eye_level',
      perfectServeAnswers: { glass: true, ice: true, garnish: true, tonic: true, ritual: true }
    }
  },
  {
    id: 'insp-v1-2',
    punto_venta_id: 'v1',
    venue_name: 'La Terraza Premium',
    fecha_inspeccion: '2026-02-15',
    visit_date: '2026-02-15',
    auditor_name: 'María Fernández',
    compliance_score: 90,
    global_score: 90,
    stock_nivel: 'adequate',
    fotos_urls: [
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80'
    ],
    brand_presence: 'Alta',
    competitor_presence: 'Baja',
    main_competitor: 'Bombay Sapphire',
    tiene_producto: true,
    tiene_material_pop: true,
    activacion_ejecutada: false,
    precio_venta: 14000,
    precio_referencia: 14000,
    competitors: [
      { name: 'Bombay Sapphire', price: 13500, priceComparison: 'lower' }
    ],
    observations: 'Stock en nivel óptimo. Cartelería de acrílico iluminada en barra.',
    observaciones: 'Stock en nivel óptimo. Cartelería de acrílico iluminada en barra.',
    btl_puntos_venta: { id: 'v1', nombre: 'La Terraza Premium', canal: 'Premium Bar' },
    detalles: {
      staffKnowledge: 'good',
      certifiedBartenders: 'yes',
      backBarSignage: 'present',
      stockLevel: 'adequate',
      shelfPosition: 'top_shelf',
      perfectServeAnswers: { glass: true, ice: true, garnish: true, tonic: false, ritual: true }
    }
  },

  // v2 - Bierhaus (2 visitas: 78% y 74% -> avg 76%, Completo)
  {
    id: 'insp-v2-1',
    punto_venta_id: 'v2',
    venue_name: 'Bierhaus',
    fecha_inspeccion: '2026-03-22',
    visit_date: '2026-03-22',
    auditor_name: 'Carlos Gómez',
    compliance_score: 78,
    global_score: 78,
    stock_nivel: 'adequate',
    fotos_urls: [
      'https://images.unsplash.com/photo-1538488881522-4321453a990a?auto=format&fit=crop&w=800&q=80'
    ],
    brand_presence: 'Alta',
    competitor_presence: 'Alta',
    main_competitor: 'Bombay Sapphire',
    tiene_producto: true,
    tiene_material_pop: true,
    activacion_ejecutada: true,
    precio_venta: 11500,
    precio_referencia: 12000,
    competitors: [
      { name: 'Bombay Sapphire', price: 11500, priceComparison: 'equal' }
    ],
    observations: 'Buena rotación. Material POP colocado en contrabarra.',
    observaciones: 'Buena rotación. Material POP colocado en contrabarra.',
    btl_puntos_venta: { id: 'v2', nombre: 'Bierhaus', canal: 'Cervecería' },
    detalles: {
      staffKnowledge: 'good',
      certifiedBartenders: 1,
      backBarSignage: 'present',
      stockLevel: 'adequate',
      shelfPosition: 'eye_level',
      perfectServeAnswers: { glass: true, ice: true, garnish: false, tonic: true, ritual: false }
    }
  },
  {
    id: 'insp-v2-2',
    punto_venta_id: 'v2',
    venue_name: 'Bierhaus',
    fecha_inspeccion: '2026-02-10',
    visit_date: '2026-02-10',
    auditor_name: 'Juan Pérez',
    compliance_score: 74,
    global_score: 74,
    stock_nivel: 'low',
    fotos_urls: [
      'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=800&q=80'
    ],
    brand_presence: 'Media',
    competitor_presence: 'Alta',
    main_competitor: 'Tanqueray',
    tiene_producto: true,
    tiene_material_pop: true,
    activacion_ejecutada: false,
    precio_venta: 11000,
    precio_referencia: 12000,
    competitors: [
      { name: 'Tanqueray', price: 12500, priceComparison: 'premium' }
    ],
    observations: 'Stock justo. Se solicita capacitación adicional de servicio para nuevo personal.',
    observaciones: 'Stock justo. Se solicita capacitación adicional de servicio para nuevo personal.',
    btl_puntos_venta: { id: 'v2', nombre: 'Bierhaus', canal: 'Cervecería' },
    detalles: {
      staffKnowledge: 'good',
      certifiedBartenders: 0,
      backBarSignage: 'present',
      stockLevel: 'low',
      shelfPosition: 'top_shelf',
      perfectServeAnswers: { glass: true, ice: false, garnish: true, tonic: false, ritual: true }
    }
  },

  // v3 - El Escondite (1 visita: 70%, Parcial)
  {
    id: 'insp-v3-1',
    punto_venta_id: 'v3',
    venue_name: 'El Escondite',
    fecha_inspeccion: '2026-03-21',
    visit_date: '2026-03-21',
    auditor_name: 'María Fernández',
    compliance_score: 70,
    global_score: 70,
    stock_nivel: 'low',
    fotos_urls: [
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
    ],
    brand_presence: 'Alta',
    competitor_presence: 'Baja',
    main_competitor: 'Monkey 47',
    tiene_producto: true,
    tiene_material_pop: false,
    activacion_ejecutada: false,
    precio_venta: 12500,
    precio_referencia: 13000,
    competitors: [
      { name: 'Monkey 47', price: 17000, priceComparison: 'premium' }
    ],
    observations: 'Producto en stock en salón. Sin material POP visible en punto de contacto.',
    observaciones: 'Producto en stock en salón. Sin material POP visible en punto de contacto.',
    btl_puntos_venta: { id: 'v3', nombre: 'El Escondite', canal: 'Bar' },
    detalles: {
      staffKnowledge: 'good',
      certifiedBartenders: 0,
      backBarSignage: 'missing',
      stockLevel: 'low',
      shelfPosition: 'top_shelf',
      perfectServeAnswers: { glass: true, ice: true, garnish: false, tonic: true, ritual: false }
    }
  },

  // v4 - Pub Los Amigos (1 visita: 90%, Parcial)
  {
    id: 'insp-v4-1',
    punto_venta_id: 'v4',
    venue_name: 'Pub Los Amigos',
    fecha_inspeccion: '2026-03-18',
    visit_date: '2026-03-18',
    auditor_name: 'Juan Pérez',
    compliance_score: 90,
    global_score: 90,
    stock_nivel: 'adequate',
    fotos_urls: [
      'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=800&q=80'
    ],
    brand_presence: 'Alta',
    competitor_presence: 'Media',
    main_competitor: 'Tanqueray',
    tiene_producto: true,
    tiene_material_pop: false,
    activacion_ejecutada: false,
    precio_venta: 13000,
    precio_referencia: 13000,
    competitors: [
      { name: 'Tanqueray', price: 13000, priceComparison: 'equal' }
    ],
    observations: 'Excelente ejecución de coctelería. Falta posavasos y cartelería de marca.',
    observaciones: 'Excelente ejecución de coctelería. Falta posavasos y cartelería de marca.',
    btl_puntos_venta: { id: 'v4', nombre: 'Pub Los Amigos', canal: 'Bar' },
    detalles: {
      staffKnowledge: 'expert',
      certifiedBartenders: 'yes',
      backBarSignage: 'missing',
      stockLevel: 'adequate',
      shelfPosition: 'eye_level',
      perfectServeAnswers: { glass: true, ice: true, garnish: true, tonic: true, ritual: true }
    }
  },

  // v5 - Bar Central (1 visita: 55%, Sin material)
  {
    id: 'insp-v5-1',
    punto_venta_id: 'v5',
    venue_name: 'Bar Central',
    fecha_inspeccion: '2026-03-12',
    visit_date: '2026-03-12',
    auditor_name: 'Carlos Gómez',
    compliance_score: 55,
    global_score: 55,
    stock_nivel: 'low',
    fotos_urls: [
      'https://images.unsplash.com/photo-1485686531765-ba63b07845a7?auto=format&fit=crop&w=800&q=80'
    ],
    brand_presence: 'Baja',
    competitor_presence: 'Alta',
    main_competitor: 'Aviation',
    tiene_producto: false,
    tiene_material_pop: false,
    activacion_ejecutada: false,
    precio_venta: 9500,
    precio_referencia: 11000,
    competitors: [
      { name: 'Aviation', price: 9000, priceComparison: 'lower' }
    ],
    observations: 'Sin stock al momento de la auditoría y sin presencia de material publicitario.',
    observaciones: 'Sin stock al momento de la auditoría y sin presencia de material publicitario.',
    btl_puntos_venta: { id: 'v5', nombre: 'Bar Central', canal: 'Bar Tradicional' },
    detalles: {
      staffKnowledge: 'basic',
      certifiedBartenders: 'no',
      backBarSignage: 'missing',
      stockLevel: 'out_of_stock',
      shelfPosition: 'bottom',
      perfectServeAnswers: { glass: false, ice: false, garnish: false, tonic: false, ritual: false }
    }
  }
];

// ─── 3. Activaciones Mock ──────────────────────────────────────────────────
export const DEMO_ACTIVATIONS: DemoActivation[] = [
  {
    id: 'act-1',
    venue: 'La Terraza Premium',
    date: '2026-03-24',
    type: 'Brand Experience',
    impact: '+24% ventas',
    status: 'success'
  },
  {
    id: 'act-2',
    venue: 'Bierhaus',
    date: '2026-03-22',
    type: 'Degustación Perfect Serve',
    impact: '+18% rotación',
    status: 'success'
  },
  {
    id: 'act-3',
    venue: 'Pub Los Amigos',
    date: '2026-04-05',
    type: 'Masterclass Coctelería',
    impact: 'Estimado +15%',
    status: 'scheduled'
  },
  {
    id: 'act-4',
    venue: 'El Escondite',
    date: '2026-04-12',
    type: 'Activación BTL Nocturna',
    impact: 'TBD',
    status: 'active'
  }
];

// ─── 4. KPIs Consolidados del Modo Demo ────────────────────────────────────
export const DEMO_KPIS = {
  visitedVenues: 5,
  visitedVenuesTrend: 15.0,
  compliance: 76.4,
  complianceTrend: 4.2,
  activations: 4,
  activationsTrend: 10.0,
  roi: 285.5,
  roiTrend: 16.2,
  totalRegisteredVenues: 5
};

// ─── 5. Dataset Histórico de Rendimiento de Marca (24 Meses: sep 24 a ago 26) ───
export interface DemoPerformanceMonthMetric {
  compliance: number; // Índice de Ejecución (0-100)
  presencia: number;  // Visibilidad / Presencia de Producto (0-100)
  material: number;   // Material POP (0-100)
  visitas: number;    // Visitas totales
}

export interface DemoPerformanceMonth {
  month: string;      // Label legible para eje X (ej: 'sep 25', 'ago 26')
  fullDate: string;   // 'YYYY-MM-DD'
  all: DemoPerformanceMonthMetric;
  norte: DemoPerformanceMonthMetric;
  sur: DemoPerformanceMonthMetric;
  centro: DemoPerformanceMonthMetric;
}

export const DEMO_PERFORMANCE_HISTORY: DemoPerformanceMonth[] = [
  // ── Período Anterior de Referencia (sep 24 a ago 25) ──
  {
    month: 'sep 24',
    fullDate: '2024-09-01',
    all: { compliance: 68, presencia: 71, material: 62, visitas: 75 },
    norte: { compliance: 70, presencia: 73, material: 64, visitas: 22 },
    sur: { compliance: 65, presencia: 68, material: 58, visitas: 18 },
    centro: { compliance: 69, presencia: 72, material: 63, visitas: 35 }
  },
  {
    month: 'oct 24',
    fullDate: '2024-10-01',
    all: { compliance: 69, presencia: 72, material: 63, visitas: 78 },
    norte: { compliance: 71, presencia: 74, material: 65, visitas: 23 },
    sur: { compliance: 66, presencia: 69, material: 59, visitas: 19 },
    centro: { compliance: 70, presencia: 73, material: 64, visitas: 36 }
  },
  {
    month: 'nov 24',
    fullDate: '2024-11-01',
    all: { compliance: 71, presencia: 73, material: 65, visitas: 84 },
    norte: { compliance: 73, presencia: 75, material: 67, visitas: 25 },
    sur: { compliance: 67, presencia: 70, material: 61, visitas: 20 },
    centro: { compliance: 72, presencia: 74, material: 66, visitas: 39 }
  },
  {
    month: 'dic 24',
    fullDate: '2024-12-01',
    all: { compliance: 73, presencia: 76, material: 68, visitas: 95 },
    norte: { compliance: 75, presencia: 78, material: 70, visitas: 28 },
    sur: { compliance: 70, presencia: 73, material: 64, visitas: 23 },
    centro: { compliance: 74, presencia: 77, material: 69, visitas: 44 }
  },
  {
    month: 'ene 25',
    fullDate: '2025-01-01',
    all: { compliance: 70, presencia: 74, material: 64, visitas: 80 },
    norte: { compliance: 72, presencia: 76, material: 66, visitas: 24 },
    sur: { compliance: 67, presencia: 70, material: 60, visitas: 19 },
    centro: { compliance: 71, presencia: 75, material: 65, visitas: 37 }
  },
  {
    month: 'feb 25',
    fullDate: '2025-02-01',
    all: { compliance: 71, presencia: 75, material: 66, visitas: 82 },
    norte: { compliance: 73, presencia: 77, material: 68, visitas: 24 },
    sur: { compliance: 68, presencia: 71, material: 62, visitas: 20 },
    centro: { compliance: 72, presencia: 76, material: 67, visitas: 38 }
  },
  {
    month: 'mar 25',
    fullDate: '2025-03-01',
    all: { compliance: 73, presencia: 76, material: 67, visitas: 86 },
    norte: { compliance: 75, presencia: 78, material: 69, visitas: 26 },
    sur: { compliance: 70, presencia: 73, material: 63, visitas: 21 },
    centro: { compliance: 74, presencia: 77, material: 68, visitas: 39 }
  },
  {
    month: 'abr 25',
    fullDate: '2025-04-01',
    all: { compliance: 72, presencia: 77, material: 68, visitas: 85 },
    norte: { compliance: 74, presencia: 79, material: 70, visitas: 25 },
    sur: { compliance: 69, presencia: 74, material: 64, visitas: 21 },
    centro: { compliance: 73, presencia: 78, material: 69, visitas: 39 }
  },
  {
    month: 'may 25',
    fullDate: '2025-05-01',
    all: { compliance: 74, presencia: 78, material: 69, visitas: 90 },
    norte: { compliance: 76, presencia: 80, material: 71, visitas: 27 },
    sur: { compliance: 71, presencia: 75, material: 65, visitas: 22 },
    centro: { compliance: 75, presencia: 79, material: 70, visitas: 41 }
  },
  {
    month: 'jun 25',
    fullDate: '2025-06-01',
    all: { compliance: 73, presencia: 79, material: 70, visitas: 88 },
    norte: { compliance: 75, presencia: 81, material: 72, visitas: 26 },
    sur: { compliance: 70, presencia: 76, material: 66, visitas: 21 },
    centro: { compliance: 74, presencia: 80, material: 71, visitas: 41 }
  },
  {
    month: 'jul 25',
    fullDate: '2025-07-01',
    all: { compliance: 75, presencia: 80, material: 71, visitas: 92 },
    norte: { compliance: 77, presencia: 82, material: 73, visitas: 28 },
    sur: { compliance: 72, presencia: 77, material: 67, visitas: 22 },
    centro: { compliance: 76, presencia: 81, material: 72, visitas: 42 }
  },
  {
    month: 'ago 25',
    fullDate: '2025-08-01',
    all: { compliance: 76, presencia: 81, material: 72, visitas: 94 },
    norte: { compliance: 78, presencia: 83, material: 74, visitas: 28 },
    sur: { compliance: 73, presencia: 78, material: 68, visitas: 23 },
    centro: { compliance: 77, presencia: 82, material: 73, visitas: 43 }
  },

  // ── Últimos 12 Meses Móviles Estandarizados (sep 25 a ago 26) ──
  {
    month: 'sep 25',
    fullDate: '2025-09-01',
    all: { compliance: 74, presencia: 80, material: 70, visitas: 95 },
    norte: { compliance: 76, presencia: 82, material: 72, visitas: 29 },
    sur: { compliance: 71, presencia: 77, material: 66, visitas: 23 },
    centro: { compliance: 75, presencia: 81, material: 71, visitas: 43 }
  },
  {
    month: 'oct 25',
    fullDate: '2025-10-01',
    all: { compliance: 75, presencia: 81, material: 71, visitas: 98 },
    norte: { compliance: 77, presencia: 83, material: 73, visitas: 30 },
    sur: { compliance: 72, presencia: 78, material: 67, visitas: 24 },
    centro: { compliance: 76, presencia: 82, material: 72, visitas: 44 }
  },
  {
    month: 'nov 25',
    fullDate: '2025-11-01',
    all: { compliance: 76, presencia: 82, material: 73, visitas: 104 },
    norte: { compliance: 78, presencia: 84, material: 75, visitas: 32 },
    sur: { compliance: 73, presencia: 79, material: 69, visitas: 25 },
    centro: { compliance: 77, presencia: 83, material: 74, visitas: 47 }
  },
  {
    month: 'dic 25',
    fullDate: '2025-12-01',
    all: { compliance: 78, presencia: 85, material: 75, visitas: 118 },
    norte: { compliance: 80, presencia: 87, material: 77, visitas: 36 },
    sur: { compliance: 75, presencia: 82, material: 71, visitas: 29 },
    centro: { compliance: 79, presencia: 86, material: 76, visitas: 53 }
  },
  {
    month: 'ene 26',
    fullDate: '2026-01-01',
    all: { compliance: 75, presencia: 82, material: 72, visitas: 100 },
    norte: { compliance: 77, presencia: 84, material: 74, visitas: 31 },
    sur: { compliance: 72, presencia: 79, material: 68, visitas: 24 },
    centro: { compliance: 76, presencia: 83, material: 73, visitas: 45 }
  },
  {
    month: 'feb 26',
    fullDate: '2026-02-01',
    all: { compliance: 76, presencia: 83, material: 73, visitas: 105 },
    norte: { compliance: 78, presencia: 85, material: 75, visitas: 32 },
    sur: { compliance: 73, presencia: 80, material: 69, visitas: 26 },
    centro: { compliance: 77, presencia: 84, material: 74, visitas: 47 }
  },
  {
    month: 'mar 26',
    fullDate: '2026-03-01',
    all: { compliance: 78, presencia: 84, material: 74, visitas: 110 },
    norte: { compliance: 80, presencia: 86, material: 76, visitas: 34 },
    sur: { compliance: 75, presencia: 81, material: 70, visitas: 27 },
    centro: { compliance: 79, presencia: 85, material: 75, visitas: 49 }
  },
  {
    month: 'abr 26',
    fullDate: '2026-04-01',
    all: { compliance: 77, presencia: 85, material: 75, visitas: 112 },
    norte: { compliance: 79, presencia: 87, material: 77, visitas: 34 },
    sur: { compliance: 74, presencia: 82, material: 71, visitas: 27 },
    centro: { compliance: 78, presencia: 86, material: 76, visitas: 51 }
  },
  {
    month: 'may 26',
    fullDate: '2026-05-01',
    all: { compliance: 79, presencia: 86, material: 76, visitas: 115 },
    norte: { compliance: 81, presencia: 88, material: 78, visitas: 35 },
    sur: { compliance: 76, presencia: 83, material: 72, visitas: 28 },
    centro: { compliance: 80, presencia: 87, material: 77, visitas: 52 }
  },
  {
    month: 'jun 26',
    fullDate: '2026-06-01',
    all: { compliance: 80, presencia: 87, material: 77, visitas: 120 },
    norte: { compliance: 82, presencia: 89, material: 79, visitas: 37 },
    sur: { compliance: 77, presencia: 84, material: 73, visitas: 29 },
    centro: { compliance: 81, presencia: 88, material: 78, visitas: 54 }
  },
  {
    month: 'jul 26',
    fullDate: '2026-07-01',
    all: { compliance: 81, presencia: 88, material: 78, visitas: 122 },
    norte: { compliance: 83, presencia: 90, material: 80, visitas: 37 },
    sur: { compliance: 78, presencia: 85, material: 74, visitas: 30 },
    centro: { compliance: 82, presencia: 89, material: 79, visitas: 55 }
  },
  {
    month: 'ago 26',
    fullDate: '2026-08-01',
    all: { compliance: 82, presencia: 89, material: 79, visitas: 125 },
    norte: { compliance: 84, presencia: 91, material: 81, visitas: 38 },
    sur: { compliance: 79, presencia: 86, material: 75, visitas: 31 },
    centro: { compliance: 83, presencia: 90, material: 80, visitas: 56 }
  }
];

// Helper para obtener y rebanar datos de rendimiento según filtros de tiempo y región
export function getDemoPerformanceData(dateFilter: string = '6M', regionFilter: string = 'all') {
  const normRegion = (regionFilter || 'all').toLowerCase().trim();
  const regionKey: 'all' | 'norte' | 'sur' | 'centro' =
    normRegion === 'norte' || normRegion === 'sur' || normRegion === 'centro'
      ? normRegion
      : 'all';

  const mapped = DEMO_PERFORMANCE_HISTORY.map(item => ({
    month: item.month,
    fullDate: item.fullDate,
    compliance: item[regionKey].compliance,
    presencia: item[regionKey].presencia,
    material: item[regionKey].material,
    visitas: item[regionKey].visitas,
  }));

  let n = 6;
  if (dateFilter === '1M') n = 1;
  else if (dateFilter === '3M') n = 3;
  else if (dateFilter === '6M') n = 6;
  else if (dateFilter === '1Y') n = 12;
  else if (dateFilter === 'YTD') n = 8; // Ene 26 a Ago 26

  const total = mapped.length; // 24
  const currentData = mapped.slice(total - n);
  const previousData = mapped.slice(Math.max(0, total - (2 * n)), total - n);

  return {
    currentData,
    previousData,
    monthsCount: currentData.length,
    cutOffPoint: currentData[currentData.length - 1]
  };
}

// ─── 6. Objeto General DEMO_DATA exportado ─────────────────────────────────
export const DEMO_DATA = {
  kpis: DEMO_KPIS,
  demoVenues: DEMO_VENUES,
  inspections: DEMO_INSPECTIONS,
  activations: DEMO_ACTIVATIONS,
  performanceHistory: DEMO_PERFORMANCE_HISTORY
};

// ─── 6. Función Helper para Detalle de Venue en Memoria ─────────────────────
export function getDemoVenueDetail(venueId: string): DemoVenueDetailResult {
  // Buscar el venue solicitado; si no existe, aplicar fallback seguro al primer venue (v1)
  const targetVenue = DEMO_VENUES.find(v => v.id === venueId) || DEMO_VENUES[0];

  // Obtener las inspecciones correspondientes a este venue
  const venueInspections = DEMO_INSPECTIONS.filter(i => i.punto_venta_id === targetVenue.id);
  const latestInsp = venueInspections[0] || DEMO_INSPECTIONS[0];

  // Checklist derivado de detalles de la última inspección
  const d = latestInsp.detalles;
  const checklist = [
    { item: 'Conocimiento del Staff', status: d.staffKnowledge === 'expert' || d.staffKnowledge === 'good' },
    { item: 'Bartenders Capacitados', status: d.certifiedBartenders === 'yes' || (typeof d.certifiedBartenders === 'number' && d.certifiedBartenders > 0) },
    { item: 'Material POP Visible', status: d.backBarSignage !== 'missing' },
    { item: 'Stock Adecuado', status: d.stockLevel !== 'critical' && d.stockLevel !== 'out_of_stock' },
    { item: 'Ubicación en Estante', status: d.shelfPosition === 'eye_level' || d.shelfPosition === 'top_shelf' }
  ];

  const passedCount = checklist.filter(c => c.status).length;
  const perfectServeScore = checklist.length > 0 ? Math.round((passedCount / checklist.length) * 100) : 0;

  const avgProductScore = venueInspections.length > 0
    ? Math.round(venueInspections.reduce((acc, curr) => acc + curr.compliance_score, 0) / venueInspections.length)
    : targetVenue.global_score;

  return {
    venue: {
      id: targetVenue.id,
      nombre: targetVenue.nombre,
      direccion: targetVenue.direccion,
      ciudad: targetVenue.ciudad,
      tipo: targetVenue.tipo,
      contacto_telefono: targetVenue.contacto_telefono,
      global_score: targetVenue.global_score,
      channel: targetVenue.channel,
      brandPresence: latestInsp.tiene_producto ? 100 : 0,
      shareOfMenu: 24,
      actualPerfectServe: perfectServeScore,
      observations: latestInsp.observations
    },
    photos: latestInsp.fotos_urls.length > 0 ? latestInsp.fotos_urls : [
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80'
    ],
    perfectServeScore,
    perfectServeChecklist: checklist,
    avgProductScore,
    inspections: venueInspections
  };
}

// ─── 8. Dataset de Capacitación por Venue para Modo Demo ──────────────────
export interface DemoVenueTraining {
  id: string;
  nombre: string;
  direccion: string | null;
  ciudad: string | null;
  tipo: string | null;
  trainedStaff: number;
  totalStaff: number;
  lastTrainingDate?: string;
  hasTrained: boolean;
  region_id?: string;
}

export const DEMO_VENUE_TRAININGS: DemoVenueTraining[] = [
  {
    id: 'v1',
    nombre: 'La Terraza Premium',
    direccion: 'Av. del Libertador 4100, Palermo',
    ciudad: 'Buenos Aires',
    tipo: 'Bar Premium',
    trainedStaff: 3,
    totalStaff: 3,
    lastTrainingDate: '2026-03-15T14:00:00Z',
    hasTrained: true,
    region_id: 'norte'
  },
  {
    id: 'v2',
    nombre: 'Bierhaus',
    direccion: 'Fitz Roy 1650, Palermo',
    ciudad: 'Buenos Aires',
    tipo: 'Cervecería',
    trainedStaff: 2,
    totalStaff: 4,
    lastTrainingDate: '2026-02-20T10:00:00Z',
    hasTrained: true,
    region_id: 'norte'
  },
  {
    id: 'v3',
    nombre: 'El Escondite',
    direccion: 'Defensa 820, San Telmo',
    ciudad: 'Buenos Aires',
    tipo: 'Bar',
    trainedStaff: 0,
    totalStaff: 2,
    hasTrained: false,
    region_id: 'sur'
  },
  {
    id: 'v4',
    nombre: 'Pub Los Amigos',
    direccion: 'Av. Cabildo 2100, Belgrano',
    ciudad: 'Buenos Aires',
    tipo: 'Bar',
    trainedStaff: 2,
    totalStaff: 2,
    lastTrainingDate: '2026-03-10T16:30:00Z',
    hasTrained: true,
    region_id: 'norte'
  },
  {
    id: 'v5',
    nombre: 'Bar Central',
    direccion: 'Florida 450, Microcentro',
    ciudad: 'Buenos Aires',
    tipo: 'Bar Tradicional',
    trainedStaff: 0,
    totalStaff: 3,
    hasTrained: false,
    region_id: 'centro'
  }
];

export function getDemoTrainingData(regionFilter?: string): {
  venues: DemoVenueTraining[];
  stats: {
    totalVenues: number;
    venuesWithTraining: number;
    venuesWithoutTraining: number;
    percentageTrained: number;
    totalTrainings: number;
    totalAttendees: number;
  };
} {
  let filtered = DEMO_VENUE_TRAININGS;
  if (regionFilter && regionFilter !== 'all') {
    const regLower = regionFilter.toLowerCase();
    filtered = filtered.filter(v => v.region_id === regLower || v.direccion?.toLowerCase().includes(regLower));
  }

  const totalVenues = filtered.length;
  const venuesWithTraining = filtered.filter(v => v.hasTrained).length;
  const venuesWithoutTraining = totalVenues - venuesWithTraining;
  const percentageTrained = totalVenues > 0 ? (venuesWithTraining / totalVenues) * 100 : 0;
  const totalAttendees = filtered.reduce((acc, v) => acc + v.trainedStaff, 0);

  return {
    venues: filtered,
    stats: {
      totalVenues,
      venuesWithTraining,
      venuesWithoutTraining,
      percentageTrained,
      totalTrainings: venuesWithTraining > 0 ? 4 : 0,
      totalAttendees
    }
  };
}
