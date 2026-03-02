import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from "fs";
import { join, resolve, relative, extname } from "path";

// ─── Sandbox enforcement ─────────────────────────────────────────────────────

const PROJECT_ROOT = resolve(process.env.REMOTION_PROJECT_ROOT ?? process.cwd());
const ALLOWED_WRITE_DIRS = [
  join(PROJECT_ROOT, "src"),
  join(PROJECT_ROOT, "public"),
  join(PROJECT_ROOT, "examples"),
];

function assertSandboxed(filePath: string, write = false): string {
  const resolved = resolve(filePath);

  if (!resolved.startsWith(PROJECT_ROOT)) {
    throw new Error(
      `Access denied: "${resolved}" is outside the project root "${PROJECT_ROOT}". ` +
        `The agent may only access files within the project.`
    );
  }

  if (write) {
    const allowed = ALLOWED_WRITE_DIRS.some((dir) => resolved.startsWith(dir));
    if (!allowed) {
      throw new Error(
        `Write access denied: "${resolved}". Writes are restricted to: ${ALLOWED_WRITE_DIRS.map((d) => relative(PROJECT_ROOT, d)).join(", ")}`
      );
    }
  }

  return resolved;
}

// ─── Tool implementations ────────────────────────────────────────────────────

export function fs_read_file(args: { path: string }): string {
  const safePath = assertSandboxed(join(PROJECT_ROOT, args.path));

  if (!existsSync(safePath)) {
    throw new Error(`File not found: "${args.path}"`);
  }

  const stat = statSync(safePath);
  if (stat.isDirectory()) {
    throw new Error(`"${args.path}" is a directory. Use fs_list_directory instead.`);
  }

  const content = readFileSync(safePath, "utf-8");
  const lines = content.split("\n").length;
  return JSON.stringify({
    path: args.path,
    content,
    lines,
    size: stat.size,
    modified: stat.mtime.toISOString(),
  });
}

export function fs_write_file(args: { path: string; content: string; create_dirs?: boolean }): string {
  const safePath = assertSandboxed(join(PROJECT_ROOT, args.path), true);

  if (args.create_dirs) {
    const dir = safePath.substring(0, safePath.lastIndexOf("/"));
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(safePath, args.content, "utf-8");
  const size = Buffer.byteLength(args.content, "utf-8");

  return JSON.stringify({
    success: true,
    path: args.path,
    size,
    message: `File written successfully: ${args.path} (${size} bytes)`,
  });
}

export function fs_list_directory(args: { path?: string; recursive?: boolean; extensions?: string[] }): string {
  const dirPath = args.path ? assertSandboxed(join(PROJECT_ROOT, args.path)) : PROJECT_ROOT;

  if (!existsSync(dirPath)) {
    throw new Error(`Directory not found: "${args.path ?? "/"}"`);
  }

  function listDir(dir: string, depth = 0): Array<{ path: string; type: "file" | "dir"; size?: number; ext?: string }> {
    const entries = readdirSync(dir);
    const results: ReturnType<typeof listDir> = [];

    for (const entry of entries) {
      // Skip hidden dirs and node_modules
      if (entry.startsWith(".") || entry === "node_modules" || entry === "dist") continue;

      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      const relPath = relative(PROJECT_ROOT, fullPath);

      if (stat.isDirectory()) {
        results.push({ path: relPath, type: "dir" });
        if (args.recursive && depth < 5) {
          results.push(...listDir(fullPath, depth + 1));
        }
      } else {
        const ext = extname(entry).slice(1);
        if (args.extensions && !args.extensions.includes(ext)) continue;
        results.push({ path: relPath, type: "file", size: stat.size, ext });
      }
    }

    return results;
  }

  const entries = listDir(dirPath);
  return JSON.stringify({ directory: args.path ?? "/", entries, total: entries.length });
}

export function fs_file_exists(args: { path: string }): string {
  try {
    const safePath = assertSandboxed(join(PROJECT_ROOT, args.path));
    const exists = existsSync(safePath);
    const stat = exists ? statSync(safePath) : null;
    return JSON.stringify({
      exists,
      path: args.path,
      type: stat ? (stat.isDirectory() ? "dir" : "file") : null,
      size: stat?.size ?? null,
    });
  } catch {
    return JSON.stringify({ exists: false, path: args.path, type: null, size: null });
  }
}

export function fs_delete_file(args: { path: string }): string {
  const safePath = assertSandboxed(join(PROJECT_ROOT, args.path), true);

  if (!existsSync(safePath)) {
    throw new Error(`File not found: "${args.path}"`);
  }

  const { unlinkSync } = require("fs");
  unlinkSync(safePath);

  return JSON.stringify({ success: true, message: `Deleted: ${args.path}` });
}
