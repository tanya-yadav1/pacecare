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
      pace_creations: {
        Row: {
          content: string
          created_at: string
          id: string
          kind: string
          resident_id: string
          shared_with_family: boolean
          shared_with_staff: boolean
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          kind: string
          resident_id: string
          shared_with_family?: boolean
          shared_with_staff?: boolean
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          kind?: string
          resident_id?: string
          shared_with_family?: boolean
          shared_with_staff?: boolean
          title?: string
        }
        Relationships: []
      }
      pace_events: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          kind: string
          label: string
          resident_id: string
          staff_note: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          kind: string
          label: string
          resident_id: string
          staff_note?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          kind?: string
          label?: string
          resident_id?: string
          staff_note?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          accessibility: Json
          created_at: string
          display_name: string
          email: string | null
          greeting_name: string
          id: string
          preferences: Json
          staff_notes: string | null
          updated_at: string
        }
        Insert: {
          accessibility?: Json
          created_at?: string
          display_name?: string
          email?: string | null
          greeting_name?: string
          id: string
          preferences?: Json
          staff_notes?: string | null
          updated_at?: string
        }
        Update: {
          accessibility?: Json
          created_at?: string
          display_name?: string
          email?: string | null
          greeting_name?: string
          id?: string
          preferences?: Json
          staff_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      resident_assignments: {
        Row: {
          created_at: string
          id: string
          resident_id: string
          staff_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          resident_id: string
          staff_id: string
        }
        Update: {
          created_at?: string
          id?: string
          resident_id?: string
          staff_id?: string
        }
        Relationships: []
      }
      senior_pins: {
        Row: {
          pin_hash: string
          set_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          pin_hash: string
          set_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          pin_hash?: string
          set_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vitamove_profiles: {
        Row: {
          active_skin: string
          exercise_preference: string
          id: string
          motor_challenges: string[]
          movement_claimed: boolean
          therapy_claimed: boolean
          updated_at: string
          user_id: string
          wellness_stars: number
        }
        Insert: {
          active_skin?: string
          exercise_preference?: string
          id?: string
          motor_challenges?: string[]
          movement_claimed?: boolean
          therapy_claimed?: boolean
          updated_at?: string
          user_id: string
          wellness_stars?: number
        }
        Update: {
          active_skin?: string
          exercise_preference?: string
          id?: string
          motor_challenges?: string[]
          movement_claimed?: boolean
          therapy_claimed?: boolean
          updated_at?: string
          user_id?: string
          wellness_stars?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "senior" | "staff"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["senior", "staff"],
    },
  },
} as const
