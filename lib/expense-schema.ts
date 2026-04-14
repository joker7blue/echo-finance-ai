import { z } from "zod";

export const expenseExtractionSchema = z.object({
  merchant: z
    .string()
    .describe("The merchant or store name where the expense occurred"),
  amount: z
    .number()
    .positive()
    .describe("The dollar amount of the expense"),
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
