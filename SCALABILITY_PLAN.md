# 🚀 Plan de Escalabilidad - Dashboard BTL SaaS

> Este documento recopila las mejoras planificadas para la próxima versión del sistema,
> enfocadas en escalabilidad, rendimiento y arquitectura.

---

## 1. Migración a Enfoque Híbrido: PostgREST + Edge Functions

**Estado actual:** Todas las consultas van directo del frontend a Supabase PostgREST (con RLS).  
**Problema potencial:** A medida que crezca el volumen de usuarios, se necesita validación extra, caching y mejor separación de responsabilidades.

### Propuesta

| Operación | Método actual | Método propuesto | Beneficio |
|-----------|--------------|------------------|-----------|
| Lecturas simples (venues, productos, listas) | PostgREST directo | **Mantener PostgREST** | Rápido, RLS lo protege |
| Escrituras críticas (crear inspección, crear ticket) | PostgREST directo | **Edge Function** | Validación server-side, notificaciones, audit log |
| Analytics y reportes | PostgREST directo | **Edge Function + cache** | Evita recalcular en cada request |
| Auth y perfil | PostgREST directo | **Mantener PostgREST** | Supabase Auth ya lo gestiona |

### Beneficios esperados
- Validación de negocio centralizada en el servidor (ej: límite de inspecciones por hora)
- Capa de cache para analytics (reduce carga en DB)
- Menor exposición del schema de la base de datos
- Posibilidad de agregar rate limiting granular

### Riesgos a considerar
- Mayor latencia en escrituras (+1 hop)
- Más código a mantener (cada endpoint)
- Límite de invocaciones en Edge Functions según plan de Supabase

---

## 2. Caching de Analytics

**Estado actual:** Cada vez que un cliente abre el dashboard, se recalculan todas las métricas en vivo.  
**Problema:** Con muchos venues/inspecciones, las queries de agregación se vuelven pesadas.

### Propuesta
- Implementar cache en Edge Function con TTL de 5 minutos para datos de analytics.
- Alternativa: tabla precalculada `btl_analytics_cache` que se actualiza con un cron job de Supabase.
- Los filtros de fecha/región/producto generan una cache key única.

---

## 3. Paginación en Listados

**Estado actual:** Algunos listados (inspecciones, venues) traen todos los registros.  
**Problema:** Con +1000 registros, el tiempo de carga y el consumo de memoria del navegador aumentan.

### Propuesta
- Implementar paginación server-side con `.range(from, to)` de Supabase.
- Agregar componente de paginación reutilizable.
- Lazy loading en tablas largas.

---

## 4. Optimización de Queries

### 4.1 Índices de base de datos
- Crear índices compuestos para las queries más frecuentes:
  - `btl_inspecciones(producto_id, punto_venta_id, fecha_inspeccion)`
  - `btl_inspecciones(usuario_id, fecha_inspeccion)`
  - `btl_puntos_venta(region_id, global_score)`

### 4.2 Reducir over-fetching
- Reemplazar `select('*')` por selects específicos en lecturas frecuentes.
- Usar views materializadas para analytics complejos.

---

## 5. Rate Limiting

**Estado actual:** No hay límites de uso.  
**Problema:** Un usuario podría hacer requests excesivos (intencional o accidentalmente).

### Propuesta
- Rate limiting en Edge Functions (ej: max 60 requests/minuto por usuario).
- Límite de inspecciones por inspector por día (configurable desde `btl_config`).
- Limitar uploads de fotos (tamaño máximo, cantidad por inspección).

---

## 6. Observabilidad y Monitoreo

### Propuesta
- Logging estructurado en Edge Functions.
- Alertas de Supabase para queries lentas (> 1s).
- Dashboard de salud del sistema (conexiones activas, latencia promedio).
- Error tracking con Sentry o similar.

---

## 7. Exportación y Reportes

### Propuesta
- Exportar reportes en PDF (actualmente solo datos en pantalla).
- Generación asíncrona de reportes pesados (queue + notificación cuando esté listo).
- Exportación Excel de inspecciones con filtros.

---

## 8. Mejoras de UX para Escala

### Propuesta
- Búsqueda con debounce en listados de venues y productos.
- Skeleton loaders en vez de spinners genéricos.
- Optimistic updates en escrituras (mostrar el cambio antes de confirmación del servidor).
- Notificaciones push (web notifications) para tickets y aprobaciones.

---

## 9. Modo Offline (Inspectores)

**Estado actual:** Requiere conexión para crear inspecciones.  
**Problema:** Inspectores en campo pueden tener conectividad limitada.

### Propuesta
- Service Worker para cache de datos estáticos (venues, productos).
- Queue de inspecciones offline que sincroniza al recuperar conexión.
- Indicador visual de estado de conexión.

---

## Priorización Sugerida

| Prioridad | Mejora | Trigger para implementar |
|-----------|--------|--------------------------|
| 🔴 Alta | Paginación en listados | Cuando haya +500 inspecciones |
| 🔴 Alta | Índices de base de datos | Cuando queries superen 500ms |
| 🟡 Media | Edge Functions para escrituras | Cuando haya +50 usuarios activos |
| 🟡 Media | Cache de analytics | Cuando dashboard tarde +2s en cargar |
| 🟡 Media | Rate limiting | Cuando haya +100 usuarios |
| 🟢 Baja | Modo offline | Cuando inspectores reporten problemas de conexión |
| 🟢 Baja | Reportes PDF | Cuando clientes lo soliciten |
| 🟢 Baja | Notificaciones push | Próxima versión mayor |

---

**Última actualización:** Marzo 2026  
**Versión:** 1.0.0
