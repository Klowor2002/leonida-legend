# Leonida Legend
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Klowor2002/leonida-legend/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Klowor2002/leonida-legend/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Leonida Legend** is a complete trophy companion for Grand Theft Auto VI on
PlayStation 5. The official list — **55 trophies**: 1 platinum, 2 gold,
6 silver, 46 bronze — lives on a single page. Every trophy carries its own
five-step strategy written for this guide, the hunt is sequenced as an
eight-phase roadmap, and a built-in tracker remembers your progress in the
browser. The look is "Leonida Dusk": a Vice City sunset held at the moment
the neon takes over.

The app is plain static files — no build step, no dependencies, no network
after the first load — so the guide keeps working offline wherever the hunt
takes you.

## What is inside

- **A five-step strategy on every card.** The official name and description,
  then five ordered steps written for this page: the setup, the method, the
  trap to avoid. Around them sit the practical notes — a difficulty rating
  out of five, a realistic time estimate, a type, and a one-line tip.
  Exactly two trophies are flagged **MISSABLE** (a story choice and a
  fail-then-succeed moment), and both come with the save discipline that
  makes them safe.
- **A roadmap in eight phases.** Story (12), strangers (6), activities (7),
  exploration (7), combat (9), partner (3), grind (9) and the platinum pair
  (2) — ordered so each phase funds and unlocks the next, and so the long
  counters (250 stunts, 3 card sets, 100 WAiNK spots, $250,000 laundered)
  start accumulating in the first hour instead of the last.
- **Hunt rules, FAQ and sources.** Six rules that prevent every known way
  this platinum goes wrong, the six questions every hunter asks, and an
  honest source list: what rests on the official trophy list, what on
  Rockstar's published material, and where the in-game screens overrule
  this page.
- **A tracker that keeps score.** Tick a trophy and the percentage, the
  per-tier bars and the "next on the road" pointer update at once. Ticks
  persist in localStorage; export and import move them between browsers as
  a small JSON file; reset starts the hunt over.
- **Finding things fast.** Search matches names, descriptions, tips and
  strategy text. Filters narrow by tier, roadmap phase, type and earned
  status, a missable-only toggle isolates the two trophies that need care,
  and sorting follows roadmap order, tier, difficulty or name. Story-phase
  strategies are blurred by default — click one to reveal just that guide
  and plan the hunt without spoilers.

## Where the data comes from

Trophy names, descriptions and grades are the official PlayStation 5 list.
Every strategy, the roadmap, the rules and the FAQ are written for this
page. Setting facts (Vice City, the state of Leonida, Ocean Beach, VCIA,
Lucia Caminos and Jason Duval) come from Rockstar's official trailers and
pages. Where this guide and the shipped game disagree — a count, a label,
a location — the game wins, and the guide says so in its own sources
section. This is an unofficial fan work.

## How the data file is built

`app/data/trophies.json` is the hand-written master file: all 55 trophies
with their strategies, plus the roadmap, the rules, the FAQ and the
sources. `tools/build-trophies.mjs` validates it against the known shape
of the official list — 55 trophies with ids 1–55, the 1/2/6/46 tier split,
the per-phase counts, every strategy exactly five steps totalling
900–1300 characters, every tip 20–120 characters, exactly two missables —
and derives `tools/trophies-list.json`, the slim official list (id, name,
description, grade), so the verbatim list is never maintained by hand in
two places at once.

```sh
node tools/build-trophies.mjs
```

## Repository layout

- `main.ts` — the hand-in program: sanity-checks the master data, stages
  a clean copy of the app and the screenshots, verifies the copies
  byte-for-byte, builds the dossier and writes `dossier.json`.
- `serve.ts` — a small local preview server (default port 8080, `--port`
  to change it); GET/HEAD only, and it refuses any path that escapes
  `app/`.
- `app/` — the guide itself: `index.html`, `style.css`, `app.js`,
  `data/trophies.json`.
- `tools/` — the data pipeline above: `build-trophies.mjs` validates the
  master file and generates `trophies-list.json`.
- `screenshots/` — the four captures listed in `shots.json`, all taken
  fresh from the running app at 1280×657: the cover (masthead and
  tracker), the checklist (the first trophy cards), the silver filter
  (`?tier=silver`, scrolled to the cards) and the sources section.

## Run it

Hand-in program (builds the dossier the judges score):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Local preview server (serves the app on http://localhost:8080):

```sh
node serve.ts
```

No build step and no dependencies either way — the app itself is
`app/index.html`, `app/style.css`, `app/app.js` and `app/data/trophies.json`.

<sub>Entered on [make.fun](https://make.fun/?ref=ebgtn94a&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
