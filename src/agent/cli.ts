#!/usr/bin/env node
/**
 * Remotion Studio Agent CLI
 * Usage: bun run src/agent/cli.ts "Create a 30-second sales presentation"
 */

import { generateTimeline } from "./generate.js";
import { render_validate_timeline, render_save_timeline, render_build_command } from "../mcp/tools/rendering.js";
import { writeFileSync } from "fs";
import { resolve } from "path";

async function main() {
  const request = process.argv.slice(2).join(" ");

  if (!request) {
    console.error("Usage: bun run src/agent/cli.ts <video description>");
    console.error('Example: bun run src/agent/cli.ts "Create a 30-second brand intro for Acme Corp"');
    process.exit(1);
  }

  console.log("\n🎬 Remotion Studio Agent");
  console.log("━".repeat(50));
  console.log(`📝 Request: ${request}\n`);

  // ── Step 1: Generate timeline ──────────────────────────────────────────────
  console.log("⚙️  Generating timeline...");
  const result = await generateTimeline(request, {
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  if (!result.success || !result.timeline) {
    console.error("\n❌ Generation failed:");
    result.errors?.forEach((e) => console.error(`  • ${e}`));
    process.exit(1);
  }

  console.log(`✅ Timeline generated (attempt ${result.attempts}/${3})`);
  console.log(`📊 Usage: ${result.usage?.inputTokens} in / ${result.usage?.outputTokens} out tokens`);
  console.log(`🎞  Composition: "${result.timeline.id}" — ${result.timeline.durationInFrames} frames @ ${result.timeline.fps}fps`);
  console.log(`📦 Clips: ${result.timeline.clips.length} | Tracks: ${result.timeline.tracks.length}`);

  // ── Step 2: Validate ───────────────────────────────────────────────────────
  const timelineJson = JSON.stringify(result.timeline, null, 2);
  const validation = JSON.parse(render_validate_timeline({ timeline_json: timelineJson }));

  if (!validation.valid) {
    console.error("\n❌ Validation failed:");
    validation.errors?.forEach((e: string) => console.error(`  • ${e}`));
    process.exit(1);
  }

  console.log("\n✅ Validation passed");

  // ── Step 3: Save ───────────────────────────────────────────────────────────
  const saved = JSON.parse(render_save_timeline({ timeline_json: timelineJson }));
  console.log(`\n💾 Saved: ${saved.path}`);

  // ── Step 4: Render command ─────────────────────────────────────────────────
  const renderCmd = JSON.parse(
    render_build_command({
      composition_id: "AgentComposition",
      timeline_json: JSON.stringify(result.timeline),
    })
  );

  console.log("\n━".repeat(50));
  console.log("🚀 Ready to render! Run this command:\n");
  console.log(`  cd ${resolve(process.env.REMOTION_PROJECT_ROOT ?? ".")}`);
  console.log(`  ${renderCmd.command}`);
  console.log("\n━".repeat(50));

  // ── Output JSON for piping ─────────────────────────────────────────────────
  if (process.env.AGENT_OUTPUT_JSON) {
    console.log("\n📄 Timeline JSON:\n");
    console.log(timelineJson);
  }
}

main().catch((err) => {
  console.error("Fatal:", err.message);
  process.exit(1);
});
