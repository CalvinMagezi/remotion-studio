import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CodeBlockProps } from "../../schema/types";

// ─── Minimal syntax tokeniser ─────────────────────────────────────────────────
// No dependencies — just regex-based colouring for TSX/TS/JS/JSX

const KEYWORDS = /\b(import|export|default|from|const|let|var|function|return|async|await|if|else|new|type|interface|extends|implements|class|for|of|in|while|try|catch|throw|null|undefined|true|false|void)\b/g;
const STRINGS  = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g;
const COMMENTS = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)/g;
const JSX_TAG  = /(<\/?[\w.]+(?:\s[^>]*)?>)/g;
const DIRECTIVE = /^(['"]use (?:client|server)['"])/gm;
const NUMBERS  = /\b(\d+(?:\.\d+)?)\b/g;

type Token = { text: string; type: "kw" | "str" | "comment" | "tag" | "directive" | "num" | "plain" };

function tokenise(line: string): Token[] {
  // Protect matches with placeholders, then reassemble
  const segments: Array<{ start: number; end: number; type: Token["type"]; text: string }> = [];

  const addMatches = (re: RegExp, type: Token["type"]) => {
    let m: RegExpExecArray | null;
    re.lastIndex = 0;
    while ((m = re.exec(line)) !== null) {
      segments.push({ start: m.index, end: m.index + m[0].length, type, text: m[0] });
    }
  };

  // Order matters — higher priority rules first
  addMatches(COMMENTS, "comment");
  addMatches(DIRECTIVE, "directive");
  addMatches(STRINGS, "str");
  addMatches(JSX_TAG, "tag");
  addMatches(KEYWORDS, "kw");
  addMatches(NUMBERS, "num");

  // Sort by start position; remove overlapping segments (keep first)
  segments.sort((a, b) => a.start - b.start);
  const filtered: typeof segments = [];
  let cursor = 0;
  for (const seg of segments) {
    if (seg.start >= cursor) {
      filtered.push(seg);
      cursor = seg.end;
    }
  }

  // Build token list
  const tokens: Token[] = [];
  let pos = 0;
  for (const seg of filtered) {
    if (seg.start > pos) tokens.push({ text: line.slice(pos, seg.start), type: "plain" });
    tokens.push({ text: seg.text, type: seg.type });
    pos = seg.end;
  }
  if (pos < line.length) tokens.push({ text: line.slice(pos), type: "plain" });

  return tokens;
}

// ─── Colour palette ────────────────────────────────────────────────────────────

const TOKEN_COLORS: Record<Token["type"], string> = {
  kw:        "#79b8ff",   // blue
  str:       "#9ecbff",   // light blue (GitHub dark style)
  comment:   "#6a737d",   // grey
  tag:       "#85e89d",   // green
  directive: "#f97583",   // rose / "use client"
  num:       "#f8c555",   // amber
  plain:     "#e1e4e8",   // off-white
};

// ─── Component ────────────────────────────────────────────────────────────────

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = "tsx",
  filename,
  highlightLines = [],
  fontSize,
  showWindowChrome = true,
  animationStyle = "cascade",
  backgroundColor,
  opacity = 1,
  accentColor = "#58a6ff",
  motion = { type: "spring", direction: "up", durationInFrames: 18 },
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const lines = code.split("\n");
  const resolvedFontSize = fontSize ?? Math.max(14, Math.min(22, height * 0.018));

  // Container entrance
  const containerProgress = spring({
    frame,
    fps,
    config: { damping: 100, stiffness: 180, mass: 1 },
    durationInFrames: motion.durationInFrames ?? 18,
  });
  const containerY   = interpolate(containerProgress, [0, 1], [motion.direction === "up" ? 50 : -50, 0]);
  const containerOp  = interpolate(containerProgress, [0, 1], [0, opacity]);

  // Per-line cascade (each line staggers 3 frames apart)
  const getLineOpacity = (lineIdx: number) => {
    if (animationStyle === "none") return opacity;
    const stagger = animationStyle === "cascade" ? 3 : 0;
    const lineFrame = frame - lineIdx * stagger;
    if (lineFrame <= 0) return 0;
    const p = spring({
      frame: lineFrame,
      fps,
      config: { damping: 200, stiffness: 400, mass: 0.5 },
      durationInFrames: 10,
    });
    return interpolate(p, [0, 1], [0, opacity]);
  };

  const bgColor     = backgroundColor ?? "#0d1117";
  const borderColor = "#30363d";
  const lineHeight  = resolvedFontSize * 1.65;
  const chromeH     = showWindowChrome ? resolvedFontSize * 2.4 : 0;
  const headerH     = filename ? resolvedFontSize * 2.2 : 0;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        padding: `0 ${width * 0.04}px`,
      }}
    >
      <div
        style={{
          transform: `translateY(${containerY}px)`,
          opacity: containerOp,
          backgroundColor: bgColor,
          borderRadius: 12,
          border: `1px solid ${borderColor}`,
          overflow: "hidden",
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${borderColor}`,
        }}
      >
        {/* Window chrome */}
        {showWindowChrome && (
          <div
            style={{
              height: chromeH,
              backgroundColor: "#161b22",
              borderBottom: `1px solid ${borderColor}`,
              display: "flex",
              alignItems: "center",
              padding: `0 ${resolvedFontSize * 0.9}px`,
              gap: resolvedFontSize * 0.45,
              flexShrink: 0,
            }}
          >
            {/* Traffic lights */}
            {(["#ff5f57", "#febc2e", "#28c840"] as const).map((c, i) => (
              <div key={i} style={{ width: resolvedFontSize * 0.6, height: resolvedFontSize * 0.6, borderRadius: "50%", backgroundColor: c, flexShrink: 0 }} />
            ))}
            {/* Filename or language tab */}
            {(filename || language) && (
              <div
                style={{
                  marginLeft: "auto",
                  marginRight: "auto",
                  fontFamily: "'Menlo','Monaco','Cascadia Code','Courier New',monospace",
                  fontSize: resolvedFontSize * 0.72,
                  color: "#8b949e",
                  letterSpacing: 0.3,
                }}
              >
                {filename ?? language}
              </div>
            )}
            {/* Language badge */}
            <div
              style={{
                fontFamily: "'Menlo','Monaco','Courier New',monospace",
                fontSize: resolvedFontSize * 0.65,
                color: accentColor,
                backgroundColor: `${accentColor}22`,
                padding: `2px ${resolvedFontSize * 0.5}px`,
                borderRadius: 4,
                border: `1px solid ${accentColor}44`,
                flexShrink: 0,
              }}
            >
              {language}
            </div>
          </div>
        )}

        {/* Code lines */}
        <div style={{ padding: `${resolvedFontSize * 0.8}px 0`, overflowX: "hidden" }}>
          {lines.map((line, lineIdx) => {
            const isHighlighted = highlightLines.includes(lineIdx + 1);
            const tokens = tokenise(line);
            return (
              <div
                key={lineIdx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: lineHeight,
                  backgroundColor: isHighlighted ? `${accentColor}18` : "transparent",
                  borderLeft: isHighlighted ? `3px solid ${accentColor}` : "3px solid transparent",
                  opacity: getLineOpacity(lineIdx),
                  paddingLeft: resolvedFontSize * 0.6,
                  paddingRight: resolvedFontSize * 0.6,
                }}
              >
                {/* Line number */}
                <span
                  style={{
                    fontFamily: "'Menlo','Monaco','Cascadia Code','Courier New',monospace",
                    fontSize: resolvedFontSize * 0.8,
                    color: "#30363d",
                    minWidth: resolvedFontSize * 2,
                    marginRight: resolvedFontSize * 0.8,
                    userSelect: "none",
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  {lineIdx + 1}
                </span>
                {/* Tokens */}
                <span style={{ fontFamily: "'Menlo','Monaco','Cascadia Code','Courier New',monospace", fontSize: resolvedFontSize, whiteSpace: "pre" }}>
                  {tokens.map((tok, ti) => (
                    <span key={ti} style={{ color: TOKEN_COLORS[tok.type] }}>{tok.text}</span>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
