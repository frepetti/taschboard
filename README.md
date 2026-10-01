# 🥃 Dashboard SaaS Premium - Trade Marketing & BTL (v1.8.3)

## 🎯 Descripción

Dashboard premium para agencias de trade marketing y activaciones BTL que atienden marcas líderes de bebidas y consumo masivo. Sistema integral de gestión de inspecciones de campo, analítica ejecutiva de pricing y competencia, gestión de productos, geolocalización de puntos de venta y administración multi-tenant.

### ✨ Características Principales

- 🎨 **Multi-Tenant Theming & Branding** - Identidad visual corporativa por empresa (`btl_temas`), soporte de esquemas claro/oscuro, logos SVG oficiales y tokens de color semánticos.
- 👥 **Control de Acceso Multi-Rol** - 3 roles diferenciados (Inspector, Cliente, Administrador) regidos por políticas RLS y aprobación manual.
- 📊 **Analytics Ejecutivos y de Pricing** - KPIs de ejecución, desviación porcentual de precios (`precio_referencia` vs `precio_venta`), y gráfico de dona de posicionamiento de mercado.
- 📦 **Gestión de Catálogo y Asignación N:M** - Administración de SKUs con competidores directos y asignación granular de productos por cliente (`btl_cliente_productos`).
- 🗺️ **Mapeo Cartográfico CARTO Positron** - Infraestructura Leaflet con teselas CARTO Positron de alta resolución, selectores interactivos con pin arrastrable (`VenueLocationPicker`) y soporte de API key libre de marcas de agua.
- ⚔️ **Auditoría de Competencia Polimórfica** - Métrica de presencia física estricta (`c.present === true`), saneamiento de etiquetas residuales y filtro "Histórico Completo" (`limit(5000)`).
- 🎓 **Capacitaciones y Evaluaciones** - Gestión integral de sesiones, registro de asistencia y evaluación con ponderación en el *Knowledge Score*.
- 📍 **Gestión y Geolocalización de Venues** - Importación masiva desde Excel, asignación a clientes y cálculo automático de `global_score`.
- 📱 **Responsividad Adaptativa** - Navegación ergonómica optimizada para desktop (scroll horizontal de regiones) y dispositivos móviles (selectores desplegables unificados).
- 🔐 **Autenticación y Seguridad Avanzada** - Supabase Auth, Row Level Security estricto, protección contra inyecciones y bloqueo de interferencias Web3/MetaMask.
- 🎫 **Sistema de Soporte y Tickets** - Seguimiento de tickets con hilos de comentarios públicos e internos para administradores.
- 🌐 **Internacionalización** - Soporte nativo para español e inglés.

---

## 🚀 Estado Actual

### ✅ En Producción
El sistema se encuentra **desplegado y 100% operativo** sobre infraestructura Vercel (Frontend) y Supabase (Backend PostgreSQL):
- ✅ Autenticación con Supabase Auth (signup, login, recovery).
- ✅ Base de datos PostgreSQL con RLS estricto y triggers de consistencia.
- ✅ Todos los portales activos (Inspector de Campo, Dashboard de Cliente, Panel Administrador).
- ✅ Theming corporativo multi-tenant persistido en base de datos (`btl_temas`).
- ✅ Selector de temas en cabecera en caliente para administradores y bloqueo automático por empresa para clientes.
- ✅ Carga inicial determinística con guardas de montaje (`LoadingSpinner`) y desacople total entre theming y selección de productos.
- ✅ Métricas de pricing con semáforo de desviación porcentual y gráfico donut de posicionamiento competitivo.
- ✅ Importadores masivos desde Excel para productos y venues.
- ✅ Visualización cartográfica territorial CARTO Positron.
- ✅ Tooltips semánticos con tokens de Tailwind CSS para todos los gráficos Recharts.

---

## 📁 Estructura del Proyecto

### Enrutamiento (SPA con query params)

| URL | Modo | Descripción |
|-----|------|-------------|
| `/` | Landing | Página principal con accesos a todos los portales |
| `/?mode=demo` | Demo | Dashboard completo interactivo con datos de demostración |
| `/?mode=inspector` | Inspector | Relevamiento, checklist de campo y registro de inspecciones |
| `/?mode=client` | Cliente | Dashboard analítico ejecutivo de marca (solo lectura) |
| `/?mode=admin` | Admin | Panel maestro de configuración, administración y auditoría |
| `/?mode=update_password` | Recovery | Formulario seguro para restablecimiento de credenciales |

### Componentes Principales

```
/components/
├── 🔐 Autenticación
│   ├── AdminAuth.tsx             - Login/Signup para Administradores
│   ├── ClientAuth.tsx            - Login/Signup para Clientes de Marca
│   ├── InspectorAuth.tsx         - Login/Signup para Inspectores de Campo
│   └── UpdatePassword.tsx        - Flujo de actualización de contraseña
│
├── 📊 Dashboards
│   ├── AdminDashboard.tsx        - Panel de administración y auditoría
│   ├── ClientDashboard.tsx       - Dashboard de cliente (orquestador con carga reactiva)
│   ├── InspectorDashboard.tsx    - Dashboard para personal de campo
│   └── ManagerDashboard.tsx      - Núcleo analítico, KPIs y agregación de métricas
│
├── 📦 Gestión de Productos y Pricing
│   ├── ProductManagement.tsx     - CRUD de productos y precio de referencia
│   ├── ProductImporter.tsx       - Importador masivo de SKUs desde Excel
│   ├── ProductMetrics.tsx        - KPIs de producto, desvío de precio y ejecución
│   ├── ProductSelector.tsx       - Selector de SKU asignado para clientes
│   ├── ProductSelectorInspection.tsx - Selector de producto para inspecciones
│   └── ClientProductManagement.tsx - Asignación granular de SKUs por cliente
│
├── 🏢 Gestión y Geolocalización de Venues
│   ├── VenueManager.tsx          - CRUD maestro de puntos de venta
│   ├── VenueLocationPicker.tsx   - Selector geográfico interactivo con pin arrastrable
│   ├── VenueImporter.tsx         - Importación masiva desde Excel
│   ├── VenueSelectionForm.tsx    - Selector de venue para auditorías
│   ├── VenueTable.tsx            - Tabla de puntos de venta con scores globales
│   ├── VenueDetail.tsx           - Ficha técnica de venue + historial de acciones BTL
│   ├── ClientVenueManager.tsx    - Asignación de venues a clientes de marca
│   └── ClientSelectionForm.tsx   - Selector de cliente para asignaciones
│
├── 🎨 Multi-Tenant Theming & Branding
│   ├── SettingsManagement.tsx    - Gestión y edición de temas corporativos (Admin)
│   ├── ThemeSelector.tsx         - Selector de temas en cabecera en caliente (Admin)
│   └── ColorSchemeToggle.tsx     - Conmutador de esquema Modo Claro / Modo Oscuro
│
├── 📋 Inspecciones y Relevamiento
│   ├── InspectionForm.tsx        - Formulario de inspección (stock, POP, precios de carta)
│   ├── InspectionHistory.tsx     - Historial con filtros temporales y de región
│   └── InspectorHeader.tsx       - Barra de navegación y perfil del inspector
│
├── 🎓 Capacitaciones
│   ├── TrainingManagement.tsx    - CRUD y evaluación de capacitaciones (Admin)
│   ├── TrainingList.tsx          - Lista de entrenamientos e inscripción (Inspector)
│   └── VenueTrainingAnalytics.tsx - Analítica de capacitación por punto de venta
│
├── 🎫 Tickets y Usuarios
│   ├── TicketManagement.tsx      - Gestión y resolución de tickets de soporte
│   ├── TicketModal.tsx           - Modal de creación y comentarios en tickets
│   ├── UserManagement.tsx        - Gestión de usuarios y asignación de empresa
│   ├── PendingUsersManagement.tsx - Bandeja de aprobación de usuarios pendientes
│   └── AdminStats.tsx            - Métricas y estadísticas de uso del sistema
│
├── 📈 Visualizaciones y Gráficos
│   ├── KPICard.tsx               - Tarjetas métricas con micro-gráficos
│   ├── PerformanceChart.tsx      - Rendimiento temporal (desktop chips / mobile dropdown)
│   ├── CompetitionChart.tsx      - Análisis de presencia y visibilidad de competidores
│   ├── PricePositioningChart.tsx - Gráfico Donut de posicionamiento de precio vs competencia
│   ├── OpportunityMap.tsx        - Mapa interactivo CARTO Positron filtrado por producto
│   ├── OpportunityBreakdown.tsx  - Análisis de brechas de visibilidad y POP
│   ├── ActivationTimeline.tsx    - Cronograma histórico de activaciones BTL
│   ├── InsightCard.tsx           - Tarjetas de insights accionables
│   ├── FilterChip.tsx            - Chips de filtrado interactivo con scroll horizontal
│   ├── Tooltip.tsx               - Tooltip genérico del sistema
│   └── RegionManager.tsx         - Configuración territorial de regiones
│
└── 🎨 UI Base
    ├── LoadingSpinner.tsx        - Spinner de carga reactivo y accesible
    └── /ui/                      - Librería de componentes UI (81+ componentes Radix)
```

### Contextos y Utilidades

```
/context/
└── ThemeContext.tsx       - Motor de theming multi-tenant, resolución por empresa y persistencia

/utils/
├── AuthContext.tsx        - Contexto de sesión, roles (admin/client/inspector) y perfil de usuario
├── LanguageContext.tsx    - Contexto de internacionalización (ES/EN)
├── competitionUtils.ts    - Saneamiento y validación estricta de nombres de competidores
├── scoreCalculations.ts   - Algoritmos de scoring (Global, Visibility, POP, Stock, Knowledge)
├── scoreConfig.ts         - Ponderaciones y umbrales de evaluación
├── badges.ts              - Sistema de insignias y gamificación
├── constants.ts           - Constantes del sistema
├── formatters.ts          - Formateo seguro de divisas y porcentajes (Intl.NumberFormat)
├── notifications.ts       - Notificaciones tipo toast (Sonner)
├── translations.ts        - Diccionario bilingüe para labels analíticos y de pricing
└── supabase/
    ├── client.ts          - Cliente cliente singleton de Supabase
    └── info.tsx           - Metadatos de conexión
```

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Bundler & Build Tool** | Vite 7 |
| **Diseño y Estilos** | Tailwind CSS v3 + CSS Variables dinámicas |
| **Backend & DB** | Supabase (PostgreSQL, Auth, Edge Functions, Storage) |
| **Motor Cartográfico** | Leaflet + Capa de teselas CARTO Positron |
| **Gráficos Analíticos** | Recharts (ResponsiveContainer, PieChart, BarChart, LineChart) |
| **Componentes Accesibles** | Radix UI Primitives |
| **Iconografía** | Lucide React |
| **Procesamiento de Archivos**| read-excel-file |
| **Notificaciones** | Sonner |
| **Infraestructura Cloud** | Vercel (Frontend) + Supabase Cloud (Backend) |

---

## 📖 Documentación Relacionada

| Documento | Audiencia / Propósito |
|---|---|
| [README.md](README.md) | 📋 Resumen técnico y arquitectura general del sistema |
| [ADMIN_MANUAL.md](ADMIN_MANUAL.md) | 👑 Manual operativo para Administradores (v1.8.3) |
| [DEPLOY.md](DEPLOY.md) | 🚀 Guía maestra de despliegue, infraestructura y CI/CD |
| [METRICS.md](METRICS.md) | 📊 Fórmulas analíticas, pesos de score y métricas de pricing |
| [USER_MANUAL.md](USER_MANUAL.md) | 👤 Guía para usuarios finales e inspectores |
| [SECURITY_CONFIGURATION.md](SECURITY_CONFIGURATION.md) | 🔐 Auditoría de políticas RLS y seguridad |
| [SCALABILITY_PLAN.md](SCALABILITY_PLAN.md) | 🚀 Hoja de ruta técnica para escalabilidad |
| [TESTING.md](TESTING.md) | 🧪 Protocolos de validación estática y testing |
| [Attributions.md](Attributions.md) | 🙏 Créditos y licencias de terceros |

---

## 🗄️ Base de Datos

### Tablas Principales

| Tabla | Propósito y Contenido |
|---|---|
| `btl_usuarios` | Perfiles de usuario, roles (`admin`, `client`, `inspector`), estado de aprobación y `empresa` |
| `btl_temas` | Configuración multi-tenant: slugs, nombres, paletas semánticas y banderas de branding |
| `btl_puntos_venta` | Venues auditados con coordenadas geográficas, segmento, región y `global_score` |
| `btl_productos` | Catálogo de SKUs, competidores configurados, metas de ejecución y `precio_referencia` |
| `btl_cliente_productos` | Tabla de asociación N:M para asignar productos permitidos a cada cliente |
| `btl_clientes_venues` | Tabla de asociación N:M para restringir venues visibles por cliente |
| `btl_inspecciones` | Relevamientos de campo (1 por SKU por visita), checklist, POP, competidores y `precio_venta` |
| `btl_reportes` | Tickets de soporte técnico y requerimientos operativos |
| `btl_ticket_comentarios` | Mensajes e hilos de comentarios públicos o internos por ticket |
| `btl_capacitaciones` | Entrenamientos para inspectores con cupos, fecha y temarios |
| `btl_capacitacion_asistentes`| Registro de asistencia y evaluación de inspectores |
| `btl_temas_capacitacion` | Catálogo maestro de asignaturas y temas formativos |
| `btl_regiones` | Catálogo geográfico de regiones operativas |
| `btl_acciones` | Historial de activaciones BTL ejecutadas en cada venue |
| `btl_config` | Parámetros globales y configuración del sistema |

---

## 🔄 Arquitectura Desacoplada: Theming vs Datos

El sistema implementa una separación estricta entre la **Identidad Visual Corporativa** y el **Filtrado Analítico de Datos**:

1. **Theming y Marca (`ThemeContext`):**
   - Determinado por el atributo `empresa` en `btl_usuarios`.
   - Se resuelve contra `btl_temas`. Modifica las variables CSS globales, colores primarios/secundarios, acentos y el logo de la cabecera.
   - Es inmutable para clientes e inspectores (sin selector en cabecera ni mutación por selección de SKU).
2. **Filtrado Analítico de Datos (`selectedProductId`):**
   - Determinado por la tabla `btl_cliente_productos`.
   - Modifica exclusivamente las cláusulas de consulta en base de datos (`.eq('producto_id', ...)`), calculando KPIs, desvíos de precios y presencia competitiva sin alterar la interfaz visual corporativa.

---

## 🔐 Seguridad y Row Level Security (RLS)

- **Aislamiento por Rol:** Políticas RLS activas en el 100% de las tablas.
- **Clientes:** Solo pueden leer venues asignados en `btl_clientes_venues` e inspecciones vinculadas a sus productos asignados en `btl_cliente_productos`.
- **Inspectores:** Tienen lectura sobre venues para auditar en campo, pero solo pueden ver y editar sus propias inspecciones.
- **Administradores:** Control integral mediante la función de base de datos `is_admin()`.
- **Sanitización de Datos:** Manejo de defensas tipadas contra cadenas vacías, valores nulos y control de división por cero en indicadores porcentuales.

---

## 👥 Roles y Permisos

| Capacidad / Módulo | Inspector | Cliente | Administrador |
|---|:---:|:---:|:---:|
| Crear inspecciones de campo | ✅ | ❌ | ✅ |
| Ver historial propio de visitas | ✅ | ❌ | ✅ |
| Ver Dashboard Ejecutivo con Analytics | ❌ | ✅ | ✅ |
| Ver mapa con scores de producto | ❌ | ✅ | ✅ |
| Cambiar producto en análisis (dropdown) | ❌ | ✅ | ✅ |
| Cambiar tema corporativo en caliente (header) | ❌ | ❌ | ✅ |
| Modificar paletas corporativas (`btl_temas`) | ❌ | ❌ | ✅ |
| Crear y editar SKUs y precios de referencia | ❌ | ❌ | ✅ |
| Asignar productos o venues a clientes | ❌ | ❌ | ✅ |
| Aprobar o rechazar usuarios pendientes | ❌ | ❌ | ✅ |
| Inscribirse en capacitaciones | ✅ | ❌ | ✅ |
| Crear y evaluar capacitaciones | ❌ | ❌ | ✅ |
| Crear tickets de soporte | ✅ | ✅ | ✅ |

---

## 📱 Responsividad

- **Desktop (1920px+ / 1440px):** Barra de filtros con scroll horizontal sin desbordamiento de chips, gráficos Recharts en grid multicolumna y tooltips semánticos flotantes.
- **Tablet (768px - 1024px):** Layout adaptado con mapa interactivo y tablas con scroll horizontal nativo.
- **Mobile (375px+):** Reemplazo de chips por menús desplegables estilizados (`<select>`), navegación ergonómica en cabecera y gráficos de competencia en columnas apiladas.

---

## 📄 Metadatos y Versión

**Versión:** 1.8.3  
**Última actualización:** Septiembre 2026  
**Estado:** ✅ Producción
