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

export interface Expense {
  id: string;
  user_id: string;
  merchant: string | null;
  amount: number | null;
  category: string | null;
  status: ExpenseStatus;
  raw_text: string | null;
  audio_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Enums ───────────────────────────────────────────────

export type ExpenseStatus = 'pending' | 'processing' | 'completed' | 'error';

// ─── Database Response Types ─────────────────────────────

export type ExpenseInsert = Omit<Expense, 'id' | 'created_at' | 'updated_at'>;
export type ExpenseUpdate = Partial<Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
