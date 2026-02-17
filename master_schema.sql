-- ==============================================================================
-- MASTER SCHEMA: BTL DASHBOARD SAAS (Complete Database Reconstruction)
-- ==============================================================================
-- Fecha: 2026-02-15
-- Descripción: Script maestro para generar toda la estructura de base de datos.
--              Incluye tablas, relaciones, políticas RLS, triggers y funciones.
--              Ejecutar este script en el SQL Editor de Supabase.
-- ==============================================================================

-- 1. CONFIGURACIÓN INICIAL Y EXTENSIONES
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Limpieza de tablas existentes (CASCADE asegura que se borren dependencias)
-- ⚠️ CUIDADO: ESTO BORRARÁ TODOS LOS DATOS EXISTENTES
DROP TABLE IF EXISTS btl_ticket_comentarios CASCADE;
DROP TABLE IF EXISTS btl_reportes CASCADE;
DROP TABLE IF EXISTS btl_inspeccion_productos CASCADE;
DROP TABLE IF EXISTS btl_inspecciones CASCADE;
DROP TABLE IF EXISTS btl_cliente_productos CASCADE;
DROP TABLE IF EXISTS btl_clientes_venues CASCADE;
DROP TABLE IF EXISTS btl_puntos_venta CASCADE;
DROP TABLE IF EXISTS btl_capacitacion_asistentes CASCADE;
DROP TABLE IF EXISTS btl_capacitaciones CASCADE;
DROP TABLE IF EXISTS btl_temas_capacitacion CASCADE;
DROP TABLE IF EXISTS btl_productos CASCADE;
DROP TABLE IF EXISTS btl_regiones CASCADE;
DROP TABLE IF EXISTS btl_usuarios CASCADE;

-- 2. TABLA DE USUARIOS (PERFILES)
-- ==============================================================================
CREATE TABLE btl_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('inspector', 'client', 'admin')),
  empresa TEXT,
  telefono TEXT,
  activo BOOLEAN DEFAULT true,
  
  -- Sistema de Aprobación
  estado_aprobacion TEXT DEFAULT 'pending' CHECK (estado_aprobacion IN ('pending', 'approved', 'rejected')),
  aprobado_por UUID REFERENCES btl_usuarios(id), -- Self-reference is fine here as it's nullable initially
  fecha_aprobacion TIMESTAMPTZ,
  nota_rechazo TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_btl_usuarios_auth_user_id ON btl_usuarios(auth_user_id);
CREATE INDEX idx_btl_usuarios_email ON btl_usuarios(email);
CREATE INDEX idx_btl_usuarios_rol ON btl_usuarios(rol);
CREATE INDEX idx_btl_usuarios_estado_aprobacion ON btl_usuarios(estado_aprobacion);

-- 3. TABLA DE REGIONES
-- ==============================================================================
CREATE TABLE btl_regiones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE PUNTOS DE VENTA (VENUES)
-- ==============================================================================
CREATE TABLE btl_puntos_venta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  tipo TEXT, -- Bar, Restaurante, Discoteca, etc.
  direccion TEXT,
  ciudad TEXT,
  region_id UUID REFERENCES btl_regiones(id),
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  contacto_nombre TEXT,
  contacto_telefono TEXT,
  segmento TEXT, -- Premium, Estándar, Masivo
  potencial_ventas TEXT, -- Alto, Medio, Bajo
  created_by UUID REFERENCES btl_usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_btl_puntos_venta_ciudad ON btl_puntos_venta(ciudad);
CREATE INDEX idx_btl_puntos_venta_region ON btl_puntos_venta(region_id);
CREATE INDEX idx_btl_puntos_venta_tipo ON btl_puntos_venta(tipo);

-- 5. TABLA DE PRODUCTOS
-- ==============================================================================
CREATE TABLE btl_productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL,
  marca VARCHAR(255) NOT NULL,
  categoria VARCHAR(100), -- Cerveza, Whisky, Vodka, etc.
  subcategoria VARCHAR(100), -- Premium, Estándar
  sku VARCHAR(100) UNIQUE,
  codigo_barras VARCHAR(100),
  presentacion VARCHAR(100),
  logo_url TEXT,
  color_primario VARCHAR(7),
  color_secundario VARCHAR(7),
  objetivo_presencia DECIMAL(5,2) DEFAULT 0,
  objetivo_stock DECIMAL(5,2) DEFAULT 0,
  objetivo_pop DECIMAL(5,2) DEFAULT 0,
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  orden_visualizacion INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_productos_marca ON btl_productos(marca);

-- 6. TABLA DE CAPACITACIONES
-- ==============================================================================
CREATE TABLE btl_capacitaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  objetivo TEXT,
  categoria VARCHAR(100),
  tipo VARCHAR(50),
  nivel VARCHAR(50) DEFAULT 'Básico',
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  duracion_horas DECIMAL(5,2),
  modalidad VARCHAR(50),
  ubicacion VARCHAR(255),
  plataforma VARCHAR(100),
  link_sesion TEXT,
  instructor_nombre VARCHAR(255),
  cupo_maximo INTEGER,
  cupo_minimo INTEGER DEFAULT 1,
  material_urls TEXT[],
  certificado_emitido BOOLEAN DEFAULT FALSE,
  temas TEXT[],
  productos_relacionados UUID[], -- IDs visuales
  costo_total DECIMAL(10,2),
  estado VARCHAR(50) DEFAULT 'programada',
  asistencia_esperada INTEGER,
  asistencia_real INTEGER,
  porcentaje_asistencia DECIMAL(5,2),
  promedio_calificacion DECIMAL(5,2),
  creado_por UUID REFERENCES btl_usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE INSPECCIONES
-- ==============================================================================
CREATE TABLE btl_inspecciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  punto_venta_id UUID NOT NULL REFERENCES btl_puntos_venta(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES btl_usuarios(id) ON DELETE CASCADE,
  fecha_inspeccion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Datos generales
  tiene_producto BOOLEAN DEFAULT false,
  tiene_material_pop BOOLEAN DEFAULT false,
  material_pop_detalle TEXT,
  temperatura_refrigeracion NUMERIC(5,2),
  stock_estimado TEXT, -- 'Alto', 'Medio', 'Bajo', 'Agotado'
  observaciones TEXT,
  fotos_urls TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inspecciones_punto_venta ON btl_inspecciones(punto_venta_id);
CREATE INDEX idx_inspecciones_usuario ON btl_inspecciones(usuario_id);
CREATE INDEX idx_inspecciones_fecha ON btl_inspecciones(fecha_inspeccion DESC);

-- 8. TABLA DE REPORTES (TICKETS)
-- ==============================================================================
CREATE TABLE btl_reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creado_por UUID REFERENCES btl_usuarios(id),
  asignado_a UUID REFERENCES btl_usuarios(id),
  
  -- Clasificación
  categoria VARCHAR(50) DEFAULT 'general', -- general, capacitacion, accion_btl, material_pop
  tipo TEXT NOT NULL CHECK (tipo IN ('soporte', 'incidencia', 'mejora', 'consulta', 'Solicitud')), -- 'Solicitud' added for compatibility
  subcategoria VARCHAR(100),
  prioridad TEXT DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'critica')),
  estado TEXT DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_progreso', 'resuelto', 'cerrado')),
  urgente BOOLEAN DEFAULT FALSE,
  
  -- Contenido
  asunto VARCHAR(255),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  archivos_adjuntos TEXT[],
  
  -- Referencias Contextuales
  punto_venta_id UUID REFERENCES btl_puntos_venta(id),
  inspeccion_id UUID REFERENCES btl_inspecciones(id), -- Changed from visita_id
  capacitacion_id UUID REFERENCES btl_capacitaciones(id),
  
  -- Datos Específicos (Acciones BTL / POP)
  tipo_activacion VARCHAR(100),
  fecha_activacion_solicitada TIMESTAMPTZ,
  productos_involucrados UUID[],
  tipo_material VARCHAR(100),
  cantidad_solicitada INTEGER,
  marca_producto VARCHAR(255),
  fecha_entrega_requerida TIMESTAMPTZ,
  
  -- Seguimiento
  fecha_resolucion TIMESTAMPTZ,
  fecha_aprobacion TIMESTAMPTZ,
  fecha_rechazo TIMESTAMPTZ,
  motivo_rechazo TEXT,
  calificacion_servicio DECIMAL(3,1),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_btl_reportes_estado ON btl_reportes(estado);
CREATE INDEX idx_btl_reportes_creado_por ON btl_reportes(creado_por);

-- 9. TABLAS DE RELACIÓN (M2M) Y DETALLES
-- ==============================================================================

-- Comentarios en Tickets
CREATE TABLE btl_ticket_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES btl_reportes(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES btl_usuarios(id),
  comentario TEXT NOT NULL,
  es_interno BOOLEAN DEFAULT FALSE,
  archivos_adjuntos TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clientes <-> Venues (Asignación)
CREATE TABLE btl_clientes_venues (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID REFERENCES btl_usuarios(id) ON DELETE CASCADE,
    venue_id UUID REFERENCES btl_puntos_venta(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(cliente_id, venue_id)
);

-- Clientes <-> Productos (Preferencias)
CREATE TABLE btl_cliente_productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES btl_usuarios(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES btl_productos(id) ON DELETE CASCADE,
  visible_dashboard BOOLEAN DEFAULT TRUE,
  orden INTEGER DEFAULT 0,
  objetivo_presencia_custom DECIMAL(5,2),
  objetivo_stock_custom DECIMAL(5,2),
  objetivo_pop_custom DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(usuario_id, producto_id)
);

-- Inspección <-> Productos (Detalle)
CREATE TABLE btl_inspeccion_productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspeccion_id UUID NOT NULL REFERENCES btl_inspecciones(id) ON DELETE CASCADE,
  producto_id UUID NOT NULL REFERENCES btl_productos(id) ON DELETE CASCADE,
  tiene_producto BOOLEAN DEFAULT FALSE,
  stock_nivel VARCHAR(50),
  stock_unidades INTEGER,
  tiene_material_pop BOOLEAN DEFAULT FALSE,
  material_pop_tipos TEXT[],
  precio_venta DECIMAL(10,2),
  en_promocion BOOLEAN DEFAULT FALSE,
  visibilidad_score DECIMAL(5,2),
  observaciones TEXT,
  fotos_urls TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(inspeccion_id, producto_id)
);

-- Capacitación <-> Asistentes
CREATE TABLE btl_capacitacion_asistentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capacitacion_id UUID NOT NULL REFERENCES btl_capacitaciones(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES btl_usuarios(id) ON DELETE CASCADE,
  estado_inscripcion VARCHAR(50) DEFAULT 'inscrito',
  asistio BOOLEAN,
  calificacion_evaluacion DECIMAL(5,2),
  aprobo BOOLEAN,
  calificacion_capacitacion DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(capacitacion_id, usuario_id)
);

-- Temas Capacitación (Catálogo)
CREATE TABLE btl_temas_capacitacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  categoria VARCHAR(100),
  descripcion TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. FUNCIONES Y TRIGGERS (LÓGICA DE NEGOCIO)
-- ==============================================================================

-- Función genérica para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers updated_at
CREATE TRIGGER update_btl_usuarios_time BEFORE UPDATE ON btl_usuarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_btl_venues_time BEFORE UPDATE ON btl_puntos_venta FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_btl_prods_time BEFORE UPDATE ON btl_productos FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_btl_inspec_time BEFORE UPDATE ON btl_inspecciones FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_btl_reportes_time BEFORE UPDATE ON btl_reportes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Auto-aprobación de Admins
CREATE OR REPLACE FUNCTION auto_approve_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.rol = 'admin' AND NEW.estado_aprobacion = 'pending' THEN
    NEW.estado_aprobacion := 'approved';
    NEW.fecha_aprobacion := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_approve_admin
  BEFORE INSERT ON btl_usuarios
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_admin();

-- 11. ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Habilitar RLS en todo
ALTER TABLE btl_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE btl_regiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE btl_puntos_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE btl_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE btl_capacitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE btl_inspecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE btl_reportes ENABLE ROW LEVEL SECURITY;
ALTER TABLE btl_ticket_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE btl_clientes_venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE btl_cliente_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE btl_inspeccion_productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE btl_capacitacion_asistentes ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS GENERALES

-- Usuarios: Ver propio perfil o ser Admin
CREATE POLICY users_read_own ON btl_usuarios FOR SELECT USING (
  auth.uid() = auth_user_id OR EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'admin')
);
CREATE POLICY users_update_own ON btl_usuarios FOR UPDATE USING (
  auth.uid() = auth_user_id OR EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'admin')
);
-- Nota: La inserción inicial la hace el trigger o service role, pero permitimos insert a authenticated para el flujo de signup si no se usa trigger
CREATE POLICY users_insert_self ON btl_usuarios FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- Regiones: Todos ven, Admins editan
CREATE POLICY regiones_read_all ON btl_regiones FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY regiones_admin_all ON btl_regiones FOR ALL USING (EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'admin'));

-- Productos: Todos ven, Admins editan
CREATE POLICY productos_read_all ON btl_productos FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY productos_admin_all ON btl_productos FOR ALL USING (EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'admin'));

-- Venues: Admins ven todo, Clientes ven asignados, Inspectores ven todo (para trabajar)
CREATE POLICY venues_admin_all ON btl_puntos_venta FOR ALL USING (EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'admin'));
CREATE POLICY venues_inspector_read ON btl_puntos_venta FOR SELECT USING (EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'inspector'));
CREATE POLICY venues_client_read ON btl_puntos_venta FOR SELECT USING (
  EXISTS (SELECT 1 FROM btl_clientes_venues cv 
          JOIN btl_usuarios u ON u.id = cv.cliente_id 
          WHERE u.auth_user_id = auth.uid() AND cv.venue_id = btl_puntos_venta.id)
);

-- Inspecciones: Admins todo, Clientes ven todas (global dashboard) o filtrado (UI), Inspectores crean/ven
-- Inspecciones: Admins todo, Clientes ven (global dashboard), Inspectores solo propias
CREATE POLICY inspecciones_admin_all ON btl_inspecciones FOR ALL USING (EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'admin'));

-- Clientes: Ven todas si son para dashboard global, o restringir si es necesario. 
-- Asumiendo que clientes deben ver todo el panorama:
CREATE POLICY inspecciones_read_client ON btl_inspecciones FOR SELECT USING (EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'client'));

-- Inspectores: Solo ven las suyas y crean las suyas
CREATE POLICY inspecciones_read_own ON btl_inspecciones FOR SELECT USING (usuario_id IN (SELECT id FROM btl_usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY inspecciones_create_inspector ON btl_inspecciones FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'inspector') AND
  usuario_id IN (SELECT id FROM btl_usuarios WHERE auth_user_id = auth.uid())
);
CREATE POLICY inspecciones_update_own ON btl_inspecciones FOR UPDATE USING (usuario_id IN (SELECT id FROM btl_usuarios WHERE auth_user_id = auth.uid()));

-- Reportes (Tickets): Admins todo, Usuarios ven/crean propios
CREATE POLICY reportes_admin_all ON btl_reportes FOR ALL USING (EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'admin'));
CREATE POLICY reportes_read_own ON btl_reportes FOR SELECT USING (creado_por IN (SELECT id FROM btl_usuarios WHERE auth_user_id = auth.uid()));
CREATE POLICY reportes_create_own ON btl_reportes FOR INSERT WITH CHECK (creado_por IN (SELECT id FROM btl_usuarios WHERE auth_user_id = auth.uid()));

-- Comentarios Tickets:
CREATE POLICY comentarios_admin_all ON btl_ticket_comentarios FOR ALL USING (EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'admin'));
CREATE POLICY comentarios_read ON btl_ticket_comentarios FOR SELECT USING (
   usuario_id IN (SELECT id FROM btl_usuarios WHERE auth_user_id = auth.uid()) OR
   (es_interno = FALSE AND EXISTS (SELECT 1 FROM btl_reportes WHERE id = ticket_id AND creado_por IN (SELECT id FROM btl_usuarios WHERE auth_user_id = auth.uid())))
);
CREATE POLICY comentarios_create ON btl_ticket_comentarios FOR INSERT WITH CHECK (usuario_id IN (SELECT id FROM btl_usuarios WHERE auth_user_id = auth.uid()));

-- Clientes Venues (Asignación):
CREATE POLICY clientes_venues_admin_all ON btl_clientes_venues FOR ALL USING (EXISTS (SELECT 1 FROM btl_usuarios WHERE auth_user_id = auth.uid() AND rol = 'admin'));
CREATE POLICY clientes_venues_read_own ON btl_clientes_venues FOR SELECT USING (cliente_id IN (SELECT id FROM btl_usuarios WHERE auth_user_id = auth.uid()));

-- 12. DATA SEEDING (BÁSICO)
-- ==============================================================================
-- Productos base
INSERT INTO btl_productos (nombre, marca, categoria, subcategoria, sku, presentacion, color_primario, color_secundario, objetivo_presencia, objetivo_stock, objetivo_pop, orden_visualizacion) VALUES
('Corona Extra 355ml', 'Corona', 'Cerveza', 'Premium', 'COR-355', '355ml', '#FFD700', '#FFFFFF', 80.00, 75.00, 60.00, 1),
('Modelo Especial 355ml', 'Modelo', 'Cerveza', 'Estándar', 'MOD-355', '355ml', '#C5A572', '#000000', 75.00, 70.00, 55.00, 2),
('Johnnie Walker Black Label 750ml', 'Johnnie Walker', 'Whisky', 'Premium', 'JW-BL-750', '750ml', '#000000', '#D4AF37', 85.00, 80.00, 70.00, 5),
('Don Julio Reposado 750ml', 'Don Julio', 'Tequila', 'Premium', 'DJ-REP-750', '750ml', '#8B4513', '#D4AF37', 85.00, 75.00, 65.00, 6)
ON CONFLICT (sku) DO NOTHING;

-- Temas Capacitación Base
INSERT INTO btl_temas_capacitacion (nombre, categoria, descripcion) VALUES
('Técnicas de Exhibición', 'Técnica', 'Métodos para exhibir productos'),
('Conocimiento de Cervezas', 'Producto', 'Características de cervezas premium')
ON CONFLICT (nombre) DO NOTHING;

-- Regiones Base (Ejemplo)
INSERT INTO btl_regiones (nombre, descripcion) VALUES 
('Norte', 'Zona Norte'), ('Centro', 'Zona Centro y Capital'), ('Sur', 'Zona Sur') 
ON CONFLICT (nombre) DO NOTHING;

-- 13. FIN
SELECT 'Base de datos generada exitosamente. Siguiente paso: Crear usuarios en Authentication.' as status;
