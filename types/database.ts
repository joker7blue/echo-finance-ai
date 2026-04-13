// types/database.ts — TypeScript interfaces for Supabase tables (snake_case)

// ─── Tables ──────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}