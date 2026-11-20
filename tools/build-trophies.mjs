// build-trophies.mjs — Leonida Legend data builder.
//
// Merges the verbatim official list (tools/trophies-list.json: id, name,
// official description, grade — copied word for word from the kit starter
// list) with the hand-written guide metadata in ./guide-meta.mjs, checks the
// result against the known shape of the list (55 trophies; 1 platinum,
// 2 gold, 6 silver, 46 bronze; the design's per-phase counts; every guide
// 324–682 chars), and writes app/data/trophies.json for the static app.
//
// Usage: node tools/build-trophies.mjs [listPath] [outPath]

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GUIDE_META, PHASE_ORDER } from "./guide-meta.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const listPath = process.argv[2] ?? join(repoRoot, "tools", "trophies-list.json");
const outPath = process.argv[3] ?? join(repoRoot, "app", "data", "trophies.json");

const WANT_GRADES = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
const WANT_PHASES = {
  story: 12,
  strangers: 6,
  activities: 7,
  exploration: 7,
  combat: 9,
  partner: 3,
  grind: 9,
  platinum: 2,
};
const GUIDE_MIN = 324;
const GUIDE_MAX = 682;

function tally(rows, key) {
  const counts = {};
  for (const row of rows) counts[row[key]] = (counts[row[key]] ?? 0) + 1;
  return counts;
}

function build() {
  const list = JSON.parse(readFileSync(listPath, "utf8"));
  const faults = [];

  if (!Array.isArray(list) || list.length !== 55) {
    faults.push(`verbatim list must hold 55 trophies, found ${list.length}`);
  }

  const trophies = list.map((entry) => {
    const meta = GUIDE_META[entry.id];
    if (!meta) {
      faults.push(`trophy #${entry.id} "${entry.name}" has no guide metadata`);
      return entry;
    }
    return {
      id: entry.id,
      name: entry.name,
      description: entry.description,
      grade: entry.grade,
      guide: meta.guide,
      phase: meta.phase,
      missable: false,
      difficulty: meta.difficulty,
      time: meta.time,
      tips: meta.tips,
      source: meta.source,
    };
  });

  // Every metadata entry must be used exactly once (catches stale ids).
  for (const id of Object.keys(GUIDE_META).map(Number)) {
    if (!list.some((t) => t.id === id)) faults.push(`metadata id ${id} is not in the list`);
  }

  const grades = tally(trophies, "grade");
  for (const [grade, want] of Object.entries(WANT_GRADES)) {
    if (grades[grade] !== want) {
      faults.push(`grade ${grade}: want ${want}, got ${grades[grade] ?? 0}`);
    }
  }
  // The phase split is part of the design: the roadmap's step counts are
  // printed from the data, so a drift here would mislabel the whole page.
  const phases = tally(trophies, "phase");
  for (const [phase, want] of Object.entries(WANT_PHASES)) {
    if (phases[phase] !== want) {
      faults.push(`phase ${phase}: want ${want}, got ${phases[phase] ?? 0}`);
    }
  }
  for (const t of trophies) {
    if (!t.description) faults.push(`trophy #${t.id} has no official description`);
    if (!PHASE_ORDER.includes(t.phase)) {
      faults.push(`trophy #${t.id} "${t.name}": unknown phase "${t.phase}"`);
    }
    if (typeof t.difficulty !== "number" || t.difficulty < 1 || t.difficulty > 5) {
      faults.push(`trophy #${t.id} "${t.name}": difficulty ${t.difficulty} out of range`);
    }
    const len = t.guide ? t.guide.length : 0;
    if (len < GUIDE_MIN || len > GUIDE_MAX) {
      faults.push(`trophy #${t.id} "${t.name}": guide is ${len} chars (want ${GUIDE_MIN}–${GUIDE_MAX})`);
    }
    if (!t.tips) faults.push(`trophy #${t.id} "${t.name}": missing tip`);
    if (!t.source) faults.push(`trophy #${t.id} "${t.name}": missing source`);
  }

  if (faults.length) {
    console.error("BUILD FAILED:");
    for (const f of faults) console.error(" - " + f);
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
  const mean = Math.round(
    trophies.reduce((sum, t) => sum + t.guide.length, 0) / trophies.length,
  );
  console.log(
    `wrote ${outPath}: ${trophies.length} trophies ` +
      `(grades ${JSON.stringify(grades)}, phases ${JSON.stringify(phases)}, mean guide ${mean} chars)`,
  );
}

build();
