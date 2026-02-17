import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// ULTRA-SINGLETON: Usar variable global para evitar múltiples instancias
// incluso con Hot Module Replacement (HMR) en desarrollo
declare global {
  interface Window {
    __supabase_client__: ReturnType<typeof createSupabaseClient> | undefined;
  }
}

// Si ya existe una instancia global, usarla
if (!window.__supabase_client__) {
  window.__supabase_client__ = createSupabaseClient(supabaseUrl, publicAnonKey);
  console.log('✅ Supabase Client initialized (singleton)');
} else {
  console.log('♻️ Reusing existing Supabase Client (singleton preserved)');
}

// Exportar la instancia global
export const supabase = window.__supabase_client__;

// Mantener compatibilidad con código existente
export function createClient() {
  return supabase;
}