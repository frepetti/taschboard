# Project Walkthrough — Mejoras de Responsividad, Pricing y Analítica Comparativa

## Resumen del Progreso

Se completó exitosamente la implementación de las cuatro áreas de requerimiento:
1. **Filtros de Dashboard Responsivos:** Layout adaptativo para Desktop (scroll horizontal de regiones en una sola fila) y Mobile (dropdowns ergonómicos de tiempo y región).
2. **Gestión de Precio de Referencia:** Campo `precio_referencia` en el catálogo de productos (`btl_productos`), gestionable vía `ProductManagement.tsx` y formateado dinámicamente con `Intl.NumberFormat`.
3. **Captura de Precio de Carta:** Campo numérico para "Precio de Carta ($)" en `InspectionForm.tsx` ("Datos de Venta"), guardado directamente en la columna `precio_venta` de `btl_inspecciones`.
4. **Métricas de Pricing & Posicionamiento:**
   - **KPI Card de Desviación de Precio:** Muestra desviación porcentual entre `precio_carta_promedio` y `precio_referencia` con rangos de alerta visual ($\le \pm 5\%$ verde, $\pm 5\%$ a $\pm 15\%$ ámbar, $> \pm 15\%$ rojo) y manejo seguro contra nulos o ceros.
   - **Gráfico Donut de Posicionamiento:** Visualiza la distribución cualitativa (`premium`, `equal`, `lower`) respecto a competidores registrados en las inspecciones (`PricePositioningChart.tsx`).

---

## Cambios de Arquitectura y Esquema

### 1. Base de Datos (`master_schema.sql`)
- **`btl_productos`:** Se añadió la columna `precio_referencia DECIMAL(10,2)` (nullable).
- **`btl_inspecciones`:** Se clarificó y reutilizó la columna existente `precio_venta DECIMAL(10,2)` como el precio de carta/menú observado durante la auditoría.

#### Snippet SQL para Aplicar en Supabase (Producción):
```sql
-- Parche para base de datos en producción:
ALTER TABLE btl_productos
  ADD COLUMN IF NOT EXISTS precio_referencia DECIMAL(10,2);

COMMENT ON COLUMN btl_inspecciones.precio_venta IS 'Precio de carta/menú observado en el punto de venta durante la inspección';
```

---

## Detalle de Componentes Modificados y Creados

| Componente | Tipo | Descripción de Cambios |
|---|---|---|
| [`master_schema.sql`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/master_schema.sql) | SQL Schema | Columna `precio_referencia` en `btl_productos` y documentación en `precio_venta`. |
| [`ProductManagement.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ProductManagement.tsx) | Componente UI | Atributo `precio_referencia` en interface `Product`, input en formulario de edición/creación y tag formateado en las tarjetas del catálogo (`Intl.NumberFormat`). |
| [`InspectionForm.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/InspectionForm.tsx) | Componente UI | Campo `precioCartaObservado` en estado inicial y en sección "Ventas y Rotación". |
| [`InspectorDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/InspectorDashboard.tsx) | Componente UI | Mapeo de `precioCartaObservado` hacia `precio_venta` en la payload enviada a Supabase. |
| [`FilterChip.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/FilterChip.tsx) | Componente UI | Propiedad `whitespace-nowrap` añadida para evitar desbordes en scroll horizontal. |
| [`ManagerDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ManagerDashboard.tsx) | Componente UI | Filtros condicionales responsivos (`hidden lg:flex` para desktop scroll horizontal / `flex lg:hidden` para mobile dropdowns) e integración de `PricePositioningChart`. |
| [`ProductMetrics.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ProductMetrics.tsx) | Componente UI | Cálculo de desviación de precio (`((avg - ref)/ref)*100`), rango min/max y tarjeta visual con estados (En rango / Alerta / Fuera de rango). |
| [`PricePositioningChart.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/PricePositioningChart.tsx) | **Nuevo** Componente | Gráfico de dona (Recharts) que consolida `priceComparison` (`premium`, `equal`, `lower`) de la competencia en el período filtrado. |
| [`METRICS.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/METRICS.md) | Documentación | Documentación de la sección "9. Métricas de Pricing" y actualización del glosario. |
| [`translations.ts`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/utils/translations.ts) | Utilidad | Nuevas claves de traducción para métricas y labels de pricing. |

---

## Verificación y Validaciones

- **TypeScript Check:** Se ejecutó `npx tsc --noEmit` resultando en **0 errores de compilación** (verificación exitosa).
- **Formateo de Moneda:** Uso de `Intl.NumberFormat` para garantizar ausencia de monedas hardcodeadas.
- **Sanitización de Operaciones:** Control de división por cero y valores nulos en el cálculo de desviaciones de precio.

---

# Sprint 8 — Optimización UI/UX, Filtros Móviles y Migración de Mapas (Testing)

## Resumen Ejecutivo del Sprint
Este sprint abordó tres mejoras prioritarias de usabilidad y estabilidad de servicios identificadas en las pruebas funcionales:
1. **Ergonomía de Visualización de Precios:** Corrección del desbordamiento visual y ajuste de escala en el gráfico de comparación de precios frente a la competencia.
2. **Estandarización Móvil de Rendimiento de Marca:** Reemplazo de botones apilados por un selector desplegable unificado en dispositivos móviles.
3. **Estabilidad del Mapa Territorial:** Migración integral del proveedor de mapas a OpenStreetMap libre con preservación de la identidad visual oscura.

---

## Detalle de Tareas y Componentes Modificados

| Componente / Archivo | Tipo de Cambio | Impacto Funcional / Técnico |
|---|---|---|
| [`PricePositioningChart.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/PricePositioningChart.tsx) | Optimización UI | Se removieron etiquetas y conectores exteriores que desbordaban la tarjeta. Se ajustaron los radios a `innerRadius={50}` y `outerRadius={75}` dentro de `<ResponsiveContainer width="100%" height={260}>`. Se integraron porcentajes y conteos directamente en la leyenda y el tooltip. Se agregó `min-w-0 overflow-hidden` al contenedor principal. |
| [`PerformanceChart.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/PerformanceChart.tsx) | Responsividad | Implementación del patrón adaptativo estándar: selector desplegable estilizado (`<select>`) en mobile (`< lg`) y chips interactivos (`FilterChip`) en desktop (`≥ lg`) para alternar entre "Índice Ejecución", "Visibilidad", "Material POP" y "Visitas". |
| [`OpportunityMap.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/OpportunityMap.tsx) | Servicio de Mapas | Reemplazo de la capa CartoDB por OpenStreetMap libre (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) con atribución actualizada y filtro CSS oscuro (`brightness(0.7) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3)`), eliminando marcas de agua de API key. |
| [`VenueLocationPicker.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueLocationPicker.tsx) | Servicio de Mapas | Estandarización de la capa Leaflet con OpenStreetMap y filtro CSS oscuro para coherencia visual en la selección de ubicación de puntos de venta. |

---

## Verificación de Calidad

- **Compilación TypeScript:** Ejecución de `npx tsc --noEmit` completada exitosamente con **0 errores de tipado**.
- **Validación Responsiva:**
  - Desktop (> 1024px): Chips horizontales y gráficos Recharts contenidos sin desbordes.
  - Mobile (< 768px): Selectores compactos y mapas dark renderizados sin marcas de agua.

---

# Sprint 9 — Restauración del Estilo Positron Exacto (CARTO) y Soporte de API Key

## Resumen Ejecutivo del Sprint
Este sprint diagnosticó y corrigió el fallo de visualización del mapa territorial y alineó el diseño exactamente con la referencia visual requerida:
1. **Diagnóstico del Fallo de Pantalla en Blanco:** El motor MapLibre GL con OpenFreeMap no logró renderizar el pipeline de teselas vectoriales en el navegador, dejando el contenedor completamente en blanco (`#f2f3f0`) sin trazado urbano ni calles.
2. **Identificación de la Referencia de Diseño:** La imagen de referencia solicitada por el usuario corresponde exactamente a la capa **CARTO Positron** con el filtro visual personalizado `brightness(0.82) sepia(0.12) contrast(1.15)` (trazado nítido de manzanas/parcelas, calles en blanco y rótulo estilizado de "BUENOS AIRES").
3. **Restauración y Soporte de API Key Limpia:** Se restauró la capa nativa CARTO Positron en `OpportunityMap.tsx` y `VenueLocationPicker.tsx` y se integró la variable de entorno `VITE_CARTO_API_KEY` (`import.meta.env`).
   - Al registrar una clave gratuita en [CARTO Basemaps](https://carto.com/basemaps/apikey) (gratis hasta 5 millones de peticiones/mes) y colocarla en `.env.local` (`VITE_CARTO_API_KEY=...`), la marca de agua de CARTO desaparece inmediatamente manteniendo el diseño exacto.
4. **Optimización de Dependencias:** Se removieron los paquetes `maplibre-gl` y `@maplibre/maplibre-gl-leaflet` que causaban sobrecarga y fallas de renderizado.

---

## Detalle de Tareas y Componentes Modificados

| Componente / Archivo | Tipo de Cambio | Impacto Funcional / Técnico |
|---|---|---|
| [`OpportunityMap.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/OpportunityMap.tsx) | Servicio de Mapas | Restauración de `L.tileLayer` con CARTO Positron (`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`), integración del parámetro `?key=${cartoKey}`, filtro de tono cálido `brightness(0.82) sepia(0.12) contrast(1.15)` idéntico a la referencia y atribución reglamentaria. |
| [`VenueLocationPicker.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueLocationPicker.tsx) | Servicio de Mapas | Homologación con la misma capa CARTO Positron y parámetro `?key=${cartoKey}`, preservando el pin arrastrable (`draggable: true`), sincronización reactiva de lat/lng y geocodificación inversa por clics. |
| [`.env`, `.env.local`, `.env copy.local`, `.env.example`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/.env) | Configuración | Propagación de `VITE_CARTO_API_KEY` en todos los archivos de entorno del proyecto. |
| [`package.json`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/package.json) | Dependencias | Desinstalación de `maplibre-gl` y `@maplibre/maplibre-gl-leaflet`, aligerando el bundle. |
| [`todo.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/todo.md) | Seguimiento | Actualización y completitud de las tareas de la Fase 9. |
| [`walkthrough.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/walkthrough.md) | Documentación | Documentación técnica y funcional de la solución. |

---

## Verificación de Calidad y Pruebas Técnicas

- **Auditoría de Tipos TypeScript:** `npx tsc --noEmit` completado exitosamente con **0 errores de compilación**.
- **Validación Visual en Navegador (Subagente):** Se navegó en tiempo real a `http://localhost:3000/?mode=client` con recarga forzada.
  - Se confirmó el renderizado nítido de calles, avenidas, manzanas y la tipografía *"BUENOS AIRES"*.
  - **Supresión total de marcas de agua:** Se verificó que con el parámetro `?key=` la marca de agua diagonal de CARTO fue suprimida al 100%, logrando exactamente el acabado de la Foto 2.
- **Rendimiento:** Carga inmediata de mosaicos ráster estándar Leaflet sin sobrecosto de WebGL.

---

## Estado Actual y Próximos Pasos
- **Progreso del Proyecto:** Mapas visualmente homologados al diseño exacto de la referencia, con la API key activa en todos los entornos y sin marcas de agua.
- **Paso Inmediato:** Pase a staging y validación con los usuarios de negocio.




