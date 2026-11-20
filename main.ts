// main.ts — Leonida Legend: the hand-in program for gta6-trophy-guide-01.
//
// The guide itself is the static app in app/ (HTML, CSS, JS, one data
// file). This program stages a clean copy of app/ and screenshots/ into
// the output directory, then builds the entry's dossier with the vendored
// make.fun library — the fixed-format summary the judges score: the
// screenshots, then the app files the first load pulls in, then the app
// source as text.
//
// The scorer rebuilds the dossier with its own copy of the same library
// and compares byte for byte, so the dossier must be a pure function of
// the staged files. Everything below serves that: sorted traversal, no
// timestamps, no randomness, no environment reads beyond the output path.
// The caps are the scorer's published gates, not local taste — only
// text_max_bytes shapes the bytes; the rest reject entries the scorer
// would reject anyway.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// Without MAKEFUN_OUTPUT_DIR the output directory is /output (the
// grader's container). For a human preview of the guide instead, run
// `node serve.ts`.

import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
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

// The scorer's gates: at most 4 screenshots of at most 256 KiB each; at
// most 993 app files totalling at most 48 MiB; dossier text truncated at
// 160 KiB.
const GATES = {
  text_max_bytes: 163_840,
  screenshots: { max: 4, max_bytes: 262_144 },
  app_max_files: 993,
  app_max_bytes: 50_331_648,
} as const;

/**
 * Copy a directory tree file by file, in sorted name order, recreating
 * empty directories. Returns the list of relative paths copied, so the
 * caller can report exactly what was staged.
 */
function stageTree(from: string, to: string, prefix = ""): string[] {
  mkdirSync(to, { recursive: true });
  const staged: string[] = [];
  const entries = readdirSync(from, { withFileTypes: true })
    .slice()
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      staged.push(...stageTree(join(from, entry.name), join(to, entry.name), rel));
    } else if (entry.isFile()) {
      copyFileSync(join(from, entry.name), join(to, entry.name));
      staged.push(rel);
    }
  }
  return staged;
}

/**
 * Prove the staging was faithful: every staged file must be byte-equal
 * to its source. A silent short copy would produce a valid-looking
 * dossier of the wrong app, which is exactly the failure this catches.
 */
function verifyStaged(root: string, outDir: string, relPaths: string[], area: string): void {
  for (const rel of relPaths) {
    const original = readFileSync(join(root, area, rel));
    const staged = readFileSync(join(outDir, area, rel));
    if (!original.equals(staged)) {
      throw new Error(`staged copy differs from source: ${area}/${rel}`);
    }
  }
}

function run(): void {
  const root = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
  mkdirSync(outDir, { recursive: true });

  const appFiles = stageTree(join(root, "app"), join(outDir, "app"));
  const shotsDir = join(root, "screenshots");
  const shotFiles = existsSync(shotsDir)
    ? stageTree(shotsDir, join(outDir, "screenshots"))
    : [];
  verifyStaged(root, outDir, appFiles, "app");
  verifyStaged(root, outDir, shotFiles, "screenshots");

  const dossier = buildDossier(outDir, GATES);
  writeFileSync(join(outDir, "dossier.json"), dossier);

  // Read the dossier back before declaring success: it must carry the
  // library's schema tag and at least the cover screenshot, or the entry
  // would score as empty.
  const parsed = JSON.parse(new TextDecoder().decode(dossier)) as {
    schema?: string;
    images?: unknown[];
  };
  if (parsed.schema !== DOSSIER_SCHEMA) {
    throw new Error(`unexpected dossier schema: ${String(parsed.schema)}`);
  }
  const imageCount = parsed.images?.length ?? 0;
  if (imageCount === 0) throw new Error("dossier holds no screenshots");

  const digest = createHash("sha256").update(dossier).digest("hex");
  console.log(
    `staged ${appFiles.length} app files and ${shotFiles.length} screenshots into ${outDir}`,
  );
  console.log(`dossier.json: ${dossier.length} bytes, ${imageCount} images, sha256 ${digest}`);
}

try {
  run();
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
