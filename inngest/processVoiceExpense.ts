import { inngest } from "@/lib/inngest";
import { supabase } from "@/lib/supabase";
import { ExpensesService } from "@/services/expenses.service";
import { StorageService } from "@/services/storage.service";
import { models } from "@/lib/ai";
import { generateObject } from "ai";
import { expenseExtractionSchema } from "@/lib/expense-schema";

const expenses = new ExpensesService(supabase);
const storage = new StorageService(supabase);

export const processVoiceExpense = inngest.createFunction(
  {
    id: "process-voice-expense",
    retries: 2,
  },
  { event: "voice/expense.submitted" },
  async ({ event, step }) => {
    const { expenseId, userId, audioPath, audioUrl } = event.data;

    // Step 1: Get a signed URL for the audio file
    const signedUrl = await step.run("get-signed-url", async () => {
      return await storage.getSignedUrl(audioPath);
    });

    // Step 2: Transcribe audio using OpenAI Whisper
    const transcription = await step.run("transcribe-audio", async () => {
      const response = await fetch(signedUrl);
      const audioBuffer = await response.arrayBuffer();

      const formData = new FormData();
      formData.append(
        "file",
        new Blob([audioBuffer], { type: "audio/webm" }),
        "audio.webm"
      );
      formData.append("model", "whisper-1");
      formData.append("language", "en");

      const whisperResponse = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: formData,
        }
      );

      if (!whisperResponse.ok) {
        throw new Error(`Whisper API error: ${whisperResponse.statusText}`);
      }

      const result = await whisperResponse.json();
      return result.text as string;
    });

    // Step 3: Save raw transcription
    await step.run("save-transcription", async () => {
      await expenses.updateExpense(expenseId, userId, {
        raw_text: transcription,
      });
    });

    // Step 4: Extract expense details using AI
    const extracted = await step.run("extract-expense", async () => {
      const { object } = await generateObject({
        model: models.fast,
        schema: expenseExtractionSchema,
        prompt: `Extract the expense details from this voice transcription. 
If no clear merchant is mentioned, use a reasonable description.
If no clear amount is mentioned, make your best estimate or use 0.

Transcription: "${transcription}"`,
      });

      return object;
    });

    // Step 5: Update expense with extracted data
    await step.run("update-expense", async () => {
      await expenses.updateExpense(expenseId, userId, {
        merchant: extracted.merchant,
        amount: extracted.amount,
        category: extracted.category,
        status: "completed",
      });
    });

    return {
      expenseId,
      transcription,
      extracted,
    };
  }
);
