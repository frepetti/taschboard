-- Migration: Flatten btl_inspecciones for 1:1 Model
-- Description: Moves product columns to the main inspection table and drops the detail table.

-- 1. Add columns to btl_inspecciones
ALTER TABLE btl_inspecciones 
ADD COLUMN IF NOT EXISTS producto_id UUID REFERENCES btl_productos(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS stock_nivel VARCHAR(50),
ADD COLUMN IF NOT EXISTS stock_unidades INTEGER,
-- tiene_material_pop already exists, reusing it
ADD COLUMN IF NOT EXISTS material_pop_tipos TEXT[],
ADD COLUMN IF NOT EXISTS precio_venta DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS en_promocion BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS visibilidad_score DECIMAL(5,2);

-- 2. Create index for the new Foreign Key
CREATE INDEX IF NOT EXISTS idx_btl_inspecciones_producto ON btl_inspecciones(producto_id);

-- 3. Drop the detail table (Data loss acceptable as per user instruction to "optimize")
DROP TABLE IF EXISTS btl_inspeccion_productos CASCADE;
