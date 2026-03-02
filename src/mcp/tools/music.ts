/**
 * Music Tools — ccMixter Creative Commons music search & download
 *
 * All tracks returned by music_search are licensed under Creative Commons.
 * By default we query for instrumental / ambient tracks to avoid vocal conflicts.
 *
 * Attribution is required by most CC licenses. The `attribution` field returned
 * by music_search should be stored in the Timeline `audio.attribution` field.
 */

import * as https from "node:https";
import * as http from "node:http";
import * as fs from "node:fs";
import * as path from "node:path";
import { resolve } from "node:path";

const PROJECT_ROOT = resolve(process.env.REMOTION_PROJECT_ROOT ?? process.cwd());
const MUSIC_DIR = path.join(PROJECT_ROOT, "public", "music");

// ─── ccMixter API types ───────────────────────────────────────────────────────

interface CcmixterFile {
  file_name: string;
  download_url: string;
  file_format_info?: {
    ps?: string;   // duration like "3:45"
    br?: string;   // bitrate
    sr?: string;   // sample rate
    ch?: string;   // channels
  };
  file_filesize?: string;
}

interface CcmixterUpload {
  upload_id: number;
  upload_name: string;
  user_name: string;
  user_real_name: string;
  upload_tags: string;
  upload_description_plain?: string;
  file_page_url: string;
  license_name: string;
  license_url: string;
  files: CcmixterFile[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Fetch a URL and return the response body as a string */
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    let body = "";
    client
      .get(url, (res) => {
        // Follow up to 3 redirects
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          fetchUrl(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        res.setEncoding("utf8");
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

/** Download a binary file from `url` to `destPath`, following redirects */
function downloadBinary(url: string, destPath: string, depth = 0): Promise<void> {
  if (depth > 5) return Promise.reject(new Error("Too many redirects"));
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(destPath);
    client
      .get(url, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          file.close();
          fs.unlink(destPath, () => {});
          downloadBinary(res.headers.location!, destPath, depth + 1).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(destPath, () => {});
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        file.close();
        fs.unlink(destPath, () => {});
        reject(err);
      });
  });
}

/** Build the attribution string required by CC licenses */
function buildAttribution(track: CcmixterUpload): string {
  return `"${track.upload_name}" by ${track.user_real_name || track.user_name} — ${track.license_name} (${track.license_url}) — ${track.file_page_url}`;
}

// ─── Tool: music_search ───────────────────────────────────────────────────────

export interface MusicSearchArgs {
  /** Tags to filter by — comma-separated (e.g. "ambient,electronic,instrumental") */
  tags?: string;
  /** Free-text keyword search (alternative to tags) */
  query?: string;
  /** Maximum number of results to return (default 8, max 20) */
  limit?: number;
}

export function music_search(args: MusicSearchArgs): string {
  const limit = Math.min(args.limit ?? 8, 20);

  // Build ccMixter API query string
  const params = new URLSearchParams({
    format: "json",
    limit: String(limit),
    type: "audio",          // audio uploads only
  });

  if (args.query) {
    params.set("search", args.query);
  }
  if (args.tags) {
    params.set("tags", args.tags);
  }

  const url = `http://ccmixter.org/api/query?${params.toString()}`;

  // We need to do a sync-like return here — wrap with a sync call via child_process
  // because MCP tools must return synchronously. We use execSync with curl instead.
  const { execSync } = require("node:child_process");

  let raw: string;
  try {
    raw = execSync(`curl -s "${url}"`, { encoding: "utf8", timeout: 15000 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: `Failed to query ccMixter API: ${msg}` });
  }

  let tracks: CcmixterUpload[];
  try {
    tracks = JSON.parse(raw);
  } catch {
    return JSON.stringify({ error: "Failed to parse ccMixter API response", raw: raw.slice(0, 500) });
  }

  if (!Array.isArray(tracks) || tracks.length === 0) {
    return JSON.stringify({
      results: [],
      message: `No tracks found for ${args.tags ? `tags="${args.tags}"` : `query="${args.query}"`}. Try broader tags like "ambient" or "instrumental".`,
    });
  }

  const results = tracks
    .filter((t) => t.files && t.files.length > 0)
    .map((t) => {
      const file = t.files[0];
      const duration = file.file_format_info?.ps ?? "unknown";
      return {
        name: t.upload_name,
        artist: t.user_real_name || t.user_name,
        tags: t.upload_tags
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s && !s.startsWith("non_") && !["audio", "mp3", "stereo", "CBR"].includes(s))
          .slice(0, 8)
          .join(", "),
        duration,
        license: t.license_name,
        download_url: file.download_url,
        file_page_url: t.file_page_url,
        attribution: buildAttribution(t),
        // Convenience: suggested local filename for music_download
        suggested_filename: file.file_name,
      };
    });

  return JSON.stringify({
    results,
    tip: "Call music_download with a download_url and filename to save the track to public/music/. Then set timeline.audio.src = 'music/<filename>'.",
  }, null, 2);
}

// ─── Tool: music_download ─────────────────────────────────────────────────────

export interface MusicDownloadArgs {
  /** Direct download URL from a music_search result */
  download_url: string;
  /** Filename to save as (e.g. "background.mp3"). Saved to public/music/<filename> */
  filename: string;
}

export function music_download(args: MusicDownloadArgs): string {
  const { execSync } = require("node:child_process");

  // Ensure public/music/ directory exists
  if (!fs.existsSync(MUSIC_DIR)) {
    fs.mkdirSync(MUSIC_DIR, { recursive: true });
  }

  // Sanitise filename — no path traversal
  const safeName = path.basename(args.filename).replace(/[^\w.\-]/g, "_");
  if (!safeName.match(/\.(mp3|wav|ogg|aac|flac|m4a)$/i)) {
    return JSON.stringify({ error: "Filename must end in a supported audio extension: .mp3 .wav .ogg .aac .flac .m4a" });
  }

  const destPath = path.join(MUSIC_DIR, safeName);
  const publicRelativePath = `music/${safeName}`;

  // Download with curl (handles redirects, TLS, progress).
  // ccMixter requires a Referer header — we derive it from the download URL.
  const referer = args.download_url.replace(/\/content\/.*$/, "");
  try {
    execSync(
      `curl -L -k -f ` +
      `-H "Referer: ${referer}" ` +
      `-H "User-Agent: Mozilla/5.0 (compatible; RemotionStudio/1.0)" ` +
      `-o "${destPath}" "${args.download_url}"`,
      { timeout: 120_000, encoding: "utf8" }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return JSON.stringify({ error: `Download failed: ${msg}` });
  }

  // Verify the file exists and has some size
  if (!fs.existsSync(destPath)) {
    return JSON.stringify({ error: "Download completed but file not found at destination." });
  }

  const sizeBytes = fs.statSync(destPath).size;
  const sizeMB = (sizeBytes / 1024 / 1024).toFixed(2);

  return JSON.stringify({
    success: true,
    local_path: destPath,
    /** Set this as timeline.audio.src */
    audio_src: publicRelativePath,
    size_mb: sizeMB,
    message: `Track saved to public/music/${safeName} (${sizeMB} MB). ` +
      `Set timeline.audio = { src: "${publicRelativePath}", volume: 0.35, startFrom: 0 } and add the attribution to audio.attribution.`,
  }, null, 2);
}
