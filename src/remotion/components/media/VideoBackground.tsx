import React from "react";
import {
  AbsoluteFill,
  Video,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { VideoBackgroundProps } from "../../schema/types";

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  src,
  playbackRate = 1,
  muted = true,
  loop = true,
  overlay = false,
  overlayColor = "#000000",
  overlayOpacity = 0.4,
  opacity = 1,
  motion = { type: "spring", direction: "in", durationInFrames: 20 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 150, mass: 1 },
    durationInFrames: motion.durationInFrames ?? 20,
  });

  const opacityAnim = interpolate(progress, [0, 1], [0, opacity]);

  return (
    <AbsoluteFill style={{ opacity: opacityAnim }}>
      <Video
        src={src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
        playbackRate={playbackRate}
        muted={muted}
        loop={loop}
      />
      {overlay && (
        <AbsoluteFill
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
