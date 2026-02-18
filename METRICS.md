# Documentación de Métricas - Dashboard BTL SaaS

## Introducción

Este documento detalla cómo se calculan los Key Performance Indicators (KPIs) en el dashboard. Todos los cálculos se basan en datos en tiempo real provenientes de la tabla `btl_inspecciones` y sus tablas relacionadas.

---

## 1. Métricas de Ejecución en Punto de Venta (PDV)

### 1.1 Porcentaje de Presencia (% Presencia)

Mide la disponibilidad física del producto en el punto de venta al momento de la inspección.

**Fórmula:**
```
% Presencia = (Total Productos Encontrados / Total Productos Objetivo) * 100
```

*   **Fuente de Datos:** Tabla `btl_inspeccion_productos`.
*   **Filtro:** Solo considera inspecciones realizadas en el periodo seleccionado.
*   **Nivel de Agregación:** Puede calcularse por PDV, por Región, por Cliente o Global.

### 1.2 Porcentaje de Stock (% Stock)

Indica el nivel de inventario disponible en el punto de venta.

**Cálculo:**
Se asigna un valor numérico a cada nivel cualitativo de stock reportado por el inspector:
*   `Alto`: 100%
*   `Medio`: 66%
*   `Bajo`: 33%
*   `Agotado`: 0%

**Fórmula:**
```
% Stock Promedio = Promedio(Valor Numérico de Stock) de todas las inspecciones en el periodo
```

*   **Fuente de Datos:** Columna `stock_nivel` en `btl_inspeccion_productos`.

### 1.3 Cumplimiento de Material POP (% POP)

Mide la implementación correcta de material promocional (Point of Purchase) según los estándares de la marca.

**Fórmula:**
```
% POP = (Inspecciones con Material POP "Sí" / Total Inspecciones) * 100
```
O, si se evalúa por producto:
```
% POP Producto = (Productos con Material POP "Sí" / Total Productos Inspeccionados) * 100
```

*   **Fuente de Datos:** Columna `tiene_material_pop` en `btl_inspeccion_productos`.

---

## 2. Métricas de Cobertura y Eficiencia

### 2.1 Cobertura de Visitas

Porcentaje de puntos de venta visitados respecto al total del universo asignado.

**Fórmula:**
```
Cobertura = (PDVs Visitados Únicos / Total PDVs Activos) * 100
```

*   **Fuente de Datos:** Tablas `btl_inspecciones` (conteo distinto de `punto_venta_id`) y `btl_puntos_venta` (total activos).

### 2.2 Efectividad de Visita

Mide si la visita fue exitosa (se pudo realizar la inspección completa).

**Fórmula:**
```
Efectividad = (Inspecciones Exitosas / Total Visitas Realizadas) * 100
```

*   **Nota:** Una visita se considera "Exitosa" si se completaron todos los campos obligatorios del formulario (implícito en el diseño de la base de datos, ya que `btl_inspecciones` requiere datos mínimos).

---

## 3. Score Perfect Serve

Índice compuesto que evalúa la calidad de la ejecución en el punto de venta.

**Componentes (Ponderación sugerida):**
*   Presencia: 40%
*   Visibilidad (POP): 30%
*   Stock: 20%
*   Precio Correcto (si aplica): 10%

**Fórmula:**
```
Score Perfect Serve = (Score Presencia * 0.4) + (Score Visibilidad * 0.3) + (Score Stock * 0.2) + (Score Precio * 0.1)
```

*   **Rango:** 0 - 100 puntos.
*   **Fuente de Datos:** Agregación de métricas individuales calculadas anteriormente.

---

## 4. Gráficos del Dashboard de Cliente

### 4.1 Gráfico de Rendimiento de Marca (`PerformanceChart`)

Muestra la evolución mensual de métricas clave a lo largo del tiempo. Los datos se agregan por mes calendario a partir de las inspecciones registradas.

**Métricas disponibles:**

| Métrica | Cálculo |
|---|---|
| Índice de Ejecución | Promedio de `compliance_score` de todas las inspecciones del mes |
| Visibilidad (Presencia) | `(Inspecciones con tiene_producto = true / Total del mes) × 100` |
| Material POP | `(Inspecciones con tiene_material_pop = true / Total del mes) × 100` |
| Visitas | Conteo total de inspecciones del mes |

- **Fuente de Datos:** Columnas `fecha_inspeccion`, `compliance_score`, `tiene_producto`, `tiene_material_pop` de `btl_inspecciones`.
- **Período:** Últimos 7 meses con datos registrados.
- **Comparativa:** Se muestra la variación porcentual respecto al mes anterior.

---

### 4.2 Gráfico de Competencia (`CompetitionChart`)

Muestra la frecuencia de aparición de competidores en las inspecciones. Tiene dos modos según los datos disponibles:

**Modo 1 — Competidores nombrados** *(prioritario)*

Si las inspecciones contienen el nombre del competidor principal (`competidor_principal` / `competitor_presence` / `main_competitor`), se muestra un ranking de los 7 competidores más frecuentes.

```
Frecuencia = Conteo de inspecciones donde el campo competidor = nombre_marca
Orden: Descendente por frecuencia
```

**Modo 2 — Nivel de presencia** *(fallback)*

Si no hay nombres de competidores, se agrupa por nivel de visibilidad (`presencia_competencia`):
- `Alta` / `high`
- `Media` / `medium`
- `Baja` / `low`

**Estado vacío:** Si ninguna inspección tiene datos de competencia, se muestra un mensaje indicando que los inspectores deben completar la sección de competencia en el formulario.

- **Fuente de Datos:** Campos `competidor_principal`, `competitor_presence`, `presencia_competencia` de `btl_inspecciones`.

---

### 4.3 Análisis de Oportunidades (`OpportunityBreakdown`)

Calcula un **puntaje de oportunidad ponderado (0–10)** a partir de métricas reales de inspección.

**Componentes y ponderación:**

| Componente | Campo en DB | Peso |
|---|---|---|
| Presencia de Marca | `tiene_producto = true` | 35% |
| Material POP | `tiene_material_pop = true` | 25% |
| Stock Disponible | `stock_estimado > 0` | 25% |
| Activaciones | `activacion_ejecutada = true` | 15% |

**Fórmula del puntaje:**
```
Puntaje = ((% Presencia × 0.35) + (% Material × 0.25) + (% Stock × 0.25) + (% Activaciones × 0.15)) / 10
```

Cada porcentaje se calcula como:
```
% Componente = (Inspecciones donde campo = true / Total Inspecciones) × 100
```

- **Rango:** 0.0 – 10.0 puntos.
- **Fuente de Datos:** Columnas `tiene_producto`, `tiene_material_pop`, `stock_estimado`, `activacion_ejecutada` de `btl_inspecciones`.
- **Estado vacío:** Si no hay inspecciones, se muestra un mensaje informativo.

---

## 5. Notas Técnicas

*   **Periodos de Tiempo:** Todas las métricas permiten filtrado por rangos de fechas (Hoy, Esta Semana, Este Mes, Personalizado).
*   **Segmentación:** Los datos pueden desglosarse por:
    *   Región / Ciudad
    *   Canal (On-Premise vs Off-Premise)
    *   Categoría de Producto
    *   Inspector Asignado
*   **Modo Demo:** Al acceder con `/?mode=demo`, todos los gráficos muestran datos de ejemplo predefinidos en lugar de datos reales de la base de datos.
