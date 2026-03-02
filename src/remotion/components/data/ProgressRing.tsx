import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { typography, colors, surfaces } from "../../tokens";
import type { ProgressRingProps } from "../../schema/types";

export const ProgressRing: React.FC<ProgressRingProps> = ({
  percentage,
  label,
  size = 200,
  strokeWidth = 16,
  color = colors.primary[500],
  trackColor = surfaces.surface,
  showPercentage = true,
  backgroundColor,
  opacity = 1,
  motion = { type: "spring", direction: "in", durationInFrames: 40 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 80, stiffness: 80, mass: 1.5 },
    durationInFrames: motion.durationInFrames ?? 40,
  });

  const animatedPct = interpolate(progress, [0, 1], [0, percentage]);
  const opacityAnim = interpolate(progress, [0, 1], [0, opacity]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPct / 100) * circumference;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: backgroundColor ?? "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: opacityAnim,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {showPercentage && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: typography.fontFamily.mono,
                fontSize: size * 0.22,
                fontWeight: typography.fontWeight.bold,
                color: surfaces.text,
              }}
            >
              {Math.round(animatedPct)}%
            </span>
          </div>
        )}
      </div>
      {label && (
        <div
          style={{
            fontFamily: typography.fontFamily.body,
            fontSize: size * 0.1,
            fontWeight: typography.fontWeight.medium,
            color: surfaces.textMuted,
            marginTop: 16,
            textAlign: "center",
          }}
        >
          {label}
        </div>
      )}
    </AbsoluteFill>
  );
};
