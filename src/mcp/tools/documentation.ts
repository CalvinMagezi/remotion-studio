// Documentation tool — provides component catalog and API reference to the agent

const COMPONENT_CATALOG = {
  TitleCard: {
    description: "Full-screen animated title with optional subtitle. Best for scene openers.",
    requiredProps: ["title"],
    optionalProps: {
      subtitle: "string — secondary line below the title",
      alignment: '"left" | "center" | "right" — default: "center"',
      fontSize: "number — title font size in pixels, default ~80",
      color: "string — CSS color for title text",
      fontWeight: "number — font weight, default 700",
      motion: "MotionToken — entrance animation config",
    },
    example: {
      id: "my-title",
      component: "TitleCard",
      trackId: "main",
      from: 0,
      durationInFrames: 90,
      props: { title: "Hello World", subtitle: "A Remotion Studio demo", alignment: "center" },
    },
  },
  SubtitleCard: {
    description: "Centered body text overlay. Use for descriptions, quotes, or explanatory text.",
    requiredProps: ["text"],
    optionalProps: {
      alignment: '"left" | "center" | "right"',
      fontSize: "number — default 36",
      color: "string — CSS color",
      maxWidth: "number — max width in pixels, default 900",
      motion: "MotionToken",
    },
    example: {
      id: "subtitle-1",
      component: "SubtitleCard",
      trackId: "main",
      from: 30,
      durationInFrames: 60,
      props: { text: "Building the future of programmatic video", fontSize: 40 },
    },
  },
  LowerThird: {
    description: "Professional broadcast-style name chyron/lower-third graphic.",
    requiredProps: ["name"],
    optionalProps: {
      title: "string — job title shown below the name",
      accentColor: "string — color of the accent bar, default brand blue",
      textColor: "string — text color",
      position: '"bottom-left" | "bottom-right" | "top-left" | "top-right"',
      motion: "MotionToken",
    },
    example: {
      id: "lt-1",
      component: "LowerThird",
      trackId: "overlay",
      from: 15,
      durationInFrames: 70,
      props: { name: "Jane Smith", title: "CEO", position: "bottom-left" },
    },
  },
  Caption: {
    description: "Subtitle/caption bar at top or bottom of frame.",
    requiredProps: ["text"],
    optionalProps: {
      position: '"top" | "bottom" — default: "bottom"',
      fontSize: "number — default 22",
      backgroundColor: "string — default semi-transparent black",
      textColor: "string",
      motion: "MotionToken",
    },
  },
  BarChart: {
    description: "Animated bar chart. Supports vertical (default) and horizontal layouts.",
    requiredProps: ["data"],
    optionalProps: {
      data: "Array of { label: string, value: number, color?: string } — max 20 items",
      title: "string — chart title",
      maxValue: "number — override the automatic max",
      barColor: "string — default primary blue",
      showValues: "boolean — show value labels, default true",
      horizontal: "boolean — horizontal bars, default false",
      motion: "MotionToken",
    },
    example: {
      id: "bar-1",
      component: "BarChart",
      trackId: "data",
      from: 0,
      durationInFrames: 120,
      props: {
        title: "Monthly Sales",
        data: [
          { label: "Jan", value: 42000 },
          { label: "Feb", value: 38000 },
          { label: "Mar", value: 61000 },
        ],
      },
    },
  },
  LineChart: {
    description: "Animated line chart that progressively draws the line.",
    requiredProps: ["data"],
    optionalProps: {
      title: "string",
      lineColor: "string",
      fillColor: "string — area fill color (optional)",
      showPoints: "boolean — show dot markers, default true",
      smooth: "boolean — use bezier smoothing, default true",
      motion: "MotionToken",
    },
  },
  StatCounter: {
    description: "Large animated number that counts up from 0 to the target value.",
    requiredProps: ["value", "label"],
    optionalProps: {
      prefix: 'string — e.g. "$" or "+"',
      suffix: 'string — e.g. "%" or "k"',
      color: "string — number color",
      fontSize: "number — default 120",
      decimals: "number — decimal places, default 0",
      motion: "MotionToken",
    },
  },
  ProgressRing: {
    description: "SVG circular progress ring that animates to the target percentage.",
    requiredProps: ["percentage"],
    optionalProps: {
      label: "string — text below the ring",
      size: "number — diameter in pixels, default 200",
      strokeWidth: "number — ring thickness, default 16",
      color: "string — ring color",
      trackColor: "string — unfilled track color",
      showPercentage: "boolean — show % inside ring, default true",
      motion: "MotionToken",
    },
  },
  ImageReveal: {
    description: "Reveals an image with a directional wipe or fade animation.",
    requiredProps: ["src"],
    optionalProps: {
      revealDirection: '"left" | "right" | "top" | "bottom" | "fade" — default: "fade"',
      objectFit: '"cover" | "contain" | "fill" — default: "cover"',
      overlay: "boolean — dark overlay on top",
      overlayColor: "string",
      overlayOpacity: "number 0-1",
      motion: "MotionToken",
    },
  },
  VideoBackground: {
    description: "Full-bleed background video with optional overlay.",
    requiredProps: ["src"],
    optionalProps: {
      playbackRate: "number 0.1–4, default 1",
      muted: "boolean — default true",
      loop: "boolean — default true",
      overlay: "boolean",
      overlayColor: "string",
      overlayOpacity: "number 0-1",
      motion: "MotionToken",
    },
  },
  SplitScreen: {
    description: "Splits the canvas into two halves with independent content.",
    requiredProps: ["leftContent", "rightContent"],
    optionalProps: {
      leftContent: '{ type: "image"|"color"|"text", value: string }',
      rightContent: '{ type: "image"|"color"|"text", value: string }',
      splitRatio: "number 0.1–0.9, default 0.5",
      splitDirection: '"vertical" | "horizontal"',
      gap: "number — gap in pixels between panels",
      motion: "MotionToken",
    },
  },
  LogoAnimation: {
    description: "Logo image that bounces in with spring physics, with optional text label.",
    requiredProps: ["src"],
    optionalProps: {
      size: "number — logo width/height in pixels, default 220",
      springProfile: '"snappy" | "default" | "gentle" | "bouncy" | "cinematic"',
      showText: "boolean — show text below logo",
      text: "string",
      textColor: "string",
      motion: "MotionToken",
    },
  },
  FadeTransition: {
    description: "Fades to a solid color and back — use between scenes.",
    requiredProps: [],
    optionalProps: {
      durationInFrames: "number — total transition duration, default 15",
      color: 'string — fade color, default "#000000"',
    },
  },
  SlideTransition: {
    description: "Slides a color panel across the screen to transition between scenes.",
    requiredProps: [],
    optionalProps: {
      direction: '"left" | "right" | "up" | "down"',
      durationInFrames: "number — default 20",
      color: "string",
    },
  },
  ZoomTransition: {
    description: "Zoom in or out transition between scenes.",
    requiredProps: [],
    optionalProps: {
      direction: '"in" | "out"',
      durationInFrames: "number — default 20",
      color: "string",
    },
  },
};

const MOTION_TOKEN_DOCS = `
# MotionToken

Every component accepts an optional \`motion\` prop that controls its entrance animation:

\`\`\`typescript
interface MotionToken {
  type: "spring" | "tween" | "none";         // animation physics model
  direction: "up"|"down"|"left"|"right"|"in"|"out"|"none";  // entrance direction
  durationInFrames?: number;                  // animation duration (frames)
  springProfile?: "snappy"|"default"|"gentle"|"bouncy"|"cinematic"; // spring preset
  easing?: "easeIn"|"easeOut"|"easeInOut"|"linear"|"sharp"|"emphasized";
  delay?: number;                             // frame delay before animation starts
  distance?: number;                          // travel distance in pixels
}
\`\`\`

## Spring Profiles
- **snappy** — fast, stiff, good for UI buttons and quick reveals
- **default** — balanced, works for most content
- **gentle** — slow and smooth, good for text
- **bouncy** — overshoots and bounces back, good for logos
- **cinematic** — very slow and weighty, good for full-screen reveals
`;

const TIMELINE_SCHEMA_DOCS = `
# Timeline JSON Schema

The AI agent outputs a Timeline JSON object with this structure:

\`\`\`typescript
{
  id: string;                    // unique ID for the composition
  title?: string;                // human-readable title
  fps: number;                   // 30 recommended
  width: number;                 // 1920 for 16:9 HD
  height: number;                // 1080 for 16:9 HD  
  durationInFrames: number;      // total length (fps × seconds)
  backgroundColor?: string;      // canvas background, default "#0f172a"
  tracks: Track[];               // logical z-index layers
  clips: Clip[];                 // components placed on the timeline
}

Track {
  id: string;         // referenced by clips
  label?: string;     // human name
  zIndex?: number;    // render order (higher = on top)
  hidden?: boolean;
}

Clip {
  id: string;               // unique clip ID
  component: ComponentId;   // one of the 15 registered components
  trackId: string;          // must match a track.id
  from: number;             // start frame
  durationInFrames: number; // clip duration
  props: ComponentProps;    // component-specific props (see catalog)
}
\`\`\`

## Frame Math
- 1 second = fps frames (use fps=30 unless specified)
- 5 second clip: durationInFrames: 150
- Start at 2 seconds: from: 60
- Overlapping clips render in zIndex order
`;

export function docs_get_component_catalog(args: { component?: string }): string {
  if (args.component) {
    const info = COMPONENT_CATALOG[args.component as keyof typeof COMPONENT_CATALOG];
    if (!info) {
      return JSON.stringify({
        error: `Unknown component: "${args.component}"`,
        available: Object.keys(COMPONENT_CATALOG),
      });
    }
    return JSON.stringify({ component: args.component, ...info });
  }

  return JSON.stringify({
    components: Object.entries(COMPONENT_CATALOG).map(([id, info]) => ({
      id,
      description: info.description,
      requiredProps: info.requiredProps,
    })),
    total: Object.keys(COMPONENT_CATALOG).length,
  });
}

export function docs_get_motion_tokens(args: {}): string {
  return JSON.stringify({ documentation: MOTION_TOKEN_DOCS });
}

export function docs_get_timeline_schema(args: {}): string {
  return JSON.stringify({ documentation: TIMELINE_SCHEMA_DOCS });
}

export function docs_get_full_reference(args: {}): string {
  return JSON.stringify({
    componentCatalog: COMPONENT_CATALOG,
    motionTokens: MOTION_TOKEN_DOCS,
    timelineSchema: TIMELINE_SCHEMA_DOCS,
  });
}
