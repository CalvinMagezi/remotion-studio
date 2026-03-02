#!/usr/bin/env node
/**
 * Remotion Studio MCP Server
 * Exposes filesystem, rendering, and documentation tools to AI agents via stdio
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  fs_read_file,
  fs_write_file,
  fs_list_directory,
  fs_file_exists,
  fs_delete_file,
} from "./tools/filesystem.js";
import {
  render_validate_timeline,
  render_list_compositions,
  render_get_status,
  render_save_timeline,
  render_build_command,
} from "./tools/rendering.js";
import {
  docs_get_component_catalog,
  docs_get_motion_tokens,
  docs_get_timeline_schema,
  docs_get_full_reference,
} from "./tools/documentation.js";
import { music_search, music_download } from "./tools/music.js";

const server = new McpServer({
  name: "remotion-studio",
  version: "0.1.0",
});

// ─── Filesystem Tools ────────────────────────────────────────────────────────

server.registerTool(
  "fs_read_file",
  {
    description:
      "Read a file from the Remotion project. Path is relative to the project root. " +
      "Sandboxed to the project directory — cannot read system files.",
    inputSchema: {
      path: z.string().describe("File path relative to project root (e.g. 'src/remotion/Root.tsx')"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async ({ path }) => {
    const result = fs_read_file({ path });
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "fs_write_file",
  {
    description:
      "Write or overwrite a file in the project. Restricted to src/, public/, and examples/ directories. " +
      "Use this to save generated components, JSON timelines, or asset manifests.",
    inputSchema: {
      path: z.string().describe("File path relative to project root"),
      content: z.string().describe("File content to write"),
      create_dirs: z.boolean().optional().describe("Create parent directories if they don't exist"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async ({ path, content, create_dirs }) => {
    const result = fs_write_file({ path, content, create_dirs });
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "fs_list_directory",
  {
    description: "List files and directories within the project. Use to discover existing assets.",
    inputSchema: {
      path: z.string().optional().describe("Directory path relative to project root (default: root)"),
      recursive: z.boolean().optional().describe("Recursively list subdirectories"),
      extensions: z.array(z.string()).optional().describe("Filter by file extensions (e.g. ['tsx', 'json'])"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async ({ path, recursive, extensions }) => {
    const result = fs_list_directory({ path, recursive, extensions });
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "fs_file_exists",
  {
    description: "Check if a file or directory exists at the given path.",
    inputSchema: {
      path: z.string().describe("Path relative to project root"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async ({ path }) => {
    const result = fs_file_exists({ path });
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "fs_delete_file",
  {
    description: "Delete a file from the project. Only allowed in src/, public/, examples/. IRREVERSIBLE.",
    inputSchema: {
      path: z.string().describe("File path relative to project root"),
    },
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
  },
  async ({ path }) => {
    const result = fs_delete_file({ path });
    return { content: [{ type: "text", text: result }] };
  }
);

// ─── Rendering Tools ─────────────────────────────────────────────────────────

server.registerTool(
  "render_validate_timeline",
  {
    description:
      "Validate a JSON timeline specification before rendering. " +
      "Checks structure, track references, and required fields. Always validate before saving.",
    inputSchema: {
      timeline_json: z.string().describe("JSON string of the timeline specification to validate"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async ({ timeline_json }) => {
    const result = render_validate_timeline({ timeline_json });
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "render_list_compositions",
  {
    description: "List all registered Remotion compositions available for rendering.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async () => {
    const result = render_list_compositions({});
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "render_get_status",
  {
    description: "Check if the rendering environment is ready (dependencies installed, entry point exists, etc.).",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async () => {
    const result = render_get_status({});
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "render_save_timeline",
  {
    description:
      "Save a validated JSON timeline to the examples/ directory and return the render command. " +
      "Always validate with render_validate_timeline first.",
    inputSchema: {
      timeline_json: z.string().describe("JSON string of the validated timeline"),
      filename: z.string().optional().describe("Output filename (default: auto-generated from timeline id)"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async ({ timeline_json, filename }) => {
    const result = render_save_timeline({ timeline_json, filename });
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "render_build_command",
  {
    description: "Generate the CLI render command for a composition. Use after saving the timeline.",
    inputSchema: {
      composition_id: z.string().describe("The Remotion composition ID to render"),
      output: z.string().optional().describe("Output file path (default: out/<id>.mp4)"),
      timeline_json: z.string().optional().describe("Inline JSON props to pass to the renderer"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async ({ composition_id, output, timeline_json }) => {
    const result = render_build_command({ composition_id, output, timeline_json });
    return { content: [{ type: "text", text: result }] };
  }
);

// ─── Documentation Tools ─────────────────────────────────────────────────────

server.registerTool(
  "docs_get_component_catalog",
  {
    description:
      "Get the component catalog with all available Remotion components, their required/optional props, and examples. " +
      "Call this before generating a timeline to know what components are available.",
    inputSchema: {
      component: z.string().optional().describe("Get details for a specific component (e.g. 'TitleCard'). Omit for full catalog."),
    },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async ({ component }) => {
    const result = docs_get_component_catalog({ component: component ?? "" });
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "docs_get_motion_tokens",
  {
    description: "Get documentation for the MotionToken system — how to configure entrance animations for any component.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async () => {
    const result = docs_get_motion_tokens({});
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "docs_get_timeline_schema",
  {
    description: "Get the JSON Timeline Schema documentation — structure, types, and frame math reference.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async () => {
    const result = docs_get_timeline_schema({});
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "docs_get_full_reference",
  {
    description: "Get the complete documentation bundle: component catalog + motion tokens + schema reference. Use at session start.",
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async () => {
    const result = docs_get_full_reference({});
    return { content: [{ type: "text", text: result }] };
  }
);

// ─── Music Tools ─────────────────────────────────────────────────────────────

server.registerTool(
  "music_search",
  {
    description:
      "Search ccMixter for Creative Commons licensed music tracks. " +
      "Returns track names, artists, download URLs, duration, and CC license info. " +
      "All tracks are free to use with attribution. " +
      "After finding a track, use music_download to save it to the project.",
    inputSchema: {
      tags: z.string().optional().describe(
        "Comma-separated tags to filter by (e.g. 'ambient,instrumental', 'electronic,lofi', 'cinematic'). " +
        "Good defaults for background music: 'ambient', 'instrumental', 'electronic', 'lofi', 'chill'."
      ),
      query: z.string().optional().describe(
        "Free-text keyword search (alternative or addition to tags)"
      ),
      limit: z.number().int().min(1).max(20).optional().describe("Max results (default 8)"),
    },
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  async ({ tags, query, limit }) => {
    const result = music_search({ tags, query, limit });
    return { content: [{ type: "text", text: result }] };
  }
);

server.registerTool(
  "music_download",
  {
    description:
      "Download a CC-licensed music track from a URL (from music_search results) into public/music/. " +
      "Returns the local path to use as timeline.audio.src. " +
      "After downloading, set timeline.audio = { src: 'music/<filename>', volume: 0.35, attribution: '...' }.",
    inputSchema: {
      download_url: z.string().url().describe("Direct download URL from music_search results"),
      filename: z.string().describe(
        "Filename to save as — must end in .mp3/.wav/.ogg etc. (e.g. 'background.mp3'). " +
        "Use the suggested_filename from music_search or create a descriptive name."
      ),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
  },
  async ({ download_url, filename }) => {
    const result = music_download({ download_url, filename });
    return { content: [{ type: "text", text: result }] };
  }
);

// ─── Server bootstrap ────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[RemotionStudio MCP] Server running on stdio");
}

main().catch((err) => {
  console.error("[RemotionStudio MCP] Fatal:", err);
  process.exit(1);
});
