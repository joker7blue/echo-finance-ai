import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";

const updateSchema = z.object({
  merchant: z.string().min(1).optional(),
  amount: z.number().positive().optional(),
  category: z
    .enum([
      "food",
      "transport",
      "shopping",
      "entertainment",
      "bills",
      "health",
      "education",
      "travel",
      "other",
    ])
    .optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );

    const { data, error } = await supabase
      .from("expenses")
      .update(parsed.data)
      .eq("id", id)
      .eq("user_id", userId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ expense: data });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

const BUCKET = "voice-recordings";

function extractStoragePath(audioUrl: string): string | null {
  const marker = `${BUCKET}/`;
  const idx = audioUrl.indexOf(marker);
  if (idx === -1) return null;
  return audioUrl.slice(idx + marker.length).split("?")[0];
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Fetch audio_url before deleting so we can clean up storage
    const { data: expense } = await supabase
      .from("expenses")
      .select("audio_url")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    // Delete DB record
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;

    // Delete audio file from storage (best-effort, don't fail if missing)
    if (expense?.audio_url) {
      const path = extractStoragePath(expense.audio_url);
      if (path) {
        await supabase.storage.from(BUCKET).remove([path]);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
