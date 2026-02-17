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

## 4. Notas Técnicas

*   **Periodos de Tiempo:** Todas las métricas permiten filtrado por rangos de fechas (Hoy, Esta Semana, Este Mes, Personalizado).
*   **Segmentación:** Los datos pueden desglosarse por:
    *   Región / Ciudad
    *   Canal (On-Premise vs Off-Premise)
    *   Categoría de Producto
    *   Inspector Asignado
