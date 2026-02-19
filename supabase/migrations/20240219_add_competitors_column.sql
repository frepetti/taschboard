ALTER TABLE btl_productos
ADD COLUMN competidores JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN btl_productos.competidores IS 'List of competitor names for this product';
