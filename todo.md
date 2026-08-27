# TODO - Dashboard BTL SaaS

## Fase 1: Análisis y Arquitectura
- [x] Auditoría de esquema (`master_schema.sql`) y codebase React
- [x] Definición de modelo de datos (`precio_referencia` en `btl_productos`, `precio_venta` en `btl_inspecciones`)
- [x] Aprobación de la propuesta técnica por el usuario

## Fase 2: Esquema de Base de Datos
- [x] Actualización de `master_schema.sql` con `precio_referencia DECIMAL(10,2)` en `btl_productos`
- [x] Documentación semántica de `precio_venta DECIMAL(10,2)` en `btl_inspecciones` como precio de carta
- [x] Generación de script SQL patch para producción

## Fase 3: Gestión de Productos (`ProductManagement.tsx`)
- [x] Actualización del tipo/interface TypeScript `Product`
- [x] Campo numérico de `precio_referencia` en el modal de edición/creación de productos
- [x] Formateo `Intl.NumberFormat` para visualización en las tarjetas del catálogo sin hardcodear moneda

## Fase 4: Captura en Inspecciones (`InspectionForm.tsx` & `InspectorDashboard.tsx`)
- [x] Input numérico para "Precio de Carta ($)" en la sección "Datos de Venta"
- [x] Mapeo de `precioCartaObservado` a `precio_venta` en el payload de guardado

## Fase 5: Filtros Responsivos (`ManagerDashboard.tsx` & `FilterChip.tsx`)
- [x] Desktop (`lg:`): Layout horizontal en una fila con scroll horizontal (`overflow-x-auto`, `flex-nowrap`) y `whitespace-nowrap` en `FilterChip`
- [x] Mobile (`< lg`): Dropdowns estilizados de selección única para tiempo y regiones

## Fase 6: Métricas de Pricing y Posicionamiento (`ClientDashboard.tsx`)
- [x] KPI Card de Desviación de Precio en `ProductMetrics.tsx` con fórmula `((precio_carta - precio_referencia) / precio_referencia) * 100` y rangos de color (Verde $\le \pm 5\%$, Ámbar $\pm 5\%$ a $\pm 15\%$, Rojo $> \pm 15\%$)
- [x] Manejo seguro ante división por cero, valores nulos o productos sin precio de referencia
- [x] Componente `PricePositioningChart.tsx` (Donut Chart) para distribución cualitativa de precio vs competencia (`premium`, `equal`, `lower`)

## Fase 7: Documentación y Verificación
- [x] Actualización de `METRICS.md` con fórmulas de pricing y posicionamiento
- [x] Actualización de `translations.ts` con llaves de pricing
- [x] Verificación de tipos con `npx tsc --noEmit`
- [x] Generación y actualización de `walkthrough.md`
