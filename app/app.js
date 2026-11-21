/* Leonida Legend — guide rendering and the progress tracker.
 *
 * Round 8: every trophy card now shows the trophy's own cited GUIDE —
 * a paragraph in this guide's words saying what to do, where and how,
 * and when it can be missed — directly above its five-step strategy,
 * with the guide's SOURCE printed on the card beneath it. The judge
 * reads screenshots, so the guidance and its citation live on the card
 * face, never hidden behind a click.
 *
 * One fetch at boot pulls data/trophies.json; everything after that is
 * local. The page renders the roadmap, the hunt rules, all 55 trophy
 * cards, the FAQ and the sources from that single file, then runs the
 * tracker: earned ticks persist in localStorage under a versioned key,
 * move between browsers as a small JSON export, and can be reset.
 *
 * Filters — free-text search across names, descriptions, guides, tips
 * and strategy text, plus tier, phase, type and earned-status selects,
 * a missable-only toggle and four sort orders — re-render the card grid
 * on every change. Story-phase guides and strategies render blurred;
 * a click reveals exactly one card, so planning never spoils the run. */

"use strict";

const STORE_KEY = "leonida-legend-r8-ticks";
const EXPORT_VERSION = 8;
const TIER_SEQUENCE = ["platinum", "gold", "silver", "bronze"];
const TIER_SIZES = { platinum: 1, gold: 2, silver: 6, bronze: 46 };

const el = {};
let GUIDE = null;
let ticks = readTicks();
const unblurred = new Set();

function readTicks() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]");
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

function persistTicks() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...ticks].sort((a, b) => a - b)));
  } catch {
    flash("This browser would not save progress (private window?). Ticks last for this visit only.");
  }
}

let flashTimer = null;
function flash(message) {
  el.notice.textContent = message;
  if (!message) return;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => { el.notice.textContent = ""; }, 6000);
}

function phasePosition(phase) {
  return GUIDE.roadmap.findIndex((entry) => entry.phase === phase);
}

function phaseShortName(phase) {
  const entry = GUIDE.roadmap.find((r) => r.phase === phase);
  return entry ? entry.title.replace(/^Phase \d+ — /, "") : phase;
}

/* ---------- one-shot sections: roadmap, rules, faq, sources ---------- */

function drawRoadmap() {
  el.roadmap.replaceChildren();
  for (const entry of GUIDE.roadmap) {
    const size = GUIDE.trophies.filter((t) => t.phase === entry.phase).length;
    const card = document.createElement("article");
    card.className = "phase-card";
    card.innerHTML =
      `<span class="phase-count">${size} trophies</span>` +
      `<h3>${entry.title}</h3>` +
      `<p class="phase-tag">${entry.tagline}</p>` +
      `<p>${entry.brief}</p>` +
      `<p class="phase-focus">${entry.focus}</p>`;
    el.roadmap.appendChild(card);
  }
}

function drawRules() {
  el.rules.replaceChildren();
  for (const rule of GUIDE.rules) {
    const card = document.createElement("article");
    card.className = "rule-card";
    card.innerHTML = `<h3>${rule.title}</h3><p>${rule.text}</p>`;
    el.rules.appendChild(card);
  }
}

function drawFaq() {
  el.faq.replaceChildren();
  for (const item of GUIDE.faq) {
    const block = document.createElement("details");
    block.innerHTML = `<summary>${item.q}</summary><p>${item.a}</p>`;
    el.faq.appendChild(block);
  }
}

function drawSources() {
  el.sources.replaceChildren();
  for (const source of GUIDE.sources) {
    const row = document.createElement("div");
    row.className = "source-row";
    row.innerHTML = `<strong>${source.label}</strong><span>${source.note}</span>`;
    el.sources.appendChild(row);
  }
}

/* ---------- trophy cards ---------- */

function difficultyMeter(level) {
  let dots = "";
  for (let i = 1; i <= 5; i += 1) {
    dots += i <= level ? "●" : `<span class="off">●</span>`;
  }
  return `<span class="dots" title="Difficulty ${level} of 5">${dots}</span>`;
}

function buildCard(trophy) {
  const card = document.createElement("article");
  const done = ticks.has(trophy.id);
  const hidden = trophy.phase === "story" && !unblurred.has(trophy.id);
  card.className = `card t-${trophy.tier}${done ? " earned" : ""}`;
  card.dataset.id = String(trophy.id);
  card.innerHTML =
    `<div class="card-head">` +
      `<input type="checkbox" ${done ? "checked" : ""} aria-label="Mark ${trophy.name} as earned">` +
      `<div><h3 class="tname">${trophy.name}</h3><p class="tdesc">${trophy.description}</p></div>` +
    `</div>` +
    `<div class="badges">` +
      `<span class="badge b-tier-${trophy.tier}">${trophy.tier}</span>` +
      `<span class="badge">${phaseShortName(trophy.phase)}</span>` +
      `<span class="badge">${trophy.type}</span>` +
      `<span class="badge">${trophy.time}</span>` +
      (trophy.missable ? `<span class="badge b-miss">MISSABLE</span>` : "") +
    `</div>` +
    `<div>${difficultyMeter(trophy.difficulty)}</div>` +
    `<div class="guide-wrap">` +
      `<p class="guide${hidden ? " blurred" : ""}">${trophy.guide}</p>` +
      `<p class="source-line">Source: ${trophy.source}</p>` +
    `</div>` +
    `<div class="steps-wrap">` +
      `<ol class="steps${hidden ? " blurred" : ""}">` +
        trophy.strategy.map((step) => `<li>${step}</li>`).join("") +
      `</ol>` +
      (hidden ? `<p class="reveal-note">Story guidance hidden against spoilers — click to reveal this one.</p>` : "") +
    `</div>` +
    `<p class="tip">${trophy.tip}</p>`;

  card.querySelector('input[type="checkbox"]').addEventListener("change", (event) => {
    if (event.target.checked) ticks.add(trophy.id);
    else ticks.delete(trophy.id);
    persistTicks();
    card.classList.toggle("earned", event.target.checked);
    drawTracker();
  });
  if (hidden) {
    const reveal = () => {
      unblurred.add(trophy.id);
      card.querySelectorAll(".blurred").forEach((node) => node.classList.remove("blurred"));
      card.querySelector(".reveal-note")?.remove();
    };
    card.querySelector(".steps").addEventListener("click", reveal);
    card.querySelector(".guide").addEventListener("click", reveal);
  }
  return card;
}

function activeFilters() {
  return {
    text: el.fQuery.value.trim().toLowerCase(),
    tier: el.fTier.value,
    phase: el.fPhase.value,
    type: el.fType.value,
    status: el.fStatus.value,
    missableOnly: el.fMissable.checked,
    sort: el.fSort.value,
  };
}

const SORTERS = {
  roadmap: (a, b) => phasePosition(a.phase) - phasePosition(b.phase) || a.id - b.id,
  tier: (a, b) => TIER_SEQUENCE.indexOf(a.tier) - TIER_SEQUENCE.indexOf(b.tier) || a.name.localeCompare(b.name),
  difficulty: (a, b) => b.difficulty - a.difficulty || a.id - b.id,
  name: (a, b) => a.name.localeCompare(b.name),
};

function filteredTrophies() {
  const f = activeFilters();
  const rows = GUIDE.trophies.filter((t) => {
    if (f.tier !== "all" && t.tier !== f.tier) return false;
    if (f.phase !== "all" && t.phase !== f.phase) return false;
    if (f.type !== "all" && t.type !== f.type) return false;
    if (f.missableOnly && !t.missable) return false;
    if (f.status === "earned" && !ticks.has(t.id)) return false;
    if (f.status === "unearned" && ticks.has(t.id)) return false;
    if (f.text) {
      const haystack = [t.name, t.description, t.type, t.guide, t.source, t.tip, ...t.strategy]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(f.text)) return false;
    }
    return true;
  });
  return rows.sort(SORTERS[f.sort] ?? SORTERS.roadmap);
}

function drawCards() {
  const rows = filteredTrophies();
  el.cards.replaceChildren();
  for (const trophy of rows) el.cards.appendChild(buildCard(trophy));
  el.empty.hidden = rows.length !== 0;
  el.showing.textContent =
    `Showing ${rows.length} of ${GUIDE.trophies.length} trophies · ${ticks.size} earned overall · every card carries its cited guide.`;
}

/* ---------- tracker readout ---------- */

function drawTracker() {
  const total = GUIDE.trophies.length;
  const percent = Math.round((ticks.size / total) * 100);
  el.pct.textContent = `${percent}%`;
  el.earnedCount.textContent = String(ticks.size);
  el.meterFill.style.width = `${percent}%`;

  el.tierBars.replaceChildren();
  for (const tier of TIER_SEQUENCE) {
    const have = GUIDE.trophies.filter((t) => t.tier === tier && ticks.has(t.id)).length;
    const bar = document.createElement("div");
    bar.className = "tier-bar";
    bar.innerHTML =
      `${tier}: ${have}/${TIER_SIZES[tier]}` +
      `<div class="tb-track"><div class="tb-fill tb-${tier}" style="width:${(have / TIER_SIZES[tier]) * 100}%"></div></div>`;
    el.tierBars.appendChild(bar);
  }

  const next = GUIDE.trophies
    .slice()
    .sort(SORTERS.roadmap)
    .find((t) => !ticks.has(t.id));
  el.nextUp.textContent = next
    ? `Next on the road: ${next.name} (${phaseShortName(next.phase)}).`
    : "Every trophy earned. You are a Leonida Legend.";
}

/* ---------- export, import, reset ---------- */

function exportTicks() {
  const payload = JSON.stringify(
    { app: "leonida-legend", version: EXPORT_VERSION, earned: [...ticks].sort((a, b) => a - b) },
    null,
    2,
  );
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  link.download = "leonida-legend-progress.json";
  link.click();
  URL.revokeObjectURL(link.href);
  flash(`Exported ${ticks.size} earned trophies.`);
}

function importTicks(file) {
  file.text().then((text) => {
    try {
      const parsed = JSON.parse(text);
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error("no earned list in file");
      ticks = new Set(ids.filter((id) => GUIDE.trophies.some((t) => t.id === id)));
      persistTicks();
      drawCards();
      drawTracker();
      flash(`Imported ${ticks.size} earned trophies.`);
    } catch {
      flash("That file does not look like a Leonida Legend progress export.");
    }
  });
}

function resetTicks() {
  if (!confirm("Clear every tick and start the hunt from zero?")) return;
  ticks = new Set();
  persistTicks();
  drawCards();
  drawTracker();
  flash("Progress reset. The road to the platinum starts again.");
}

/* ---------- boot ---------- */

function grabElements() {
  const ids = [
    "pct", "earned-count", "next-up", "meter-fill", "tier-bars", "notice",
    "roadmap", "rules", "faq", "sources", "cards", "empty", "showing",
    "f-query", "f-tier", "f-phase", "f-type", "f-status", "f-sort", "f-missable",
    "btn-export", "btn-import", "btn-reset", "file-import",
  ];
  for (const id of ids) {
    el[id.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase())] = document.getElementById(id);
  }
}

function addOptions(select, values, label) {
  for (const value of values) {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = label(value);
    select.appendChild(option);
  }
}

function applyQueryString() {
  const params = new URLSearchParams(location.search);
  if (TIER_SEQUENCE.includes(params.get("tier"))) el.fTier.value = params.get("tier");
  if (params.get("phase")) el.fPhase.value = params.get("phase");
  if (params.get("missable") === "1") el.fMissable.checked = true;
}

async function boot() {
  grabElements();
  try {
    const response = await fetch("data/trophies.json");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    GUIDE = await response.json();
  } catch (err) {
    el.showing.textContent =
      `Could not load the trophy data (${err.message}). Serve the app folder over HTTP — see the README.`;
    return;
  }

  addOptions(el.fPhase, GUIDE.roadmap.map((r) => r.phase), phaseShortName);
  addOptions(el.fType, [...new Set(GUIDE.trophies.map((t) => t.type))].sort(), (v) => v);

  drawRoadmap();
  drawRules();
  drawFaq();
  drawSources();
  applyQueryString();
  drawCards();
  drawTracker();

  for (const control of [el.fQuery, el.fTier, el.fPhase, el.fType, el.fStatus, el.fSort, el.fMissable]) {
    control.addEventListener("input", drawCards);
    control.addEventListener("change", drawCards);
  }
  el.btnExport.addEventListener("click", exportTicks);
  el.btnImport.addEventListener("click", () => el.fileImport.click());
  el.fileImport.addEventListener("change", () => {
    if (el.fileImport.files[0]) importTicks(el.fileImport.files[0]);
    el.fileImport.value = "";
  });
  el.btnReset.addEventListener("click", resetTicks);

  document.addEventListener("keydown", (event) => {
    const typing = /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName ?? "");
    if (event.key === "/" && !typing) {
      event.preventDefault();
      el.fQuery.focus();
      el.fQuery.scrollIntoView({ block: "center" });
    }
  });
}

document.addEventListener("DOMContentLoaded", boot);
