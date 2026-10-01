# Manual del Administrador - Dashboard BTL SaaS (v1.8.3)

## Introducción

Este documento constituye la guía operativa integral para los usuarios con rol **Administrador (`admin`)** en el ecosistema Taschboard BTL. Como administrador, dispones de control absoluto sobre la arquitectura multi-tenant, la seguridad de datos mediante políticas RLS (Row Level Security), la gestión de catálogos y la analítica ejecutiva.

---

## 1. Control de Acceso y Gestión de Usuarios

El acceso al sistema está restringido por diseño. No existe registro autónomo sin supervisión (*self-serve signup*): toda cuenta registrada requiere aprobación explícita o asignación directa por parte de un administrador.

### 1.1 Flujo de Aprobación de Usuarios Pendientes
1. Cuando un usuario nuevo completa el formulario de registro en la interfaz de autenticación, su perfil se inserta en `btl_usuarios` con el estado `estado_aprobacion = 'pending'`.
2. Dirígete a la barra lateral izquierda y haz clic en el módulo **Usuarios Pendientes**.
3. El panel lista todas las solicitudes pendientes indicando nombre, correo electrónico y fecha de registro.
4. Para autorizar el acceso:
   - Haz clic en **Aprobar**.
   - Asigna el rol correspondiente (**Inspector** o **Cliente**).
   - Asigna opcionalmente la **Empresa** para activar su identidad visual corporativa.
5. Para denegar el acceso, haz clic en **Rechazar**. El usuario quedará bloqueado y no podrá iniciar sesión.

### 1.2 Definición de Roles del Sistema
* **Administrador (`admin`):** Acceso irrestricto a todos los módulos, herramientas de administración, configuración multi-tenant, selector global de temas y dashboards en modo auditor.
* **Cliente (`client`):** Perfil ejecutivo de marca. Visualiza métricas consolidadas, KPIs de ejecución, gráficos de competencia y mapa interactivo exclusivamente para los productos y venues que le han sido asignados. Su tema visual corporativo está bloqueado según su empresa.
* **Inspector (`inspector`):** Personal operativo de campo. Accede al catálogo general de venues para levantar formularios de inspección en tiempo real, registrar datos de stock, material POP, precios de carta y participar en capacitaciones.

### 1.3 Asignación de Empresa (Multi-Tenant Branding)
En la creación o edición de usuarios en **Gestión de Usuarios**:
1. El campo **Empresa** cuenta con autocompletado interactivo (`<datalist>`) sincronizado con los temas registrados en la base de datos (ej. `Heineken`, `Imperial`, `Default`).
2. Al asignar una empresa a un usuario con rol `client` o `inspector`, el sistema forzará automáticamente el tema visual corporativo correspondiente a esa marca en todos sus inicios de sesión.

---

## 2. Gestión de Productos por Cliente (`btl_cliente_productos`)

Para garantizar la privacidad y el aislamiento analítico entre marcas, los usuarios con rol `client` solo pueden visualizar los productos que un administrador les vincule explícitamente.

### 2.1 Vinculación de Productos
1. Accede al módulo **Gestión de Usuarios** y selecciona la pestaña **Asignar Productos** (o el módulo directo de **Productos por Cliente**).
2. Selecciona al usuario cliente en la lista desplegable.
3. Marca los productos o SKUs del catálogo que este cliente debe supervisar.
4. Haz clic en **Guardar Asignaciones**.

### 2.2 Comportamiento en el Dashboard del Cliente
* **Carga Inicial Determinística:** Al autenticarse el cliente, el sistema recupera sus productos asignados y selecciona automáticamente el primer producto disponible (por orden alfabético), cargando sus métricas sin mezclas de datos ni condiciones de carrera.
* **Selector de Productos:** En la esquina superior izquierda del dashboard, el cliente dispone de un menú desplegable para alternar entre sus SKUs asignados.
* **Desacople Arquitectónico:** La selección de productos opera exclusivamente como un filtro analítico en memoria y base de datos. Conmutar entre SKUs asignados no altera el tema corporativo ni la paleta de colores del cliente.

---

## 3. Asignación de Venues a Clientes (`btl_clientes_venues`)

Los puntos de venta (Venues) que un cliente supervisa en su mapa y tablas analíticas deben asignarse explícitamente.

1. Ve al módulo **Gestión de Usuarios** > pestaña **Asignar Venues**.
2. Selecciona al Cliente en el menú desplegable.
3. Marca los Venues correspondientes utilizando los filtros de búsqueda rápida por nombre o región.
4. Haz clic en **Guardar Asignaciones**.

> **Nota Operativa:** Los Inspectores tienen visibilidad global sobre todos los venues para garantizar operatividad continua en auditorías de campo sin bloqueos de asignación previa.

---

## 4. Catálogo de Productos, Competencia y Precios de Referencia

El módulo **Productos** centraliza la configuración de SKUs, metas de ejecución comercial y parámetros de precios.

### 4.1 Alta y Edición de Productos
1. Ingresa a **Productos** y presiona **Nuevo Producto**.
2. Completa los campos fundamentales: Nombre comercial, Marca, Categoría y Formato.
3. **Precio de Referencia (`precio_referencia`):** Configura el valor monetario esperado o sugerido de venta al público en los locales. Este valor activa la analítica de desvío de precios.
4. **Objetivos de Ejecución (Targets):**
   * Presencia Mínima esperada (%).
   * Cobertura de Stock (%).
   * Cobertura de Material POP (%).
5. **Competidores Configurados:** Define las marcas competidoras directas contra las cuales los inspectores evaluarán la presencia en góndola/barra durante cada visita.

### 4.2 Analítica de Pricing y Posicionamiento
La configuración del `precio_referencia` alimenta automáticamente dos componentes analíticos clave en los dashboards:
* **KPI de Desviación de Precio:** Compara el promedio del precio de carta (`precio_venta` registrado por inspectores) contra el `precio_referencia`.
  * $\le \pm 5\%$: Verde (En rango esperado).
  * $\pm 5\%$ a $\pm 15\%$: Ámbar (Alerta moderada).
  * $> \pm 15\%$: Rojo (Desviación crítica).
* **Posicionamiento vs Competencia (`PricePositioningChart`):** Gráfico de dona que resume si el producto se comercializa a precio superior (`premium`), igual (`equal`) o inferior (`lower`) respecto a las marcas competidoras presentes en el local.

### 4.3 Importación Masiva desde Excel
Para cargar catálogos masivos:
1. Haz clic en **Importar Productos**.
2. Descarga la plantilla estructurada Excel (.xlsx).
3. Carga el archivo completado. El importador validará columnas requeridas y registrará los SKUs de forma atómica.

---

## 5. Gestión de Venues y Geolocalización Interactiva

El módulo de **Puntos de Venta (Venues)** administra los establecimientos auditados por el personal de campo.

### 5.1 Alta de Puntos de Venta con Pin Interactivo
1. En el módulo **Venues**, haz clic en **Nuevo Venue**.
2. Completa los datos comerciales: Nombre, Dirección, Canal/Segmento (Bar, Restaurante, Discoteca, etc.) y Región asignada.
3. **Geolocalización con Mapa (`VenueLocationPicker`):**
   * Haz clic sobre el mapa integrado (alimentado por la capa CARTO Positron) o arrastra el marcador rojo hasta el punto geográfico exacto del establecimiento.
   * Las coordenadas (Latitud y Longitud) se sincronizarán y rellenarán automáticamente con precisión milimétrica.
4. Guarda el registro.

### 5.2 Importación Masiva de Venues
1. En la cabecera del módulo, selecciona **Importar Venues**.
2. Carga un archivo Excel con la lista de locales (columnas: Nombre, Dirección, Región, Latitud, Longitud, Segmento).
3. El sistema procesará los registros informando venues nuevos añadidos y duplicados actualizados.

---

## 6. Gestión Territorial de Regiones

El módulo **Regiones** permite estructurar la segmentación geográfica para agrupar métricas operativas y puntos de venta.

1. Ingresa a **Regiones**.
2. Puedes crear nuevas regiones (ej. CABA, GBA Norte, Rosario, Córdoba) o actualizar nombres existentes.
3. Estas regiones alimentan los filtros de navegación (scroll horizontal en desktop y selectores ergonómicos en mobile) en todos los dashboards.

---

## 7. Branding Multi-Tenant y Temas Visuales (Pestaña "Ajustes")

Taschboard incorpora un motor de temas dinámicos persistidos en base de datos (`btl_temas`), permitiendo personalizar colores e identidad por cliente.

### 7.1 Panel de Configuración de Temas (`SettingsManagement`)
1. Ingresa a la pestaña **Ajustes** en la barra lateral del Panel Admin.
2. Visualizarás los temas activos en el ecosistema (ej. `default`, `heineken`).
3. Para cada tema puedes configurar:
   * **Nombre y Slug:** Identificador único normalizado (en minúsculas, ej. `heineken`).
   * **Colores Semánticos:** Color Primario, Color Secundario, Acento, Fondo de Tarjeta, Bordes y Superficies.
   * **Estrella de Scoring:** Activa el badge vectorial de estrella roja para marcas específicas (como Heineken) en la cabecera y tarjetas de venue.
4. **Previsualización en Vivo:** Las tarjetas de previsualización reflejan el contraste visual de textos, botones y fondos en tiempo real antes de guardar cambios.

### 7.2 Selector Global de Temas en Cabecera (`ThemeSelector`)
* Los **Administradores** disponen de un selector de temas en vivo en la barra superior (`<ThemeSelector />`).
* Permite alternar instantáneamente entre los temas corporativos cargados para auditar la visualización exacta que experimentará cada cliente.
* Este selector está **completamente oculto e inaccesible** para roles de Cliente e Inspector, garantizando que dichos usuarios permanezcan anclados a la identidad de su empresa.

### 7.3 Conmutador de Modo Claro / Modo Oscuro
Junto al selector de temas, el icono interactivo de Sol/Luna (`ColorSchemeToggle`) permite conmutar entre el esquema claro y oscuro. Todos los tokens semánticos de Tailwind (`bg-surface-card`, `border-border-subtle`, `text-content-primary`, etc.) se adaptan automáticamente para asegurar máxima legibilidad y contraste.

---

## 8. Auditoría de Inspecciones y Métricas de Competencia

En el dashboard analítico del administrador, se supervisa la calidad y consistencia del relevamiento de campo.

### 8.1 Criterio de Agregación de Competencia
* **Conteo Estricto por Presencia Física:** El sistema evalúa si el competidor fue confirmado afirmativamente en el relevamiento (`present === true`). Si un competidor no fue observado físicamente, no sumará frecuencia de presencia ni distorsionará los porcentajes de visibilidad.
* **Saneamiento Automático de Cadenas Residuales:** Valores como `'No hay'`, `'ninguno'`, `'n/a'` o cadenas vacías son descartados automáticamente por el pipeline de saneamiento (`isValidCompetitorName`).
* **Filtro Histórico Completo (`all`):** La barra de filtros temporales incluye la opción "Histórico Completo", la cual consulta hasta 5,000 registros históricos sin truncamiento muestral.

---

## 9. Sistema de Capacitaciones (`TrainingManagement`)

El módulo **Capacitaciones** permite formar y certificar a los inspectores de campo para elevar el estándar de auditoría.

1. Ve a **Capacitaciones**.
2. **Crear Sesión:** Define Título, Descripción, Fecha, Hora, Cupo Máximo y Temario asociado.
3. **Registro de Asistencias y Calificaciones:** Una vez finalizada la sesión, el administrador registra a los inspectores asistentes e introduce la nota obtenida (evaluación de conocimientos).
4. **Impacto en Métricas:** La calificación alimenta el *Knowledge Score* que se pondera en las métricas de calidad de la agencia.

---

## 10. Gestión de Tickets y Soporte (`TicketManagement`)

Canal centralizado de comunicación para atender incidencias técnicas, solicitudes operativas de clientes o dudas de inspectores.

1. Ve a **Gestión de Tickets**.
2. Los tickets entrantes reflejan prioridad (Baja, Media, Alta, Urgente) y categoría.
3. Abre un ticket para:
   * Asignar un responsable técnico.
   * Publicar comentarios visibles para el solicitante.
   * Añadir notas internas (visibles únicamente para administradores).
   * Actualizar el estado: `abierto` $\to$ `en_progreso` $\to$ `resuelto` $\to$ `cerrado`.

---

## 11. Seguridad, Métricas del Sistema y Panel de Debug

### 11.1 Panel de Estado de Seguridad (`SecurityStatus`)
Ubicado en el Panel Admin, audita en tiempo real:
* Estado de las políticas RLS en todas las tablas activas.
* Integridad de la sesión y expiración de tokens JWT.
* Estado de los triggers de base de datos.

### 11.2 Panel de Debug (`DebugPanel`)
Herramienta avanzada accesible para administradores destinada a diagnosticar:
* Respuestas crudas de Supabase.
* Variables de entorno cargadas en el cliente (`VITE_SUPABASE_URL`, etc.).
* Tiempos de latencia en consultas y trazabilidad de eventos.
