import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { typography, colors, surfaces } from "../../tokens";
import type { LineChartProps } from "../../schema/types";

export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  lineColor = colors.primary[400],
  fillColor,
  showPoints = true,
  smooth = true,
  backgroundColor = surfaces.backgroundLight,
  opacity = 1,
  motion = { type: "spring", direction: "in", durationInFrames: 40 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 150, mass: 1 },
    durationInFrames: motion.durationInFrames ?? 40,
  });

  const containerOpacity = interpolate(progress, [0, 1], [0, opacity]);
  const drawProgress = interpolate(progress, [0, 1], [0, 1]);

  const svgWidth = 900;
  const svgHeight = 380;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };

  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const minValue = Math.min(...data.map((d) => d.value));
  const maxValue = Math.max(...data.map((d) => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartWidth,
    y: padding.top + chartHeight - ((d.value - minValue) / range) * chartHeight,
  }));

  // Build path string - draw up to current progress
  const visibleCount = Math.max(2, Math.ceil(drawProgress * data.length));
  const visiblePoints = points.slice(0, visibleCount);

  let pathD = "";
  if (smooth && visiblePoints.length > 2) {
    pathD = visiblePoints.reduce((acc, point, i) => {
      if (i === 0) return `M ${point.x},${point.y}`;
      const prev = visiblePoints[i - 1];
      const cpX = (prev.x + point.x) / 2;
      return `${acc} C ${cpX},${prev.y} ${cpX},${point.y} ${point.x},${point.y}`;
    }, "");
  } else {
    pathD = visiblePoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x},${p.y}`).join(" ");
  }

  const fillPath = pathD
    ? `${pathD} L ${visiblePoints[visiblePoints.length - 1].x},${padding.top + chartHeight} L ${padding.left},${padding.top + chartHeight} Z`
    : "";

  return (
    <AbsoluteFill
      style={{
        backgroundColor,
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
            marginBottom: 32,
          }}
        >
          {title}
        </h2>
      )}
      <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: "visible" }}>
        {/* Gridlines */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padding.left}
            y1={padding.top + chartHeight * (1 - t)}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight * (1 - t)}
            stroke={surfaces.border}
            strokeWidth={1}
            strokeDasharray="6,6"
          />
        ))}
        {/* Fill area */}
        {fillColor && pathD && (
          <path d={fillPath} fill={fillColor} opacity={0.15} />
        )}
        {/* Line */}
        {pathD && (
          <path d={pathD} fill="none" stroke={lineColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        )}
        {/* Points */}
        {showPoints &&
          visiblePoints.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={6} fill={lineColor} />
          ))}
        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={padding.left + (i / (data.length - 1)) * chartWidth}
            y={svgHeight - 4}
            textAnchor="middle"
            fontSize={14}
            fill={surfaces.textMuted}
            fontFamily={typography.fontFamily.body}
          >
            {d.label}
          </text>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
