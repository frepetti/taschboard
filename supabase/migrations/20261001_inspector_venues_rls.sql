-- ==============================================================================
-- MIGRACIÓN: ASIGNACIÓN DE VENUES A INSPECTORES Y PRIVACIDAD RLS EN HISTORIAL
-- ==============================================================================

-- 1. Crear Tabla Intermedia N:M
CREATE TABLE IF NOT EXISTS btl_inspector_puntos_venta (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    inspector_id UUID REFERENCES btl_usuarios(id) ON DELETE CASCADE,
    punto_venta_id UUID REFERENCES btl_puntos_venta(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(inspector_id, punto_venta_id)
);

-- 2. Índices de Rendimiento
CREATE INDEX IF NOT EXISTS idx_inspector_puntos_venta_inspector ON btl_inspector_puntos_venta(inspector_id);
CREATE INDEX IF NOT EXISTS idx_inspector_puntos_venta_venue ON btl_inspector_puntos_venta(punto_venta_id);
CREATE INDEX IF NOT EXISTS idx_inspector_puntos_venta_composite ON btl_inspector_puntos_venta(inspector_id, punto_venta_id);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE btl_inspector_puntos_venta ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para btl_inspector_puntos_venta
DROP POLICY IF EXISTS "inspector_venues_admin_all" ON btl_inspector_puntos_venta;
CREATE POLICY "inspector_venues_admin_all" ON btl_inspector_puntos_venta 
  FOR ALL 
  USING (is_admin());

DROP POLICY IF EXISTS "inspector_venues_read_own" ON btl_inspector_puntos_venta;
CREATE POLICY "inspector_venues_read_own" ON btl_inspector_puntos_venta 
  FOR SELECT 
  USING (inspector_id = current_user_id());

-- 5. Refactorizar Política RLS en btl_puntos_venta (Visibilidad por Asignación para Inspectores)
DROP POLICY IF EXISTS "venues_inspector_read" ON btl_puntos_venta;
CREATE POLICY "venues_inspector_read" ON btl_puntos_venta 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM btl_inspector_puntos_venta ipv
      WHERE ipv.punto_venta_id = btl_puntos_venta.id
      AND ipv.inspector_id = current_user_id()
    )
  );

-- 6. Refactorizar Política RLS en btl_inspecciones (Aislamiento de Inspecciones Propias para Inspectores)
DROP POLICY IF EXISTS "inspecciones_inspector_read_own" ON btl_inspecciones;
CREATE POLICY "inspecciones_inspector_read_own" ON btl_inspecciones 
  FOR SELECT 
  USING (usuario_id = current_user_id());

DROP POLICY IF EXISTS "inspecciones_inspector_create" ON btl_inspecciones;
CREATE POLICY "inspecciones_inspector_create" ON btl_inspecciones 
  FOR INSERT 
  WITH CHECK (
    usuario_id = current_user_id() AND
    EXISTS (
      SELECT 1 FROM btl_usuarios 
      WHERE auth_user_id = auth.uid() 
      AND rol = 'inspector'
    )
  );
