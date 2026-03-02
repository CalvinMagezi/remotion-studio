/**
 * Timeline generation using Vercel AI SDK with structured output
 * Uses Claude claude-sonnet-4-5 for generation + Zod schema validation
 */

import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { TimelineSchema, type Timeline } from "../remotion/schema/timeline.js";
import { SYSTEM_PROMPT, GENERATION_PROMPT, VALIDATION_RETRY_PROMPT } from "./prompts.js";

const MAX_RETRIES = 3;

export interface GenerateTimelineOptions {
  apiKey?: string;
  model?: string;
  maxRetries?: number;
}

export interface GenerateTimelineResult {
  success: boolean;
  timeline?: Timeline;
  errors?: string[];
  attempts: number;
  usage?: { inputTokens: number; outputTokens: number };
}

export async function generateTimeline(
  userRequest: string,
  options: GenerateTimelineOptions = {}
): Promise<GenerateTimelineResult> {
  const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. " +
        "Pass it as an option or set the environment variable."
    );
  }

  const anthropic = createAnthropic({ apiKey });
  const model = options.model ?? "claude-sonnet-4-5-20250929";
  const maxRetries = options.maxRetries ?? MAX_RETRIES;

  let lastErrors: string[] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const isRetry = attempt > 1;
    const prompt = isRetry
      ? VALIDATION_RETRY_PROMPT(lastErrors)
      : GENERATION_PROMPT(userRequest);

    try {
      const result = await generateObject({
        model: anthropic(model),
        schema: TimelineSchema,
        system: SYSTEM_PROMPT,
        prompt,
        temperature: 0.3,  // Low temp for deterministic structured output
        maxTokens: 8000,
      });

      totalInputTokens += result.usage?.promptTokens ?? 0;
      totalOutputTokens += result.usage?.completionTokens ?? 0;

      // Zod schema validation is automatic via generateObject
      const timeline = result.object;

      return {
        success: true,
        timeline,
        attempts: attempt,
        usage: { inputTokens: totalInputTokens, outputTokens: totalOutputTokens },
      };
    } catch (err: any) {
      // Extract validation errors for the retry loop
      if (err.name === "AI_TypeValidationError" || err.cause?.issues) {
        const issues = err.cause?.issues ?? [];
        lastErrors = issues.map((i: any) => `${i.path?.join(".") ?? "root"}: ${i.message}`);
      } else {
        lastErrors = [err.message ?? "Unknown generation error"];
      }

      console.error(`[Agent] Attempt ${attempt}/${maxRetries} failed:`, lastErrors);

      if (attempt === maxRetries) {
        return {
          success: false,
          errors: lastErrors,
          attempts: attempt,
          usage: { inputTokens: totalInputTokens, outputTokens: totalOutputTokens },
        };
      }
    }
  }

  return { success: false, errors: ["Max retries exceeded"], attempts: maxRetries };
}

/**
 * Quick helper: generate + stringify the timeline as formatted JSON
 */
export async function generateTimelineJSON(
  userRequest: string,
  options: GenerateTimelineOptions = {}
): Promise<string> {
  const result = await generateTimeline(userRequest, options);

  if (!result.success || !result.timeline) {
    throw new Error(
      `Timeline generation failed after ${result.attempts} attempts:\n${result.errors?.join("\n")}`
    );
  }

  return JSON.stringify(result.timeline, null, 2);
}
