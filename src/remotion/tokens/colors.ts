/**
 * Color Design Tokens
 * Brand-agnostic semantic color system for the Remotion Studio
 */

export const colors = {
  // Semantic tokens — map to Tailwind or custom brand colors
  primary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    200: "#bae6fd",
    300: "#7dd3fc",
    400: "#38bdf8",
    500: "#0ea5e9",   // Default primary
    600: "#0284c7",
    700: "#0369a1",
    800: "#075985",
    900: "#0c4a6e",
  },
  accent: {
    50: "#fdf4ff",
    100: "#fae8ff",
    200: "#f5d0fe",
    300: "#f0abfc",
    400: "#e879f9",
    500: "#d946ef",   // Default accent
    600: "#c026d3",
    700: "#a21caf",
    800: "#86198f",
    900: "#701a75",
  },
  neutral: {
    0: "#ffffff",
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cbd5e1",
    400: "#94a3b8",
    500: "#64748b",
    600: "#475569",
    700: "#334155",
    800: "#1e293b",
    900: "#0f172a",
    950: "#020617",
    1000: "#000000",
  },
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
} as const;

// Semantic surface tokens used by components
export const surfaces = {
  background: colors.neutral[950],
  backgroundLight: colors.neutral[900],
  surface: colors.neutral[800],
  surfaceHover: colors.neutral[700],
  border: colors.neutral[700],
  borderSubtle: colors.neutral[800],
  text: colors.neutral[50],
  textMuted: colors.neutral[400],
  textSubtle: colors.neutral[600],
} as const;

export type ColorToken = keyof typeof colors;
export type SurfaceToken = keyof typeof surfaces;
