---
name: generating-timelines
description: Use when the user asks for a new video, reel, short, or timeline. Produces a validated Timeline JSON in examples/, ready to render via the auto-registered composition.
manual: false
---

# Generating Timeline Videos

Use this workflow to autonomously produce a new video from a prompt.

## Step 1 — Fetch the live schema
Call `docs_get_timeline_schema` MCP tool. Never inline the schema — it changes as components are added.

## Step 2 — Fetch the component catalog
Call `docs_get_component_catalog` to get all valid `component` string values and their prop shapes.

## Step 3 — Study a reference example
Read one existing example from `examples/syntra/` or `examples/academy/` that matches the requested format:
- Vertical short (1080×1920): look in `examples/syntra/` or `examples/academy/`
- Landscape (1920×1080): look in `examples/legacy-reels/`

Understanding the reference's clip structure and timing is critical for getting motion and layout right.

## Step 4 — Draft the timeline
- Choose dimensions from intent: vertical short = 1080×1920, landscape = 1920×1080
- Always define at least 3 tracks: `bg` (zIndex 0), `content` (zIndex 1), `overlay` (zIndex 2)
- Compose clips across tracks; `from` + `durationInFrames` must not exceed total `durationInFrames`
- Layout zones use 0–1 normalized coordinates (`x`, `y`, `width`, `height`)
- Motion tokens: prefer `spring` with `springProfile: "gentle"` or `"snappy"` for entrances

## Step 5 — Validate and save
1. Call `render_validate_timeline` with your draft — inspect errors and fix
2. Iterate until it returns success
3. Call `render_save_timeline` to write to `examples/<category>/<slug>.json`
4. Run `bun run registry` — the composition auto-registers

## Step 6 — Render (optional)
Delegate to the `rendering-workflow` skill, or use `render_build_command` to get the CLI command.
