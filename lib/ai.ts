import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

export const models = {
  story: anthropic('claude-sonnet-4-6'),
  fast: anthropic("claude-haiku-4-5-20251001"),
  openaiVoice: openai("gpt-4o-mini"),
};
