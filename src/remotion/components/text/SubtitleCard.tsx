import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { typography, surfaces } from "../../tokens";
import type { SubtitleCardProps } from "../../schema/types";

export const SubtitleCard: React.FC<SubtitleCardProps> = ({
  text,
  alignment = "center",
  fontSize = 36,
  color,
  maxWidth = 900,
  backgroundColor,
  opacity = 1,
  motion = { type: "spring", direction: "up", durationInFrames: 12 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 200, mass: 1 },
    durationInFrames: motion.durationInFrames ?? 12,
  });

  const translateY = interpolate(progress, [0, 1], [24, 0]);
  const opacityAnim = interpolate(progress, [0, 1], [0, opacity]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: backgroundColor ?? "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 12%",
      }}
    >
      <p
        style={{
          fontFamily: typography.fontFamily.body,
          fontSize,
          fontWeight: typography.fontWeight.regular,
          color: color ?? surfaces.text,
          textAlign: alignment,
          maxWidth,
          lineHeight: typography.lineHeight.relaxed,
          margin: 0,
          padding: 0,
          transform: `translateY(${translateY}px)`,
          opacity: opacityAnim,
        }}
      >
        {text}
      </p>
    </AbsoluteFill>
  );
};
