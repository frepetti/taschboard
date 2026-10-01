export interface InspectorVenueAssignment {
  id: string;
  inspector_id: string;
  punto_venta_id: string;
  created_at: string;
  inspector?: User;
  venue?: Venue;
}

export interface User {
  id: string;
  auth_user_id?: string;
  email: string;
  nombre: string;
  rol: 'inspector' | 'client' | 'admin';
  empresa?: string | null;
  telefono?: string | null;
  activo: boolean;
  estado_aprobacion?: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
}

export interface Venue {
  id: string;
  nombre: string;
  tipo: string | null;
  direccion: string | null;
  ciudad: string | null;
  region_id?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  contacto_nombre?: string | null;
  contacto_telefono?: string | null;
  segmento?: string | null;
  potencial_ventas?: string | null;
  global_score?: number;
  last_inspection_date?: string | null;
  created_at?: string;
}

export interface Inspection {
  id: string;
  punto_venta_id: string;
  usuario_id: string;
  producto_id?: string | null;
  fecha_inspeccion: string;
  tiene_producto: boolean;
  stock_nivel?: string | null;
  stock_unidades?: number | null;
  stock_estimado?: string | null;
  precio_venta?: number | null;
  en_promocion?: boolean;
  visibilidad_score?: number | null;
  global_score?: number;
  compliance_score?: number;
  tiene_material_pop?: boolean;
  material_pop_detalle?: string | null;
  material_pop_tipos?: string[] | null;
  temperatura_refrigeracion?: number | null;
  observaciones?: string | null;
  fotos_urls?: string[] | null;
  detalles?: any;
  created_at: string;
  btl_puntos_venta?: Venue;
  btl_productos?: any;
}
