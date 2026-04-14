import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { StorageService } from "@/services/storage.service";
import { ExpensesService } from "@/services/expenses.service";
import { inngest } from "@/lib/inngest";

const storage = new StorageService(supabase);
const expenses = new ExpensesService(supabase);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["audio/webm", "audio/mp4", "audio/mpeg", "audio/ogg"];
    if (!allowedTypes.some((type) => audioFile.type.startsWith(type))) {
      return NextResponse.json(
        { error: "Invalid audio format" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum 10MB." },
        { status: 400 }
      );
    }

    // Upload audio to Supabase Storage
    const filename = `expense_${Date.now()}.webm`;
    const { path, url } = await storage.uploadAudio(userId, audioFile, filename);

    // Create expense record with pending status
    const expense = await expenses.createExpense({
      user_id: userId,
      status: "processing",
      audio_url: url,
      merchant: null,
      amount: null,
      category: null,
      raw_text: null,
    });

    // Dispatch Inngest event for async processing
    await inngest.send({
      name: "voice/expense.submitted",
      data: {
        expenseId: expense.id,
        userId,
        audioPath: path,
        audioUrl: url,
      },
    });

    return NextResponse.json({
      expenseId: expense.id,
      status: "processing",
    });
  } catch (error) {
    console.error("[POST /api/voice] Error:", error);
    return NextResponse.json(
      { error: "Failed to process voice recording" },
      { status: 500 }
    );
  }
}
