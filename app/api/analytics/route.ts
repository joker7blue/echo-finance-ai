import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export interface AnalyticsSummary {
  totalSpend: number;
  totalCount: number;
  byCategory: { category: string; total: number; count: number }[];
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data, error } = await supabase
      .from("expenses")
      .select("category, amount")
      .eq("user_id", userId)
      .eq("status", "completed")
      .not("amount", "is", null);

    if (error) throw error;

    const totalSpend = data.reduce((sum, e) => sum + (e.amount ?? 0), 0);
    const totalCount = data.length;

    const categoryMap = new Map<string, { total: number; count: number }>();
    for (const e of data) {
      const cat = e.category ?? "other";
      const existing = categoryMap.get(cat) ?? { total: 0, count: 0 };
      categoryMap.set(cat, {
        total: existing.total + (e.amount ?? 0),
        count: existing.count + 1,
      });
    }

    const byCategory = Array.from(categoryMap.entries())
      .map(([category, { total, count }]) => ({ category, total, count }))
      .sort((a, b) => b.total - a.total);

    return NextResponse.json({ totalSpend, totalCount, byCategory } satisfies AnalyticsSummary);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
