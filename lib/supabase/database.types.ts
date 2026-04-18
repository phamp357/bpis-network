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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          created_at: string
          id: string
          is_mock: boolean
          responses: Json
          status: Database["public"]["Enums"]["assessment_status"]
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_type: Database["public"]["Enums"]["agent_type"]
          created_at?: string
          id?: string
          is_mock?: boolean
          responses?: Json
          status?: Database["public"]["Enums"]["assessment_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_type?: Database["public"]["Enums"]["agent_type"]
          created_at?: string
          id?: string
          is_mock?: boolean
          responses?: Json
          status?: Database["public"]["Enums"]["assessment_status"]
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      capital_stack_items: {
        Row: {
          amount: number
          created_at: string
          deal_id: string
          id: string
          is_mock: boolean
          order_index: number
          source: string
          terms: Json
          tier: Database["public"]["Enums"]["capital_tier"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          deal_id: string
          id?: string
          is_mock?: boolean
          order_index?: number
          source: string
          terms?: Json
          tier: Database["public"]["Enums"]["capital_tier"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          deal_id?: string
          id?: string
          is_mock?: boolean
          order_index?: number
          source?: string
          terms?: Json
          tier?: Database["public"]["Enums"]["capital_tier"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "capital_stack_items_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      content_assets: {
        Row: {
          asset_type: Database["public"]["Enums"]["content_asset_type"]
          brand_voice_snapshot: Json
          created_at: string
          id: string
          is_mock: boolean
          output: string
          prompt: string
          published: boolean
          published_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asset_type: Database["public"]["Enums"]["content_asset_type"]
          brand_voice_snapshot?: Json
          created_at?: string
          id?: string
          is_mock?: boolean
          output: string
          prompt: string
          published?: boolean
          published_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asset_type?: Database["public"]["Enums"]["content_asset_type"]
          brand_voice_snapshot?: Json
          created_at?: string
          id?: string
          is_mock?: boolean
          output?: string
          prompt?: string
          published?: boolean
          published_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          created_at: string
          estimated_value: number | null
          id: string
          is_mock: boolean
          name: string
          notes: string | null
          oocemr_analysis: Json
          owner_user_id: string
          phase: Database["public"]["Enums"]["deal_phase"]
          status: Database["public"]["Enums"]["deal_status"]
          target_entity: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_value?: number | null
          id?: string
          is_mock?: boolean
          name: string
          notes?: string | null
          oocemr_analysis?: Json
          owner_user_id: string
          phase?: Database["public"]["Enums"]["deal_phase"]
          status?: Database["public"]["Enums"]["deal_status"]
          target_entity?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_value?: number | null
          id?: string
          is_mock?: boolean
          name?: string
          notes?: string | null
          oocemr_analysis?: Json
          owner_user_id?: string
          phase?: Database["public"]["Enums"]["deal_phase"]
          status?: Database["public"]["Enums"]["deal_status"]
          target_entity?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_owner_user_id_fkey"
            columns: ["owner_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          is_mock: boolean
          occurred_at: string
          payload: Json
          user_id: string | null
        }
        Insert: {
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          is_mock?: boolean
          occurred_at?: string
          payload?: Json
          user_id?: string | null
        }
        Update: {
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          is_mock?: boolean
          occurred_at?: string
          payload?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_articles: {
        Row: {
          body_md: string
          category: string | null
          created_at: string
          id: string
          is_mock: boolean
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body_md?: string
          category?: string | null
          created_at?: string
          id?: string
          is_mock?: boolean
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body_md?: string
          category?: string | null
          created_at?: string
          id?: string
          is_mock?: boolean
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          created_at: string
          entity_type: string | null
          funding_goal: number | null
          id: string
          is_mock: boolean
          legal_name: string
          stage: Database["public"]["Enums"]["org_stage"]
          state_of_formation: string | null
          team_size: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_type?: string | null
          funding_goal?: number | null
          id?: string
          is_mock?: boolean
          legal_name: string
          stage?: Database["public"]["Enums"]["org_stage"]
          state_of_formation?: string | null
          team_size?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entity_type?: string | null
          funding_goal?: number | null
          id?: string
          is_mock?: boolean
          legal_name?: string
          stage?: Database["public"]["Enums"]["org_stage"]
          state_of_formation?: string | null
          team_size?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          active: boolean
          code: Database["public"]["Enums"]["package_code"]
          created_at: string
          description: string | null
          features: Json
          id: string
          name: string
          price: number | null
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          code: Database["public"]["Enums"]["package_code"]
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          name: string
          price?: number | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          code?: Database["public"]["Enums"]["package_code"]
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          name?: string
          price?: number | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      partner_engagements: {
        Row: {
          created_at: string
          ended_at: string | null
          engagement_type: string | null
          id: string
          is_mock: boolean
          notes: string | null
          partner_id: string
          started_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          engagement_type?: string | null
          id?: string
          is_mock?: boolean
          notes?: string | null
          partner_id: string
          started_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          engagement_type?: string | null
          id?: string
          is_mock?: boolean
          notes?: string | null
          partner_id?: string
          started_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_engagements_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_engagements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          company: string | null
          compliance_docs: Json
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_mock: boolean
          license_number: string | null
          license_state: string | null
          phone: string | null
          type: Database["public"]["Enums"]["partner_type"]
          updated_at: string
          user_id: string | null
          vetting_notes: string | null
          vetting_status: Database["public"]["Enums"]["vetting_status"]
        }
        Insert: {
          company?: string | null
          compliance_docs?: Json
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_mock?: boolean
          license_number?: string | null
          license_state?: string | null
          phone?: string | null
          type: Database["public"]["Enums"]["partner_type"]
          updated_at?: string
          user_id?: string | null
          vetting_notes?: string | null
          vetting_status?: Database["public"]["Enums"]["vetting_status"]
        }
        Update: {
          company?: string | null
          compliance_docs?: Json
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_mock?: boolean
          license_number?: string | null
          license_state?: string | null
          phone?: string | null
          type?: Database["public"]["Enums"]["partner_type"]
          updated_at?: string
          user_id?: string | null
          vetting_notes?: string | null
          vetting_status?: Database["public"]["Enums"]["vetting_status"]
        }
        Relationships: [
          {
            foreignKeyName: "partners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount_cents: number | null
          created_at: string
          currency: string | null
          id: string
          is_mock: boolean
          metadata: Json
          package_id: string | null
          status: Database["public"]["Enums"]["purchase_status"]
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          is_mock?: boolean
          metadata?: Json
          package_id?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number | null
          created_at?: string
          currency?: string | null
          id?: string
          is_mock?: boolean
          metadata?: Json
          package_id?: string | null
          status?: Database["public"]["Enums"]["purchase_status"]
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          assessment_id: string
          created_at: string
          id: string
          is_mock: boolean
          raw_ai_output: Json | null
          readiness_tier: Database["public"]["Enums"]["readiness_tier"] | null
          recommended_package_id: string | null
          score: number | null
          strategy_notes: string | null
        }
        Insert: {
          assessment_id: string
          created_at?: string
          id?: string
          is_mock?: boolean
          raw_ai_output?: Json | null
          readiness_tier?: Database["public"]["Enums"]["readiness_tier"] | null
          recommended_package_id?: string | null
          score?: number | null
          strategy_notes?: string | null
        }
        Update: {
          assessment_id?: string
          created_at?: string
          id?: string
          is_mock?: boolean
          raw_ai_output?: Json | null
          readiness_tier?: Database["public"]["Enums"]["readiness_tier"] | null
          recommended_package_id?: string | null
          score?: number | null
          strategy_notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recommendations_recommended_package_id_fkey"
            columns: ["recommended_package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      ucc_filings: {
        Row: {
          collateral_description: string | null
          created_at: string
          deal_id: string
          debtor: string
          document_url: string | null
          filed_at: string | null
          filing_number: string | null
          filing_state: string
          id: string
          is_mock: boolean
          secured_party: string
          status: Database["public"]["Enums"]["ucc_filing_status"]
          updated_at: string
        }
        Insert: {
          collateral_description?: string | null
          created_at?: string
          deal_id: string
          debtor: string
          document_url?: string | null
          filed_at?: string | null
          filing_number?: string | null
          filing_state: string
          id?: string
          is_mock?: boolean
          secured_party: string
          status?: Database["public"]["Enums"]["ucc_filing_status"]
          updated_at?: string
        }
        Update: {
          collateral_description?: string | null
          created_at?: string
          deal_id?: string
          debtor?: string
          document_url?: string | null
          filed_at?: string | null
          filing_number?: string | null
          filing_state?: string
          id?: string
          is_mock?: boolean
          secured_party?: string
          status?: Database["public"]["Enums"]["ucc_filing_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ucc_filings_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          brand_voice: Json
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_mock: boolean
          kingdom_profile: Json
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          brand_voice?: Json
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_mock?: boolean
          kingdom_profile?: Json
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          brand_voice?: Json
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_mock?: boolean
          kingdom_profile?: Json
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_operator: { Args: never; Returns: boolean }
    }
    Enums: {
      agent_type: "covenant" | "oracle" | "iul" | "ucc" | "intelligence"
      assessment_status: "draft" | "submitted" | "analyzed"
      capital_tier:
        | "senior_debt"
        | "mezzanine"
        | "equity"
        | "ucc_secured"
        | "seller_financing"
      content_asset_type:
        | "social_post"
        | "objection_response"
        | "prospect_intel"
        | "email_draft"
        | "script"
      deal_phase: "phase_1" | "phase_2" | "phase_3" | "phase_4" | "phase_5"
      deal_status: "active" | "closed" | "dead" | "paused"
      org_stage: "idea" | "pre_revenue" | "early" | "growth" | "mature"
      package_code: "essential" | "builder" | "sovereign"
      partner_type: "iul_advisor" | "legal" | "cpa" | "broker" | "other"
      purchase_status: "pending" | "paid" | "refunded" | "failed" | "canceled"
      readiness_tier: "foundation" | "activation" | "mastery"
      ucc_filing_status: "draft" | "filed" | "amended" | "terminated"
      user_role: "operator" | "admin" | "founder" | "partner_iul"
      vetting_status: "pending" | "in_review" | "approved" | "rejected"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      agent_type: ["covenant", "oracle", "iul", "ucc", "intelligence"],
      assessment_status: ["draft", "submitted", "analyzed"],
      capital_tier: [
        "senior_debt",
        "mezzanine",
        "equity",
        "ucc_secured",
        "seller_financing",
      ],
      content_asset_type: [
        "social_post",
        "objection_response",
        "prospect_intel",
        "email_draft",
        "script",
      ],
      deal_phase: ["phase_1", "phase_2", "phase_3", "phase_4", "phase_5"],
      deal_status: ["active", "closed", "dead", "paused"],
      org_stage: ["idea", "pre_revenue", "early", "growth", "mature"],
      package_code: ["essential", "builder", "sovereign"],
      partner_type: ["iul_advisor", "legal", "cpa", "broker", "other"],
      purchase_status: ["pending", "paid", "refunded", "failed", "canceled"],
      readiness_tier: ["foundation", "activation", "mastery"],
      ucc_filing_status: ["draft", "filed", "amended", "terminated"],
      user_role: ["operator", "admin", "founder", "partner_iul"],
      vetting_status: ["pending", "in_review", "approved", "rejected"],
    },
  },
} as const
