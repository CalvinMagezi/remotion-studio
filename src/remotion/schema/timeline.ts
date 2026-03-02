/**
 * Zod Schema for the JSON Timeline Specification
 * This is the schema the AI agent outputs — it is validated before rendering
 */

import { z } from "zod";

// ─── Motion Token Schema ─────────────────────────────────────────────────────

const MotionTokenSchema = z.object({
  type: z.enum(["spring", "tween", "none"]).default("spring"),
  direction: z.enum(["up", "down", "left", "right", "in", "out", "none"]).default("up"),
  durationInFrames: z.number().int().min(0).max(300).optional(),
  springProfile: z.enum(["snappy", "default", "gentle", "bouncy", "cinematic"]).optional(),
  easing: z.enum(["easeIn", "easeOut", "easeInOut", "linear", "sharp", "emphasized"]).optional(),
  delay: z.number().int().min(0).optional(),
  distance: z.number().min(0).optional(),
}).default({ type: "spring", direction: "up" });

// ─── Layout Zone Schema ──────────────────────────────────────────────────────

const LayoutZoneSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
}).optional();

// ─── Base Props Schema ───────────────────────────────────────────────────────

const BaseClipPropsSchema = z.object({
  motion: MotionTokenSchema.optional(),
  backgroundColor: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  layout: LayoutZoneSchema,
  eyebrow: z.string().optional(),
  accentColor: z.string().optional(),
});

// ─── Component-specific Props ────────────────────────────────────────────────

const TitleCardPropsSchema = BaseClipPropsSchema.extend({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  fontSize: z.number().int().min(8).max(300).optional(),
  color: z.string().optional(),
  fontWeight: z.number().int().optional(),
  letterSpacing: z.number().optional(),
});

const SubtitleCardPropsSchema = BaseClipPropsSchema.extend({
  text: z.string().min(1),
  alignment: z.enum(["left", "center", "right"]).default("center"),
  fontSize: z.number().int().min(8).max(200).optional(),
  color: z.string().optional(),
  maxWidth: z.number().optional(),
});

const LowerThirdPropsSchema = BaseClipPropsSchema.extend({
  name: z.string().min(1),
  title: z.string().optional(),
  accentColor: z.string().optional(),
  textColor: z.string().optional(),
  position: z.enum(["bottom-left", "bottom-right", "top-left", "top-right"]).default("bottom-left"),
});

const CaptionPropsSchema = BaseClipPropsSchema.extend({
  text: z.string().min(1),
  position: z.enum(["top", "bottom"]).default("bottom"),
  fontSize: z.number().int().min(8).max(100).optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
});

const CodeBlockPropsSchema = BaseClipPropsSchema.extend({
  code: z.string().min(1),
  language: z.string().optional(),
  filename: z.string().optional(),
  highlightLines: z.array(z.number().int()).optional(),
  fontSize: z.number().int().min(8).max(80).optional(),
  showWindowChrome: z.boolean().default(true),
  animationStyle: z.enum(["cascade", "fade", "none"]).default("cascade"),
});

const DataPointSchema = z.object({
  label: z.string(),
  value: z.number(),
  color: z.string().optional(),
});

const BarChartPropsSchema = BaseClipPropsSchema.extend({
  data: z.array(DataPointSchema).min(1).max(20),
  title: z.string().optional(),
  maxValue: z.number().optional(),
  barColor: z.string().optional(),
  accentColor: z.string().optional(),
  showValues: z.boolean().default(true),
  horizontal: z.boolean().default(false),
});

const LineChartPropsSchema = BaseClipPropsSchema.extend({
  data: z.array(DataPointSchema).min(2).max(50),
  title: z.string().optional(),
  lineColor: z.string().optional(),
  fillColor: z.string().optional(),
  showPoints: z.boolean().default(true),
  smooth: z.boolean().default(true),
});

const StatCounterPropsSchema = BaseClipPropsSchema.extend({
  value: z.number(),
  label: z.string().min(1),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  color: z.string().optional(),
  fontSize: z.number().int().min(8).max(300).optional(),
  decimals: z.number().int().min(0).max(6).default(0),
});

const ProgressRingPropsSchema = BaseClipPropsSchema.extend({
  percentage: z.number().min(0).max(100),
  label: z.string().optional(),
  size: z.number().int().min(50).max(1000).default(200),
  strokeWidth: z.number().min(1).max(50).default(16),
  color: z.string().optional(),
  trackColor: z.string().optional(),
  showPercentage: z.boolean().default(true),
});

const ImageRevealPropsSchema = BaseClipPropsSchema.extend({
  src: z.string().min(1),
  alt: z.string().optional(),
  revealDirection: z.enum(["left", "right", "top", "bottom", "fade"]).default("fade"),
  objectFit: z.enum(["cover", "contain", "fill"]).default("cover"),
  overlay: z.boolean().default(false),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
});

const VideoBackgroundPropsSchema = BaseClipPropsSchema.extend({
  src: z.string().min(1),
  playbackRate: z.number().min(0.1).max(4).default(1),
  muted: z.boolean().default(true),
  loop: z.boolean().default(true),
  overlay: z.boolean().default(false),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
});

const ContentBlockSchema = z.object({
  type: z.enum(["image", "color", "text"]),
  value: z.string(),
});

const SplitScreenPropsSchema = BaseClipPropsSchema.extend({
  leftContent: ContentBlockSchema,
  rightContent: ContentBlockSchema,
  splitRatio: z.number().min(0.1).max(0.9).default(0.5),
  splitDirection: z.enum(["vertical", "horizontal"]).default("vertical"),
  gap: z.number().min(0).max(100).default(0),
});

const LogoAnimationPropsSchema = BaseClipPropsSchema.extend({
  src: z.string().min(1),
  size: z.number().int().min(32).max(1000).optional(),
  springProfile: z.enum(["snappy", "default", "gentle", "bouncy", "cinematic"]).optional(),
  showText: z.boolean().default(false),
  text: z.string().optional(),
  textColor: z.string().optional(),
});

const TransitionPropsSchema = BaseClipPropsSchema.extend({
  durationInFrames: z.number().int().min(1).max(120).default(15),
  color: z.string().optional(),
  direction: z.enum(["left", "right", "up", "down", "in", "out"]).optional(),
});

// ─── Discriminated Union of all clip props ───────────────────────────────────

const ClipPropsSchema = z.discriminatedUnion("component", [
  z.object({ component: z.literal("TitleCard"), props: TitleCardPropsSchema }),
  z.object({ component: z.literal("SubtitleCard"), props: SubtitleCardPropsSchema }),
  z.object({ component: z.literal("LowerThird"), props: LowerThirdPropsSchema }),
  z.object({ component: z.literal("Caption"), props: CaptionPropsSchema }),
  z.object({ component: z.literal("CodeBlock"), props: CodeBlockPropsSchema }),
  z.object({ component: z.literal("BarChart"), props: BarChartPropsSchema }),
  z.object({ component: z.literal("LineChart"), props: LineChartPropsSchema }),
  z.object({ component: z.literal("StatCounter"), props: StatCounterPropsSchema }),
  z.object({ component: z.literal("ProgressRing"), props: ProgressRingPropsSchema }),
  z.object({ component: z.literal("ImageReveal"), props: ImageRevealPropsSchema }),
  z.object({ component: z.literal("VideoBackground"), props: VideoBackgroundPropsSchema }),
  z.object({ component: z.literal("SplitScreen"), props: SplitScreenPropsSchema }),
  z.object({ component: z.literal("LogoAnimation"), props: LogoAnimationPropsSchema }),
  z.object({ component: z.literal("FadeTransition"), props: TransitionPropsSchema }),
  z.object({ component: z.literal("SlideTransition"), props: TransitionPropsSchema }),
  z.object({ component: z.literal("ZoomTransition"), props: TransitionPropsSchema }),
]);

// ─── Track Schema ────────────────────────────────────────────────────────────

const TrackSchema = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  zIndex: z.number().int().default(0),
  hidden: z.boolean().default(false),
});

// ─── Clip Schema ─────────────────────────────────────────────────────────────

const ClipSchema = z.intersection(
  ClipPropsSchema,
  z.object({
    id: z.string().min(1),
    trackId: z.string().min(1),
    from: z.number().int().min(0),
    durationInFrames: z.number().int().min(1),
  })
);

// ─── Audio Track Schema ───────────────────────────────────────────────────────

const AudioTrackSchema = z.object({
  src: z.string().min(1).describe(
    "Path relative to public/ directory (e.g. 'music/track.mp3') or an absolute HTTPS URL"
  ),
  volume: z.number().min(0).max(1).default(1).describe("Volume 0–1 (default 1)"),
  startFrom: z.number().int().min(0).default(0).describe("Skip N frames into the audio before playing"),
  muted: z.boolean().default(false).describe("Mute without removing (default false)"),
  attribution: z.string().optional().describe("Track title / artist / license for attribution"),
});

// ─── Root Timeline Specification ─────────────────────────────────────────────

export const TimelineSchema = z.object({
  id: z.string().min(1).describe("Unique identifier for this composition"),
  title: z.string().optional().describe("Human-readable title for this composition"),
  fps: z.number().int().min(1).max(120).default(30).describe("Frames per second"),
  width: z.number().int().min(1).max(7680).default(1920).describe("Width in pixels"),
  height: z.number().int().min(1).max(4320).default(1080).describe("Height in pixels"),
  durationInFrames: z.number().int().min(1).describe("Total duration in frames"),
  backgroundColor: z.string().default("#0f172a").describe("Canvas background color"),
  tracks: z.array(TrackSchema).min(1).describe("Logical layers of the timeline"),
  clips: z.array(ClipSchema).min(1).describe("Clips placed on the timeline"),
  audio: AudioTrackSchema.optional().describe(
    "Optional background audio track. Use music_download to fetch a CC-licensed track."
  ),
});

export type Timeline = z.infer<typeof TimelineSchema>;
export type Clip = z.infer<typeof ClipSchema>;
export type Track = z.infer<typeof TrackSchema>;
