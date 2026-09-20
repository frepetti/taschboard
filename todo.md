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

## Fase 15: Sistema de Theming Dinámico Multi-Tenant (Fases 1 y 2)
- [x] Definición de `btl_temas`, RLS y semillas en `master_schema.sql` y generación de snippet DDL para Supabase
- [x] Implementación de `context/ThemeContext.tsx` con persistencia en `localStorage`, variables CSS en `:root` y catálogo de contingencia
- [x] Creación de `components/ThemeSelector.tsx` restringido a administradores con conmutación en tiempo real
- [x] Integración de `<ThemeProvider>` y `<ThemeSelector />` en `App.tsx`
- [x] Implementación de tarjeta de administración de temas en `components/SettingsManagement.tsx` con listado, activación y modal de creación/edición
- [x] Integración de badge temático de estrella roja Heineken para scoring de venue en `components/VenueDetail.tsx`
- [x] Validación estática de código con `npx tsc --noEmit` (0 errores)
- [x] Actualización técnica y funcional de `walkthrough.md` (Sprint 15)

## Fase 16: Propagación Reactiva de Colores de Tema y Acabado Mate de Estrella
- [x] Extender `theme.extend.colors` en `tailwind.config.js` con el namespace `theme` vinculado a variables CSS
- [x] Declarar variables fallback `--theme-*` en `styles/globals.css`
- [x] Refactorizar clases hardcodeadas (`amber`/`purple`) en `components/VenueDetail.tsx` ("Crear Ticket") y `components/TicketModal.tsx`
- [x] Rediseñar la estrella de scoring de Heineken en `components/VenueDetail.tsx` (remover glow/drop-shadow, aplicar rojo mate plano `#d92518` y texto blanco puro nítido)
- [x] Refactorizar clases activas en `components/ThemeSelector.tsx` para usar utilidades `theme-*`
- [x] Validación estática de compilación con `npx tsc --noEmit` (0 errores)
- [x] Actualización técnica y funcional en `walkthrough.md` (Sprint 16)

## Fase 17: Refactor Visual Integral (Fase 1) - Header Corporativo y Desacople de Clases Hardcodeadas
- [x] Tokenización y extensión de variables de tema (`--theme-header-bg`, `--theme-header-text`) en `ThemeContext.tsx`, `globals.css` y `tailwind.config.js`
- [x] Header corporativo y branding dinámico en `App.tsx` (Heineken `#205527`, badge corporativo, controles translúcidos)
- [x] Desacople de clases púrpuras en `AdminDashboard.tsx` y `AdminStats.tsx`
- [x] Desacople de clases hardcodeadas en `InspectorHeader.tsx` y `VenueSelectionForm.tsx`
- [x] Conexión de `FilterChip.tsx` y floating action button en `ClientDashboard.tsx` a variables de tema
- [x] Conexión de SVG strokes y gradientes dinámicos en `PerformanceChart.tsx`
- [x] Actualización de botones y tarjetas en `VenueTrainingAnalytics.tsx`
- [x] Validación estática estricta con `npx tsc --noEmit` (0 errores)
- [x] Documentación técnica y funcional en `walkthrough.md` (Sprint 17)

## Fase 18: Corrección Visual de Layout, Header Branding y Contraste de Filtros
- [x] Botón activo "Cliente" con fondo de acento corporativo (`bg-theme-accent`) en `App.tsx`
- [x] Branding de marca centrado y dominante (`★ HEINEKEN`) con posición absoluta en `App.tsx`
- [x] Normalización de espaciado superior (`pt-6 space-y-6`) en `ClientDashboard.tsx`
- [x] Corrección de contraste del botón inactivo ("Sin inspección") en `FilterChip.tsx` y filtros de mapa
- [x] Validación estática estricta con `npx tsc --noEmit` (0 errores)
- [x] Documentación técnica y funcional en `walkthrough.md` (Sprint 18)

## Fase 19: Soporte Integral de Modo Claro y Modo Oscuro (Color Scheme)
- [x] Arquitectura de tokens y estado en `ThemeContext.tsx` (`colorScheme`, `toggleColorScheme`, persistencia `localStorage`)
- [x] Extensión de tokens semánticos en `tailwind.config.js` y variables en `styles/globals.css`
- [x] Creación de `components/ColorSchemeToggle.tsx` e integración en los 3 headers en `App.tsx`
- [x] Tokenización de formularios, inputs y modales flotantes (`TicketModal.tsx`, `VenueSelectionForm.tsx`, `ThemeSelector.tsx`)
- [x] Compatibilidad gráfica en `PerformanceChart.tsx` (Grid, Axis, Tooltip con fallbacks inline)
- [x] Refactorización de superficies y tarjetas a tokens semánticos (`ClientDashboard.tsx`, `AdminDashboard.tsx`, `AdminStats.tsx`, `KPICard.tsx`, `ProductMetrics.tsx`, `VenueDetail.tsx`, `InspectorHeader.tsx`, `VenueTrainingAnalytics.tsx`, `FilterChip.tsx`)
- [x] Validación estática estricta con `npx tsc --noEmit` (0 errores)
- [x] Documentación técnica y funcional en `walkthrough.md` (Sprint 19)

## Fase 20: Refinamiento Visual y Theming de Loaders
- [x] Calibración de superficies y reducción de luminancia en Modo Claro (`ThemeContext.tsx`, `globals.css`)
- [x] Corrección de legibilidad y contraste en alertas de `ProductMetrics.tsx`
- [x] Erradicación de fondos oscuros residuales en `ManagerDashboard.tsx`, `CompetitionChart.tsx`, `PricePositioningChart.tsx`, `OpportunityBreakdown.tsx`, `VenueTable.tsx` y `OpportunityMap.tsx`
- [x] Creación de `LoadingSpinner.tsx` y theming de `LoadingScreen` en `App.tsx` y spinners modulares (`UserManagement`, `TicketManagement`, `PendingUsersManagement`, `ClientVenueManager`, `VenueDetail`, `ProductMetrics`)
- [x] Validación estática estricta con `npx tsc --noEmit` (0 errores)
- [x] Documentación técnica y funcional en `walkthrough.md` (Sprint 20)

## Fase 21: Barrido Integral de Refactorización y Saneamiento Visual
- [x] Auditoría automatizada por regex (identificación y mapeo de clases `purple/indigo` y `slate/zinc` fijas)
- [x] Desacople de acentos violetas en botones de acción primaria e iconografía en paneles admin
- [x] Tokenización de superficies, tablas, listados e inputs en `UserManagement.tsx` y `VenueManager.tsx`
- [x] Tokenización de tarjetas, paneles de configuración y estados vacíos en `RegionManager.tsx`, `ProductManagement.tsx`, `TicketManagement.tsx`, `PendingUsersManagement.tsx` y `SettingsManagement.tsx`
- [x] Calibración del badge contador en `VenueSelectionForm.tsx` con `bg-theme-primary/10` y cards en `ClientSelectionForm.tsx`
- [x] Saneamiento de tarjetas de historial e inline modal de detalle en `InspectionHistory.tsx`
- [x] Tokenización integral del modal de edición de producto en `ProductManagement.tsx` (general, perfect serve, cocktails)
- [x] Validación estática estricta con `npx tsc --noEmit` (0 errores)
- [x] Verificación final con regex scan (0 clases estáticas no deseadas)
- [x] Documentación técnica y funcional en `walkthrough.md` (Sprint 21)

## Fase 22: Saneamiento Exhaustivo de Flujos de Inspección, Capacitaciones, Calendario y Auditoría Global Regex
- [x] Auditoría terminal exhaustiva (identificación completa de clases hardcodeadas en `components/` y `src/`)
- [x] Refactorización del flujo de selección de producto (`ProductSelectorInspection.tsx` y `ProductSelector.tsx`)
- [x] Refactorización integral de pestañas, checklists e inputs en formulario de inspección (`InspectionForm.tsx`)
- [x] Refactorización del módulo de capacitaciones y modal de alta (`TrainingManagement.tsx`, `TrainingList.tsx`)
- [x] Normalización de inputs geográficos y mapa en modal de venue (`VenueLocationPicker.tsx`)
- [x] Refactorización de widget y modal del Calendario de Activaciones (`ActivationTimeline.tsx`)
- [x] Saneamiento de componentes auxiliares detectados por regex (`ClientProductManagement.tsx`, `ProductImporter.tsx`, `VenueImporter.tsx`, `SecurityStatus.tsx`, `UpdatePassword.tsx`, `InsightCard.tsx`, `AdminDashboard.tsx`, `KPICard.tsx`, `ConfirmDialog.tsx`, `OpportunityMap.tsx`, `VenueDetail.tsx`)
- [x] Saneamiento de pantallas de autenticación (`AdminAuth.tsx`, `ClientAuth.tsx`, `InspectorAuth.tsx`, `DebugPanel.tsx`)
- [x] Verificación estática con `npx tsc --noEmit` (0 errores)
- [x] Doble escaneo regex final comprobando 0 coincidencias en toda la base de componentes
- [x] Documentación técnica y funcional en `walkthrough.md` (Sprint 22)

## Fase 23: Auditoría y Normalización de Tubería de Datos en PerformanceChart (Opción B)
- [x] Auditoría de trazabilidad e identificación de causa raíz de datos ficticios en `PerformanceChart.tsx`
- [x] Propagación de prop `productId` desde `ManagerDashboard.tsx` a `<PerformanceChart />` con filtrado defensivo
- [x] Desacople de fallback a `getDemoPerformanceData` en modo real (`!isDemo`)
- [x] Construcción de serie temporal continua mensual plana en 0% ante ausencia de inspecciones (Opción B)
- [x] Calibración de eje `YAxis` (`domain={[0, 100]}`) y formateo porcentual
- [x] Sincronización de KPIs de pie de gráfico (`Actual: 0%`, `vs Periodo Anterior: 0.0%` o `—` neutro, `Meses: N`)
- [x] Verificación estática de compilación TypeScript (`npx tsc --noEmit` = 0 errores)
- [x] Actualización y completitud técnica en `walkthrough.md` (Sprint 23)

## Fase 24: Reconciliación de Base de Datos y Resolución de Schema Drift (master_schema.sql v2.1)
- [x] Parseo e introspección exhaustiva de `schema_supabase.json` (206 columnas en 15 tablas)
- [x] Creación de script de auditoría automatizado (`scripts/audit_schema_drift.cjs`) y detección de discrepancias exactas
- [x] Actualización del encabezado de `master_schema.sql` a Versión 2.1 (Septiembre 2026 - Schema Drift Sincronizado)
- [x] Incorporación de `stock_estimado TEXT` y `compliance_score NUMERIC DEFAULT 0` en `CREATE TABLE btl_inspecciones`
- [x] Actualización de tipos en `btl_productos`: `competidores JSONB DEFAULT '[]'::jsonb` y `configuracion JSONB DEFAULT '{}'::jsonb`
- [x] Certificación de paridad cero discrepancias con script de auditoría automatizado
- [x] Verificación de integridad de TypeScript con `npx tsc --noEmit` (0 errores)
- [x] Eliminación de script temporal de auditoría
- [x] Documentación técnica y funcional en `walkthrough.md` (Sprint 24)

## Fase 25: Integración Polimórfica de Competencia y Normalización Entera de Scores (Estrella Heineken)
- [x] Creación de `utils/competitionUtils.ts` con parser polimórfico `parseInspectionCompetition`
- [x] Integración de parser polimórfico en `InspectionHistory.tsx` (modal de detalle de inspección)
- [x] Integración de parser polimórfico en `CompetitionChart.tsx` (frecuencia y visibilidad)
- [x] Integración de parser polimórfico en `PricePositioningChart.tsx` (posicionamiento de precio vs competencia)
- [x] Sincronización de campos legacy y array en `InspectionForm.tsx` al guardar competidores
- [x] Normalización de scores a enteros y refactorización de estrella roja Heineken en `VenueDetail.tsx` con `<text>` vectorial SVG auto-escalable
- [x] Revisión y blindaje de redondeo a enteros en `OpportunityMap.tsx`, `VenueTable.tsx` y `ManagerDashboard.tsx`
- [x] Verificación estática con `npx tsc --noEmit` (0 errores)
- [x] Generación de query SQL de saneamiento para registros existentes en Supabase
- [x] Documentación técnica y funcional en `walkthrough.md` (Sprint 25)

## Fase 26: Agregación Estricta por Presencia, Desregulación Muestral y Reactividad
- [x] Auditoría y blindaje de presencia booleana en `utils/competitionUtils.ts` (`NormalizedCompetitor.present`)
- [x] Conteo condicional por presencia (`c.present === true`) en `components/CompetitionChart.tsx`
- [x] Filtrado de competidores ausentes (`comp.present === false`) en `components/PricePositioningChart.tsx`
- [x] Remoción de límite estático `.limit(100)` por `.limit(5000)` en `components/ManagerDashboard.tsx`
- [x] Incorporación de opción "Histórico Completo" (`all`) en filtros desktop y móviles de `components/ManagerDashboard.tsx`
- [x] Integración de botón interactivo "Actualizar" (`RefreshCw`) con estado de carga en `components/ManagerDashboard.tsx`
- [x] Leyenda dinámica contextualizada según período activo en `components/CompetitionChart.tsx`
- [x] Adaptación defensiva de `dateFilter === 'all'` en serie temporal de `components/PerformanceChart.tsx`
- [x] Verificación estática con `npx tsc --noEmit` (0 errores)
- [x] Documentación técnica y funcional en `walkthrough.md` (Sprint 26)

