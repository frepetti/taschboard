import { supabase } from './supabase/client';
// import { projectId, publicAnonKey } from './supabase/info';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface TicketNotificationData {
  ticketId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  createdBy: string;
  createdByEmail?: string;
}

/**
 * Envía una notificación por correo a los administradores.
 * Utiliza Supabase Edge Functions ('send-email').
 */
export async function sendAdminNotification(data: TicketNotificationData): Promise<boolean> {
  try {
    console.log('📧 [Notification System] Iniciando envío de notificación vía Edge Function...');

    // Obtenemos el token de sesión real del usuario para autenticación segura
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token ?? supabaseAnonKey;

    const functionUrl = `${supabaseUrl}/functions/v1/send-email`;

    console.log('🚀 Calling Edge Function at:', functionUrl);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey
      },
      body: JSON.stringify({
        type: 'new_ticket',
        payload: {
          ticketId: data.ticketId,
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          userEmail: data.createdByEmail,
          dashboardUrl: typeof window !== 'undefined' ? window.location.origin : ''
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('❌ Edge Function Error Response:', response.status, errorBody);

      let errorMessage = `Edge Function returned ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.error) {
          errorMessage = errorJson.error;
          if (errorJson.error.includes('RESEND_API_KEY')) {
            errorMessage = 'Falta configurar RESEND_API_KEY en los secretos de Supabase (Edge Functions).';
          }
        }
      } catch (e) {
        errorMessage += `: ${errorBody}`;
      }

      throw new Error(errorMessage);
    }

    const responseData = await response.json();


    console.log('✅ [Notification System] Email enviado exitosamente:', responseData);
    return true;

  } catch (error) {
    console.error('❌ [Notification System] Error enviando email:', error);
    console.warn('⚠️ Asegúrate de haber desplegado la Edge Function "send-email" y configurado las variables de entorno (RESEND_API_KEY).');
    return false;
  }
}
