#!/usr/bin/env python3
"""
Syntra Social → Remotion Timeline Generator
Extracts JSON timeline blocks from Social/ markdown files,
transforms legacy format to match the actual Remotion Zod schema,
and writes validated output to examples/syntra/.

Usage:
  python scripts/video-gen.py                    # Process all week-*.md files
  python scripts/video-gen.py --fix              # Also fix existing JSONs in examples/syntra/
  python scripts/video-gen.py --validate-only    # Only validate, don't write
"""

import os
import re
import json
import copy
import glob
import sys

# ─── Configuration ───────────────────────────────────────────────────────────
# Auto-detect paths relative to script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
OUTPUT_DIR = os.path.join(ROOT_DIR, "examples/syntra")

# Try common social content locations
SOCIAL_DIR_CANDIDATES = [
    os.path.join(os.path.expanduser("~"), "Documents/Syntra/Social"),
    os.path.join(ROOT_DIR, "../Syntra/Social"),
]
SOCIAL_DIR = None
for candidate in SOCIAL_DIR_CANDIDATES:
    if os.path.isdir(candidate):
        SOCIAL_DIR = candidate
        break

# ─── Valid Component Props (matches src/remotion/schema/timeline.ts) ──────────

VALID_COMPONENTS = {
    "TitleCard", "SubtitleCard", "LowerThird", "Caption", "CodeBlock",
    "BarChart", "LineChart", "StatCounter", "ProgressRing",
    "ImageReveal", "VideoBackground", "SplitScreen", "LogoAnimation",
    "FadeTransition", "SlideTransition", "ZoomTransition"
}

BASE_PROPS = {"motion", "backgroundColor", "opacity", "layout", "eyebrow", "accentColor"}

COMPONENT_PROPS = {
    "TitleCard": BASE_PROPS | {"title", "subtitle", "alignment", "fontSize", "color", "fontWeight", "letterSpacing"},
    "SubtitleCard": BASE_PROPS | {"text", "alignment", "fontSize", "color", "maxWidth"},
    "LowerThird": BASE_PROPS | {"name", "title", "accentColor", "textColor", "position"},
    "Caption": BASE_PROPS | {"text", "position", "fontSize", "backgroundColor", "textColor"},
    "CodeBlock": BASE_PROPS | {"code", "language", "filename", "highlightLines", "fontSize", "showWindowChrome", "animationStyle"},
    "BarChart": BASE_PROPS | {"data", "title", "maxValue", "barColor", "accentColor", "showValues", "horizontal"},
    "LineChart": BASE_PROPS | {"data", "title", "lineColor", "fillColor", "showPoints", "smooth"},
    "StatCounter": BASE_PROPS | {"value", "label", "prefix", "suffix", "color", "fontSize", "decimals"},
    "ProgressRing": BASE_PROPS | {"percentage", "label", "size", "strokeWidth", "color", "trackColor", "showPercentage"},
    "ImageReveal": BASE_PROPS | {"src", "alt", "revealDirection", "objectFit", "overlay", "overlayColor", "overlayOpacity"},
    "VideoBackground": BASE_PROPS | {"src", "playbackRate", "muted", "loop", "overlay", "overlayColor", "overlayOpacity"},
    "SplitScreen": BASE_PROPS | {"leftContent", "rightContent", "splitRatio", "splitDirection", "gap"},
    "LogoAnimation": BASE_PROPS | {"src", "size", "springProfile", "showText", "text", "textColor"},
    "FadeTransition": BASE_PROPS | {"durationInFrames", "color", "direction"},
    "SlideTransition": BASE_PROPS | {"durationInFrames", "color", "direction"},
    "ZoomTransition": BASE_PROPS | {"durationInFrames", "color", "direction"},
}

VALID_CAPTION_POSITIONS = {"top", "bottom"}
VALID_DIRECTIONS = {"left", "right", "up", "down", "in", "out"}


# ─── Prop Fixer ──────────────────────────────────────────────────────────────

def fix_clip_props(clip):
    """Fix clip props to match the actual Zod schema."""
    component = clip.get("component")
    props = clip.get("props", {})
    if component not in VALID_COMPONENTS:
        return clip

    fixed = copy.deepcopy(props)

    if component == "TitleCard":
        if "textColor" in fixed and "color" not in fixed:
            fixed["color"] = fixed.pop("textColor")
        elif "textColor" in fixed:
            del fixed["textColor"]

    elif component == "SubtitleCard":
        if "textColor" in fixed and "color" not in fixed:
            fixed["color"] = fixed.pop("textColor")
        elif "textColor" in fixed:
            del fixed["textColor"]
        if "text" not in fixed and "title" in fixed:
            fixed["text"] = fixed.pop("title")

    elif component == "Caption":
        if "color" in fixed and "textColor" not in fixed:
            fixed["textColor"] = fixed.pop("color")
        elif "color" in fixed:
            del fixed["color"]
        pos = fixed.get("position")
        if isinstance(pos, dict):
            y = pos.get("y", 960)
            fixed["position"] = "bottom" if y > 960 else "top"
        elif isinstance(pos, str) and pos not in VALID_CAPTION_POSITIONS:
            fixed["position"] = "bottom"
        fixed.pop("fontWeight", None)
        if "text" not in fixed:
            fixed["text"] = "..."

    elif component == "LogoAnimation":
        fixed.pop("scale", None)
        fixed.pop("animationType", None)
        fixed.pop("animation", None)
        if "src" not in fixed or not fixed["src"]:
            fixed["src"] = "syntra-logo.png"

    elif component == "StatCounter":
        val = fixed.get("value")
        if isinstance(val, str):
            cleaned = re.sub(r'[^\d.]', '', val)
            try:
                fixed["value"] = float(cleaned) if '.' in cleaned else int(cleaned)
            except (ValueError, TypeError):
                fixed["value"] = 0
            if val.startswith("$") and "prefix" not in fixed:
                fixed["prefix"] = "$"
            for s in ["+", "x", "%", "M", "K"]:
                if val.endswith(s) and "suffix" not in fixed:
                    fixed["suffix"] = s
        elif val is None:
            fixed["value"] = 0
        if "valueColor" in fixed and "color" not in fixed:
            fixed["color"] = fixed.pop("valueColor")
        elif "valueColor" in fixed:
            del fixed["valueColor"]
        fixed.pop("labelColor", None)
        fixed.pop("labelFontSize", None)
        if "label" not in fixed:
            fixed["label"] = "Metric"

    elif component == "SplitScreen":
        for side in ["leftContent", "rightContent"]:
            content = fixed.get(side)
            if content is None:
                fixed[side] = {"type": "color", "value": "#0F172A"}
            elif isinstance(content, str):
                fixed[side] = {"type": "text", "value": content}
            elif isinstance(content, dict):
                if "type" not in content or "value" not in content:
                    fixed[side] = {"type": "text", "value": str(content)}
        for bad in ["leftTitle", "rightTitle", "leftText", "rightText", "leftColor", "rightColor"]:
            fixed.pop(bad, None)

    elif component == "VideoBackground":
        if "videoUrl" in fixed and "src" not in fixed:
            fixed["src"] = fixed.pop("videoUrl")
        elif "videoUrl" in fixed:
            del fixed["videoUrl"]
        if "src" not in fixed or not fixed["src"]:
            fixed["src"] = "bg-abstract.mp4"

    elif component == "ImageReveal":
        if "src" not in fixed or not fixed["src"]:
            fixed["src"] = "placeholder.png"

    elif component == "BarChart":
        if "data" in fixed:
            for dp in fixed["data"]:
                if isinstance(dp.get("value"), str):
                    try:
                        dp["value"] = float(re.sub(r'[^\d.]', '', dp["value"]))
                    except:
                        dp["value"] = 0

    elif component == "ProgressRing":
        if isinstance(fixed.get("percentage"), str):
            try:
                fixed["percentage"] = float(re.sub(r'[^\d.]', '', fixed["percentage"]))
            except:
                fixed["percentage"] = 50

    elif component in ("FadeTransition", "SlideTransition", "ZoomTransition"):
        d = fixed.get("direction")
        if d and d not in VALID_DIRECTIONS:
            fixed.pop("direction", None)

    # Strip invalid props
    valid_keys = COMPONENT_PROPS.get(component, BASE_PROPS)
    clip["props"] = {k: v for k, v in fixed.items() if k in valid_keys}
    return clip


def fix_timeline(timeline):
    """Fix all clips in a timeline."""
    for clip in timeline.get("clips", []):
        fix_clip_props(clip)
    return timeline


def validate_timeline(timeline):
    """Validate a timeline. Returns list of issues."""
    issues = []
    if not timeline.get("id"):
        issues.append("Missing id")
    if not timeline.get("clips"):
        issues.append("No clips")
    if not timeline.get("tracks"):
        issues.append("No tracks")
    if timeline.get("durationInFrames", 0) < 1:
        issues.append("Invalid durationInFrames")

    track_ids = {t["id"] for t in timeline.get("tracks", [])}
    for clip in timeline.get("clips", []):
        cid = clip.get("id", "?")
        comp = clip.get("component", "?")
        if comp not in VALID_COMPONENTS:
            issues.append(f"Clip {cid}: unknown component '{comp}'")
            continue
        if clip.get("trackId") not in track_ids:
            issues.append(f"Clip {cid}: invalid trackId")
        if clip.get("durationInFrames", 0) < 1:
            issues.append(f"Clip {cid}: invalid durationInFrames")
        props = clip.get("props", {})
        invalid = set(props.keys()) - COMPONENT_PROPS.get(comp, BASE_PROPS)
        if invalid:
            issues.append(f"Clip {cid} ({comp}): invalid props {invalid}")
        if comp == "StatCounter" and not isinstance(props.get("value"), (int, float)):
            issues.append(f"Clip {cid}: StatCounter value must be number")
        if comp == "Caption" and props.get("position") not in VALID_CAPTION_POSITIONS and props.get("position") is not None:
            issues.append(f"Clip {cid}: Caption invalid position")
        if comp in ("LogoAnimation", "VideoBackground", "ImageReveal") and not props.get("src"):
            issues.append(f"Clip {cid}: {comp} missing 'src'")
        if comp == "SplitScreen":
            for side in ["leftContent", "rightContent"]:
                c = props.get(side)
                if not isinstance(c, dict) or "type" not in c or "value" not in c:
                    issues.append(f"Clip {cid}: SplitScreen invalid {side}")

    return issues


# ─── Legacy Format Transformer ───────────────────────────────────────────────

def transform_timeline(legacy_json, source_filename):
    """Transform legacy MD format (meta + tracks) to Remotion schema."""
    meta = legacy_json.get("meta", {})
    fps = meta.get("fps", 30)
    duration_s = meta.get("duration", 10)

    title = meta.get("title", "Untitled")
    video_id = re.sub(r'[^a-z0-9-]', '', title.lower().replace(" ", "-"))
    while "--" in video_id:
        video_id = video_id.replace("--", "-")
    video_id = video_id.strip("-")

    if "week-" in source_filename:
        week_part = source_filename.split(".")[0]
        video_id = f"{week_part}-{video_id}"

    timeline = {
        "id": video_id,
        "title": title,
        "fps": fps,
        "width": meta.get("width", 1080),
        "height": meta.get("height", 1920),
        "durationInFrames": int(duration_s * fps),
        "backgroundColor": meta.get("backgroundColor", "#0f172a"),
        "tracks": [
            {"id": "background", "label": "Background", "zIndex": 0},
            {"id": "content", "label": "Content", "zIndex": 1},
            {"id": "overlay", "label": "Overlay", "zIndex": 2}
        ],
        "clips": []
    }

    for i, track in enumerate(legacy_json.get("tracks", [])):
        component = track.get("type")
        props = track.get("props", {})

        if component == "VideoBackground" and "videoUrl" in props:
            props["src"] = props.pop("videoUrl")
        if component == "LogoAnimation" and "logoUrl" in props:
            props["src"] = props.pop("logoUrl")

        clip = {
            "id": f"clip-{i}",
            "component": component,
            "trackId": "content",
            "from": track.get("from", 0),
            "durationInFrames": track.get("duration", 90),
            "props": props
        }

        if component in ["VideoBackground", "ImageReveal"]:
            clip["trackId"] = "background"
        elif component in ["LowerThird", "Caption"]:
            clip["trackId"] = "overlay"

        timeline["clips"].append(clip)

    # Apply schema fixes
    fix_timeline(timeline)
    return timeline


# ─── Main ────────────────────────────────────────────────────────────────────

def process_md_files():
    """Extract and transform timelines from markdown files."""
    if not SOCIAL_DIR:
        print("❌ Social content directory not found. Tried:")
        for c in SOCIAL_DIR_CANDIDATES:
            print(f"   {c}")
        return 0

    print(f"🔍 Searching for social content in {SOCIAL_DIR}...")
    files = sorted(f for f in os.listdir(SOCIAL_DIR) if f.startswith("week-") and f.endswith(".md"))

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    total = 0

    for filename in files:
        filepath = os.path.join(SOCIAL_DIR, filename)
        with open(filepath, 'r') as f:
            content = f.read()

        json_blocks = re.findall(r'```json\n(.*?)\n```', content, re.DOTALL)
        count = 0

        for block in json_blocks:
            try:
                data = json.loads(block)
                if "meta" in data and "tracks" in data:
                    transformed = transform_timeline(data, filename)
                    issues = validate_timeline(transformed)
                    out_path = os.path.join(OUTPUT_DIR, f"{transformed['id']}.json")
                    with open(out_path, 'w') as f:
                        json.dump(transformed, f, indent=2)
                    status = "✅" if not issues else f"⚠️  ({len(issues)} issues)"
                    print(f"  {status} {transformed['id']}")
                    count += 1
            except json.JSONDecodeError:
                pass

        if count == 0:
            print(f"  ⏭  {filename}: no timeline JSON blocks found")
        total += count

    return total


def fix_existing():
    """Fix prop issues in all existing JSON files."""
    files = sorted(glob.glob(os.path.join(OUTPUT_DIR, "*.json")))
    fixed = 0
    for fpath in files:
        with open(fpath) as f:
            tl = json.load(f)
        fix_timeline(tl)
        with open(fpath, 'w') as f:
            json.dump(tl, f, indent=2)
        fixed += 1
    return fixed


def validate_all():
    """Validate all JSONs and report."""
    files = sorted(glob.glob(os.path.join(OUTPUT_DIR, "*.json")))
    clean = 0
    problems = []
    for fpath in files:
        with open(fpath) as f:
            tl = json.load(f)
        issues = validate_timeline(tl)
        if issues:
            problems.append((os.path.basename(fpath), issues))
        else:
            clean += 1

    print(f"\n{'='*50}")
    print(f"Total: {len(files)} | Clean: {clean} | Issues: {len(problems)}")
    print(f"{'='*50}")

    if problems:
        for fname, issues in problems:
            print(f"\n  {fname}:")
            for iss in issues:
                print(f"    → {iss}")
    else:
        print("🎉 All timelines pass validation!")


def main():
    args = set(sys.argv[1:])

    if "--validate-only" in args:
        validate_all()
    elif "--fix" in args:
        print("📋 Fixing existing JSONs...")
        count = fix_existing()
        print(f"  Fixed {count} files")
        print("\n📋 Extracting from MD files...")
        total = process_md_files()
        print(f"\n✨ Extracted {total} new timelines")
        validate_all()
    else:
        total = process_md_files()
        print(f"\n✨ Done! Extracted {total} timelines to {OUTPUT_DIR}")
        validate_all()


if __name__ == "__main__":
    main()
