import { createClient } from "npm:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  type: 'new_ticket' | 'new_user';
  payload: {
    // Ticket fields
    ticketId?: string;
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    userEmail?: string;
    dashboardUrl?: string;
    
    // User fields
    userName?: string;
    userRole?: string;
    userCompany?: string;
  };
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Validar variables de entorno críticas
    if (!RESEND_API_KEY) {
      console.error("❌ Faltante: RESEND_API_KEY");
      throw new Error("Configuración del servidor incompleta (Missing RESEND_API_KEY)");
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Faltante: Credenciales de Supabase");
      throw new Error("Configuración del servidor incompleta (Missing Supabase creds)");
    }

    const body = await req.json();
    const { type, payload } = body as EmailPayload;
    console.log(`📨 Recibida solicitud de tipo: ${type}`, payload);

    if (type !== 'new_ticket' && type !== 'new_user') {
      throw new Error(`Tipo de notificación no soportado: ${type}`);
    }

    // 2. Obtener emails de admins
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Consulta a la tabla correcta: btl_usuarios
    const { data: admins, error: adminError } = await supabase
      .from('btl_usuarios')
      .select('email')
      .eq('rol', 'admin');

    if (adminError) {
      console.error("❌ Error buscando admins en btl_usuarios:", adminError);
      throw new Error(`Error database: ${adminError.message}`);
    }

    if (!admins || admins.length === 0) {
      console.warn("⚠️ No se encontraron administradores en btl_usuarios");
      
      // DEBUG info
      const { data: debugUsers } = await supabase.from('btl_usuarios').select('*').limit(5);
      
      return new Response(JSON.stringify({ 
        message: "No admins found in btl_usuarios, skipping email",
        debug_info: {
          table: 'btl_usuarios',
          users_sample: debugUsers
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const adminEmails = admins.map(a => a.email).filter(Boolean);
    console.log(`👥 Enviando a ${adminEmails.length} admins:`, adminEmails);

    // 3. Preparar contenido del email según tipo
    let emailSubject = '';
    let emailHtml = '';

    if (type === 'new_ticket') {
      emailSubject = `[Nuevo Ticket] ${payload.priority?.toUpperCase()}: ${payload.title}`;
      emailHtml = `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #d4af37;">Nuevo Ticket de Soporte</h2>
          <p>Se ha creado un nuevo ticket que requiere atención.</p>
          
          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>ID:</strong> ${payload.ticketId}</p>
            <p><strong>Usuario:</strong> ${payload.userEmail || 'Desconocido'}</p>
            <p><strong>Categoría:</strong> ${payload.category}</p>
            <p><strong>Prioridad:</strong> <span style="color: ${payload.priority === 'high' ? 'red' : 'black'}">${payload.priority}</span></p>
            <hr style="border: 0; border-top: 1px solid #ddd;" />
            <p><strong>Descripción:</strong></p>
            <p>${payload.description}</p>
          </div>

          <a href="${payload.dashboardUrl}/admin/tickets/${payload.ticketId}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Ver Ticket en Dashboard
          </a>
        </div>
      `;
    } else if (type === 'new_user') {
      emailSubject = `[Nuevo Usuario] Aprobación requerida: ${payload.userName}`;
      emailHtml = `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #d4af37;">Nuevo Registro de Usuario</h2>
          <p>Un nuevo usuario se ha registrado y requiere aprobación.</p>
          
          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nombre:</strong> ${payload.userName}</p>
            <p><strong>Email:</strong> ${payload.userEmail}</p>
            <p><strong>Rol:</strong> ${payload.userRole}</p>
            ${payload.userCompany ? `<p><strong>Empresa:</strong> ${payload.userCompany}</p>` : ''}
          </div>

          <a href="${payload.dashboardUrl}/?mode=admin" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Ir al Panel de Usuarios
          </a>
        </div>
      `;
    }

    // 4. Enviar email con Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SaaS Dashboard <onboarding@resend.dev>", // Cambiar a tu dominio verificado en prod
        to: adminEmails, // Resend acepta array de strings en 'to' o 'bcc'
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("❌ Error de Resend API:", resendData);
      throw new Error(`Resend Error: ${resendData.message || resendData.name || 'Unknown error'}`);
    }

    console.log("✅ Email enviado exitosamente:", resendData);

    return new Response(JSON.stringify(resendData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Error general en Edge Function:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: "Revisa los logs de la función en Supabase Dashboard para más detalles."
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});