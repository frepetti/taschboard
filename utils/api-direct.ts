/**
 * API Direct - Bypass Edge Function y usar Supabase directamente
 * 
 * Esta implementación evita los errores 401 del Edge Function
 * haciendo llamadas directas a la base de datos de Supabase.
 */

import { supabase } from './supabase/client';

// ============================================
// HELPER: Auth Verification
// ============================================

async function verifyAuthOrThrow() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    console.warn('⚠️ [API Direct] getUser failed, trying to refresh session...', authError);

    const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError || !session?.user) {
      console.error('❌ [API Direct] Auth error after refresh:', refreshError);

      // Dispatch event to notify AuthContext
      if (typeof window !== 'undefined') {
        console.log('📢 Dispatching auth:unauthorized event from API Direct');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }

      throw new Error('No estás autenticado. Por favor inicia sesión nuevamente.');
    }

    console.log('✅ [API Direct] Session refreshed, user authenticated:', session.user.email);
    return session.user;
  }

  console.log('✅ [API Direct] User authenticated:', user.email);
  return user;
}

/**
 * Execute a Supabase query with automatic token refresh on 401/JWT errors
 */
async function executeWithRetry<T>(
  queryFn: () => PromiseLike<{ data: T | null; error: any }>
): Promise<T | null> {
  // First attempt
  const { data, error } = await queryFn();

  if (!error) return data;

  // Check if it's an auth error (401 or JWT invalid)
  const isAuthError =
    error.code === '401' ||
    error.code === 'PGRST301' ||
    (error.message && (
      error.message.includes('JWT') ||
      error.message.includes('unauthorized') ||
      error.message.includes('session')
    ));

  if (isAuthError) {
    console.warn('⚠️ [API Direct] Auth error detected, attempting to refresh session...', error);

    // Attempt refresh
    const { data: sessionData, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError || !sessionData.session) {
      console.error('❌ [API Direct] Session refresh failed:', refreshError);
      throw new Error('Unauthorized: Invalid JWT. Please try logging out and logging in again.');
    }

    console.log('✅ [API Direct] Session refreshed successfully, retrying query...');

    // Retry query
    const { data: retryData, error: retryError } = await queryFn();

    if (retryError) {
      console.error('❌ [API Direct] Query failed after refresh:', retryError);
      throw retryError;
    }

    return retryData;
  }

  throw error;
}

// ============================================
// INSPECCIONES
// ============================================

export interface Inspection {
  id: string;
  venue_id: string;
  inspector_id: string;
  fecha_inspeccion: string;
  presencia_marca: boolean;
  productos_disponibles: string[];
  material_pos: string[];
  competencia: string[];
  observaciones: string;
  fotos_urls: string[];
  detalles?: any; // Full questionnaire data
  created_at: string;
}

/**
 * Obtener todas las inspecciones del usuario actual
 */
export async function getInspections(): Promise<Inspection[]> {
  console.log('📡 [API Direct] Fetching inspections from Supabase...');

  try {
    // Verificar autenticación
    const user = await verifyAuthOrThrow();

    // ✅ Obtener el usuario en btl_usuarios
    const btlUser = await executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('btl_usuarios')
        .select('id, rol')
        .eq('auth_user_id', user.id)
        .single();

      return { data: data as any, error };
    });

    if (!btlUser) {
      console.log('⚠️ [API Direct] Usuario no encontrado en btl_usuarios');
      return []; // Si no existe el usuario, retornar array vacío
    }

    console.log('✅ [API Direct] Usuario BTL ID:', btlUser.id, 'Rol:', btlUser.rol);

    // Obtener inspecciones del usuario
    const data = await executeWithRetry(async () => {
      let query = supabase
        .from('btl_inspecciones')
        .select('*');

      // Si NO es admin, filtrar por usuario
      if (btlUser.rol !== 'admin' && btlUser.rol !== 'superadmin') {
        query = query.eq('usuario_id', btlUser.id);
      }

      const { data, error } = await query
        .order('fecha_inspeccion', { ascending: false });

      return { data: data as any, error };
    });

    console.log(`✅ [API Direct] Loaded ${data?.length || 0} inspections`);

    return data || [];
  } catch (error: any) {
    console.error('❌ [API Direct] Error:', error);
    throw error;
  }
}

/**
 * Crear una nueva inspección
 */
export async function createInspection(inspectionData: Omit<Inspection, 'id' | 'created_at' | 'inspector_id'>) {
  console.log('📡 [API Direct] Creating inspection...');

  try {
    // Verificar autenticación
    const user = await verifyAuthOrThrow();

    // ✅ PASO 1: Obtener o crear el usuario en btl_usuarios
    let btlUser;
    try {
      btlUser = await executeWithRetry(async () => {
        const { data, error } = await supabase
          .from('btl_usuarios')
          .select('id, nombre, rol')
          .eq('auth_user_id', user.id)
          .single();

        return { data: data as any, error };
      });
    } catch (e: any) {
      if (e.code === 'PGRST116') {
        btlUser = null;
      } else {
        throw e;
      }
    }

    // Si el usuario no existe, crearlo automáticamente
    if (!btlUser) {
      console.log('⚠️ [API Direct] Usuario no existe en btl_usuarios, creando...');

      btlUser = await executeWithRetry(async () => {
        const { data, error } = await supabase
          .from('btl_usuarios')
          .insert({
            auth_user_id: user.id,
            email: user.email,
            nombre: user.email?.split('@')[0] || 'Inspector',
            rol: 'inspector',
            activo: true
          } as any)
          .select('id, nombre, rol')
          .single();

        return { data: data as any, error };
      });

      if (!btlUser) {
        throw new Error('No se pudo crear el usuario. Por favor contacta al administrador.');
      }

      console.log('✅ [API Direct] Usuario creado:', btlUser.id);
    }

    console.log('✅ [API Direct] Usuario BTL:', {
      id: btlUser.id,
      nombre: btlUser.nombre,
      rol: btlUser.rol
    });

    // ✅ PASO 2: Crear inspección (Modelo 1:1 - Todo en una tabla)
    // Ya no separamos productData, insertamos todo junto
    const data = await executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('btl_inspecciones')
        .insert({
          ...inspectionData,
          usuario_id: btlUser.id, // ✅ Usar ID de btl_usuarios, no auth.users
        } as any)
        .select()
        .single();

      return { data: data as any, error };
    });

    console.log('✅ [API Direct] Inspection created:', data.id);

    return data;
  } catch (error: any) {
    console.error('❌ [API Direct] Error:', error);
    throw error;
  }
}

/**
 * Eliminar una inspección (Solo Admin)
 */
export async function deleteInspection(inspectionId: string) {
  console.log('📡 [API Direct] Deleting inspection:', inspectionId);

  try {
    const user = await verifyAuthOrThrow();

    // Verificar rol de admin
    const btlUser = await executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('btl_usuarios')
        .select('rol')
        .eq('auth_user_id', user.id)
        .single();
      return { data, error };
    });

    if (!btlUser || (btlUser.rol !== 'admin' && btlUser.rol !== 'superadmin')) {
      throw new Error('No tienes permisos para eliminar inspecciones.');
    }

    await executeWithRetry(async () => {
      const { error } = await supabase
        .from('btl_inspecciones')
        .delete()
        .eq('id', inspectionId);
      return { data: null, error };
    });

    console.log('✅ [API Direct] Inspection deleted');
  } catch (error: any) {
    console.error('❌ [API Direct] Error deleting inspection:', error);
    throw error;
  }
}

/**
 * Obtener rol del usuario actual
 */
export async function getUserRole(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('btl_usuarios')
      .select('rol')
      .eq('auth_user_id', user.id)
      .single();

    if (error) return null;
    return data?.rol || null;
  } catch (e) {
    return null;
  }
}

/**
 * Subir foto de inspección
 */
export async function uploadInspectionPhoto(file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `inspections/${fileName}`;

    console.log('📤 [API Direct] Uploading photo:', filePath);

    const { error: uploadError } = await supabase.storage
      .from('inspection-photos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('inspection-photos')
      .getPublicUrl(filePath);

    console.log('✅ [API Direct] Photo uploaded:', data.publicUrl);
    return data.publicUrl;
  } catch (error: any) {
    console.error('❌ [API Direct] Error uploading photo:', error);
    throw error;
  }
}

// ============================================
// PUNTOS DE VENTA (VENUES)
// ============================================

export interface Venue {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  region: string;
  tipo: string;
  contacto_nombre?: string;
  contacto_telefono?: string;
  latitud?: number;
  longitud?: number;
  created_at: string;
}

/**
 * Obtener todos los puntos de venta
 */
export async function getVenues(): Promise<Venue[]> {
  console.log('📡 [API Direct] Fetching venues from Supabase...');

  try {
    const data = await executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('btl_puntos_venta')
        .select('*')
        .order('nombre');

      return { data: data as any, error };
    });

    console.log(`✅ [API Direct] Loaded ${data?.length || 0} venues`);

    return data || [];
  } catch (error: any) {
    console.error('❌ [API Direct] Error:', error);
    throw error;
  }
}

/**
 * Obtener todos los clientes (usuarios con rol 'client')
 */
export async function getClients(): Promise<any[]> {
  console.log('📡 [API Direct] Fetching clients...');

  try {
    const data = await executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('btl_usuarios')
        .select('*')
        .eq('rol', 'client')
        .order('nombre');

      return { data: data as any, error };
    });

    console.log(`✅ [API Direct] Loaded ${data?.length || 0} clients`);

    return data || [];
  } catch (error: any) {
    console.error('❌ [API Direct] Error:', error);
    throw error;
  }
}

/**
 * Crear un nuevo punto de venta
 */
export async function createVenue(venueData: {
  nombre: string;
  direccion: string;
  tipo: string;
  ciudad?: string;
  region?: string;
}): Promise<Venue> {
  console.log('📡 [API Direct] Creating venue...');

  try {
    const data = await executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('btl_puntos_venta')
        .insert([{
          nombre: venueData.nombre,
          direccion: venueData.direccion,
          tipo: venueData.tipo,
          ciudad: venueData.ciudad || 'Sin especificar',
          region: venueData.region || 'Sin especificar',
        }] as any)
        .select()
        .single();

      return { data: data as any, error };
    });

    console.log('✅ [API Direct] Venue created:', data.id);
    return data;
  } catch (error: any) {
    console.error('❌ [API Direct] Error:', error);
    throw error;
  }
}

// ============================================
// ANALYTICS
// ============================================

export interface DashboardAnalytics {
  summary: {
    totalInspections: number;
    activeVenues: number;
    avgBrandPresence: number;
    trendsLastMonth: {
      inspections: number;
      brandPresence: number;
    };
  };
  recentInspections: any[];
  topVenues: any[];
  brandPresenceTrend: any[];
}

/**
 * Obtener analytics del dashboard
 */
export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  console.log('📡 [API Direct] Fetching dashboard analytics...');

  try {
    // Verificar autenticación
    const user = await verifyAuthOrThrow();

    // ✅ Obtener el usuario en btl_usuarios
    let btlUser;
    try {
      btlUser = await executeWithRetry(async () => {
        const { data, error } = await supabase
          .from('btl_usuarios')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        return { data: data as any, error };
      });
    } catch (e: any) {
      if (e.code === 'PGRST116') {
        btlUser = null;
      } else {
        throw e;
      }
    }

    if (!btlUser) {
      console.log('⚠️ [API Direct] Usuario no encontrado en btl_usuarios');
      // Retornar analytics vacíos
      return {
        summary: {
          totalInspections: 0,
          activeVenues: 0,
          avgBrandPresence: 0,
          trendsLastMonth: { inspections: 0, brandPresence: 0 },
        },
        recentInspections: [],
        topVenues: [],
        brandPresenceTrend: [],
      };
    }

    // Obtener todas las inspecciones del usuario
    const inspections = (await executeWithRetry(async () => {
      const { data, error } = await supabase
        .from('btl_inspecciones')
        .select('*')
        .eq('usuario_id', btlUser.id); // ✅ Usar ID de btl_usuarios

      return { data: data as any, error };
    })) as any;

    const allInspections = (inspections || []) as any;
    const totalInspections = allInspections.length;

    // Calcular venues únicos
    const uniqueVenues = new Set(allInspections.map((i: any) => i.punto_venta_id));
    const activeVenues = uniqueVenues.size;

    // Calcular presencia de marca promedio
    const avgBrandPresence = allInspections.length > 0
      ? (allInspections.filter((i: any) => i.tiene_producto).length / allInspections.length) * 100
      : 0;

    // Calcular tendencias del último mes
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const lastMonthInspections = allInspections.filter(
      (i: any) => new Date(i.fecha_inspeccion) >= oneMonthAgo
    );

    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    const previousMonthInspections = allInspections.filter(
      (i: any) => new Date(i.fecha_inspeccion) >= twoMonthsAgo && new Date(i.fecha_inspeccion) < oneMonthAgo
    );

    const inspectionsTrend = previousMonthInspections.length > 0
      ? ((lastMonthInspections.length - previousMonthInspections.length) / previousMonthInspections.length) * 100
      : 0;

    // Inspecciones recientes
    const recentInspections = allInspections
      .sort((a: any, b: any) => new Date(b.fecha_inspeccion).getTime() - new Date(a.fecha_inspeccion).getTime())
      .slice(0, 10);

    console.log('✅ [API Direct] Analytics calculated successfully');

    return {
      summary: {
        totalInspections,
        activeVenues,
        avgBrandPresence: Math.round(avgBrandPresence),
        trendsLastMonth: {
          inspections: Math.round(inspectionsTrend),
          brandPresence: 0, // TODO: calcular
        },
      },
      recentInspections,
      topVenues: [],
      brandPresenceTrend: [],
    };
  } catch (error: any) {
    console.error('❌ [API Direct] Error:', error);
    throw error;
  }
}

// ============================================
// HELPER: Verificar estado de autenticación (Solo lectura)
// ============================================

export async function checkAuthStatus() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('❌ [API Direct] Session error:', error);
      return { authenticated: false, error: error.message };
    }

    if (!session) {
      console.log('⚠️ [API Direct] No active session');
      return { authenticated: false, error: 'No hay sesión activa' };
    }

    console.log('✅ [API Direct] Session active:', session.user.email);

    return {
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.user_metadata?.role || 'inspector',
      },
      session,
    };
  } catch (error: any) {
    console.error('❌ [API Direct] Auth check error:', error);
    return { authenticated: false, error: error.message };
  }
}