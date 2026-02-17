/**
 * Utilidades para formateo de datos
 * Funciones reutilizables para formatear fechas, números, textos, etc.
 */

/**
 * Formatea una fecha al formato español local
 * @param dateString - String de fecha en formato ISO o Date
 * @param includeTime - Si debe incluir hora (default: false)
 * @returns Fecha formateada en español
 */
export const formatDate = (dateString: string | Date, includeTime = false): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  
  if (includeTime) {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric'
  });
};

/**
 * Formatea una fecha a solo la hora
 * @param dateString - String de fecha en formato ISO o Date
 * @returns Hora formateada (HH:MM)
 */
export const formatTime = (dateString: string | Date): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formatea un número a moneda (pesos mexicanos por defecto)
 * @param amount - Cantidad a formatear
 * @param currency - Código de moneda (default: MXN)
 * @returns Número formateado como moneda
 */
export const formatCurrency = (amount: number, currency = 'MXN'): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Formatea un número con separadores de miles
 * @param num - Número a formatear
 * @returns Número formateado
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('es-MX').format(num);
};

/**
 * Trunca un texto a una longitud específica
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado con '...'
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de un string
 * @param str - String a capitalizar
 * @returns String capitalizado
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
