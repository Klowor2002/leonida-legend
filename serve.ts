// serve.ts — Leonida Legend: local development server.
//
// Serves the static guide in app/ so it can be opened in a browser with no
// build step and no network beyond localhost:
//
//   node serve.ts [--port <n>]     (default port 8080)
//
// Deliberately small: correct MIME types for the file kinds the app uses,
// index.html for directory paths, and a hard refusal of anything that
// resolves outside app/. It is a development convenience for previewing the
// guide, not a production web server.

import { stat, createReadStream } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const APP_ROOT = resolve(fileURLToPath(new URL("./app", import.meta.url)));

const MIME_TYPES = new Map<string, string>([
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

function choosePort(argv: string[]): number {
  const at = argv.indexOf("--port");
  const value = at === -1 ? NaN : Number(argv[at + 1]);
  return Number.isInteger(value) && value > 0 && value < 65_536 ? value : 8080;
}

/** Map a request URL to a file inside APP_ROOT, or null if it escapes.
 *  Directory paths serve index.html; a path that climbs out of the app
 *  root (for example with "..") is refused outright. */
function mapRequest(url: string): string | null {
  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
  } catch {
    return null;
  }
  if (pathname.endsWith("/")) pathname += "index.html";
  const file = resolve(join(APP_ROOT, "." + pathname));
  return file === APP_ROOT || file.startsWith(APP_ROOT + sep) ? file : null;
}

function sendText(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  res.end(body);
}

function serveOne(req: IncomingMessage, res: ServerResponse): void {
  const file = mapRequest(req.url ?? "/");
  if (file === null) {
    sendText(res, 400, "bad request");
    return;
  }
  stat(file, (err, stats) => {
    if (err || !stats.isFile()) {
      sendText(res, 404, "not found");
      return;
    }
    res.writeHead(200, {
      "content-type":
        MIME_TYPES.get(extname(file).toLowerCase()) ??
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

const port = choosePort(process.argv.slice(2));
const server = createServer(serveOne);
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
});
