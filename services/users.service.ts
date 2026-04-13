import { User } from "@/types/database";
import { SupabaseClient } from "@supabase/supabase-js";

export class UsersService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get user by ID
   */
  async getUser(userId: string) {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data as User;
  }

  /**
   * Create or update user (upsert for Clerk sync)
   */
  async upsertUser(user: Omit<User, "created_at" | "updated_at">) {
    const { data, error } = await this.supabase
      .from("users")
      .upsert(user, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  /**
   * Update user profile
   */
  async updateUser(
    userId: string,
    updates: Partial<Omit<User, "id" | "created_at" | "updated_at">>,
  ) {
    const { data, error } = await this.supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }
}
