import { OpenAIWhisperInput } from "@/types/replicate/openaiWhisperInput";
import Replicate from "replicate";
import z from "zod";

const replicateInstance = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

/**
 * Convert a Zod schema into an example JSON shape for the system prompt.
 * Uses `any` for the parameter because Zod v4 internal types differ from v3.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function zodSchemaToExample(schema: any): unknown {
  if (schema._zpiType === "ZodObject" || schema._type === "object" || schema.shape) {
    const shape = schema.shape;
    if (shape && typeof shape === "object") {
      const obj: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(shape)) {
        obj[key] = zodSchemaToExample(value);
      }
      return obj;
    }
  }
  if (schema._zpiType === "ZodArray" || schema._type === "array" || schema.element) {
    return [zodSchemaToExample(schema.element)];
  }
  if (schema.options && Array.isArray(schema.options)) {
    return schema.options[0];
  }
  if (schema._def?.innerType) {
    return zodSchemaToExample(schema._def.innerType);
  }
  if (schema.unwrap && typeof schema.unwrap === "function") {
    try {
      return zodSchemaToExample(schema.unwrap());
    } catch {
      // fallback
    }
  }
  if (schema._type === "string" || schema._zpiType === "ZodString") {
    return "string";
  }
  if (schema._type === "number" || schema._zpiType === "ZodNumber") {
    return 0;
  }
  if (schema._type === "boolean" || schema._zpiType === "ZodBoolean") {
    return false;
  }
  return "unknown";
}


export class ReplicateFactory {
  static generateTextWithClaude(input: Record<string, unknown>) {
    return replicateInstance.run("anthropic/claude-3.7-sonnet", { input });
  }

  static openaiWhisper(input: OpenAIWhisperInput) {
    return replicateInstance.run("openai/whisper:8099696689d249cf8b122d833c36ac3f75505c666a395ca40ef26f68e7d3d16e", { input });
  }

  /**
   * Call Claude on Replicate with structured JSON output validated by a Zod schema.
   * Equivalent to AI SDK's generateText + Output.object({ schema }).
   */
  static async generateExpenseObject<T>({
    prompt,
    schema,
    model = "anthropic/claude-3.7-sonnet",
  }: {
    prompt: string;
    schema: z.ZodType<T>;
    model?: `${string}/${string}`;
  }): Promise<T> {
    // Build a JSON schema description from the Zod schema
    const schemaShape = zodSchemaToExample(schema);

    const raw = await replicateInstance.run(model, {
      input: {
        prompt,
        max_tokens: 8192,
        system_prompt: `You MUST respond with valid JSON only. No markdown, no backticks, no explanation — just the raw JSON object.

CRITICAL RULES:
- All numeric fields MUST be raw numbers, NOT strings. Write 35 not "35" and not "35 seconds".
- amount is A number.

Your response MUST follow this EXACT JSON structure (use these exact field names and types):
${JSON.stringify(schemaShape, null, 2)}`,
      },
    });
    console.log("🚀 ~ ReplicateFactory ~ generateExpenseObject ~ raw:", raw)

    // Replicate returns an array of token chunks for Claude models
    const text = Array.isArray(raw) ? raw.join("") : String(raw);
    console.log("🚀 ~ ReplicateFactory ~ generateExpenseObject ~ text:", text)

    // Extract JSON from response (handle potential markdown wrapping)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`Failed to extract JSON from model response: ${text.slice(0, 200)}`);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const result = schema.safeParse(parsed);
    if (!result.success) {
      console.error("🔴 Zod validation errors:", JSON.stringify(result.error.issues, null, 2));
      console.error("🔴 Parsed object keys:", Object.keys(parsed));
      if (parsed.expenses?.[0]) {
        console.error("🔴 First expense keys:", Object.keys(parsed.expenses[0]));
        console.error("🔴 First expense sample:", JSON.stringify(parsed.expenses[0], null, 2));
      }
      throw new Error(`Schema validation failed: ${result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`);
    }

    return result.data;
  }
}
