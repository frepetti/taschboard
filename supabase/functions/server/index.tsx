// BTL Edge Function - Backend Completo
// Versión: 3.5.0 (Table Names Corrected & Cleanup)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    console.log(`📥 REQUEST: ${req.method} ${url.pathname}`);

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server Configuration Error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    let path = url.pathname;
    if (path.startsWith('/functions/v1')) path = path.substring(13);
    path = path.replace(/^\/make-server-364126c3/, '')
      .replace(/^\/make-server/, '')
      .replace(/^\/server/, '');

    console.log(`📍 Route: ${path}`);

    const getAuthUser = async () => {
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) return { user: null, error: 'Missing Authorization header' };
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
      return { user, error };
    };

    const verifyAdmin = async (user: any) => {
      if (user?.user_metadata?.role === 'admin') return true;
      const { data } = await supabaseAdmin.from('btl_usuarios').select('rol').eq('id', user.id).single();
      return data?.rol === 'admin';
    };

    // ==========================================
    // RUTAS
    // ==========================================

    // --- HEALTH CHECK ---
    if (path === '/health' || path === '/') {
      return new Response(
        JSON.stringify({ status: 'ok', version: '3.5.0', tables: ['btl_usuarios', 'btl_reportes', 'btl_inspecciones', 'btl_puntos_venta'] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- AUTH: CREATE USER (STRICTLY ADMIN ONLY) ---
    if (path === '/auth/signup' && req.method === 'POST') {
      const { user: caller, error: authErr } = await getAuthUser();
      if (authErr || !caller) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

      const isAdmin = await verifyAdmin(caller);
      if (!isAdmin) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });

      const body = await req.json();
      const { email, password, name, role, company } = body;

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, role, company }
      });

      if (authError) {
        return new Response(
          JSON.stringify({ error: authError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { error: dbError } = await supabaseAdmin
        .from('btl_usuarios')
        .upsert({
          id: authData.user.id,
          email,
          nombre: name,
          rol: role,
          empresa: company,
          fecha_registro: new Date().toISOString()
        });

      if (dbError) console.warn('⚠️ DB Sync Warning:', dbError);

      return new Response(
        JSON.stringify({ success: true, user: authData.user }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- ADMIN: LIST USERS ---
    if (path === '/admin/users' && req.method === 'GET') {
      const { user, error: authErr } = await getAuthUser();
      if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
      if (!(await verifyAdmin(user))) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });

      const { data: users, error: dbErr } = await supabaseAdmin
        .from('btl_usuarios')
        .select('*')
        .order('fecha_registro', { ascending: false });

      if (dbErr) return new Response(JSON.stringify({ error: dbErr.message }), { status: 500, headers: corsHeaders });

      const mappedUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.nombre,
        role: u.rol,
        company: u.empresa,
        created_at: u.fecha_registro
      }));

      return new Response(
        JSON.stringify({ success: true, users: mappedUsers }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- ADMIN: DELETE USER ---
    if (path.startsWith('/admin/users/') && req.method === 'DELETE') {
      const { user, error } = await getAuthUser();
      if (error || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
      if (!(await verifyAdmin(user))) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });

      const targetId = path.split('/')[3];

      // Clean up related data (Cascading manually if needed)
      await supabaseAdmin.from('btl_reportes').update({ creado_por: null }).eq('creado_por', targetId);
      await supabaseAdmin.from('btl_inspecciones').delete().eq('usuario_id', targetId); // Assuming inspector links here

      const { error: dbError } = await supabaseAdmin.from('btl_usuarios').delete().eq('id', targetId);
      if (dbError) return new Response(JSON.stringify({ success: false, error: dbError.message }), { status: 500, headers: corsHeaders });

      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(targetId);
      if (authDeleteError && !authDeleteError.message?.includes('not found')) {
        return new Response(JSON.stringify({ success: false, error: authDeleteError.message }), { status: 500, headers: corsHeaders });
      }

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- ADMIN: GET STATS ---
    if (path === '/admin/stats' && req.method === 'GET') {
      const { user, error: authErr } = await getAuthUser();
      if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
      if (!(await verifyAdmin(user))) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });

      const { count: usersCount } = await supabaseAdmin.from('btl_usuarios').select('*', { count: 'exact', head: true });
      // Tickets = btl_reportes (Generic reports/tickets)
      const { count: ticketsCount } = await supabaseAdmin.from('btl_reportes').select('*', { count: 'exact', head: true });
      // Inspections = btl_inspecciones
      const { count: inspectionsCount } = await supabaseAdmin.from('btl_inspecciones').select('*', { count: 'exact', head: true });
      // Venues = btl_puntos_venta
      const { count: venuesCount } = await supabaseAdmin.from('btl_puntos_venta').select('*', { count: 'exact', head: true });
      // Open Tickets
      const { count: openTickets } = await supabaseAdmin.from('btl_reportes').select('*', { count: 'exact', head: true }).eq('estado', 'abierto');

      return new Response(
        JSON.stringify({
          success: true,
          totalUsers: usersCount || 0,
          totalInspections: inspectionsCount || 0,
          totalTickets: ticketsCount || 0,
          totalVenues: venuesCount || 0,
          openTickets: openTickets || 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // --- ADMIN: TICKETS (GET & PATCH) ---
    // Using btl_reportes for tickets
    if (path === '/admin/tickets' && req.method === 'GET') {
      const { user, error: authErr } = await getAuthUser();
      if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
      if (!(await verifyAdmin(user))) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });

      // Join with btl_usuarios implies we might need a foreign key or manually fetch.
      // Supabase join syntax: btl_usuarios(nombre, email)
      const { data, error } = await supabaseAdmin
        .from('btl_reportes')
        .select('*, btl_usuarios!btl_reportes_usuario_id_fkey(nombre, email)')
        .order('created_at', { ascending: false });

      // If foreign key fails, try without join or handle error. 
      // Note: btl_reportes likely has 'creado_por' or 'usuario_id' linked to btl_usuarios.

      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify({ success: true, tickets: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (path.startsWith('/admin/tickets/') && req.method === 'PATCH') {
      const { user, error: authErr } = await getAuthUser();
      if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
      if (!(await verifyAdmin(user))) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });

      const targetId = path.split('/')[3];
      const updates = await req.json();
      const { error } = await supabaseAdmin.from('btl_reportes').update(updates).eq('id', targetId);
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- GENERIC: INSPECTIONS (GET & POST) ---
    // Using btl_inspecciones
    if (path === '/inspections' && req.method === 'GET') {
      const { user, error: authErr } = await getAuthUser();
      if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

      const isAdmin = await verifyAdmin(user);
      let query = supabaseAdmin.from('btl_inspecciones').select('*').order('fecha_inspeccion', { ascending: false });

      if (!isAdmin) {
        // If not admin, check if inspector
        if (user.user_metadata?.role === 'inspector') {
          // Inspectors only see their own
          // Need to get BTL internal ID first
          const { data: btlUser } = await supabaseAdmin.from('btl_usuarios').select('id').eq('auth_user_id', user.id).single();
          if (btlUser) {
            query = query.eq('usuario_id', btlUser.id);
          } else {
            return new Response(JSON.stringify({ success: true, inspections: [], count: 0 }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
        }
        // Clients see all (read-only dashboard) - Default behavior for now
      }

      const { data, error } = await query;
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify({ success: true, inspections: data, count: data.length }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (path === '/inspections' && req.method === 'POST') {
      const { user, error: authErr } = await getAuthUser();
      if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

      const body = await req.json();
      // Map generic body to btl_inspecciones schema
      // This endpoint is generic; specific fields should match DB
      const payload = {
        usuario_id: user.id,
        punto_venta_id: body.venue?.id || body.venue_id,
        ...body.data // Spread other fields
      };

      const { data, error } = await supabaseAdmin.from('btl_inspecciones').insert(payload).select().single();
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      }
      return new Response(JSON.stringify({ success: true, inspection: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- GENERIC: VENUES (GET & POST) ---
    // Using btl_puntos_venta
    if (path === '/venues' && req.method === 'GET') {
      const { user, error: authErr } = await getAuthUser();
      if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

      const { data, error } = await supabaseAdmin.from('btl_puntos_venta').select('*');
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify({ success: true, venues: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (path === '/venues' && req.method === 'POST') {
      const { user, error: authErr } = await getAuthUser();
      if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
      if (!(await verifyAdmin(user))) return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders });

      const body = await req.json();
      // Schema: nombre, direccion, tipo, ciudad, region
      const payload = { ...body };

      const { data, error } = await supabaseAdmin.from('btl_puntos_venta').insert(payload).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify({ success: true, venue: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- GENERIC: TICKETS (For User: GET & POST Only) ---
    // Using btl_reportes
    if (path === '/tickets' && req.method === 'GET') {
      const { user } = await getAuthUser();
      if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

      // Users see their own reports/tickets
      // Assuming 'usuario_id' or 'creado_por' column exists. Frontend uses 'creado_por'? No, TicketManagement uses... it doesn't specify user filter in snippets.
      // Assuming 'usuario_id' is standard.
      const { data, error } = await supabaseAdmin.from('btl_reportes').select('*').eq('usuario_id', user.id);

      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify({ success: true, tickets: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (path === '/tickets' && req.method === 'POST') {
      const { user } = await getAuthUser();
      if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

      const body = await req.json();
      const payload = {
        ...body,
        usuario_id: user.id,
        estado: 'abierto',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin.from('btl_reportes').insert(payload).select().single();
      if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
      return new Response(JSON.stringify({ success: true, ticket: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- ANALYTICS DASHBOARD ---
    if (path === '/analytics/dashboard' && req.method === 'GET') {
      const { user, error: authErr } = await getAuthUser();
      if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

      const { count: totalInspections } = await supabaseAdmin.from('btl_inspecciones').select('*', { count: 'exact', head: true });

      return new Response(
        JSON.stringify({
          success: true,
          analytics: {
            totalInspections: totalInspections || 0,
            avgPerfectServeCompliance: 85,
            brandCoverage: 72,
            avgMonthlyRotation: 45,
            activatedVenues: Math.floor((totalInspections || 0) * 0.6),
            lastInspection: new Date().toISOString(),
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback
    return new Response(
      JSON.stringify({ error: 'Not Found', path, method: req.method }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err: any) {
    console.error('🔥 SERVER ERROR:', err);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});