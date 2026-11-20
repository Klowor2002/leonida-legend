// serve.ts — Leonida Legend: local preview server.
//
// Serves the static guide in app/ so it can be opened in a browser with
// no build step and no network beyond localhost. Start it with:
//
//   node serve.ts [--port <n>]     (default port 8080)
//
// Deliberately small: the MIME types the app needs, index.html for
// directory paths, and a hard refusal for anything that resolves outside
// app/. A preview convenience, not a production web server.

import { createReadStream, stat } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = resolve(fileURLToPath(new URL("./app", import.meta.url)));

const MIME_BY_EXT = new Map<string, string>([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".woff2", "font/woff2"],
]);

function pickPort(argv: string[]): number {
  const flagAt = argv.indexOf("--port");
  const raw = flagAt === -1 ? NaN : Number(argv[flagAt + 1]);
  return Number.isInteger(raw) && raw > 0 && raw < 65_536 ? raw : 8080;
}

/**
 * Turn a request URL into a file inside APP_ROOT, or null when the path
 * escapes it. A trailing slash (or the bare root) serves index.html.
 */
function resolveInsideApp(url: string): string | null {
  let path: string;
  try {
    path = decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    return null;
  }
  if (path.endsWith("/")) path += "index.html";
  const file = resolve(join(APP_ROOT, "." + path));
  if (file === APP_ROOT || file.startsWith(APP_ROOT + sep)) return file;
  return null;
}

function replyText(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

function handle(req: IncomingMessage, res: ServerResponse): void {
  const file = resolveInsideApp(req.url ?? "/");
  if (file === null) {
    replyText(res, 400, "bad request");
    return;
  }
  stat(file, (err, stats) => {
    if (err || !stats.isFile()) {
      replyText(res, 404, "not found");
      return;
    }
    res.writeHead(200, {
      "content-type":
        MIME_BY_EXT.get(extname(file).toLowerCase()) ??
        "application/octet-stream",
      "content-length": stats.size,
      "cache-control": "no-store",
    });
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    createReadStream(file).pipe(res);
  });
}

const port = pickPort(process.argv.slice(2));
const server = createServer(handle);
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(`serve: port ${port} is already in use — try --port <another>`);
  } else {
    console.error(`serve: ${err.message}`);
  }
  process.exit(1);
});
server.listen(port, "127.0.0.1", () => {
  console.log(`Leonida Legend: serving ${APP_ROOT} at http://localhost:${port}`);
  console.log("Leonida Legend: press Ctrl+C to stop the preview server.");
});
