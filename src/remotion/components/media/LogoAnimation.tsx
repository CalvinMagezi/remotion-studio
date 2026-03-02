import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { typography, surfaces, springs } from "../../tokens";
import type { LogoAnimationProps } from "../../schema/types";

export const LogoAnimation: React.FC<LogoAnimationProps> = ({
  src,
  size = 220,
  springProfile = "bouncy",
  showText = false,
  text,
  textColor = surfaces.text,
  backgroundColor,
  opacity = 1,
  motion = { type: "spring", direction: "in", durationInFrames: 30 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const profile =
    springs[springProfile as keyof typeof springs] ?? springs.bouncy;

  const progress = spring({
    frame,
    fps,
    config: profile,
    durationInFrames: motion.durationInFrames ?? 30,
  });

  const scale = interpolate(progress, [0, 1], [0.3, 1]);
  const opacityAnim = interpolate(progress, [0, 1], [0, opacity]);
  const textProgress = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: springs.gentle,
    durationInFrames: 20,
  });
  const textOpacity = interpolate(textProgress, [0, 1], [0, 1]);
  const textY = interpolate(textProgress, [0, 1], [12, 0]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: backgroundColor ?? "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity: opacityAnim,
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Img
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
      {showText && text && (
        <div
          style={{
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            fontFamily: typography.fontFamily.display,
            fontSize: size * 0.18,
            fontWeight: typography.fontWeight.bold,
            color: textColor,
            letterSpacing: -0.02 * size * 0.18,
          }}
        >
          {text}
        </div>
      )}
    </AbsoluteFill>
  );
};
