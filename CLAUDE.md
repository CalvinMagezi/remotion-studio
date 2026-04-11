# Remotion Studio — Claude Code Guide

## What this repo does
Local-first programmatic video studio. AI agents write `Timeline` JSON files → they auto-register as Remotion compositions → rendered to MP4 via `remotion render`.

## Core workflow for generating a new video
1. Call `docs_get_full_reference` — returns the full schema, component catalog, and motion tokens in one call
2. Study a reference: read one file from `examples/syntra/` or `examples/academy/` matching the target format
3. Write your timeline to `examples/<category>/<slug>.json`
   - If the video needs music: call `music_search` → `music_download` → set `timeline.audio.src`
4. Validate: call `render_validate_timeline` — iterate until it passes
5. Register: run `bun run registry` — the composition auto-registers
6. Verify: call `render_list_compositions` to confirm the ID appears
7. Render: use `render_build_command` to get the exact CLI invocation

## Key files
- `src/remotion/schema/timeline.ts` — Zod schema defining all valid JSON structures
- `src/remotion/schema/renderer.tsx` — maps component names to React components
- `src/remotion/compositions/registry.generated.ts` — GENERATED (do not edit)
- `src/mcp/server.ts` — MCP server exposing tools (auto-connected via .mcp.json)
- `examples/` — all timeline JSONs (syntra/, academy/, legacy-reels/)

## MCP tools available
- `docs_get_full_reference` — **start here**: full schema + catalog + motion tokens in one call
- `docs_get_timeline_schema` — Zod schema as text (individual call)
- `docs_get_component_catalog` — all component names + prop shapes + examples (individual call)
- `docs_get_motion_tokens` — motion/easing/spring token reference (individual call)
- `render_validate_timeline` — validates a timeline object against the schema
- `render_save_timeline` — writes a timeline JSON to examples/
- `render_build_command` — generates the correct CLI render command
- `render_list_compositions` — lists all registered composition IDs (use to verify registration)
- `render_get_status` — pre-flight environment check before rendering
- `fs_read_file`, `fs_write_file`, `fs_list_directory` — sandboxed filesystem access
- `fs_file_exists`, `fs_delete_file` — existence check and cleanup
- `music_search`, `music_download` — find and fetch CC-licensed music

## Skills available
- `remotion-best-practices` — Remotion-specific patterns (motion, timing, 3D, assets)
- `generating-timelines` — step-by-step video generation workflow for this repo
- `rendering-workflow` — how to render, preview, and batch-render
- `extending-component-library` — add a new component (schema + renderer + catalog)

## Important rules
- **Never edit `registry.generated.ts` manually** — run `bun run registry` instead
- **MCP tools are the runtime source of truth** — skills provide conceptual guidance, MCP tools provide live schemas
- **Always validate before rendering** — use `render_validate_timeline` first
- Vertical shorts: 1080×1920, 30fps. Landscape reels: 1920×1080, 30fps
- Component IDs must match `/^[a-zA-Z0-9_-]+$/`
