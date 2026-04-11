/**
 * academy-factory.ts
 * Compact factory: pass a VideoSpec → get a full 28-clip, 900-frame Timeline back.
 * This keeps the spec files small and avoids repeating 28 clip definitions 100×.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const LOGO =
  "https://www.kolaborate.africa/_next/image?url=%2Flogo.png&w=384&q=75&dpl=dpl_CiMGbgMpJQsqyT4XvX3L8XWZYgKJ";
const MUSIC_ATTR =
  '"Muted Warning" by jaspertine — CC Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/) — https://ccmixter.org/files/jaspertine/70612';
const BG_HOOK  = "linear-gradient(160deg,#061209 0%,#0d2410 60%,#061209 100%)";
const BG_SEC   = "linear-gradient(160deg,#061209 0%,#0e2a12 60%,#061209 100%)";
const BG_OUTRO = "linear-gradient(160deg,#0d2410 0%,#1a4a1e 50%,#0d2410 100%)";

const TRACKS = [
  { id: "bg",      label: "Background",   zIndex: 0, hidden: false },
  { id: "content", label: "Content",       zIndex: 1, hidden: false },
  { id: "overlay", label: "Overlay/Badge", zIndex: 2, hidden: false },
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BarItem { label: string; value: number; color: string; }

export interface VideoSpec {
  id: string;
  title: string;
  prefix: string;           // unique per episode e.g. "g1", "ar2"
  accent: string;           // series accent hex
  seriesName: string;       // e.g. "Git & Version Control"
  epNum: string;            // "01" … "05"
  audioStartFrom: number;   // 0, 15, 30, 45, 60
  hook: { title: string; sub: string };
  s1:   { topic: string; title: string; body: string; statVal: number; statSuffix: string; statLabel: string };
  s2:   { topic: string; title: string; chartTitle: string; bars: BarItem[]; caption: string };
  s3:   { topic: string; title: string; body: string; ringPct: number; ringLabel: string };
  outro:{ teaser: string; statVal: number; statSuffix: string; statLabel: string };
}

// ─── Factory ──────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function makeTimeline(s: VideoSpec): any {
  const p   = s.prefix;
  const acc = s.accent;
  const ep  = s.epNum;

  const spring = (dir: string, dur = 20, profile = "gentle") =>
    ({ type: "spring", direction: dir, durationInFrames: dur, springProfile: profile });

  return {
    id:               s.id,
    title:            s.title,
    fps:              30,
    width:            1080,
    height:           1920,
    durationInFrames: 900,
    backgroundColor:  "#061209",
    audio: {
      src:         "music/muted-warning.mp3",
      volume:      0.28,
      startFrom:   s.audioStartFrom,
      attribution: MUSIC_ATTR,
    },
    tracks: TRACKS,
    clips: [

      // ═══ HOOK (0–90) ═══════════════════════════════════════════════════════
      { id:`${p}-hook-bg`,    component:"TitleCard",    trackId:"bg",      from:0,  durationInFrames:90,
        props:{ title:"", backgroundColor:BG_HOOK, motion:{type:"none",direction:"none"} }},
      { id:`${p}-hook-title`, component:"TitleCard",    trackId:"content", from:0,  durationInFrames:90,
        props:{ title:s.hook.title, subtitle:s.hook.sub, alignment:"center", fontSize:88, color:"#ffffff",
                accentColor:acc, eyebrow:`KOLABORATE ACADEMY  ·  ${ep}/05`,
                motion: spring("up", 25, "gentle") }},
      { id:`${p}-hook-badge`, component:"SubtitleCard", trackId:"overlay", from:5,  durationInFrames:80,
        props:{ text:`EPISODE ${ep} OF 05 — ${s.seriesName.toUpperCase()}`,
                alignment:"left", fontSize:24, color:"#35b544",
                layout:{x:0.06,y:0.04,width:0.88,height:0.06},
                motion: spring("down", 15, "snappy") }},
      { id:`${p}-hook-lt`,    component:"LowerThird",   trackId:"overlay", from:10, durationInFrames:75,
        props:{ name:"kolaborate.africa", title:"Academy — Free Dev Education",
                accentColor:"#35b544", textColor:"#e1f4e4", position:"bottom-left" }},

      // ═══ TRANSITIONS ═══════════════════════════════════════════════════════
      { id:`${p}-t1`, component:"SlideTransition", trackId:"overlay", from:90,  durationInFrames:15, props:{durationInFrames:15,color:"#2a8a34",direction:"up"} },
      { id:`${p}-t2`, component:"FadeTransition",  trackId:"overlay", from:285, durationInFrames:15, props:{durationInFrames:15,color:"#061209"} },
      { id:`${p}-t3`, component:"SlideTransition", trackId:"overlay", from:480, durationInFrames:15, props:{durationInFrames:15,color:"#2a8a34",direction:"left"} },
      { id:`${p}-t4`, component:"FadeTransition",  trackId:"overlay", from:690, durationInFrames:15, props:{durationInFrames:15,color:"#061209"} },

      // ═══ SECTION 1 (105–285) — stat ════════════════════════════════════════
      { id:`${p}-s1-bg`,    component:"TitleCard",    trackId:"bg",      from:105, durationInFrames:180,
        props:{ title:"", backgroundColor:BG_SEC, motion:{type:"none",direction:"none"} }},
      { id:`${p}-s1-bdg`,   component:"SubtitleCard", trackId:"overlay", from:110, durationInFrames:175,
        props:{ text:`01 — ${s.s1.topic}`, alignment:"left", fontSize:28, color:acc,
                layout:{x:0.06,y:0.04,width:0.88,height:0.07}, motion: spring("down",15,"snappy") }},
      { id:`${p}-s1-ttl`,   component:"TitleCard",    trackId:"content", from:110, durationInFrames:175,
        props:{ title:s.s1.title, alignment:"left", fontSize:82, color:"#ffffff", accentColor:acc,
                layout:{x:0.06,y:0.12,width:0.88,height:0.28}, motion: spring("up",20,"gentle") }},
      { id:`${p}-s1-sub`,   component:"SubtitleCard", trackId:"content", from:122, durationInFrames:163,
        props:{ text:s.s1.body, alignment:"left", fontSize:40, color:"#e1f4e4", maxWidth:940,
                layout:{x:0.06,y:0.44,width:0.88,height:0.26},
                motion:{type:"spring",direction:"up",durationInFrames:20,delay:8,springProfile:"gentle"} }},
      { id:`${p}-s1-stat`,  component:"StatCounter",  trackId:"content", from:138, durationInFrames:147,
        props:{ value:s.s1.statVal, label:s.s1.statLabel, suffix:s.s1.statSuffix,
                color:"#fbdf64", fontSize:140,
                layout:{x:0.06,y:0.72,width:0.88,height:0.24},
                motion:{type:"spring",direction:"up",durationInFrames:20,delay:15} }},

      // ═══ SECTION 2 (300–480) — chart ═══════════════════════════════════════
      { id:`${p}-s2-bg`,    component:"TitleCard",    trackId:"bg",      from:300, durationInFrames:180,
        props:{ title:"", backgroundColor:BG_SEC, motion:{type:"none",direction:"none"} }},
      { id:`${p}-s2-bdg`,   component:"SubtitleCard", trackId:"overlay", from:305, durationInFrames:175,
        props:{ text:`02 — ${s.s2.topic}`, alignment:"left", fontSize:28, color:acc,
                layout:{x:0.06,y:0.04,width:0.88,height:0.07}, motion: spring("down",15,"snappy") }},
      { id:`${p}-s2-ttl`,   component:"TitleCard",    trackId:"content", from:305, durationInFrames:175,
        props:{ title:s.s2.title, alignment:"left", fontSize:64, color:"#ffffff", accentColor:acc,
                layout:{x:0.06,y:0.04,width:0.88,height:0.16}, motion: spring("up",20,"gentle") }},
      { id:`${p}-s2-chart`, component:"BarChart",     trackId:"content", from:320, durationInFrames:160,
        props:{ data:s.s2.bars, title:s.s2.chartTitle, horizontal:true, showValues:true, barColor:acc,
                layout:{x:0.06,y:0.22,width:0.88,height:0.50},
                motion:{type:"spring",direction:"up",durationInFrames:25} }},
      { id:`${p}-s2-cap`,   component:"Caption",      trackId:"overlay", from:340, durationInFrames:140,
        props:{ text:s.s2.caption, position:"bottom", fontSize:36,
                backgroundColor:"#35b544", textColor:"#ffffff" }},

      // ═══ SECTION 3 (495–690) — ring ════════════════════════════════════════
      { id:`${p}-s3-bg`,    component:"TitleCard",    trackId:"bg",      from:495, durationInFrames:195,
        props:{ title:"", backgroundColor:BG_SEC, motion:{type:"none",direction:"none"} }},
      { id:`${p}-s3-bdg`,   component:"SubtitleCard", trackId:"overlay", from:500, durationInFrames:190,
        props:{ text:`03 — ${s.s3.topic}`, alignment:"left", fontSize:28, color:acc,
                layout:{x:0.06,y:0.04,width:0.88,height:0.07}, motion: spring("down",15,"snappy") }},
      { id:`${p}-s3-ttl`,   component:"TitleCard",    trackId:"content", from:500, durationInFrames:190,
        props:{ title:s.s3.title, alignment:"left", fontSize:76, color:"#ffffff", accentColor:acc,
                layout:{x:0.06,y:0.12,width:0.88,height:0.25}, motion: spring("up",20,"gentle") }},
      { id:`${p}-s3-sub`,   component:"SubtitleCard", trackId:"content", from:515, durationInFrames:175,
        props:{ text:s.s3.body, alignment:"left", fontSize:40, color:"#e1f4e4", maxWidth:940,
                layout:{x:0.06,y:0.40,width:0.88,height:0.24},
                motion:{type:"spring",direction:"up",durationInFrames:20,delay:8,springProfile:"gentle"} }},
      { id:`${p}-s3-ring`,  component:"ProgressRing", trackId:"content", from:530, durationInFrames:160,
        props:{ percentage:s.s3.ringPct, label:s.s3.ringLabel, size:260, strokeWidth:22, color:acc,
                trackColor:"#0e2a12", showPercentage:true,
                layout:{x:0.25,y:0.65,width:0.50,height:0.30},
                motion:{type:"spring",direction:"in",durationInFrames:40,springProfile:"gentle"} }},

      // ═══ OUTRO (705–900) ═══════════════════════════════════════════════════
      { id:`${p}-out-bg`,   component:"TitleCard",     trackId:"bg",      from:705, durationInFrames:195,
        props:{ title:"", backgroundColor:BG_OUTRO, motion:{type:"none",direction:"none"} }},
      { id:`${p}-out-logo`, component:"LogoAnimation", trackId:"content", from:710, durationInFrames:180,
        props:{ src:LOGO, size:160, springProfile:"bouncy",
                layout:{x:0.35,y:0.08,width:0.30,height:0.18} }},
      { id:`${p}-out-cta`,  component:"TitleCard",     trackId:"content", from:720, durationInFrames:175,
        props:{ title:s.outro.teaser, subtitle:"Follow @kolaborate.africa for the full series",
                alignment:"center", fontSize:68, color:"#ffffff", accentColor:"#fbdf64",
                layout:{x:0.06,y:0.28,width:0.88,height:0.45},
                motion: spring("up",25,"gentle") }},
      { id:`${p}-out-stat`, component:"StatCounter",   trackId:"content", from:735, durationInFrames:160,
        props:{ value:s.outro.statVal, label:s.outro.statLabel, suffix:s.outro.statSuffix,
                color:"#35b544", fontSize:110,
                layout:{x:0.06,y:0.72,width:0.88,height:0.22},
                motion:{type:"spring",direction:"up",durationInFrames:20,delay:10} }},
      { id:`${p}-out-lt`,   component:"LowerThird",    trackId:"overlay", from:730, durationInFrames:165,
        props:{ name:"kolaborate.africa", title:"Free Dev Education for Africa & Beyond",
                accentColor:"#fbdf64", textColor:"#ffffff", position:"bottom-left" }},
    ],
  };
}
