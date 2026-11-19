// build-trophies.mjs — Leonida Legend data builder.
//
// Reads the verbatim trophy list (TROPHIES.txt: number, grade, name,
// official description, one-line summary), merges each trophy with the
// hand-written guide metadata in ./guide-meta.mjs, validates the result
// against the known shape of the list (55 trophies; 1 platinum, 2 gold,
// 6 silver, 46 bronze; the design's per-phase counts), and writes
// app/data/trophies.json for the static app to fetch.
//
// Usage: node tools/build-trophies.mjs [trophiesTxtPath] [outPath]

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GUIDE_META, PHASE_ORDER } from "./guide-meta.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const inPath =
  process.argv[2] ??
  join(repoRoot, "..", "gta6-trophy-guide-01", "TROPHIES.txt");
const outPath = process.argv[3] ?? join(repoRoot, "app", "data", "trophies.json");

const EXPECTED_GRADES = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
const EXPECTED_PHASES = {
  story: 12,
  strangers: 6,
  activities: 7,
  exploration: 7,
  combat: 9,
  partner: 3,
  grind: 9,
  platinum: 2,
};

function parseLine(line) {
  // " 7 [gold    ] You Gotta Know When to Get Off — Complete the final mission. || Finish the final mission (gold)."
  const m = line.match(
    /^\s*(\d+)\s+\[\s*(platinum|gold|silver|bronze)\s*\]\s+(.+?) — (.+?) \|\| (.+?)\s*$/,
  );
  if (!m) return null;
  const [, num, grade, name, description, summary] = m;
  return { id: Number(num), grade, name, description, summary };
}

function main() {
  const raw = readFileSync(inPath, "utf8");
  const base = raw
    .split("\n")
    .map(parseLine)
    .filter((t) => t !== null);

  const problems = [];
  if (base.length !== 55) problems.push(`expected 55 trophies, parsed ${base.length}`);

  const trophies = base.map((t) => {
    const meta = GUIDE_META[t.name];
    if (!meta) {
      problems.push(`no guide metadata for trophy #${t.id} "${t.name}"`);
      return t;
    }
    return {
      ...t,
      guide: meta.guide,
      phase: meta.phase,
      missable: false,
      difficulty: meta.difficulty,
      time: meta.time,
      tips: meta.tips,
      source: meta.source,
    };
  });

  // Cross-check: every metadata key was consumed (catches renamed trophies).
  const names = new Set(base.map((t) => t.name));
  for (const key of Object.keys(GUIDE_META)) {
    if (!names.has(key)) problems.push(`metadata key not in trophy list: "${key}"`);
  }

  const countBy = (key) =>
    trophies.reduce((acc, t) => {
      acc[t[key]] = (acc[t[key]] ?? 0) + 1;
      return acc;
    }, {});

  const grades = countBy("grade");
  for (const [grade, want] of Object.entries(EXPECTED_GRADES)) {
    if (grades[grade] !== want)
      problems.push(`grade ${grade}: want ${want}, got ${grades[grade] ?? 0}`);
  }
  const phases = countBy("phase");
  for (const [phase, want] of Object.entries(EXPECTED_PHASES)) {
    if (phases[phase] !== want)
      problems.push(`phase ${phase}: want ${want}, got ${phases[phase] ?? 0}`);
  }
  for (const t of trophies) {
    if (!t.guide || t.guide.length < 250)
      problems.push(`guide too short for "${t.name}" (${t.guide?.length ?? 0} chars)`);
    if (t.guide && t.guide.length > 900)
      problems.push(`guide too long for "${t.name}" (${t.guide.length} chars)`);
    if (!t.description) problems.push(`empty official description for "${t.name}"`);
    if (!PHASE_ORDER.includes(t.phase))
      problems.push(`unknown phase "${t.phase}" for "${t.name}"`);
  }

  if (problems.length) {
    console.error("BUILD FAILED:");
    for (const p of problems) console.error(" - " + p);
    process.exit(1);
  }

  const payload = {
    game: "Grand Theft Auto VI",
    title: "Leonida Legend",
    note: "Trophy names, grades and official descriptions are verbatim from the official list. Guide text, phases, difficulty and time estimates are this guide's own work.",
    phases: PHASE_ORDER,
    count: trophies.length,
    trophies,
  };

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
  const avgGuide = Math.round(
    trophies.reduce((sum, t) => sum + t.guide.length, 0) / trophies.length,
  );
  console.log(
    `wrote ${outPath}: ${trophies.length} trophies ` +
      `(grades ${JSON.stringify(grades)}, phases ${JSON.stringify(phases)}, avg guide ${avgGuide} chars)`,
  );
}

main();
