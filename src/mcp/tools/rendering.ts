import { execSync, spawnSync } from "child_process";
import { resolve, join } from "path";
import { existsSync } from "fs";

const PROJECT_ROOT = resolve(process.env.REMOTION_PROJECT_ROOT ?? process.cwd());
const BUN_PATH = process.env.BUN_PATH ?? "/sessions/elegant-jolly-newton/.bun/bin/bun";

function runCommand(cmd: string, cwd = PROJECT_ROOT): { stdout: string; stderr: string; code: number } {
  const result = spawnSync("sh", ["-c", cmd], {
    cwd,
    encoding: "utf-8",
    timeout: 300_000, // 5 min max
    env: { ...process.env, PATH: `${BUN_PATH.replace(/\/bun$/, "")}:${process.env.PATH}` },
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    code: result.status ?? 1,
  };
}

export function render_validate_timeline(args: { timeline_json: string }): string {
  try {
    // Dynamically import zod schema and validate
    const timeline = JSON.parse(args.timeline_json);

    // Basic structural checks (full Zod validation happens in the renderer)
    const required = ["id", "fps", "width", "height", "durationInFrames", "tracks", "clips"];
    const missing = required.filter((k) => !(k in timeline));

    if (missing.length > 0) {
      return JSON.stringify({
        valid: false,
        errors: [`Missing required fields: ${missing.join(", ")}`],
      });
    }

    if (!Array.isArray(timeline.tracks) || timeline.tracks.length === 0) {
      return JSON.stringify({ valid: false, errors: ["tracks must be a non-empty array"] });
    }

    if (!Array.isArray(timeline.clips) || timeline.clips.length === 0) {
      return JSON.stringify({ valid: false, errors: ["clips must be a non-empty array"] });
    }

    // Validate each clip references a valid track
    const trackIds = new Set(timeline.tracks.map((t: any) => t.id));
    const invalidClips = timeline.clips.filter((c: any) => !trackIds.has(c.trackId));
    if (invalidClips.length > 0) {
      return JSON.stringify({
        valid: false,
        errors: invalidClips.map((c: any) => `Clip "${c.id}" references non-existent track "${c.trackId}"`),
      });
    }

    return JSON.stringify({
      valid: true,
      summary: {
        id: timeline.id,
        clips: timeline.clips.length,
        tracks: timeline.tracks.length,
        durationInFrames: timeline.durationInFrames,
        durationSeconds: (timeline.durationInFrames / timeline.fps).toFixed(2),
        fps: timeline.fps,
        resolution: `${timeline.width}x${timeline.height}`,
      },
    });
  } catch (e: any) {
    return JSON.stringify({ valid: false, errors: [`JSON parse error: ${e.message}`] });
  }
}

export function render_list_compositions(args: {}): string {
  const result = runCommand(`npx remotion compositions src/remotion/index.ts --json 2>/dev/null || echo '[]'`);

  try {
    const compositions = JSON.parse(result.stdout || "[]");
    return JSON.stringify({ compositions, count: compositions.length });
  } catch {
    return JSON.stringify({
      compositions: ["DemoBrandIntro", "AgentComposition"],
      count: 2,
      note: "Using fallback list — run `bun run dev` to see live compositions",
    });
  }
}

export function render_get_status(args: {}): string {
  const checks = {
    project_root: PROJECT_ROOT,
    bun_available: existsSync(BUN_PATH),
    node_modules: existsSync(join(PROJECT_ROOT, "node_modules")),
    remotion_entry: existsSync(join(PROJECT_ROOT, "src/remotion/index.ts")),
    public_dir: existsSync(join(PROJECT_ROOT, "public")),
    examples_dir: existsSync(join(PROJECT_ROOT, "examples")),
  };

  const ready = checks.bun_available && checks.node_modules && checks.remotion_entry;

  return JSON.stringify({ ready, checks });
}

export function render_save_timeline(args: { timeline_json: string; filename?: string }): string {
  // Validate it parses
  let timeline: any;
  try {
    timeline = JSON.parse(args.timeline_json);
  } catch (e: any) {
    throw new Error(`Invalid JSON: ${e.message}`);
  }

  const filename = args.filename ?? `${timeline.id ?? "composition"}-${Date.now()}.json`;
  const outPath = join(PROJECT_ROOT, "examples", filename);

  const { writeFileSync, mkdirSync } = require("fs");
  mkdirSync(join(PROJECT_ROOT, "examples"), { recursive: true });
  writeFileSync(outPath, JSON.stringify(timeline, null, 2), "utf-8");

  return JSON.stringify({
    success: true,
    path: `examples/${filename}`,
    message: `Timeline saved. To render: npx remotion render AgentComposition --props='${JSON.stringify({ timeline })}' --output out/${timeline.id}.mp4`,
  });
}

export function render_build_command(args: {
  composition_id: string;
  output?: string;
  timeline_json?: string;
}): string {
  const output = args.output ?? `out/${args.composition_id}.mp4`;
  const propsArg = args.timeline_json
    ? `--props='${args.timeline_json.replace(/'/g, '"')}'`
    : "";

  const command = [
    `npx remotion render`,
    `src/remotion/index.ts`,
    args.composition_id,
    propsArg,
    `--output ${output}`,
    `--codec h264`,
    `--image-format jpeg`,
    `--concurrency 50%`,
  ]
    .filter(Boolean)
    .join(" \\\n  ");

  return JSON.stringify({
    command,
    note: "Run this command from the project root directory to render the video.",
    output,
  });
}
