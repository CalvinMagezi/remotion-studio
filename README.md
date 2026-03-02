# Remotion Studio — Local-First AI Video Generation

> A schema-driven, extensible Remotion studio designed for autonomous AI agents. Generate production-grade videos from natural language — no raw code synthesis, no sandboxing risks, no hallucinated imports.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Remotion Studio                               │
│                                                                 │
│  ┌─────────────┐     ┌──────────────┐     ┌─────────────────┐  │
│  │  AI Agent   │────▶│  MCP Server  │────▶│  Filesystem /   │  │
│  │  (Claude)   │     │  (stdio)     │     │  Renderer       │  │
│  └──────┬──────┘     └──────────────┘     └─────────────────┘  │
│         │                                                       │
│         │  generateObject() + Zod                               │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────┐              │
│  │  JSON Timeline Specification (validated)      │              │
│  │  { id, fps, tracks[], clips[] }               │              │
│  └───────────────────┬──────────────────────────┘              │
│                      │                                          │
│                      ▼                                          │
│  ┌──────────────────────────────────────────────┐              │
│  │  TimelineRenderer (React / Remotion)          │              │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │              │
│  │  │TitleCard │ │BarChart  │ │LowerThird    │  │              │
│  │  └──────────┘ └──────────┘ └──────────────┘  │              │
│  │  15 pre-built brand-agnostic components       │              │
│  └───────────────────┬──────────────────────────┘              │
│                      │                                          │
│                      ▼                                          │
│  ┌──────────────────────────────────────────────┐              │
│  │  @remotion/renderer → MP4 / Image Sequence   │              │
│  └──────────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Why Schema-Driven?

Traditional AI video pipelines instruct the LLM to write raw React/TSX code. This introduces:
- **Syntax hallucinations** — broken import statements, invalid hooks
- **Security risks** — raw code executed via `Function()` constructor in global scope
- **Fragile JIT compilation** — Babel/AST parsing that breaks on edge cases

This studio constrains the agent to output a **validated JSON Timeline Specification**. The agent never writes code — it orchestrates pre-built, production-grade React components through a type-safe schema.

## Quick Start

### 1. Install dependencies

```bash
cd remotion-studio
npm install
# or: bun install
```

### 2. Start the Remotion Studio (visual preview)

```bash
npm run studio
# Opens http://localhost:3000 with the DemoBrandIntro composition
```

### 3. Generate a video with the AI agent

```bash
# Set your API key
export ANTHROPIC_API_KEY=sk-ant-...

# Generate a video from natural language
bun run src/agent/cli.ts "Create a 20-second quarterly sales review with a revenue counter showing $4.2M, a bar chart of regional performance, and a lower-third for the CEO"
```

The agent will:
1. Call `docs_get_component_catalog` to understand available components
2. Generate a JSON timeline using Claude with Zod schema enforcement
3. Validate the timeline structure
4. Save it to `examples/` and output the render command

### 4. Render to MP4

```bash
npx remotion render src/remotion/index.ts AgentComposition \
  --props='{"timeline": {...}}' \
  --output out/my-video.mp4 \
  --codec h264 \
  --concurrency 50%
```

## Component Registry

| Component | Category | Description |
|-----------|----------|-------------|
| `TitleCard` | Text | Full-screen animated title + subtitle |
| `SubtitleCard` | Text | Centered body text overlay |
| `LowerThird` | Text | Broadcast-style name chyron |
| `Caption` | Text | Subtitle bar at top or bottom |
| `BarChart` | Data | Animated vertical/horizontal bar chart |
| `LineChart` | Data | Progressive line chart with area fill |
| `StatCounter` | Data | Animated number counter |
| `ProgressRing` | Data | SVG circular progress ring |
| `ImageReveal` | Media | Directional image wipe or fade |
| `VideoBackground` | Media | Full-bleed background video |
| `SplitScreen` | Media | Two-panel split layout |
| `LogoAnimation` | Media | Spring-physics logo entrance |
| `FadeTransition` | Transition | Fade to/from solid color |
| `SlideTransition` | Transition | Panel slide between scenes |
| `ZoomTransition` | Transition | Zoom in/out between scenes |

## JSON Timeline Specification

The complete format the AI agent generates:

```json
{
  "id": "my-video",
  "title": "My Video",
  "fps": 30,
  "width": 1920,
  "height": 1080,
  "durationInFrames": 300,
  "backgroundColor": "#0f172a",
  "tracks": [
    { "id": "background", "label": "Background", "zIndex": 0 },
    { "id": "content",    "label": "Content",    "zIndex": 1 },
    { "id": "data",       "label": "Data",        "zIndex": 2 },
    { "id": "overlay",    "label": "Overlays",    "zIndex": 3 }
  ],
  "clips": [
    {
      "id": "title-scene",
      "component": "TitleCard",
      "trackId": "content",
      "from": 0,
      "durationInFrames": 90,
      "props": {
        "title": "Q4 2025",
        "subtitle": "Year in Review",
        "alignment": "center",
        "motion": {
          "type": "spring",
          "direction": "up",
          "durationInFrames": 20,
          "springProfile": "gentle"
        }
      }
    }
  ]
}
```

### Frame Math

| Duration | Frames (30fps) |
|----------|---------------|
| 1 second | 30 |
| 3 seconds | 90 |
| 5 seconds | 150 |
| 10 seconds | 300 |
| 30 seconds | 900 |

## Motion Tokens

Every component accepts a `motion` prop to configure its entrance animation:

```typescript
{
  type: "spring" | "tween" | "none",
  direction: "up" | "down" | "left" | "right" | "in" | "out" | "none",
  durationInFrames?: number,       // default: 15
  springProfile?: "snappy" | "default" | "gentle" | "bouncy" | "cinematic",
  delay?: number,                  // frame offset before animation starts
  distance?: number                // travel distance in pixels
}
```

### Spring Profile Guide

| Profile | Damping | Stiffness | Best For |
|---------|---------|-----------|----------|
| `snappy` | 200 | 400 | Data charts, UI buttons |
| `default` | 100 | 200 | General content |
| `gentle` | 80 | 100 | Long text, quotes |
| `bouncy` | 40 | 150 | Logos, icons |
| `cinematic` | 120 | 60 | Full-screen reveals |

## MCP Server

The MCP server allows any MCP-compatible AI client (Claude Desktop, Cursor, custom agents) to control the studio.

### Available Tools (14 total)

**Filesystem** (sandboxed to project root):
- `fs_read_file` — read any project file
- `fs_write_file` — write to src/, public/, examples/
- `fs_list_directory` — browse project structure
- `fs_file_exists` — check file existence
- `fs_delete_file` — delete (destructive, annotated)

**Rendering**:
- `render_validate_timeline` — validate JSON before rendering
- `render_list_compositions` — list registered compositions
- `render_get_status` — check environment readiness
- `render_save_timeline` — save to examples/ + get render command
- `render_build_command` — generate CLI render command

**Documentation**:
- `docs_get_component_catalog` — full component props reference
- `docs_get_motion_tokens` — motion animation reference
- `docs_get_timeline_schema` — JSON schema documentation
- `docs_get_full_reference` — complete bundle (use at session start)

### Connecting AI Agents

The studio's MCP server uses standard `stdio` transport. You can connect various AI agents:

#### 1. Antigravity (Google DeepMind)

Antigravity natively supports MCP over `stdio`. Since Antigravity operates from within your terminal environment, ensure you have the server built:

```bash
bun build src/mcp/server.ts --outdir dist/mcp --target node
```

When instructing Antigravity, you can specify the server script:
> "Run the Remotion Studio MCP server at `dist/mcp/server.js` and generate a video..."

*(Note: Antigravity may automatically discover standard MCP startup scripts or execute it via terminal tools. Ensure `ANTHROPIC_API_KEY` is set in the environment where Antigravity runs if Anthropic models are utilized by the server's internal generation logic.)*

#### 2. Cursor IDE

1. Open Cursor Settings > **Features** > **MCP Servers**
2. Click **+ Add new MCP server**
3. Set **Type** to `command`
4. Set **Name** to `Remotion Studio`
5. Set **Command** to `node /absolute/path/to/remotion-studio/dist/mcp/server.js`

#### 3. Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "remotion-studio": {
      "command": "node",
      "args": ["/path/to/remotion-studio/dist/mcp/server.js"],
      "env": {
        "REMOTION_PROJECT_ROOT": "/path/to/remotion-studio",
        "ANTHROPIC_API_KEY": "sk-ant-..."
      }
    }
  }
}
```

## Adding Custom Components

1. Create your component in `src/remotion/components/<category>/MyComponent.tsx`
2. Export it from `src/remotion/components/<category>/index.ts`
3. Register it in `src/remotion/schema/renderer.tsx` inside `COMPONENT_REGISTRY`
4. Add its TypeScript interface to `src/remotion/schema/types.ts`
5. Add its Zod schema to `src/remotion/schema/timeline.ts`
6. Add it to the discriminated union in `TimelineSchema`
7. Add its documentation to `src/mcp/tools/documentation.ts`

## Design Tokens

The studio uses a brand-agnostic token system. Override these in `src/remotion/tokens/` to match any brand:

```typescript
// colors.ts — change primary/accent to match brand
export const colors = {
  primary: { 500: "#your-brand-color" },
  accent:  { 500: "#your-accent-color" },
};

// typography.ts — change font families
export const typography = {
  fontFamily: {
    display: '"YourBrandFont", sans-serif',
  },
};
```

## Project Structure

```
remotion-studio/
├── src/
│   ├── remotion/                    # Remotion video layer
│   │   ├── Root.tsx                 # Composition registry
│   │   ├── components/              # 15 pre-built components
│   │   │   ├── text/                # TitleCard, SubtitleCard, LowerThird, Caption
│   │   │   ├── data/                # BarChart, LineChart, StatCounter, ProgressRing
│   │   │   ├── media/               # ImageReveal, VideoBackground, SplitScreen, LogoAnimation
│   │   │   └── transitions/         # FadeTransition, SlideTransition, ZoomTransition
│   │   ├── tokens/                  # Design tokens (colors, typography, motion)
│   │   └── schema/                  # Zod schemas + JSON→React renderer
│   ├── mcp/                         # MCP Server
│   │   ├── server.ts                # 14 registered tools, stdio transport
│   │   └── tools/                   # filesystem, rendering, documentation
│   └── agent/                       # AI Agent layer
│       ├── generate.ts              # Claude API + structured output generation
│       ├── prompts.ts               # System prompt + ReAct instructions
│       └── cli.ts                   # Command-line interface
├── examples/                        # Saved JSON timelines
│   └── demo-timeline.json
├── public/                          # Static assets (fonts, images)
├── remotion.config.ts
├── tailwind.config.ts
└── package.json
```

## Security Model

The MCP server enforces a strict sandbox:
- **Read**: Any file within the project root
- **Write**: Restricted to `src/`, `public/`, `examples/` only
- **Path traversal**: Blocked — all paths resolved relative to project root
- **System access**: Denied — no access to user home, `/etc`, or other system paths

The JSON timeline schema adds another safety layer:
- Components must be in the registry (no arbitrary code execution)
- All props are Zod-validated before rendering
- Invalid timelines are rejected before reaching the renderer

## License

MIT
