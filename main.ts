// main.ts — Leonida Legend: hand-in program for gta6-trophy-guide-01.
//
// What the grader runs. The guide itself is the static site in app/ — plain
// HTML, CSS and ES modules plus the trophy data — and this program hands it
// in: it stages a clean copy of app/ and screenshots/ in the output
// directory, then builds the dossier (the judge's summary: cover-first
// screenshots, the first load's files and bytes, and the app source) with
// the vendored make.fun library and writes it as dossier.json.
//
// The dossier bytes are a contract: the scorer rebuilds them with its own
// copy of the library and expects a byte-for-byte match, so the caps below
// are the scorer's gate values, not a local choice. Only text_max_bytes
// shapes the bytes; the rest refuse an entry the scorer would refuse.
//
// Output directory: MAKEFUN_OUTPUT_DIR when set (local runs), else /output
// (the grader's container). Run it with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Serve the same app locally with: node serve.ts

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier, DOSSIER_SCHEMA, DossierError } from "./vendor/makefun-frontend.ts";

// The scorer's caps (its gate.json): at most 4 screenshots of 256 KiB each,
// at most 993 app entries / 48 MiB of app files, dossier text cut at 160 KiB.
const GATE_CAPS = {
  text_max_bytes: 163_840,
  screenshots: { max: 4, max_bytes: 262_144 },
  app_max_files: 993,
  app_max_bytes: 50_331_648,
} as const;

/** Recursively copy a directory tree, file by file, in name order. */
function stageTree(from: string, to: string): number {
  mkdirSync(to, { recursive: true });
  let files = 0;
  for (const name of readdirSync(from).sort()) {
    const src = join(from, name);
    const dst = join(to, name);
    if (statSync(src).isDirectory()) {
      files += stageTree(src, dst);
    } else {
      copyFileSync(src, dst);
      files += 1;
    }
  }
  return files;
}

function main(): void {
  const here = dirname(fileURLToPath(import.meta.url));
  const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(out, { recursive: true });

  const appFiles = stageTree(join(here, "app"), join(out, "app"));
  let shots = 0;
  const shotsDir = join(here, "screenshots");
  if (existsSync(shotsDir)) {
    shots = stageTree(shotsDir, join(out, "screenshots"));
  }

  const dossier = buildDossier(out, GATE_CAPS);
  writeFileSync(join(out, "dossier.json"), dossier);

  // Sanity-peek at what was built: the schema must be the dossier format and
  // the cover image must be present, or the hand-in is not worth reporting.
  const peek = JSON.parse(new TextDecoder().decode(dossier)) as {
    schema?: string;
    images?: unknown[];
  };
  if (peek.schema !== DOSSIER_SCHEMA) {
    throw new Error(`unexpected dossier schema: ${String(peek.schema)}`);
  }
  const images = peek.images?.length ?? 0;
  if (images === 0) throw new Error("dossier holds no screenshots");

  const digest = createHash("sha256").update(dossier).digest("hex");
  console.log(
    `staged ${appFiles} app files, ${shots} screenshots -> ${out}`,
  );
  console.log(
    `dossier.json: ${dossier.length} bytes, ${images} images, sha256 ${digest}`,
  );
}

try {
  main();
} catch (err) {
  const detail =
    err instanceof DossierError
      ? `[${err.limit ?? "invalid"}] ${err.message}`
      : err instanceof Error
        ? err.message
        : String(err);
  console.error(`main: hand-in failed: ${detail}`);
  process.exit(1);
}
