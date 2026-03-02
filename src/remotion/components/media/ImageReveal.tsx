import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ImageRevealProps } from "../../schema/types";

export const ImageReveal: React.FC<ImageRevealProps> = ({
  src,
  alt = "",
  revealDirection = "fade",
  objectFit = "cover",
  overlay = false,
  overlayColor = "#000000",
  overlayOpacity = 0.4,
  backgroundColor,
  opacity = 1,
  motion = { type: "spring", direction: "in", durationInFrames: 25 },
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 150, mass: 1 },
    durationInFrames: motion.durationInFrames ?? 25,
  });

  const opacityAnim = interpolate(progress, [0, 1], [0, opacity]);

  // Clip reveal: a mask that slides in from the chosen direction
  const revealFraction = interpolate(progress, [0, 1], [0, 1]);

  let clipPath = "none";
  if (revealDirection === "left") {
    clipPath = `inset(0 ${(1 - revealFraction) * 100}% 0 0)`;
  } else if (revealDirection === "right") {
    clipPath = `inset(0 0 0 ${(1 - revealFraction) * 100}%)`;
  } else if (revealDirection === "top") {
    clipPath = `inset(0 0 ${(1 - revealFraction) * 100}% 0)`;
  } else if (revealDirection === "bottom") {
    clipPath = `inset(${(1 - revealFraction) * 100}% 0 0 0)`;
  }

  const imageStyle: React.CSSProperties =
    revealDirection === "fade"
      ? { opacity: opacityAnim }
      : { clipPath, opacity };

  return (
    <AbsoluteFill style={{ backgroundColor: backgroundColor ?? "#000" }}>
      <Img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit,
          display: "block",
          ...imageStyle,
        }}
      />
      {overlay && (
        <AbsoluteFill
          style={{
            backgroundColor: overlayColor,
            opacity: interpolate(progress, [0, 1], [0, overlayOpacity]),
          }}
        />
      )}
    </AbsoluteFill>
  );
};
