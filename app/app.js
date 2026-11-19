/* Leonida Legend — offline trophy guide & tracker.
   Loads data/trophies.json once, then never touches the network again.
   Progress lives in localStorage under one key and can be exported/imported as JSON. */
'use strict';

var STORAGE_KEY = 'leonida-legend-earned-v1';
var TOTAL = 55;
var RING_CIRC = 2 * Math.PI * 52;

var PHASE_LABELS = {
  story: 'Story',
  strangers: 'Strangers & Freaks',
  activities: 'Activities & Pastimes',
  exploration: 'Exploration',
  combat: 'Combat & Crime',
  partner: 'Partner',
  grind: 'The Long Grind',
  platinum: 'Platinum'
};

var ROADMAP = [
  { phase: 'story', title: 'Phase 1 — Play the Story',
    text: 'Run the campaign from Gone Fishing to the final mission. The story opens the whole map, pays the seed money for everything later, and banks 12 trophies on its own. Do not grind yet; just play.' },
  { phase: 'strangers', title: 'Phase 2 — The People of Leonida',
    text: 'Clear every stranger strand: Andy, Kenton, Billy, Randy, Tyrone and three more. Strands unlock in steps, so work them between other jobs and let in-game time pass when a marker goes quiet.' },
  { phase: 'activities', title: 'Phase 3 — Sample, Then Master',
    text: 'Try every activity once for Master of None, then master them: gold at the shooting range, a Top Fun win at every drone course, twenty different race wins, Cal beaten at fishing.' },
  { phase: 'exploration', title: 'Phase 4 — See All of Leonida',
    text: 'Lift the fog off the whole state, meditate at every spot, sample 100 vehicles and chase the gentle oddities — a cocktail on Ocean Beach and whatever the hell just happened in the swamps.' },
  { phase: 'combat', title: 'Phase 5 — Combat & Crime',
    text: 'The loud phase: bank vaults, armored trucks, gang operations, a quiet jewelry job, a Rhino, and five enemies inside one Combat Focus. Plan every escape before you start the job.' },
  { phase: 'partner', title: 'Phase 6 — Better Together',
    text: 'Three trophies need Lucia and Jason side by side: shed a four-star wanted level together, rob three shops in one unbroken run, and let the partnership itself pay out.' },
  { phase: 'grind', title: 'Phase 7 — The Long Grind & the Platinum',
    text: 'The counters only patience fills: 250 stunts, 3 card sets, 100 WAiNK spots, 50 challenges, $250,000 laundered, $100,000 spent, every garage bought. Finish the set, reach 100%, and the platinum is yours.' }
];

var state = {
  trophies: [],
  earned: new Set(),
  search: '',
  grade: 'all',
  phase: 'all',
  status: 'all',
  sort: 'guide',
  missableOnly: false,
  hideSpoilers: true,
  revealed: new Set()
};

function loadEarned() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    var parsed = JSON.parse(raw);
    var ids = Array.isArray(parsed) ? parsed : parsed.earned;
    return new Set((ids || []).map(Number));
  } catch (err) {
    return new Set();
  }
}

function saveEarned() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.earned)));
  } catch (err) { /* storage unavailable: the tracker still works for this session */ }
}

function el(tag, cls, text) {
  var node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  return node;
}

function stars(difficulty) {
  var wrap = el('span', 'stars');
  wrap.setAttribute('aria-label', 'Difficulty ' + difficulty + ' of 5');
  for (var i = 1; i <= 5; i++) {
    var s = el('span', i <= difficulty ? '' : 'off', '★');
    wrap.appendChild(s);
  }
  return wrap;
}

function timeRank(t) {
  var m = String(t.time).match(/(\d+)\s*hour/);
  if (m) return parseInt(m[1], 10) * 60;
  m = String(t.time).match(/(\d+)\s*min/);
  if (m) return parseInt(m[1], 10);
  if (/across the whole game/i.test(t.time)) return 6000;
  if (/cumulative/i.test(t.time)) return 5000;
  return 120;
}

var GRADE_RANK = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

function visibleTrophies() {
  var list = state.trophies.filter(function (t) {
    if (state.grade !== 'all' && t.grade !== state.grade) return false;
    if (state.phase !== 'all' && t.phase !== state.phase) return false;
    if (state.status === 'earned' && !state.earned.has(t.id)) return false;
    if (state.status === 'unearned' && state.earned.has(t.id)) return false;
    if (state.missableOnly && !t.missable) return false;
    if (state.search) {
      var hay = (t.name + ' ' + t.description + ' ' + t.guide + ' ' + t.tips).toLowerCase();
      if (hay.indexOf(state.search) === -1) return false;
    }
    return true;
  });
  if (state.sort === 'grade') {
    list.sort(function (a, b) { return GRADE_RANK[a.grade] - GRADE_RANK[b.grade] || a.id - b.id; });
  } else if (state.sort === 'difficulty') {
    list.sort(function (a, b) { return a.difficulty - b.difficulty || a.id - b.id; });
  } else if (state.sort === 'time') {
    list.sort(function (a, b) { return timeRank(a) - timeRank(b) || a.id - b.id; });
  } else {
    list.sort(function (a, b) { return a.id - b.id; });
  }
  return list;
}

function renderRing() {
  var n = state.earned.size;
  var pct = Math.round((n / TOTAL) * 100);
  document.getElementById('ring-count').textContent = n + '/' + TOTAL;
  document.getElementById('ring-pct').textContent = pct + '%';
  document.getElementById('ring-fill').style.strokeDashoffset = String(RING_CIRC * (1 - n / TOTAL));
}

function renderGrades() {
  var host = document.getElementById('grade-cards');
  host.textContent = '';
  [['platinum', 'Platinum', 1], ['gold', 'Gold', 2], ['silver', 'Silver', 6], ['bronze', 'Bronze', 46]].forEach(function (row) {
    var grade = row[0], label = row[1], total = row[2];
    var got = state.trophies.filter(function (t) { return t.grade === grade && state.earned.has(t.id); }).length;
    var card = el('div', 'grade-card');
    var h = el('h3');
    h.appendChild(el('span', 'dot ' + grade));
    h.appendChild(document.createTextNode(label));
    card.appendChild(h);
    card.appendChild(el('p', 'g-count', got + ' / ' + total + ' earned'));
    var bar = el('div', 'bar');
    var fill = el('span', 'fill-' + grade);
    fill.style.width = (total ? (got / total) * 100 : 0) + '%';
    bar.appendChild(fill);
    card.appendChild(bar);
    card.title = 'Show only ' + label + ' trophies';
    card.addEventListener('click', function () {
      state.grade = state.grade === grade ? 'all' : grade;
      document.getElementById('f-grade').value = state.grade;
      renderGrid();
      document.getElementById('controls-h').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    host.appendChild(card);
  });
}

function renderRoadmap() {
  var host = document.getElementById('roadmap');
  host.textContent = '';
  ROADMAP.forEach(function (step, i) {
    var inPhase = function (t) {
      if (step.phase === 'grind') return t.phase === 'grind' || t.phase === 'platinum';
      return t.phase === step.phase;
    };
    var count = state.trophies.filter(inPhase).length;
    var done = state.trophies.filter(function (t) { return inPhase(t) && state.earned.has(t.id); }).length;
    var li = el('li');
    var head = el('div', 'phase-head');
    head.appendChild(el('span', 'phase-num', String(i + 1)));
    head.appendChild(el('h3', null, step.title));
    head.appendChild(el('span', 'phase-count', count + ' trophies · ' + done + ' earned'));
    li.appendChild(head);
    li.appendChild(el('p', null, step.text));
    host.appendChild(li);
  });
}

function renderGrid() {
  var host = document.getElementById('grid');
  host.textContent = '';
  var list = visibleTrophies();
  document.getElementById('result-count').textContent =
    'Showing ' + list.length + ' of ' + state.trophies.length + ' trophies.';
  document.getElementById('empty-note').hidden = list.length !== 0;

  list.forEach(function (t) {
    var card = el('article', 'card');
    if (state.earned.has(t.id)) card.classList.add('earned');
    var isSpoiler = state.hideSpoilers && t.phase === 'story' && !state.revealed.has(t.id);
    if (isSpoiler) card.classList.add('spoiler');

    var top = el('div', 'card-top');
    top.appendChild(el('h3', null, t.name));
    top.appendChild(el('span', 'badge ' + t.grade, t.grade));
    card.appendChild(top);

    card.appendChild(el('p', 'desc', '“' + t.description + '”'));

    var guide = el('p', 'guide', t.guide);
    if (isSpoiler) {
      guide.title = 'Click to reveal this story guide';
      guide.tabIndex = 0;
      guide.setAttribute('role', 'button');
      guide.setAttribute('aria-label', 'Story guide hidden. Activate to reveal the guide for ' + t.name + '.');
      var reveal = function () {
        state.revealed.add(t.id);
        renderGrid();
      };
      guide.addEventListener('click', reveal);
      guide.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); reveal(); }
      });
    }
    card.appendChild(guide);
    if (isSpoiler) card.appendChild(el('p', 'spoiler-hint', 'Story guide hidden — click the blurred text to reveal it.'));

    var chips = el('div', 'chips');
    var phaseChip = el('span', 'chip');
    phaseChip.appendChild(el('b', null, 'Phase: '));
    phaseChip.appendChild(document.createTextNode(PHASE_LABELS[t.phase] || t.phase));
    chips.appendChild(phaseChip);
    var diffChip = el('span', 'chip');
    diffChip.appendChild(el('b', null, 'Difficulty: '));
    diffChip.appendChild(stars(t.difficulty));
    chips.appendChild(diffChip);
    var timeChip = el('span', 'chip');
    timeChip.appendChild(el('b', null, 'Time: '));
    timeChip.appendChild(document.createTextNode(t.time));
    chips.appendChild(timeChip);
    if (t.missable) chips.appendChild(el('span', 'chip', 'Missable'));
    card.appendChild(chips);

    var tip = el('p', 'tip');
    tip.appendChild(el('b', null, 'Tip: '));
    tip.appendChild(document.createTextNode(t.tips));
    card.appendChild(tip);

    var basis = el('p', 'basis');
    basis.appendChild(el('b', null, 'Basis: '));
    basis.appendChild(document.createTextNode(t.source));
    card.appendChild(basis);

    var foot = el('div', 'card-foot');
    var label = el('label', 'earn');
    var box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(t.id);
    box.addEventListener('change', function () {
      if (box.checked) state.earned.add(t.id); else state.earned.delete(t.id);
      saveEarned();
      renderAll();
    });
    label.appendChild(box);
    label.appendChild(el('span', null, box.checked ? 'Earned' : 'Mark earned'));
    foot.appendChild(label);
    card.appendChild(foot);

    host.appendChild(card);
  });
}

function renderAll() {
  renderRing();
  renderGrades();
  renderRoadmap();
  renderGrid();
}

function exportProgress() {
  var payload = JSON.stringify({ app: 'leonida-legend', version: 1, earned: Array.from(state.earned).sort(function (a, b) { return a - b; }) }, null, 2);
  var blob = new Blob([payload], { type: 'application/json' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-legend-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  note('Exported ' + state.earned.size + ' earned trophies.');
}

function importProgress(file) {
  var reader = new FileReader();
  reader.onload = function () {
    try {
      var parsed = JSON.parse(String(reader.result));
      var ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('no earned list');
      var valid = new Set(state.trophies.map(function (t) { return t.id; }));
      state.earned = new Set(ids.map(Number).filter(function (id) { return valid.has(id); }));
      saveEarned();
      renderAll();
      note('Imported progress: ' + state.earned.size + ' trophies earned.');
    } catch (err) {
      note('That file could not be read as Leonida Legend progress.');
    }
  };
  reader.readAsText(file);
}

function note(msg) {
  document.getElementById('import-note').textContent = msg;
}

function wire() {
  document.getElementById('btn-export').addEventListener('click', exportProgress);
  document.getElementById('btn-reset').addEventListener('click', function () {
    if (window.confirm('Reset all progress? Every earned tick will be cleared.')) {
      state.earned = new Set();
      saveEarned();
      renderAll();
      note('Progress reset.');
    }
  });
  document.getElementById('import-file').addEventListener('change', function (ev) {
    if (ev.target.files && ev.target.files[0]) importProgress(ev.target.files[0]);
    ev.target.value = '';
  });
  document.getElementById('f-search').addEventListener('input', function (ev) {
    state.search = ev.target.value.trim().toLowerCase();
    renderGrid();
  });
  document.getElementById('f-grade').addEventListener('change', function (ev) {
    state.grade = ev.target.value;
    renderGrid();
  });
  var phaseSel = document.getElementById('f-phase');
  Object.keys(PHASE_LABELS).forEach(function (key) {
    var opt = document.createElement('option');
    opt.value = key;
    opt.textContent = PHASE_LABELS[key];
    phaseSel.appendChild(opt);
  });
  phaseSel.addEventListener('change', function (ev) {
    state.phase = ev.target.value;
    renderGrid();
  });
  document.getElementById('f-status').addEventListener('change', function (ev) {
    state.status = ev.target.value;
    renderGrid();
  });
  document.getElementById('f-sort').addEventListener('change', function (ev) {
    state.sort = ev.target.value;
    renderGrid();
  });
  document.getElementById('f-missable').addEventListener('change', function (ev) {
    state.missableOnly = ev.target.checked;
    renderGrid();
  });
  document.getElementById('f-spoilers').addEventListener('change', function (ev) {
    state.hideSpoilers = ev.target.checked;
    if (state.hideSpoilers) state.revealed = new Set();
    renderGrid();
  });
}

fetch('data/trophies.json')
  .then(function (res) { return res.json(); })
  .then(function (data) {
    state.trophies = data.trophies;
    state.earned = loadEarned();
    wire();
    renderAll();
  })
  .catch(function () {
    document.getElementById('grid').appendChild(el('p', 'note', 'The trophy data could not be loaded. Serve this folder over HTTP or open it with file access allowed.'));
  });
