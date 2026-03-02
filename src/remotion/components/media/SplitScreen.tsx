import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { typography, surfaces } from "../../tokens";
import type { SplitScreenProps } from "../../schema/types";

const ContentBlock: React.FC<{
  content: { type: "image" | "color" | "text"; value: string };
  style?: React.CSSProperties;
}> = ({ content, style }) => {
  if (content.type === "image") {
    return (
      <div style={{ position: "relative", overflow: "hidden", ...style }}>
        <Img
          src={content.value}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    );
  }
  if (content.type === "color") {
    return <div style={{ backgroundColor: content.value, ...style }} />;
  }
  // text
  return (
    <div
      style={{
        backgroundColor: surfaces.backgroundLight,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10%",
        ...style,
      }}
    >
      <p
        style={{
          fontFamily: typography.fontFamily.body,
          fontSize: 28,
          color: surfaces.text,
          textAlign: "center",
          margin: 0,
        }}
      >
        {content.value}
      </p>
    </div>
  );
};

export const SplitScreen: React.FC<SplitScreenProps> = ({
  leftContent,
  rightContent,
  splitRatio = 0.5,
  splitDirection = "vertical",
  gap = 0,
  backgroundColor,
  opacity = 1,
  motion = { type: "spring", direction: "in", durationInFrames: 22 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 200, stiffness: 300, mass: 0.8 },
    durationInFrames: motion.durationInFrames ?? 22,
  });

  const leftSlide = interpolate(progress, [0, 1], [-80, 0]);
  const rightSlide = interpolate(progress, [0, 1], [80, 0]);
  const opacityAnim = interpolate(progress, [0, 1], [0, opacity]);

  if (splitDirection === "horizontal") {
    return (
      <AbsoluteFill
        style={{
          backgroundColor: backgroundColor ?? "#000",
          flexDirection: "column",
          gap,
          opacity: opacityAnim,
        }}
      >
        <ContentBlock
          content={leftContent}
          style={{
            flex: splitRatio,
            transform: `translateY(${leftSlide}px)`,
          }}
        />
        <ContentBlock
          content={rightContent}
          style={{
            flex: 1 - splitRatio,
            transform: `translateY(${rightSlide}px)`,
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        backgroundColor: backgroundColor ?? "#000",
        flexDirection: "row",
        gap,
        opacity: opacityAnim,
      }}
    >
      <ContentBlock
        content={leftContent}
        style={{
          flex: splitRatio,
          transform: `translateX(${leftSlide}px)`,
        }}
      />
      <ContentBlock
        content={rightContent}
        style={{
          flex: 1 - splitRatio,
          transform: `translateX(${rightSlide}px)`,
        }}
      />
    </AbsoluteFill>
  );
};
