# 🥃 Dashboard SaaS Premium - Trade Marketing & BTL

## 🎯 Descripción

Dashboard premium para agencias de marketing que atienden marcas de bebidas alcohólicas. Sistema completo de gestión de inspecciones de campo, analytics ejecutivos, gestión de productos y capacitaciones, y administración multi-usuario.

### ✨ Características Principales

- 🎨 **Diseño Premium** - Estética oscura y lujosa con acentos dorados/ámbar
- 👥 **Multi-Usuario** - 3 roles diferenciados (Inspector, Cliente, Admin)
- 📊 **Analytics Completos** - KPIs, gráficos, mapas interactivos y reportes ejecutivos
- 📦 **Gestión de Productos** - Catálogo con competidores, métricas por producto y objetivos
- 🗺️ **Mapa Inteligente** - Filtrado por producto, coloreado por score de inspección
- 🎓 **Capacitaciones** - Gestión completa de entrenamientos con asistencia y evaluaciones
- 📱 **Responsive** - Adaptado para desktop y mobile
- 🔐 **Autenticación Segura** - Supabase Auth con RLS, aprobación de usuarios y roles
- 📍 **Gestión de Venues** - Importación desde Excel, asignación a clientes, y gestión completa
- 🎫 **Sistema de Tickets** - Soporte y seguimiento integrado con comentarios
- 🌐 **Multi-idioma** - Soporte para español e inglés
- 🛡️ **Protección contra Extensiones** - Bloqueo de MetaMask y extensiones Web3

---

## 🚀 Estado Actual

### ✅ En Producción
El sistema está **desplegado y operativo** con Supabase como backend:
- ✅ Autenticación con Supabase Auth (signup, login, recovery)
- ✅ Base de datos PostgreSQL con RLS completo
- ✅ Todos los portales funcionando (Inspector, Cliente, Admin)
- ✅ Importación de venues desde Excel
- ✅ Sistema completo de inspecciones por producto
- ✅ Dashboard ejecutivo con analytics sincronizado por producto
- ✅ Mapa interactivo filtrado por producto seleccionado
- ✅ Gestión de productos con competidores configurables
- ✅ Sistema de capacitaciones y evaluaciones
- ✅ Gestión de usuarios con aprobación
- ✅ Gestión de regiones
- ✅ Custom tooltips en métricas

---

## 📁 Estructura del Proyecto

### Enrutamiento (SPA con query params)

| URL | Modo | Descripción |
|-----|------|-------------|
| `/` | Landing | Página de bienvenida con enlaces a todos los portales |
| `/?mode=demo` | Demo | Dashboard completo sin autenticación |
| `/?mode=inspector` | Inspector | Crear y gestionar inspecciones de campo |
| `/?mode=client` | Cliente | Dashboard ejecutivo (solo lectura) |
| `/?mode=admin` | Admin | Panel de administración completo |
| `/?mode=update_password` | Recovery | Cambio de contraseña tras recovery |

### Componentes Principales

```
/components/
├── 🔐 Autenticación
│   ├── AdminAuth.tsx             - Login/Signup Admin
│   ├── ClientAuth.tsx            - Login/Signup Cliente
│   ├── InspectorAuth.tsx         - Login/Signup Inspector
│   └── UpdatePassword.tsx        - Cambio de contraseña (recovery)
│
├── 📊 Dashboards
│   ├── AdminDashboard.tsx        - Panel de administración
│   ├── ClientDashboard.tsx       - Dashboard cliente (orquestador)
│   ├── InspectorDashboard.tsx    - Dashboard inspector
│   └── ManagerDashboard.tsx      - Dashboard principal con analytics
│
├── 📦 Gestión de Productos
│   ├── ProductManagement.tsx     - CRUD de productos (admin)
│   ├── ProductImporter.tsx       - Importación masiva de productos
│   ├── ProductMetrics.tsx        - Métricas por producto (controlado)
│   ├── ProductSelector.tsx       - Selector de producto (cliente)
│   ├── ProductSelectorInspection.tsx - Selector de producto (inspector)
│   └── ClientProductManagement.tsx - Gestión de productos asignados
│
├── 🏢 Gestión de Venues
│   ├── VenueImporter.tsx         - Importación Excel → BD
│   ├── VenueManager.tsx          - CRUD de venues (admin)
│   ├── VenueSelectionForm.tsx    - Selector de venue (inspector)
│   ├── VenueTable.tsx            - Tabla de venues con scores
│   ├── VenueDetail.tsx           - Vista detallada + acciones BTL
│   ├── ClientVenueManager.tsx    - Asignación venues a clientes
│   └── ClientSelectionForm.tsx   - Selector de cliente
│
├── 📋 Inspecciones
│   ├── InspectionForm.tsx        - Formulario de inspección (dropdown competidores)
│   ├── InspectionHistory.tsx     - Historial con filtros
│   └── InspectorHeader.tsx       - Header del inspector
│
├── 🎓 Capacitaciones
│   ├── TrainingManagement.tsx    - CRUD de capacitaciones (admin)
│   ├── TrainingList.tsx          - Lista de capacitaciones (inspector)
│   └── VenueTrainingAnalytics.tsx - Analytics de capacitación por venue
│
├── 🎫 Tickets y Usuarios
│   ├── TicketManagement.tsx      - Gestión de tickets
│   ├── TicketModal.tsx           - Crear/editar ticket
│   ├── UserManagement.tsx        - Gestión de usuarios
│   ├── PendingUsersManagement.tsx - Aprobación de usuarios pendientes
│   └── AdminStats.tsx            - Estadísticas admin
│
├── 🌐 Internacionalización
│   └── LanguageSwitcher.tsx      - Cambio de idioma ES/EN
│
├── 🛡️ Seguridad y Debug
│   ├── SecurityStatus.tsx        - Panel de estado de seguridad
│   └── DebugPanel.tsx            - Panel de debug (desarrollo)
│
├── 📈 Visualizaciones
│   ├── KPICard.tsx               - Tarjetas de KPIs
│   ├── PerformanceChart.tsx      - Gráficos de rendimiento
│   ├── CompetitionChart.tsx      - Análisis de competencia
│   ├── OpportunityMap.tsx        - Mapa interactivo (filtrado por producto)
│   ├── OpportunityBreakdown.tsx  - Desglose de oportunidades
│   ├── ActivationTimeline.tsx    - Timeline de activaciones
│   ├── InsightCard.tsx           - Tarjetas de insights
│   ├── FilterChip.tsx            - Chips de filtro
│   ├── Tooltip.tsx               - Tooltips custom
│   └── RegionManager.tsx         - Gestión de regiones
│
└── 🎨 UI Base
    └── /ui/                      - Librería de componentes UI (81+)
```

### Backend y Utilidades

```
/utils/
├── AuthContext.tsx        - Contexto de autenticación (roles, sesión, perfil DB)
├── LanguageContext.tsx    - Contexto de idioma (ES/EN)
├── api.ts                - API con modo mock/servidor dual
├── api-direct.ts         - API directa a Supabase (producción)
├── scoreCalculations.ts  - Cálculos de score (Global, Visibility, POP, Stock, Knowledge)
├── scoreConfig.ts        - Configuración de pesos y umbrales
├── badges.ts             - Sistema de badges
├── constants.ts          - Constantes del sistema
├── database-config.ts    - Configuración de base de datos
├── formatters.ts         - Formateo de datos
├── notifications.ts      - Sistema de notificaciones
├── translations.ts       - Traducciones ES/EN
├── validators.ts         - Validadores
└── supabase/
    ├── client.ts          - Cliente Supabase
    └── info.tsx           - Config del proyecto

/supabase/functions/server/
├── index.tsx              - Edge Function principal (Hono server)
└── kv_store.tsx           - Utilidades KV Store

master_schema.sql          - Schema postgresql completo con RLS
```

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| **Framework** | React 18 + TypeScript |
| **Build** | Vite 7 |
| **Estilos** | Tailwind CSS v3 |
| **Backend** | Supabase (Auth, PostgreSQL, Edge Functions, Storage) |
| **Servidor** | Hono (Edge Function) |
| **UI Components** | Radix UI (Dialog, Select, Tabs, Tooltip, etc.) |
| **Gráficos** | Recharts |
| **Mapas** | Leaflet (React-Leaflet) |
| **Iconos** | Lucide React |
| **Excel** | read-excel-file |
| **Notificaciones** | Sonner |
| **Deploy** | Vercel |

---

## 📖 Documentación

| Archivo | Descripción |
|---------|-------------|
| [README.md](README.md) | 📋 Documentación principal del proyecto |
| [USER_MANUAL.md](USER_MANUAL.md) | 👤 Guía de usuario por perfil |
| [METRICS.md](METRICS.md) | 📊 Documentación de métricas y cálculos |
| [ADMIN_MANUAL.md](ADMIN_MANUAL.md) | 👑 Manual del administrador |
| [DEPLOY.md](DEPLOY.md) | 🚀 Guía de despliegue |
| [SECURITY_CONFIGURATION.md](SECURITY_CONFIGURATION.md) | 🔐 Configuración de seguridad y RLS |
| [TESTING.md](TESTING.md) | 🧪 Plan de testing |
| [SCALABILITY_PLAN.md](SCALABILITY_PLAN.md) | 🚀 Plan de escalabilidad y mejoras futuras |
| [Attributions.md](Attributions.md) | 🙏 Créditos y atribuciones |

---

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
npm run dev
```

### Credenciales

Los usuarios se crean a través del sistema de registro con aprobación por parte de un Admin.

### Despliegue

📚 **Ver guía completa:** [DEPLOY.md](DEPLOY.md)

**Resumen:**
1. Configurar variables de entorno en `.env.local` (Supabase URL, anon key)
2. Ejecutar `master_schema.sql` en el SQL Editor de Supabase
3. Desplegar Edge Functions: `supabase functions deploy server`
4. Desplegar frontend a Vercel: `npm run build` + deploy
5. Verificar con health check

---

## 🎨 Estilo y Diseño

### Paleta de Colores

- **Fondo Principal:** Negro profundo (#0a0a0a) con gradientes slate
- **Acentos:** Dorado/Ámbar (#d4af37, #fbbf24)
- **Glassmorfismo:** Backgrounds semi-transparentes con blur
- **Texto:** Blanco (#ffffff) y grises claros
- **Estados:** Verde éxito, rojo error, ámbar warning, azul info

### Componentes UI

Librería de 81+ componentes UI en `/components/ui/` basados en Radix UI:
- Buttons, Cards, Modals, Dialogs
- Forms, Inputs, Selects, Checkboxes
- Tables, Tabs, Accordions
- Charts, Badges, Alerts, Progress
- Tooltips, Popovers, Dropdowns
- Y más...

---

## 👥 Roles y Permisos

### 🔧 Inspector (Campo)
- ✅ Crear inspecciones de venues por producto
- ✅ Ver historial de sus propias inspecciones
- ✅ Seleccionar venues y productos desde catálogo
- ✅ Subir fotos y datos de campo
- ✅ Seleccionar competidores desde lista configurada
- ✅ Ver capacitaciones disponibles e inscribirse
- ❌ No puede ver analytics globales
- ❌ No puede gestionar usuarios

### 👔 Cliente (Ejecutivo)
- ✅ Ver dashboard completo con analytics filtrado por producto
- ✅ Ver KPIs y métricas ejecutivas por producto
- ✅ Ver mapa interactivo filtrado por producto seleccionado
- ✅ Gestionar sus productos asignados
- ✅ Crear tickets de soporte
- ✅ Ver tooltips con información detallada de métricas
- ❌ No puede crear inspecciones
- ❌ No puede gestionar usuarios
- ❌ Solo ve venues asignados

### 👑 Admin (Administrador)
- ✅ Acceso completo a todo
- ✅ Gestionar usuarios (crear, editar, eliminar, aprobar)
- ✅ Gestionar venues (importar, editar, eliminar, asignar a clientes)
- ✅ Gestionar productos (CRUD, competidores, objetivos)
- ✅ Gestionar capacitaciones (crear, evaluar, registrar asistencia)
- ✅ Gestionar regiones
- ✅ Ver y gestionar tickets
- ✅ Ver estadísticas del sistema y panel de seguridad
- ✅ Acceso a panel de debug
- ✅ Acceso a todos los dashboards (puede verlos como Inspector o Cliente)

---

## 🔄 Flujo de Datos

### Selección de Producto (Sync Global)

```
ClientDashboard (estado central: selectedProductId)
    ↓
    ├── ProductMetrics    → métricas filtradas por producto + fecha + región
    ├── ManagerDashboard  → KPIs, charts filtrados por producto
    └── OpportunityMap    → venues coloreados por score del producto
                            (gris = sin inspección para ese producto)
```

### Inspección por Producto

```
Inspector abre "Nueva Inspección"
    ↓
    Selecciona Venue → Selecciona Producto
    ↓
    Completa formulario (checklist, stock, POP, competidores del producto)
    ↓
    Se calcula Global Score automáticamente
    ↓
    Se guarda inspección en btl_inspecciones
    ↓
    Trigger actualiza global_score en btl_puntos_venta
    ↓
    Dashboard Cliente refleja el cambio ✅
```

### Creación y Aprobación de Usuarios

```
Nuevo usuario se registra (signup)
    ↓
    Se crea perfil en btl_usuarios con estado_aprobacion = 'pending'
    ↓
    Admin ve en "Usuarios Pendientes"
    ↓
    Admin aprueba o rechaza
    ↓
    Usuario puede acceder al sistema ✅
```

---

## 🗄️ Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `btl_usuarios` | Perfiles de usuario con roles y aprobación |
| `btl_puntos_venta` | Venues con coordenadas, segmento y global_score |
| `btl_productos` | Catálogo de productos con competidores y objetivos |
| `btl_inspecciones` | Inspecciones (1 por producto por visita) |
| `btl_reportes` | Tickets de soporte |
| `btl_ticket_comentarios` | Comentarios en tickets |
| `btl_capacitaciones` | Capacitaciones/entrenamientos |
| `btl_capacitacion_asistentes` | Asistencia y evaluaciones |
| `btl_temas_capacitacion` | Catálogo de temas |
| `btl_regiones` | Regiones geográficas |
| `btl_clientes_venues` | Asignación venues ↔ clientes |
| `btl_cliente_productos` | Productos asignados a clientes |
| `btl_acciones` | Acciones BTL en venues |
| `btl_config` | Configuración del sistema |

### Triggers

- `update_venue_global_score` → Al crear inspección, actualiza `global_score` del venue
- `auto_approve_admin` → Aprueba automáticamente usuarios con rol admin
- `update_updated_at_column` → Actualiza campo `updated_at` en cada tabla

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas diferenciadas por rol:
- **Admins**: Acceso total a todo
- **Clientes**: Solo ven venues asignados y todas las inspecciones
- **Inspectores**: Ven todos los venues, solo sus propias inspecciones

Ver detalle en [SECURITY_CONFIGURATION.md](SECURITY_CONFIGURATION.md).

---

## 🔐 Seguridad

- ✅ Autenticación con Supabase Auth (email/password)
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Helper functions: `is_admin()`, `is_inspector()`, `current_user_id()`
- ✅ Sistema de aprobación de usuarios
- ✅ Tokens JWT para API
- ✅ Validación en frontend y backend
- ✅ Variables de entorno protegidas
- ✅ Service Role Key solo en servidor (Edge Functions)
- ✅ Protección contra extensiones del navegador (MetaMask, Web3)
- ✅ Bloqueo de inyección de scripts de extensiones
- ✅ Email confirmation flow

---

## 📱 Responsividad

- ✅ Desktop (1920px+) - Experiencia completa
- ✅ Laptop (1440px) - Optimizado
- ✅ Tablet (768px) - Adaptado
- ✅ Mobile (375px+) - Layout móvil

---

## 🎯 Próximas Mejoras (Opcionales)

- [ ] Exportar reportes en PDF
- [ ] Notificaciones push
- [ ] Dashboard en tiempo real con websockets
- [ ] Más visualizaciones (Sankey, Funnel, etc.)
- [ ] Historial de cambios (audit log)
- [ ] Modo offline con sync

---

## 🆘 Soporte

### Problemas Comunes

Ver sección de troubleshooting en:
- [DEPLOY.md](DEPLOY.md)
- [SECURITY_CONFIGURATION.md](SECURITY_CONFIGURATION.md)

### Debugging

1. Abre consola del navegador (F12)
2. Activa el Debug Panel desde Admin Dashboard
3. Revisa logs del servidor en Supabase Dashboard

---

## 📄 Licencia

Proyecto privado para agencia de marketing.

---

## 🙏 Créditos

Ver [Attributions.md](Attributions.md) para créditos completos.

---

**Versión:** 2.0.0  
**Última actualización:** Marzo 2026  
**Estado:** ✅ Producción

---

## 🎉 ¡Disfruta del Dashboard!

El sistema está completamente funcional y desplegado. Para cualquier duda, consulta la documentación o contacta al equipo de desarrollo.

**Happy monitoring! 🥃✨**
