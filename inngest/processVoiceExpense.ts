import { inngest } from "@/lib/inngest";
import { supabase } from "@/lib/supabase";
import { ExpensesService } from "@/services/expenses.service";
import { StorageService } from "@/services/storage.service";
import { ReplicateFactory } from "@/lib/replicateFactoty";
import { OpenAIWhisperOutput } from "@/types/replicate/openaiWhisperOuput";
// import { models } from "@/lib/ai";
// import { generateObject } from "ai";
// import { expenseExtractionSchema } from "@/lib/expense-schema";
import { expensesArraySchema, ExpensesArray } from "@/lib/expense-schema";

const expenses = new ExpensesService(supabase);
const storage = new StorageService(supabase);

export const processVoiceExpense = inngest.createFunction(
  {
    id: "process-voice-expense",
    retries: 2,
    onFailure: async ({ event, step }) => {
      const { expenseId, userId } = event.data.event.data;
      await step.run("mark-as-error", async () => {
        await expenses.updateExpense(expenseId, userId, { status: "error" });
      });
    },
  },
  { event: "voice/expense.submitted" },
  async ({ event, step }) => {
    const { expenseId, userId, audioPath, audioUrl } = event.data;

    // Step 1: Get a signed URL for the audio file
    const signedUrl = await step.run("get-signed-url", async () => {
      return await storage.getSignedUrl(audioPath);
    });

    // Step 2: Transcribe audio using Replicate Whisper
    const transcription = await step.run("transcribe-audio", async () => {
      const result = await ReplicateFactory.openaiWhisper({
        audio: signedUrl,
        language: "en",
        transcription: "plain text",
      });

      return (result as OpenAIWhisperOutput).transcription;
    });

    // Step 3: Save raw transcription
    await step.run("save-transcription", async () => {
      await expenses.updateExpense(expenseId, userId, {
        raw_text: transcription,
      });
    });

    // Step 4: Extract all expenses from transcription using Claude via Replicate
    const extracted = await step.run("extract-expense", async () => {
      const result = (await ReplicateFactory.generateExpenseObject({
        schema: expensesArraySchema,
        prompt: `You are an expert financial assistant extracting structured expense data from a voice memo transcription.

Extract EVERY expense mentioned — there may be one or several in a single recording.

---

TRANSCRIPTION:
"${transcription}"

---

EXTRACTION RULES:

**merchant**
- Use the business or store name if mentioned (e.g. "Starbucks", "Uber", "Amazon")
- If no store name is said, infer a reasonable label (e.g. "Coffee Shop", "Gas Station")
- If it's a service (e.g. "my Netflix subscription"), use the service name
- Never leave this empty

**amount**
- Extract the numeric value only (no currency symbols)
- Handle spoken formats: "twelve fifty" → 12.50, "a hundred bucks" → 100.00, "twenty-three forty" → 23.40
- If a range is given (e.g. "about 30 to 40 dollars"), use the midpoint (35.00)
- If truly no amount is inferable, use 0

**category** — pick the single best fit:
- food          → restaurants, cafes, groceries, delivery, drinks
- transport     → uber, lyft, taxi, gas, parking, subway, bus, flight
- shopping      → clothes, electronics, retail, online orders, amazon
- entertainment → movies, concerts, games, streaming subscriptions, sports
- bills         → rent, utilities, phone, internet, insurance, subscriptions (non-entertainment)
- health        → pharmacy, doctor, gym, supplements, dental
- education     → courses, books, tuition, software for learning
- travel        → hotels, airbnb, vacation expenses, luggage
- other         → anything that doesn't clearly fit the above

---

EXAMPLES:
- "Spent 4.50 at Starbucks and grabbed an Uber for 12 bucks"
  → { "expenses": [{ "merchant": "Starbucks", "amount": 4.50, "category": "food" }, { "merchant": "Uber", "amount": 12.00, "category": "transport" }] }
- "Paid my electricity bill, was around 85 bucks"
  → { "expenses": [{ "merchant": "Electric Company", "amount": 85.00, "category": "bills" }] }
- "Nike sneakers for 120, then lunch at Chipotle for 15, and a 9.99 Spotify subscription"
  → { "expenses": [{ "merchant": "Nike", "amount": 120.00, "category": "shopping" }, { "merchant": "Chipotle", "amount": 15.00, "category": "food" }, { "merchant": "Spotify", "amount": 9.99, "category": "entertainment" }] }`,
      })) as ExpensesArray;

      return result.expenses;
    });

    // Step 5: Update original expense with first result, create records for the rest
    await step.run("update-expense", async () => {
      if (!extracted.length) {
        await expenses.updateExpense(expenseId, userId, { status: "error" });
        return;
      }

      const [first, ...rest] = extracted;

      await expenses.updateExpense(expenseId, userId, {
        merchant: first.merchant,
        amount: first.amount,
        category: first.category,
        status: "completed",
      });

      for (const exp of rest) {
        await expenses.createExpense({
          user_id: userId,
          merchant: exp.merchant,
          amount: exp.amount,
          category: exp.category,
          status: "completed",
          audio_url: audioUrl,
          raw_text: transcription,
        });
      }
    });

    return {
      expenseId,
      transcription,
      extracted,
    };
  }
);
