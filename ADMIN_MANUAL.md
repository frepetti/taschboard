# Manual del Administrador - Dashboard BTL SaaS

## Introducción
Este manual describe las responsabilidades y funcionalidades exclusivas para los administradores del sistema BTL.

## 1. Gestión de Usuarios

Los administradores tienen control total sobre los perfiles de usuarios. No existe registro autónomo (self-serve signup); todos los usuarios deben ser aprobados o creados por un administrador.

### Alta de Nuevos Usuarios
1.  **Registro:** Cuando un nuevo usuario se registra a través de la interfaz de inicio de sesión, su cuenta queda en estado `pending`.
2.  **Aprobación:**
    *   Ve a la sección **Usuarios Pendientes** (icono de usuarios en la barra lateral).
    *   Verás una lista de solicitudes.
    *   Haz clic en **Aprobar** para habilitar la cuenta y asignarle un rol (Inspector o Cliente).
    *   Haz clic en **Rechazar** para bloquear el acceso.

### Asignación de Roles
*   **Inspector:** Personal de campo que realiza visitas e inspecciones.
*   **Cliente:** Representantes de marcas que visualizan dashboards y reportes.

## 2. Gestión de Tickets y Soporte

Todos los tickets generados por inspectores o clientes llegan a la bandeja de entrada del administrador.

### Flujo de Trabajo
1.  **Recepción:** Los tickets aparecen en el módulo de **Gestión de Tickets** con estado `abierto`.
2.  **Asignación:** Puedes asignarte el ticket a ti mismo o a otro administrador.
3.  **Resolución:**
    *   Abre el ticket para ver detalles.
    *   Añade comentarios internos (solo visibles para admins) o públicos (visibles para el cliente).
    *   Cambia el estado a `en_progreso` mientras trabajas en él.
    *   Cambia el estado a `resuelto` o `cerrado` al finalizar.

## 3. Asignación de Venues a Clientes

Para que un Cliente pueda ver información en su dashboard, debes asignarle explícitamente los puntos de venta (Venues) que le corresponden.

1.  Ve al módulo **Gestión de Usuarios**.
2.  Busca la pestaña o sección **Asignar Venues**.
3.  Selecciona el Cliente en el menú desplegable.
4.  Selecciona los Venues que deseas vincular.
5.  Guarda los cambios.

> **Nota:** Los Inspectores tienen acceso a todos los venues para poder realizar su trabajo de campo sin restricciones.

## 4. Gestión de Productos y Marcas

Como administrador, eres responsable de mantener el catálogo de productos actualizado.

1.  Ve al módulo de **Productos**.
2.  **Crear Producto:** Usa el botón "Nuevo Producto" para añadir SKUs.
3.  **Configurar Objetivos:** Define los KPIs esperados para cada producto (Presencia, Stock, Material POP). Estos objetivos alimentan los gráficos de cumplimiento en el dashboard.

## 5. Capacitaciones

Puedes crear y programar sesiones de capacitación para los inspectores.

1.  Ve al módulo de **Capacitaciones**.
2.  Crea una nueva sesión definiendo fecha, tema y cupo.
3.  Los inspectores podrán ver estas sesiones y solicitar inscripción (generando un ticket de tipo 'capacitacion').
