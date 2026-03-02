import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ZoomTransitionProps } from "../../schema/types";

export const ZoomTransition: React.FC<ZoomTransitionProps> = ({
  direction = "in",
  durationInFrames = 20,
  color = "#0f172a",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mid = Math.floor(durationInFrames / 2);

  const inProgress = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 400, mass: 0.6 },
    durationInFrames: mid,
  });

  const outProgress = spring({
    frame: Math.max(0, frame - mid),
    fps,
    config: { damping: 200, stiffness: 400, mass: 0.6 },
    durationInFrames: mid,
  });

  const scale =
    frame < mid
      ? interpolate(inProgress, [0, 1], direction === "in" ? [0, 1] : [2, 1])
      : interpolate(outProgress, [0, 1], direction === "in" ? [1, 2] : [1, 0]);

  const opacity =
    frame < mid
      ? interpolate(inProgress, [0, 1], [0, 1])
      : interpolate(outProgress, [0, 1], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: color,
        transform: `scale(${scale})`,
        opacity,
      }}
    />
  );
};
