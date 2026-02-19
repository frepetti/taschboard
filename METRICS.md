# Documentación de Métricas - Dashboard BTL SaaS

## Introducción

Este documento detalla cómo se calculan los Key Performance Indicators (KPIs) y puntajes en el dashboard. La fuente de verdad para estos cálculos se encuentra en los archivos `utils/scoreCalculations.ts` y `utils/scoreConfig.ts`.

---

## 1. Puntaje Global (Global Score / Perfect Serve)

El **Puntaje Global** es el indicador principal de la calidad de ejecución en el punto de venta. Se calcula automáticamente en cada inspección y se promedia a nivel de venue.

**Fórmula Maestra:**
```javascript
Global Score = (Visibilidad × 0.4) + (Material POP × 0.3) + (Stock × 0.2) + (Conocimiento × 0.1)
```

### Desglose de Componentes

#### A. Visibilidad (40%) (`calculateVisibilityScore`)
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

#### B. Material POP (30%) (`calculatePOPScore`)
Evalúa la presencia de material promocional.
*   **Base:** 50 puntos si hay *algún* material (`tiene_material_pop` = true).
*   **Cantidad:** +10 puntos por cada tipo de material adicional registrado en `pos_materials`.
*   **Tope:** Máximo 100 puntos.
*   *Nota: Si no hay material ni presencia base, el puntaje es 0.*

#### C. Stock (20%) (`calculateStockScore`)
Basado en el nivel cualitativo reportado por el inspector.
*   `Adecuado / Adequate`: 100 pts
*   `Bajo / Low`: 50 pts
*   `Crítico / Agotado / Out`: 0 pts

#### D. Conocimiento & Advocacy (10%) (`calculateKnowledgeScore`)
Evalúa la capacitación y predisposición del staff.
*   **Conocimiento del Staff (40% de este componente):** Nivel 1-10 escalado a 10-100.
*   **Capacitación (40%):** % de bartenders certificados sobre el total de bartenders.
*   **Brand Advocacy (20%):**
    *   `Alta / High`: 100 pts
    *   `Media / Medium`: 50 pts
    *   `Baja / Low`: 0 pts

---

## 2. Segmentación de Puntos de Venta (Venue Status)

Los puntos de venta se clasifican automáticamente en tres categorías según su **Puntaje Global Promedio**, calculado al momento de generar el mapa o listados.

| Estado | Definición | Umbral de Puntaje (`scoreConfig.ts`) | Color |
|---|---|---|---|
| **Estratégico** | Ejecución excelente, modelo a seguir. | **>= 85 pts** | 🟢 Verde |
| **Oportunidad** | Ejecución promedio con potencial de mejora. | **>= 60 pts y < 85 pts** | 🟡 Ámbar |
| **Riesgo** | Ejecución deficiente, requiere atención inmediata. | **< 60 pts** | 🔴 Rojo |

*Nota: Alternativamente, si el venue tiene asignado un segmento (`Gold`, `Silver`, `Bronze`) en la base de datos, este puede prevalecer para la categorización inicial.*

---

## 3. Análisis de Oportunidades (Opportunity Score)

Este puntaje (0-10) prioriza qué venues tienen mayor potencial de crecimiento basado en brechas de ejecución. Se visualiza en el gráfico de "Análisis de Oportunidades" (`OpportunityBreakdown.tsx`).

**Fórmula:**
```
Opportunity Score = ( (% Presencia × 0.35) + (% POP × 0.25) + (% Stock × 0.25) + (% Activaciones × 0.15) ) / 10
```

Se calcula sobre el **total de inspecciones** del periodo seleccionado:
1.  **% Presencia (35%):** Porcentaje de inspecciones donde `tiene_producto = true`.
2.  **% POP (25%):** Porcentaje de inspecciones donde `tiene_material_pop = true`.
3.  **% Stock (25%):** Porcentaje de inspecciones donde `stock_estimado > 0`.
4.  **% Activaciones (15%):** Porcentaje de inspecciones donde `activacion_ejecutada = true`.

---

## 4. KPIs del Dashboard (Manager View)

Estas métricas aparecen en las tarjetas superiores del dashboard (`KPICard`) en `ManagerDashboard.tsx`.

### 4.1 Cobertura de Venues
*   **Definición:** Cantidad de puntos de venta únicos visitados en el periodo seleccionado.
*   **Cálculo:** `Count(Distinct punto_venta_id)` en las inspecciones filtradas.

### 4.2 Cumplimiento (Compliance)
*   **Definición:** Calidad promedio de ejecución en todas las visitas.
*   **Cálculo:** Promedio simple del campo `compliance_score` (que corresponde al Global Score calculado al momento de la inspección) de todas las inspecciones del periodo.

### 4.3 Activaciones
*   **Definición:** Total de acciones BTL ejecutadas.
*   **Cálculo:** Sumatoria de inspecciones donde `activacion_ejecutada = true`.

---

## 5. Glosario de Campos de Base de Datos

*   `btl_inspecciones`:
    *   `detalles`: Campo JSONB que guarda el desglose granular (respuestas de checklist, valores crudos de visibilidad, etc.).
    *   `global_score` / `compliance_score`: El puntaje final calculado (0-100) guardado en la inspección para consultas rápidas.
    *   `tiene_producto`: Booleano, indica presencia básica.
