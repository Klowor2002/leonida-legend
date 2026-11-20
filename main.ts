// main.ts — Leonida Legend hand-in for gta6-trophy-guide-01.
//
// What this program does: the guide itself lives in app/ as plain static
// files (HTML, CSS, a JS module, trophy data). This script copies app/ and
// screenshots/ into a clean output directory, then asks the vendored
// make.fun library to build the dossier — the judge's summary of the entry
// (screenshots first, then the first load's files and bytes, then the app
// source) — and writes it as dossier.json in the output directory.
//
// The dossier bytes are a contract: the scorer rebuilds them with its own
// copy of the library and expects a byte-for-byte match. The caps below
// are therefore the scorer's gate values, not a local choice. Only
// text_max_bytes changes the bytes; the other caps reject an entry the
// scorer would reject anyway.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Without MAKEFUN_OUTPUT_DIR the output goes to /output (the grader's
// container). To preview the app instead, run: node serve.ts

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDossier,
  DOSSIER_SCHEMA,
  DossierError,
} from "./vendor/makefun-frontend.ts";

// Scorer gates (from its gate.json): 4 screenshots max, 256 KiB each;
// 993 app entries / 48 MiB of app files max; dossier text cut at 160 KiB.
const SCORER_CAPS = {
  text_max_bytes: 163_840,
  screenshots: { max: 4, max_bytes: 262_144 },
  app_max_files: 993,
  app_max_bytes: 50_331_648,
} as const;

/**
 * Mirror one directory tree into another, depth-first, files in sorted
 * order. Returns how many files were copied. Empty directories are
 * recreated too, so the output keeps the source layout exactly.
 */
function mirrorTree(sourceDir: string, destDir: string): number {
  mkdirSync(destDir, { recursive: true });
  let copied = 0;
  const entries = readdirSync(sourceDir, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  for (const entry of entries) {
    const from = join(sourceDir, entry.name);
    const to = join(destDir, entry.name);
    if (entry.isDirectory()) {
      copied += mirrorTree(from, to);
    } else if (entry.isFile()) {
      copyFileSync(from, to);
      copied += 1;
    }
  }
  return copied;
}

function handIn(): void {
  const repoRoot = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
  mkdirSync(outDir, { recursive: true });

  const appCount = mirrorTree(join(repoRoot, "app"), join(outDir, "app"));
  let shotCount = 0;
  const shotsDir = join(repoRoot, "screenshots");
  if (existsSync(shotsDir)) {
    shotCount = mirrorTree(shotsDir, join(outDir, "screenshots"));
  }

  const dossier = buildDossier(outDir, SCORER_CAPS);
  writeFileSync(join(outDir, "dossier.json"), dossier);

  // Check the result before reporting it: the schema tag must be the
  // dossier format, and at least the cover screenshot must be present.
  const built = JSON.parse(new TextDecoder().decode(dossier)) as {
    schema?: string;
    images?: unknown[];
  };
  if (built.schema !== DOSSIER_SCHEMA) {
    throw new Error(`dossier schema mismatch: got ${String(built.schema)}`);
  }
  const images = built.images?.length ?? 0;
  if (images === 0) throw new Error("dossier contains no screenshots");

  const sha = createHash("sha256").update(dossier).digest("hex");
  console.log(`hand-in staged: ${appCount} app files, ${shotCount} screenshots -> ${outDir}`);
  console.log(`dossier.json: ${dossier.length} bytes, ${images} images, sha256 ${sha}`);
}

try {
  handIn();
} catch (err) {
  const why =
    err instanceof DossierError
      ? `[${err.limit ?? "invalid"}] ${err.message}`
      : err instanceof Error
        ? err.message
        : String(err);
  console.error(`main: hand-in failed: ${why}`);
  process.exit(1);
}
