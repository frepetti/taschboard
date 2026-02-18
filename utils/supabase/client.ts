import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

// ULTRA-SINGLETON: Usar variable global para evitar múltiples instancias
// incluso con Hot Module Replacement (HMR) en desarrollo
declare global {
  interface Window {
    __supabase_client__: ReturnType<typeof createSupabaseClient<Database>> | undefined;
  }
}

// Si ya existe una instancia global, usarla
if (!window.__supabase_client__) {
  window.__supabase_client__ = createSupabaseClient<Database>(supabaseUrl!, supabaseAnonKey!);
  console.log('✅ Supabase Client initialized (singleton)');
} else {
  console.log('♻️ Reusing existing Supabase Client (singleton preserved)');
}

// Exportar la instancia global
export const supabase = window.__supabase_client__!;

// Mantener compatibilidad con código existente
export function createClient() {
  return supabase;
}