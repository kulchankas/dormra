/**
 * Hand-written Supabase Database types for Dormra.
 *
 * Regenerate when the live schema changes:
 *   npx supabase gen types typescript --project-id <ref> > lib/database.types.ts
 *
 * Last verified against production schema: 2026-07-02
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      alert_log: {
        Row: {
          id: string
          user_id: string
          alert_id: string | null
          dorm_id: string
          sent_at: string
          channel: string
          snapshot_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          alert_id?: string | null
          dorm_id: string
          sent_at?: string
          channel: string
          snapshot_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          alert_id?: string | null
          dorm_id?: string
          sent_at?: string
          channel?: string
          snapshot_id?: string | null
        }
        Relationships: []
      }
      cron_runs: {
        Row: {
          id: string
          started_at: string
          duration_ms: number
          ok: boolean
          error_message: string | null
          providers: string[]
          batch: number | null
          batches: number | null
          scraped: number
          errors: number
          skipped: number
          pruned: number
          by_provider: Json | null
        }
        Insert: {
          id?: string
          started_at?: string
          duration_ms: number
          ok?: boolean
          error_message?: string | null
          providers: string[]
          batch?: number | null
          batches?: number | null
          scraped?: number
          errors?: number
          skipped?: number
          pruned?: number
          by_provider?: Json | null
        }
        Update: {
          id?: string
          started_at?: string
          duration_ms?: number
          ok?: boolean
          error_message?: string | null
          providers?: string[]
          batch?: number | null
          batches?: number | null
          scraped?: number
          errors?: number
          skipped?: number
          pruned?: number
          by_provider?: Json | null
        }
        Relationships: []
      }
      availability_snapshots: {
        Row: {
          id: string
          dorm_id: string
          available: boolean
          rooms_count: number | null
          raw_text: string
          scrape_ok: boolean
          error_msg: string | null
          scraped_at: string
        }
        Insert: {
          id?: string
          dorm_id: string
          available: boolean
          rooms_count?: number | null
          raw_text?: string
          scrape_ok?: boolean
          error_msg?: string | null
          scraped_at?: string
        }
        Update: {
          id?: string
          dorm_id?: string
          available?: boolean
          rooms_count?: number | null
          raw_text?: string
          scrape_ok?: boolean
          error_msg?: string | null
          scraped_at?: string
        }
        Relationships: []
      }
      dorms: {
        Row: {
          id: string
          slug: string
          provider: string
          name: string
          address: string | null
          district: number | null
          price_min: number | null
          price_max: number | null
          deposit_eur: number | null
          deposit_months: number | null
          website_url: string | null
          apply_url: string | null
          scrape_url: string | null
          scrape_type: string | null
          pets: boolean | null
          couples: boolean | null
          furnished: boolean | null
          min_stay_months: number | null
          max_stay_months: number | null
          notes: string | null
          active: boolean
          created_at: string
          image_url: string | null
          lat: number | null
          lng: number | null
        }
        Insert: {
          id?: string
          slug: string
          provider: string
          name: string
          address?: string | null
          district?: number | null
          price_min?: number | null
          price_max?: number | null
          deposit_eur?: number | null
          deposit_months?: number | null
          website_url?: string | null
          apply_url?: string | null
          scrape_url?: string | null
          scrape_type?: string | null
          pets?: boolean | null
          couples?: boolean | null
          furnished?: boolean | null
          min_stay_months?: number | null
          max_stay_months?: number | null
          notes?: string | null
          active?: boolean
          created_at?: string
          image_url?: string | null
          lat?: number | null
          lng?: number | null
        }
        Update: {
          id?: string
          slug?: string
          provider?: string
          name?: string
          address?: string | null
          district?: number | null
          price_min?: number | null
          price_max?: number | null
          deposit_eur?: number | null
          deposit_months?: number | null
          website_url?: string | null
          apply_url?: string | null
          scrape_url?: string | null
          scrape_type?: string | null
          pets?: boolean | null
          couples?: boolean | null
          furnished?: boolean | null
          min_stay_months?: number | null
          max_stay_months?: number | null
          notes?: string | null
          active?: boolean
          created_at?: string
          image_url?: string | null
          lat?: number | null
          lng?: number | null
        }
        Relationships: []
      }
      tracker: {
        Row: {
          id: string
          user_id: string
          dorm_id: string
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          dorm_id: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          dorm_id?: string
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_alerts: {
        Row: {
          id: string
          user_id: string
          price_max: number | null
          districts: number[] | null
          move_in_before: string | null
          pets_required: boolean
          couples: boolean
          deposit_max: number | null
          notify_email: boolean
          notify_telegram: boolean
          telegram_chat_id: string | null
          active: boolean
          locale: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          price_max?: number | null
          districts?: number[] | null
          move_in_before?: string | null
          pets_required?: boolean
          couples?: boolean
          deposit_max?: number | null
          notify_email?: boolean
          notify_telegram?: boolean
          telegram_chat_id?: string | null
          active?: boolean
          locale?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          price_max?: number | null
          districts?: number[] | null
          move_in_before?: string | null
          pets_required?: boolean
          couples?: boolean
          deposit_max?: number | null
          notify_email?: boolean
          notify_telegram?: boolean
          telegram_chat_id?: string | null
          active?: boolean
          locale?: string
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_latest_snapshots: {
        Args: { p_dorm_ids: string[] }
        Returns: {
          dorm_id: string
          available: boolean
          scrape_ok: boolean
          scraped_at: string
        }[]
      }
      prune_old_snapshots: {
        Args: { p_keep_days?: number }
        Returns: number
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
