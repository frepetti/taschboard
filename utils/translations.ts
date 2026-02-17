export const translations = {
  es: {
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      back: 'Volver',
      logout: 'Cerrar Sesión',
      admin: 'Admin',
      inspector: 'Inspector',
      client: 'Cliente',
      user: 'Usuario',
      company: 'Empresa',
      date: 'Fecha',
      search: 'Buscar...',
      total: 'Total',
      no_data: 'No se encontraron datos',
      actions: 'Acciones',
      save: 'Guardar',
      cancel: 'Cancelar',
      send: 'Enviar',
      delete: 'Eliminar',
      edit: 'Editar',
      filter_all: 'Todos',
      dashboard: 'Dashboard',
      view_admin: 'Volver a Admin',
      access_inspector: 'Acceso Inspector',
      access_client: 'Acceso Cliente'
    },
    auth: {
      login: 'Iniciar Sesión',
      email: 'Correo Electrónico',
      password: 'Contraseña',
      forgot_password: '¿Olvidaste tu contraseña?',
      sign_in: 'Ingresar',
      welcome: 'Bienvenido de nuevo',
      inspector_desc: 'Para empleados de campo. Registra inspecciones.',
      client_desc: 'Para clientes. Visualiza métricas y reportes.',
      admin_desc: 'Gestión completa del sistema.'
    },
    tickets: {
      title: 'Gestión de Tickets',
      new_ticket: 'Nueva Solicitud / Ticket',
      subject: 'Asunto',
      description: 'Descripción',
      priority: 'Prioridad',
      category: 'Categoría',
      status: 'Estado',
      type: 'Tipo',
      created_by: 'Creado por',
      created_at: 'Creado el',
      updated_at: 'Actualizado',
      ticket: 'Ticket',
      request: 'Solicitud',
      details: 'Detalles del Ticket',
      change_status: 'Cambiar Estado',
      
      // Categorías
      cat_general: 'General',
      cat_training: 'Capacitación',
      cat_btl: 'Acción BTL',
      cat_pop: 'Material POP',
      
      // Prioridades
      prio_low: 'Baja',
      prio_medium: 'Media',
      prio_high: 'Alta',
      prio_urgent: 'Urgente',
      prio_critical: 'Crítica',
      
      // Estados
      status_open: 'Abierto',
      status_progress: 'En Progreso',
      status_resolved: 'Resuelto',
      status_closed: 'Cerrado',
      
      // Botones / Labels
      btn_create: 'Crear Ticket',
      btn_sending: 'Enviando...',
      success_create_title: 'Ticket Creado',
      success_create_msg: 'Tu solicitud ha sido enviada correctamente.',
      
      // Formulario
      select_cat: 'Selecciona una categoría',
      ph_subject: 'Describe brevemente el asunto',
      ph_desc: 'Detalla tu solicitud...',
      
      // Campos específicos
      training_req: 'Capacitación Solicitada',
      participants: 'Participantes Estimados',
      topics: 'Temas de Interés',
      
      activation_type: 'Tipo de Activación',
      activation_date: 'Fecha Solicitada',
      venue: 'Punto de Venta',
      location: 'Ubicación / Dirección',
      products: 'Productos Involucrados',
      budget: 'Presupuesto Estimado',
      impact: 'Impacto Esperado',
      
      materials: 'Materiales Solicitados',
      add_material: 'Agregar Material'
    },
    inspector: {
      new_inspection: 'Nueva Inspección',
      history: 'Historial',
      venues_available: 'puntos de venta disponibles',
      search_placeholder: 'Buscar por nombre o dirección...',
      add_venue: 'Agregar Nuevo Punto de Venta',
      select_venue: 'Seleccionar Punto de Venta',
      venue_name: 'Nombre del Lugar',
      enter_venue_name: 'Ingrese el nombre del punto de venta',
      enter_address: 'Ingrese la dirección completa',
      channel_type: 'Tipo de Canal',
      continue_inspection: 'Continuar a Inspección',
      start_adding_venue: 'Comienza agregando tu primer punto de venta',
      no_venues_found_query: 'No se encontraron puntos de venta con "{query}"',
      add_as_new: 'Agregar como nuevo punto de venta',
      creating: 'Creando...'
    },
    charts: {
      brand_execution: 'Rendimiento de Ejecución de Marca',
      execution_index: 'Índice Ejecución',
      visibility: 'Visibilidad',
      rotation: 'Rotación',
      activations: 'Activaciones',
      share_of_menu: 'Comparativa Share of Menu',
      current: 'Actual',
      vs_last_period: 'vs Periodo Anterior',
      target: 'Objetivo',
      leads_text: 'lidera con',
      share_across: 'de participación en',
      months: {
        jan: 'Ene',
        feb: 'Feb',
        mar: 'Mar',
        apr: 'Abr',
        may: 'May',
        jun: 'Jun',
        jul: 'Jul',
        aug: 'Ago',
        sep: 'Sep',
        oct: 'Oct',
        nov: 'Nov',
        dec: 'Dic'
      }
    },
    map: {
      title: 'Mapa de Territorio',
      all_venues: 'Todos',
      strategic: 'Estratégico',
      opportunity: 'Oportunidad',
      risk: 'Riesgo',
      activated: 'Activado'
    }
  },
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      back: 'Back',
      logout: 'Sign Out',
      admin: 'Admin',
      inspector: 'Inspector',
      client: 'Client',
      user: 'User',
      company: 'Company',
      date: 'Date',
      search: 'Search...',
      total: 'Total',
      no_data: 'No data found',
      actions: 'Actions',
      save: 'Save',
      cancel: 'Cancel',
      send: 'Send',
      delete: 'Delete',
      edit: 'Edit',
      filter_all: 'All',
      dashboard: 'Dashboard',
      view_admin: 'Back to Admin',
      access_inspector: 'Inspector Access',
      access_client: 'Client Access'
    },
    auth: {
      login: 'Sign In',
      email: 'Email Address',
      password: 'Password',
      forgot_password: 'Forgot password?',
      sign_in: 'Login',
      welcome: 'Welcome back',
      inspector_desc: 'For field employees. Log inspections.',
      client_desc: 'For clients. View metrics and reports.',
      admin_desc: 'Full system management.'
    },
    tickets: {
      title: 'Ticket Management',
      new_ticket: 'New Request / Ticket',
      subject: 'Subject',
      description: 'Description',
      priority: 'Priority',
      category: 'Category',
      status: 'Status',
      type: 'Type',
      created_by: 'Created by',
      created_at: 'Created on',
      updated_at: 'Updated',
      ticket: 'Ticket',
      request: 'Request',
      details: 'Ticket Details',
      change_status: 'Change Status',
      
      // Categories
      cat_general: 'General',
      cat_training: 'Training',
      cat_btl: 'BTL Action',
      cat_pop: 'POP Material',
      
      // Priorities
      prio_low: 'Low',
      prio_medium: 'Medium',
      prio_high: 'High',
      prio_urgent: 'Urgent',
      prio_critical: 'Critical',
      
      // Statuses
      status_open: 'Open',
      status_progress: 'In Progress',
      status_resolved: 'Resolved',
      status_closed: 'Closed',
      
      // Buttons / Labels
      btn_create: 'Create Ticket',
      btn_sending: 'Sending...',
      success_create_title: 'Ticket Created',
      success_create_msg: 'Your request has been sent successfully.',
      
      // Formulario
      select_cat: 'Select a category',
      ph_subject: 'Briefly describe the subject',
      ph_desc: 'Detail your request...',
      
      // Specific fields
      training_req: 'Requested Training',
      participants: 'Estimated Participants',
      topics: 'Topics of Interest',
      
      activation_type: 'Activation Type',
      activation_date: 'Requested Date',
      venue: 'Point of Sale',
      location: 'Location / Address',
      products: 'Involved Products',
      budget: 'Estimated Budget',
      impact: 'Expected Impact',
      
      materials: 'Requested Materials',
      add_material: 'Add Material'
    },
    inspector: {
      new_inspection: 'New Inspection',
      history: 'History',
      venues_available: 'venues available',
      search_placeholder: 'Search by name or address...',
      add_venue: 'Add New Venue',
      select_venue: 'Select Point of Sale',
      venue_name: 'Venue Name',
      enter_venue_name: 'Enter venue name',
      enter_address: 'Enter full address',
      channel_type: 'Channel Type',
      continue_inspection: 'Continue to Inspection',
      start_adding_venue: 'Start by adding your first venue',
      no_venues_found_query: 'No venues found matching "{query}"',
      add_as_new: 'Add as new venue',
      creating: 'Creating...'
    },
    charts: {
      brand_execution: 'Brand Execution Performance',
      execution_index: 'Execution Index',
      visibility: 'Visibility',
      rotation: 'Rotation',
      activations: 'Activations',
      share_of_menu: 'Share of Menu Comparison',
      current: 'Current',
      vs_last_period: 'vs Last Period',
      target: 'Target',
      leads_text: 'leads with',
      share_across: 'share across',
      months: {
        jan: 'Jan',
        feb: 'Feb',
        mar: 'Mar',
        apr: 'Apr',
        may: 'May',
        jun: 'Jun',
        jul: 'Jul',
        aug: 'Aug',
        sep: 'Sep',
        oct: 'Oct',
        nov: 'Nov',
        dec: 'Dec'
      }
    },
    map: {
      title: 'Territory Map',
      all_venues: 'All Venues',
      strategic: 'Strategic',
      opportunity: 'Opportunity',
      risk: 'Risk',
      activated: 'Activated'
    }
  }
};