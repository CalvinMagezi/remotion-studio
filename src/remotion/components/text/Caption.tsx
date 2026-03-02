import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { typography, surfaces } from "../../tokens";
import type { CaptionProps } from "../../schema/types";

export const Caption: React.FC<CaptionProps> = ({
  text,
  position = "bottom",
  fontSize = 22,
  backgroundColor = "rgba(0,0,0,0.7)",
  textColor = surfaces.text,
  opacity = 1,
  motion = { type: "spring", direction: "up", durationInFrames: 10 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 400, mass: 0.5 },
    durationInFrames: motion.durationInFrames ?? 10,
  });

  const translateY = interpolate(
    progress,
    [0, 1],
    [position === "bottom" ? 20 : -20, 0]
  );
  const opacityAnim = interpolate(progress, [0, 1], [0, opacity]);

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          [position]: 0,
          left: 0,
          right: 0,
          padding: "20px 8%",
          backgroundColor,
          transform: `translateY(${translateY}px)`,
          opacity: opacityAnim,
        }}
      >
        <p
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize,
            fontWeight: typography.fontWeight.regular,
            color: textColor,
            textAlign: "center",
            margin: 0,
            padding: 0,
            lineHeight: typography.lineHeight.normal,
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};
