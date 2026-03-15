# Documentación de Métricas - Dashboard BTL SaaS

## Introducción

Este documento detalla cómo se calculan los Key Performance Indicators (KPIs) y puntajes en el dashboard. La fuente de verdad para estos cálculos se encuentra en los archivos `utils/scoreCalculations.ts` y `utils/scoreConfig.ts`.

---

## 1. Puntaje Global (Global Score)

El **Puntaje Global** es el indicador principal de la calidad de ejecución en el punto de venta. Se calcula automáticamente para cada inspección (vinculada a un producto específico) y se persiste en `btl_inspecciones.global_score`. Un trigger de base de datos (`update_venue_global_score`) actualiza el campo `btl_puntos_venta.global_score` con el score de la última inspección.

**Fórmula Maestra:**
```
Global Score = (Visibilidad × 0.4) + (Material POP × 0.3) + (Stock × 0.2) + (Conocimiento × 0.1)
```

### Desglose de Componentes

#### A. Visibilidad (40%) — `calculateVisibilityScore()`
Evalúa qué tan destacado está el producto en la barra. Se compone de dos sub-factores:

1.  **Visibilidad en Back Bar (60 puntos max):**
    *   `Destacado / Prominent`: 60 pts
    *   `Visible`: 40 pts
    *   `Oculto / Hidden`: 10 pts
    *   *(Si no está presente, 0 pts)*

2.  **Posición en Estante (40 puntos max):**
    *   `Superior / Top`: 40 pts
    *   `Medio / Middle`: 20 pts
    *   `Inferior / Bottom`: 5 pts

#### B. Material POP (30%) — `calculatePOPScore()`
Evalúa la presencia de material promocional.
*   **Base:** 50 puntos si hay *algún* material (`tiene_material_pop` = true).
*   **Cantidad:** +10 puntos por cada tipo de material adicional en `pos_materials`.
*   **Tope:** Máximo 100 puntos.
*   *Si no hay material ni presencia base, el puntaje es 0.*

#### C. Stock (20%) — `calculateStockScore()`
Basado en el nivel cualitativo reportado por el inspector.
*   `Adecuado / Adequate`: 100 pts
*   `Bajo / Low`: 50 pts
*   `Crítico / Agotado / Out`: 0 pts

#### D. Conocimiento & Advocacy (10%) — `calculateKnowledgeScore()`
Evalúa la capacitación y predisposición del staff.
*   **Conocimiento del Staff (40% de este componente):** Nivel 1-10 escalado a 10-100.
*   **Capacitación (40%):** % de bartenders certificados sobre el total de bartenders.
*   **Brand Advocacy (20%):**
    *   `Alta / High`: 100 pts
    *   `Media / Medium`: 50 pts
    *   `Baja / Low`: 0 pts

---

## 2. Segmentación de Puntos de Venta (Venue Status)

Los puntos de venta se clasifican automáticamente según su **Global Score** usando la función `calculateVenueStatus()`. Los umbrales están definidos en `scoreConfig.ts`.

| Estado | Definición | Umbral | Color |
|---|---|---|---|
| **Estratégico** | Ejecución excelente, modelo a seguir. | **≥ 85 pts** | 🟢 Verde |
| **Oportunidad** | Ejecución promedio con potencial de mejora. | **≥ 60 y < 85 pts** | 🟡 Ámbar |
| **Riesgo** | Ejecución deficiente, requiere atención inmediata. | **< 60 pts** | 🔴 Rojo |

Adicionalmente, en el mapa (`OpportunityMap.tsx`), los venues que **no tienen inspección para el producto seleccionado** se muestran en **gris** (⚪ Sin inspección).

---

## 3. Métricas por Producto (ProductMetrics)

El componente `ProductMetrics.tsx` muestra tres indicadores clave para el producto seleccionado, calculados sobre las inspecciones del período y región filtrados.

### 3.1 Presencia en PDV
*   **Definición:** Porcentaje de inspecciones donde `tiene_producto = true`.
*   **Cálculo:** `(inspecciones con producto / total inspecciones) × 100`
*   **Objetivo:** Definido por `btl_productos.objetivo_presencia`.

### 3.2 Disponibilidad Stock
*   **Definición:** Porcentaje de inspecciones con stock disponible (no agotado).
*   **Cálculo:** `(inspecciones con stock ≠ 'agotado' / total inspecciones) × 100`
*   **Objetivo:** Definido por `btl_productos.objetivo_stock`.

### 3.3 Material POP
*   **Definición:** Porcentaje de inspecciones con material POP presente.
*   **Cálculo:** `(inspecciones con tiene_material_pop = true / total inspecciones) × 100`
*   **Objetivo:** Definido por `btl_productos.objetivo_pop`.

> **Nota:** Las métricas se recalculan automáticamente cuando cambia el producto seleccionado, el filtro de fecha o la región. Los filtros de fecha soportados son: 1M, 3M, 6M, 1Y, YTD.

---

## 4. Análisis de Oportunidades (Opportunity Score)

Este puntaje (0-10) prioriza qué venues tienen mayor potencial de crecimiento basado en brechas de ejecución. Se visualiza en `OpportunityBreakdown.tsx`.

**Fórmula:**
```
Opportunity Score = ( (% Presencia × 0.35) + (% POP × 0.25) + (% Stock × 0.25) + (% Activaciones × 0.15) ) / 10
```

Se calcula sobre el **total de inspecciones** del período seleccionado:
1.  **% Presencia (35%):** Porcentaje de inspecciones donde `tiene_producto = true`.
2.  **% POP (25%):** Porcentaje de inspecciones donde `tiene_material_pop = true`.
3.  **% Stock (25%):** Porcentaje de inspecciones donde `stock_estimado > 0`.
4.  **% Activaciones (15%):** Porcentaje de inspecciones donde `activacion_ejecutada = true`.

---

## 5. KPIs del Dashboard (Manager View)

Estas métricas aparecen en las tarjetas superiores (`KPICard`) del `ManagerDashboard.tsx`. **Se filtran por el producto seleccionado** en `ClientDashboard`.

### 5.1 Cobertura de Venues
*   **Definición:** Cantidad de puntos de venta únicos visitados en el período.
*   **Cálculo:** `Count(Distinct punto_venta_id)` en las inspecciones filtradas por producto y fecha.

### 5.2 Cumplimiento (Compliance)
*   **Definición:** Score promedio de ejecución en las visitas para el producto seleccionado.
*   **Cálculo:** Promedio del campo `global_score` de las inspecciones filtradas por producto y fecha.
*   **Tooltip:** "Promedio del puntaje de ejecución de las inspecciones del producto seleccionado en el período actual."

### 5.3 Activaciones
*   **Definición:** Total de acciones BTL ejecutadas.
*   **Cálculo:** Sumatoria de inspecciones donde `activacion_ejecutada = true`.

---

## 6. Mapa Interactivo (OpportunityMap)

El mapa utiliza el `selectedProductId` del dashboard para colorear los venues:

1.  **Con inspección para el producto:** Color basado en el `global_score` de la inspección (Estratégico / Oportunidad / Riesgo).
2.  **Sin inspección para el producto:** Gris (⚪).
3.  **Popup del venue:** Muestra el score y estado si tiene inspección, o "Sin inspección" si no.

---

## 7. Trigger de Base de Datos: `update_venue_global_score`

Cuando se crea una nueva inspección (`INSERT` en `btl_inspecciones`), un trigger automáticamente:
1.  Toma el `global_score` de la nueva inspección.
2.  Actualiza el campo `global_score` en `btl_puntos_venta` para ese venue.
3.  Actualiza `last_inspection_date` con la fecha de la inspección.

Esto garantiza que el score del venue en la tabla de venues siempre refleje la **última inspección realizada**.

---

## 8. Glosario de Campos de Base de Datos

### `btl_inspecciones`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `producto_id` | UUID | Producto específico inspeccionado |
| `tiene_producto` | Boolean | Presencia básica del producto |
| `stock_nivel` | VARCHAR | Nivel de stock (Alto, Medio, Bajo, Agotado) |
| `visibilidad_score` | DECIMAL | Puntaje de visibilidad calculado |
| `global_score` | NUMERIC | Puntaje global calculado (0-100) |
| `tiene_material_pop` | Boolean | Presencia de material POP |
| `material_pop_tipos` | TEXT[] | Tipos de material POP encontrados |
| `detalles` | JSONB | Desglose granular (checklist, valores crudos) |
| `compliance_score` | NUMERIC | Alias legacy del global_score |

### `btl_puntos_venta`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `global_score` | NUMERIC | Score de la última inspección (via trigger) |
| `last_inspection_date` | TIMESTAMPTZ | Fecha de la última inspección (via trigger) |
| `segmento` | TEXT | Clasificación del venue (Premium, Estándar, Masivo) |
| `potencial_ventas` | TEXT | Potencial de ventas (Alto, Medio, Bajo) |
| `region_id` | UUID | Región geográfica asignada |

### `btl_productos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `objetivo_presencia` | DECIMAL | Meta de presencia (%) |
| `objetivo_stock` | DECIMAL | Meta de stock (%) |
| `objetivo_pop` | DECIMAL | Meta de material POP (%) |
| `competidores` | TEXT[] | Lista de marcas competidoras |
| `configuracion` | JSONB | Configuración de perfect serve checklist |
