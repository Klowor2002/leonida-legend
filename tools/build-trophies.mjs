// build-trophies.mjs — Leonida Legend data builder.
//
// Takes the verbatim official list (tools/trophies-list.json: id, name,
// official description, grade — word for word from the kit starter list)
// and joins it with the hand-written guide metadata in guide-meta.mjs,
// then checks the merged result against the known shape of the list
// (55 trophies; 1 platinum, 2 gold, 6 silver, 46 bronze; the design's
// per-phase counts; every guide 324-682 chars) and writes
// app/data/trophies.json for the static app.
//
// Usage: node tools/build-trophies.mjs [listPath] [outPath]

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { GUIDE_META, PHASE_ORDER } from "./guide-meta.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const LIST = process.argv[2] ?? join(ROOT, "tools", "trophies-list.json");
const OUT = process.argv[3] ?? join(ROOT, "app", "data", "trophies.json");

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
const MIN_GUIDE = 324;
const MAX_GUIDE = 682;

function countBy(rows, key) {
  const out = {};
  for (const row of rows) out[row[key]] = (out[row[key]] ?? 0) + 1;
  return out;
}

function build() {
  const list = JSON.parse(readFileSync(LIST, "utf8"));
  const problems = [];

  if (!Array.isArray(list) || list.length !== 55) {
    problems.push(`verbatim list must hold 55 trophies, found ${list?.length ?? "?"}`);
  }

  const trophies = (Array.isArray(list) ? list : []).map((entry) => {
    const meta = GUIDE_META[entry.id];
    if (!meta) {
      problems.push(`trophy #${entry.id} "${entry.name}" has no guide metadata`);
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

  // No metadata entry may be orphaned (catches stale ids).
  for (const id of Object.keys(GUIDE_META).map(Number)) {
    if (!list.some((t) => t.id === id)) problems.push(`metadata id ${id} is not in the list`);
  }

  const grades = countBy(trophies, "grade");
  for (const [grade, want] of Object.entries(EXPECTED_GRADES)) {
    if (grades[grade] !== want) problems.push(`grade ${grade}: want ${want}, got ${grades[grade] ?? 0}`);
  }
  // The phase split feeds the roadmap's step counts, so a drift here would
  // mislabel the whole page.
  const phases = countBy(trophies, "phase");
  for (const [phase, want] of Object.entries(EXPECTED_PHASES)) {
    if (phases[phase] !== want) problems.push(`phase ${phase}: want ${want}, got ${phases[phase] ?? 0}`);
  }
  for (const t of trophies) {
    if (!t.description) problems.push(`trophy #${t.id} has no official description`);
    if (!PHASE_ORDER.includes(t.phase)) problems.push(`trophy #${t.id} "${t.name}": unknown phase "${t.phase}"`);
    if (typeof t.difficulty !== "number" || t.difficulty < 1 || t.difficulty > 5) {
      problems.push(`trophy #${t.id} "${t.name}": difficulty ${t.difficulty} out of range`);
    }
    const len = t.guide ? t.guide.length : 0;
    if (len < MIN_GUIDE || len > MAX_GUIDE) {
      problems.push(`trophy #${t.id} "${t.name}": guide is ${len} chars (want ${MIN_GUIDE}-${MAX_GUIDE})`);
    }
    if (!t.tips) problems.push(`trophy #${t.id} "${t.name}": missing tip`);
    if (!t.source) problems.push(`trophy #${t.id} "${t.name}": missing source`);
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

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n", "utf8");
  const mean = Math.round(trophies.reduce((s, t) => s + t.guide.length, 0) / trophies.length);
  const longest = Math.max(...trophies.map((t) => t.guide.length));
  const shortest = Math.min(...trophies.map((t) => t.guide.length));
  console.log(
    `wrote ${OUT}: ${trophies.length} trophies ` +
      `(grades ${JSON.stringify(grades)}, phases ${JSON.stringify(phases)}, ` +
      `guide length ${shortest}-${longest} chars, mean ${mean})`,
  );
}

build();
