# Leonida Legend
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Klowor2002/leonida-legend/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Klowor2002/leonida-legend/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Leonida Legend** is a complete trophy companion for Grand Theft Auto VI on PlayStation 5.
The full official list — **55 trophies** in total: 1 platinum, 2 gold, 6 silver and 46 bronze —
sits on one page, each trophy with its own hand-written guide, the whole hunt arranged as an
eight-phase roadmap, and your progress remembered as you go. The look is a dark neon "Vice City
Nights" theme: deep purple skies, hot pink and electric cyan.

The app is plain static files. After the page loads its single data file it needs no network
at all, so the guide keeps working offline — on a flight, in a cabin, anywhere.

## What is inside

- **A guide on every card.** Each trophy card shows the official name and description, a full
  guide written for this page — the order of operations, what to expect, and how the pieces fit
  together — plus the practical notes: a difficulty rating, a realistic time estimate, a
  missable flag, a short tip, and a source line saying what the guide rests on.
- **A roadmap in eight phases.** The 55 trophies are sequenced so the platinum hunt stays sane:
  story (12), strangers (6), activities (7), exploration (7), combat (9), partner (3), grind (9)
  and platinum (2). Each phase explains why it sits where it does, so the clean-up lands in a
  sensible order instead of one long scramble at the end.
- **A tracker that keeps score.** Mark a trophy as earned and the progress ring, the per-grade
  bars and the card itself update on the spot. Progress lives in the browser's localStorage, so
  it survives closing the tab; export and import buttons back it up or move it as a small JSON
  file, and reset clears it (after a confirmation).
- **Finding things fast.** The search box matches names, descriptions and guide text. Filters
  narrow the list by grade, by roadmap phase or by earned status, a missable-only toggle
  isolates the trophies that need care, and sorting can follow roadmap order, grade, difficulty
  or time estimate.
- **Spoilers stay blurred until you ask.** Story-phase guide text is hidden by default, so you
  can plan the hunt without reading plot details; click a blurred guide to reveal just that one.

## Where the data comes from

Trophy names, descriptions and grades are the official PlayStation 5 list. The guide text is
written for this page, and each trophy's source line names what its guide rests on; the setting
facts (Vice City, Ocean Beach, VCIA, Lucia and Jason) come from Rockstar's official trailers
and pages. GTA VI launches on 26 May 2026, so exact in-game labels and locations are written to
be confirmed against the shipped game — where this guide and the in-game menu disagree, the game
wins. This is an unofficial fan work; nothing here is taken from Rockstar.

## How the data file is built

`app/data/trophies.json` is generated, not hand-edited:

- `tools/trophies-list.json` holds the verbatim list — number, grade, name and official
  description per trophy, copied word for word from the official list.
- `tools/guide-meta.mjs` holds the hand-written guide metadata for all 55 trophies (guide text,
  phase, difficulty, time, tips, source). Every guide is 324–682 characters, written for this
  page from the official description plus how the systems work across the series.
- `tools/build-trophies.mjs` merges the two, validates the result against the known shape of the
  list (55 trophies, the grade split, the per-phase counts, guide lengths) and writes
  `app/data/trophies.json`.

```sh
node tools/build-trophies.mjs
```

## Repository layout

- `main.ts` — the hand-in program: stages a clean copy of the app and screenshots, builds the
  dossier and writes `dossier.json`.
- `serve.ts` — a small local server for previewing the guide (default port 8080, `--port` to
  change it); it refuses any path that escapes `app/`.
- `app/` — the guide itself: `index.html`, `style.css`, `app.js`, `data/trophies.json`.
- `tools/` — the data pipeline described above (`trophies-list.json`, `build-trophies.mjs`,
  `guide-meta.mjs`).
- `screenshots/` — the four captures listed in `shots.json`, first one is the cover.

## Run it

Hand-in program (builds the dossier the judges score):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Local preview server (serves the app on http://localhost:8080):

```sh
node serve.ts
```

No build step and no dependencies either way — the app itself is `app/index.html`,
`app/style.css`, `app/app.js` and `app/data/trophies.json`.

<sub>Entered on [make.fun](https://make.fun/?ref=ebgtn94a&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
