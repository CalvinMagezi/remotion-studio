import React from "react";
import { Composition } from "remotion";
import { TimelineRenderer } from "./schema/renderer";
import { TimelineSchema } from "./schema/timeline";
import type { Timeline } from "./schema/timeline";
import { COMPOSITIONS } from "./compositions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convenience — build a layout zone in fractions (0-1) */
const zone = (x: number, y: number, width: number, height: number) => ({ x, y, width, height });

// ─── Premium Next.js 14 App Router Reel ──────────────────────────────────────
//
// Layout system — vertical 1080×1920 canvas split into 4 zones:
//   badge zone:   y 0.04–0.14  (section number + eyebrow)
//   title zone:   y 0.14–0.36  (section heading + 1-line descriptor)
//   code zone:    y 0.38–0.72  (CodeBlock or visual content)
//   stat zone:    y 0.74–0.92  (StatCounter or key takeaway)
//
// Each section (7 s = 210 frames) has its own accent colour + gradient bg.
// Sections never share overlapping clip windows within the same zone.
//
// Timeline:
//   Hook .............. 0   – 90   (3 s)
//   Transition ........ 90  – 105  (0.5 s)
//   Section 1 ......... 105 – 315  (7 s)  — Server Components   (#0ea5e9)
//   Transition ........ 315 – 330
//   Section 2 ......... 330 – 540  (7 s)  — Client Components   (#a78bfa)
//   Transition ........ 540 – 555
//   Section 3 ......... 555 – 765  (7 s)  — Nested Layouts      (#34d399)
//   Transition ........ 765 – 780
//   Section 4 ......... 780 – 990  (7 s)  — Special Files       (#fbbf24)
//   Transition ........ 990 – 1005
//   Outro ............. 1005 – 1200 (6.5 s)
//
// Total: 1200 frames = 40 s @ 30 fps

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nextjsReel = {
  id: "nextjs-app-router-reel-v2",
  title: "Next.js 14 App Router — Premium Reel",
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 1200,
  backgroundColor: "#060611",
  audio: {
    src: "music/muted-warning.mp3",
    volume: 0.30,
    startFrom: 0,
    attribution: '"Muted Warning" by jaspertine — CC Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/) — https://ccmixter.org/files/jaspertine/70612',
  },
  tracks: [
    { id: "bg",      label: "Background",   zIndex: 0, hidden: false },
    { id: "content", label: "Content",       zIndex: 1, hidden: false },
    { id: "overlay", label: "Overlay/Badge", zIndex: 2, hidden: false },
  ],
  clips: [

    // ═══════════════════════════════════════════════════════════
    //  HOOK  (0 – 90)
    // ═══════════════════════════════════════════════════════════

    // Full-bleed gradient background
    {
      id: "hook-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 0, durationInFrames: 90,
      props: {
        title: "",
        backgroundColor: "linear-gradient(160deg, #0a0a1a 0%, #0f1932 60%, #0a0a1a 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    // Big hero title — centred, full frame
    {
      id: "hook-title",
      component: "TitleCard",
      trackId: "content",
      from: 0, durationInFrames: 90,
      props: {
        title: "Next.js 14",
        subtitle: "App Router fundamentals — in 40 seconds",
        alignment: "center",
        fontSize: 110,
        color: "#f0f9ff",
        accentColor: "#38bdf8",
        eyebrow: "Mini-Course",
        motion: { type: "spring", direction: "up", durationInFrames: 25, springProfile: "gentle" },
      },
    },

    // "Follow for more" badge at bottom
    {
      id: "hook-badge",
      component: "LowerThird",
      trackId: "overlay",
      from: 15, durationInFrames: 70,
      props: {
        name: "4 concepts · 40 seconds",
        title: "Next.js App Router",
        accentColor: "#38bdf8",
        position: "bottom-left",
        motion: { type: "spring", direction: "left", durationInFrames: 18 },
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  TRANSITION 0→1  (90 – 105)
    // ═══════════════════════════════════════════════════════════
    {
      id: "t0",
      component: "SlideTransition",
      trackId: "bg",
      from: 90, durationInFrames: 15,
      props: { direction: "left", durationInFrames: 15, color: "#060611" },
    },

    // ═══════════════════════════════════════════════════════════
    //  SECTION 1: Server Components  (105 – 315)  accent: #0ea5e9
    // ═══════════════════════════════════════════════════════════

    // Background — deep blue gradient
    {
      id: "s1-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 105, durationInFrames: 210,
      props: {
        title: "",
        backgroundColor: "linear-gradient(180deg, #0c1a2e 0%, #0a1628 50%, #060e1a 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    // Badge zone — "1 / 4  ·  Server Components"
    {
      id: "s1-badge",
      component: "LowerThird",
      trackId: "overlay",
      from: 110, durationInFrames: 195,
      props: {
        name: "Concept 1 / 4",
        title: "Server Components",
        accentColor: "#0ea5e9",
        position: "top-left",
        motion: { type: "spring", direction: "left", durationInFrames: 15 },
        layout: zone(0, 0.03, 1, 0.12),
      },
    },

    // Title zone
    {
      id: "s1-title",
      component: "TitleCard",
      trackId: "content",
      from: 115, durationInFrames: 200,
      props: {
        title: "Server Components",
        subtitle: "Default in app/ — run on the server, send zero JS to the browser",
        alignment: "left",
        fontSize: 72,
        color: "#f0f9ff",
        accentColor: "#0ea5e9",
        motion: { type: "spring", direction: "up", durationInFrames: 22, springProfile: "gentle" },
        layout: zone(0.06, 0.14, 0.88, 0.22),
      },
    },

    // Code zone — server component example
    {
      id: "s1-code",
      component: "CodeBlock",
      trackId: "content",
      from: 130, durationInFrames: 185,
      props: {
        filename: "app/page.tsx",
        language: "tsx",
        code: `// No "use client" needed — runs on server
async function Page() {
  const data = await fetch('/api/posts')
  const posts = await data.json()

  return (
    <main>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
        </article>
      ))}
    </main>
  )
}

export default Page`,
        highlightLines: [1, 2],
        showWindowChrome: true,
        animationStyle: "cascade",
        accentColor: "#0ea5e9",
        motion: { type: "spring", direction: "up", durationInFrames: 20, springProfile: "gentle" },
        layout: zone(0.04, 0.37, 0.92, 0.36),
      },
    },

    // Stat zone — "0 KB client JS"
    {
      id: "s1-stat",
      component: "StatCounter",
      trackId: "content",
      from: 160, durationInFrames: 155,
      props: {
        value: 0,
        label: "KB of JS sent to browser",
        suffix: "",
        color: "#0ea5e9",
        accentColor: "#0ea5e9",
        decimals: 0,
        motion: { type: "spring", direction: "up", durationInFrames: 30, springProfile: "bouncy" },
        layout: zone(0.1, 0.74, 0.8, 0.2),
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  TRANSITION 1→2  (315 – 330)
    // ═══════════════════════════════════════════════════════════
    {
      id: "t1",
      component: "SlideTransition",
      trackId: "bg",
      from: 315, durationInFrames: 15,
      props: { direction: "left", durationInFrames: 15, color: "#060611" },
    },

    // ═══════════════════════════════════════════════════════════
    //  SECTION 2: Client Components  (330 – 540)  accent: #a78bfa
    // ═══════════════════════════════════════════════════════════

    {
      id: "s2-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 330, durationInFrames: 210,
      props: {
        title: "",
        backgroundColor: "linear-gradient(180deg, #130d28 0%, #0f0a22 50%, #060610 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    {
      id: "s2-badge",
      component: "LowerThird",
      trackId: "overlay",
      from: 335, durationInFrames: 195,
      props: {
        name: "Concept 2 / 4",
        title: "Client Components",
        accentColor: "#a78bfa",
        position: "top-left",
        motion: { type: "spring", direction: "left", durationInFrames: 15 },
        layout: zone(0, 0.03, 1, 0.12),
      },
    },

    {
      id: "s2-title",
      component: "TitleCard",
      trackId: "content",
      from: 340, durationInFrames: 200,
      props: {
        title: "Client Components",
        subtitle: "Add 'use client' when you need interactivity or browser APIs",
        alignment: "left",
        fontSize: 72,
        color: "#f5f3ff",
        accentColor: "#a78bfa",
        motion: { type: "spring", direction: "up", durationInFrames: 22, springProfile: "gentle" },
        layout: zone(0.06, 0.14, 0.88, 0.22),
      },
    },

    {
      id: "s2-code",
      component: "CodeBlock",
      trackId: "content",
      from: 355, durationInFrames: 185,
      props: {
        filename: "components/Counter.tsx",
        language: "tsx",
        code: `"use client"

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(n => n + 1)}>
      Clicked {count} times
    </button>
  )
}`,
        highlightLines: [1],
        showWindowChrome: true,
        animationStyle: "cascade",
        accentColor: "#a78bfa",
        motion: { type: "spring", direction: "up", durationInFrames: 20, springProfile: "gentle" },
        layout: zone(0.04, 0.37, 0.92, 0.33),
      },
    },

    {
      id: "s2-stat",
      component: "StatCounter",
      trackId: "content",
      from: 380, durationInFrames: 155,
      props: {
        value: 3,
        label: "reasons to use client: onClick · useState · Browser APIs",
        suffix: "",
        color: "#a78bfa",
        accentColor: "#a78bfa",
        decimals: 0,
        motion: { type: "spring", direction: "up", durationInFrames: 30, springProfile: "bouncy" },
        layout: zone(0.1, 0.72, 0.8, 0.22),
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  TRANSITION 2→3  (540 – 555)
    // ═══════════════════════════════════════════════════════════
    {
      id: "t2",
      component: "SlideTransition",
      trackId: "bg",
      from: 540, durationInFrames: 15,
      props: { direction: "left", durationInFrames: 15, color: "#060611" },
    },

    // ═══════════════════════════════════════════════════════════
    //  SECTION 3: Nested Layouts  (555 – 765)  accent: #34d399
    // ═══════════════════════════════════════════════════════════

    {
      id: "s3-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 555, durationInFrames: 210,
      props: {
        title: "",
        backgroundColor: "linear-gradient(180deg, #061a14 0%, #041410 50%, #020d09 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    {
      id: "s3-badge",
      component: "LowerThird",
      trackId: "overlay",
      from: 560, durationInFrames: 195,
      props: {
        name: "Concept 3 / 4",
        title: "Nested Layouts",
        accentColor: "#34d399",
        position: "top-left",
        motion: { type: "spring", direction: "left", durationInFrames: 15 },
        layout: zone(0, 0.03, 1, 0.12),
      },
    },

    {
      id: "s3-title",
      component: "TitleCard",
      trackId: "content",
      from: 565, durationInFrames: 200,
      props: {
        title: "Nested Layouts",
        subtitle: "Wrap pages in shared UI — preserved across navigations",
        alignment: "left",
        fontSize: 72,
        color: "#ecfdf5",
        accentColor: "#34d399",
        motion: { type: "spring", direction: "up", durationInFrames: 22, springProfile: "gentle" },
        layout: zone(0.06, 0.14, 0.88, 0.22),
      },
    },

    {
      id: "s3-code",
      component: "CodeBlock",
      trackId: "content",
      from: 580, durationInFrames: 185,
      props: {
        filename: "app/dashboard/layout.tsx",
        language: "tsx",
        code: `export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section>
      {/* Sidebar persists on every page */}
      <Sidebar />

      {/* Page content swaps here */}
      <main>{children}</main>
    </section>
  )
}`,
        highlightLines: [9, 12],
        showWindowChrome: true,
        animationStyle: "cascade",
        accentColor: "#34d399",
        motion: { type: "spring", direction: "up", durationInFrames: 20, springProfile: "gentle" },
        layout: zone(0.04, 0.37, 0.92, 0.35),
      },
    },

    {
      id: "s3-stat",
      component: "StatCounter",
      trackId: "content",
      from: 605, durationInFrames: 155,
      props: {
        value: 0,
        label: "re-renders when navigating between pages",
        suffix: "",
        color: "#34d399",
        accentColor: "#34d399",
        decimals: 0,
        motion: { type: "spring", direction: "up", durationInFrames: 30, springProfile: "bouncy" },
        layout: zone(0.1, 0.74, 0.8, 0.2),
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  TRANSITION 3→4  (765 – 780)
    // ═══════════════════════════════════════════════════════════
    {
      id: "t3",
      component: "SlideTransition",
      trackId: "bg",
      from: 765, durationInFrames: 15,
      props: { direction: "left", durationInFrames: 15, color: "#060611" },
    },

    // ═══════════════════════════════════════════════════════════
    //  SECTION 4: Special Files  (780 – 990)  accent: #fbbf24
    // ═══════════════════════════════════════════════════════════

    {
      id: "s4-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 780, durationInFrames: 210,
      props: {
        title: "",
        backgroundColor: "linear-gradient(180deg, #1c1200 0%, #150e00 50%, #0c0800 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    {
      id: "s4-badge",
      component: "LowerThird",
      trackId: "overlay",
      from: 785, durationInFrames: 195,
      props: {
        name: "Concept 4 / 4",
        title: "Special Files",
        accentColor: "#fbbf24",
        position: "top-left",
        motion: { type: "spring", direction: "left", durationInFrames: 15 },
        layout: zone(0, 0.03, 1, 0.12),
      },
    },

    {
      id: "s4-title",
      component: "TitleCard",
      trackId: "content",
      from: 790, durationInFrames: 200,
      props: {
        title: "Special Files",
        subtitle: "Convention-based files the router handles automatically",
        alignment: "left",
        fontSize: 72,
        color: "#fffbeb",
        accentColor: "#fbbf24",
        motion: { type: "spring", direction: "up", durationInFrames: 22, springProfile: "gentle" },
        layout: zone(0.06, 0.14, 0.88, 0.22),
      },
    },

    {
      id: "s4-code",
      component: "CodeBlock",
      trackId: "content",
      from: 805, durationInFrames: 185,
      props: {
        filename: "app/dashboard/",
        language: "fs",
        code: `app/
└── dashboard/
    ├── page.tsx       ← route UI
    ├── layout.tsx     ← shared wrapper
    ├── loading.tsx    ← Suspense fallback
    ├── error.tsx      ← error boundary
    ├── not-found.tsx  ← 404 handler
    └── route.ts       ← API endpoint`,
        highlightLines: [4, 5, 6, 7],
        showWindowChrome: true,
        animationStyle: "cascade",
        accentColor: "#fbbf24",
        motion: { type: "spring", direction: "up", durationInFrames: 20, springProfile: "gentle" },
        layout: zone(0.04, 0.37, 0.92, 0.33),
      },
    },

    {
      id: "s4-stat",
      component: "StatCounter",
      trackId: "content",
      from: 835, durationInFrames: 155,
      props: {
        value: 6,
        label: "convention-based files per route segment",
        suffix: "",
        color: "#fbbf24",
        accentColor: "#fbbf24",
        decimals: 0,
        motion: { type: "spring", direction: "up", durationInFrames: 30, springProfile: "bouncy" },
        layout: zone(0.1, 0.74, 0.8, 0.2),
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  TRANSITION 4→OUTRO  (990 – 1005)
    // ═══════════════════════════════════════════════════════════
    {
      id: "t4",
      component: "FadeTransition",
      trackId: "bg",
      from: 990, durationInFrames: 15,
      props: { durationInFrames: 15, color: "#060611" },
    },

    // ═══════════════════════════════════════════════════════════
    //  OUTRO  (1005 – 1200)
    // ═══════════════════════════════════════════════════════════

    {
      id: "outro-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 1005, durationInFrames: 195,
      props: {
        title: "",
        backgroundColor: "linear-gradient(160deg, #0a0a1a 0%, #0e1630 50%, #0a0a1a 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    {
      id: "outro-title",
      component: "TitleCard",
      trackId: "content",
      from: 1010, durationInFrames: 190,
      props: {
        title: "That's App Router!",
        subtitle: "Server · Client · Layouts · Special Files",
        alignment: "center",
        fontSize: 90,
        color: "#f0f9ff",
        accentColor: "#38bdf8",
        eyebrow: "You just learned",
        motion: { type: "spring", direction: "up", durationInFrames: 25, springProfile: "gentle" },
      },
    },

    {
      id: "outro-cta",
      component: "LowerThird",
      trackId: "overlay",
      from: 1040, durationInFrames: 155,
      props: {
        name: "Follow for more",
        title: "New Next.js tips every week",
        accentColor: "#38bdf8",
        position: "bottom-left",
        motion: { type: "spring", direction: "left", durationInFrames: 18 },
      },
    },

    {
      id: "outro-stat",
      component: "StatCounter",
      trackId: "content",
      from: 1060, durationInFrames: 135,
      props: {
        value: 4,
        label: "concepts mastered",
        suffix: "",
        color: "#38bdf8",
        accentColor: "#38bdf8",
        decimals: 0,
        motion: { type: "spring", direction: "up", durationInFrames: 30, springProfile: "bouncy" },
        layout: zone(0.15, 0.72, 0.7, 0.2),
      },
    },

  ],
};

// ─── RESTful APIs the Next.js Way Reel ───────────────────────────────────────
//
// Layout system — same vertical 1080×1920 zone grid as nextjsReel:
//   badge zone:  y 0.03–0.14  (section number + eyebrow)
//   title zone:  y 0.14–0.36  (section heading + descriptor)
//   code zone:   y 0.37–0.73  (CodeBlock)
//   stat zone:   y 0.74–0.94  (StatCounter)
//
// Theme colours per section:
//   Hook / Outro  — orange    #f97316
//   Section 1     — blue      #3b82f6  (Route Handlers)
//   Section 2     — violet    #a78bfa  (Dynamic Routes)
//   Section 3     — rose      #f43f5e  (Middleware & Auth)
//   Section 4     — emerald   #34d399  (Consuming the API)
//
// Timeline:
//   Hook .............. 0    – 90    (3 s)
//   Transition ........ 90   – 105
//   Section 1 ......... 105  – 315   (7 s)
//   Transition ........ 315  – 330
//   Section 2 ......... 330  – 540   (7 s)
//   Transition ........ 540  – 555
//   Section 3 ......... 555  – 765   (7 s)
//   Transition ........ 765  – 780
//   Section 4 ......... 780  – 990   (7 s)
//   Transition ........ 990  – 1005
//   Outro ............. 1005 – 1200  (6.5 s)
//
// Total: 1200 frames = 40 s @ 30 fps

const nextjsApiReel = {
  id: "nextjs-api-reel-v1",
  title: "RESTful APIs the Next.js Way — Premium Reel",
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 1200,
  backgroundColor: "#060611",
  audio: {
    src: "music/muted-warning.mp3",
    volume: 0.30,
    startFrom: 0,
    attribution: '"Muted Warning" by jaspertine — CC Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/) — https://ccmixter.org/files/jaspertine/70612',
  },
  tracks: [
    { id: "bg",      label: "Background",   zIndex: 0, hidden: false },
    { id: "content", label: "Content",       zIndex: 1, hidden: false },
    { id: "overlay", label: "Overlay/Badge", zIndex: 2, hidden: false },
  ],
  clips: [

    // ═══════════════════════════════════════════════════════════
    //  HOOK  (0 – 90)
    // ═══════════════════════════════════════════════════════════

    {
      id: "hook-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 0, durationInFrames: 90,
      props: {
        title: "",
        backgroundColor: "linear-gradient(160deg, #1a0805 0%, #0f0613 40%, #060611 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    {
      id: "hook-title",
      component: "TitleCard",
      trackId: "content",
      from: 6, durationInFrames: 84,
      props: {
        title: "RESTful APIs\nThe Next.js Way",
        subtitle: "Building & Consuming Scalable Endpoints",
        alignment: "center",
        color: "#fef3c7",
        accentColor: "#f97316",
        eyebrow: "Next.js 14 · App Router",
        motion: { type: "spring", direction: "up", durationInFrames: 25, springProfile: "cinematic" },
        layout: zone(0.05, 0.26, 0.9, 0.48),
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  TRANSITION 0→1  (90 – 105)
    // ═══════════════════════════════════════════════════════════
    {
      id: "api-t0",
      component: "SlideTransition",
      trackId: "bg",
      from: 90, durationInFrames: 15,
      props: { direction: "left", durationInFrames: 15, color: "#060611" },
    },

    // ═══════════════════════════════════════════════════════════
    //  SECTION 1: Route Handlers  (105 – 315)  accent: #3b82f6
    // ═══════════════════════════════════════════════════════════

    {
      id: "api-s1-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 105, durationInFrames: 210,
      props: {
        title: "",
        backgroundColor: "linear-gradient(180deg, #0a1628 0%, #091222 50%, #060e1a 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    {
      id: "api-s1-badge",
      component: "LowerThird",
      trackId: "overlay",
      from: 110, durationInFrames: 195,
      props: {
        name: "Concept 1 / 4",
        title: "Route Handlers",
        accentColor: "#3b82f6",
        position: "top-left",
        motion: { type: "spring", direction: "left", durationInFrames: 15 },
        layout: zone(0, 0.03, 1, 0.12),
      },
    },

    {
      id: "api-s1-title",
      component: "TitleCard",
      trackId: "content",
      from: 115, durationInFrames: 200,
      props: {
        title: "app/api/ is\nall you need",
        subtitle: "GET, POST, DELETE — one file, one export per HTTP method",
        alignment: "left",
        fontSize: 72,
        color: "#eff6ff",
        accentColor: "#3b82f6",
        motion: { type: "spring", direction: "up", durationInFrames: 22, springProfile: "gentle" },
        layout: zone(0.06, 0.14, 0.88, 0.22),
      },
    },

    {
      id: "api-s1-code",
      component: "CodeBlock",
      trackId: "content",
      from: 130, durationInFrames: 185,
      props: {
        filename: "app/api/users/route.ts",
        language: "ts",
        code: `import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const users = await db.user.findMany({
    select: { id: true, name: true },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const user = await db.user.create({ data: body })
  return NextResponse.json(user, { status: 201 })
}`,
        highlightLines: [4, 11],
        showWindowChrome: true,
        animationStyle: "cascade",
        accentColor: "#3b82f6",
        motion: { type: "spring", direction: "up", durationInFrames: 20, springProfile: "gentle" },
        layout: zone(0.04, 0.37, 0.92, 0.36),
      },
    },

    {
      id: "api-s1-stat",
      component: "StatCounter",
      trackId: "content",
      from: 160, durationInFrames: 155,
      props: {
        value: 201,
        label: "HTTP status on resource create",
        suffix: "",
        color: "#3b82f6",
        accentColor: "#3b82f6",
        decimals: 0,
        motion: { type: "spring", direction: "up", durationInFrames: 30, springProfile: "bouncy" },
        layout: zone(0.1, 0.74, 0.8, 0.2),
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  TRANSITION 1→2  (315 – 330)
    // ═══════════════════════════════════════════════════════════
    {
      id: "api-t1",
      component: "SlideTransition",
      trackId: "bg",
      from: 315, durationInFrames: 15,
      props: { direction: "left", durationInFrames: 15, color: "#060611" },
    },

    // ═══════════════════════════════════════════════════════════
    //  SECTION 2: Dynamic Routes  (330 – 540)  accent: #a78bfa
    // ═══════════════════════════════════════════════════════════

    {
      id: "api-s2-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 330, durationInFrames: 210,
      props: {
        title: "",
        backgroundColor: "linear-gradient(180deg, #150d2e 0%, #110a26 50%, #0a061a 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    {
      id: "api-s2-badge",
      component: "LowerThird",
      trackId: "overlay",
      from: 335, durationInFrames: 200,
      props: {
        name: "Concept 2 / 4",
        title: "Dynamic Routes",
        accentColor: "#a78bfa",
        position: "top-left",
        motion: { type: "spring", direction: "left", durationInFrames: 15 },
        layout: zone(0, 0.03, 1, 0.12),
      },
    },

    {
      id: "api-s2-title",
      component: "TitleCard",
      trackId: "content",
      from: 340, durationInFrames: 195,
      props: {
        title: "[id] routes with\ntype-safe params",
        subtitle: "Segment params flow into your handler — plus 404 in one return",
        alignment: "left",
        fontSize: 68,
        color: "#f5f3ff",
        accentColor: "#a78bfa",
        motion: { type: "spring", direction: "up", durationInFrames: 22, springProfile: "gentle" },
        layout: zone(0.06, 0.14, 0.88, 0.22),
      },
    },

    {
      id: "api-s2-code",
      component: "CodeBlock",
      trackId: "content",
      from: 355, durationInFrames: 180,
      props: {
        filename: "app/api/users/[id]/route.ts",
        language: "ts",
        code: `import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await db.user.findUnique({
    where: { id: params.id },
  })
  if (!user) {
    return NextResponse.json(
      { error: "Not found" }, { status: 404 }
    )
  }
  return NextResponse.json(user)
}`,
        highlightLines: [4, 5, 6, 11, 12, 13],
        showWindowChrome: true,
        animationStyle: "cascade",
        accentColor: "#a78bfa",
        motion: { type: "spring", direction: "up", durationInFrames: 20, springProfile: "gentle" },
        layout: zone(0.04, 0.37, 0.92, 0.38),
      },
    },

    {
      id: "api-s2-stat",
      component: "StatCounter",
      trackId: "content",
      from: 390, durationInFrames: 145,
      props: {
        value: 404,
        label: "handled gracefully",
        suffix: "",
        color: "#a78bfa",
        accentColor: "#a78bfa",
        decimals: 0,
        motion: { type: "spring", direction: "up", durationInFrames: 30, springProfile: "bouncy" },
        layout: zone(0.1, 0.76, 0.8, 0.2),
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  TRANSITION 2→3  (540 – 555)
    // ═══════════════════════════════════════════════════════════
    {
      id: "api-t2",
      component: "SlideTransition",
      trackId: "bg",
      from: 540, durationInFrames: 15,
      props: { direction: "left", durationInFrames: 15, color: "#060611" },
    },

    // ═══════════════════════════════════════════════════════════
    //  SECTION 3: Middleware & Auth  (555 – 765)  accent: #f43f5e
    // ═══════════════════════════════════════════════════════════

    {
      id: "api-s3-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 555, durationInFrames: 210,
      props: {
        title: "",
        backgroundColor: "linear-gradient(180deg, #1c0a10 0%, #160810 50%, #0d060a 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    {
      id: "api-s3-badge",
      component: "LowerThird",
      trackId: "overlay",
      from: 560, durationInFrames: 200,
      props: {
        name: "Concept 3 / 4",
        title: "Middleware & Auth",
        accentColor: "#f43f5e",
        position: "top-left",
        motion: { type: "spring", direction: "left", durationInFrames: 15 },
        layout: zone(0, 0.03, 1, 0.12),
      },
    },

    {
      id: "api-s3-title",
      component: "TitleCard",
      trackId: "content",
      from: 565, durationInFrames: 195,
      props: {
        title: "One file,\nevery route secured",
        subtitle: "middleware.ts intercepts before your handler even runs",
        alignment: "left",
        fontSize: 68,
        color: "#fff1f2",
        accentColor: "#f43f5e",
        motion: { type: "spring", direction: "up", durationInFrames: 22, springProfile: "gentle" },
        layout: zone(0.06, 0.14, 0.88, 0.22),
      },
    },

    {
      id: "api-s3-code",
      component: "CodeBlock",
      trackId: "content",
      from: 580, durationInFrames: 185,
      props: {
        filename: "middleware.ts",
        language: "ts",
        code: `import { NextRequest, NextResponse } from "next/server"

export function middleware(req: NextRequest) {
  const auth = req.headers.get("Authorization")
  if (!auth?.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    )
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*"],
}`,
        highlightLines: [3, 4, 5, 14, 15],
        showWindowChrome: true,
        animationStyle: "cascade",
        accentColor: "#f43f5e",
        motion: { type: "spring", direction: "up", durationInFrames: 20, springProfile: "gentle" },
        layout: zone(0.04, 0.37, 0.92, 0.37),
      },
    },

    {
      id: "api-s3-stat",
      component: "StatCounter",
      trackId: "content",
      from: 615, durationInFrames: 150,
      props: {
        value: 1,
        label: "file secures all /api routes",
        suffix: "",
        color: "#f43f5e",
        accentColor: "#f43f5e",
        decimals: 0,
        motion: { type: "spring", direction: "up", durationInFrames: 30, springProfile: "bouncy" },
        layout: zone(0.1, 0.75, 0.8, 0.2),
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  TRANSITION 3→4  (765 – 780)
    // ═══════════════════════════════════════════════════════════
    {
      id: "api-t3",
      component: "SlideTransition",
      trackId: "bg",
      from: 765, durationInFrames: 15,
      props: { direction: "left", durationInFrames: 15, color: "#060611" },
    },

    // ═══════════════════════════════════════════════════════════
    //  SECTION 4: Consuming the API  (780 – 990)  accent: #34d399
    // ═══════════════════════════════════════════════════════════

    {
      id: "api-s4-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 780, durationInFrames: 210,
      props: {
        title: "",
        backgroundColor: "linear-gradient(180deg, #071c14 0%, #061510 50%, #040e0a 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    {
      id: "api-s4-badge",
      component: "LowerThird",
      trackId: "overlay",
      from: 785, durationInFrames: 200,
      props: {
        name: "Concept 4 / 4",
        title: "Consuming Your API",
        accentColor: "#34d399",
        position: "top-left",
        motion: { type: "spring", direction: "left", durationInFrames: 15 },
        layout: zone(0, 0.03, 1, 0.12),
      },
    },

    {
      id: "api-s4-title",
      component: "TitleCard",
      trackId: "content",
      from: 790, durationInFrames: 195,
      props: {
        title: "Fetch with\nbuilt-in caching",
        subtitle: "Server Components call your own API with ISR-style revalidation",
        alignment: "left",
        fontSize: 72,
        color: "#ecfdf5",
        accentColor: "#34d399",
        motion: { type: "spring", direction: "up", durationInFrames: 22, springProfile: "gentle" },
        layout: zone(0.06, 0.14, 0.88, 0.22),
      },
    },

    {
      id: "api-s4-code",
      component: "CodeBlock",
      trackId: "content",
      from: 805, durationInFrames: 185,
      props: {
        filename: "app/users/page.tsx",
        language: "tsx",
        code: `async function UserList() {
  const res = await fetch("/api/users", {
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error("Fetch failed")

  const users: User[] = await res.json()

  return (
    <ul className="space-y-2">
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}`,
        highlightLines: [2, 3],
        showWindowChrome: true,
        animationStyle: "cascade",
        accentColor: "#34d399",
        motion: { type: "spring", direction: "up", durationInFrames: 20, springProfile: "gentle" },
        layout: zone(0.04, 0.37, 0.92, 0.37),
      },
    },

    {
      id: "api-s4-stat",
      component: "StatCounter",
      trackId: "content",
      from: 840, durationInFrames: 150,
      props: {
        value: 60,
        label: "second cache revalidation",
        suffix: "s",
        color: "#34d399",
        accentColor: "#34d399",
        decimals: 0,
        motion: { type: "spring", direction: "up", durationInFrames: 30, springProfile: "bouncy" },
        layout: zone(0.1, 0.75, 0.8, 0.2),
      },
    },

    // ═══════════════════════════════════════════════════════════
    //  TRANSITION 4→Outro  (990 – 1005)
    // ═══════════════════════════════════════════════════════════
    {
      id: "api-t4",
      component: "FadeTransition",
      trackId: "bg",
      from: 990, durationInFrames: 15,
      props: { durationInFrames: 15, color: "#060611" },
    },

    // ═══════════════════════════════════════════════════════════
    //  OUTRO  (1005 – 1200)
    // ═══════════════════════════════════════════════════════════

    {
      id: "api-outro-bg",
      component: "TitleCard",
      trackId: "bg",
      from: 1005, durationInFrames: 195,
      props: {
        title: "",
        backgroundColor: "linear-gradient(160deg, #0a0812 0%, #0d0a1a 50%, #060611 100%)",
        motion: { type: "none", direction: "none" },
      },
    },

    {
      id: "api-outro-title",
      component: "TitleCard",
      trackId: "content",
      from: 1015, durationInFrames: 180,
      props: {
        title: "Build APIs\nthat scale",
        subtitle: "Route Handlers · Dynamic Routes · Middleware · Server Fetch",
        alignment: "center",
        color: "#f8fafc",
        accentColor: "#f97316",
        eyebrow: "Next.js 14 App Router",
        motion: { type: "spring", direction: "up", durationInFrames: 30, springProfile: "cinematic" },
        layout: zone(0.05, 0.26, 0.9, 0.48),
      },
    },

    {
      id: "api-outro-stat",
      component: "StatCounter",
      trackId: "content",
      from: 1065, durationInFrames: 130,
      props: {
        value: 4,
        label: "concepts, zero extra config",
        suffix: "",
        color: "#f97316",
        accentColor: "#f97316",
        decimals: 0,
        motion: { type: "spring", direction: "up", durationInFrames: 30, springProfile: "bouncy" },
        layout: zone(0.15, 0.74, 0.7, 0.2),
      },
    },

  ],
};

// ─── Composition cast ─────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TimelineComposition = TimelineRenderer as React.ComponentType<any>;

// ─── Root ─────────────────────────────────────────────────────────────────────

export const RemotionRoot: React.FC = () => (
  <>
    {/* V2 premium reel — 1080×1920 vertical, 40 s */}
    <Composition
      id="NextjsAppRouterReelV2"
      component={TimelineComposition}
      durationInFrames={1200}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ timeline: nextjsReel as unknown as Timeline }}
    />

    {/* RESTful APIs the Next.js Way — 1080×1920 vertical, 40 s */}
    <Composition
      id="NextjsApiReelV1"
      component={TimelineComposition}
      durationInFrames={1200}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{ timeline: nextjsApiReel as unknown as Timeline }}
    />

    {/* Dynamic agent composition — pass ?timeline=<json> via --props */}
    <Composition
      id="AgentComposition"
      component={TimelineComposition}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ timeline: nextjsReel as unknown as Timeline }}
      calculateMetadata={({ props }) => {
        try {
          const t = TimelineSchema.parse((props as any).timeline);
          return {
            durationInFrames: t.durationInFrames,
            fps: t.fps,
            width: t.width,
            height: t.height,
            props: { timeline: t },
          };
        } catch {
          return {};
        }
      }}
    />

    {/* Auto-registered compositions from the registry */}
    {COMPOSITIONS.map((c) => (
      <Composition
        key={c.id}
        id={c.id}
        component={TimelineComposition}
        durationInFrames={c.timeline.durationInFrames}
        fps={c.timeline.fps}
        width={c.timeline.width}
        height={c.timeline.height}
        defaultProps={{ timeline: c.timeline as unknown as Timeline }}
      />
    ))}
  </>
);
