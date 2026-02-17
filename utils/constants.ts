/**
 * Constantes globales de la aplicación
 * Valores reutilizables en toda la aplicación
 */

/**
 * Estados de aprobación de usuarios
 */
export const USER_APPROVAL_STATES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

/**
 * Roles de usuario
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  INSPECTOR: 'inspector',
  CLIENT: 'client',
} as const;

/**
 * Estados de tickets/reportes
 */
export const TICKET_STATES = {
  OPEN: 'abierto',
  IN_PROGRESS: 'en_progreso',
  RESOLVED: 'resuelto',
  CLOSED: 'cerrado',
} as const;

/**
 * Estados de capacitaciones
 */
export const TRAINING_STATES = {
  SCHEDULED: 'programada',
  IN_PROGRESS: 'en_curso',
  COMPLETED: 'completada',
  CANCELLED: 'cancelada',
  POSTPONED: 'pospuesta',
} as const;

/**
 * Categorías de capacitaciones
 */
export const TRAINING_CATEGORIES = [
  'Producto',
  'Ventas',
  'Trade Marketing',
  'Técnica',
  'Seguridad',
] as const;

/**
 * Tipos de capacitaciones
 */
export const TRAINING_TYPES = [
  'Presencial',
  'Virtual',
  'Híbrida',
  'E-learning',
] as const;

/**
 * Niveles de capacitación
 */
export const TRAINING_LEVELS = [
  'Básico',
  'Intermedio',
  'Avanzado',
] as const;

/**
 * Modalidades de capacitación
 */
export const TRAINING_MODALITIES = [
  'presencial',
  'virtual',
  'hibrida',
] as const;

/**
 * Prioridades de tickets
 */
export const TICKET_PRIORITIES = {
  LOW: 'baja',
  MEDIUM: 'media',
  HIGH: 'alta',
  CRITICAL: 'critica',
} as const;

/**
 * Tipos de tickets
 */
export const TICKET_TYPES = {
  SUPPORT: 'soporte',
  INCIDENT: 'incidencia',
  IMPROVEMENT: 'mejora',
  QUERY: 'consulta',
} as const;

/**
 * Mensajes de confirmación
 */
export const CONFIRM_MESSAGES = {
  DELETE_USER: '¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.',
  DELETE_TRAINING: '¿Estás seguro de que deseas eliminar esta capacitación? Esta acción no se puede deshacer.',
  DELETE_VENUE: '¿Estás seguro de eliminar este punto de venta?',
  DELETE_PRODUCT: '¿Estás seguro de que deseas eliminar este producto?',
} as const;

/**
 * Mensajes de éxito
 */
export const SUCCESS_MESSAGES = {
  USER_CREATED: 'Usuario creado exitosamente',
  USER_UPDATED: 'Usuario actualizado exitosamente',
  USER_DELETED: 'Usuario eliminado exitosamente',
  TRAINING_CREATED: 'Capacitación creada exitosamente',
  TRAINING_UPDATED: 'Capacitación actualizada exitosamente',
  TRAINING_DELETED: 'Capacitación eliminada exitosamente',
  VENUE_DELETED: 'Punto de venta eliminado exitosamente',
  PRODUCT_CREATED: 'Producto creado exitosamente',
  PRODUCT_UPDATED: 'Producto actualizado exitosamente',
  PRODUCT_DELETED: 'Producto eliminado exitosamente',
} as const;

/**
 * Mensajes de error
 */
export const ERROR_MESSAGES = {
  LOAD_USERS: 'Error al cargar los usuarios',
  LOAD_TRAININGS: 'Error al cargar las capacitaciones',
  LOAD_VENUES: 'Error al cargar los puntos de venta',
  LOAD_PRODUCTS: 'Error al cargar los productos',
  UPDATE_USER: 'Error al actualizar usuario',
  DELETE_USER: 'Error al eliminar usuario',
  UPDATE_TRAINING: 'Error al guardar la capacitación',
  DELETE_TRAINING: 'Error al eliminar la capacitación',
  DELETE_VENUE: 'Error al eliminar el punto de venta',
  UPDATE_PRODUCT: 'Error al actualizar producto',
  DELETE_PRODUCT: 'Error al eliminar producto',
} as const;

/**
 * Límites de paginación
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

/**
 * Configuración de validación
 */
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_TEXT_LENGTH: 255,
  MAX_DESCRIPTION_LENGTH: 1000,
} as const;
