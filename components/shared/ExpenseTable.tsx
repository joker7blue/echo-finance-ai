"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Expense } from "@/types/database";
import { cn } from "@/utils/cn";
import { Loader2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { TableRowSkeleton } from './LoadingSkeleton';

interface ExpenseTableProps {
  userId: string;
}

export function ExpenseTable({ userId }: ExpenseTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let channel: any;
    async function fetchExpenses() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/expenses?userId=${userId}`);
        if (!res.ok) throw new Error("Failed to fetch expenses");
        const data = await res.json();
        setExpenses(data.expenses);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchExpenses();

    // Subscribe to real-time updates
    import("@/lib/supabase").then(({ supabase }) => {
      const { channel: supaChannel } = supabase;
      channel = supabase
        .channel(`expenses:user_id=eq.${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "expenses",
            filter: `user_id=eq.${userId}`,
          },
          (payload: any) => {
            fetchExpenses();
          }
        )
        .subscribe();
    });
    return () => {
      if (channel) channel.unsubscribe();
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="overflow-x-auto glass rounded-2xl p-0">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead>
            <tr className="bg-zinc-900/80">
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Merchant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Audio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={6} className="px-6 py-4">
                  <TableRowSkeleton columns={6} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 py-8">
        <AlertTriangle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }
  if (!expenses.length) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-zinc-400">
        No expenses yet. Start recording to add your first expense!
      </div>
    );
  }
  return (
    <div className="overflow-x-auto glass rounded-2xl p-0">
      <table className="min-w-full divide-y divide-zinc-800">
        <thead>
          <tr className="bg-zinc-900/80">
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Merchant</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Audio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {expenses.map((exp) => (
            <tr key={exp.id} className="hover:bg-zinc-900/40 transition">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                {new Date(exp.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                {exp.merchant || <span className="italic text-zinc-500">—</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                {exp.amount != null ? `$${exp.amount.toFixed(2)}` : <span className="italic text-zinc-500">—</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                {exp.category || <span className="italic text-zinc-500">—</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {exp.status === 'completed' && (
                  <span className="inline-flex items-center gap-1 text-emerald-500"><CheckCircle2 className="w-4 h-4" />Completed</span>
                )}
                {exp.status === 'processing' && (
                  <span className="inline-flex items-center gap-1 text-yellow-400"><Clock className="w-4 h-4 animate-pulse" />Processing</span>
                )}
                {exp.status === 'error' && (
                  <span className="inline-flex items-center gap-1 text-red-500"><AlertTriangle className="w-4 h-4" />Error</span>
                )}
                {exp.status === 'pending' && (
                  <span className="inline-flex items-center gap-1 text-zinc-400"><Loader2 className="w-4 h-4 animate-spin" />Pending</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                {exp.audio_url ? (
                  <audio controls src={exp.audio_url} className="h-8 w-32" />
                ) : (
                  <span className="italic text-zinc-500">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
