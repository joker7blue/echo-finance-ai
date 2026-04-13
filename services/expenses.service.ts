import { Expense, ExpenseInsert, ExpenseUpdate } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

export class ExpensesService {
  constructor(private supabase: SupabaseClient) {}
  /**
   * Get all expenses for a user
   */
  async getExpenses(userId: string) {
    const { data, error } = await this.supabase
      .from("expenses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Expense[];
  }

  /**
   * Get a single expense by ID
   */
  async getExpense(id: string, userId: string) {
    const { data, error } = await this.supabase
      .from("expenses")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    return data as Expense;
  }

  /**
   * Create a new expense
   */
  async createExpense(expense: ExpenseInsert) {
    const { data, error } = await this.supabase
      .from("expenses")
      .insert(expense)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  }

  /**
   * Update an expense
   */
  async updateExpense(id: string, userId: string, updates: ExpenseUpdate) {
    const { data, error } = await this.supabase
      .from("expenses")
      .update(updates)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as Expense;
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id: string, userId: string) {
    const { error } = await this.supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  }

  /**
   * Subscribe to real-time changes for user's expenses
   */
  subscribeToExpenses(userId: string, callback: (expense: Expense) => void) {
    return this.supabase
      .channel(`expenses:user_id=eq.${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Expense);
        },
      )
      .subscribe();
  }
}
