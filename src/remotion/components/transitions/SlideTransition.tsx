import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { SlideTransitionProps } from "../../schema/types";

export const SlideTransition: React.FC<SlideTransitionProps> = ({
  direction = "left",
  durationInFrames = 20,
  color = "#0f172a",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const mid = Math.floor(durationInFrames / 2);

  // Slide in
  const inProgress = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 500, mass: 0.5 },
    durationInFrames: mid,
  });

  // Slide out
  const outProgress = spring({
    frame: Math.max(0, frame - mid),
    fps,
    config: { damping: 200, stiffness: 500, mass: 0.5 },
    durationInFrames: mid,
  });

  const isVertical = direction === "up" || direction === "down";

  const inTranslate = interpolate(
    inProgress,
    [0, 1],
    [
      direction === "left" || direction === "up" ? 100 : -100,
      0,
    ]
  );

  const outTranslate = interpolate(
    outProgress,
    [0, 1],
    [
      0,
      direction === "left" || direction === "up" ? -100 : 100,
    ]
  );

  const translate = frame < mid ? inTranslate : outTranslate;
  const transform = isVertical
    ? `translateY(${translate}%)`
    : `translateX(${translate}%)`;

  return (
    <AbsoluteFill style={{ backgroundColor: color, transform }} />
  );
};
