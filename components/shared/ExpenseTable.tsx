"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Expense } from "@/types/database";
import { Loader2, AlertTriangle, CheckCircle2, Clock, Pencil, Trash2, Search, X } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { TableRowSkeleton } from "./LoadingSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";

const CATEGORIES = [
  "food",
  "transport",
  "shopping",
  "entertainment",
  "bills",
  "health",
  "education",
  "travel",
  "other",
] as const;

const editSchema = z.object({
  merchant: z.string().min(1, "Merchant is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.enum(CATEGORIES),
});
type EditFormValues = z.infer<typeof editSchema>;

interface ExpenseTableProps {
  userId: string;
  refreshKey?: number;
}

export function ExpenseTable({ userId, refreshKey }: ExpenseTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EditFormValues>({ resolver: zodResolver(editSchema) });

  useEffect(() => {
    if (editExpense) {
      reset({
        merchant: editExpense.merchant ?? "",
        amount: editExpense.amount ?? 0,
        category: (editExpense.category as (typeof CATEGORIES)[number]) ?? "other",
      });
    }
  }, [editExpense, reset]);

  const silentRefetch = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/expenses?userId=${userId}`);
      if (!res.ok) return;
      const data = await res.json();
      setExpenses(data.expenses);
    } catch {
      // silent — don't update error state on background refetch
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    async function initialFetch() {
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
    initialFetch();
  }, [userId]);

  // Silent refetch when parent signals a new submission
  useEffect(() => {
    if (refreshKey === undefined || refreshKey === 0) return;
    silentRefetch();
  }, [refreshKey, silentRefetch]);

  // Poll every 3s while any expense is pending or processing
  useEffect(() => {
    const hasInFlight = expenses.some(
      (e) => e.status === "pending" || e.status === "processing"
    );
    if (!hasInFlight) return;
    const interval = setInterval(silentRefetch, 3000);
    return () => clearInterval(interval);
  }, [expenses, silentRefetch]);

  // Realtime subscription (best-effort — works if RLS SELECT policy is set)
  useEffect(() => {
    let channel: any;
    import("@/lib/supabase").then(({ supabase }) => {
      channel = supabase
        .channel(`expenses:user_id=eq.${userId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "expenses", filter: `user_id=eq.${userId}` },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setExpenses((prev) => [payload.new as Expense, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setExpenses((prev) =>
                prev.map((e) => e.id === payload.new.id ? (payload.new as Expense) : e)
              );
            } else if (payload.eventType === "DELETE") {
              setExpenses((prev) => prev.filter((e) => e.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    });
    return () => { if (channel) channel.unsubscribe(); };
  }, [userId]);

  async function onEdit(values: EditFormValues) {
    if (!editExpense) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/expenses/${editExpense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update expense");
      setExpenses((prev) =>
        prev.map((e) => e.id === editExpense.id ? { ...e, ...data.expense } : e)
      );
      toast.success("Expense updated successfully");
      setEditExpense(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!deleteExpenseId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/expenses/${deleteExpenseId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to delete expense");
      toast.success("Expense deleted");
      setExpenses((prev) => prev.filter((e) => e.id !== deleteExpenseId));
      setDeleteExpenseId(null);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  const filtered = expenses.filter((exp) => {
    const matchesSearch =
      !search ||
      exp.merchant?.toLowerCase().includes(search.toLowerCase()) ||
      exp.raw_text?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const tableHead = (
    <tr className="bg-zinc-900/80">
      {["Date", "Merchant", "Amount", "Category", "Status", "Audio", "Actions"].map((col) => (
        <th
          key={col}
          className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider"
        >
          {col}
        </th>
      ))}
    </tr>
  );

  if (loading) {
    return (
      <div className="overflow-x-auto glass rounded-2xl p-0">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead>{tableHead}</thead>
          <tbody className="divide-y divide-zinc-800">
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                <td colSpan={7} className="px-6 py-4">
                  <TableRowSkeleton columns={7} />
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

  return (
    <>
      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
          <Input
            placeholder="Search merchant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {!expenses.length ? (
        <div className="glass rounded-2xl p-8 text-center text-zinc-400">
          No expenses yet. Start recording to add your first expense!
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center text-zinc-400">
          No expenses match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto glass rounded-2xl p-0">
          <table className="min-w-full divide-y divide-zinc-800">
            <thead>{tableHead}</thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map((exp) => (
                <tr key={exp.id} className="hover:bg-zinc-900/40 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {new Date(exp.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {exp.merchant || <span className="italic text-zinc-500">—</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {exp.amount != null ? (
                      `$${exp.amount.toFixed(2)}`
                    ) : (
                      <span className="italic text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300 capitalize">
                    {exp.category || <span className="italic text-zinc-500">—</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {exp.status === "completed" && (
                      <span className="inline-flex items-center gap-1 text-emerald-500">
                        <CheckCircle2 className="w-4 h-4" />Completed
                      </span>
                    )}
                    {exp.status === "processing" && (
                      <span className="inline-flex items-center gap-1 text-yellow-400">
                        <Clock className="w-4 h-4 animate-pulse" />Processing
                      </span>
                    )}
                    {exp.status === "error" && (
                      <span className="inline-flex items-center gap-1 text-red-500">
                        <AlertTriangle className="w-4 h-4" />Error
                      </span>
                    )}
                    {exp.status === "pending" && (
                      <span className="inline-flex items-center gap-1 text-zinc-400">
                        <Loader2 className="w-4 h-4 animate-spin" />Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                    {exp.audio_url ? (
                      <AudioPlayer audioUrl={exp.audio_url} />
                    ) : (
                      <span className="italic text-zinc-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2 items-center">
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Edit expense"
                        onClick={() => setEditExpense(exp)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="destructive"
                        aria-label="Delete expense"
                        onClick={() => setDeleteExpenseId(exp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editExpense} onOpenChange={(open) => { if (!open) setEditExpense(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onEdit)} className="space-y-4 py-2">
            <div className="space-y-1">
              <Label htmlFor="merchant">Merchant</Label>
              <Input id="merchant" {...register("merchant")} placeholder="e.g. Starbucks" />
              {errors.merchant && (
                <p className="text-xs text-red-500">{errors.merchant.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register("amount", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditExpense(null)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" disabled={saving}>
                {saving && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteExpenseId}
        onOpenChange={(open) => { if (!open) setDeleteExpenseId(null); }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
          </DialogHeader>
          <p className="text-zinc-400 py-2">
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteExpenseId(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={deleting}>
              {deleting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
