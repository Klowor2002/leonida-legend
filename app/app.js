/* Leonida Legend — guide & tracker logic.
 *
 * One fetch (data/trophies.json) at startup; after that the page works
 * fully offline. Earned ticks persist in localStorage and can be exported
 * to / imported from a JSON file. Cards are plain DOM built from the data;
 * filtering and sorting happen client-side on every control change. */

const STORE_KEY = "leonida-legend-earned-v1";
const RING_CIRC = 2 * Math.PI * 63; // matches r=63 in the ring SVG
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

const PHASE_LABELS = {
  story: "Story",
  strangers: "Strangers & Freaks",
  activities: "Activities & Sports",
  exploration: "Exploration",
  combat: "Combat & Crime",
  partner: "Partner Play",
  grind: "The Long Grind",
  platinum: "Platinum Path",
};

const PHASE_NOTES = {
  story:
    "Play the campaign from Gone Fishing to the final mission. The story opens the map, funds everything later and banks a dozen trophies by itself — no grinding yet, just play.",
  strangers:
    "Clear the stranger strands: Andy, Kenton, Billy, Randy, Tyrone and the rest. Strands advance in steps, so let in-game days pass when a marker goes quiet.",
  activities:
    "Sample every activity once, then master them: range golds, a drone-race win at every course, twenty different race wins and Cal beaten at his own fishing game.",
  exploration:
    "Lift the fog from all of Leonida, meditate at every spot, sit in 100 different vehicles, and keep an eye out for the state's stranger sights after dark.",
  combat:
    "The loud phase: vaults, armoured trucks, gang operations, one quiet jewellery job, a Rhino, and five takedowns inside a single Combat Focus. Plan the escape first.",
  partner:
    "Three trophies need both protagonists together: shed a four-star wanted level as a pair, rob three shops in one unbroken chain, and let the partnership pay out.",
  grind:
    "The slow counters only patience fills: stunts, card sets, WAiNK spots, challenges, laundered bills, shop spending and every garage deed in the state.",
  platinum:
    "The summit: 100% completion, then the platinum itself. If the phases above are done, this is a victory lap, not a second game.",
};

const $ = (sel) => document.querySelector(sel);
const els = {
  cards: $("#ll-cards"),
  empty: $("#ll-none"),
  showing: $("#ll-showing"),
  grades: $("#ll-grade-row"),
  roadmap: $("#ll-roadmap"),
  ringFill: $("#ll-dial-arc"),
  ringCount: $("#ll-dial-count"),
  ringPct: $("#ll-dial-pct"),
  notice: $("#ll-notice"),
  search: $("#ll-q"),
  grade: $("#ll-grade"),
  phase: $("#ll-phase"),
  status: $("#ll-status"),
  sort: $("#ll-sort"),
  missable: $("#ll-missable"),
  spoilers: $("#ll-spoilers"),
  importFile: $("#ll-import"),
};

let allTrophies = [];
const earned = readEarned();
const revealed = new Set();

function readEarned() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]");
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    return new Set((ids ?? []).map(Number));
  } catch {
    return new Set();
  }
}

function writeEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function minutesFrom(timeText) {
  const m = /(\d+(?:\.\d+)?)\s*(h|min)/i.exec(timeText ?? "");
  if (!m) return Number.MAX_SAFE_INTEGER;
  return m[2].toLowerCase() === "h" ? Number(m[1]) * 60 : Number(m[1]);
}

function starsFor(difficulty) {
  // Difficulty 1–5 maps to filled stars; the rest stay hollow.
  return "★".repeat(difficulty) + "☆".repeat(5 - difficulty);
}

function paintProgress() {
  const total = allTrophies.length;
  const done = allTrophies.filter((t) => earned.has(t.id)).length;
  els.ringCount.textContent = `${done}/${total}`;
  const pct = total ? Math.round((done / total) * 100) : 0;
  els.ringPct.textContent = `${pct}%`;
  els.ringFill.style.strokeDashoffset = String(RING_CIRC * (1 - done / (total || 1)));

  els.grades.replaceChildren(
    ...["platinum", "gold", "silver", "bronze"].map((grade) => {
      const inGrade = allTrophies.filter((t) => t.grade === grade);
      const got = inGrade.filter((t) => earned.has(t.id)).length;
      const card = document.createElement("div");
      card.className = `grade-card ${grade}`;
      const title = document.createElement("h3");
      const label = document.createTextNode(
        grade[0].toUpperCase() + grade.slice(1) + " ",
      );
      const count = document.createElement("span");
      count.textContent = `${got}/${inGrade.length}`;
      title.append(label, count);
      const meter = document.createElement("div");
      meter.className = "meter";
      const fill = document.createElement("i");
      fill.style.width = inGrade.length ? `${(got / inGrade.length) * 100}%` : "0%";
      meter.append(fill);
      card.append(title, meter);
      return card;
    }),
  );
}

function paintRoadmap() {
  const perPhase = allTrophies.reduce((acc, t) => {
    acc[t.phase] = (acc[t.phase] ?? 0) + 1;
    return acc;
  }, {});
  els.roadmap.replaceChildren(
    ...Object.keys(PHASE_NOTES).map((phase, i) => {
      const item = document.createElement("li");
      const heading = document.createElement("h3");
      heading.textContent = `Step ${i + 1} — ${PHASE_LABELS[phase] ?? phase} `;
      const tally = document.createElement("span");
      tally.className = "count";
      tally.textContent = `· ${perPhase[phase] ?? 0} trophies`;
      heading.append(tally);
      const note = document.createElement("p");
      note.textContent = PHASE_NOTES[phase];
      item.append(heading, note);
      return item;
    }),
  );
}

function activeFilters() {
  return {
    q: els.search.value.trim().toLowerCase(),
    grade: els.grade.value,
    phase: els.phase.value,
    status: els.status.value,
    sort: els.sort.value,
    missableOnly: els.missable.checked,
    hideSpoilers: els.spoilers.checked,
  };
}

function applyFilters(f) {
  const kept = allTrophies.filter((t) => {
    if (f.grade && t.grade !== f.grade) return false;
    if (f.phase && t.phase !== f.phase) return false;
    if (f.status === "done" && !earned.has(t.id)) return false;
    if (f.status === "todo" && earned.has(t.id)) return false;
    if (f.missableOnly && !t.missable) return false;
    if (f.q) {
      const hay = `${t.name} ${t.description} ${t.guide} ${t.tips}`.toLowerCase();
      if (!hay.includes(f.q)) return false;
    }
    return true;
  });
  const sorters = {
    guide: (a, b) => a.id - b.id,
    grade: (a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id,
    difficulty: (a, b) => a.difficulty - b.difficulty || a.id - b.id,
    time: (a, b) => minutesFrom(a.time) - minutesFrom(b.time) || a.id - b.id,
  };
  return kept.sort(sorters[f.sort]);
}

function buildCard(t, hideSpoilers) {
  const card = document.createElement("article");
  card.className = "trophy-card" + (earned.has(t.id) ? " earned" : "");
  const isHidden = hideSpoilers && t.phase === "story" && !revealed.has(t.id);

  const head = document.createElement("header");
  const name = document.createElement("h3");
  name.textContent = t.name;
  const tag = document.createElement("span");
  tag.className = `grade-tag ${t.grade}`;
  tag.textContent = t.grade;
  head.append(name, tag);

  const official = document.createElement("p");
  official.className = "official-text";
  official.textContent = t.description;

  const guide = document.createElement("p");
  guide.className = "guide-text" + (isHidden ? " hidden-spoiler" : "");
  guide.dataset.revealFor = String(t.id);
  if (isHidden) {
    guide.title = "Story guide — click or press Enter to reveal";
    guide.tabIndex = 0;
    guide.setAttribute("role", "button");
    guide.setAttribute("aria-label", `Reveal the story guide for ${t.name}`);
  }
  guide.textContent = t.guide;

  const chips = document.createElement("ul");
  chips.className = "tag-list";
  for (const chip of [
    PHASE_LABELS[t.phase] ?? t.phase,
    `Difficulty ${t.difficulty}/5`,
    t.time,
    t.missable ? "Missable" : "Not missable",
  ]) {
    const li = document.createElement("li");
    li.textContent = chip;
    chips.append(li);
  }

  const tip = document.createElement("p");
  tip.className = "tip-line";
  tip.innerHTML = "<strong>Tip.</strong> ";
  tip.append(document.createTextNode(t.tips));

  const basis = document.createElement("p");
  basis.className = "basis-line";
  basis.textContent = `Basis: ${t.source}`;

  const markRow = document.createElement("div");
  markRow.className = "mark-row";
  const label = document.createElement("label");
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = earned.has(t.id);
  box.dataset.earnFor = String(t.id);
  const stars = document.createElement("span");
  stars.className = "stars";
  stars.textContent = starsFor(t.difficulty);
  label.append(box, document.createTextNode("Mark earned "), stars);
  markRow.append(label);

  card.append(head, official, guide, chips, tip, basis, markRow);
  return card;
}

function render() {
  const f = activeFilters();
  const list = applyFilters(f);
  els.cards.replaceChildren(...list.map((t) => buildCard(t, f.hideSpoilers)));
  els.empty.hidden = list.length !== 0;
  els.showing.textContent = `${list.length} of ${allTrophies.length} trophies shown.`;
  paintProgress();
}

/* — events (delegated: cards are rebuilt on every render) — */

$("#ll-toolbar").addEventListener("input", render);

els.cards.addEventListener("change", (event) => {
  const box = event.target.closest("[data-earn-for]");
  if (!box) return;
  const id = Number(box.dataset.earnFor);
  if (box.checked) earned.add(id);
  else earned.delete(id);
  writeEarned();
  render();
});

function revealGuide(event) {
  const guide = event.target.closest("[data-reveal-for]");
  if (guide?.classList.contains("hidden-spoiler")) {
    revealed.add(Number(guide.dataset.revealFor));
    render();
  }
}
els.cards.addEventListener("click", revealGuide);
els.cards.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  if (event.target.closest("[data-reveal-for]")?.classList.contains("hidden-spoiler")) {
    event.preventDefault();
    revealGuide(event);
  }
});

els.search.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    els.search.value = "";
    render();
  }
});

$("#ll-export").addEventListener("click", () => {
  const payload = JSON.stringify(
    { app: "leonida-legend", version: 1, earned: [...earned].sort((a, b) => a - b) },
    null,
    2,
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  link.download = "leonida-legend-progress.json";
  link.click();
  URL.revokeObjectURL(link.href);
  els.notice.textContent = "Progress exported — keep the file somewhere safe.";
});

$("#ll-import-btn").addEventListener("click", () => els.importFile.click());

els.importFile.addEventListener("change", async () => {
  const file = els.importFile.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error("no earned list");
    earned.clear();
    for (const id of ids) if (Number.isInteger(id)) earned.add(id);
    writeEarned();
    render();
    els.notice.textContent = `Imported ${earned.size} earned trophies.`;
  } catch {
    els.notice.textContent = "That file did not parse as a progress export.";
  }
  els.importFile.value = "";
});

$("#ll-reset").addEventListener("click", () => {
  if (!window.confirm("Clear every earned tick on this device?")) return;
  earned.clear();
  writeEarned();
  render();
  els.notice.textContent = "Progress reset. Fresh run, clean slate.";
});

/* — boot — */

async function boot() {
  const res = await fetch("data/trophies.json");
  const data = await res.json();
  allTrophies = data.trophies;
  for (const phase of data.phases) {
    const opt = document.createElement("option");
    opt.value = phase;
    opt.textContent = PHASE_LABELS[phase] ?? phase;
    els.phase.append(opt);
  }
  paintRoadmap();
  render();
}

boot().catch((err) => {
  els.showing.textContent = `Could not load the trophy data (${err.message}).`;
});
