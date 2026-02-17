# 🥃 Dashboard SaaS Premium - Trade Marketing & BTL

## 🎯 Descripción

Dashboard premium para agencias de marketing que atienden marcas de bebidas alcohólicas. Sistema completo de gestión de inspecciones de campo, analytics ejecutivos y administración multi-usuario.

### ✨ Características Principales

- 🎨 **Diseño Premium** - Estética oscura y lujosa con acentos dorados/ámbar
- 👥 **Multi-Usuario** - 3 roles diferenciados (Inspector, Cliente, Admin)
- 📊 **Analytics Completos** - KPIs, gráficos, mapas y reportes ejecutivos
- 📱 **Responsive** - Adaptado para desktop y mobile
- 🔐 **Autenticación Segura** - Sistema de roles con Supabase Auth
- 📍 **Gestión de Venues** - Importación desde Excel y gestión completa
- 🎫 **Sistema de Tickets** - Soporte y seguimiento integrado
- 🌐 **Modo Dual** - Funciona con localStorage (mock) o servidor (producción)

---

## 🚀 Estado Actual

### ✅ Totalmente Funcional en Modo Mock
El sistema está **100% operativo** usando localStorage:
- ✅ Todos los portales funcionando
- ✅ Importación de venues desde Excel
- ✅ Sistema completo de inspecciones
- ✅ Dashboard ejecutivo con analytics
- ✅ Gestión de usuarios y tickets

### ⏳ Listo para Despliegue con Base de Datos
El código del servidor está completo y listo para desplegar.

---

## 📁 Estructura del Proyecto

### Portales de Acceso (5 URLs)

| URL | Rol | Descripción |
|-----|-----|-------------|
| `/` | Público | Landing page con enlaces a todos los portales |
| `/demo.html` | Demo | Dashboard completo sin autenticación |
| `/inspector.html` | Inspector | Crear y gestionar inspecciones de campo |
| `/client.html` | Cliente | Dashboard ejecutivo (solo lectura) |
| `/admin.html` | Admin | Panel de administración completo |

### Componentes Principales

```
/components/
├── 🔐 Autenticación
│   ├── AdminAuth.tsx         - Login/Signup Admin
│   ├── ClientAuth.tsx        - Login/Signup Cliente
│   └── InspectorAuth.tsx     - Login/Signup Inspector
│
├── 📊 Dashboards
│   ├── AdminDashboard.tsx    - Panel de administración
│   ├── ClientDashboard.tsx   - Dashboard cliente
│   ├── InspectorDashboard.tsx- Dashboard inspector
│   └── ManagerDashboard.tsx  - Dashboard principal con analytics
│
├── 🏢 Gestión de Venues
│   ├── VenueImporter.tsx     - Importación Excel → localStorage
│   ├── VenueManager.tsx      - CRUD de venues (admin)
│   ├── VenueSelectionForm.tsx- Selector de venue (inspector)
│   ├── VenueTable.tsx        - Tabla de venues
│   └── VenueDetail.tsx       - Vista detallada
│
├── 📋 Inspecciones
│   ├── InspectionForm.tsx    - Formulario de inspección
│   ├── InspectionHistory.tsx - Historial
│   └── InspectorHeader.tsx   - Header del inspector
│
├── 🎫 Tickets y Usuarios
│   ├── TicketManagement.tsx  - Gestión de tickets
│   ├── TicketModal.tsx       - Crear ticket
│   ├── UserManagement.tsx    - Gestión de usuarios
│   └── AdminStats.tsx        - Estadísticas admin
│
└── 📈 Visualizaciones
    ├── KPICard.tsx           - Tarjetas de KPIs
    ├── PerformanceChart.tsx  - Gráficos de rendimiento
    ├── CompetitionChart.tsx  - Análisis de competencia
    ├── OpportunityMap.tsx    - Mapa de oportunidades
    ├── OpportunityBreakdown.tsx
    ├── ActivationTimeline.tsx
    ├── InsightCard.tsx
    └── FilterChip.tsx
```

### Backend

```
/supabase/functions/server/
├── index.tsx              - Edge Function principal (Hono server)
└── kv_store.tsx          - Utilidades KV Store (protegido)

/utils/
├── api.ts                - API con modo mock/servidor dual
├── supabase/client.ts    - Cliente Supabase
└── supabase/info.tsx     - Config del proyecto
```

---

## 🛠️ Tecnologías

- **Framework:** React + TypeScript
- **Estilos:** Tailwind CSS v4
- **Backend:** Supabase (Auth, Edge Functions, KV Store)
- **Servidor:** Hono (Edge Function)
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **Excel:** SheetJS (XLSX)
- **Mapas:** Leaflet (React-Leaflet)

---

## 📖 Documentación

### 📚 Guías Completas

| Archivo | Descripción |
|---------|-------------|
| [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md) | 🚀 Resumen rápido de despliegue |
| [GUIA_DESPLIEGUE_COMPLETA.md](GUIA_DESPLIEGUE_COMPLETA.md) | 📖 Guía paso a paso detallada |
| [COMANDOS_CONSOLA.md](COMANDOS_CONSOLA.md) | 🛠️ Comandos útiles para debugging |
| [IMPORTAR_VENUES_INSTRUCCIONES.md](IMPORTAR_VENUES_INSTRUCCIONES.md) | 📍 Importar venues desde Excel |
| [PROYECTO_LIMPIO.md](PROYECTO_LIMPIO.md) | 📋 Estado y estructura del proyecto |

### 🔍 Scripts de Verificación

- `/scripts/verify-system.js` - Script automático de verificación del sistema

---

## 🚀 Inicio Rápido

### Modo Mock (Actual - Ya Funciona)

1. **Abre cualquier portal:**
   - Landing: `/`
   - Demo: `/demo.html`
   - Inspector: `/inspector.html`
   - Cliente: `/client.html`
   - Admin: `/admin.html`

2. **Credenciales por defecto:**
   - Email: `admin@example.com`
   - Password: `admin123`

3. **Importar venues (Admin):**
   - Ve a `/admin.html`
   - Sección "Gestión de Venues"
   - Importa archivo Excel
   - Ver: [IMPORTAR_VENUES_INSTRUCCIONES.md](IMPORTAR_VENUES_INSTRUCCIONES.md)

### Despliegue con Base de Datos

📚 **Sigue la guía completa:** [GUIA_DESPLIEGUE_COMPLETA.md](GUIA_DESPLIEGUE_COMPLETA.md)

**Pasos resumidos:**
1. Ve a Supabase Dashboard
2. Despliega el Edge Function `server`
3. Verifica con health check
4. Cambia `USE_MOCK_MODE = false` en `/utils/api.ts`
5. Recarga la aplicación

---

## 🎨 Estilo y Diseño

### Paleta de Colores

- **Fondo Principal:** Negro profundo (#0a0a0a)
- **Acentos:** Dorado/Ámbar (#d4af37, #fbbf24)
- **Glassmorfismo:** Backgrounds semi-transparentes con blur
- **Texto:** Blanco (#ffffff) y grises claros
- **Estados:** Verde éxito, rojo error, azul info

### Componentes UI

Librería completa de 81 componentes UI en `/components/ui/`:
- Buttons, Cards, Modals, Tables
- Forms, Inputs, Selects
- Charts, Badges, Alerts
- Y mucho más...

---

## 👥 Roles y Permisos

### 🔧 Inspector (Campo)
- ✅ Crear inspecciones de venues
- ✅ Ver historial de sus propias inspecciones
- ✅ Seleccionar venues importados
- ✅ Subir fotos y datos de campo
- ❌ No puede ver analytics globales
- ❌ No puede gestionar usuarios

### 👔 Cliente (Ejecutivo)
- ✅ Ver dashboard completo con analytics
- ✅ Ver KPIs y métricas ejecutivas
- ✅ Ver mapas y gráficos
- ✅ Crear tickets de soporte
- ❌ No puede crear inspecciones
- ❌ No puede gestionar usuarios
- ❌ No puede modificar datos

### 👑 Admin (Administrador)
- ✅ Acceso completo a todo
- ✅ Gestionar usuarios (crear, editar, eliminar)
- ✅ Gestionar venues (importar, editar, eliminar)
- ✅ Ver y gestionar tickets
- ✅ Ver estadísticas del sistema
- ✅ Acceso a todos los dashboards

---

## 🔄 Flujo de Datos

### Importación de Venues (Admin → Inspector)

```
1. Admin importa Excel
   ↓
   VenueImporter.tsx procesa archivo
   ↓
   Guarda en localStorage['imported_venues']
   (o en servidor si está desplegado)
   ↓
2. Inspector abre "Nueva Inspección"
   ↓
   VenueSelectionForm.tsx lee venues
   ↓
   Muestra lista completa de venues
   ↓
3. Inspector selecciona venue y completa formulario
   ↓
   Inspección guardada ✅
```

### Creación de Inspecciones

```
Inspector → VenueSelectionForm → InspectionForm → API → Storage
                                                          ↓
Cliente ← Dashboard ← Analytics ← API ← Storage (inspecciones)
```

---

## 🧪 Testing y Debugging

### Verificar Estado del Sistema

```javascript
// Ejecuta en consola del navegador (F12)
// Copia el contenido de /scripts/verify-system.js
```

### Comandos Útiles

Ver: [COMANDOS_CONSOLA.md](COMANDOS_CONSOLA.md)

- Verificar servidor
- Ver datos en localStorage
- Limpiar datos
- Crear datos de prueba
- Exportar/Importar backups

---

## 📊 Características Detalladas

### Dashboard Ejecutivo (Cliente)
- 📈 KPIs principales (Perfect Serve, Cobertura, Rotación)
- 📊 Gráficos de rendimiento por zona/canal
- 🗺️ Mapa interactivo de venues con heat map
- 📋 Tabla detallada de venues con scores
- 🎯 Análisis de competencia
- 💡 Desglose de oportunidades
- 📅 Timeline de activaciones
- 🎫 Sistema de tickets integrado

### Panel Inspector (Campo)
- 📍 Selector de venues importados
- 📝 Formulario completo de inspección:
  - Perfect Serve checklist (6 items)
  - Presencia en menú
  - Posicionamiento de botella
  - Rotación estimada
  - Competencia presente
  - Activaciones
  - Potencial de activación
  - Notas y observaciones
  - Upload de imágenes (hasta 4)
- 📜 Historial completo de inspecciones
- 🔍 Búsqueda y filtros

### Panel Admin
- 👥 Gestión completa de usuarios
- 🏢 Importación masiva de venues desde Excel
- 📊 Estadísticas del sistema en tiempo real
- 🎫 Gestión de tickets
- 🗑️ Eliminación y edición de registros

---

## 🔐 Seguridad

- ✅ Autenticación con Supabase Auth
- ✅ Roles segregados por usuario
- ✅ Tokens JWT para API
- ✅ Validación en frontend y backend
- ✅ Variables de entorno protegidas
- ✅ Service Role Key solo en servidor

---

## 📱 Responsividad

- ✅ Desktop (1920px+) - Experiencia completa
- ✅ Laptop (1440px) - Optimizado
- ✅ Tablet (768px) - Adaptado
- ✅ Mobile (375px+) - Layout móvil

---

## 🎯 Próximas Mejoras (Opcionales)

- [ ] Upload de imágenes a Supabase Storage
- [ ] Exportar reportes en PDF
- [ ] Notificaciones push
- [ ] Dashboard en tiempo real con websockets
- [ ] Más visualizaciones (Sankey, Funnel, etc.)
- [ ] Sistema de permisos granular
- [ ] Historial de cambios (audit log)
- [ ] Modo offline con sync

---

## 🆘 Soporte

### Problemas Comunes

Ver sección de troubleshooting en:
- [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)
- [GUIA_DESPLIEGUE_COMPLETA.md](GUIA_DESPLIEGUE_COMPLETA.md)

### Debugging

1. Abre consola del navegador (F12)
2. Ejecuta script de verificación
3. Revisa logs del servidor (si está desplegado)
4. Consulta [COMANDOS_CONSOLA.md](COMANDOS_CONSOLA.md)

---

## 📄 Licencia

Proyecto privado para agencia de marketing.

---

## 🙏 Créditos

Ver [Attributions.md](Attributions.md) para créditos completos.

---

**Versión:** 1.0.0  
**Última actualización:** Enero 2026  
**Estado:** ✅ Producción (Modo Mock) / ⏳ Listo para despliegue (Modo Servidor)

---

## 🎉 ¡Disfruta del Dashboard!

El sistema está completamente funcional y listo para usar. Para cualquier duda, consulta la documentación o ejecuta el script de verificación.

**Happy monitoring! 🥃✨**
