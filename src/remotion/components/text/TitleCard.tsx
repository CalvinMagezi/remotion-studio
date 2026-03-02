import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { typography, surfaces } from "../../tokens";
import type { TitleCardProps } from "../../schema/types";

export const TitleCard: React.FC<TitleCardProps> = ({
  title,
  subtitle,
  alignment = "center",
  fontSize,
  color,
  fontWeight,
  letterSpacing,
  backgroundColor,
  opacity = 1,
  eyebrow,
  accentColor = "#38bdf8",
  motion = { type: "spring", direction: "up", durationInFrames: 20 },
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Staggered entrance: eyebrow → title → subtitle
  const makeSpring = (delayFrames: number) =>
    spring({
      frame: Math.max(0, frame - delayFrames),
      fps,
      config:
        motion.type === "spring"
          ? { damping: 90, stiffness: 180, mass: 1 }
          : { damping: 200, stiffness: 400, mass: 0.5 },
      durationInFrames: motion.durationInFrames ?? 20,
    });

  const eyebrowP  = makeSpring(0);
  const titleP    = makeSpring(4);
  const subtitleP = makeSpring(10);
  const accentLineP = makeSpring(2);

  const yShift = motion.direction === "up" ? 40 : motion.direction === "down" ? -40 : 0;
  const xShift = motion.direction === "left" ? 60 : motion.direction === "right" ? -60 : 0;

  const mkTranslate = (p: number) =>
    `translateY(${interpolate(p, [0, 1], [yShift, 0])}px) translateX(${interpolate(p, [0, 1], [xShift, 0])}px)`;

  // Scale font to video dimensions; default = 7% of the shorter dimension
  const isVertical = height > width;
  const shortSide  = isVertical ? width : height;
  const resolvedFontSize = fontSize ?? Math.round(shortSide * 0.085);
  const resolvedColor     = color ?? surfaces.text;
  const resolvedFontWeight = fontWeight ?? typography.fontWeight.black;

  const alignItems =
    alignment === "center" ? "center" : alignment === "left" ? "flex-start" : "flex-end";

  // Support CSS gradient strings as backgroundColor
  const bgStyle: React.CSSProperties =
    backgroundColor && backgroundColor.includes("gradient")
      ? { backgroundImage: backgroundColor }
      : { backgroundColor: backgroundColor ?? "transparent" };

  return (
    <AbsoluteFill
      style={{
        ...bgStyle,
        display: "flex",
        flexDirection: "column",
        alignItems,
        justifyContent: "center",
        padding: isVertical
          ? `${height * 0.04}px ${width * 0.08}px`
          : `0 ${width * 0.08}px`,
        opacity,
      }}
    >
      {/* Eyebrow label */}
      {eyebrow && (
        <div
          style={{
            transform: mkTranslate(eyebrowP),
            opacity: interpolate(eyebrowP, [0, 1], [0, 1]),
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: resolvedFontSize * 0.35,
          }}
        >
          {/* Accent pill */}
          <div
            style={{
              backgroundColor: `${accentColor}28`,
              border: `1px solid ${accentColor}66`,
              borderRadius: 100,
              padding: `${resolvedFontSize * 0.18}px ${resolvedFontSize * 0.5}px`,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: accentColor, flexShrink: 0 }} />
            <span
              style={{
                fontFamily: typography.fontFamily.body,
                fontSize: resolvedFontSize * 0.32,
                fontWeight: typography.fontWeight.semibold,
                color: accentColor,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {eyebrow}
            </span>
          </div>
        </div>
      )}

      {/* Accent line */}
      {!eyebrow && alignment === "left" && (
        <div
          style={{
            width: `${interpolate(accentLineP, [0, 1], [0, resolvedFontSize * 2])}px`,
            height: 4,
            backgroundColor: accentColor,
            borderRadius: 2,
            marginBottom: resolvedFontSize * 0.4,
            opacity: interpolate(accentLineP, [0, 1], [0, 1]),
          }}
        />
      )}

      {/* Main title */}
      <h1
        style={{
          transform: mkTranslate(titleP),
          opacity: interpolate(titleP, [0, 1], [0, 1]),
          fontFamily: typography.fontFamily.display,
          fontSize: resolvedFontSize,
          fontWeight: resolvedFontWeight,
          color: resolvedColor,
          margin: 0,
          padding: 0,
          lineHeight: typography.lineHeight.tight,
          letterSpacing: letterSpacing ?? (-0.03 * resolvedFontSize),
          textAlign: alignment,
          maxWidth: "100%",
          wordBreak: "break-word",
        }}
      >
        {title}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            transform: mkTranslate(subtitleP),
            opacity: interpolate(subtitleP, [0, 1], [0, 1]),
            fontFamily: typography.fontFamily.body,
            fontSize: resolvedFontSize * 0.38,
            fontWeight: typography.fontWeight.regular,
            color: surfaces.textMuted,
            marginTop: resolvedFontSize * 0.28,
            marginBottom: 0,
            padding: 0,
            lineHeight: typography.lineHeight.relaxed,
            textAlign: alignment,
            maxWidth: "90%",
          }}
        >
          {subtitle}
        </p>
      )}
    </AbsoluteFill>
  );
};
