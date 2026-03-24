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
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          onboarded: boolean
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          onboarded?: boolean
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          avatar_url?: string | null
          onboarded?: boolean
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          name: string
          destination: string | null
          description: string | null
          start_date: string | null
          end_date: string | null
          owner_id: string
          cover_image_url: string | null
          status: 'planning' | 'active' | 'completed'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          destination?: string | null
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          owner_id: string
          cover_image_url?: string | null
          status?: 'planning' | 'active' | 'completed'
        }
        Update: {
          name?: string
          destination?: string | null
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          cover_image_url?: string | null
          status?: 'planning' | 'active' | 'completed'
        }
      }
      trip_members: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          role: 'owner' | 'co-planner' | 'viewer'
          joined_at: string
        }
        Insert: {
          trip_id: string
          user_id: string
          role?: 'owner' | 'co-planner' | 'viewer'
        }
        Update: {
          role?: 'owner' | 'co-planner' | 'viewer'
        }
      }
      trip_invites: {
        Row: {
          id: string
          trip_id: string
          email: string
          invited_by: string
          token: string
          status: 'pending' | 'accepted' | 'expired'
          created_at: string
        }
        Insert: {
          trip_id: string
          email: string
          invited_by: string
          token?: string
          status?: 'pending' | 'accepted' | 'expired'
        }
        Update: {
          status?: 'pending' | 'accepted' | 'expired'
        }
      }
      itinerary_days: {
        Row: {
          id: string
          trip_id: string
          day_number: number
          date: string | null
          theme: string | null
          created_at: string
        }
        Insert: {
          trip_id: string
          day_number: number
          date?: string | null
          theme?: string | null
        }
        Update: {
          theme?: string | null
          date?: string | null
        }
      }
      itinerary_stops: {
        Row: {
          id: string
          day_id: string
          trip_id: string
          name: string
          time_label: string | null
          lat: number | null
          lng: number | null
          description: string | null
          tips: string | null
          entry_fee: string | null
          category: string | null
          dietary_note: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          day_id: string
          trip_id: string
          name: string
          time_label?: string | null
          lat?: number | null
          lng?: number | null
          description?: string | null
          tips?: string | null
          entry_fee?: string | null
          category?: string | null
          dietary_note?: string | null
          order_index?: number
        }
        Update: {
          name?: string
          time_label?: string | null
          lat?: number | null
          lng?: number | null
          description?: string | null
          tips?: string | null
          entry_fee?: string | null
          category?: string | null
          dietary_note?: string | null
          order_index?: number
        }
      }
      activities: {
        Row: {
          id: string
          trip_id: string
          stop_id: string | null
          user_id: string
          status: 'planned' | 'done' | 'skipped'
          rating: number | null
          note: string | null
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          trip_id: string
          stop_id?: string | null
          user_id: string
          status?: 'planned' | 'done' | 'skipped'
          rating?: number | null
          note?: string | null
          photo_url?: string | null
        }
        Update: {
          status?: 'planned' | 'done' | 'skipped'
          rating?: number | null
          note?: string | null
          photo_url?: string | null
        }
      }
      expenses: {
        Row: {
          id: string
          trip_id: string
          paid_by: string
          amount: number
          category: string | null
          description: string | null
          split_with: string[]
          created_at: string
        }
        Insert: {
          trip_id: string
          paid_by: string
          amount: number
          category?: string | null
          description?: string | null
          split_with?: string[]
        }
        Update: {
          amount?: number
          category?: string | null
          description?: string | null
          split_with?: string[]
        }
      }
      todos: {
        Row: {
          id: string
          trip_id: string
          title: string
          assigned_to: string | null
          status: 'todo' | 'in_progress' | 'done'
          order_index: number
          parent_id: string | null
          created_at: string
        }
        Insert: {
          trip_id: string
          title: string
          assigned_to?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          order_index?: number
          parent_id?: string | null
        }
        Update: {
          title?: string
          assigned_to?: string | null
          status?: 'todo' | 'in_progress' | 'done'
          order_index?: number
        }
      }
      tickets: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          type: string | null
          title: string
          file_url: string | null
          metadata: Json
          travel_date: string | null
          created_at: string
        }
        Insert: {
          trip_id: string
          user_id: string
          type?: string | null
          title: string
          file_url?: string | null
          metadata?: Json
          travel_date?: string | null
        }
        Update: {
          type?: string | null
          title?: string
          file_url?: string | null
          metadata?: Json
          travel_date?: string | null
        }
      }
      photos: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          url: string
          thumbnail_url: string | null
          lat: number | null
          lng: number | null
          day_number: number | null
          caption: string | null
          created_at: string
        }
        Insert: {
          trip_id: string
          user_id: string
          url: string
          thumbnail_url?: string | null
          lat?: number | null
          lng?: number | null
          day_number?: number | null
          caption?: string | null
        }
        Update: {
          caption?: string | null
          day_number?: number | null
        }
      }
      messages: {
        Row: {
          id: string
          trip_id: string
          user_id: string
          thread_id: string
          content: string | null
          type: 'text' | 'photo' | 'file' | 'system'
          file_url: string | null
          created_at: string
        }
        Insert: {
          trip_id: string
          user_id: string
          thread_id?: string
          content?: string | null
          type?: 'text' | 'photo' | 'file' | 'system'
          file_url?: string | null
        }
        Update: {
          content?: string | null
        }
      }
      contacts: {
        Row: {
          id: string
          trip_id: string
          name: string
          phone: string | null
          role: string | null
          notes: string | null
          is_emergency: boolean
          created_at: string
        }
        Insert: {
          trip_id: string
          name: string
          phone?: string | null
          role?: string | null
          notes?: string | null
          is_emergency?: boolean
        }
        Update: {
          name?: string
          phone?: string | null
          role?: string | null
          notes?: string | null
          is_emergency?: boolean
        }
      }
    }
  }
}
