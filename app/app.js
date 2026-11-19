/* Leonida Legend — guide & tracker logic.
 *
 * One fetch (data/trophies.json) at startup; after that the page is fully
 * offline. Earned ticks persist in localStorage and can be exported to /
 * imported from a JSON file. Rendering is plain DOM built from the data;
 * filtering and sorting happen client-side on every control change. */

const STORE_KEY = "leonida-legend-earned-v1";
const DIAL_CIRC = 2 * Math.PI * 63; // matches r=63 in the dial SVG
const GRADE_RANK = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

const PHASE_BLURB = {
  story:
    "Play the campaign from Gone Fishing to the final mission. The story opens the map, funds everything later and banks a dozen trophies by itself — no grinding yet, just play.",
  strangers:
    "Clear the stranger strands: Andy, Kenton, Billy, Randy, Tyrone and the rest. Strands advance in steps, so let in-game days pass when a marker goes quiet.",
  activities:
    "Sample every activity once, then master them: range golds, a drone-race win at every course, twenty different race wins and Cal beaten at his own fishing game.",
  exploration:
    "Lift the fog from all 52 areas, meditate at every spot, sit in 100 different vehicles, and keep an eye out for Leonida's stranger sights after dark.",
  combat:
    "The loud phase: vaults, armoured trucks, gang operations, one quiet jewellery job, a Rhino, and five takedowns inside a single Combat Focus. Plan the escape first.",
  partner:
    "Three trophies need both protagonists together: shed a four-star wanted level as a pair, rob three shops in one unbroken chain, and let the partnership pay out.",
  grind:
    "The slow counters only patience fills: stunts, card sets, WAiNK spots, challenges, laundered bills, shop spending and every garage deed in the state.",
  platinum:
    "The summit: 100% completion, then the platinum itself. If the phases above are done, this is a victory lap, not a second game.",
};

const ui = {
  cards: document.querySelector("#ll-cards"),
  none: document.querySelector("#ll-none"),
  showing: document.querySelector("#ll-showing"),
  gradeRow: document.querySelector("#ll-grade-row"),
  roadmap: document.querySelector("#ll-roadmap"),
  dialArc: document.querySelector("#ll-dial-arc"),
  dialCount: document.querySelector("#ll-dial-count"),
  dialPct: document.querySelector("#ll-dial-pct"),
  notice: document.querySelector("#ll-notice"),
  q: document.querySelector("#ll-q"),
  grade: document.querySelector("#ll-grade"),
  phase: document.querySelector("#ll-phase"),
  status: document.querySelector("#ll-status"),
  sort: document.querySelector("#ll-sort"),
  missable: document.querySelector("#ll-missable"),
  spoilers: document.querySelector("#ll-spoilers"),
  importFile: document.querySelector("#ll-import"),
};

let trophies = [];
let phaseLabels = {};
const earned = loadEarned();
const revealed = new Set();

function loadEarned() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]");
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    return new Set((ids ?? []).map(Number));
  } catch {
    return new Set();
  }
}

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function minutesOf(timeText) {
  const m = /(\d+(?:\.\d+)?)\s*(h|min)/i.exec(timeText ?? "");
  if (!m) return Number.MAX_SAFE_INTEGER;
  return m[2].toLowerCase() === "h" ? Number(m[1]) * 60 : Number(m[1]);
}

function starRow(difficulty) {
  return "★".repeat(difficulty) + "☆".repeat(5 - difficulty);
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  ui.dialCount.textContent = `${done}/${total}`;
  const pct = total ? Math.round((done / total) * 100) : 0;
  ui.dialPct.textContent = `${pct}%`;
  ui.dialArc.style.strokeDashoffset = String(DIAL_CIRC * (1 - done / (total || 1)));

  ui.gradeRow.replaceChildren(
    ...["platinum", "gold", "silver", "bronze"].map((grade) => {
      const inGrade = trophies.filter((t) => t.grade === grade);
      const got = inGrade.filter((t) => earned.has(t.id)).length;
      const box = document.createElement("div");
      box.className = `grade-box g-${grade}`;
      box.innerHTML =
        `<h3>${grade[0].toUpperCase() + grade.slice(1)} <span>${got}/${inGrade.length}</span></h3>` +
        `<div class="bar"><i style="width:${inGrade.length ? (got / inGrade.length) * 100 : 0}%"></i></div>`;
      return box;
    }),
  );
}

function renderRoadmap() {
  const items = trophies.reduce((acc, t) => {
    acc[t.phase] = (acc[t.phase] ?? 0) + 1;
    return acc;
  }, {});
  ui.roadmap.replaceChildren(
    ...Object.keys(PHASE_BLURB).map((phase, i) => {
      const li = document.createElement("li");
      li.innerHTML =
        `<h3>Step ${i + 1} — ${phaseLabels[phase] ?? phase} ` +
        `<span class="tally">· ${items[phase] ?? 0} trophies</span></h3>` +
        `<p></p>`;
      li.querySelector("p").textContent = PHASE_BLURB[phase];
      return li;
    }),
  );
}

function currentFilter() {
  return {
    q: ui.q.value.trim().toLowerCase(),
    grade: ui.grade.value,
    phase: ui.phase.value,
    status: ui.status.value,
    sort: ui.sort.value,
    missableOnly: ui.missable.checked,
    hideSpoilers: ui.spoilers.checked,
  };
}

function visibleTrophies(f) {
  const list = trophies.filter((t) => {
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
  const by = {
    guide: (a, b) => a.id - b.id,
    grade: (a, b) => GRADE_RANK[a.grade] - GRADE_RANK[b.grade] || a.id - b.id,
    difficulty: (a, b) => a.difficulty - b.difficulty || a.id - b.id,
    time: (a, b) => minutesOf(a.time) - minutesOf(b.time) || a.id - b.id,
  }[f.sort];
  return list.sort(by);
}

function cardFor(t, hideSpoilers) {
  const article = document.createElement("article");
  article.className = "tcard" + (earned.has(t.id) ? " done" : "");
  const blurred = hideSpoilers && t.phase === "story" && !revealed.has(t.id);

  const head = document.createElement("header");
  const name = document.createElement("h3");
  name.textContent = t.name;
  const badge = document.createElement("span");
  badge.className = `badge ${t.grade}`;
  badge.textContent = t.grade;
  head.append(name, badge);

  const official = document.createElement("p");
  official.className = "official";
  official.textContent = t.description;

  const guide = document.createElement("p");
  guide.className = "guide" + (blurred ? " blurred" : "");
  guide.dataset.revealFor = String(t.id);
  if (blurred) {
    guide.title = "Story guide — click or press Enter to reveal";
    guide.tabIndex = 0;
    guide.setAttribute("role", "button");
    guide.setAttribute("aria-label", `Reveal the story guide for ${t.name}`);
  }
  guide.textContent = t.guide;

  const chips = document.createElement("ul");
  chips.className = "chips";
  for (const chip of [
    phaseLabels[t.phase] ?? t.phase,
    `Difficulty ${t.difficulty}/5`,
    t.time,
    t.missable ? "Missable" : "Not missable",
  ]) {
    const li = document.createElement("li");
    li.textContent = chip;
    chips.append(li);
  }

  const tip = document.createElement("p");
  tip.className = "tip";
  tip.innerHTML = "<strong>Tip.</strong> ";
  tip.append(document.createTextNode(t.tips));

  const basis = document.createElement("p");
  basis.className = "basis";
  basis.textContent = `Basis: ${t.source}`;

  const earnRow = document.createElement("div");
  earnRow.className = "earn-row";
  const label = document.createElement("label");
  const box = document.createElement("input");
  box.type = "checkbox";
  box.checked = earned.has(t.id);
  box.dataset.earnFor = String(t.id);
  const stars = document.createElement("span");
  stars.className = "stars";
  stars.textContent = starRow(t.difficulty);
  label.append(box, document.createTextNode("Mark earned "), stars);
  earnRow.append(label);

  article.append(head, official, guide, chips, tip, basis, earnRow);
  return article;
}

function render() {
  const f = currentFilter();
  const list = visibleTrophies(f);
  ui.cards.replaceChildren(...list.map((t) => cardFor(t, f.hideSpoilers)));
  ui.none.hidden = list.length !== 0;
  ui.showing.textContent = `Showing ${list.length} of ${trophies.length} trophies.`;
  renderProgress();
}

/* — events (delegated: cards are rebuilt on every render) — */

document.querySelector("#ll-toolbar").addEventListener("input", render);

ui.cards.addEventListener("change", (event) => {
  const box = event.target.closest("[data-earn-for]");
  if (!box) return;
  const id = Number(box.dataset.earnFor);
  if (box.checked) earned.add(id);
  else earned.delete(id);
  saveEarned();
  render();
});

ui.cards.addEventListener("click", (event) => {
  const guide = event.target.closest("[data-reveal-for]");
  if (guide?.classList.contains("blurred")) {
    revealed.add(Number(guide.dataset.revealFor));
    render();
  }
});

ui.cards.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const guide = event.target.closest("[data-reveal-for]");
  if (guide?.classList.contains("blurred")) {
    event.preventDefault();
    revealed.add(Number(guide.dataset.revealFor));
    render();
  }
});

ui.q.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    ui.q.value = "";
    render();
  }
});

document.querySelector("#ll-export").addEventListener("click", () => {
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
  ui.notice.textContent = "Progress exported — keep the file somewhere safe.";
});

document.querySelector("#ll-import-btn").addEventListener("click", () => ui.importFile.click());

ui.importFile.addEventListener("change", async () => {
  const file = ui.importFile.files?.[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const ids = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(ids)) throw new Error("no earned list");
    earned.clear();
    for (const id of ids) if (Number.isInteger(id)) earned.add(id);
    saveEarned();
    render();
    ui.notice.textContent = `Imported ${earned.size} earned trophies.`;
  } catch {
    ui.notice.textContent = "That file did not parse as a progress export.";
  }
  ui.importFile.value = "";
});

document.querySelector("#ll-reset").addEventListener("click", () => {
  if (!window.confirm("Clear every earned tick on this device?")) return;
  earned.clear();
  saveEarned();
  render();
  ui.notice.textContent = "Progress reset. Fresh run, clean slate.";
});

/* — boot — */

async function boot() {
  const res = await fetch("data/trophies.json");
  const data = await res.json();
  trophies = data.trophies;
  phaseLabels = {
    story: "Story",
    strangers: "Strangers & Freaks",
    activities: "Activities & Sports",
    exploration: "Exploration",
    combat: "Combat & Crime",
    partner: "Partner Play",
    grind: "The Long Grind",
    platinum: "Platinum Path",
  };
  for (const phase of data.phases) {
    const opt = document.createElement("option");
    opt.value = phase;
    opt.textContent = phaseLabels[phase] ?? phase;
    ui.phase.append(opt);
  }
  renderRoadmap();
  render();
}

boot().catch((err) => {
  ui.showing.textContent = `Could not load the trophy data (${err.message}).`;
});
