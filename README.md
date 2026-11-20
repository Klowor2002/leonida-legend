# Leonida Legend
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Klowor2002/leonida-legend/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Klowor2002/leonida-legend/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Leonida Legend** is a complete trophy companion for Grand Theft Auto VI on
PlayStation 5. The full official list — **55 trophies**: 1 platinum, 2 gold,
6 silver, 46 bronze — lives on a single page, every trophy carrying its own
five-step strategy, the whole hunt sequenced as an eight-phase roadmap, and a
tracker that remembers your progress in the browser. The styling is a dark
neon "Vice City Nights": deep indigo night, hot pink, electric cyan.

The app is plain static files with no build step and no dependencies. After
the first load it needs no network at all, so the guide keeps working
offline — on a flight, in a cabin, anywhere the hunt takes you.

## What is inside

- **A five-step strategy on every card.** Each trophy shows the official name
  and description, then a strategy written for this page in five ordered
  steps — the setup, the method, the pitfalls — plus the practical notes: a
  difficulty rating out of five, a realistic time estimate, a type, and a
  one-line tip. Exactly two trophies are flagged **MISSABLE** (a story choice
  and a fail-then-succeed moment), and both come with the save discipline
  that makes them safe.
- **A roadmap in eight phases.** Story (12), strangers (6), activities (7),
  exploration (7), combat (9), partner (3), grind (9) and the platinum pair
  (2) — sequenced so each phase funds and unlocks the next, and so the long
  counters (250 stunts, 3 card sets, 100 WAiNK spots, $250,000 laundered)
  start accumulating from the first hour instead of the last.
- **Hunt rules, FAQ and sources.** Six rules that prevent every known way
  this platinum goes wrong, the six questions every hunter asks, and an
  honest source list: what rests on the official trophy list, what on
  Rockstar's published material, and where the in-game stats screen
  overrules this page.
- **A tracker that keeps score.** Tick a trophy and the percentage, the
  per-tier bars and the "next on the road" pointer update on the spot.
  Ticks persist in localStorage; export and import move them between
  browsers as a small JSON file, and reset starts the hunt over.
- **Finding things fast.** Search matches names, descriptions and strategy
  text. Filters narrow by tier, roadmap phase, type and earned status, a
  missable-only toggle isolates the two trophies that need care, and sorting
  follows roadmap order, tier, difficulty or name. Story-phase strategies
  are blurred by default, so you can plan without spoilers — click one to
  reveal just that guide.

## Where the data comes from

Trophy names, descriptions and tiers are the official PlayStation 5 list.
Every strategy, the roadmap, the rules and the FAQ are written for this
page. Setting facts (Vice City, the state of Leonida, Ocean Beach, VCIA,
Lucia and Jason) come from Rockstar's official trailers and pages. Where
this guide and the shipped game disagree — a label, a location, a count —
the game wins, and the guide says so on its own sources section. This is an
unofficial fan work; nothing here is taken from Rockstar.

## How the data file is built

`app/data/trophies.json` is the hand-written master file: all 55 trophies
with their strategies, plus the roadmap, rules, FAQ and sources.
`tools/build-trophies.mjs` validates it against the known shape of the
official list — 55 trophies, the 1/2/6/46 tier split, the per-phase counts,
every strategy exactly five steps of 900–1300 characters in total, exactly
two missables — and derives `tools/trophies-list.json`, the slim verbatim
list (id, name, official description, grade), so the official list is never
maintained by hand in two places at once.

```sh
node tools/build-trophies.mjs
```

## Repository layout

- `main.ts` — the hand-in program: stages a clean copy of the app and the
  screenshots, verifies the copies byte-for-byte, builds the dossier and
  writes `dossier.json`.
- `serve.ts` — a small local server for previewing the guide (default port
  8080, `--port` to change it); it refuses any path that escapes `app/`.
- `app/` — the guide itself: `index.html`, `style.css`, `app.js`,
  `data/trophies.json`.
- `tools/` — the data pipeline described above (`build-trophies.mjs`
  validates the master file and generates `trophies-list.json`).
- `screenshots/` — the four captures listed in `shots.json`; the first is
  the cover.

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
