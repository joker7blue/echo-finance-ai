import { z } from "zod";

export const expenseExtractionSchema = z.object({
  merchant: z
    .string()
    .describe("The merchant or store name where the expense occurred"),
  amount: z
    .number()
    .describe("The dollar amount of the expense as a positive number"),
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
    .describe("The category that best describes this expense"),
});

export type ExpenseExtraction = z.infer<typeof expenseExtractionSchema>;

export const expensesArraySchema = z.object({
  expenses: z
    .array(expenseExtractionSchema)
    .describe("All expenses mentioned in the transcription. Extract every single expense, even if multiple are mentioned in one sentence."),
});

export type ExpensesArray = z.infer<typeof expensesArraySchema>;
