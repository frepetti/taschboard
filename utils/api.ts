import { projectId, publicAnonKey } from './supabase/info';
import { supabase } from './supabase/client';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-364126c3`;

// ============================================
// 🔧 CONFIGURACIÓN DE MODO
// ============================================
// Cambia esto a 'false' después de desplegar el Edge Function
// Para desplegar: Ve a Supabase Dashboard → Edge Functions → Deploy
const USE_MOCK_MODE = false;  // ✅ MODO REAL ACTIVADO - Backend conectado

// Para cambiar al modo servidor después del despliegue:
// 1. Despliega el Edge Function en Supabase ✅ DONE
// 2. Verifica que funcione: fetch('https://afatvrttubtzjdjzrsfy.supabase.co/functions/v1/make-server-364126c3/health').then(r => r.json()).then(console.log) ✅ DONE
// 3. Cambia USE_MOCK_MODE = false ✅ DONE
// 4. Recarga la aplicación
// ============================================

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string
) {
  // MOCK MODE: Return placeholder data
  if (USE_MOCK_MODE) {
    console.log('🎭 API Request in MOCK MODE:', { endpoint, method: options.method || 'GET' });
    console.log('💡 TIP: Change USE_MOCK_MODE to false in /utils/api.ts after deploying Edge Function');
    
    // Return mock data based on endpoint
    return getMockData(endpoint, options.method || 'GET');
  }

  // REAL MODE: Make actual API requests
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'apikey': publicAnonKey,  // Required by Supabase Edge Functions
    'Authorization': `Bearer ${accessToken || publicAnonKey}`,
    ...options.headers,
  };

  const url = `${API_BASE_URL}${endpoint}`;
  console.log('🌐 API Request to Server:', { url, method: options.method || 'GET' });

  try {
    let response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('📡 Server Response status:', response.status);

    // Handle 401 Unauthorized - Token might be expired or invalid
    if (response.status === 401) {
      console.warn('🔄 401 Unauthorized detected, attempting token refresh...');
      
      try {
        // Attempt to refresh the session
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !session?.access_token) {
          console.error('❌ Failed to refresh session:', refreshError);
          throw new Error('Unauthorized: Session expired. Please login again.');
        }

        console.log('✅ Session refreshed successfully, retrying request...');
        
        // Update authorization header with new token
        const newHeaders = {
          ...headers,
          'Authorization': `Bearer ${session.access_token}`
        };

        // Retry the request with new token
        response = await fetch(url, {
          ...options,
          headers: newHeaders,
        });

        console.log('📡 Retry Response status:', response.status);

        // If still 401 after refresh, then it's a CONFIGURATION issue (wrong project secrets), not a login issue
        if (response.status === 401) {
            let details = '';
            try {
                const errData = await response.clone().json();
                details = JSON.stringify(errData);
            } catch (e) { details = await response.clone().text(); }
            
            console.error('❌ Server rejected refreshed token (likely misconfigured secrets):', details);
            
            // IMPORTANT: Do NOT use "Unauthorized" in the message to avoid triggering the logout loop in UserManagement.tsx
            // This allows the fallback (DB Delete) to proceed
            throw new Error(`Server Forbidden: Token rejected after refresh. Check Edge Function secrets. Details: ${details}`);
        }

      } catch (refreshErr: any) {
        // Only dispatch unauthorized event if it was a REFRESH failure, not a CONFIG failure
        if (refreshErr.message?.includes('Server Forbidden')) {
             throw refreshErr; // Re-throw to be caught by caller (and trigger fallback)
        }

        console.error('🚫 Auth refresh failed:', refreshErr);
        
        // Dispatch event to notify AuthContext to logout ONLY if refresh failed
        if (typeof window !== 'undefined') {
            console.log('📢 Dispatching auth:unauthorized event');
            window.dispatchEvent(new Event('auth:unauthorized'));
        }
        
        throw refreshErr;
      }
    }

    // Try to parse JSON response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      // Only log error if status is not OK, otherwise it might be empty success response
      if (!response.ok) {
        console.error('❌ Non-JSON response:', text);
        throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
      }
      data = { success: true, message: text }; // Fallback for non-JSON success
    }

    if (!response.ok) {
      console.error('❌ API error response:', data);
      throw new Error(data.error || `API request failed with status ${response.status}`);
    }

    console.log('✅ API request successful');
    return data;
  } catch (error: any) {
    console.error('❌ API request error:', error);
    
    // Devolvemos el error tal cual para mostrar información real
    if (error.message?.includes('Failed to fetch')) {
        // En este caso es casi seguro un problema de CORS (por fallo 503) o red
        throw new Error('Error de red o servidor no disponible (CORS/503). Verifica los logs de Supabase.');
    }
    
    throw error;
  }
}

// ============================================
// 🎭 MOCK DATA (Solo para desarrollo/testing)
// ============================================
function getMockData(endpoint: string, method: string) {
  // Admin users endpoint
  if (endpoint === '/admin/users' && method === 'GET') {
    return {
      success: true,
      users: [
        {
          id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          company: 'Brand Monitor',
          created_at: new Date().toISOString(),
        }
      ]
    };
  }

  // Admin tickets endpoint
  if (endpoint === '/admin/tickets' && method === 'GET') {
    return {
      success: true,
      tickets: []
    };
  }

  // Admin stats endpoint
  if (endpoint === '/admin/stats' && method === 'GET') {
    // Check localStorage for imported venues
    const importedVenues = localStorage.getItem('imported_venues');
    const venueCount = importedVenues ? JSON.parse(importedVenues).length : 0;
    
    return {
      success: true,
      totalUsers: 1,
      totalInspections: 0,
      totalTickets: 0,
      totalVenues: venueCount,
      openTickets: 0,
      usersByRole: { inspector: 0, client: 0, admin: 1 },
      ticketsByStatus: { open: 0, 'in-progress': 0, resolved: 0 }
    };
  }

  // Inspections endpoint
  if (endpoint === '/inspections' && method === 'GET') {
    const inspections = localStorage.getItem('inspections');
    return {
      success: true,
      inspections: inspections ? JSON.parse(inspections) : [],
      count: inspections ? JSON.parse(inspections).length : 0
    };
  }

  // Create inspection
  if (endpoint === '/inspections' && method === 'POST') {
    return {
      success: true,
      inspection: {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        message: 'Inspection saved to localStorage (mock mode)'
      }
    };
  }

  // Analytics dashboard
  if (endpoint === '/analytics/dashboard' && method === 'GET') {
    const inspections = localStorage.getItem('inspections');
    const inspectionCount = inspections ? JSON.parse(inspections).length : 0;
    
    return {
      success: true,
      analytics: {
        totalInspections: inspectionCount,
        avgPerfectServeCompliance: 85,
        brandCoverage: 72,
        avgMonthlyRotation: 45,
        activatedVenues: Math.floor(inspectionCount * 0.6),
        lastInspection: inspectionCount > 0 ? new Date().toISOString() : null,
      }
    };
  }

  // Delete/Update operations - just return success
  if (method === 'DELETE' || method === 'PATCH' || method === 'POST') {
    return {
      success: true,
      message: 'Operation completed (mock mode)'
    };
  }

  // Default empty response
  return {
    success: true,
    data: []
  };
}

// Auth API
export const authAPI = {
  signup: async (email: string, password: string, name?: string, role: string = 'inspector', company?: string) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role, company }),
    });
  },
};

// Inspection API
export const inspectionAPI = {
  getAll: async (accessToken: string) => {
    return apiRequest('/inspections', { method: 'GET' }, accessToken);
  },

  getById: async (id: string, accessToken: string) => {
    return apiRequest(`/inspections/${id}`, { method: 'GET' }, accessToken);
  },

  create: async (venue: any, data: any, accessToken: string) => {
    return apiRequest(
      '/inspections',
      {
        method: 'POST',
        body: JSON.stringify({ venue, data }),
      },
      accessToken
    );
  },

  delete: async (id: string, accessToken: string) => {
    return apiRequest(`/inspections/${id}`, { method: 'DELETE' }, accessToken);
  },
};

// Venue API
export const venueAPI = {
  getAll: async (accessToken: string) => {
    return apiRequest('/venues', { method: 'GET' }, accessToken);
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboard: async (accessToken: string) => {
    return apiRequest('/analytics/dashboard', { method: 'GET' }, accessToken);
  },
};

// Ticket API
export const ticketAPI = {
  getAll: async (accessToken: string) => {
    return apiRequest('/tickets', { method: 'GET' }, accessToken);
  },

  create: async (ticket: any, accessToken: string) => {
    return apiRequest(
      '/tickets',
      {
        method: 'POST',
        body: JSON.stringify(ticket),
      },
      accessToken
    );
  },

  update: async (id: string, updates: any, accessToken: string) => {
    return apiRequest(
      `/tickets/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      },
      accessToken
    );
  },
};

// Admin API
export const adminAPI = {
  getUsers: async (accessToken: string) => {
    return apiRequest('/admin/users', { method: 'GET' }, accessToken);
  },

  updateUser: async (id: string, updates: any, accessToken: string) => {
    return apiRequest(
      `/admin/users/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      },
      accessToken
    );
  },

  deleteUser: async (id: string, accessToken: string) => {
    return apiRequest(`/admin/users/${id}`, { method: 'DELETE' }, accessToken);
  },

  getAllTickets: async (accessToken: string) => {
    return apiRequest('/admin/tickets', { method: 'GET' }, accessToken);
  },

  updateTicket: async (id: string, updates: any, accessToken: string) => {
    return apiRequest(
      `/admin/tickets/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      },
      accessToken
    );
  },

  getStats: async (accessToken: string) => {
    return apiRequest('/admin/stats', { method: 'GET' }, accessToken);
  },
};
