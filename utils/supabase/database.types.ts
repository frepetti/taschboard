export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      btl_capacitacion_asistentes: {
        Row: {
          aprobo: boolean | null
          asistio: boolean | null
          calificacion_capacitacion: number | null
          calificacion_evaluacion: number | null
          capacitacion_id: string
          created_at: string | null
          estado_inscripcion: string | null
          id: string
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          aprobo?: boolean | null
          asistio?: boolean | null
          calificacion_capacitacion?: number | null
          calificacion_evaluacion?: number | null
          capacitacion_id: string
          created_at?: string | null
          estado_inscripcion?: string | null
          id?: string
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          aprobo?: boolean | null
          asistio?: boolean | null
          calificacion_capacitacion?: number | null
          calificacion_evaluacion?: number | null
          capacitacion_id?: string
          created_at?: string | null
          estado_inscripcion?: string | null
          id?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "btl_capacitacion_asistentes_capacitacion_id_fkey"
            columns: ["capacitacion_id"]
            isOneToOne: false
            referencedRelation: "btl_capacitaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btl_capacitacion_asistentes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "btl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      btl_capacitaciones: {
        Row: {
          asistencia_esperada: number | null
          asistencia_real: number | null
          categoria: string | null
          certificado_emitido: boolean | null
          costo_total: number | null
          creado_por: string | null
          created_at: string | null
          cupo_maximo: number | null
          cupo_minimo: number | null
          descripcion: string | null
          duracion_horas: number | null
          estado: string | null
          fecha_fin: string | null
          fecha_inicio: string
          id: string
          instructor_nombre: string | null
          link_sesion: string | null
          material_urls: string[] | null
          modalidad: string | null
          nivel: string | null
          objetivo: string | null
          plataforma: string | null
          porcentaje_asistencia: number | null
          productos_relacionados: string[] | null
          promedio_calificacion: number | null
          temas: string[] | null
          tipo: string | null
          titulo: string
          ubicacion: string | null
          updated_at: string | null
        }
        Insert: {
          asistencia_esperada?: number | null
          asistencia_real?: number | null
          categoria?: string | null
          certificado_emitido?: boolean | null
          costo_total?: number | null
          creado_por?: string | null
          created_at?: string | null
          cupo_maximo?: number | null
          cupo_minimo?: number | null
          descripcion?: string | null
          duracion_horas?: number | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio: string
          id?: string
          instructor_nombre?: string | null
          link_sesion?: string | null
          material_urls?: string[] | null
          modalidad?: string | null
          nivel?: string | null
          objetivo?: string | null
          plataforma?: string | null
          porcentaje_asistencia?: number | null
          productos_relacionados?: string[] | null
          promedio_calificacion?: number | null
          temas?: string[] | null
          tipo?: string | null
          titulo: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Update: {
          asistencia_esperada?: number | null
          asistencia_real?: number | null
          categoria?: string | null
          certificado_emitido?: boolean | null
          costo_total?: number | null
          creado_por?: string | null
          created_at?: string | null
          cupo_maximo?: number | null
          cupo_minimo?: number | null
          descripcion?: string | null
          duracion_horas?: number | null
          estado?: string | null
          fecha_fin?: string | null
          fecha_inicio?: string
          id?: string
          instructor_nombre?: string | null
          link_sesion?: string | null
          material_urls?: string[] | null
          modalidad?: string | null
          nivel?: string | null
          objetivo?: string | null
          plataforma?: string | null
          porcentaje_asistencia?: number | null
          productos_relacionados?: string[] | null
          promedio_calificacion?: number | null
          temas?: string[] | null
          tipo?: string | null
          titulo?: string
          ubicacion?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "btl_capacitaciones_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "btl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      btl_cliente_productos: {
        Row: {
          created_at: string | null
          id: string
          objetivo_pop_custom: number | null
          objetivo_presencia_custom: number | null
          objetivo_stock_custom: number | null
          orden: number | null
          producto_id: string
          updated_at: string | null
          usuario_id: string
          visible_dashboard: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          objetivo_pop_custom?: number | null
          objetivo_presencia_custom?: number | null
          objetivo_stock_custom?: number | null
          orden?: number | null
          producto_id: string
          updated_at?: string | null
          usuario_id: string
          visible_dashboard?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          objetivo_pop_custom?: number | null
          objetivo_presencia_custom?: number | null
          objetivo_stock_custom?: number | null
          orden?: number | null
          producto_id?: string
          updated_at?: string | null
          usuario_id?: string
          visible_dashboard?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "btl_cliente_productos_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "btl_productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btl_cliente_productos_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "btl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      btl_clientes_venues: {
        Row: {
          cliente_id: string | null
          created_at: string
          id: string
          venue_id: string | null
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          venue_id?: string | null
        }
        Update: {
          cliente_id?: string | null
          created_at?: string
          id?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "btl_clientes_venues_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "btl_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btl_clientes_venues_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "btl_puntos_venta"
            referencedColumns: ["id"]
          },
        ]
      }
      btl_inspecciones: {
        Row: {
          created_at: string | null
          en_promocion: boolean | null
          fecha_inspeccion: string
          fotos_urls: string[] | null
          id: string
          material_pop_detalle: string | null
          material_pop_tipos: string[] | null
          observaciones: string | null
          precio_venta: number | null
          producto_id: string | null
          punto_venta_id: string
          stock_estimado: string | null
          stock_nivel: string | null
          stock_unidades: number | null
          temperatura_refrigeracion: number | null
          tiene_material_pop: boolean | null
          tiene_producto: boolean | null
          updated_at: string | null
          usuario_id: string
          visibilidad_score: number | null
        }
        Insert: {
          created_at?: string | null
          en_promocion?: boolean | null
          fecha_inspeccion?: string
          fotos_urls?: string[] | null
          id?: string
          material_pop_detalle?: string | null
          material_pop_tipos?: string[] | null
          observaciones?: string | null
          precio_venta?: number | null
          producto_id?: string | null
          punto_venta_id: string
          stock_estimado?: string | null
          stock_nivel?: string | null
          stock_unidades?: number | null
          temperatura_refrigeracion?: number | null
          tiene_material_pop?: boolean | null
          tiene_producto?: boolean | null
          updated_at?: string | null
          usuario_id: string
          visibilidad_score?: number | null
        }
        Update: {
          created_at?: string | null
          en_promocion?: boolean | null
          fecha_inspeccion?: string
          fotos_urls?: string[] | null
          id?: string
          material_pop_detalle?: string | null
          material_pop_tipos?: string[] | null
          observaciones?: string | null
          precio_venta?: number | null
          producto_id?: string | null
          punto_venta_id?: string
          stock_estimado?: string | null
          stock_nivel?: string | null
          stock_unidades?: number | null
          temperatura_refrigeracion?: number | null
          tiene_material_pop?: boolean | null
          tiene_producto?: boolean | null
          updated_at?: string | null
          usuario_id?: string
          visibilidad_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "btl_inspecciones_producto_id_fkey"
            columns: ["producto_id"]
            isOneToOne: false
            referencedRelation: "btl_productos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btl_inspecciones_punto_venta_id_fkey"
            columns: ["punto_venta_id"]
            isOneToOne: false
            referencedRelation: "btl_puntos_venta"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btl_inspecciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "btl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      btl_productos: {
        Row: {
          activo: boolean | null
          categoria: string | null
          codigo_barras: string | null
          color_primario: string | null
          color_secundario: string | null
          created_at: string | null
          descripcion: string | null
          id: string
          logo_url: string | null
          marca: string
          nombre: string
          objetivo_pop: number | null
          objetivo_presencia: number | null
          objetivo_stock: number | null
          orden_visualizacion: number | null
          presentacion: string | null
          sku: string | null
          subcategoria: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          categoria?: string | null
          codigo_barras?: string | null
          color_primario?: string | null
          color_secundario?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          logo_url?: string | null
          marca: string
          nombre: string
          objetivo_pop?: number | null
          objetivo_presencia?: number | null
          objetivo_stock?: number | null
          orden_visualizacion?: number | null
          presentacion?: string | null
          sku?: string | null
          subcategoria?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          categoria?: string | null
          codigo_barras?: string | null
          color_primario?: string | null
          color_secundario?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          logo_url?: string | null
          marca?: string
          nombre?: string
          objetivo_pop?: number | null
          objetivo_presencia?: number | null
          objetivo_stock?: number | null
          orden_visualizacion?: number | null
          presentacion?: string | null
          sku?: string | null
          subcategoria?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      btl_puntos_venta: {
        Row: {
          ciudad: string | null
          contacto_nombre: string | null
          contacto_telefono: string | null
          created_at: string | null
          created_by: string | null
          direccion: string | null
          id: string
          latitud: number | null
          longitud: number | null
          nombre: string
          potencial_ventas: string | null
          region_id: string | null
          segmento: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          ciudad?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          nombre: string
          potencial_ventas?: string | null
          region_id?: string | null
          segmento?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          ciudad?: string | null
          contacto_nombre?: string | null
          contacto_telefono?: string | null
          created_at?: string | null
          created_by?: string | null
          direccion?: string | null
          id?: string
          latitud?: number | null
          longitud?: number | null
          nombre?: string
          potencial_ventas?: string | null
          region_id?: string | null
          segmento?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "btl_puntos_venta_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "btl_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btl_puntos_venta_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "btl_regiones"
            referencedColumns: ["id"]
          },
        ]
      }
      btl_regiones: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          nombre: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          nombre?: string
        }
        Relationships: []
      }
      btl_reportes: {
        Row: {
          archivos_adjuntos: string[] | null
          asignado_a: string | null
          asunto: string | null
          calificacion_servicio: number | null
          cantidad_solicitada: number | null
          capacitacion_id: string | null
          categoria: string | null
          creado_por: string | null
          created_at: string | null
          descripcion: string
          estado: string | null
          fecha_activacion_solicitada: string | null
          fecha_aprobacion: string | null
          fecha_entrega_requerida: string | null
          fecha_rechazo: string | null
          fecha_resolucion: string | null
          id: string
          inspeccion_id: string | null
          marca_producto: string | null
          motivo_rechazo: string | null
          prioridad: string | null
          productos_involucrados: string[] | null
          punto_venta_id: string | null
          subcategoria: string | null
          tipo: string
          tipo_activacion: string | null
          tipo_material: string | null
          titulo: string
          updated_at: string | null
          urgente: boolean | null
        }
        Insert: {
          archivos_adjuntos?: string[] | null
          asignado_a?: string | null
          asunto?: string | null
          calificacion_servicio?: number | null
          cantidad_solicitada?: number | null
          capacitacion_id?: string | null
          categoria?: string | null
          creado_por?: string | null
          created_at?: string | null
          descripcion: string
          estado?: string | null
          fecha_activacion_solicitada?: string | null
          fecha_aprobacion?: string | null
          fecha_entrega_requerida?: string | null
          fecha_rechazo?: string | null
          fecha_resolucion?: string | null
          id?: string
          inspeccion_id?: string | null
          marca_producto?: string | null
          motivo_rechazo?: string | null
          prioridad?: string | null
          productos_involucrados?: string[] | null
          punto_venta_id?: string | null
          subcategoria?: string | null
          tipo: string
          tipo_activacion?: string | null
          tipo_material?: string | null
          titulo: string
          updated_at?: string | null
          urgente?: boolean | null
        }
        Update: {
          archivos_adjuntos?: string[] | null
          asignado_a?: string | null
          asunto?: string | null
          calificacion_servicio?: number | null
          cantidad_solicitada?: number | null
          capacitacion_id?: string | null
          categoria?: string | null
          creado_por?: string | null
          created_at?: string | null
          descripcion?: string
          estado?: string | null
          fecha_activacion_solicitada?: string | null
          fecha_aprobacion?: string | null
          fecha_entrega_requerida?: string | null
          fecha_rechazo?: string | null
          fecha_resolucion?: string | null
          id?: string
          inspeccion_id?: string | null
          marca_producto?: string | null
          motivo_rechazo?: string | null
          prioridad?: string | null
          productos_involucrados?: string[] | null
          punto_venta_id?: string | null
          subcategoria?: string | null
          tipo?: string
          tipo_activacion?: string | null
          tipo_material?: string | null
          titulo?: string
          updated_at?: string | null
          urgente?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "btl_reportes_asignado_a_fkey"
            columns: ["asignado_a"]
            isOneToOne: false
            referencedRelation: "btl_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btl_reportes_capacitacion_id_fkey"
            columns: ["capacitacion_id"]
            isOneToOne: false
            referencedRelation: "btl_capacitaciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btl_reportes_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "btl_usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btl_reportes_inspeccion_id_fkey"
            columns: ["inspeccion_id"]
            isOneToOne: false
            referencedRelation: "btl_inspecciones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btl_reportes_punto_venta_id_fkey"
            columns: ["punto_venta_id"]
            isOneToOne: false
            referencedRelation: "btl_puntos_venta"
            referencedColumns: ["id"]
          },
        ]
      }
      btl_temas_capacitacion: {
        Row: {
          activo: boolean | null
          categoria: string | null
          created_at: string | null
          descripcion: string | null
          id: string
          nombre: string
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre: string
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descripcion?: string | null
          id?: string
          nombre?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      btl_ticket_comentarios: {
        Row: {
          archivos_adjuntos: string[] | null
          comentario: string
          created_at: string | null
          es_interno: boolean | null
          id: string
          ticket_id: string
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          archivos_adjuntos?: string[] | null
          comentario: string
          created_at?: string | null
          es_interno?: boolean | null
          id?: string
          ticket_id: string
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          archivos_adjuntos?: string[] | null
          comentario?: string
          created_at?: string | null
          es_interno?: boolean | null
          id?: string
          ticket_id?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "btl_ticket_comentarios_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "btl_reportes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "btl_ticket_comentarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "btl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      btl_usuarios: {
        Row: {
          activo: boolean | null
          aprobado_por: string | null
          auth_user_id: string | null
          created_at: string | null
          email: string
          empresa: string | null
          estado_aprobacion: string | null
          fecha_aprobacion: string | null
          id: string
          nombre: string
          nota_rechazo: string | null
          rol: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          aprobado_por?: string | null
          auth_user_id?: string | null
          created_at?: string | null
          email: string
          empresa?: string | null
          estado_aprobacion?: string | null
          fecha_aprobacion?: string | null
          id?: string
          nombre: string
          nota_rechazo?: string | null
          rol: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          aprobado_por?: string | null
          auth_user_id?: string | null
          created_at?: string | null
          email?: string
          empresa?: string | null
          estado_aprobacion?: string | null
          fecha_aprobacion?: string | null
          id?: string
          nombre?: string
          nota_rechazo?: string | null
          rol?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "btl_usuarios_aprobado_por_fkey"
            columns: ["aprobado_por"]
            isOneToOne: false
            referencedRelation: "btl_usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
