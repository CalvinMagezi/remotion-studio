# Remotion Studio — Claude Code Guide

## What this repo does
Local-first programmatic video studio. AI agents write `Timeline` JSON files → they auto-register as Remotion compositions → rendered to MP4 via `remotion render`.

## Core workflow for generating a new video
1. Fetch the live schema: call `docs_get_timeline_schema` MCP tool
2. Fetch the component catalog: call `docs_get_component_catalog` MCP tool  
3. Study a reference: read one file from `examples/syntra/` or `examples/academy/` matching the target format
4. Write your timeline to `examples/<category>/<slug>.json`
5. Validate: call `render_validate_timeline` — iterate until it passes
6. Register: run `bun run registry` — the composition auto-registers
7. Render: `npx remotion render src/remotion/index.ts <id> out/<slug>.mp4`

## Key files
- `src/remotion/schema/timeline.ts` — Zod schema defining all valid JSON structures
- `src/remotion/schema/renderer.tsx` — maps component names to React components
- `src/remotion/compositions/registry.generated.ts` — GENERATED (do not edit)
- `src/mcp/server.ts` — MCP server exposing tools (auto-connected via .mcp.json)
- `examples/` — all timeline JSONs (syntra/, academy/, legacy-reels/)

## MCP tools available
- `docs_get_timeline_schema` — full Zod schema as text
- `docs_get_component_catalog` — all component names + prop shapes + examples
- `docs_get_motion_tokens` — motion/easing/spring token reference
- `render_validate_timeline` — validates a timeline object against the schema
- `render_save_timeline` — writes a timeline JSON to examples/
- `render_build_command` — generates the correct CLI render command
- `fs_read_file`, `fs_write_file`, `fs_list_directory` — sandboxed filesystem access
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
