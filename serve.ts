// serve.ts — Leonida Legend preview server.
//
// Serves the static guide in app/ on localhost so it can be opened in a
// browser exactly as a player would see it. No build step, no dependency:
//
//   node serve.ts [--port <n>]        (default port 8080)
//
// The surface is deliberately tiny: GET and HEAD only, index.html for
// directory paths, the handful of MIME types the app ships, and a hard
// refusal for any path that resolves outside app/. It is a preview
// convenience for development — not a production web server.

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const APP_DIR = resolve(fileURLToPath(new URL("./app", import.meta.url)));

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

function portFromArgs(argv: string[]): number {
  const at = argv.indexOf("--port");
  const n = at === -1 ? NaN : Number(argv[at + 1]);
  return Number.isInteger(n) && n >= 1 && n <= 65_535 ? n : 8080;
}

/**
 * Map a request URL to a file inside APP_DIR. Returns null for anything
 * malformed or anything that would escape the app directory.
 */
function toAppFile(rawUrl: string): string | null {
  let path: string;
  try {
    path = decodeURIComponent(new URL(rawUrl, "http://preview.local").pathname);
  } catch {
    return null;
  }
  if (path.endsWith("/")) path += "index.html";
  const candidate = resolve(join(APP_DIR, `.${path}`));
  return candidate === APP_DIR || candidate.startsWith(APP_DIR + sep)
    ? candidate
    : null;
}

function plain(res: import("node:http").ServerResponse, status: number, body: string): void {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

const server = createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    plain(res, 405, "method not allowed");
    return;
  }
  const file = toAppFile(req.url ?? "/");
  if (file === null) {
    plain(res, 400, "bad request");
    return;
  }
  stat(file)
    .then((info) => {
      if (!info.isFile()) {
        plain(res, 404, "not found");
        return;
      }
      res.writeHead(200, {
        "content-type": CONTENT_TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
        "content-length": info.size,
        "cache-control": "no-store",
      });
      if (req.method === "HEAD") res.end();
      else createReadStream(file).pipe(res);
    })
    .catch(() => plain(res, 404, "not found"));
});

const port = portFromArgs(process.argv.slice(2));
server.on("error", (err: NodeJS.ErrnoException) => {
  console.error(
    err.code === "EADDRINUSE"
      ? `serve: port ${port} is taken — try --port <another>`
      : `serve: ${err.message}`,
  );
  process.exit(1);
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Leonida Legend preview: http://localhost:${port} (serving ${APP_DIR})`);
});
