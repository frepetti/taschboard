# Plan de Pruebas Funcionales (QA)

Este documento describe los casos de prueba manuales para validar la funcionalidad completa del Dashboard BTL SaaS antes y después del despliegue en producción.

## 1. Pruebas de Humo (Smoke Tests)
*Objetivo: Verificar que el sistema es accesible y las funciones críticas básicas operan.*

| ID | Prueba | Pasos | Resultado Esperado |
|----|--------|-------|--------------------|
| S01 | Carga Inicial | Acceder a la URL de producción | La página de Login carga correctamente sin errores de consola. |
| S02 | Login Admin | Ingresar con credenciales de Admin | Redirección exitosa al Dashboard Principal. |
| S03 | Login Fallido | Ingresar credenciales incorrectas | Mensaje de error visible "Credenciales inválidas". |
| S04 | Logout | Click en "Cerrar Sesión" | Redirección a la página de Login. |

---

## 2. Pruebas por Rol: Administrador
*Pre-requisito: Usuario con rol 'admin'*

| ID | Módulo | Pasos | Resultado Esperado |
|----|--------|-------|--------------------|
| A01 | Dashboard General | Visualizar métricas (KPIs, Gráficos) | Los datos coinciden con la BD. Los gráficos son interactivos. |
| A02 | Gestión Usuarios | Ir a "Usuarios" > Ver lista | Se listan todos los usuarios con sus roles y estados. |
| A03 | Aprobar Usuario | Buscar usuario 'pending' > Click "Aprobar" | Estado cambia a 'approved'. Usuario recibe acceso inmediato. |
| A04 | Rechazar Usuario | Buscar usuario 'pending' > Click "Rechazar" | Usuario es eliminado o desactivado. No puede acceder. |
| A05 | Gestión Tickets | Ir a "Tickets" > Abrir un ticket 'abierto' | Detalle del ticket carga con info del cliente. |
| A06 | Responder Ticket | Escribir respuesta > Click "Enviar" | Respuesta aparece en el hilo. Cliente puede verla. |
| A07 | Cambiar Estado Ticket | Cambiar de 'abierto' a 'resuelto' | Estado se actualiza en lista. |
| A08 | Reportes | Ir a "Reportes" > Filtrar por fecha | Datos se actualizan según el rango seleccionado. |
| A09 | Configuración | Ir a "Configuración" > Cambiar un parámetro | Cambio persiste tras recargar página. |

---

## 3. Pruebas por Rol: Inspector
*Pre-requisito: Usuario con rol 'inspector'*

| ID | Módulo | Pasos | Resultado Esperado |
|----|--------|-------|--------------------|
| I01 | Acceso Limitado | Intentar entrar a `/admin` | Redirección al Dashboard de Inspector o Error 403. |
| I02 | Nueva Inspección | Click "Nueva Inspección" > Llenar form | Formulario valida campos obligatorios. |
| I03 | Carga de Fotos | Subir imagen de evidencia | Imagen se previsualiza y sube correctamente a Storage. |
| I04 | Guardar Inspección | Click "Guardar" | Mensaje de éxito. Redirección a lista de inspecciones. |
| I05 | Historial Propio | Ver "Mis Inspecciones" | Solo muestra inspecciones creadas por este usuario. |
| I06 | Edición (si aplica) | Editar inspección reciente | Cambios se guardan correctamente. |

---

## 4. Pruebas por Rol: Cliente
*Pre-requisito: Usuario con rol 'cliente'*

| ID | Módulo | Pasos | Resultado Esperado |
|----|--------|-------|--------------------|
| C01 | Dashboard Cliente | Ver vista principal | Visualización "Solo Lectura" de métricas pertinentes a su marca. |
| C02 | Crear Ticket | Ir a "Soporte" > "Nuevo Ticket" > Enviar | Ticket se crea. Aparece en lista con estado 'abierto'. |
| C03 | Ver Ticket | Click en ticket creado | Ve detalle y respuestas del Admin. No puede editar estado. |
| C04 | Restricción Datos | Intentar ver datos de otra marca | Acceso denegado o datos filtrados correctamente (RLS). |

---

## 5. Pruebas de Integración y Flujo
*Objetivo: Validar la interacción entre módulos y roles.*

| ID | Flujo | Pasos | Resultado Esperado |
|----|-------|-------|--------------------|
| F01 | Registro -> Aprobación | 1. Nuevo usuario se registra.<br>2. Admin aprueba.<br>3. Nuevo usuario loguea. | Usuario 'pending' no entra hasta paso 2. Tras paso 2, acceso concedido con rol correcto. |
| F02 | Inspección -> Dashboard | 1. Inspector crea inspección en Venue X.<br>2. Admin ve Dashboard. | KPI de "Inspecciones Hoy" incrementa. Datos del Venue X se actualizan. |
| F03 | Ticket -> Resolución | 1. Cliente crea ticket.<br>2. Admin responde y cierra.<br>3. Cliente verifica. | Cliente ve respuesta y estado 'cerrado'. Recibe notificación (si configurado). |

---

## 6. Pruebas de Seguridad (Básicas)

| ID | Prueba | Pasos | Resultado Esperado |
|----|--------|-------|--------------------|
| SEC01 | Inyección SQL (Básico) | Ingresar `' OR '1'='1` en login | Acceso denegado. |
| SEC02 | Acceso Directo a URL | Copiar URL de detalle ticket `/tickets/123` e intentar abrir en incógnito | Redirección a Login. |
| SEC03 | Escalada Privilegios | Inspector intenta llamar API de Admin | Error 403 Forbidden (validado por RLS en Supabase). |

---

## 7. Pruebas de Rendimiento (Ligeras)

| ID | Prueba | Pasos | Resultado Esperado |
|----|--------|-------|--------------------|
| P01 | Carga Listado Grande | Admin ve lista de 100+ inspecciones | Carga en < 2 segundos (paginación funciona). |
| P02 | Subida Imagen | Inspector sube foto 5MB | Sistema comprime/optimiza o acepta en tiempo razonable. |
