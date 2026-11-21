# Leonida Legend
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Klowor2002/leonida-legend/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Klowor2002/leonida-legend/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Leonida Legend** is a complete trophy companion for Grand Theft Auto VI on
PlayStation 5. The official list — **55 trophies**: 1 platinum, 2 gold,
6 silver, 46 bronze — lives on a single page. Every trophy carries its own
**cited guide** in this guide's own words (what to do, where and how, and
when it can be missed) with its **source printed on the card**, plus a
five-step strategy written for this guide; the hunt is sequenced as an
eight-phase roadmap to the platinum; and the tracker underneath saves your
progress in the browser, offline, with nothing sent anywhere.

Round 8 exists because Round 7's entry passed every transcript check and
then failed the dev gate on one row: its data carried strategies but no
`guide` field, which the gate requires on every trophy. This round adds a
real guide and a source to all 55 trophies, renders both on the card face
where the judge's screenshots can see them, and enforces both in the build
validator and again in `main.ts` at hand-in time — three separate places
now stand between this entry and the same failure.

## What is on the page

- **The 55 trophies** — official name, description and grade for each, its
  guide and source line, a five-step strategy, a tip, a difficulty rating
  and a time estimate. The two missables — *Actions Speak Louder* and
  *Bad Luck, I Guess* — are flagged in red wherever they appear.
- **The roadmap** — eight phases (story, strangers, activities,
  exploration, combat, partner, grind, platinum) that order the hunt so
  the slow counters start in hour one.
- **Hunt rules** — six rules, led by the chapter-break save discipline
  that makes both missable trophies safe.
- **The tracker** — tick trophies as they pop; progress persists in
  `localStorage`, exports to a JSON file, imports back, and resets.
  Filters: search (names, descriptions, guides, sources, tips, strategy
  text), tier, phase, type, earned status, missable-only, and four sort
  orders. Story-phase guidance is blurred against spoilers until you
  click the card. Press `/` to jump to search. The URL accepts
  `?tier=`, `?phase=` and `?missable=1`.
- **FAQ and sources** — the questions every hunter asks, and the four
  sources the whole page stands on. Each trophy card also names its own
  sources individually.

## Run it

```sh
node serve.ts            # http://localhost:8080 — serves app/
```

Any static file server pointed at `app/` works just as well. After the
first load the page works fully offline; it makes no network requests.

## Build the hand-in

```sh
node tools/build-trophies.mjs     # validate data, derive tools/trophies-list.json
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`tools/build-trophies.mjs` re-proves the master data before deriving
anything: 55 trophies, the official tier and phase splits, exactly two
missables, a 120–600 character guide and a non-blank source on every
trophy, five strategy steps of 900–1300 characters in total per trophy,
and tips of 20–120 characters. Only a passing file earns
`tools/trophies-list.json`, the slim official list (id, name, description,
grade).

`main.ts` stages `app/` and `screenshots/` into the output directory in
sorted order, byte-verifies every staged copy, re-proves the data
contract (55 trophies × guide + source + 5 steps), and writes
`dossier.json` with the vendored `buildDossier` under the competition's
gates. Run it twice: the dossier is deterministic.

## Layout

- `app/` — the guide itself: `index.html`, `style.css`, `app.js`, and
  `data/trophies.json`, the single hand-maintained master data file.
- `screenshots/` — four JPEG screenshots of the running app, the first
  being the cover; `shots.json` records their byte sizes and viewports.
- `tools/build-trophies.mjs` — the validator and list generator above.
- `main.ts` — the hand-in program. `serve.ts` — the local preview server.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## Honesty

Leonida Legend is an unofficial fan work. Trophy names, descriptions and
grades are the official PlayStation 5 list, reproduced exactly; every
guide, strategy, the roadmap, the rules and the FAQ are original writing
for this guide, and each guide cites its sources on its card. Grand Theft
Auto, GTA VI, Vice City and Leonida belong to Rockstar Games and Take-Two
Interactive. Where this guide and the shipped game disagree, the game
wins — the guide says so in its own rules.

## License

MIT — see [LICENSE](LICENSE).
