// main.ts — Leonida Legend hand-in program for gta6-trophy-guide-01.
//
// What the judges receive is not this repository but a dossier: a fixed-
// format bundle the vendored make.fun library builds from the staged
// files — screenshots first, then the files the app's first load pulls
// in, then the app source as text. This program's whole job is to stage
// that bundle honestly:
//
//   1. copy app/ and screenshots/ into the output directory, file by
//      file, in sorted order, so the staging is reproducible;
//   2. verify every staged copy byte-for-byte against its source, so a
//      short copy can never silently stand in for the real app;
//   3. sanity-check the master data the app renders — 55 trophies, each
//      with a non-blank cited guide, a source line and five strategy
//      steps (Round 8: the guide check is the one whose absence failed
//      the previous round's gate, so it is proven here, at hand-in,
//      before the dossier is allowed to exist);
//   4. build the dossier with the scorer's own gates, then read it back
//      and confirm it carries the library schema and at least one image.
//
// The scorer rebuilds the dossier with its own copy of the library and
// compares byte for byte, so nothing here may depend on time, chance or
// environment — the output path is the only input besides the files.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// With no MAKEFUN_OUTPUT_DIR the output directory is /output (the
// grader's container). For a human preview instead, run `node serve.ts`.

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

// The scorer's published gates. Only text_max_bytes shapes the bytes;
// the rest reject entries the scorer would reject anyway, earlier and
// with a clearer message.
const LIMITS = {
  text_max_bytes: 163_840,
  screenshots: { max: 4, max_bytes: 262_144 },
  app_max_files: 993,
  app_max_bytes: 50_331_648,
} as const;

const EXPECTED_TROPHIES = 55;
const EXPECTED_STEPS = 5;
const EXPECTED_ROADMAP_PHASES = 8;

/** Stage one tree into the output dir, sorted; returns relative paths. */
function stage(fromDir: string, toDir: string, prefix = ""): string[] {
  mkdirSync(toDir, { recursive: true });
  const done: string[] = [];
  const entries = readdirSync(fromDir, { withFileTypes: true })
    .slice()
    .sort((x, y) => (x.name < y.name ? -1 : x.name > y.name ? 1 : 0));
  for (const entry of entries) {
    const rel = prefix === "" ? entry.name : `${prefix}/${entry.name}`;
    if (entry.isDirectory()) {
      done.push(...stage(join(fromDir, entry.name), join(toDir, entry.name), rel));
    } else if (entry.isFile()) {
      copyFileSync(join(fromDir, entry.name), join(toDir, entry.name));
      done.push(rel);
    }
  }
  return done;
}

/** Fail unless every staged file is byte-identical to its source. */
function proveStaged(root: string, outDir: string, area: string, relPaths: string[]): void {
  for (const rel of relPaths) {
    const source = readFileSync(join(root, area, rel));
    const copy = readFileSync(join(outDir, area, rel));
    if (!source.equals(copy)) {
      throw new Error(`staged copy diverges from source: ${area}/${rel}`);
    }
  }
}

/**
 * Fail unless the master data still holds the guide's contract: 55
 * trophies, each carrying a non-blank guide text, a non-blank source
 * citation and exactly five strategy steps. The dossier would happily
 * bundle a broken guide; this check exists so it never does — the
 * gate's trophies row asks for a guide on every named trophy, and a
 * hand-in that cannot prove one should fail here, in the open.
 */
function proveData(root: string): void {
  const dataPath = join(root, "app", "data", "trophies.json");
  const data = JSON.parse(readFileSync(dataPath, "utf8")) as {
    trophies?: { guide?: unknown; source?: unknown; strategy?: unknown[] }[];
    roadmap?: unknown[];
  };
  const trophies = data.trophies ?? [];
  if (trophies.length !== EXPECTED_TROPHIES) {
    throw new Error(`trophies.json holds ${trophies.length} trophies, expected ${EXPECTED_TROPHIES}`);
  }
  if (!Array.isArray(data.roadmap) || data.roadmap.length !== EXPECTED_ROADMAP_PHASES) {
    throw new Error(
      `trophies.json roadmap must hold ${EXPECTED_ROADMAP_PHASES} phases, found ${data.roadmap?.length ?? 0}`,
    );
  }
  for (const [index, trophy] of trophies.entries()) {
    if (typeof trophy.guide !== "string" || trophy.guide.trim().length === 0) {
      throw new Error(`trophy ${index + 1} carries no guide text — the gate's trophies row would fail`);
    }
    if (typeof trophy.source !== "string" || trophy.source.trim().length === 0) {
      throw new Error(`trophy ${index + 1} carries no source citation for its guide`);
    }
    if (!Array.isArray(trophy.strategy) || trophy.strategy.length !== EXPECTED_STEPS) {
      throw new Error(`trophy ${index + 1} does not carry ${EXPECTED_STEPS} strategy steps`);
    }
  }
}

function handIn(): void {
  const root = dirname(fileURLToPath(import.meta.url));
  const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
  mkdirSync(outDir, { recursive: true });

  proveData(root);

  const appPaths = stage(join(root, "app"), join(outDir, "app"));
  const shotsDir = join(root, "screenshots");
  const shotPaths = existsSync(shotsDir) ? stage(shotsDir, join(outDir, "screenshots")) : [];
  proveStaged(root, outDir, "app", appPaths);
  proveStaged(root, outDir, "screenshots", shotPaths);

  const dossier = buildDossier(outDir, LIMITS);
  writeFileSync(join(outDir, "dossier.json"), dossier);

  const check = JSON.parse(new TextDecoder().decode(dossier)) as {
    schema?: string;
    images?: unknown[];
  };
  if (check.schema !== DOSSIER_SCHEMA) {
    throw new Error(`dossier schema mismatch: ${String(check.schema)}`);
  }
  const images = check.images?.length ?? 0;
  if (images === 0) throw new Error("dossier contains no screenshots");

  const digest = createHash("sha256").update(dossier).digest("hex");
  console.log(`staged ${appPaths.length} app files, ${shotPaths.length} screenshots -> ${outDir}`);
  console.log(`dossier.json: ${dossier.length} bytes, ${images} images, sha256 ${digest}`);
}

try {
  handIn();
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
