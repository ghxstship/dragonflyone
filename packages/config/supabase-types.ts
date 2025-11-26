export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/**
 * Database types for Supabase.
 * 
 * NOTE: This file should be regenerated from the database schema using:
 * pnpm supabase:types
 * 
 * For tables not yet in the types, use the fromUntyped() helper from auth-helpers.
 */
export type Database = {
  graphql_public: {
    Tables: Record<string, never>
    Views: Record<string, never>
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
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
  public: {
    Tables: {
      // Core tables
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string | null
          updated_at: string | null
          settings: Json | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string | null
          updated_at?: string | null
          settings?: Json | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string | null
          updated_at?: string | null
          settings?: Json | null
        }
        Relationships: []
      }
      platform_users: {
        Row: {
          id: string
          auth_user_id: string
          organization_id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          auth_user_id: string
          organization_id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          auth_user_id?: string
          organization_id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          platform_user_id: string
          role_code: string
          created_at: string | null
        }
        Insert: {
          id?: string
          platform_user_id: string
          role_code: string
          created_at?: string | null
        }
        Update: {
          id?: string
          platform_user_id?: string
          role_code?: string
          created_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          status: string
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          organization_id: string
          name: string
          email: string | null
          phone: string | null
          company: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          organization_id: string
          title: string
          description: string | null
          event_date: string | null
          start_date: string | null
          end_date: string | null
          venue: string | null
          venue_id: string | null
          status: string
          created_at: string | null
          updated_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          description?: string | null
          event_date?: string | null
          start_date?: string | null
          end_date?: string | null
          venue?: string | null
          venue_id?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          description?: string | null
          event_date?: string | null
          start_date?: string | null
          end_date?: string | null
          venue?: string | null
          venue_id?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
          metadata?: Json | null
        }
        Relationships: []
      }
      tickets: {
        Row: {
          id: string
          event_id: string
          ticket_type_id: string | null
          price: number
          seat_number: string | null
          status: string
          qr_code: string
          buyer_id: string | null
          purchase_date: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          ticket_type_id?: string | null
          price: number
          seat_number?: string | null
          status?: string
          qr_code: string
          buyer_id?: string | null
          purchase_date?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          ticket_type_id?: string | null
          price?: number
          seat_number?: string | null
          status?: string
          qr_code?: string
          buyer_id?: string | null
          purchase_date?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      ticket_types: {
        Row: {
          id: string
          event_id: string
          name: string
          price: number
          quantity: number
          created_at: string | null
        }
        Insert: {
          id?: string
          event_id: string
          name: string
          price: number
          quantity: number
          created_at?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          name?: string
          price?: number
          quantity?: number
          created_at?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string
          event_id: string | null
          total: number
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          event_id?: string | null
          total: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string | null
          total?: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      deals: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      assets: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      finance_expenses: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      audit_log: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      integration_project_links: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      integration_event_links: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      integration_asset_links: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      integration_sync_jobs: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      ledger_accounts: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      ledger_entries: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      production_advances: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      production_advance_items: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      production_advancing_catalog: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      purchase_orders: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      kpi_data: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      kpi_definitions: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      kpi_reports: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      workforce_employees: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      workforce_time_entries: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      asset_maintenance_events: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      alert_history: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      alert_thresholds: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      api_rate_limits: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      analytics_metrics: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      batch_operations_log: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      budgets: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      contracts: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      documents: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      employees: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      financial_accounts: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      folders: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      generated_reports: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      okrs: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      purchase_order_items: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      rfps: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      risks: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      tasks: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      transactions: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      vendors: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      workflow_actions: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      workflow_executions: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      workflows: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      quotes: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      quote_line_items: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      clients: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      venues: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      crew_members: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      crew_assignments: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      schedules: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      invoices: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      payments: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      notifications: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      comments: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      activity_log: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      certification_types: {
        Row: {
          id: string
          name: string
          code: string | null
          category: 'safety' | 'technical' | 'professional' | 'equipment' | 'regulatory' | 'trade_specific'
          description: string | null
          issuing_organization: string
          prerequisites: string[] | null
          required_for_roles: string[] | null
          requires_renewal: boolean | null
          renewal_period_months: number | null
          renewal_requirements: string | null
          training_duration_hours: number | null
          training_providers: string[] | null
          typical_cost: number | null
          renewal_cost: number | null
          currency: string | null
          verification_url: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          code?: string | null
          category: 'safety' | 'technical' | 'professional' | 'equipment' | 'regulatory' | 'trade_specific'
          description?: string | null
          issuing_organization: string
          prerequisites?: string[] | null
          required_for_roles?: string[] | null
          requires_renewal?: boolean | null
          renewal_period_months?: number | null
          renewal_requirements?: string | null
          training_duration_hours?: number | null
          training_providers?: string[] | null
          typical_cost?: number | null
          renewal_cost?: number | null
          currency?: string | null
          verification_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          code?: string | null
          category?: 'safety' | 'technical' | 'professional' | 'equipment' | 'regulatory' | 'trade_specific'
          description?: string | null
          issuing_organization?: string
          prerequisites?: string[] | null
          required_for_roles?: string[] | null
          requires_renewal?: boolean | null
          renewal_period_months?: number | null
          renewal_requirements?: string | null
          training_duration_hours?: number | null
          training_providers?: string[] | null
          typical_cost?: number | null
          renewal_cost?: number | null
          currency?: string | null
          verification_url?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      crew_certifications: {
        Row: {
          id: string
          crew_member_id: string
          certification_type_id: string
          certificate_number: string | null
          status: 'active' | 'expired' | 'suspended' | 'pending_verification' | 'revoked'
          issued_date: string
          expiration_date: string | null
          verified_date: string | null
          last_verification_date: string | null
          issued_by: string | null
          issuing_organization: string | null
          certificate_url: string | null
          documentation_url: string | null
          verified: boolean | null
          verified_by: string | null
          verification_method: string | null
          reminder_days_before: number | null
          reminder_sent: boolean | null
          renewal_in_progress: boolean | null
          renewal_started_date: string | null
          created_at: string | null
          updated_at: string | null
          created_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          crew_member_id: string
          certification_type_id: string
          certificate_number?: string | null
          status?: 'active' | 'expired' | 'suspended' | 'pending_verification' | 'revoked'
          issued_date: string
          expiration_date?: string | null
          verified_date?: string | null
          last_verification_date?: string | null
          issued_by?: string | null
          issuing_organization?: string | null
          certificate_url?: string | null
          documentation_url?: string | null
          verified?: boolean | null
          verified_by?: string | null
          verification_method?: string | null
          reminder_days_before?: number | null
          reminder_sent?: boolean | null
          renewal_in_progress?: boolean | null
          renewal_started_date?: string | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          crew_member_id?: string
          certification_type_id?: string
          certificate_number?: string | null
          status?: 'active' | 'expired' | 'suspended' | 'pending_verification' | 'revoked'
          issued_date?: string
          expiration_date?: string | null
          verified_date?: string | null
          last_verification_date?: string | null
          issued_by?: string | null
          issuing_organization?: string | null
          certificate_url?: string | null
          documentation_url?: string | null
          verified?: boolean | null
          verified_by?: string | null
          verification_method?: string | null
          reminder_days_before?: number | null
          reminder_sent?: boolean | null
          renewal_in_progress?: boolean | null
          renewal_started_date?: string | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      training_records: {
        Row: {
          id: string
          crew_member_id: string
          training_type: 'initial' | 'refresher' | 'advanced' | 'specialized' | 'continuing_education'
          certification_type_id: string | null
          title: string
          provider: string | null
          instructor: string | null
          training_date: string
          duration_hours: number | null
          location: string | null
          completed: boolean | null
          completion_date: string | null
          score: number | null
          passed: boolean | null
          cost: number | null
          paid_by: 'company' | 'crew_member' | 'grant' | 'other' | null
          certificate_url: string | null
          materials_url: string | null
          created_at: string | null
          created_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          crew_member_id: string
          training_type: 'initial' | 'refresher' | 'advanced' | 'specialized' | 'continuing_education'
          certification_type_id?: string | null
          title: string
          provider?: string | null
          instructor?: string | null
          training_date: string
          duration_hours?: number | null
          location?: string | null
          completed?: boolean | null
          completion_date?: string | null
          score?: number | null
          passed?: boolean | null
          cost?: number | null
          paid_by?: 'company' | 'crew_member' | 'grant' | 'other' | null
          certificate_url?: string | null
          materials_url?: string | null
          created_at?: string | null
          created_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          crew_member_id?: string
          training_type?: 'initial' | 'refresher' | 'advanced' | 'specialized' | 'continuing_education'
          certification_type_id?: string | null
          title?: string
          provider?: string | null
          instructor?: string | null
          training_date?: string
          duration_hours?: number | null
          location?: string | null
          completed?: boolean | null
          completion_date?: string | null
          score?: number | null
          passed?: boolean | null
          cost?: number | null
          paid_by?: 'company' | 'crew_member' | 'grant' | 'other' | null
          certificate_url?: string | null
          materials_url?: string | null
          created_at?: string | null
          created_by?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      communications: {
        Row: {
          id: string
          organization_id: string
          type: 'radio' | 'phone' | 'email' | 'sms'
          from_user_id: string | null
          from_identifier: string
          to_user_id: string | null
          to_identifier: string
          subject: string | null
          message: string
          priority: 'normal' | 'urgent' | 'emergency'
          status: 'sent' | 'delivered' | 'read' | 'failed'
          event_id: string | null
          project_id: string | null
          timestamp: string
          delivered_at: string | null
          read_at: string | null
          metadata: Json | null
          created_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          type: 'radio' | 'phone' | 'email' | 'sms'
          from_user_id?: string | null
          from_identifier: string
          to_user_id?: string | null
          to_identifier: string
          subject?: string | null
          message: string
          priority?: 'normal' | 'urgent' | 'emergency'
          status?: 'sent' | 'delivered' | 'read' | 'failed'
          event_id?: string | null
          project_id?: string | null
          timestamp?: string
          delivered_at?: string | null
          read_at?: string | null
          metadata?: Json | null
          created_at?: string | null
          created_by?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          type?: 'radio' | 'phone' | 'email' | 'sms'
          from_user_id?: string | null
          from_identifier?: string
          to_user_id?: string | null
          to_identifier?: string
          subject?: string | null
          message?: string
          priority?: 'normal' | 'urgent' | 'emergency'
          status?: 'sent' | 'delivered' | 'read' | 'failed'
          event_id?: string | null
          project_id?: string | null
          timestamp?: string
          delivered_at?: string | null
          read_at?: string | null
          metadata?: Json | null
          created_at?: string | null
          created_by?: string | null
        }
        Relationships: []
      }
      safety_incidents: {
        Row: {
          id: string
          organization_id: string
          incident_number: string
          incident_type: 'near_miss' | 'equipment_malfunction' | 'injury' | 'property_damage' | 'environmental' | 'security' | 'fire' | 'slip_fall' | 'electrical' | 'chemical' | 'other'
          title: string
          description: string
          location: string
          event_id: string | null
          project_id: string | null
          venue_id: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          injuries_count: number | null
          fatalities_count: number | null
          witnesses: string[] | null
          photos: string[] | null
          immediate_actions: string | null
          root_cause: string | null
          corrective_actions: string | null
          preventive_measures: string | null
          status: 'reported' | 'investigating' | 'resolved' | 'closed' | 'reopened'
          incident_date: string
          reported_by: string | null
          assigned_to: string | null
          investigation_started_at: string | null
          resolved_at: string | null
          resolved_by: string | null
          resolution_notes: string | null
          closed_at: string | null
          closed_by: string | null
          osha_recordable: boolean | null
          workers_comp_claim: boolean | null
          insurance_claim_number: string | null
          estimated_cost: number | null
          actual_cost: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          incident_number: string
          incident_type: 'near_miss' | 'equipment_malfunction' | 'injury' | 'property_damage' | 'environmental' | 'security' | 'fire' | 'slip_fall' | 'electrical' | 'chemical' | 'other'
          title: string
          description: string
          location: string
          event_id?: string | null
          project_id?: string | null
          venue_id?: string | null
          severity: 'low' | 'medium' | 'high' | 'critical'
          injuries_count?: number | null
          fatalities_count?: number | null
          witnesses?: string[] | null
          photos?: string[] | null
          immediate_actions?: string | null
          root_cause?: string | null
          corrective_actions?: string | null
          preventive_measures?: string | null
          status?: 'reported' | 'investigating' | 'resolved' | 'closed' | 'reopened'
          incident_date: string
          reported_by?: string | null
          assigned_to?: string | null
          investigation_started_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          closed_at?: string | null
          closed_by?: string | null
          osha_recordable?: boolean | null
          workers_comp_claim?: boolean | null
          insurance_claim_number?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          incident_number?: string
          incident_type?: 'near_miss' | 'equipment_malfunction' | 'injury' | 'property_damage' | 'environmental' | 'security' | 'fire' | 'slip_fall' | 'electrical' | 'chemical' | 'other'
          title?: string
          description?: string
          location?: string
          event_id?: string | null
          project_id?: string | null
          venue_id?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical'
          injuries_count?: number | null
          fatalities_count?: number | null
          witnesses?: string[] | null
          photos?: string[] | null
          immediate_actions?: string | null
          root_cause?: string | null
          corrective_actions?: string | null
          preventive_measures?: string | null
          status?: 'reported' | 'investigating' | 'resolved' | 'closed' | 'reopened'
          incident_date?: string
          reported_by?: string | null
          assigned_to?: string | null
          investigation_started_at?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          closed_at?: string | null
          closed_by?: string | null
          osha_recordable?: boolean | null
          workers_comp_claim?: boolean | null
          insurance_claim_number?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      safety_investigations: {
        Row: {
          id: string
          incident_id: string
          investigator_id: string
          investigation_type: 'standard' | 'root_cause' | 'comprehensive' | 'external'
          status: 'in_progress' | 'pending_review' | 'completed' | 'closed'
          started_at: string
          completed_at: string | null
          findings: string | null
          root_cause_analysis: string | null
          contributing_factors: string[] | null
          recommendations: string | null
          evidence_collected: Json | null
          interviews_conducted: Json | null
          timeline_of_events: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          incident_id: string
          investigator_id: string
          investigation_type?: 'standard' | 'root_cause' | 'comprehensive' | 'external'
          status?: 'in_progress' | 'pending_review' | 'completed' | 'closed'
          started_at: string
          completed_at?: string | null
          findings?: string | null
          root_cause_analysis?: string | null
          contributing_factors?: string[] | null
          recommendations?: string | null
          evidence_collected?: Json | null
          interviews_conducted?: Json | null
          timeline_of_events?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          incident_id?: string
          investigator_id?: string
          investigation_type?: 'standard' | 'root_cause' | 'comprehensive' | 'external'
          status?: 'in_progress' | 'pending_review' | 'completed' | 'closed'
          started_at?: string
          completed_at?: string | null
          findings?: string | null
          root_cause_analysis?: string | null
          contributing_factors?: string[] | null
          recommendations?: string | null
          evidence_collected?: Json | null
          interviews_conducted?: Json | null
          timeline_of_events?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      safety_corrective_actions: {
        Row: {
          id: string
          incident_id: string
          investigation_id: string | null
          action_type: 'immediate' | 'short_term' | 'long_term' | 'preventive' | 'training' | 'policy_change' | 'equipment_modification'
          description: string
          assigned_to: string | null
          due_date: string | null
          priority: 'low' | 'medium' | 'high' | 'critical'
          status: 'pending' | 'in_progress' | 'completed' | 'verified' | 'cancelled'
          completed_at: string | null
          completed_by: string | null
          verification_required: boolean | null
          verified_at: string | null
          verified_by: string | null
          verification_notes: string | null
          estimated_cost: number | null
          actual_cost: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          incident_id: string
          investigation_id?: string | null
          action_type: 'immediate' | 'short_term' | 'long_term' | 'preventive' | 'training' | 'policy_change' | 'equipment_modification'
          description: string
          assigned_to?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'in_progress' | 'completed' | 'verified' | 'cancelled'
          completed_at?: string | null
          completed_by?: string | null
          verification_required?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          verification_notes?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          incident_id?: string
          investigation_id?: string | null
          action_type?: 'immediate' | 'short_term' | 'long_term' | 'preventive' | 'training' | 'policy_change' | 'equipment_modification'
          description?: string
          assigned_to?: string | null
          due_date?: string | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'pending' | 'in_progress' | 'completed' | 'verified' | 'cancelled'
          completed_at?: string | null
          completed_by?: string | null
          verification_required?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          verification_notes?: string | null
          estimated_cost?: number | null
          actual_cost?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      safety_inspections: {
        Row: {
          id: string
          organization_id: string
          inspection_type: 'routine' | 'pre_event' | 'post_event' | 'equipment' | 'fire' | 'electrical' | 'structural' | 'compliance' | 'special'
          event_id: string | null
          venue_id: string | null
          project_id: string | null
          inspector_id: string
          inspection_date: string
          scheduled_date: string | null
          checklist_template_id: string | null
          checklist_items: Json | null
          findings: string | null
          deficiencies_found: number | null
          critical_issues: number | null
          overall_rating: 'pass' | 'pass_with_conditions' | 'fail' | 'needs_reinspection' | null
          follow_up_required: boolean | null
          follow_up_date: string | null
          photos: string[] | null
          documents: string[] | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          inspection_type: 'routine' | 'pre_event' | 'post_event' | 'equipment' | 'fire' | 'electrical' | 'structural' | 'compliance' | 'special'
          event_id?: string | null
          venue_id?: string | null
          project_id?: string | null
          inspector_id: string
          inspection_date: string
          scheduled_date?: string | null
          checklist_template_id?: string | null
          checklist_items?: Json | null
          findings?: string | null
          deficiencies_found?: number | null
          critical_issues?: number | null
          overall_rating?: 'pass' | 'pass_with_conditions' | 'fail' | 'needs_reinspection' | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          photos?: string[] | null
          documents?: string[] | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          inspection_type?: 'routine' | 'pre_event' | 'post_event' | 'equipment' | 'fire' | 'electrical' | 'structural' | 'compliance' | 'special'
          event_id?: string | null
          venue_id?: string | null
          project_id?: string | null
          inspector_id?: string
          inspection_date?: string
          scheduled_date?: string | null
          checklist_template_id?: string | null
          checklist_items?: Json | null
          findings?: string | null
          deficiencies_found?: number | null
          critical_issues?: number | null
          overall_rating?: 'pass' | 'pass_with_conditions' | 'fail' | 'needs_reinspection' | null
          follow_up_required?: boolean | null
          follow_up_date?: string | null
          photos?: string[] | null
          documents?: string[] | null
          status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          completed_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      safety_training_records: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          training_type: 'orientation' | 'hazard_communication' | 'fire_safety' | 'first_aid' | 'cpr' | 'equipment_specific' | 'rigging' | 'electrical' | 'fall_protection' | 'confined_space' | 'lockout_tagout' | 'other'
          training_name: string
          provider: string | null
          completion_date: string
          expiration_date: string | null
          certificate_number: string | null
          certificate_url: string | null
          score: number | null
          passed: boolean | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          training_type: 'orientation' | 'hazard_communication' | 'fire_safety' | 'first_aid' | 'cpr' | 'equipment_specific' | 'rigging' | 'electrical' | 'fall_protection' | 'confined_space' | 'lockout_tagout' | 'other'
          training_name: string
          provider?: string | null
          completion_date: string
          expiration_date?: string | null
          certificate_number?: string | null
          certificate_url?: string | null
          score?: number | null
          passed?: boolean | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          training_type?: 'orientation' | 'hazard_communication' | 'fire_safety' | 'first_aid' | 'cpr' | 'equipment_specific' | 'rigging' | 'electrical' | 'fall_protection' | 'confined_space' | 'lockout_tagout' | 'other'
          training_name?: string
          provider?: string | null
          completion_date?: string
          expiration_date?: string | null
          certificate_number?: string | null
          certificate_url?: string | null
          score?: number | null
          passed?: boolean | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      safety_equipment: {
        Row: {
          id: string
          organization_id: string
          equipment_type: 'fire_extinguisher' | 'first_aid_kit' | 'aed' | 'eye_wash' | 'safety_shower' | 'spill_kit' | 'ppe' | 'fall_protection' | 'barricade' | 'signage' | 'other'
          name: string
          serial_number: string | null
          location: string
          venue_id: string | null
          last_inspection_date: string | null
          next_inspection_date: string | null
          expiration_date: string | null
          status: 'active' | 'needs_inspection' | 'needs_service' | 'out_of_service' | 'expired' | 'retired'
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          equipment_type: 'fire_extinguisher' | 'first_aid_kit' | 'aed' | 'eye_wash' | 'safety_shower' | 'spill_kit' | 'ppe' | 'fall_protection' | 'barricade' | 'signage' | 'other'
          name: string
          serial_number?: string | null
          location: string
          venue_id?: string | null
          last_inspection_date?: string | null
          next_inspection_date?: string | null
          expiration_date?: string | null
          status?: 'active' | 'needs_inspection' | 'needs_service' | 'out_of_service' | 'expired' | 'retired'
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          equipment_type?: 'fire_extinguisher' | 'first_aid_kit' | 'aed' | 'eye_wash' | 'safety_shower' | 'spill_kit' | 'ppe' | 'fall_protection' | 'barricade' | 'signage' | 'other'
          name?: string
          serial_number?: string | null
          location?: string
          venue_id?: string | null
          last_inspection_date?: string | null
          next_inspection_date?: string | null
          expiration_date?: string | null
          status?: 'active' | 'needs_inspection' | 'needs_service' | 'out_of_service' | 'expired' | 'retired'
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      // Dynamic tables - use Record<string, unknown> for flexibility
      equipment: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      run_of_shows: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      run_of_show_cues: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      notification_channels: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      collaboration_comments: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      resources: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      resource_allocations: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      incidents: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      crew_skills: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      maintenance_records: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      schedule_phases: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      shipments: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
      time_entries: {
        Row: Record<string, unknown>
        Insert: Record<string, unknown>
        Update: Record<string, unknown>
        Relationships: []
      }
    }
    Views: {
      user_event_roles: {
        Row: Record<string, unknown>
        Relationships: []
      }
      mv_asset_utilization: {
        Row: Record<string, unknown>
        Relationships: []
      }
      mv_executive_dashboard: {
        Row: Record<string, unknown>
        Relationships: []
      }
      analytics_project_budget_vs_actual: {
        Row: Record<string, unknown>
        Relationships: []
      }
      mv_project_financials: {
        Row: Record<string, unknown>
        Relationships: []
      }
      analytics_asset_utilization: {
        Row: Record<string, unknown>
        Relationships: []
      }
      analytics_nps_summary: {
        Row: Record<string, unknown>
        Relationships: []
      }
    }
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>
        Returns: unknown
      }
    }
    Enums: {
      [key: string]: string
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never
