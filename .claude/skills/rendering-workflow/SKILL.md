---
name: rendering-workflow
description: Use when the user asks to render, preview, or produce an MP4 from a timeline. Covers MCP tool sequencing, static composition IDs, and batch patterns.
manual: false
---

# Rendering Workflow

## Step 1 — Identify the composition ID
If the timeline lives at `examples/**/<slug>.json`, its Remotion composition ID is `timeline.id` (auto-registered).
For a one-off timeline not yet saved, use `AgentComposition` + `--props`.

## Step 2 — Validate first
Call `render_validate_timeline` before any render. Schema errors are much cheaper to catch here than mid-render.

## Step 3 — Get the render command
Call `render_build_command` with the composition ID — it returns the correct CLI invocation for this repo's structure.

Or use directly:
```bash
# Named composition (auto-registered)
npx remotion render src/remotion/index.ts <id> out/<slug>.mp4 --codec h264 --concurrency 50%

# AgentComposition with props file
npx remotion render src/remotion/index.ts AgentComposition out/<slug>.mp4 --props=<path-to-props.json>
# where props.json = { "timeline": <timeline-object> }
```

## Step 4 — Iterate cheaply
For previews, render 1–3 frames instead of the full video:
```bash
npx remotion still src/remotion/index.ts <id> out/<slug>-frame0.png --frame=0
```

Use `bun run dev` (remotion studio) for hot-reload visual inspection during development.

## Step 5 — Batch renders
For multiple videos, follow the patterns in `render-syntra.sh` / `render-academy.sh`:
- They loop over JSON files, skip existing outputs, and summarize results
- Never hand-run 100 renders individually
