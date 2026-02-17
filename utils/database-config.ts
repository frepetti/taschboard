/**
 * Configuración centralizada de base de datos
 * 
 * Este archivo contiene todas las constantes relacionadas con la estructura
 * de la base de datos para evitar errores de nombres de tablas y campos.
 */

/**
 * Nombres de tablas en Supabase
 */
export const TABLES = {
  INSPECCIONES: 'btl_inspecciones',
  PUNTOS_VENTA: 'btl_puntos_venta',
  USUARIOS: 'btl_usuarios',
  REPORTES: 'btl_reportes',
  ANALYTICS: 'btl_analytics',
  PRODUCTOS: 'btl_productos',
  CLIENTE_PRODUCTOS: 'btl_cliente_productos',
  INSPECCION_PRODUCTOS: 'btl_inspeccion_productos',
  CAPACITACIONES: 'btl_capacitaciones',
  CAPACITACION_ASISTENTES: 'btl_capacitacion_asistentes',
  TEMAS_CAPACITACION: 'btl_temas_capacitacion'
} as const;

/**
 * Campos de la tabla btl_inspecciones
 */
export const INSPECCIONES_FIELDS = {
  ID: 'id',
  PUNTO_VENTA_ID: 'punto_venta_id',
  USUARIO_ID: 'usuario_id',
  FECHA_INSPECCION: 'fecha_inspeccion',
  
  // Datos de inspección
  TIENE_PRODUCTO: 'tiene_producto',
  TIENE_MATERIAL_POP: 'tiene_material_pop',
  MATERIAL_POP_DETALLE: 'material_pop_detalle',
  TEMPERATURA_REFRIGERACION: 'temperatura_refrigeracion',
  STOCK_ESTIMADO: 'stock_estimado',
  OBSERVACIONES: 'observaciones',
  FOTOS_URLS: 'fotos_urls',
  
  // Activación BTL
  ACTIVACION_EJECUTADA: 'activacion_ejecutada',
  TIPO_ACTIVACION: 'tipo_activacion',
  PERSONAS_IMPACTADAS: 'personas_impactadas',
  
  // Métricas
  COMPLIANCE_SCORE: 'compliance_score',
  
  // Metadata
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
} as const;

/**
 * Campos de la tabla btl_puntos_venta
 */
export const PUNTOS_VENTA_FIELDS = {
  ID: 'id',
  NOMBRE: 'nombre',
  TIPO: 'tipo',
  DIRECCION: 'direccion',
  CIUDAD: 'ciudad',
  ESTADO: 'estado',
  CODIGO_POSTAL: 'codigo_postal',
  TELEFONO: 'telefono',
  EMAIL: 'email',
  LATITUD: 'latitud',
  LONGITUD: 'longitud',
  SEGMENTO: 'segmento',
  CADENA: 'cadena',
  CONTACTO_NOMBRE: 'contacto_nombre',
  CONTACTO_CARGO: 'contacto_cargo',
  HORARIO: 'horario',
  AFORO: 'aforo',
  TICKET_PROMEDIO: 'ticket_promedio',
  NOTAS: 'notas',
  ACTIVO: 'activo',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
} as const;

/**
 * Campos de la tabla btl_usuarios
 */
export const USUARIOS_FIELDS = {
  ID: 'id',
  AUTH_USER_ID: 'auth_user_id',
  NOMBRE: 'nombre',
  EMAIL: 'email',
  ROL: 'rol',
  ACTIVO: 'activo',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
} as const;

/**
 * Campos de la tabla btl_reportes
 */
export const REPORTES_FIELDS = {
  ID: 'id',
  USUARIO_ID: 'usuario_id',
  TIPO: 'tipo',
  ASUNTO: 'asunto',
  DESCRIPCION: 'descripcion',
  ESTADO: 'estado',
  PRIORIDAD: 'prioridad',
  CREATED_AT: 'created_at',
  UPDATED_AT: 'updated_at'
} as const;

/**
 * Tipos de datos para TypeScript
 */
export interface Inspeccion {
  id: string;
  punto_venta_id: string;
  usuario_id: string | null;
  fecha_inspeccion: string;
  tiene_producto: boolean;
  tiene_material_pop: boolean;
  material_pop_detalle: any;
  temperatura_refrigeracion: number | null;
  stock_estimado: string | null;
  observaciones: string | null;
  fotos_urls: string[];
  activacion_ejecutada: boolean;
  tipo_activacion: string | null;
  personas_impactadas: number | null;
  compliance_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface PuntoVenta {
  id: string;
  nombre: string;
  tipo: string;
  direccion: string;
  ciudad: string;
  estado: string;
  codigo_postal: string | null;
  telefono: string | null;
  email: string | null;
  latitud: number | null;
  longitud: number | null;
  segmento: string | null;
  cadena: string | null;
  contacto_nombre: string | null;
  contacto_cargo: string | null;
  horario: string | null;
  aforo: number | null;
  ticket_promedio: number | null;
  notas: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Usuario {
  id: string;
  auth_user_id: string;
  nombre: string;
  email: string;
  rol: 'admin' | 'inspector' | 'client';
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Reporte {
  id: string;
  usuario_id: string;
  tipo: string;
  asunto: string;
  descripcion: string;
  estado: 'open' | 'in-progress' | 'resolved' | 'closed';
  prioridad: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

/**
 * Roles de usuario
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  INSPECTOR: 'inspector',
  CLIENT: 'client'
} as const;

/**
 * Estados de tickets/reportes
 */
export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
} as const;

/**
 * Prioridades de tickets/reportes
 */
export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

/**
 * Tipos de puntos de venta
 */
export const VENUE_TYPES = {
  BAR: 'Bar',
  RESTAURANTE: 'Restaurante',
  DISCOTECA: 'Discoteca',
  CLUB: 'Club',
  LOUNGE: 'Lounge',
  HOTEL: 'Hotel',
  TIENDA: 'Tienda',
  SUPERMERCADO: 'Supermercado',
  OTRO: 'Otro'
} as const;

/**
 * Segmentos de mercado
 */
export const VENUE_SEGMENTS = {
  PREMIUM: 'Premium',
  MEDIO: 'Medio',
  POPULAR: 'Popular'
} as const;

/**
 * Helper para construir queries tipadas
 */
export const buildQuery = {
  /**
   * Obtener todas las inspecciones con joins
   */
  getAllInspections: () => ({
    table: TABLES.INSPECCIONES,
    select: `
      *,
      btl_puntos_venta (
        nombre,
        tipo,
        ciudad,
        segmento
      ),
      btl_usuarios (
        nombre,
        email
      )
    `
  }),

  /**
   * Obtener inspecciones de un usuario
   */
  getUserInspections: (userId: string) => ({
    table: TABLES.INSPECCIONES,
    select: '*',
    filter: { usuario_id: userId }
  }),

  /**
   * Obtener puntos de venta activos
   */
  getActiveVenues: () => ({
    table: TABLES.PUNTOS_VENTA,
    select: '*',
    filter: { activo: true }
  })
};

/**
 * Validadores de datos
 */
export const validators = {
  /**
   * Valida que un objeto tenga los campos requeridos de una inspección
   */
  isValidInspection: (data: any): data is Inspeccion => {
    return (
      typeof data.id === 'string' &&
      typeof data.punto_venta_id === 'string' &&
      typeof data.fecha_inspeccion === 'string'
    );
  },

  /**
   * Valida que un objeto tenga los campos requeridos de un punto de venta
   */
  isValidVenue: (data: any): data is PuntoVenta => {
    return (
      typeof data.id === 'string' &&
      typeof data.nombre === 'string' &&
      typeof data.tipo === 'string'
    );
  },

  /**
   * Valida que un rol sea válido
   */
  isValidRole: (role: string): role is keyof typeof USER_ROLES => {
    return Object.values(USER_ROLES).includes(role as any);
  }
};

export default {
  TABLES,
  INSPECCIONES_FIELDS,
  PUNTOS_VENTA_FIELDS,
  USUARIOS_FIELDS,
  REPORTES_FIELDS,
  USER_ROLES,
  TICKET_STATUS,
  TICKET_PRIORITY,
  VENUE_TYPES,
  VENUE_SEGMENTS,
  buildQuery,
  validators
};