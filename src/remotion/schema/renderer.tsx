import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import {
  TitleCard,
  SubtitleCard,
  LowerThird,
  Caption,
  BarChart,
  LineChart,
  StatCounter,
  ProgressRing,
  ImageReveal,
  VideoBackground,
  SplitScreen,
  LogoAnimation,
  FadeTransition,
  SlideTransition,
  ZoomTransition,
} from "../components";
import { CodeBlock } from "../components/text/CodeBlock";
import type { Timeline, Clip } from "./timeline";
import type { LayoutZone } from "./types";

// ─── Component Registry ──────────────────────────────────────────────────────
// Maps component string ID → React component
// Add new components here to extend the registry

const COMPONENT_REGISTRY: Record<string, React.ComponentType<any>> = {
  TitleCard,
  SubtitleCard,
  LowerThird,
  Caption,
  CodeBlock,
  BarChart,
  LineChart,
  StatCounter,
  ProgressRing,
  ImageReveal,
  VideoBackground,
  SplitScreen,
  LogoAnimation,
  FadeTransition,
  SlideTransition,
  ZoomTransition,
};

// ─── Single Clip Renderer ────────────────────────────────────────────────────

const ClipRenderer: React.FC<{ clip: Clip }> = ({ clip }) => {
  const Component = COMPONENT_REGISTRY[clip.component];

  if (!Component) {
    console.warn(
      `[RemotionStudio] Unknown component: "${clip.component}". Skipping clip "${clip.id}".`
    );
    return null;
  }

  // Extract layout zone from props (not passed down to component itself)
  const { layout, ...componentProps } = clip.props as { layout?: LayoutZone; [key: string]: unknown };

  const inner = <Component {...componentProps} />;

  return (
    <Sequence from={clip.from} durationInFrames={clip.durationInFrames} name={clip.id}>
      {layout ? (
        // Render inside a positioned sub-region of the canvas
        <div
          style={{
            position: "absolute",
            left: `${layout.x * 100}%`,
            top: `${layout.y * 100}%`,
            width: `${layout.width * 100}%`,
            height: `${layout.height * 100}%`,
            overflow: "hidden",
          }}
        >
          {inner}
        </div>
      ) : (
        inner
      )}
    </Sequence>
  );
};

// ─── Timeline Renderer ───────────────────────────────────────────────────────
// Renders a full Timeline JSON spec as a Remotion composition

export interface TimelineRendererProps {
  timeline: Timeline;
}

export const TimelineRenderer: React.FC<TimelineRendererProps> = ({
  timeline,
}) => {
  // Sort clips by track zIndex (lower zIndex renders first = behind)
  const trackZIndex = new Map(
    timeline.tracks.map((t) => [t.id, t.zIndex ?? 0])
  );
  const hiddenTracks = new Set(
    timeline.tracks.filter((t) => t.hidden).map((t) => t.id)
  );

  const sortedClips = [...timeline.clips]
    .filter((clip) => !hiddenTracks.has(clip.trackId))
    .sort(
      (a, b) =>
        (trackZIndex.get(a.trackId) ?? 0) - (trackZIndex.get(b.trackId) ?? 0)
    );

  // Resolve audio src: treat paths without a protocol as relative to public/
  const audioSrc = timeline.audio?.src
    ? timeline.audio.src.startsWith("http")
      ? timeline.audio.src
      : staticFile(timeline.audio.src)
    : null;

  return (
    <AbsoluteFill style={{ backgroundColor: timeline.backgroundColor ?? "#0f172a" }}>
      {/* Background audio track */}
      {audioSrc && !timeline.audio?.muted && (
        <Audio
          src={audioSrc}
          volume={timeline.audio?.volume ?? 1}
          startFrom={timeline.audio?.startFrom ?? 0}
        />
      )}

      {sortedClips.map((clip) => (
        <ClipRenderer key={clip.id} clip={clip} />
      ))}
    </AbsoluteFill>
  );
};

// ─── Registry Helpers ────────────────────────────────────────────────────────

/** Returns a list of all registered component IDs — useful for the agent's system prompt */
export function getRegisteredComponentIds(): string[] {
  return Object.keys(COMPONENT_REGISTRY);
}

/** Check if a component ID is valid */
export function isValidComponent(id: string): boolean {
  return id in COMPONENT_REGISTRY;
}
