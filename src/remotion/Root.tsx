import React from "react";
import { Composition } from "remotion";
import { TimelineRenderer } from "./schema/renderer";
import { TimelineSchema } from "./schema/timeline";
import type { Timeline } from "./schema/timeline";
import { COMPOSITIONS } from "./compositions";

// ─── Composition cast ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TimelineComposition = TimelineRenderer as React.ComponentType<any>;

// ─── Root ─────────────────────────────────────────────────────────────────────

export const RemotionRoot: React.FC = () => (
  <>
    {/* Dynamic agent composition — pass ?timeline=<json> via --props */}
    <Composition
      id="AgentComposition"
      component={TimelineComposition}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ timeline: COMPOSITIONS[0]!.timeline as unknown as Timeline }}
      calculateMetadata={({ props }) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const t = TimelineSchema.parse((props as any).timeline);
          return {
            durationInFrames: t.durationInFrames,
            fps: t.fps,
            width: t.width,
            height: t.height,
            props: { timeline: t },
          };
        } catch {
          return {};
        }
      }}
    />

    {/* Auto-registered compositions from the registry */}
    {COMPOSITIONS.map((c) => (
      <Composition
        key={c.id}
        id={c.id}
        component={TimelineComposition}
        durationInFrames={c.timeline.durationInFrames}
        fps={c.timeline.fps}
        width={c.timeline.width}
        height={c.timeline.height}
        defaultProps={{ timeline: c.timeline }}
      />
    ))}
  </>
);
