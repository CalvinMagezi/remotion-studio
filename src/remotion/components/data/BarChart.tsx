import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { typography, colors, surfaces } from "../../tokens";
import type { BarChartProps } from "../../schema/types";

export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  maxValue,
  barColor = colors.primary[500],
  accentColor = colors.accent[500],
  showValues = true,
  horizontal = false,
  backgroundColor = surfaces.backgroundLight,
  opacity = 1,
  motion = { type: "spring", direction: "in", durationInFrames: 30 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const max = maxValue ?? Math.max(...data.map((d) => d.value));

  const containerProgress = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 200, mass: 1 },
    durationInFrames: motion.durationInFrames ?? 30,
  });

  const containerOpacity = interpolate(containerProgress, [0, 1], [0, opacity]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: backgroundColor ?? surfaces.backgroundLight,
        padding: "6% 8%",
        opacity: containerOpacity,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {title && (
        <h2
          style={{
            fontFamily: typography.fontFamily.display,
            fontSize: 32,
            fontWeight: typography.fontWeight.semibold,
            color: surfaces.text,
            margin: 0,
            marginBottom: 40,
          }}
        >
          {title}
        </h2>
      )}
      <div
        style={{
          display: "flex",
          flexDirection: horizontal ? "column" : "row",
          alignItems: horizontal ? "stretch" : "flex-end",
          justifyContent: "space-around",
          gap: 12,
          flex: 1,
        }}
      >
        {data.map((item, i) => {
          const barDelay = i * 3;
          const barProgress = spring({
            frame: Math.max(0, frame - barDelay),
            fps,
            config: { damping: 100, stiffness: 200, mass: 1 },
            durationInFrames: motion.durationInFrames ?? 30,
          });

          const barFill = interpolate(barProgress, [0, 1], [0, item.value / max]);

          if (horizontal) {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: typography.fontFamily.body,
                    fontSize: 18,
                    color: surfaces.textMuted,
                    minWidth: 120,
                    flexShrink: 0,
                  }}
                >
                  {item.label}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 36,
                    backgroundColor: surfaces.surface,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${barFill * 100}%`,
                      height: "100%",
                      backgroundColor: item.color ?? barColor,
                      borderRadius: 4,
                    }}
                  />
                </div>
                {showValues && (
                  <span
                    style={{
                      fontFamily: typography.fontFamily.mono,
                      fontSize: 18,
                      color: surfaces.text,
                      fontWeight: typography.fontWeight.semibold,
                      minWidth: 60,
                      textAlign: "right",
                    }}
                  >
                    {item.value}
                  </span>
                )}
              </div>
            );
          }

          return (
            <div
              key={i}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                maxWidth: 120,
              }}
            >
              {showValues && (
                <span
                  style={{
                    fontFamily: typography.fontFamily.mono,
                    fontSize: 20,
                    fontWeight: typography.fontWeight.bold,
                    color: surfaces.text,
                    marginBottom: 8,
                  }}
                >
                  {item.value}
                </span>
              )}
              <div
                style={{
                  width: "100%",
                  height: 300,
                  display: "flex",
                  alignItems: "flex-end",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${barFill * 100}%`,
                    backgroundColor: item.color ?? (i === 0 ? accentColor : barColor),
                    borderRadius: "6px 6px 0 0",
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: typography.fontFamily.body,
                  fontSize: 16,
                  color: surfaces.textMuted,
                  marginTop: 10,
                  textAlign: "center",
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
