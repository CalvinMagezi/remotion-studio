/**
 * Core TypeScript types for the JSON Timeline Specification
 */

import type { MotionToken } from "../tokens";

// ─── Component Identifiers ───────────────────────────────────────────────────

export type ComponentId =
  // Text & Titles
  | "TitleCard"
  | "SubtitleCard"
  | "LowerThird"
  | "Caption"
  | "CodeBlock"
  // Data Visualisation
  | "BarChart"
  | "LineChart"
  | "StatCounter"
  | "ProgressRing"
  // Media & Layout
  | "ImageReveal"
  | "VideoBackground"
  | "SplitScreen"
  | "LogoAnimation"
  // Transitions
  | "FadeTransition"
  | "SlideTransition"
  | "ZoomTransition";

// ─── Shared Prop Interfaces ─────────────────────────────────────────────────

/**
 * Optional layout zone — when present, the clip renders inside a positioned
 * sub-region of the canvas instead of filling the full frame.
 * All values are fractions of the video width/height (0–1).
 */
export interface LayoutZone {
  x: number;       // left edge as fraction of video width
  y: number;       // top edge as fraction of video height
  width: number;   // width as fraction of video width
  height: number;  // height as fraction of video height
}

export interface BaseClipProps {
  motion?: MotionToken;
  backgroundColor?: string;
  opacity?: number;
  /** Position this clip in a specific zone instead of filling the full canvas */
  layout?: LayoutZone;
  /** Eyebrow / category label displayed above main content */
  eyebrow?: string;
  /** Accent color used for decorative elements (overrides component defaults) */
  accentColor?: string;
}

// ─── Text Components ─────────────────────────────────────────────────────────

export interface TitleCardProps extends BaseClipProps {
  title: string;
  subtitle?: string;
  alignment?: "left" | "center" | "right";
  fontSize?: number;
  color?: string;
  fontWeight?: number;
  letterSpacing?: number;
}

export interface SubtitleCardProps extends BaseClipProps {
  text: string;
  alignment?: "left" | "center" | "right";
  fontSize?: number;
  color?: string;
  maxWidth?: number;
}

export interface LowerThirdProps extends BaseClipProps {
  name: string;
  title?: string;
  accentColor?: string;
  textColor?: string;
  position?: "bottom-left" | "bottom-right" | "top-left" | "top-right";
}

export interface CaptionProps extends BaseClipProps {
  text: string;
  position?: "top" | "bottom";
  fontSize?: number;
  backgroundColor?: string;
  textColor?: string;
}

export interface CodeBlockProps extends BaseClipProps {
  /** The code string to display */
  code: string;
  /** Language label shown in the header (cosmetic only) */
  language?: string;
  /** Optional filename shown in the header (e.g. "app/page.tsx") */
  filename?: string;
  /** Line numbers to highlight with accent colour */
  highlightLines?: number[];
  /** Base font size in px — auto-scaled if omitted */
  fontSize?: number;
  /** Show window chrome (traffic lights + title bar) */
  showWindowChrome?: boolean;
  /** Animation style: lines appear one-by-one or fade together */
  animationStyle?: "cascade" | "fade" | "none";
}

// ─── Data Components ─────────────────────────────────────────────────────────

export interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface BarChartProps extends BaseClipProps {
  data: DataPoint[];
  title?: string;
  maxValue?: number;
  barColor?: string;
  accentColor?: string;
  showValues?: boolean;
  horizontal?: boolean;
}

export interface LineChartProps extends BaseClipProps {
  data: DataPoint[];
  title?: string;
  lineColor?: string;
  fillColor?: string;
  showPoints?: boolean;
  smooth?: boolean;
}

export interface StatCounterProps extends BaseClipProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  color?: string;
  fontSize?: number;
  decimals?: number;
}

export interface ProgressRingProps extends BaseClipProps {
  percentage: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showPercentage?: boolean;
}

// ─── Media Components ────────────────────────────────────────────────────────

export interface ImageRevealProps extends BaseClipProps {
  src: string;
  alt?: string;
  revealDirection?: "left" | "right" | "top" | "bottom" | "fade";
  objectFit?: "cover" | "contain" | "fill";
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface VideoBackgroundProps extends BaseClipProps {
  src: string;
  playbackRate?: number;
  muted?: boolean;
  loop?: boolean;
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface SplitScreenProps extends BaseClipProps {
  leftContent: { type: "image" | "color" | "text"; value: string };
  rightContent: { type: "image" | "color" | "text"; value: string };
  splitRatio?: number;     // 0–1, default 0.5
  splitDirection?: "vertical" | "horizontal";
  gap?: number;
}

export interface LogoAnimationProps extends BaseClipProps {
  src: string;
  size?: number;
  springProfile?: string;
  showText?: boolean;
  text?: string;
  textColor?: string;
}

// ─── Transition Components ───────────────────────────────────────────────────

export interface FadeTransitionProps extends BaseClipProps {
  durationInFrames?: number;
  color?: string;
}

export interface SlideTransitionProps extends BaseClipProps {
  direction?: "left" | "right" | "up" | "down";
  durationInFrames?: number;
  color?: string;
}

export interface ZoomTransitionProps extends BaseClipProps {
  direction?: "in" | "out";
  durationInFrames?: number;
  color?: string;
}

// ─── Audio Track ─────────────────────────────────────────────────────────────

/**
 * Background audio for the whole composition.
 * Src can be a path relative to public/ (e.g. "music/track.mp3") or an HTTPS URL.
 */
export interface AudioTrack {
  /** Path relative to public/ directory, or an absolute HTTPS URL */
  src: string;
  /** Volume level 0–1 (default 1) */
  volume?: number;
  /** Skip the first N frames of the audio file before playing (default 0) */
  startFrom?: number;
  /** Mute this track without removing it from the spec (default false) */
  muted?: boolean;
  /** Attribution / license text to store alongside the spec */
  attribution?: string;
}

// ─── Union of all component props ───────────────────────────────────────────

export type ComponentProps =
  | TitleCardProps
  | SubtitleCardProps
  | LowerThirdProps
  | CaptionProps
  | CodeBlockProps
  | BarChartProps
  | LineChartProps
  | StatCounterProps
  | ProgressRingProps
  | ImageRevealProps
  | VideoBackgroundProps
  | SplitScreenProps
  | LogoAnimationProps
  | FadeTransitionProps
  | SlideTransitionProps
  | ZoomTransitionProps;
