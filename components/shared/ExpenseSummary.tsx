"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Receipt, Tag, Loader2, AlertTriangle } from "lucide-react";
import type { AnalyticsSummary } from "@/app/api/analytics/route";

const CATEGORY_COLORS: Record<string, string> = {
  food: "text-orange-400",
  transport: "text-blue-400",
  shopping: "text-pink-400",
  entertainment: "text-purple-400",
  bills: "text-red-400",
  health: "text-emerald-400",
  education: "text-cyan-400",
  travel: "text-yellow-400",
  other: "text-zinc-400",
};

interface ExpenseSummaryProps {
  userId: string;
}

export function ExpenseSummary({ userId }: ExpenseSummaryProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analytics");
        if (!res.ok) throw new Error("Failed to load analytics");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-500 py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading summary...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 py-4">
        <AlertTriangle className="w-4 h-4" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  if (!data || data.totalCount === 0) return null;

  const topCategory = data.byCategory[0];

  return (
    <div className="space-y-4">
      {/* Top-line stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="rounded-xl bg-emerald-500/10 p-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Spend</p>
            <p className="text-2xl font-bold text-white">
              ${data.totalSpend.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 flex items-center gap-4">
          <div className="rounded-xl bg-violet-500/10 p-3">
            <Receipt className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Expenses</p>
            <p className="text-2xl font-bold text-white">{data.totalCount}</p>
          </div>
        </div>

        {topCategory && (
          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="rounded-xl bg-pink-500/10 p-3">
              <Tag className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Top Category</p>
              <p className="text-2xl font-bold text-white capitalize">
                {topCategory.category}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Category breakdown */}
      {data.byCategory.length > 1 && (
        <div className="glass rounded-2xl p-5">
          <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
            By Category
          </h3>
          <div className="space-y-3">
            {data.byCategory.map(({ category, total, count }) => {
              const pct = data.totalSpend > 0 ? (total / data.totalSpend) * 100 : 0;
              const colorClass = CATEGORY_COLORS[category] ?? "text-zinc-400";
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm capitalize font-medium ${colorClass}`}>
                      {category}
                    </span>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-zinc-500">{count} expense{count !== 1 ? "s" : ""}</span>
                      <span className="text-white font-semibold">${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full bg-violet-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
