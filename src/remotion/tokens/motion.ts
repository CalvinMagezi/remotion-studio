/**
 * Motion Design Tokens
 * Abstract animation physics into semantic spring/interpolation configs
 */

import type { SpringConfig } from "remotion";

// Predefined spring physics profiles
export const springs = {
  // Snappy, fast response — good for UI elements
  snappy: {
    damping: 200,
    stiffness: 400,
    mass: 0.5,
    overshootClamping: true,
  } satisfies Partial<SpringConfig>,

  // Standard, balanced feel
  default: {
    damping: 100,
    stiffness: 200,
    mass: 1,
    overshootClamping: false,
  } satisfies Partial<SpringConfig>,

  // Smooth, gentle — good for text reveals
  gentle: {
    damping: 80,
    stiffness: 100,
    mass: 1.2,
    overshootClamping: false,
  } satisfies Partial<SpringConfig>,

  // Bouncy, playful — good for logos/icons
  bouncy: {
    damping: 40,
    stiffness: 150,
    mass: 0.8,
    overshootClamping: false,
  } satisfies Partial<SpringConfig>,

  // Slow, cinematic — good for full-screen transitions
  cinematic: {
    damping: 120,
    stiffness: 60,
    mass: 2,
    overshootClamping: false,
  } satisfies Partial<SpringConfig>,
} as const;

// Predefined easing curves (for use with interpolate())
export const easings = {
  easeIn: [0.4, 0, 1, 1] as [number, number, number, number],
  easeOut: [0, 0, 0.2, 1] as [number, number, number, number],
  easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
  linear: [0, 0, 1, 1] as [number, number, number, number],
  sharp: [0.4, 0, 0.6, 1] as [number, number, number, number],
  emphasized: [0.2, 0, 0, 1.0] as [number, number, number, number],
} as const;

// Standard durations in frames (at 30fps)
export const durations = {
  instant: 0,
  flash: 3,       // 100ms
  fast: 9,        // 300ms
  default: 15,    // 500ms
  slow: 21,       // 700ms
  glacial: 30,    // 1000ms
  cinematic: 45,  // 1500ms
} as const;

// Motion token type — what the AI agent passes per component
export type MotionDirection = "in" | "out" | "loop";
export type SpringProfile = keyof typeof springs;
export type EasingProfile = keyof typeof easings;
export type DurationToken = keyof typeof durations;
export type AnimatableProperty = "opacity" | "translateY" | "translateX" | "scale" | "rotate" | "blur";

export interface MotionToken {
  type: "spring" | "tween" | "none";
  direction: "up" | "down" | "left" | "right" | "in" | "out" | "none";
  durationInFrames?: number;
  springProfile?: SpringProfile;
  easing?: EasingProfile;
  delay?: number;      // frames
  distance?: number;   // pixels
}

export const defaultMotion: MotionToken = {
  type: "spring",
  direction: "up",
  durationInFrames: 15,
  springProfile: "default",
  delay: 0,
  distance: 30,
};
