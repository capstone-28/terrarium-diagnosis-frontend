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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          cool_air_temp_c: number | null
          created_at: string
          fault_reason: string | null
          heat_source_on: boolean | null
          hot_air_temp_c: number | null
          id: number
          l_final: number | null
          l_grad: number | null
          l_match: number | null
          l_safety: number | null
          light_level: number | null
          node_id: string
          state: Database["public"]["Enums"]["node_state"]
          surface_temp_c: number | null
          timestamp: string
        }
        Insert: {
          cool_air_temp_c?: number | null
          created_at?: string
          fault_reason?: string | null
          heat_source_on?: boolean | null
          hot_air_temp_c?: number | null
          id?: number
          l_final?: number | null
          l_grad?: number | null
          l_match?: number | null
          l_safety?: number | null
          light_level?: number | null
          node_id: string
          state?: Database["public"]["Enums"]["node_state"]
          surface_temp_c?: number | null
          timestamp: string
        }
        Update: {
          cool_air_temp_c?: number | null
          created_at?: string
          fault_reason?: string | null
          heat_source_on?: boolean | null
          hot_air_temp_c?: number | null
          id?: number
          l_final?: number | null
          l_grad?: number | null
          l_match?: number | null
          l_safety?: number | null
          light_level?: number | null
          node_id?: string
          state?: Database["public"]["Enums"]["node_state"]
          surface_temp_c?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["node_id"]
          },
        ]
      }
      events: {
        Row: {
          cool_air_temp_c: number | null
          created_at: string
          fault_reason: string | null
          heat_source_on: boolean | null
          hot_air_temp_c: number | null
          id: number
          l_final: number | null
          l_grad: number | null
          l_match: number | null
          l_safety: number | null
          light_level: number | null
          node_id: string
          state: Database["public"]["Enums"]["node_state"]
          surface_temp_c: number | null
          timestamp: string
        }
        Insert: {
          cool_air_temp_c?: number | null
          created_at?: string
          fault_reason?: string | null
          heat_source_on?: boolean | null
          hot_air_temp_c?: number | null
          id?: number
          l_final?: number | null
          l_grad?: number | null
          l_match?: number | null
          l_safety?: number | null
          light_level?: number | null
          node_id: string
          state?: Database["public"]["Enums"]["node_state"]
          surface_temp_c?: number | null
          timestamp: string
        }
        Update: {
          cool_air_temp_c?: number | null
          created_at?: string
          fault_reason?: string | null
          heat_source_on?: boolean | null
          hot_air_temp_c?: number | null
          id?: number
          l_final?: number | null
          l_grad?: number | null
          l_match?: number | null
          l_safety?: number | null
          light_level?: number | null
          node_id?: string
          state?: Database["public"]["Enums"]["node_state"]
          surface_temp_c?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["node_id"]
          },
        ]
      }
      faults: {
        Row: {
          cool_air_temp_c: number | null
          created_at: string
          fault_reason: string | null
          heat_source_on: boolean | null
          hot_air_temp_c: number | null
          id: number
          l_final: number | null
          l_grad: number | null
          l_match: number | null
          l_safety: number | null
          light_level: number | null
          node_id: string
          state: Database["public"]["Enums"]["node_state"]
          surface_temp_c: number | null
          timestamp: string
        }
        Insert: {
          cool_air_temp_c?: number | null
          created_at?: string
          fault_reason?: string | null
          heat_source_on?: boolean | null
          hot_air_temp_c?: number | null
          id?: number
          l_final?: number | null
          l_grad?: number | null
          l_match?: number | null
          l_safety?: number | null
          light_level?: number | null
          node_id: string
          state?: Database["public"]["Enums"]["node_state"]
          surface_temp_c?: number | null
          timestamp: string
        }
        Update: {
          cool_air_temp_c?: number | null
          created_at?: string
          fault_reason?: string | null
          heat_source_on?: boolean | null
          hot_air_temp_c?: number | null
          id?: number
          l_final?: number | null
          l_grad?: number | null
          l_match?: number | null
          l_safety?: number | null
          light_level?: number | null
          node_id?: string
          state?: Database["public"]["Enums"]["node_state"]
          surface_temp_c?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "faults_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["node_id"]
          },
        ]
      }
      heartbeats: {
        Row: {
          id: number
          node_id: string
          received_at: string
          timestamp: string
        }
        Insert: {
          id?: number
          node_id: string
          received_at?: string
          timestamp: string
        }
        Update: {
          id?: number
          node_id?: string
          received_at?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "heartbeats_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["node_id"]
          },
        ]
      }
      mode_transitions: {
        Row: {
          created_at: string
          from_state: Database["public"]["Enums"]["node_state"]
          id: number
          node_id: string
          reason: string | null
          timestamp: string
          to_state: Database["public"]["Enums"]["node_state"]
        }
        Insert: {
          created_at?: string
          from_state: Database["public"]["Enums"]["node_state"]
          id?: number
          node_id: string
          reason?: string | null
          timestamp: string
          to_state: Database["public"]["Enums"]["node_state"]
        }
        Update: {
          created_at?: string
          from_state?: Database["public"]["Enums"]["node_state"]
          id?: number
          node_id?: string
          reason?: string | null
          timestamp?: string
          to_state?: Database["public"]["Enums"]["node_state"]
        }
        Relationships: [
          {
            foreignKeyName: "mode_transitions_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["node_id"]
          },
        ]
      }
      nodes: {
        Row: {
          created_at: string
          last_seen_at: string | null
          location: string | null
          name: string
          node_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          last_seen_at?: string | null
          location?: string | null
          name: string
          node_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          last_seen_at?: string | null
          location?: string | null
          name?: string
          node_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      summaries: {
        Row: {
          cool_air_temp_c: number | null
          created_at: string
          fault_reason: string | null
          heat_source_on: boolean | null
          hot_air_temp_c: number | null
          id: number
          l_final: number | null
          l_grad: number | null
          l_match: number | null
          l_safety: number | null
          light_level: number | null
          node_id: string
          state: Database["public"]["Enums"]["node_state"]
          surface_temp_c: number | null
          timestamp: string
        }
        Insert: {
          cool_air_temp_c?: number | null
          created_at?: string
          fault_reason?: string | null
          heat_source_on?: boolean | null
          hot_air_temp_c?: number | null
          id?: number
          l_final?: number | null
          l_grad?: number | null
          l_match?: number | null
          l_safety?: number | null
          light_level?: number | null
          node_id: string
          state?: Database["public"]["Enums"]["node_state"]
          surface_temp_c?: number | null
          timestamp: string
        }
        Update: {
          cool_air_temp_c?: number | null
          created_at?: string
          fault_reason?: string | null
          heat_source_on?: boolean | null
          hot_air_temp_c?: number | null
          id?: number
          l_final?: number | null
          l_grad?: number | null
          l_match?: number | null
          l_safety?: number | null
          light_level?: number | null
          node_id?: string
          state?: Database["public"]["Enums"]["node_state"]
          surface_temp_c?: number | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "summaries_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "nodes"
            referencedColumns: ["node_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      node_state: "normal" | "warning" | "critical" | "device_fault"
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
    Enums: {
      node_state: ["normal", "warning", "critical", "device_fault"],
    },
  },
} as const
