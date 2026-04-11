---
name: extending-component-library
description: Use when the user asks to add a new visual component (new clip type) to the Remotion component library. Walks through schema, renderer, catalog, and smoke test.
manual: true
---

# Extending the Component Library

Use this workflow to add a new reusable component that AI agents can use in timelines.

## Step 1 — Create the component file
Path: `src/remotion/components/<category>/<ComponentName>.tsx`

Copy the structure of an existing sibling (e.g., `src/remotion/components/text/TitleCard.tsx`):
- Accept `motion`, `layout`, and component-specific props
- Use `useCurrentFrame()`, `interpolate()`, `spring()` from Remotion
- Keep the component pure and deterministic (no Math.random — use `random(seed)` instead)

## Step 2 — Extend the Zod schema
File: `src/remotion/schema/timeline.ts`

1. Define `<ComponentName>PropsSchema` extending `BaseClipPropsSchema`
2. Add it to the `ClipPropsSchema` discriminated union:
   ```ts
   z.object({ component: z.literal("<ComponentName>"), props: <ComponentName>PropsSchema })
   ```

## Step 3 — Register in the renderer
File: `src/remotion/schema/renderer.tsx`

Add the component to `COMPONENT_REGISTRY` (or the equivalent lookup object).

## Step 4 — Update the MCP catalog
File: `src/mcp/tools/documentation.ts`

Add the new component's shape and an example snippet to `docs_get_component_catalog` so AI agents discover it automatically.

## Step 5 — Smoke test
1. Write a minimal timeline at `examples/legacy-reels/<component-name>-smoke.json` using the new component
2. Run `bun run registry` — it must validate
3. Launch `bun run dev` (remotion studio) and verify the composition appears
4. Render 1 frame: `npx remotion still src/remotion/index.ts <id> out/smoke.png`
