// serve.ts — a tiny local preview server for Leonida Legend.
//
// Serves the static app in app/ on localhost, exactly as a player's
// browser would load it, with no build step and no dependencies:
//
//   node serve.ts [--port <n>]        (default 8080)
//
// Deliberately small surface: GET and HEAD only, directory paths resolve
// to index.html, the MIME table covers only what the app ships, every
// response carries nosniff and no-store, and any path that would resolve
// outside app/ is refused. It is a development convenience, not a
// production server.

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type ServerResponse } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = resolve(fileURLToPath(new URL("./app", import.meta.url)));

const MIME: Record<string, string> = {
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

function chosenPort(argv: string[]): number {
  const flag = argv.indexOf("--port");
  const value = flag === -1 ? NaN : Number(argv[flag + 1]);
  return Number.isInteger(value) && value >= 1 && value <= 65_535 ? value : 8080;
}

/** Resolve a request URL to a file inside APP_ROOT, or null to refuse. */
function resolveInside(rawUrl: string): string | null {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(rawUrl, "http://localhost").pathname);
  } catch {
    return null;
  }
  if (pathname.endsWith("/")) pathname += "index.html";
  const candidate = resolve(join(APP_ROOT, `.${pathname}`));
  const inside = candidate === APP_ROOT || candidate.startsWith(APP_ROOT + sep);
  return inside ? candidate : null;
}

function refuse(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, {
    "content-type": "text/plain; charset=utf-8",
    "x-content-type-options": "nosniff",
  });
  res.end(body);
}

const server = createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    refuse(res, 405, "method not allowed");
    return;
  }
  const file = resolveInside(req.url ?? "/");
  if (file === null) {
    refuse(res, 400, "bad request");
    return;
  }
  stat(file)
    .then((info) => {
      if (!info.isFile()) {
        refuse(res, 404, "not found");
        return;
      }
      res.writeHead(200, {
        "content-type": MIME[extname(file).toLowerCase()] ?? "application/octet-stream",
        "content-length": info.size,
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      });
      if (req.method === "HEAD") res.end();
      else createReadStream(file).pipe(res);
    })
    .catch(() => refuse(res, 404, "not found"));
});

const port = chosenPort(process.argv.slice(2));
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  });
}
server.on("error", (err: NodeJS.ErrnoException) => {
  console.error(
    err.code === "EADDRINUSE"
      ? `serve: port ${port} is already in use — try --port <another>`
      : `serve: ${err.message}`,
  );
  process.exit(1);
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Leonida Legend preview: http://localhost:${port} (serving ${APP_ROOT})`);
});
