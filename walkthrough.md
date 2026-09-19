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

---

# Sprint 10 — Estandarización de Modo Demo y Corrección de Error HTTP 400

## Resumen Ejecutivo del Sprint
1. **Neutralización del Error HTTP 400 en Modo Demo:** Al hacer clic en puntos de venta con identificadores mock (`v1` a `v5`), PostgREST rechazaba las consultas por no tratarse de UUIDs válidos. Se interceptó la petición en `VenueDetail.tsx` para abastecer los datos directamente desde el catálogo en memoria y se añadió el badge visual distintivo *"Modo Demo - Datos Simulados"*.
2. **Centralización del Dataset Mock:** Se unificó el catálogo a exactamente 5 puntos de venta (`v1` a `v5`) en `utils/demoData.ts` con coordenadas geográficas, métricas de auditoría, pricing, fotos e historial de inspecciones.
3. **Mitigación en Tickets:** Se adaptó `TicketModal.tsx` para prevenir inserciones inválidas de puntos de venta mock en base de datos.

---

# Sprint 11 — Reactividad de Filtros y Expansión Histórica en Rendimiento de Marca

## Resumen Ejecutivo del Sprint
Este sprint implementó la funcionalidad completa y reactiva de los filtros de Tiempo y Regiones sobre el gráfico **"Rendimiento de Ejecución de Marca"** (`PerformanceChart.tsx`), expandiendo la ventana temporal a los últimos 12 meses móviles (`sep 25` a `ago 26`) al seleccionar la opción "1 Año" y recalculando dinámicamente tanto la serie como los KPIs del pie del componente:

1. **Extensión del Dataset Histórico (`utils/demoData.ts`):**
   - Se construyó el dataset `DEMO_PERFORMANCE_HISTORY` con 24 meses continuos (`sep 24` a `ago 26`), garantizando que la ventana de los últimos 12 meses móviles (`sep 25` a `ago 26`) y su período inmediatamente anterior equivalente (`sep 24` a `ago 25`) cuenten con datos consistentes.
   - Datos numéricos coherentes para las 4 métricas conmutables: `Índice Ejecución` (`compliance`), `Visibilidad` (`presencia`), `Material POP` (`material`) y `Visitas` (`visitas`).
   - Desglose y segmentación regional exacta (`all`, `norte`, `sur`, `centro`) con coherencia matemática aditiva (`norte.visitas + sur.visitas + centro.visitas = all.visitas`).
   - Helper modular `getDemoPerformanceData(dateFilter, regionFilter)` para rebanar la serie activa y la serie precedente con normalización segura de regiones.

2. **Reactividad de Filtros en `PerformanceChart.tsx`:**
   - Conexión de los props `dateFilter`, `regionFilter` e `isDemo` al componente.
   - **Mapeo temporal estricto:**
     - `1 Mes` (`1M`): `ago 26` (1 punto continuo).
     - `3 Meses` (`3M`): `jun 26` a `ago 26` (3 puntos continuos).
     - `6 Meses` (`6M`): `mar 26` a `ago 26` (6 puntos continuos).
     - `1 Año` (`1Y`): `sep 25` a `ago 26` (12 puntos continuos en el eje X).
     - `YTD`: `ene 26` a `ago 26` (8 puntos continuos).
   - Renderizado con puntos visibles (`dot={{ r: 4, fill: '#DA407C', stroke: '#ffffff', strokeWidth: 1 }}` y `activeDot={{ r: 6 }}`) garantizando visibilidad clara incluso con 1 punto activo (`1 Mes`).
   - Tooltip dinámico formateando con unidad (`%` o `visitas`) y label traducido.

3. **Recálculo Dinámico de KPIs Inferiores:**
   - `Actual`: Valor de la métrica activa en el mes de corte (`ago 26`), formateado dinámicamente con `%` para métricas porcentuales y entero para visitas.
   - `vs Periodo Anterior`: Variación porcentual calculada contra el período equivalente inmediatamente anterior de idéntica longitud:
     $$\Delta\% = \frac{\bar{V}_{\text{actual}} - \bar{V}_{\text{anterior}}}{\bar{V}_{\text{anterior}}} \times 100$$
     Protección matemática estricta contra división por cero, valores nulos y `NaN`, con colorización semántica (+ verde, - rojo, neutro slate).
   - `Meses`: Conteo exacto de meses representados en el rango activo (`1` para `1M`, `3` para `3M`, `6` para `6M`, `12` para `1Y`, `8` para `YTD`).

4. **Integración en Dashboards (`ManagerDashboard.tsx` & `ClientDashboard.tsx`):**
   - Transmisión de props `dateFilter`, `regionFilter` e `isDemo` hacia `<PerformanceChart />`.
   - Reemplazo de 672 líneas de mock data inline en `ManagerDashboard.tsx` por la importación limpia y centralizada desde `utils/demoData.ts`.

---

## Detalle de Componentes Modificados y Creados

| Archivo / Componente | Tipo de Cambio | Impacto Funcional / Arquitectónico |
|---|---|---|
| [`utils/demoData.ts`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/utils/demoData.ts) | Dataset Centralizado | Modelado de interfaces `DemoPerformanceMonthMetric` y `DemoPerformanceMonth`, creación de serie de 24 meses (`sep 24` a `ago 26`) con segmentación regional (`all`, `norte`, `sur`, `centro`) y función de corte `getDemoPerformanceData`. |
| [`components/PerformanceChart.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/PerformanceChart.tsx) | Componente UI / Lógica | Soporte de props `dateFilter`, `regionFilter`, `isDemo`; cálculo dinámico de `currentData`, `previousData`, `currentValue`, `change` y `monthsCount`; renderizado responsivo con `dot` y `domain` adaptativo. |
| [`components/ManagerDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ManagerDashboard.tsx) | Componente UI / Contenedor | Propagación de props reactivos `dateFilter`, `regionFilter`, `isDemo` a `<PerformanceChart />` y remoción de 672 líneas de mock data inline en favor del módulo centralizado. |
| [`todo.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/todo.md) | Seguimiento | Actualización de Fase 10 y registro y completitud de las tareas de la Fase 11. |
| [`walkthrough.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/walkthrough.md) | Documentación | Registro histórico de los Sprints 10 y 11 con fórmulas y detalles de implementación. |

---

## Verificación de Calidad y Pruebas Técnicas (Exclusivamente Estático)

- **Compilación TypeScript:** Ejecución de `npx tsc --noEmit` completada exitosamente con **0 errores de compilación**.
- **Validación de Slices Temporales:** Comprobación lógica de las ventanas temporales en motor Node:
  - `1M`: 1 mes (`ago 26`), vs `jul 26`.
  - `3M`: 3 meses (`jun 26` a `ago 26`), vs `mar 26` a `may 26`.
  - `6M`: 6 meses (`mar 26` a `ago 26`), vs `sep 25` a `feb 26`.
  - `1Y`: 12 meses (`sep 25` a `ago 26`), vs `sep 24` a `ago 25`.
  - `YTD`: 8 meses (`ene 26` a `ago 26`), vs `may 25` a `dic 25`.
- **Validación Regional:** Comprobación de consistencia numérica aditiva entre regiones para todas las métricas.
- **Restricción Cumplida:** No se ejecutaron pruebas de emulación de navegador, DOM ni capturas de pantalla, reservadas para validación del usuario.

---

## Estado Actual y Próximos Pasos
- **Progreso del Proyecto:** Filtros de tiempo y regiones 100% reactivos y funcionales en el gráfico de Rendimiento de Ejecución de Marca, con serie de 12 meses continuos para la opción "1 Año" y cálculo matemático exacto de KPIs.
- **Paso Inmediato:** Validación de interfaz y experiencia de usuario por parte del cliente.

---

# Sprint 12 — Despliegue en Producción (PD)

## Resumen Ejecutivo del Sprint
Se ejecutó la publicación integral a Producción (**PD**) integrando los desarrollos validados de los Sprints 10 y 11:
1. **Compilación de Producción:** Ejecución de `npm run build` (`vite build`) verificando la generación limpia de todos los bundles y chunks en `dist/` (0 errores).
2. **Versionado de Assets:** Registro del commit `21207e2` (`build: update production bundle with demo mode and performance chart filters`) en la rama `develop`.
3. **Merge a Producción:** Fusión por avance rápido (*Fast-Forward*) de `develop` hacia `main` (commit `21207e2`).
4. **Despliegue en Vercel:** Push a `origin/main` para disparar el pipeline automatizado de producción.
5. **Aislamiento de Entorno:** Retorno a la rama activa de desarrollo `develop`.

---

## Verificación de Calidad
- **Pipeline Git:** `origin/main` y `origin/develop` sincronizados en el commit `21207e2`.
- **Integridad del Árbol de Trabajo:** `nothing to commit, working tree clean` en `develop`.

---

## Estado Actual y Próximos Pasos
- **Progreso del Proyecto:** Todos los cambios desplegados en Producción (**PD**).
- **Paso Inmediato:** Monitoreo del deployment en el dashboard de Vercel y verificación en el entorno productivo.

---

# Sprint 13 — Alcance Relacional de Datos en Análisis de Capacitación

## Resumen Ejecutivo del Sprint
Este sprint corrigió el alcance de datos en la sección **"Análisis de Capacitación"** (`VenueTrainingAnalytics.tsx`) del Dashboard de Cliente. Anteriormente, el módulo contabilizaba la totalidad de puntos de venta registrados en la base de datos de manera global; se implementó una resolución relacional indirecta basada en el producto y cliente activo en los filtros superiores, con protecciones numéricas contra divisiones por cero y soporte coherente para el modo Demo en memoria.

---

## Análisis de Dependencias Relacionales
En el modelo relacional del sistema (`master_schema.sql`), no existe una relación directa entre productos y puntos de venta (PDV). La pertenencia se articula de manera indirecta a través de dos entidades intermedias:

```
[btl_productos] (producto_id)
        │
        ▼ (1:N)
[btl_cliente_productos] ──(resuelve cliente)──> [btl_usuarios] (usuario_id)
                                                       │
                                                       ▼ (1:N)
                                            [btl_clientes_venues] ──(resuelve venues)──> [btl_puntos_venta]
```

### Reglas de Resolución Implementadas:
1. **Producto Específico Seleccionado:**
   - Se consulta `btl_cliente_productos` para obtener el/los cliente(s) (`usuario_id`) propietarios del `selectedProductId` (acotado al cliente de la sesión si no es administrador).
   - Con los identificadores de cliente obtenidos, se consulta `btl_clientes_venues` para obtener los `venue_id` asignados.
   - El resultado define el **universo cerrado de venues** para el producto activo.
2. **"Todos los productos" o Selección Nula:**
   - El universo se delimita directamente por el cliente activo en la sesión mediante `btl_clientes_venues` (`cliente_id = activeClientId`).
   - En el caso de un Administrador sin filtro de cliente, se consideran los venues asignados en `btl_clientes_venues`.
3. **Modo Demo (`isDemo === true`):**
   - Se suprime la interacción con Supabase PostgREST para evitar llamadas HTTP o bloqueos RLS.
   - Se abastece el universo cerrado directamente desde el catálogo de 5 venues estandarizados (`v1` a `v5`) configurados en memoria en `utils/demoData.ts`.

---

## Detalle de Componentes Modificados

| Componente / Archivo | Tipo de Cambio | Impacto Funcional / Técnico |
|---|---|---|
| [`components/VenueTrainingAnalytics.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueTrainingAnalytics.tsx) | Lógica Relacional & UI | Extensión de props (`selectedProductId`, `isDemo`, `isAdmin`, `regionFilter`). Sustitución del query global por la resolución `btl_cliente_productos` $\to$ `btl_clientes_venues`. Filtro de inspecciones acotado a los venues del universo. Guardas defensivas contra `totalVenues === 0` (retornando `0.0%` en tarjetas de capacitado y sin capacitar). Modal de Detalle restringido exclusivamente a los venues activos. |
| [`components/ClientDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ClientDashboard.tsx) | Orquestador UI | Propagación reactiva de `selectedProductId`, `isDemo`, `isAdmin` y `regionFilter` a `<VenueTrainingAnalytics />`. Habilitación de `<VenueTrainingAnalytics />` en modo Demo. Aislamiento de llamadas Supabase cuando `isDemo === true`. |
| [`components/ProductMetrics.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ProductMetrics.tsx) | Selector & KPIs | Incorporación de la opción `<option value="all">Todos los productos</option>`. Manejo defensivo en `loadMetricsForProduct('all')` para consolidar métricas de catálogo y evitar queries con UUIDs inválidos. |
| [`utils/demoData.ts`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/utils/demoData.ts) | Dataset Centralizado | Modelado de interfaces `DemoVenueTraining`, definición del dataset `DEMO_VENUE_TRAININGS` (5 venues con 3 capacitados y 2 sin capacitar) y función `getDemoTrainingData` reactiva al filtro regional. |
| [`todo.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/todo.md) | Seguimiento | Registro y completitud de las tareas de la Fase 13. |
| [`walkthrough.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/walkthrough.md) | Documentación | Bitácora técnica y funcional del Sprint 13 para Analistas Funcionales y Process Owners. |

---

## Recálculo Dinámico y Manejo Defensivo de Métricas

1. **Total de Venues:**
   - Refleja la cantidad real de venues en el universo cerrado activo ($N$).
2. **Porcentajes de Capacitación:**
   - **Manejo defensivo ante universo vacío ($N = 0$):**
     $$\% \text{ Capacitado} = 0.0\%$$
     $$\% \text{ Sin Capacitar} = 0.0\%$$
     Evita división por cero, `NaN` y el valor anómalo `100 - 0 = 100%` cuando no existen venues asignados.
   - **Con venues asignados ($N > 0$):**
     $$\% \text{ Con Personal Capacitado} = \left(\frac{\text{venuesWithTraining}}{N}\right) \times 100$$
     $$\% \text{ Sin Personal Capacitado} = \left(\frac{\text{venuesWithoutTraining}}{N}\right) \times 100$$
3. **Barra de Progreso y Detalle:**
   - Etiqueta dinámica: `X de N venues`.
   - Ancho visual sincronizado con el porcentaje defensivo.
   - El modal "Ver Detalle" enumera única y exclusivamente los puntos de venta filtrados para la selección vigente.

---

## Verificación de Calidad y Pruebas Técnicas (Exclusivamente Estático)

- **Compilación TypeScript:** Ejecución de `npx tsc --noEmit` completada exitosamente con **0 errores de compilación**.
- **Restricción de Testing Cumplida:** No se realizaron pruebas sobre el DOM, emulación de navegador ni capturas de pantalla, preservando el entorno para la inspección del usuario.
- **Integridad de Modelos:** Nombres de tablas y columnas contrastados contra `supabase/migrations/master_schema.sql` (`btl_cliente_productos`, `btl_clientes_venues`, `btl_puntos_venta`, `btl_usuarios`, `btl_capacitaciones`, `btl_capacitacion_asistentes`).

---

## Estado Actual y Próximos Pasos (Sprint 13)
- **Progreso del Proyecto:** Alcance relacional de datos en "Análisis de Capacitación" 100% corregido y reactivo a los filtros de producto, cliente y región, con protecciones numéricas y soporte en memoria para modo Demo.
- **Paso Inmediato:** Implementación del visor ampliado interactivo (Lightbox) en la galería de fotos de `VenueDetail.tsx`.

---

# Sprint 14 — Visor Ampliado (Lightbox) de Fotografías en VenueDetail

## Objetivo del Sprint
Proporcionar una experiencia interactiva y accesible de visualización para las fotografías de auditoría en la sección **"Galería del Venue"** dentro de [`components/VenueDetail.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueDetail.tsx). Las miniaturas, previamente estáticas, ahora actúan como disparadores de un modal Lightbox de pantalla completa, permitiendo a supervisores, clientes y process owners examinar el material fotográfico de auditoría en alta resolución con proporción respetada.

---

## Alcance Técnico y Arquitectura de la Solución

```
┌─────────────────────────────────────────────────────────────┐
│                 Galería del Venue (Thumbnails)              │
│       [Miniatura 1]    [Miniatura 2]    [Miniatura N]       │
│             │                                               │
│       onClick(url) ──> setSelectedImage(url)                │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Lightbox Modal (Overlay Fijo)               │
│                                                             │
│   Backdrop: fixed inset-0 z-50 bg-black/80 backdrop-blur-sm │
│   - onClick: setSelectedImage(null)                         │
│   - Teclado: Listener 'Escape' en useEffect                 │
│                                                             │
│   [X] Botón accesible (aria-label="Cerrar vista previa")    │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Contenedor de Imagen (e.stopPropagation())          │   │
│   │   max-h-[85vh] max-w-[90vw] object-contain          │   │
│   │   rounded-lg shadow-2xl                             │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

1. **Gestión de Estado Centralizada:**
   - Estado reactivo local: `const [selectedImage, setSelectedImage] = useState<string | null>(null)`.
   - Inicializado en `null`. Compatible de forma idéntica con URLs provenientes de Supabase Storage (`btl_inspecciones.fotos_urls`) y con URLs mock en modo demo provistas por [`utils/demoData.ts`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/utils/demoData.ts).

2. **Feedback Visual en Miniaturas:**
   - Adición de `cursor-pointer hover:opacity-85 transition-opacity` a las miniaturas para comunicar interactividad inmediata al usuario.

3. **Mecanismos de Cierre Ergonómicos (3 Vías):**
   - **Backdrop Exterior:** Clic sobre el overlay oscuro fuera del contenedor de la imagen ejecuta `setSelectedImage(null)`.
   - **Aislamiento de Evento:** El contenedor interior de la imagen intercepta clics con `e.stopPropagation()`, evitando cierres no deseados al interactuar con la imagen.
   - **Botón Explícito de Cierre:** Botón `X` en la esquina superior derecha (`aria-label="Cerrar vista previa"`) accesible y visible sobre fondos oscuros o claros.
   - **Atajo de Teclado:** Listener global en `useEffect` que intercepta la tecla `Escape` y se remueve de forma determinista en la fase de desmontaje (`cleanup function`).

4. **Escalado y Proporción Responsiva:**
   - Estilos `max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl` que garantizan que fotografías de cualquier aspecto (horizontal, vertical o panorámico) se visualicen sin deformaciones ni scrollbars secundarios.

---

## Detalle de Componentes Modificados

| Componente / Archivo | Tipo de Cambio | Impacto Funcional / Técnico |
|---|---|---|
| [`components/VenueDetail.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueDetail.tsx) | Interfaz & UX | Inclusión de estado `selectedImage`, listener de tecla `Escape`, interactividad en miniaturas de galería y renderizado condicional del modal Lightbox con aislamiento de eventos. |
| [`todo.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/todo.md) | Seguimiento | Registro y completitud de las tareas de la Fase 14. |
| [`walkthrough.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/walkthrough.md) | Documentación | Bitácora técnica y funcional del Sprint 14 para Analistas Funcionales y Process Owners. |

---

## Verificación de Calidad y Pruebas Técnicas (Exclusivamente Estático)

- **Compilación TypeScript:** Ejecución de `npx tsc --noEmit` completada exitosamente con **0 errores de compilación**.
- **Restricción de Testing Cumplida:** No se ejecutaron pruebas sobre el DOM, emulaciones de navegador ni capturas de pantalla, preservando el entorno para la inspección directa del usuario.
- **Accesibilidad:** Cumplimiento de atributo semántico `aria-label="Cerrar vista previa"` en el disparador de cierre.

---

## Project Walkthrough

- **Progreso Actual del Proyecto:** El componente de detalle de venue (`VenueDetail.tsx`) cuenta ahora con una galería de inspección interactiva y accesible, complementando el soporte ya implementado para modo Demo y producción.
- **Pasos Lógicos/Arquitectónicos Recién Completados:**
  1. Definición del estado `selectedImage` y suscripción al listener de teclado (`Escape`).
  2. Asignación de interactividad `onClick` y estilo cursor/hover a las miniaturas de la galería.
  3. Renderizado del modal Lightbox con backdrop desenfocado, botón de cierre explícito accesible, parada de propagación y dimensionamiento proporcional adaptativo.
  4. Verificación estática con TypeScript (`0 errores`).
- **Paso Inmediato:** Validación funcional y visual en navegador por parte del usuario y Process Owners.

---

# Sprint 15 — Sistema de Theming Dinámico Multi-Tenant (Fases 1 y 2)

## Resumen Ejecutivo del Sprint
Este sprint implementó la infraestructura completa de **Theming Dinámico Multi-Tenant** para Taschboard. El sistema permite personalizar la apariencia corporativa del dashboard en tiempo real (colores primario, secundario, acento y borde), persistir paletas en la base de datos Supabase, administrarlas mediante un módulo interactivo en la pestaña **Ajustes** y conmutarlas en caliente desde la barra superior para usuarios administradores. Adicionalmente, se integró la identidad visual de marca de **Heineken**, presentando el puntaje global del punto de venta dentro de una icónica estrella roja de 5 puntas en `VenueDetail.tsx`.

---

## Arquitectura del Sistema de Theming

```
┌─────────────────────────────────────────────────────────────┐
│             Base de Datos Supabase (btl_temas)             │
│  - id (UUID), nombre, slug (UNIQUE), colors, config (JSONB) │
│  - RLS: lectura pública/autenticada, escritura solo Admin  │
└─────────────────────────────┬───────────────────────────────┘
                              │ PostgREST / Fallback en Memoria
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            ThemeContext (React Provider Global)             │
│  - Estado reactivo: currentTheme, themes, setTheme()        │
│  - Inyección en tiempo real en :root (CSS Custom Properties)│
│    --theme-primary, --theme-secondary, --theme-accent, ... │
│  - Persistencia en localStorage (taschboard_active_theme)  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌─────────────────────────────┐
│ Header: ThemeSelector        │ │ Pestaña Ajustes:            │
│ (Dropdown solo para Admins)  │ │ SettingsManagement          │
│ - Cambio de tema en caliente │ │ - Listado con swatches HEX  │
│ - Sin recarga de pantalla    │ │ - Activación & Modal CRUD   │
└──────────────────────────────┘ └─────────────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     VenueDetail.tsx                         │
│  - Scoring temático reactivo:                               │
│    * Si theme === 'heineken' -> Badge Estrella Roja SVG 5-P │
│    * Otros temas -> Visualización numérica estándar         │
└─────────────────────────────────────────────────────────────┘
```

---

## Persistencia y Modelo de Datos (`master_schema.sql`)

### 1. DDL de la Tabla `btl_temas`:
```sql
CREATE TABLE IF NOT EXISTS public.btl_temas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    primary_color TEXT NOT NULL,
    secondary_color TEXT NOT NULL,
    accent_color TEXT NOT NULL,
    border_color TEXT NOT NULL,
    config JSONB DEFAULT '{}'::jsonb,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_btl_temas_slug ON btl_temas(slug);
CREATE INDEX IF NOT EXISTS idx_btl_temas_activo ON btl_temas(activo);
```

### 2. Políticas de Seguridad RLS:
```sql
ALTER TABLE btl_temas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "temas_read_all" ON btl_temas;
CREATE POLICY "temas_read_all" ON btl_temas 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "temas_admin_all" ON btl_temas;
CREATE POLICY "temas_admin_all" ON btl_temas 
  FOR ALL 
  USING (is_admin());
```

### 3. Semillas Iniciales (Idempotentes):
```sql
INSERT INTO btl_temas (nombre, slug, primary_color, secondary_color, accent_color, border_color, config, activo)
VALUES 
  ('Default', 'default', '#7c3aed', '#4c1d95', '#ec4899', '#334155', '{"badge_style": "default"}'::jsonb, true),
  ('Heineken', 'heineken', '#008200', '#205527', '#ff2b00', '#c3c3c3', '{"badge_style": "heineken_star"}'::jsonb, true)
ON CONFLICT (slug) DO NOTHING;
```

---

## Componentes y Módulos Desarrollados

| Archivo / Módulo | Tipo | Descripción e Impacto Técnico |
|---|---|---|
| [`context/ThemeContext.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/context/ThemeContext.tsx) | Nuevo (Context) | Provider global `ThemeProvider` y hook `useTheme()`. Gestiona temas activos, persistencia en `localStorage` (`taschboard_active_theme`), inyección dinámica en `:root` de variables CSS (`--theme-primary`, `--theme-secondary`, `--theme-accent`, `--theme-border`) y catálogo estático de contingencia (`FALLBACK_THEMES`) para modo Demo u offline. |
| [`src/context/ThemeContext.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/src/context/ThemeContext.tsx) | Nuevo (Proxy) | Módulo de compatibilidad para asegurar resolución de imports bajo la ruta `src/context/ThemeContext`. |
| [`components/ThemeSelector.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ThemeSelector.tsx) | Nuevo (UI) | Selector dropdown interactivo situado en la barra superior. Renderizado condicional exclusivo para administradores (`isAdmin === true`). Permite cambio en caliente de temas con previsualización visual de swatches y cierre ergonómico (outside click + Escape). |
| [`components/SettingsManagement.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/SettingsManagement.tsx) | Modificación (Admin) | Incorporación de la tarjeta "Gestión de Temas Visuales" con catálogo de temas registrados, indicador visual del tema en uso, botón de aplicación inmediata y modal CRUD para crear o editar temas con inputs HEX, validaciones regex y selectores de estilo de badge. |
| [`components/VenueDetail.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueDetail.tsx) | Modificación (Scoring) | Consumo reactivo del hook `useTheme()`. Si la identidad activa es Heineken (`slug === 'heineken'` o `config.badge_style === 'heineken_star'`), el puntaje global se dibuja centrado dentro de una estrella roja vectorial SVG de 5 puntas (`#ff2b00`) con tipografía bold blanca de alto contraste y resplandor temático. |
| [`App.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/App.tsx) | Modificación (Orquestador) | Envoltura de la aplicación completa con `<ThemeProvider>` y posicionamiento de `<ThemeSelector />` junto a `<LanguageSwitcher />` en los encabezados de administración e inspección. |
| [`utils/supabase/database.types.ts`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/utils/supabase/database.types.ts) | Modificación (Tipos) | Incorporación formal de la tabla `btl_temas` en la interfaz TypeScript `Database` de Supabase PostgREST. |
| [`supabase/migrations/master_schema.sql`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/supabase/migrations/master_schema.sql) | Modificación (DB) | Registro maestro de la tabla `btl_temas`, índices, políticas RLS y datos semilla. |
| [`todo.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/todo.md) | Seguimiento | Registro y completitud de las tareas de la Fase 15. |
| [`walkthrough.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/walkthrough.md) | Documentación | Bitácora técnica y funcional del Sprint 15 para Analistas Funcionales y Process Owners. |

---

## Verificación de Calidad y Pruebas Técnicas (Exclusivamente Estático)

- **Compilación de TypeScript:** Ejecución de `npx tsc --noEmit` completada exitosamente con **0 errores de compilación**.
- **Restricción de Testing Cumplida Estrictamente:** Cero pruebas sobre el DOM, cero emuladores de navegador y cero capturas de pantalla, preservando el entorno para la inspección y validación del usuario.
- **Tolerancia a Fallos:** En caso de demoras en la red o tablas de Supabase pendientes de ejecución en entornos locales/demo, el `ThemeContext` inicializa limpiamente con los temas semilla preconfigurados sin arrojar excepciones.

---

## Project Walkthrough

- **Progreso Actual del Proyecto:** El sistema de theming dinámico multi-tenant (Fases 1 y 2) está completamente implementado, conectado al estado global, integrado en la cabecera y en el panel de administración, e identificado con la estrella roja de Heineken en los detalles de puntos de venta.
- **Pasos Lógicos/Arquitectónicos Recién Completados:**
  1. Actualización de `master_schema.sql` con DDL de `btl_temas`, políticas RLS idempotentes y datos semilla.
  2. Implementación de `context/ThemeContext.tsx` con inyección de variables CSS y persistencia local.
  3. Creación de `components/ThemeSelector.tsx` integrado en la barra de navegación para administradores.
  4. Implementación del módulo de gestión de temas en `components/SettingsManagement.tsx`.
  5. Integración del badge de estrella roja de Heineken en el puntaje de `components/VenueDetail.tsx`.
  6. Tipado estricto en `utils/supabase/database.types.ts` y comprobación estática con `npx tsc --noEmit` (**0 errores**).
- **Paso Inmediato:** Diagnóstico y resolución de propagación de variables de tema y rediseño de estrella mate.

---

# Sprint 16 — Propagación Reactiva de Colores de Tema y Acabado Mate de Estrella

## Resumen Ejecutivo del Sprint
Este sprint resolvió el problema de propagación visual de colores en los componentes clave de la interfaz y perfeccionó la presentación gráfica de la estrella de puntuación de Heineken en `VenueDetail.tsx`. Previamente, los botones y acentos se mantenían violetas independientemente del tema seleccionado debido a clases estáticas de Tailwind (`amber-400/500/600` remapeadas a Baroque violeta `#6422B8`) y a la ausencia del namespace `theme` en la configuración. Se habilitaron utilidades dinámicas conectadas a variables CSS y se transformó la estrella de scoring a un acabado mate plano en rojo corporativo `#d92518`, eliminando todo efecto neón o difuminado.

---

## Diagnóstico Técnico

1. **Colores Violetas Persistentes:**
   - En `tailwind.config.js`, la paleta `amber` estaba sobreescrita con valores violetas (`400: #DA407C`, `500: #6422B8`, `600: #5412A8`).
   - Los componentes `VenueDetail.tsx` (botón "Crear Ticket") y `TicketModal.tsx` (categorías y botón de envío) invocaban clases hardcodeadas como `bg-gradient-to-r from-amber-600 to-amber-500` y `bg-purple-600`, ignorando las variables CSS del tema activo.
   - `tailwind.config.js` carecía del namespace `colors.theme`, impidiendo el uso de utilidades como `bg-theme-primary`, `from-theme-secondary`, etc.

2. **Efecto Neón en la Estrella de Heineken:**
   - El SVG de scoring en `VenueDetail.tsx` contenía filtros `drop-shadow-[0_4px_14px_rgba(255,43,0,0.45)]` y `drop-shadow-sm` sobre un rojo saturado `#ff2b00`, lo que generaba un resplandor visual luminoso.

---

## Solución Técnica Implementada

### 1. Extensión de Tailwind (`tailwind.config.js` & `globals.css`)
- Se configuró formalmente la paleta dinámica:
  ```javascript
  theme: {
    primary: 'var(--theme-primary, #7c3aed)',
    secondary: 'var(--theme-secondary, #4c1d95)',
    accent: 'var(--theme-accent, #ec4899)',
    border: 'var(--theme-border, #334155)',
  }
  ```
- Se registraron los valores fallback correspondientes en `:root` dentro de `styles/globals.css`.

### 2. Refactorización de Clases en Componentes
- **`components/VenueDetail.tsx`:**
  - Botón "Crear Ticket": migrado a `bg-gradient-to-r from-theme-secondary to-theme-primary hover:brightness-110`.
  - Badges y acentos: enlazados a `bg-theme-primary/20 text-theme-primary border-theme-primary/40`.
  - Galería: `hover:border-theme-primary/50`.
  - Recomendaciones: `border-theme-primary/30` y `text-theme-primary`.
- **`components/TicketModal.tsx`:**
  - Botones de categorías (Capacitación, Acción BTL, POP, General): activos con `bg-theme-primary/20 border-theme-primary text-white`.
  - Botón de envío de solicitud: `bg-gradient-to-r from-theme-secondary to-theme-primary hover:brightness-110`.
  - Caja informativa: `border-theme-primary/30 text-theme-primary`.
- **`components/ThemeSelector.tsx`:**
  - Icono de paleta e indicador de selección activa enlazados a `text-theme-primary` y `bg-theme-primary/20`.

### 3. Rediseño de la Estrella Heineken a Estilo Mate Plano
- Eliminados todos los filtros `drop-shadow`.
- Relleno plano mate con rojo corporativo oficial `#d92518`.
- Puntuación numérica centrada geométricamente en blanco puro (`#ffffff`) con `font-black text-2xl sm:text-3xl tracking-tight` y legibilidad cristalina sin desenfoques.

---

## Detalle de Componentes Modificados

| Archivo | Tipo de Cambio | Impacto |
|---|---|---|
| [`tailwind.config.js`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/tailwind.config.js) | Configuración | Adición de utilidades dinámicas `theme.primary`, `theme.secondary`, `theme.accent`, `theme.border`. |
| [`styles/globals.css`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/styles/globals.css) | Estilos | Declaración de variables CSS `--theme-*` por defecto en `:root`. |
| [`components/VenueDetail.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueDetail.tsx) | UI & UX | Estrella de Heineken mate `#d92518` sin resplandor; botón "Crear Ticket" reactivo al tema activo. |
| [`components/TicketModal.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/TicketModal.tsx) | UI & Formulario | Categorías, inputs y botón de envío enlazados al gradiente corporativo dinámico. |
| [`components/ThemeSelector.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ThemeSelector.tsx) | UI & Controles | Selector en cabecera sincronizado con tokens `theme-primary`. |
| [`todo.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/todo.md) | Seguimiento | Completitud y registro de las tareas de la Fase 16. |
| [`walkthrough.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/walkthrough.md) | Documentación | Bitácora técnica y funcional del Sprint 16 para Analistas Funcionales y Process Owners. |

---

## Verificación de Calidad y Pruebas Técnicas (Exclusivamente Estático)

- **Compilación de TypeScript:** `npx tsc --noEmit` completado exitosamente con **0 errores de compilación**.
- **Restricción de Testing Cumplida Estrictamente:** Sin pruebas sobre el DOM, sin emulación de navegador y sin capturas de pantalla, preservando el entorno para la inspección directa del usuario.

---

## Project Walkthrough

- **Progreso Actual del Proyecto:** Los componentes clave de la aplicación reaccionan en tiempo real a la paleta del tema seleccionado (cambiando instantáneamente a verde Heineken o violeta Default), y la estrella de scoring presenta un acabado mate plano corporativo de alta calidad.
- **Pasos Lógicos/Arquitectónicos Recién Completados:**
  1. Extensión del sistema de diseño en `tailwind.config.js` y `globals.css` mediante el namespace `theme`.
  2. Sustitución sistemática de clases hardcodeadas en `VenueDetail.tsx`, `TicketModal.tsx` y `ThemeSelector.tsx`.
  3. Rediseño de la estrella vectorial en `VenueDetail.tsx` con tono `#d92518` plano y eliminación de sombras neón.
  4. Verificación estática con TypeScript (`npx tsc --noEmit` = **0 errores**).
- **Paso Inmediato:** Inspección visual y validación funcional en navegador por parte del usuario y Process Owners.

---

# Sprint 17: Refactor Visual Integral (Fase 1) - Header Corporativo y Desacople de Clases Hardcodeadas

## 📋 Resumen Ejecutivo
En este sprint se ejecutó la Fase 1 del refactor visual integral de Taschboard. Se eliminaron todas las clases de color violeta, índigo y ámbar hardcodeadas en los módulos principales, conectándolas a las CSS Custom Properties del tema activo. Asimismo, se implementó el Header Corporativo dinámico con fondo verde Heineken Corporate Green (`#205527`), tipografía blanca de alto contraste, controles translúcidos (`bg-white/10 hover:bg-white/20 border-white/20`) y branding corporativo visible mediante badge en la barra superior.

---

## 🏗️ Arquitectura y Modificaciones Técnicas

### 1. Tokenización y Extensión de Variables de Tema
- **`context/ThemeContext.tsx`:**
  - En `applyThemeVariables(theme: Theme)`, se inyectan en `:root`:
    - `--theme-header-bg`: `#205527` para Heineken (y configuraciones con fondo corporativo); `#111318` para Default y temas neutros.
    - `--theme-header-text`: `#ffffff` para asegurar legibilidad y contraste estricto WCAG AA.
  - En `FALLBACK_THEMES`, se actualizó la configuración de contingencia de Heineken registrando `header_bg: '#205527'` y `header_text: '#ffffff'`.
- **`tailwind.config.js`:**
  - Se extendió el namespace `theme` exponiendo:
    ```javascript
    'header-bg': 'var(--theme-header-bg, #111318)',
    'header-text': 'var(--theme-header-text, #ffffff)',
    ```
- **`styles/globals.css`:**
  - Declaradas las variables por defecto en `:root`: `--theme-header-bg: #111318;` y `--theme-header-text: #ffffff;`.

### 2. Header Corporativo y Branding Dinámico
- **`App.tsx`:**
  - En los tres encabezados (`InspectorAppContent`, `ClientAppContent` y `AdminAppContent`), se sustituyeron las clases estáticas `bg-slate-950/90 border-slate-800/50` por `bg-theme-header-bg text-theme-header-text border-b border-white/10 shadow-sm transition-colors duration-200`.
  - **Identidad de Marca:** Se incorporó un badge corporativo junto al título (`Inspector Dashboard`, `Dashboard Cliente`, `Panel de Administración`):
    ```tsx
    {currentTheme.slug === 'heineken' && (
      <span className="px-2.5 py-0.5 bg-white/15 text-white font-bold text-xs uppercase tracking-wider rounded border border-white/20 flex items-center gap-1.5 shrink-0">
        <span className="text-red-500 text-sm">★</span>
        {currentTheme.nombre}
      </span>
    )}
    ```
  - **Controles Secundarios Translúcidos:** Se rediseñaron los botones "Volver a Admin", "Cerrar Sesión", `ThemeSelector` y `LanguageSwitcher` a `bg-white/10 hover:bg-white/20 border border-white/20 text-white` para garantizar integración armoniosa con el verde Heineken.
  - Botón selector de rol activo ("Admin"): migrado a `bg-theme-primary text-white shadow-lg`.
- **`components/VenueDetail.tsx`:**
  - Cabecera adaptada a `bg-theme-header-bg text-theme-header-text border-b border-white/10`.

### 3. Barrido y Desacople de Clases Hardcodeadas
- **`components/AdminDashboard.tsx`:**
  - Las 9 pestañas de navegación activas ("Estadísticas", "Usuarios", "Tickets", "Lugares", "Regiones", "Productos", "Usuarios Pendientes", "Capacitaciones", "Ajustes"): reemplazado `bg-purple-600 text-white shadow-lg shadow-purple-500/20` por `bg-theme-primary text-white shadow-lg shadow-theme-primary/20`.
  - Spinner `Loader2`: de `text-purple-500` a `text-theme-primary`.
  - Botón "Reintentar": de `bg-purple-600 hover:bg-purple-500` a `bg-theme-primary hover:bg-theme-secondary`.
  - Subpestañas de productos ("Catálogo y Objetivos", "Asignación por Cliente"): de `bg-amber-600 text-white shadow-lg` a `bg-theme-primary text-white shadow-lg`.
- **`components/AdminStats.tsx`:**
  - En `colorMap.purple`: mapeado a `bg-theme-primary/20`, `text-theme-primary`, `border-theme-primary/30`, impactando la tarjeta de Venues y la barra de Administradores en "Distribución de Usuarios por Rol".
  - Corrección tipográfica en `colorMap.amber.text` (`text-amber-400`).
- **`components/InspectorHeader.tsx`:**
  - Pestañas activas ("Nueva Inspección", "Historial"): de `bg-amber-600 text-white` a `bg-theme-primary text-white shadow-lg shadow-theme-primary/20`.
- **`components/VenueSelectionForm.tsx`:**
  - Botón "Agregar Nuevo Punto de Venta": de `bg-amber-600/20 hover:bg-amber-600/30 border-amber-600/50` a `bg-theme-primary/20 hover:bg-theme-primary/30 border-theme-primary/50 text-white`.
  - Botón "Continuar Inspección" / submit: de `bg-amber-600 hover:bg-amber-500` a `bg-theme-primary hover:bg-theme-secondary`.
  - Spinner de carga y focos de inputs migrados a tokens `theme-primary`.
- **`components/FilterChip.tsx`:**
  - Mapeo por defecto de `amber` migrado de `bg-amber-500/20 text-amber-400 border-amber-500/50` a `bg-theme-primary/20 text-theme-primary border-theme-primary/50`. Con esto, todos los filtros de tiempo ("1M", "3M", "6M", "1Y", "YTD") y de regiones en `ManagerDashboard` y `ClientDashboard` responden dinámicamente al tema.
- **`components/ClientDashboard.tsx`:**
  - Botón flotante de tickets: de gradiente ámbar hardcodeado a `bg-gradient-to-r from-theme-secondary to-theme-primary hover:brightness-110`.
- **`components/PerformanceChart.tsx`:**
  - Línea principal de SVG (`stroke`), fill de gradiente (`<linearGradient>`), puntos (`dot`) y punto activo (`activeDot`) enlazados dinámicamente a `var(--theme-primary)` y `var(--theme-accent)`.
  - Focos de selector móvil y valor KPI de "Meses" vinculados a `theme-primary`.
- **`components/VenueTrainingAnalytics.tsx`:**
  - Botón "Ver Detalle": migrado de gradiente azul fijo a `bg-gradient-to-r from-theme-secondary to-theme-primary hover:brightness-110 text-white`.
  - Tarjeta "Total de Venues": icono desacoplado de púrpura a `bg-theme-primary/20 text-theme-primary`.
  - Filtro modal "Todos" e input de búsqueda enlazados a `theme-primary`.
- **`components/ManagerDashboard.tsx`:**
  - Spinner inicial y focos de selectores móviles vinculados a `theme-primary`.

---

## 📊 Inventario de Archivos Intervenidos

| Archivo | Tipo | Descripción de la Modificación |
|---|---|---|
| [`context/ThemeContext.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/context/ThemeContext.tsx) | Lógica & Estado | Inyección de `--theme-header-bg` (`#205527` para Heineken, `#111318` para Default) y `--theme-header-text` (`#ffffff`) en `:root`. |
| [`tailwind.config.js`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/tailwind.config.js) | Configuración | Exposición de utilidades `theme.header-bg` y `theme.header-text`. |
| [`styles/globals.css`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/styles/globals.css) | Estilos | Declaración de variables CSS fallback `--theme-header-bg` y `--theme-header-text` en `:root`. |
| [`App.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/App.tsx) | Orquestador | Aplicación de fondo corporativo verde Heineken en los headers de Inspector, Client y Admin; incorporación de badge visible con estrella roja y nombre de marca; botones translúcidos; selector de rol admin con `theme-primary`. |
| [`components/LanguageSwitcher.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/LanguageSwitcher.tsx) | UI Header | Estilizado translúcido (`bg-white/10 hover:bg-white/20 border-white/20 text-white`). |
| [`components/ThemeSelector.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ThemeSelector.tsx) | UI Header | Botón disparador con estilo translúcido armonizado con el fondo corporativo. |
| [`components/VenueDetail.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueDetail.tsx) | UI Venue | Cabecera superior adaptada a `bg-theme-header-bg text-theme-header-text border-white/10`. |
| [`components/AdminDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/AdminDashboard.tsx) | Panel Admin | Desacople de 9 pestañas de navegación, subpestañas de productos, loaders y botón reintentar de clases púrpuras a `theme-primary`. |
| [`components/AdminStats.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/AdminStats.tsx) | Panel Admin | `colorMap.purple` vinculado a tokens `theme-primary` para tarjetas y distribución de roles. |
| [`components/InspectorHeader.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/InspectorHeader.tsx) | Rol Inspector | Pestañas activas de inspección ("Nueva Inspección", "Historial") conectadas a `theme-primary`. |
| [`components/VenueSelectionForm.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueSelectionForm.tsx) | Rol Inspector | Botón "Agregar Nuevo Punto de Venta", botones de confirmación, spinners y focos adaptados a `theme-primary`. |
| [`components/FilterChip.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/FilterChip.tsx) | Filtros Globales | Chips activos de tiempo y región vinculados a `theme-primary`. |
| [`components/ClientDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ClientDashboard.tsx) | Rol Cliente | Botón flotante para creación de tickets vinculado a gradiente dinámico `theme-secondary` / `theme-primary`. |
| [`components/PerformanceChart.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/PerformanceChart.tsx) | Visualización | Trazos de línea SVG, áreas de gradiente y puntos enlazados a `var(--theme-primary)` y `var(--theme-accent)`. |
| [`components/VenueTrainingAnalytics.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueTrainingAnalytics.tsx) | Visualización | Botón "Ver Detalle", iconos y tabs de modal migrados a tokens `theme-primary`. |
| [`components/ManagerDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ManagerDashboard.tsx) | Dashboard | Spinners y focos de filtros móviles conectados a `theme-primary`. |
| [`todo.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/todo.md) | Seguimiento | Registro y completitud de las tareas de la Fase 17. |
| [`walkthrough.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/walkthrough.md) | Documentación | Bitácora técnica y funcional del Sprint 17 para Analistas Funcionales y Process Owners. |

---

## 🛡️ Verificación de Calidad y Pruebas Técnicas (Exclusivamente Estático)

- **Compilación de TypeScript:** `npx tsc --noEmit` completado exitosamente con **0 errores de compilación**.
- **Restricción de Testing Cumplida Estrictamente:** Sin pruebas sobre el DOM, sin emulación de navegador y sin capturas de pantalla, preservando el entorno para la inspección directa del usuario.

---

## 🚀 Project Walkthrough

- **Progreso Actual del Proyecto:** El header de la plataforma cuenta ahora con fondo verde Heineken Corporate Green (`#205527`), branding dinámico con estrella roja y controles translúcidos elegantes. Todas las pantallas principales (Admin, Inspector, Cliente, Gráficos y Filtros) tienen sus componentes interactivos completamente desacoplados de colores estáticos y sincronizados con el tema activo.
- **Pasos Lógicos/Arquitectónicos Recién Completados:**
  1. Inyección y mapeo de tokens CSS `--theme-header-bg` y `--theme-header-text`.
  2. Implementación de cabecera corporativa dinámica y branding de marca en `App.tsx` y `VenueDetail.tsx`.
  3. Sustitución exhaustiva de utilidades fijas en los 12 módulos de componentes principales.
  4. Verificación estática con TypeScript (`npx tsc --noEmit` = **0 errores**).
- **Paso Inmediato:** Pase a Sprint 18 para ajuste fino de contraste, layout y branding centrado.

---

# Sprint 18: Corrección Visual de Layout, Header Branding y Contraste de Filtros

## 🎯 Objetivo y Alcance
Resolver con precisión los cuatro desajustes visuales y de layout identificados tras el despliegue del Sprint 17:
1. **Botón Activo "Cliente":** Asignar el acento rojo corporativo (`#d92518`) al conmutador de rol cuando la vista seleccionada es "Cliente".
2. **Branding Dominante Centrado:** Elevar la jerarquía visual de la marca (`★ HEINEKEN`) colocándola en posición absoluta centrada en el header corporativo, eliminando el badge lateral pequeño.
3. **Normalización de Espaciado Superior en Cliente:** Aplicar el espaciado vertical estándar (`pt-6 space-y-6`) en `ClientDashboard.tsx` para equiparar la separación del layout con la vista de Inspector.
4. **Contraste en Filtros del Mapa:** Corregir el chip de filtro inactivo "Sin inspección" en el mapa de territorio, eliminando el renderizado negro opaco e ilegible mediante clases neutras estandarizadas.

---

## 🏗️ Modificaciones Técnicas y Arquitectónicas

### 1. Botón Activo "Cliente" (`App.tsx`)
- **Problema previo:** El botón de rol "Cliente" utilizaba un estilo activo genérico o no alineado al acento de marca.
- **Solución implementada:** Se actualizó la clase activa del botón "Cliente" a:
  ```tsx
  currentView === 'client' ? 'bg-theme-accent text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
  ```
  Al estar activo el tema Heineken (`--theme-accent: #d92518`), el botón se presenta con el rojo corporativo característico y sombra de elevación.

### 2. Branding de Marca Centrado y Dominante en Header (`App.tsx`)
- **Problema previo:** La estrella roja y el nombre de marca estaban en un badge lateral pequeño junto al título del dashboard, restando impacto visual a la identidad de marca.
- **Solución implementada:**
  - Se eliminó el badge lateral secundario en los encabezados de las tres vistas (`InspectorAppContent`, `ClientAppContent` y `AdminAppContent`).
  - Se estableció `relative` en la fila flex del encabezado.
  - Se incorporó un contenedor centrado con posicionamiento absoluto y `pointer-events-none select-none`:
    ```tsx
    {currentTheme.slug === 'heineken' && (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2.5 pointer-events-none select-none">
        <span className="text-red-500 text-2xl sm:text-3xl leading-none">★</span>
        <span className="text-xl sm:text-2xl font-black tracking-widest text-white uppercase drop-shadow-sm">
          {currentTheme.nombre}
        </span>
      </div>
    )}
    ```
  - Esto garantiza protagonismo de marca en el eje central de la pantalla sin desplazar los controles de la izquierda (logo y rol) ni los de la derecha (selector de tema, idioma y cierre de sesión).

### 3. Normalización de Espaciado Superior (`components/ClientDashboard.tsx`)
- **Problema previo:** En `ClientDashboard.tsx`, el contenedor principal carecía de padding superior, ocasionando que el bloque "Métricas por Producto" quedara inmediatamente pegado a la línea divisoria inferior del header corporativo.
- **Solución implementada:**
  - Se auditó el contenedor de `InspectorDashboard.tsx` (`py-6 pb-20`).
  - Se actualizó el wrapper principal en `ClientDashboard.tsx` incorporando `pt-6 space-y-6`:
    ```tsx
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 lg:px-8 pt-6 space-y-6">
    ```
  - Se logra una respiración visual homogénea entre el header corporativo y el contenido funcional en todas las vistas de la plataforma.

### 4. Corrección de Contraste en Filtros del Mapa (`components/FilterChip.tsx` y `OpportunityMap.tsx`)
- **Problema previo:** El filtro *"Sin inspección"* del mapa de oportunidades pasaba la propiedad `color="slate"`. Al no estar definido `"slate"` en el mapeo de colores de `FilterChip.tsx`, la evaluación resultaba en `undefined`, provocando que el botón se renderizara en negro opaco sin estilos de color de texto (texto negro sobre fondo oscuro, totalmente ilegible).
- **Solución implementada:**
  - Se amplió la firma tipada de `FilterChipProps` para admitir `'slate' | 'zinc'`.
  - Se definió la clase neutra estándar para estado inactivo:
    `bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 border-zinc-700/50`
  - Se asignaron estilos activos visibles para `slate`/`zinc`: `bg-zinc-600/50 text-white border-zinc-400/60`.
  - Ahora todos los chips inactivos presentan contraste consistente con texto legible (`text-zinc-300`) y bordes sutiles.

---

## 📋 Inventario de Archivos Intervenidos

| Archivo | Módulo / Capa | Resumen de la Intervención |
| :--- | :--- | :--- |
| [`App.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/App.tsx) | Enrutador y Layout | Fondo `bg-theme-accent` en botón activo "Cliente" (L1090-1094); branding centrado absoluto (`★ HEINEKEN`) en encabezados de Inspector, Cliente y Admin (L815-822, L909-916, L1041-1048); eliminación de badge lateral previo. |
| [`components/ClientDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ClientDashboard.tsx) | Rol Cliente | Agregado de padding superior `pt-6` en contenedor principal (L112) junto a `space-y-6` para separación con header corporativo. |
| [`components/FilterChip.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/FilterChip.tsx) | Componente UI | Soporte para colores `'slate' | 'zinc'`, estandarización de chips inactivos a `bg-zinc-800/80 text-zinc-300` y eliminación del valor `undefined` que producía el botón negro. |
| [`todo.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/todo.md) | Seguimiento | Registro y completitud de las tareas de la Fase 18. |
| [`walkthrough.md`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/walkthrough.md) | Documentación | Bitácora técnica y funcional del Sprint 18 para Analistas Funcionales y Process Owners. |

---

## 🛡️ Verificación de Calidad y Pruebas Técnicas (Exclusivamente Estático)

- **Compilación de TypeScript:** `npx tsc --noEmit` completado exitosamente con **0 errores de compilación**.
- **Restricción de Testing Cumplida Estrictamente:** Sin manipulación del DOM, sin emulación de navegadores ni capturas de pantalla, preservando el entorno para la inspección directa del usuario.

---

## 🚀 Project Walkthrough

- **Progreso Actual del Proyecto:** La plataforma Taschboard cuenta con una experiencia visual depurada y alineada con la identidad corporativa: el header exhibe la marca centralizada y dominante (`★ HEINEKEN`), el rol "Cliente" se resalta con el acento rojo corporativo, la vista de Cliente mantiene una separación armónica con el header, y los filtros del mapa presentan contraste y legibilidad óptimos en todos sus estados.
- **Pasos Lógicos/Arquitectónicos Recién Completados:**
  1. Vinculación del botón de rol activo "Cliente" a la variable `--theme-accent` (`#d92518`).
  2. Implementación de contenedor de branding centrado en `App.tsx` en las 3 vistas.
  3. Ajuste de padding `pt-6` en el layout de `ClientDashboard.tsx`.
  4. Extensión de variantes de color y normalización de chips inactivos en `FilterChip.tsx`.
  5. Verificación estática con TypeScript (`npx tsc --noEmit` = **0 errores**).
- **Paso Inmediato:** Inspección visual directa por parte del usuario y Process Owners en el navegador local (`http://localhost:5173`).

---

# 🚀 Sprint 19: Soporte Integral de Modo Claro y Modo Oscuro (Color Scheme) Desacoplado de Marca

## 📋 Resumen Ejecutivo para Analistas Funcionales y Process Owners
En este sprint se implementó la arquitectura completa y desacoplada de **Esquema de Color (Color Scheme: Dark / Light Mode)** para la plataforma Taschboard. Esta funcionalidad permite a todos los usuarios (Inspectores, Clientes y Administradores) alternar fluidamente entre una experiencia inmersiva oscura y una estética clara, limpia y corporativa mediante un conmutador interactivo (Sol/Luna) situado en el encabezado corporativo junto al selector de idioma.

La arquitectura garantiza que la paleta de marca multi-tenant (`btl_temas`) y en particular el **Header Corporativo en Verde Heineken Corporate (`#205527`)** permanezcan inalterados en ambos modos, garantizando coherencia de identidad visual y contraste óptimo en textos, tarjetas, formularios y gráficos analíticos.

---

## 🏗️ Arquitectura de Tokens Semánticos y Variables de Superficie

### 1. Variables Dinámicas de Superficie y Contenido (`ThemeContext.tsx` y `globals.css`)
Se incorporó el estado `colorScheme: 'dark' | 'light'` gestionado en [`ThemeContext.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/context/ThemeContext.tsx) con persistencia local (`taschboard_color_scheme`) e inyección reactiva en el elemento raíz `<html>` a través del atributo `data-color-scheme` y clases utilitarias (`dark` / `light`):

| Variable CSS | Modo Oscuro (`dark`) | Modo Claro (`light`) | Propósito Funcional |
| :--- | :--- | :--- | :--- |
| `--bg-app` | `#0f1117` | `#f4f5f7` | Fondo principal de la aplicación |
| `--bg-card` | `#181b23` | `#ffffff` | Superficie de tarjetas, paneles y contenedores modales |
| `--bg-card-subtle` | `#222631` | `#f8fafc` | Fondo de inputs, tablas secundarias y elementos anidados |
| `--text-main` | `#ffffff` | `#0f172a` | Tipografía principal, títulos y valores KPI |
| `--text-muted` | `#9ca3af` | `#64748b` | Subtítulos, etiquetas y texto secundario |
| `--border-subtle` | `#2d3342` | `#e2e8f0` | Líneas divisorias, bordes de tarjeta y contornos de inputs |
| `--theme-header-bg` | `#205527` (Inmutable) | `#205527` (Inmutable) | Header Corporativo Heineken intacto en ambos modos |
| `--theme-header-text` | `#ffffff` (Inmutable) | `#ffffff` (Inmutable) | Tipografía nítida sobre el header corporativo |

### 2. Extensión del Sistema de Diseño en Tailwind CSS (`tailwind.config.js`)
Se mapearon las variables semánticas en la configuración de Tailwind:
- `surface.app` -> `var(--bg-app)`
- `surface.card` -> `var(--bg-card)`
- `surface.card-subtle` -> `var(--bg-card-subtle)`
- `content.main` -> `var(--text-main)`
- `content.muted` -> `var(--text-muted)`
- `border.subtle` / `border-subtle` -> `var(--border-subtle)` (manteniendo compatibilidad con `border.DEFAULT`)

---

## 🧩 Componentes Creados y Refactorizados

1. **[`components/ColorSchemeToggle.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ColorSchemeToggle.tsx) [NUEVO]:**
   - Conmutador accesible que muestra el icono `Sun` en modo oscuro y `Moon` en modo claro (`lucide-react`).
   - Botón translúcido (`bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg p-2`) adaptado a los tres headers corporativos en [`App.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/App.tsx).
2. **Formularios, Modales e Inputs:**
   - [`TicketModal.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/TicketModal.tsx): Contenedor modal adaptado a `bg-surface-card border-border-subtle`, inputs y áreas de texto con `bg-surface-card-subtle border-border-subtle text-content-main placeholder:text-content-muted`.
   - [`VenueSelectionForm.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueSelectionForm.tsx): Tarjetas de punto de venta, inputs de búsqueda y formularios de alta tokenizados a superficies dinámicas.
   - [`ThemeSelector.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ThemeSelector.tsx): Desplegable flotante migrado a `bg-surface-card border-border-subtle text-content-main` con hover `bg-surface-card-subtle`.
3. **Dashboards y Módulos Analíticos:**
   - [`ClientDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ClientDashboard.tsx) & [`App.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/App.tsx): Fondos de vistas principales adaptados a `bg-surface-app text-content-main`.
   - [`PerformanceChart.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/PerformanceChart.tsx): Recharts SVG adaptado con fallbacks inline para `CartesianGrid` (`var(--border-subtle, #e2e8f0)`), ejes `XAxis` e `YAxis` (`var(--text-muted, #64748b)`), y `Tooltip` (`backgroundColor: var(--bg-card, #ffffff)`, `borderColor: var(--border-subtle, #e2e8f0)`, `color: var(--text-main, #0f172a)`).
   - [`KPICard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/KPICard.tsx): Tarjetas de métricas adaptadas a `bg-surface-card border-border-subtle text-content-main text-content-muted`.
   - [`ProductMetrics.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ProductMetrics.tsx): Selectores, cuadros de precios y contenedores de métricas tokenizados.
   - [`VenueDetail.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueDetail.tsx): Ficha técnica, checklists, galería y observaciones migradas a superficies semánticas.
   - [`VenueTrainingAnalytics.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueTrainingAnalytics.tsx): Tarjetas de progreso, filtros y modal de detalle adaptados a tokens de superficie y bordes sutiles.
   - [`ManagerDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ManagerDashboard.tsx) & [`FilterChip.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/FilterChip.tsx): Selectores de fecha y filtros de región normalizados con `bg-surface-card` y `border-border-subtle`.
   - [`InspectorHeader.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/InspectorHeader.tsx) & [`AdminDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/AdminDashboard.tsx) & [`AdminStats.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/AdminStats.tsx): Navegación de pestañas secundarias y tarjetas estadísticas adaptadas a tokens de superficie.

---

## 🛡️ Verificación de Calidad y Pruebas Técnicas (Exclusivamente Estático)

- **Compilación de TypeScript:** `npx tsc --noEmit` completado exitosamente con **0 errores de compilación**.
- **Restricción de Testing Cumplida Estrictamente:** Sin manipulación del DOM, sin emulación de navegadores ni capturas de pantalla, preservando el entorno para la inspección directa del usuario.

---

## 🚀 Project Walkthrough

- **Progreso Actual del Proyecto:** Taschboard cuenta con soporte completo de Modo Claro y Modo Oscuro plenamente desacoplado del theming corporativo. En Modo Claro, la interfaz adopta una paleta limpia y luminosa (`#f4f5f7` de fondo, tarjetas blancas `#ffffff`, bordes `#e2e8f0`, texto de alto contraste `#0f172a`), preservando en todo momento el encabezado institucional en Verde Heineken (`#205527`) con tipografía blanca pura.
- **Pasos Lógicos/Arquitectónicos Recién Completados:**
  1. Extensión de `ThemeContext` con `colorScheme: 'dark' | 'light'`, `toggleColorScheme()` y persistencia en `localStorage`.
  2. Inyección de variables CSS semánticas (`--bg-app`, `--bg-card`, `--bg-card-subtle`, `--text-main`, `--text-muted`, `--border-subtle`) en `:root` y clases `.dark`/`.light`.
  3. Mapeo en `tailwind.config.js` (`surface.*`, `content.*`, `border.*`).
  4. Creación del componente `ColorSchemeToggle.tsx` e integración en los 3 encabezados (`InspectorAppContent`, `ClientAppContent`, `AdminAppContent`).
  5. Refactorización de todos los formularios, inputs, modales, gráficos Recharts y tarjetas a tokens semánticos.
  6. Validación estática con TypeScript (`npx tsc --noEmit` = **0 errores**).
- **Paso Inmediato:** Validación visual directa en el navegador por parte del usuario y Process Owners alternando entre el modo Sol y Luna mediante el conmutador del header.

---

# Sprint 20: Refinamiento Visual, Contraste de Alertas, Desacople de Fondos Residuales y Theming Integral de Loaders

## 🎯 Contexto y Objetivos del Sprint
1. **Atenuación de Luminancia y Calibración de Superficies:** Reducir el encandilamiento visual en Modo Claro ajustando la superficie base a un tono neutro atenuado y delimitando con nitidez las tarjetas blancas e inputs.
2. **Fallbacks Inmunes a Parpadeos Iniciales:** Prevenir destellos de acento violeta durante la carga inicial alineando `:root` por defecto a los tonos corporativos de Heineken.
3. **Contraste Accesible en Alertas Críticas:** Reparar la legibilidad de la tarjeta de advertencia en métricas de producto para cumplir con el estándar WCAG en ambos modos de color.
4. **Erradicación de Fondos Negros Residuales:** Migrar el contenedor raíz de `ManagerDashboard` y todas las tarjetas analíticas secundarias (`CompetitionChart`, `PricePositioningChart`, `OpportunityBreakdown`, `VenueTable`, `OpportunityMap`) a tokens semánticos de superficie (`bg-surface-app`, `bg-surface-card`, `border-border-subtle`).
5. **Arquitectura Homogénea de Estados de Carga:** Crear `LoadingSpinner.tsx` como componente centralizado y sustituir todos los loaders con colores hardcodeados (`text-purple-*`, `border-amber-*`, etc.) por la animación dinámica vinculada a `theme-primary` y `bg-surface-app`.

---

## 🛠️ Arquitectura y Modificaciones Técnicas

### 1. Calibración de Superficies y Tokens Inmunes a Destellos
- **[`context/ThemeContext.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/context/ThemeContext.tsx):**
  - `--bg-app`: Calibrado a `#ebedf0` en modo claro para reducir deslumbramiento y ofrecer un contraste neto con las tarjetas (`#ffffff`).
  - `--border-subtle`: Calibrado a `#d5d9e2` para bordes de tarjetas y divisores nítidos.
- **[`styles/globals.css`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/styles/globals.css):**
  - Variables estáticas en `:root` actualizadas a la identidad Heineken:
    - `--theme-primary: #008200;`
    - `--theme-secondary: #205527;`
    - `--theme-accent: #ff2b00;`
    - `--theme-header-bg: #205527;`
  - Clases `.light` y `[data-color-scheme="light"]` sincronizadas con `--bg-app: #ebedf0;` y `--border-subtle: #d5d9e2;`.

### 2. Contraste WCAG en Notificaciones de Producto
- **[`components/ProductMetrics.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ProductMetrics.tsx):**
  - Banner *"Atención Requerida"*:
    - **Modo Claro:** `bg-red-50 border border-red-200 text-red-900 font-medium`.
    - **Modo Oscuro:** `dark:bg-red-950/30 dark:border-red-800/40 dark:text-red-200`.
  - Icono de alerta y texto secundario sincronizados cromáticamente (`text-red-700 dark:text-red-400` y `text-red-800 dark:text-red-300/80`).

### 3. Eliminación de Fondos Oscuros Residuales en Dashboard de Cliente
- **[`components/ManagerDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ManagerDashboard.tsx):**
  - Sustituido el contenedor raíz oscuro `bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950` por `${readOnly ? '' : 'min-h-screen'} bg-surface-app text-content-main`.
  - La barra de filtros ahora reposa directamente sobre la superficie clara/oscura sin bandas negras.
- **[`components/CompetitionChart.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/CompetitionChart.tsx):**
  - Contenedor principal y estado vacío migrados a `bg-surface-card border border-border-subtle text-content-main`.
  - Gráficos Recharts adaptados dinámicamente con `CartesianGrid` (`var(--border-subtle, #d5d9e2)`), `XAxis`/`YAxis` (`var(--text-muted, #64748b)`), y `Tooltip` (`backgroundColor: var(--bg-card, #ffffff)`).
- **[`components/PricePositioningChart.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/PricePositioningChart.tsx):**
  - Tarjeta de gráfico de torta de precios migrada a `bg-surface-card border border-border-subtle text-content-main text-content-muted`.
  - Tooltip adaptado a variables de superficie y texto.
- **[`components/OpportunityBreakdown.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/OpportunityBreakdown.tsx):**
  - Tarjetas de puntaje de oportunidad y estado vacío tokenizadas a `bg-surface-card border border-border-subtle text-content-main text-content-muted`.
- **[`components/VenueTable.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueTable.tsx):**
  - Tabla de puntos de venta y estado vacío migrados a `bg-surface-card border border-border-subtle`.
  - Cabecera en `bg-surface-card-subtle text-content-muted` y filas con hover dinámico `hover:bg-surface-card-subtle`.
- **[`components/OpportunityMap.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/OpportunityMap.tsx):**
  - Contenedor de mapa adaptado a `bg-surface-card border border-border-subtle text-content-main`.
- **[`components/FilterChip.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/FilterChip.tsx):**
  - Estado inactivo optimizado para alto contraste: `bg-surface-card text-content-main border border-border-subtle hover:bg-surface-card-subtle shadow-sm`.

### 4. Componente Centralizado y Estandarización de Loaders
- **[`components/LoadingSpinner.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/LoadingSpinner.tsx) [NUEVO COMPONENTE]:**
  - Props: `size ('sm' | 'md' | 'lg')`, `className`, `fullScreen`, `text`.
  - Renderizado en overlay completo: `fixed inset-0 bg-surface-app/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center`.
  - Anillo con animación de giro dinámico corporativo: `border-theme-primary border-t-transparent rounded-full animate-spin`.
- **Sustitución Sistemática en Vistas y Módulos:**
  - **[`App.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/App.tsx):** `LoadingScreen` migrado a `LoadingSpinner` a pantalla completa sobre `bg-surface-app`. Pantalla de confirmación de email tokenizada con `text-theme-primary`.
  - **[`components/UserManagement.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/UserManagement.tsx):** Loader púrpura sustituido por `<LoadingSpinner size="lg" text="Cargando usuarios..." />`.
  - **[`components/TicketManagement.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/TicketManagement.tsx):** Loader púrpura sustituido por `<LoadingSpinner size="lg" text={t('common.loading')} />`.
  - **[`components/PendingUsersManagement.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/PendingUsersManagement.tsx):** Loader púrpura sustituido por `<LoadingSpinner size="lg" text="Cargando solicitudes..." />`.
  - **[`components/ClientVenueManager.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ClientVenueManager.tsx):** Spinners ámbar y púrpura sustituidos por `<LoadingSpinner size="sm" />`.
  - **[`components/VenueDetail.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/VenueDetail.tsx):** Fondo negro `bg-slate-950` y spinner ámbar sustituidos por `<div className="min-h-screen flex items-center justify-center bg-surface-app text-content-main"><LoadingSpinner size="lg" text={t('common.loading')} /></div>`.
  - **[`components/ManagerDashboard.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ManagerDashboard.tsx):** Spinner manual reemplazado por `<LoadingSpinner size="lg" text="Cargando dashboard..." />` sobre `bg-surface-app`.
  - **[`components/ProductMetrics.tsx`](file:///c:/Users/Franco/OneDrive/Documents/Clientes/Santi%20Guasch/Taschboard/dashboard/components/ProductMetrics.tsx):** Loader manual en tarjeta de métricas reemplazado por `<LoadingSpinner size="md" />`.

---

## 🛡️ Verificación de Calidad y Pruebas Técnicas (Exclusivamente Estático)
- **Compilación de TypeScript:** `npx tsc --noEmit` completado exitosamente con **0 errores de compilación**.
- **Restricción de Testing Cumplida Estrictamente:** Cero manipulación del DOM, sin herramientas de emulación ni capturas de pantalla, preservando el entorno para la inspección directa del usuario.

---

## 🚀 Project Walkthrough

- **Progreso Actual del Proyecto:** Taschboard ha completado la calibración visual de Modo Claro y la homogenización integral de estados de carga. La aplicación elimina cualquier encandilamiento mediante una base neutra atenuada (`#ebedf0`), bordes nítidos (`#d5d9e2`), tarjetas blancas limpias (`#ffffff`) y contraste accesible (WCAG) en alertas. Todas las pantallas de carga y spinners ahora se adaptan automáticamente a la paleta del tema seleccionado (`theme-primary`) y a la superficie activa (`bg-surface-app`), erradicando parpadeos violetas residuales o fondos negros aislados.
- **Pasos Lógicos/Arquitectónicos Recién Completados:**
  1. Calibración de luminancia y bordes en `ThemeContext.tsx` y `styles/globals.css`.
  2. Sustitución de variables de arranque `:root` por los tonos de marca corporativa Heineken.
  3. Accesibilidad y alto contraste en el banner de advertencia de `ProductMetrics.tsx`.
  4. Desacople y tokenización de todas las tarjetas analíticas de `ManagerDashboard.tsx` (`CompetitionChart`, `PricePositioningChart`, `OpportunityBreakdown`, `VenueTable`, `OpportunityMap`).
  5. Creación del componente unificado `LoadingSpinner.tsx`.
  6. Estandarización de loaders en `App.tsx`, `UserManagement.tsx`, `TicketManagement.tsx`, `PendingUsersManagement.tsx`, `ClientVenueManager.tsx`, `VenueDetail.tsx`, `ManagerDashboard.tsx` y `ProductMetrics.tsx`.
  7. Validación estática de tipos con TypeScript (`npx tsc --noEmit` = **0 errores**).
- **Paso Inmediato:** Validación visual en pantalla por parte del usuario en Modo Claro y Modo Oscuro, verificando la ausencia de encandilamiento y la suavidad de las transiciones en los estados de carga.




