# Guía de Usuario - Dashboard BTL SaaS

---

## Perfil: Inspector de Campo

Como Inspector, tu función principal es registrar datos de inspección en los Puntos de Venta (PDV) asignados.

### 1. Inicio de Sesión
1.  Accede a la aplicación y selecciona **Inspector Access**.
2.  Ingresa tu email y contraseña.
3.  Si eres nuevo, regístrate y espera la aprobación de un Administrador.

### 2. Realizar una Inspección
1.  En el Dashboard, haz clic en **Nueva Inspección**.
2.  **Selecciona el Venue (PDV):** Busca por nombre, dirección o tipo en la lista disponible.
3.  **Selecciona el Producto:** Elige el producto específico que vas a inspeccionar.
4.  **Completa el Formulario:**
    *   **Presencia del Producto:** ¿El producto está presente en el PDV?
    *   **Stock:** Indica el nivel de inventario (Alto, Medio, Bajo, Agotado).
    *   **Visibilidad:** Evalúa la visibilidad en back bar (Destacado, Visible, Oculto) y posición en estante (Superior, Medio, Inferior).
    *   **Material POP:** Reporta la existencia de material promocional y sus tipos.
    *   **Competencia:** Selecciona el competidor principal desde la lista de competidores configurados para ese producto, o escribe uno nuevo.
    *   **Promociones y Precio:** Indica si hay promoción activa y el precio de venta.
    *   **Observaciones:** Añade cualquier comentario relevante.
    *   **Fotos:** Sube hasta 4 imágenes que evidencien el estado del PDV.
5.  **Guardar:** Haz clic en **Guardar Inspección**. El sistema calcula automáticamente el Global Score y sincroniza los datos con el Dashboard del Cliente.

### 3. Historial de Inspecciones
*   Ve a la sección **Historial** para ver todas tus inspecciones previas.
*   Usa los filtros para buscar por venue, fecha o producto.

### 4. Capacitaciones
*   Consulta el listado de capacitaciones disponibles.
*   Inscríbete en las capacitaciones que te correspondan.
*   Podrás ver el estado de tus inscripciones y evaluaciones.

---

## Perfil: Cliente

Como Cliente, tienes acceso a un Dashboard personalizado para visualizar el rendimiento de tus marcas en los puntos de venta que te fueron asignados.

### 1. Dashboard de Analytics

#### Métricas por Producto
*   **Selector de Producto:** En la parte superior, selecciona el producto que deseas analizar. Todos los gráficos y KPIs se actualizarán automáticamente.
*   **Presencia en PDV:** Porcentaje de inspecciones donde el producto fue encontrado.
*   **Disponibilidad Stock:** Porcentaje de inspecciones con stock disponible.
*   **Material POP:** Porcentaje de inspecciones con material promocional.
*   Cada métrica muestra una barra de progreso contra el objetivo configurado.

#### KPIs Principales
*   **Cobertura de Venues:** Cantidad de PDV únicos visitados en el período.
*   **Cumplimiento Promedio:** Score promedio del producto seleccionado.
*   **Activaciones:** Total de acciones BTL ejecutadas.
*   Usa los **tooltips** (pasando el cursor) para ver explicaciones detalladas de cada métrica.

#### Mapa Interactivo
*   El mapa muestra todos tus venues asignados:
    *   🟢 **Verde** (Estratégico): Score ≥ 85
    *   🟡 **Ámbar** (Oportunidad): Score entre 60-84
    *   🔴 **Rojo** (Riesgo): Score < 60
    *   ⚪ **Gris**: Sin inspección para el producto seleccionado
*   Haz clic en cualquier marcador para ver el detalle del venue.

#### Filtros de Período
*   Filtra los datos por: **1 Mes, 3 Meses, 6 Meses, 1 Año, Año en Curso (YTD)**.
*   También puedes filtrar por **región**.

### 2. Venue Detail
*   Haz clic en un venue para ver su ficha detallada:
    *   Historial de inspecciones
    *   Score global y desglose (Visibilidad, POP, Stock, Conocimiento)
    *   Checklist compliance
    *   Acciones BTL programadas

### 3. Gestión de Tickets
Si necesitas reportar una incidencia o solicitar soporte:
1.  Ve a la sección **Soporte / Tickets**.
2.  Haz clic en **Nuevo Ticket**.
3.  Selecciona el tipo (Incidencia, Consulta, Solicitud de Activación, Material POP, etc.).
4.  Describe tu problema detalladamente.
5.  Podrás ver el estado de tus tickets y los comentarios del equipo.

> **Nota:** Solo puedes ver los Venues y Productos que te han sido asignados por un Administrador. Si falta algún punto de venta o producto, contacta a soporte.

---

## Perfil: Administrador

Como Administrador, tienes acceso completo a todas las funcionalidades del sistema.

### 1. Gestión de Usuarios
*   **Ver todos los usuarios** del sistema con sus roles y estados.
*   **Aprobar/Rechazar** usuarios pendientes de aprobación.
*   **Crear, editar o eliminar** usuarios.
*   **Cambiar roles** (Inspector, Cliente, Admin).

### 2. Gestión de Venues
*   **Importar** venues masivamente desde archivos Excel.
*   **Crear, editar, eliminar** venues individualmente.
*   **Asignar venues a clientes** para controlar qué ven en su dashboard.

### 3. Gestión de Productos
*   **Crear y editar** productos con: nombre, marca, categoría, SKU, presentación, colores, logo.
*   **Configurar competidores** por producto (aparecen como opciones en el formulario de inspección).
*   **Definir objetivos** de presencia, stock y POP.
*   **Importar** productos masivamente desde Excel.
*   **Asignar productos a clientes**.

### 4. Gestión de Capacitaciones
*   **Programar** capacitaciones con fecha, modalidad, instructor, cupo y materiales.
*   **Registrar asistencia** y evaluar participantes.
*   **Ver analytics** de capacitación por venue.

### 5. Gestión de Regiones
*   Crear y administrar las regiones geográficas del sistema.

### 6. Otros
*   **Acceder como Inspector o Cliente** para verificar la experiencia de esos roles.
*   Ver el **Panel de Seguridad** con el estado de RLS y configuraciones.
*   Usar el **Panel de Debug** para diagnósticos.

> **Ver también:** [ADMIN_MANUAL.md](ADMIN_MANUAL.md) para guías más detalladas.
