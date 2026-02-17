/**
 * Utilidades para badges y estilos de estado
 * Funciones reutilizables para obtener clases CSS de badges según estado
 */

/**
 * Tipos de estado de usuarios
 */
export type UserApprovalStatus = 'pending' | 'approved' | 'rejected';

/**
 * Tipos de estado de tickets/reportes
 */
export type TicketStatus = 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado';

/**
 * Tipos de roles de usuario
 */
export type UserRole = 'admin' | 'inspector' | 'client';

/**
 * Tipos de estado de capacitaciones
 */
export type TrainingStatus = 'programada' | 'en_curso' | 'completada' | 'cancelada' | 'pospuesta';

/**
 * Obtiene las clases CSS para el badge de estado de aprobación de usuario
 * @param status - Estado de aprobación
 * @returns Clases CSS de Tailwind
 */
export const getUserApprovalBadge = (status: UserApprovalStatus): string => {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'approved':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'rejected':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

/**
 * Obtiene el label en español para el estado de aprobación
 * @param status - Estado de aprobación
 * @returns Label en español
 */
export const getUserApprovalLabel = (status: UserApprovalStatus): string => {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'approved':
      return 'Aprobado';
    case 'rejected':
      return 'Rechazado';
    default:
      return status;
  }
};

/**
 * Obtiene las clases CSS para el badge de rol de usuario
 * @param role - Rol del usuario
 * @returns Clases CSS de Tailwind
 */
export const getUserRoleBadge = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'inspector':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'client':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

/**
 * Obtiene el label en español para el rol de usuario
 * @param role - Rol del usuario
 * @returns Label en español
 */
export const getUserRoleLabel = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'inspector':
      return 'Inspector';
    case 'client':
      return 'Cliente';
    default:
      return role;
  }
};

/**
 * Obtiene las clases CSS para el badge de estado de capacitación
 * @param status - Estado de la capacitación
 * @returns Clases CSS de Tailwind
 */
export const getTrainingStatusBadge = (status: TrainingStatus): string => {
  switch (status) {
    case 'programada':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'en_curso':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'completada':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'cancelada':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'pospuesta':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

/**
 * Obtiene el label en español para el estado de capacitación
 * @param status - Estado de la capacitación
 * @returns Label en español
 */
export const getTrainingStatusLabel = (status: TrainingStatus): string => {
  switch (status) {
    case 'programada':
      return 'Programada';
    case 'en_curso':
      return 'En Curso';
    case 'completada':
      return 'Completada';
    case 'cancelada':
      return 'Cancelada';
    case 'pospuesta':
      return 'Pospuesta';
    default:
      return status;
  }
};

/**
 * Obtiene las clases CSS para el badge de estado de ticket
 * @param status - Estado del ticket
 * @returns Clases CSS de Tailwind
 */
export const getTicketStatusBadge = (status: TicketStatus): string => {
  switch (status) {
    case 'abierto':
      return 'bg-red-500/20 text-red-300 border-red-500/30';
    case 'en_progreso':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'resuelto':
      return 'bg-green-500/20 text-green-300 border-green-500/30';
    case 'cerrado':
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

/**
 * Obtiene el label en español para el estado de ticket
 * @param status - Estado del ticket
 * @returns Label en español
 */
export const getTicketStatusLabel = (status: TicketStatus): string => {
  switch (status) {
    case 'abierto':
      return 'Abierto';
    case 'en_progreso':
      return 'En Progreso';
    case 'resuelto':
      return 'Resuelto';
    case 'cerrado':
      return 'Cerrado';
    default:
      return status;
  }
};

/**
 * Obtiene el color para iconos según el tipo
 * @param type - Tipo de icono (success, error, warning, info)
 * @returns Clases CSS de color
 */
export const getIconColor = (type: 'success' | 'error' | 'warning' | 'info'): string => {
  switch (type) {
    case 'success':
      return 'text-green-400';
    case 'error':
      return 'text-red-400';
    case 'warning':
      return 'text-amber-400';
    case 'info':
      return 'text-blue-400';
    default:
      return 'text-slate-400';
  }
};
