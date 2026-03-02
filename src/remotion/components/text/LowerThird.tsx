import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { typography, colors, surfaces } from "../../tokens";
import type { LowerThirdProps } from "../../schema/types";

export const LowerThird: React.FC<LowerThirdProps> = ({
  name,
  title,
  accentColor = colors.primary[500],
  textColor = surfaces.text,
  position = "bottom-left",
  backgroundColor,
  opacity = 1,
  motion = { type: "spring", direction: "left", durationInFrames: 18 },
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const isVertical = height > width;
  // Auto-scale to ~4% of short side
  const baseFontSize = Math.round(Math.min(width, height) * 0.040);

  const progress = spring({
    frame,
    fps,
    config: { damping: 180, stiffness: 380, mass: 0.6 },
    durationInFrames: motion.durationInFrames ?? 18,
  });

  const isRight = position.endsWith("right");
  const slideX = isRight
    ? interpolate(progress, [0, 1], [80, 0])
    : interpolate(progress, [0, 1], [-80, 0]);

  const fadeOp = interpolate(progress, [0, 1], [0, opacity]);
  const dotScale = interpolate(progress, [0, 1], [0, 1]);

  // Positioning offsets
  const isBottom = position.startsWith("bottom");
  const edgeInset = isVertical ? width * 0.06 : width * 0.05;
  const vertInset = isVertical ? height * 0.07 : height * 0.08;

  return (
    <AbsoluteFill style={{ backgroundColor: backgroundColor ?? "transparent" }}>
      <div
        style={{
          position: "absolute",
          bottom:  isBottom ? vertInset : undefined,
          top:    !isBottom ? vertInset : undefined,
          left:   !isRight  ? edgeInset : undefined,
          right:   isRight  ? edgeInset : undefined,
          transform: `translateX(${slideX}px)`,
          opacity: fadeOp,
        }}
      >
        {/* Pill container */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: baseFontSize * 0.55,
            backgroundColor: "rgba(15,23,42,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderRadius: 100,
            border: `1px solid rgba(255,255,255,0.12)`,
            padding: `${baseFontSize * 0.5}px ${baseFontSize * 0.9}px`,
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          {/* Animated dot */}
          <div
            style={{
              width: baseFontSize * 0.55,
              height: baseFontSize * 0.55,
              borderRadius: "50%",
              backgroundColor: accentColor,
              flexShrink: 0,
              transform: `scale(${dotScale})`,
              boxShadow: `0 0 ${baseFontSize * 0.8}px ${accentColor}88`,
            }}
          />
          {/* Text */}
          <div style={{ display: "flex", flexDirection: "column", gap: baseFontSize * 0.12 }}>
            <span
              style={{
                fontFamily: typography.fontFamily.display,
                fontSize: baseFontSize,
                fontWeight: typography.fontWeight.bold,
                color: textColor,
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </span>
            {title && (
              <span
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: baseFontSize * 0.68,
                  fontWeight: typography.fontWeight.medium,
                  color: accentColor,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </span>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
