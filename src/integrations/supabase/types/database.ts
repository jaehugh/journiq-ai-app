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
      achievements: Achievement;
      goals: Goal;
      journal_entries: JournalEntry;
      profiles: Profile;
      subscriptions: Subscription;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

interface Achievement {
  Row: {
    id: string;
    user_id: string;
    badge_type: string;
    achieved_at: string | null;
  };
  Insert: {
    id?: string;
    user_id: string;
    badge_type: string;
    achieved_at?: string | null;
  };
  Update: {
    id?: string;
    user_id?: string;
    badge_type?: string;
    achieved_at?: string | null;
  };
}

interface Goal {
  Row: {
    id: string;
    user_id: string;
    content: string;
    is_achieved: boolean | null;
    is_ai_generated: boolean | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    content: string;
    is_achieved?: boolean | null;
    is_ai_generated?: boolean | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    content?: string;
    is_achieved?: boolean | null;
    is_ai_generated?: boolean | null;
    created_at?: string;
    updated_at?: string;
  };
}

interface JournalEntry {
  Row: {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    tags: string[] | null;
    category: string | null;
    title: string;
  };
  Insert: {
    id?: string;
    user_id: string;
    content: string;
    created_at?: string;
    updated_at?: string;
    tags?: string[] | null;
    category?: string | null;
    title?: string;
  };
  Update: {
    id?: string;
    user_id?: string;
    content?: string;
    created_at?: string;
    updated_at?: string;
    tags?: string[] | null;
    category?: string | null;
    title?: string;
  };
}

export interface Profile {
  Row: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id: string;
    display_name?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    display_name?: string | null;
    avatar_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
}

interface Subscription {
  Row: {
    user_id: string;
    tier: string;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    user_id: string;
    tier?: string;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    user_id?: string;
    tier?: string;
    created_at?: string;
    updated_at?: string;
  };
}