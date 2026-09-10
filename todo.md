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

## Fase 8: UI/UX, Filtros Móviles y TileLayer Libre
- [x] Fix de layout y overflow en `PricePositioningChart.tsx` (remover labels exteriores, innerRadius=50/outerRadius=75, formatear legend y tooltip, min-w-0)
- [x] Estandarización de filtros móviles en `PerformanceChart.tsx` (`hidden lg:flex` vs `flex lg:hidden` con select estilizado)
- [x] Migración de TileLayer a OpenStreetMap libre con filtro CSS dark en `OpportunityMap.tsx` y `VenueLocationPicker.tsx`
- [x] Validación estática `npx tsc --noEmit` y actualización de `walkthrough.md`

## Fase 9: Restauración del Estilo Positron Exacto (CARTO) y Soporte de API Key
- [x] Diagnóstico visual: identificación del fallo en renderizado de MapLibre y coincidencia visual de la referencia con CARTO Positron
- [x] Restauración de capa nativa CARTO Positron en `OpportunityMap.tsx` con filtro `brightness(0.82) sepia(0.12) contrast(1.15)` idéntico a la referencia
- [x] Homologación de capa en `VenueLocationPicker.tsx` con pin arrastrable e interactividad nativa
- [x] Integración de `VITE_CARTO_API_KEY` (`import.meta.env`) para consumo limpio sin marca de agua
- [x] Remoción de paquetes innecesarios `maplibre-gl` y `@maplibre/maplibre-gl-leaflet`
- [x] Actualización de `.env.example` con la clave opcional de CARTO
- [x] Verificación de tipos `npx tsc --noEmit` (0 errores)
- [x] Actualización de `walkthrough.md`

## Fase 10: Estandarización de Modo Demo y Corrección de Error HTTP 400
- [x] Creación del módulo centralizado `utils/demoData.ts` con exactamente 5 venues (`v1`-`v5`) y función `getDemoVenueDetail`
- [x] Intercepción en `VenueDetail.tsx` para neutralizar llamadas a PostgREST con IDs mock y añadir badge visual de modo demo
- [x] Sincronización de dataset mock en `ManagerDashboard.tsx` y mitigación en `TicketModal.tsx`
- [x] Validación estática con `npx tsc --noEmit`
- [x] Pruebas en navegador y actualización de `walkthrough.md`

## Fase 11: Reactividad de Filtros y Expansión Histórica en Rendimiento de Marca
- [x] Extensión del dataset histórico mock a 12 meses móviles (sep 25 - ago 26) con desglose regional en `utils/demoData.ts`
- [x] Conexión y reactividad de props `dateFilter` y `regionFilter` en `PerformanceChart.tsx`
- [x] Recálculo dinámico de KPIs inferiores (`Actual`, `vs Periodo Anterior` y conteo de `Meses`)
- [x] Integración de props en `ManagerDashboard.tsx` y `ClientDashboard.tsx`
- [x] Verificación técnica exclusiva con `npx tsc --noEmit` (sin pruebas de DOM ni screenshots)
- [x] Actualización y completitud de `walkthrough.md` (Sprint 11)

## Fase 12: Despliegue en Producción (PD)
- [x] Generación y verificación del build de producción (`npm run build`)
- [x] Commit de assets compilados en `dist/` sobre rama `develop`
- [x] Sincronización y push de `develop` a `origin/develop`
- [x] Merge fast-forward de `develop` hacia `main` (rama de producción)
- [x] Push a `origin/main` para disparo del pipeline CI/CD en Vercel
- [x] Retorno seguro al entorno de trabajo en `develop`

## Fase 13: Alcance Relacional en Análisis de Capacitación
- [x] Enriquecer `utils/demoData.ts` con dataset simulado de capacitación para venues `v1` a `v5`
- [x] Implementar soporte seguro de "Todos los productos" en `components/ProductMetrics.tsx`
- [x] Adaptar `components/ClientDashboard.tsx` para propagar filtros y habilitar visualización en modo Demo
- [x] Reescribir resolución relacional de venues y guardas defensivas en `components/VenueTrainingAnalytics.tsx`
- [x] Validación de compilación estática con `npx tsc --noEmit` (cero errores)
- [x] Documentación técnica y funcional en `walkthrough.md` (Sprint 13)

## Fase 14: Visor Ampliado (Lightbox) de Fotos en VenueDetail
- [x] Declarar estado `selectedImage` y listener para la tecla `Escape` en `components/VenueDetail.tsx`
- [x] Asignar manejador `onClick` y feedback visual en miniaturas de galería
- [x] Implementar contenedor Modal Lightbox con backdrop desenfocado, botón de cierre accesible y stopPropagation
- [x] Validación estática de código y tipado con `npx tsc --noEmit`
- [x] Actualización y completitud de `walkthrough.md` (Sprint 14)

