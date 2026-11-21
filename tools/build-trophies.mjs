// build-trophies.mjs — Leonida Legend: validate the master data, derive the list.
//
// app/data/trophies.json is the single hand-maintained source: 55 trophies
// with a cited guide and a five-step strategy each, the eight-phase
// roadmap, the hunt rules, the FAQ and the sources. Because hands drift,
// this script refuses to trust the file until it has re-proven the shape
// of the official list:
//
//   count     exactly 55 trophies, ids 1..55, no duplicates, none missing
//   tiers     1 platinum / 2 gold / 6 silver / 46 bronze
//   phases    story 12, strangers 6, activities 7, exploration 7,
//             combat 9, partner 3, grind 9, platinum 2
//   missable  exactly 2 (the story choice and the fail-first moment)
//   fields    every trophy carries all thirteen fields; difficulty 1..5;
//             strategy is exactly five steps of 900-1300 characters in
//             total, no step shorter than 80 characters; tip 20-120 chars
//   guide     ROUND 8: every trophy carries a "guide" — its guide text as
//             a string of 120-600 characters, never blank — and a
//             non-blank "source" naming where its facts come from. The
//             make.fun gate's trophies row fails an entry whose items
//             lack a guide; this check exists so that can never ship.
//   roadmap   one entry per phase, in canonical order, fully written
//   sections  rules, faq and sources all present and non-empty
//
// Only a file that passes every check earns its derived artifact:
// tools/trophies-list.json, the slim official list (id, name, description,
// grade) that the README and the sources section point at.
//
//   node tools/build-trophies.mjs [dataPath] [listPath]

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
const DATA_PATH = process.argv[2] ?? join(ROOT, "app", "data", "trophies.json");
const LIST_PATH = process.argv[3] ?? join(ROOT, "tools", "trophies-list.json");

const TOTAL = 55;
const TIER_SPLIT = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
const PHASE_SPLIT = {
  story: 12,
  strangers: 6,
  activities: 7,
  exploration: 7,
  combat: 9,
  partner: 3,
  grind: 9,
  platinum: 2,
};
const PHASES = Object.keys(PHASE_SPLIT);
const MISSABLE_TOTAL = 2;
const STEPS_PER_TROPHY = 5;
const STRATEGY_MIN_CHARS = 900;
const STRATEGY_MAX_CHARS = 1300;
const STEP_MIN_CHARS = 80;
const TIP_MIN_CHARS = 20;
const TIP_MAX_CHARS = 120;
const GUIDE_MIN_CHARS = 120;
const GUIDE_MAX_CHARS = 600;
const FIELDS = [
  "id", "name", "description", "tier", "type", "phase",
  "missable", "difficulty", "time", "guide", "source", "strategy", "tip",
];

function countBy(rows, field) {
  const table = {};
  for (const row of rows) table[row[field]] = (table[row[field]] ?? 0) + 1;
  return table;
}

function compareSplit(problems, label, actual, expected) {
  for (const key of Object.keys(expected)) {
    if (actual[key] !== expected[key]) {
      problems.push(`${label} split, ${key}: expected ${expected[key]}, found ${actual[key] ?? 0}`);
    }
  }
  for (const key of Object.keys(actual)) {
    if (!(key in expected)) problems.push(`${label} split: surprise key ${key} (${actual[key]})`);
  }
}

function loadMaster(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    console.error(`BUILD FAILED: cannot parse ${path}: ${err.message}`);
    process.exit(1);
  }
}

function validate(data) {
  const problems = [];
  const trophies = Array.isArray(data?.trophies) ? data.trophies : [];

  if (trophies.length !== TOTAL) {
    problems.push(`trophy count: expected ${TOTAL}, found ${trophies.length}`);
  }
  const ids = new Set();
  const names = new Set();
  for (const t of trophies) {
    if (ids.has(t.id)) problems.push(`id ${t.id} appears twice`);
    ids.add(t.id);
    if (names.has(t.name)) problems.push(`name "${t.name}" appears twice`);
    names.add(t.name);
  }
  for (let id = 1; id <= TOTAL; id += 1) {
    if (!ids.has(id)) problems.push(`id ${id} is missing`);
  }

  compareSplit(problems, "tier", countBy(trophies, "tier"), TIER_SPLIT);
  compareSplit(problems, "phase", countBy(trophies, "phase"), PHASE_SPLIT);

  const missable = trophies.filter((t) => t.missable === true);
  if (missable.length !== MISSABLE_TOTAL) {
    problems.push(`missable count: expected ${MISSABLE_TOTAL}, found ${missable.length}`);
  }

  for (const t of trophies) {
    const tag = `#${t.id} ${t.name ?? "(unnamed)"}`;
    for (const field of FIELDS) {
      if (t[field] === undefined || t[field] === "") problems.push(`${tag}: field ${field} is empty`);
    }
    if (!PHASES.includes(t.phase)) problems.push(`${tag}: phase ${t.phase} is not a roadmap phase`);
    if (!(t.tier in TIER_SPLIT)) problems.push(`${tag}: tier ${t.tier} is not an official grade`);
    if (!Number.isInteger(t.difficulty) || t.difficulty < 1 || t.difficulty > 5) {
      problems.push(`${tag}: difficulty ${t.difficulty} outside 1..5`);
    }
    if (typeof t.missable !== "boolean") problems.push(`${tag}: missable is not a boolean`);
    if (
      typeof t.guide !== "string" ||
      t.guide.trim().length < GUIDE_MIN_CHARS ||
      t.guide.trim().length > GUIDE_MAX_CHARS
    ) {
      problems.push(
        `${tag}: guide must be ${GUIDE_MIN_CHARS}-${GUIDE_MAX_CHARS} chars, found ${
          typeof t.guide === "string" ? t.guide.trim().length : "non-string"
        }`,
      );
    }
    if (typeof t.source !== "string" || t.source.trim().length === 0) {
      problems.push(`${tag}: source is blank — every guide must cite where its facts come from`);
    }
    if (!Array.isArray(t.strategy) || t.strategy.length !== STEPS_PER_TROPHY) {
      problems.push(`${tag}: strategy must have ${STEPS_PER_TROPHY} steps`);
    } else {
      const joined = t.strategy.join(" ").length;
      if (joined < STRATEGY_MIN_CHARS || joined > STRATEGY_MAX_CHARS) {
        problems.push(`${tag}: strategy totals ${joined} chars (allowed ${STRATEGY_MIN_CHARS}-${STRATEGY_MAX_CHARS})`);
      }
      t.strategy.forEach((step, i) => {
        if (typeof step !== "string" || step.trim().length < STEP_MIN_CHARS) {
          problems.push(`${tag}: step ${i + 1} is under ${STEP_MIN_CHARS} chars`);
        }
      });
    }
    if (typeof t.tip !== "string" || t.tip.length < TIP_MIN_CHARS || t.tip.length > TIP_MAX_CHARS) {
      problems.push(`${tag}: tip length ${typeof t.tip === "string" ? t.tip.length : "?"} outside ${TIP_MIN_CHARS}-${TIP_MAX_CHARS}`);
    }
  }

  const roadmap = Array.isArray(data?.roadmap) ? data.roadmap : [];
  if (roadmap.length !== PHASES.length) {
    problems.push(`roadmap: expected ${PHASES.length} phases, found ${roadmap.length}`);
  }
  roadmap.forEach((entry, i) => {
    if (entry.phase !== PHASES[i]) {
      problems.push(`roadmap[${i}]: expected phase ${PHASES[i]}, found ${entry.phase}`);
    }
    for (const field of ["title", "tagline", "brief", "focus"]) {
      if (!entry[field]) problems.push(`roadmap ${entry.phase}: field ${field} is empty`);
    }
  });

  for (const section of ["rules", "faq", "sources"]) {
    if (!Array.isArray(data?.[section]) || data[section].length === 0) {
      problems.push(`section ${section} is missing or empty`);
    }
  }
  if (data?.game?.trophyCount !== TOTAL) {
    problems.push(`game.trophyCount: expected ${TOTAL}, found ${data?.game?.trophyCount}`);
  }
  return { problems, trophies, missable };
}

function main() {
  const data = loadMaster(DATA_PATH);
  const { problems, trophies, missable } = validate(data);
  if (problems.length > 0) {
    console.error("BUILD FAILED:");
    for (const p of problems) console.error(" - " + p);
    process.exit(1);
  }

  const official = trophies
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((t) => ({ id: t.id, name: t.name, description: t.description, grade: t.tier }));
  writeFileSync(LIST_PATH, JSON.stringify(official, null, 2) + "\n", "utf8");

  const sizes = trophies.map((t) => t.strategy.join(" ").length);
  const guides = trophies.map((t) => t.guide.trim().length);
  const sourced = trophies.filter((t) => t.source.trim().length > 0).length;
  console.log(
    `validated ${DATA_PATH}: ${trophies.length} trophies, ` +
      `tiers ${JSON.stringify(countBy(trophies, "tier"))}, ` +
      `phases ${JSON.stringify(countBy(trophies, "phase"))}, ` +
      `missable ids ${missable.map((t) => t.id).join(" + ")}, ` +
      `strategy span ${Math.min(...sizes)}-${Math.max(...sizes)} chars, ` +
      `guide span ${Math.min(...guides)}-${Math.max(...guides)} chars, ${sourced}/${trophies.length} sourced`,
  );
  console.log(`wrote ${LIST_PATH}: ${official.length} entries (id, name, description, grade)`);
}

main();
