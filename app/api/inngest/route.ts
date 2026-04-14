import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { processVoiceExpense } from "@/inngest/processVoiceExpense";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processVoiceExpense],
});
