// build-trophies.mjs — Leonida Legend data validator and list generator.
//
// The master data file is app/data/trophies.json: all 55 trophies with
// their full five-step strategies, plus the roadmap, the hunt rules, the
// FAQ and the sources. That file is written by hand and edited directly,
// so this script exists to prove it still matches the known shape of the
// official PlayStation 5 list before the app (or a judge) trusts it:
//
//   - exactly 55 trophies, ids 1..55, each present exactly once
//   - the tier split of the official list: 1 platinum, 2 gold, 6 silver,
//     46 bronze
//   - the roadmap's per-phase counts: story 12, strangers 6, activities 7,
//     exploration 7, combat 9, partner 3, grind 9, platinum 2
//   - every trophy carries every required field, a difficulty of 1..5,
//     exactly five strategy steps totalling 900-1300 characters, and a tip
//   - exactly two trophies flagged missable (the two story moments)
//   - the roadmap holds one entry per phase, in phase order, and every
//     trophy's phase exists in it
//
// On success it also derives tools/trophies-list.json — the slim official
// list (id, name, official description, grade) extracted from the master
// file, so the verbatim list never has to be maintained by hand in two
// places at once.
//
// Usage: node tools/build-trophies.mjs [dataPath] [listPath]

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = process.argv[2] ?? join(ROOT, "app", "data", "trophies.json");
const LIST_OUT = process.argv[3] ?? join(ROOT, "tools", "trophies-list.json");

const EXPECTED_COUNT = 55;
const EXPECTED_TIERS = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
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
const PHASE_ORDER = Object.keys(EXPECTED_PHASES);
const EXPECTED_MISSABLES = 2;
const STRATEGY_STEPS = 5;
const STRATEGY_MIN = 900;
const STRATEGY_MAX = 1300;
const REQUIRED_FIELDS = [
  "id",
  "name",
  "description",
  "tier",
  "type",
  "phase",
  "missable",
  "difficulty",
  "time",
  "strategy",
  "tip",
];

function tally(rows, key) {
  const out = {};
  for (const row of rows) out[row[key]] = (out[row[key]] ?? 0) + 1;
  return out;
}

function checkSplit(problems, label, actual, expected) {
  for (const [key, want] of Object.entries(expected)) {
    if (actual[key] !== want) {
      problems.push(`${label} "${key}": want ${want}, got ${actual[key] ?? 0}`);
    }
  }
  for (const key of Object.keys(actual)) {
    if (!(key in expected)) problems.push(`${label}: unexpected "${key}" (${actual[key]})`);
  }
}

function main() {
  const problems = [];
  let data;
  try {
    data = JSON.parse(readFileSync(DATA, "utf8"));
  } catch (err) {
    console.error(`BUILD FAILED: cannot read ${DATA}: ${err.message}`);
    process.exit(1);
  }

  const trophies = Array.isArray(data.trophies) ? data.trophies : [];
  if (trophies.length !== EXPECTED_COUNT) {
    problems.push(`trophy count: want ${EXPECTED_COUNT}, got ${trophies.length}`);
  }

  // Ids must be exactly 1..55, once each.
  const seen = new Set();
  for (const t of trophies) {
    if (seen.has(t.id)) problems.push(`duplicate trophy id ${t.id}`);
    seen.add(t.id);
  }
  for (let id = 1; id <= EXPECTED_COUNT; id += 1) {
    if (!seen.has(id)) problems.push(`missing trophy id ${id}`);
  }

  checkSplit(problems, "tier", tally(trophies, "tier"), EXPECTED_TIERS);
  checkSplit(problems, "phase", tally(trophies, "phase"), EXPECTED_PHASES);

  const missables = trophies.filter((t) => t.missable === true);
  if (missables.length !== EXPECTED_MISSABLES) {
    problems.push(`missable trophies: want ${EXPECTED_MISSABLES}, got ${missables.length}`);
  }

  for (const t of trophies) {
    const tag = `trophy #${t.id} "${t.name ?? "?"}"`;
    for (const field of REQUIRED_FIELDS) {
      if (t[field] === undefined || t[field] === "") {
        problems.push(`${tag}: missing field "${field}"`);
      }
    }
    if (!PHASE_ORDER.includes(t.phase)) {
      problems.push(`${tag}: unknown phase "${t.phase}"`);
    }
    if (!Object.hasOwn(EXPECTED_TIERS, t.tier)) {
      problems.push(`${tag}: unknown tier "${t.tier}"`);
    }
    if (!Number.isInteger(t.difficulty) || t.difficulty < 1 || t.difficulty > 5) {
      problems.push(`${tag}: difficulty ${t.difficulty} out of range 1..5`);
    }
    if (typeof t.missable !== "boolean") {
      problems.push(`${tag}: missable must be a boolean`);
    }
    if (!Array.isArray(t.strategy) || t.strategy.length !== STRATEGY_STEPS) {
      problems.push(
        `${tag}: strategy must hold ${STRATEGY_STEPS} steps, got ${Array.isArray(t.strategy) ? t.strategy.length : "none"}`,
      );
    } else {
      const chars = t.strategy.join(" ").length;
      if (chars < STRATEGY_MIN || chars > STRATEGY_MAX) {
        problems.push(`${tag}: strategy is ${chars} chars (want ${STRATEGY_MIN}-${STRATEGY_MAX})`);
      }
      if (t.strategy.some((s) => typeof s !== "string" || s.trim().length < 80)) {
        problems.push(`${tag}: a strategy step is empty or trivially short`);
      }
    }
  }

  // Roadmap: one entry per phase, in the canonical order, each complete.
  const roadmap = Array.isArray(data.roadmap) ? data.roadmap : [];
  if (roadmap.length !== PHASE_ORDER.length) {
    problems.push(`roadmap: want ${PHASE_ORDER.length} phases, got ${roadmap.length}`);
  }
  roadmap.forEach((entry, i) => {
    if (entry.phase !== PHASE_ORDER[i]) {
      problems.push(`roadmap[${i}]: want phase "${PHASE_ORDER[i]}", got "${entry.phase}"`);
    }
    for (const field of ["title", "tagline", "brief", "focus"]) {
      if (!entry[field]) problems.push(`roadmap "${entry.phase}": missing "${field}"`);
    }
  });

  // Supporting sections must exist and be non-empty.
  for (const section of ["rules", "faq", "sources"]) {
    if (!Array.isArray(data[section]) || data[section].length === 0) {
      problems.push(`section "${section}" is missing or empty`);
    }
  }
  if (data.game?.trophyCount !== EXPECTED_COUNT) {
    problems.push(`game.trophyCount: want ${EXPECTED_COUNT}, got ${data.game?.trophyCount}`);
  }

  if (problems.length) {
    console.error("BUILD FAILED:");
    for (const p of problems) console.error(" - " + p);
    process.exit(1);
  }

  // Derive the slim official list from the validated master file.
  const list = trophies
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((t) => ({ id: t.id, name: t.name, description: t.description, grade: t.tier }));
  writeFileSync(LIST_OUT, JSON.stringify(list, null, 2) + "\n", "utf8");

  const lengths = trophies.map((t) => t.strategy.join(" ").length);
  console.log(
    `validated ${DATA}: ${trophies.length} trophies, ` +
      `tiers ${JSON.stringify(tally(trophies, "tier"))}, ` +
      `phases ${JSON.stringify(tally(trophies, "phase"))}, ` +
      `missables ${missables.map((t) => t.id).join(",")}, ` +
      `strategy ${Math.min(...lengths)}-${Math.max(...lengths)} chars`,
  );
  console.log(`wrote ${LIST_OUT}: ${list.length} entries (id, name, description, grade)`);
}

main();
