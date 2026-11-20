/* Leonida Legend — guide and tracker behaviour.
 *
 * Loads data/trophies.json once, renders the roadmap, rules, trophy cards,
 * FAQ and sources from it, and then runs entirely offline. Earned ticks are
 * kept in localStorage under a versioned key and can be exported to and
 * imported from a small JSON file. Filters (search, tier, phase, type,
 * status, missable-only) and four sort orders are applied client-side on
 * every control change. Story-phase strategies start blurred against
 * spoilers; clicking one reveals only that card's guide. */

"use strict";

const STORE_KEY = "leonida-legend-r6-ticks";
const TIER_ORDER = ["platinum", "gold", "silver", "bronze"];
const TIER_TOTALS = { platinum: 1, gold: 2, silver: 6, bronze: 46 };

const els = {};
let DATA = null;
let earned = loadTicks();
const revealed = new Set();

function loadTicks() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(ids) ? ids.filter(Number.isInteger) : []);
  } catch {
    return new Set();
  }
}

function saveTicks() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch {
    note("This browser refused to save progress (private window?). Ticks will last for this visit only.");
  }
}

function note(msg) {
  els.notice.textContent = msg;
  if (msg) setTimeout(() => { if (els.notice.textContent === msg) els.notice.textContent = ""; }, 6000);
}

function phaseIndex(phase) {
  return DATA.roadmap.findIndex((r) => r.phase === phase);
}

function phaseTitle(phase) {
  const entry = DATA.roadmap.find((r) => r.phase === phase);
  return entry ? entry.title.replace(/^Phase \d+ — /, "") : phase;
}

/* ---------------- rendering: static sections ---------------- */

function renderRoadmap() {
  els.roadmap.innerHTML = "";
  for (const entry of DATA.roadmap) {
    const count = DATA.trophies.filter((t) => t.phase === entry.phase).length;
    const card = document.createElement("article");
    card.className = "phase-card";
    card.innerHTML = `
      <span class="phase-count">${count} trophies</span>
      <h3>${entry.title}</h3>
      <p class="phase-tag">${entry.tagline}</p>
      <p>${entry.brief}</p>
      <p class="phase-focus">${entry.focus}</p>`;
    els.roadmap.appendChild(card);
  }
}

function renderRules() {
  els.rules.innerHTML = "";
  for (const rule of DATA.rules) {
    const card = document.createElement("article");
    card.className = "rule-card";
    card.innerHTML = `<h3>${rule.title}</h3><p>${rule.text}</p>`;
    els.rules.appendChild(card);
  }
}

function renderFaq() {
  els.faq.innerHTML = "";
  for (const item of DATA.faq) {
    const d = document.createElement("details");
    d.innerHTML = `<summary>${item.q}</summary><p>${item.a}</p>`;
    els.faq.appendChild(d);
  }
}

function renderSources() {
  els.sources.innerHTML = "";
  for (const s of DATA.sources) {
    const row = document.createElement("div");
    row.className = "source-row";
    row.innerHTML = `<strong>${s.label}</strong><span>${s.note}</span>`;
    els.sources.appendChild(row);
  }
}

/* ---------------- rendering: trophy cards ---------------- */

function difficultyDots(level) {
  let out = "";
  for (let i = 1; i <= 5; i += 1) out += i <= level ? "●" : '<span class="off">●</span>';
  return `<span class="dots" title="Difficulty ${level} of 5">${out}</span>`;
}

function cardFor(t) {
  const card = document.createElement("article");
  card.className = `card t-${t.tier}${earned.has(t.id) ? " earned" : ""}`;
  card.dataset.id = String(t.id);

  const blur = t.phase === "story" && !revealed.has(t.id);
  const steps = t.strategy.map((s) => `<li>${s}</li>`).join("");
  card.innerHTML = `
    <div class="card-head">
      <input type="checkbox" ${earned.has(t.id) ? "checked" : ""}
             aria-label="Mark ${t.name} as earned">
      <div>
        <h3 class="tname">${t.name}</h3>
        <p class="tdesc">${t.description}</p>
      </div>
    </div>
    <div class="badges">
      <span class="badge b-tier-${t.tier}">${t.tier}</span>
      <span class="badge">${phaseTitle(t.phase)}</span>
      <span class="badge">${t.type}</span>
      <span class="badge">${t.time}</span>
      ${t.missable ? '<span class="badge b-miss">MISSABLE</span>' : ""}
    </div>
    <div>${difficultyDots(t.difficulty)}</div>
    <div class="steps-wrap">
      <ol class="steps${blur ? " blurred" : ""}">${steps}</ol>
      ${blur ? '<p class="reveal-note">Story strategy hidden — click to reveal.</p>' : ""}
    </div>
    <p class="tip">${t.tip}</p>`;

  card.querySelector('input[type="checkbox"]').addEventListener("change", (ev) => {
    if (ev.target.checked) earned.add(t.id); else earned.delete(t.id);
    saveTicks();
    card.classList.toggle("earned", ev.target.checked);
    renderTracker();
  });
  const stepsEl = card.querySelector(".steps");
  if (blur) {
    stepsEl.addEventListener("click", () => {
      revealed.add(t.id);
      stepsEl.classList.remove("blurred");
      card.querySelector(".reveal-note")?.remove();
    });
  }
  return card;
}

function currentFilters() {
  return {
    q: els.fQuery.value.trim().toLowerCase(),
    tier: els.fTier.value,
    phase: els.fPhase.value,
    type: els.fType.value,
    status: els.fStatus.value,
    missable: els.fMissable.checked,
    sort: els.fSort.value,
  };
}

function visibleTrophies() {
  const f = currentFilters();
  let rows = DATA.trophies.filter((t) => {
    if (f.tier !== "all" && t.tier !== f.tier) return false;
    if (f.phase !== "all" && t.phase !== f.phase) return false;
    if (f.type !== "all" && t.type !== f.type) return false;
    if (f.missable && !t.missable) return false;
    if (f.status === "earned" && !earned.has(t.id)) return false;
    if (f.status === "unearned" && earned.has(t.id)) return false;
    if (f.q) {
      const hay = [t.name, t.description, t.type, t.tip, ...t.strategy].join(" ").toLowerCase();
      if (!hay.includes(f.q)) return false;
    }
    return true;
  });
  const by = {
    roadmap: (a, b) => phaseIndex(a.phase) - phaseIndex(b.phase) || a.id - b.id,
    tier: (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || a.name.localeCompare(b.name),
    difficulty: (a, b) => b.difficulty - a.difficulty || a.id - b.id,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  return rows.sort(by[f.sort] ?? by.roadmap);
}

function renderCards() {
  const rows = visibleTrophies();
  els.cards.innerHTML = "";
  for (const t of rows) els.cards.appendChild(cardFor(t));
  els.empty.hidden = rows.length > 0;
  els.showing.textContent = `Showing ${rows.length} of ${DATA.trophies.length} trophies · ${earned.size} earned overall.`;
}

/* ---------------- tracker ---------------- */

function renderTracker() {
  const total = DATA.trophies.length;
  const pct = Math.round((earned.size / total) * 100);
  els.pct.textContent = `${pct}%`;
  els.earnedCount.textContent = String(earned.size);
  els.meterFill.style.width = `${pct}%`;

  els.tierBars.innerHTML = "";
  for (const tier of TIER_ORDER) {
    const have = DATA.trophies.filter((t) => t.tier === tier && earned.has(t.id)).length;
    const wrap = document.createElement("div");
    wrap.className = "tier-bar";
    wrap.innerHTML = `${tier}: ${have}/${TIER_TOTALS[tier]}
      <div class="tb-track"><div class="tb-fill tb-${tier}" style="width:${(have / TIER_TOTALS[tier]) * 100}%"></div></div>`;
    els.tierBars.appendChild(wrap);
  }

  const next = DATA.trophies
    .slice()
    .sort((a, b) => phaseIndex(a.phase) - phaseIndex(b.phase) || a.id - b.id)
    .find((t) => !earned.has(t.id));
  els.nextUp.textContent = next
    ? `Next on the road: ${next.name} (${phaseTitle(next.phase)}).`
    : "Every trophy earned. You're a Leonida Legend.";
}

/* ---------------- export / import / reset ---------------- */

function exportTicks() {
  const payload = JSON.stringify(
    { app: "leonida-legend", version: 6, earned: [...earned].sort((a, b) => a - b) },
    null, 2,
  );
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "leonida-legend-progress.json";
  a.click();
  URL.revokeObjectURL(url);
  note(`Exported ${earned.size} earned trophies.`);
}

function importTicks(file) {
  file.text().then((text) => {
    try {
      const parsed = JSON.parse(text);
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error("no earned list");
      earned = new Set(ids.filter((id) => DATA.trophies.some((t) => t.id === id)));
      saveTicks();
      renderCards();
      renderTracker();
      note(`Imported ${earned.size} earned trophies.`);
    } catch {
      note("That file doesn't look like a Leonida Legend progress export.");
    }
  });
}

/* ---------------- wiring ---------------- */

function fillSelect(select, values, labelOf) {
  for (const v of values) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = labelOf(v);
    select.appendChild(opt);
  }
}

function applyUrlParams() {
  const p = new URLSearchParams(location.search);
  if (p.get("tier") && TIER_ORDER.includes(p.get("tier"))) els.fTier.value = p.get("tier");
  if (p.get("phase")) els.fPhase.value = p.get("phase");
  if (p.get("missable") === "1") els.fMissable.checked = true;
}

async function boot() {
  for (const id of ["pct", "earned-count", "next-up", "meter-fill", "tier-bars", "notice",
    "roadmap", "rules", "faq", "sources", "cards", "empty", "showing",
    "f-query", "f-tier", "f-phase", "f-type", "f-status", "f-sort", "f-missable",
    "btn-export", "btn-import", "btn-reset", "file-import"]) {
    els[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = document.getElementById(id);
  }
  try {
    const res = await fetch("data/trophies.json");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();
  } catch (err) {
    els.showing.textContent = `Could not load the trophy data (${err.message}). Serve the app folder over HTTP — see the README.`;
    return;
  }

  fillSelect(els.fPhase, DATA.roadmap.map((r) => r.phase), phaseTitle);
  fillSelect(els.fType, [...new Set(DATA.trophies.map((t) => t.type))].sort(), (v) => v);

  renderRoadmap();
  renderRules();
  renderFaq();
  renderSources();
  applyUrlParams();
  renderCards();
  renderTracker();

  for (const el of [els.fQuery, els.fTier, els.fPhase, els.fType, els.fStatus, els.fSort, els.fMissable]) {
    el.addEventListener("input", renderCards);
    el.addEventListener("change", renderCards);
  }
  els.btnExport.addEventListener("click", exportTicks);
  els.btnImport.addEventListener("click", () => els.fileImport.click());
  els.fileImport.addEventListener("change", () => {
    if (els.fileImport.files[0]) importTicks(els.fileImport.files[0]);
    els.fileImport.value = "";
  });
  els.btnReset.addEventListener("click", () => {
    if (!confirm("Clear every tick and start the hunt from zero?")) return;
    earned = new Set();
    saveTicks();
    renderCards();
    renderTracker();
    note("Progress reset. The road to the platinum starts again.");
  });
}

document.addEventListener("DOMContentLoaded", boot);
