/**
 * Utilidades de validación
 * Funciones reutilizables para validar datos
 */

import { VALIDATION } from './constants';

/**
 * Valida un email
 * @param email - Email a validar
 * @returns true si es válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida una contraseña
 * @param password - Contraseña a validar
 * @returns true si cumple los requisitos mínimos
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH;
};

/**
 * Valida que un string no esté vacío
 * @param value - Valor a validar
 * @returns true si no está vacío
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Valida que un número esté en un rango
 * @param value - Número a validar
 * @param min - Valor mínimo (opcional)
 * @param max - Valor máximo (opcional)
 * @returns true si está en el rango
 */
export const isInRange = (value: number, min?: number, max?: number): boolean => {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
};

/**
 * Valida una fecha
 * @param dateString - String de fecha a validar
 * @returns true si es una fecha válida
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Valida que una fecha sea futura
 * @param dateString - String de fecha a validar
 * @returns true si la fecha es futura
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date > new Date();
};

/**
 * Valida que una fecha sea pasada
 * @param dateString - String de fecha a validar
 * @returns true si la fecha es pasada
 */
export const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return date < new Date();
};

/**
 * Sanitiza un string para prevenir XSS
 * @param str - String a sanitizar
 * @returns String sanitizado
 */
export const sanitizeString = (str: string): string => {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
