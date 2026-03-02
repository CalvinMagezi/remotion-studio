import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { typography, colors, surfaces } from "../../tokens";
import type { StatCounterProps } from "../../schema/types";

export const StatCounter: React.FC<StatCounterProps> = ({
  value,
  label,
  prefix = "",
  suffix = "",
  color = colors.primary[400],
  fontSize,
  decimals = 0,
  backgroundColor,
  opacity = 1,
  accentColor,
  motion = { type: "spring", direction: "up", durationInFrames: 30 },
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isVertical = height > width;
  const resolvedFontSize = fontSize ?? Math.round(Math.min(width, height) * 0.14);
  const resolvedAccent   = accentColor ?? color;

  const progress = spring({
    frame,
    fps,
    config: { damping: 70, stiffness: 90, mass: 1.3 },
    durationInFrames: motion.durationInFrames ?? 30,
  });

  const cardProgress = spring({
    frame,
    fps,
    config: { damping: 120, stiffness: 200, mass: 1 },
    durationInFrames: 18,
  });

  const currentValue  = interpolate(progress, [0, 1], [0, value]);
  const cardOpacity   = interpolate(cardProgress, [0, 1], [0, opacity]);
  const cardY         = interpolate(cardProgress, [0, 1], [30, 0]);
  const numOpacity    = interpolate(progress, [0, 1], [0, opacity]);
  const glowSpread    = interpolate(progress, [0, 1], [0, 1]);

  const padH  = isVertical ? width  * 0.10 : width  * 0.06;
  const padV  = isVertical ? height * 0.04 : height * 0.06;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: backgroundColor ?? "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `${padV}px ${padH}px`,
      }}
    >
      {/* Card */}
      <div
        style={{
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
          backgroundColor: "rgba(15,23,42,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: `1px solid ${resolvedAccent}44`,
          borderRadius: 20,
          padding: `${resolvedFontSize * 0.55}px ${resolvedFontSize * 0.9}px`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: resolvedFontSize * 0.18,
          boxShadow: `0 0 ${resolvedFontSize * glowSpread}px ${resolvedAccent}33, 0 20px 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Number */}
        <div
          style={{
            opacity: numOpacity,
            fontFamily: typography.fontFamily.mono,
            fontSize: resolvedFontSize,
            fontWeight: typography.fontWeight.black,
            color: resolvedAccent,
            lineHeight: 1,
            letterSpacing: -0.04 * resolvedFontSize,
            textShadow: `0 0 ${resolvedFontSize * 0.5}px ${resolvedAccent}66`,
          }}
        >
          {prefix}
          {currentValue.toFixed(decimals)}
          {suffix}
        </div>

        {/* Divider */}
        <div
          style={{
            width: `${interpolate(progress, [0, 1], [0, 60])}%`,
            height: 1,
            backgroundColor: `${resolvedAccent}44`,
          }}
        />

        {/* Label */}
        <div
          style={{
            opacity: numOpacity,
            fontFamily: typography.fontFamily.body,
            fontSize: resolvedFontSize * 0.24,
            fontWeight: typography.fontWeight.medium,
            color: surfaces.textMuted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
