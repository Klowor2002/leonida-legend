# Leonida Legend
[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Klowor2002/leonida-legend/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Klowor2002/leonida-legend/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**Leonida Legend** is a complete, offline trophy guide and progress tracker for Grand Theft Auto VI on
PlayStation 5, dressed in a dark neon "Vice City Nights" theme — deep purple, hot pink, electric cyan.
It covers all **55 trophies** of the official list: 1 platinum, 2 gold, 6 silver and 46 bronze. Open it,
and the whole hunt is on one page. After the single initial load of its data file it makes no network
requests at all, so it works on a plane, in a cabin, or anywhere else Leonida calls you from.

## What it does

- **A guide for every trophy.** Each of the 55 trophies gets a card with its official description
  (quoted verbatim, in italics), a full guide written for this page — the steps, the order to do things
  in, what to expect — plus a one-line Tip, a Basis line naming what the guide rests on, a difficulty
  rating in stars, and a realistic time estimate.
- **A seven-phase roadmap to the platinum.** Story first (12 trophies), then the stranger strands (6),
  activities and pastimes (7), exploration of the whole state (7), combat and crime (9), the partner
  trophies (3), and finally the long grind plus the 100% checklist and the platinum itself (11). Each
  phase card shows how many trophies it holds and why it sits where it does in the order.
- **A tracker that remembers.** Tick "Mark earned" on any card and the header ring (earned/55 and
  percentage), the per-grade progress bars and the card itself update instantly. Progress persists in
  the browser's local storage, and Export / Import buttons save or restore it as a small JSON file;
  Reset clears it after a confirmation.
- **Filters that find things.** Search across names, descriptions and guide text; filter by grade,
  roadmap phase or earned status; sort by guide order, grade, difficulty or time estimate; a
  missable-only toggle (the honest answer for this list: nothing is missable — every trophy can be
  earned after the story); and a "Hide story spoilers" setting, on by default, that blurs story-phase
  guides until you click to reveal the ones you want.

## Sources & honesty

The trophy names, descriptions and grades come from the official PlayStation 5 trophy list. Every
card's Basis line states what its guide rests on, and setting facts (Vice City, Ocean Beach, VCIA,
Lucia and Jason) come from Rockstar's official trailers and pages. GTA VI launches on 26 May 2026, so
exact in-game labels, markers and locations are confirmed against the shipped game — and where this
guide and the in-game menu differ, the in-game menu wins. This is an unofficial fan guide: all guide
text and artwork are original, and nothing here is taken from Rockstar.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in your browser. No build step, no dependencies — plain static files
(`app/index.html`, `app/style.css`, `app/app.js`, `app/data/trophies.json`).

<sub>Entered on [make.fun](https://make.fun/?ref=ebgtn94a&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
