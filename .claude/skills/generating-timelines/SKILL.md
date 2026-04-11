---
name: generating-timelines
description: Use when the user asks for a new video, reel, short, or timeline. Produces a validated Timeline JSON in examples/, ready to render via the auto-registered composition.
manual: false
---

# Generating Timeline Videos

Use this workflow to autonomously produce a new video from a prompt.

## Step 1 — Fetch all docs in one call
Call `docs_get_full_reference` — returns the full schema, component catalog, and motion tokens together. Prefer this over three separate calls.

## Step 2 — Study a reference example
Read one existing example from `examples/syntra/` or `examples/academy/` that matches the requested format:
- Vertical short (1080×1920): look in `examples/syntra/` or `examples/academy/`
- Landscape (1920×1080): look in `examples/legacy-reels/`

Understanding the reference's clip structure and timing is critical for getting motion and layout right.

## Step 3 — Source music (if needed)
If the video needs background music, call `music_search` to find a CC-licensed track by mood/tempo, then `music_download` to save it to `public/music/`. Set `timeline.audio.src` to the relative path (e.g., `"music/track.mp3"`).

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
5. Call `render_list_compositions` to verify the ID appears in the registered list

## Step 6 — Render (optional)
Delegate to the `rendering-workflow` skill, or use `render_build_command` to get the CLI command.
