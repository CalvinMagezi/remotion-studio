import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { FadeTransitionProps } from "../../schema/types";

export const FadeTransition: React.FC<FadeTransitionProps> = ({
  durationInFrames = 15,
  color = "#000000",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames: totalFrames } = useVideoConfig();

  // Fade in then fade out
  const mid = durationInFrames / 2;
  const opacity =
    frame < mid
      ? interpolate(frame, [0, mid], [0, 1])
      : interpolate(frame, [mid, durationInFrames], [1, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: color, opacity }} />
  );
};
