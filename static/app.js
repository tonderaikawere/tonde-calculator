const degToggle = document.getElementById('degToggle');
const degLabel = document.getElementById('degLabel');

const exprInput = document.getElementById('expr');
const exprLine = document.getElementById('exprLine');
const ansLine = document.getElementById('ansLine');

const exprStd = document.getElementById('exprStd');
const exprLineStd = document.getElementById('exprLineStd');
const ansLineStd = document.getElementById('ansLineStd');

const historyEl = document.getElementById('history');
const historyPageEl = document.getElementById('historyPage');
const clearHistoryBtn = document.getElementById('clearHistory');

const fx = document.getElementById('fx');
const xmin = document.getElementById('xmin');
const xmax = document.getElementById('xmax');
const plotBtn = document.getElementById('plot');
const graphCanvas = document.getElementById('graph');

const dec = document.getElementById('dec');
const bin = document.getElementById('bin');
const oct = document.getElementById('oct');
const hex = document.getElementById('hex');

const celsius = document.getElementById('celsius');
const fahrenheit = document.getElementById('fahrenheit');
const meters = document.getElementById('meters');
const feet = document.getElementById('feet');

let lastAnswer = '';
let history = [];

let activePage = 'scientific';

function setDegLabel() {
  degLabel.textContent = degToggle.checked ? 'DEG' : 'RAD';
}
setDegLabel();
degToggle.addEventListener('change', setDegLabel);

function renderHistory() {
  const targets = [historyEl, historyPageEl].filter(Boolean);
  for (const t of targets) t.innerHTML = '';

  if (history.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'history-empty';
    empty.textContent = 'No calculations yet';
    for (const t of targets) t.appendChild(empty.cloneNode(true));
    return;
  }

  for (const item of history.slice(0, 10)) {
    for (const t of targets) {
      const wrap = document.createElement('div');
      wrap.className = 'history-item';
      wrap.tabIndex = 0;

      const e = document.createElement('div');
      e.className = 'h-expr';
      e.textContent = item.expr;

      const o = document.createElement('div');
      o.className = 'h-out';
      o.textContent = item.out;

      wrap.appendChild(e);
      wrap.appendChild(o);

      wrap.addEventListener('click', () => {
        if (activePage === 'standard') {
          exprStd.value = item.expr;
          syncExprLineStd();
          ansLineStd.textContent = item.out;
        } else {
          exprInput.value = item.expr;
          syncExprLine();
          ansLine.textContent = item.out;
        }
        lastAnswer = item.out;
      });

      wrap.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          wrap.click();
        }
      });

      t.appendChild(wrap);
    }
  }
}

async function evaluateExprStd() {
  const expr = exprStd.value.trim();
  if (!expr) return;

  try {
    const resp = await fetch('/api/eval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expr, deg: degToggle.checked }),
    });

    const data = await resp.json();

    if (!resp.ok || !data.ok) {
      const msg = data?.error || 'Invalid expression';
      ansLineStd.textContent = `Error: ${msg}`;
      return;
    }

    ansLineStd.textContent = data.result;
    lastAnswer = data.result;
    history.unshift({ expr, out: data.result });
    renderHistory();
  } catch (e) {
    ansLineStd.textContent = 'Error: Could not evaluate';
  }
}

function syncExprLine() {
  exprLine.textContent = exprInput.value || ' ';
}

function syncExprLineStd() {
  exprLineStd.textContent = exprStd.value || ' ';
}

exprInput.addEventListener('input', () => {
  syncExprLine();
});

exprStd.addEventListener('input', () => {
  syncExprLineStd();
});

function insertAtCursor(text) {
  const start = exprInput.selectionStart ?? exprInput.value.length;
  const end = exprInput.selectionEnd ?? exprInput.value.length;
  const v = exprInput.value;
  exprInput.value = v.slice(0, start) + text + v.slice(end);
  const caret = start + text.length;
  exprInput.setSelectionRange(caret, caret);
  exprInput.focus();
  syncExprLine();
}

function insertAtCursorStd(text) {
  const start = exprStd.selectionStart ?? exprStd.value.length;
  const end = exprStd.selectionEnd ?? exprStd.value.length;
  const v = exprStd.value;
  exprStd.value = v.slice(0, start) + text + v.slice(end);
  const caret = start + text.length;
  exprStd.setSelectionRange(caret, caret);
  exprStd.focus();
  syncExprLineStd();
}

function backspace() {
  const start = exprInput.selectionStart ?? exprInput.value.length;
  const end = exprInput.selectionEnd ?? exprInput.value.length;

  if (start !== end) {
    const v = exprInput.value;
    exprInput.value = v.slice(0, start) + v.slice(end);
    exprInput.setSelectionRange(start, start);
    exprInput.focus();
    syncExprLine();
    return;
  }

  if (start === 0) return;

  const v = exprInput.value;
  exprInput.value = v.slice(0, start - 1) + v.slice(end);
  exprInput.setSelectionRange(start - 1, start - 1);
  exprInput.focus();
  syncExprLine();
}

function backspaceStd() {
  const start = exprStd.selectionStart ?? exprStd.value.length;
  const end = exprStd.selectionEnd ?? exprStd.value.length;

  if (start !== end) {
    const v = exprStd.value;
    exprStd.value = v.slice(0, start) + v.slice(end);
    exprStd.setSelectionRange(start, start);
    exprStd.focus();
    syncExprLineStd();
    return;
  }

  if (start === 0) return;

  const v = exprStd.value;
  exprStd.value = v.slice(0, start - 1) + v.slice(end);
  exprStd.setSelectionRange(start - 1, start - 1);
  exprStd.focus();
  syncExprLineStd();
}

function clearAll() {
  exprInput.value = '';
  syncExprLine();
  ansLine.textContent = '0';
}

function clearAllStd() {
  exprStd.value = '';
  syncExprLineStd();
  ansLineStd.textContent = '0';
}

async function evaluateExpr() {
  const expr = exprInput.value.trim();
  if (!expr) return;

  try {
    const resp = await fetch('/api/eval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expr, deg: degToggle.checked }),
    });

    const data = await resp.json();

    if (!resp.ok || !data.ok) {
      const msg = data?.error || 'Invalid expression';
      ansLine.textContent = `Error: ${msg}`;
      return;
    }

    ansLine.textContent = data.result;
    lastAnswer = data.result;
    history.unshift({ expr, out: data.result });
    renderHistory();
  } catch (e) {
    ansLine.textContent = 'Error: Could not evaluate';
  }
}

document.querySelectorAll('.key').forEach((btn) => {
  btn.addEventListener('click', () => {
    const insert = btn.getAttribute('data-insert');
    const action = btn.getAttribute('data-action');

    if (insert) {
      insertAtCursor(insert);
      return;
    }

    if (action === 'clear') {
      clearAll();
      return;
    }

    if (action === 'back') {
      backspace();
      return;
    }

    if (action === 'eval') {
      evaluateExpr();
      return;
    }

    if (action === 'ans') {
      if (lastAnswer && !String(lastAnswer).startsWith('Error')) {
        insertAtCursor(String(lastAnswer));
      }
    }
  });
});

document.querySelectorAll('[data-std-insert], [data-std-action]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const insert = btn.getAttribute('data-std-insert');
    const action = btn.getAttribute('data-std-action');

    if (insert) {
      insertAtCursorStd(insert);
      return;
    }

    if (action === 'clear') {
      clearAllStd();
      return;
    }

    if (action === 'back') {
      backspaceStd();
      return;
    }

    if (action === 'eval') {
      evaluateExprStd();
    }
  });
});

exprInput.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') {
    ev.preventDefault();
    evaluateExpr();
    return;
  }

  if (ev.key === 'Backspace' && (ev.ctrlKey || ev.metaKey)) {
    ev.preventDefault();
    backspace();
  }
});

exprStd.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') {
    ev.preventDefault();
    evaluateExprStd();
    return;
  }

  if (ev.key === 'Backspace' && (ev.ctrlKey || ev.metaKey)) {
    ev.preventDefault();
    backspaceStd();
  }
});

clearHistoryBtn.addEventListener('click', () => {
  history = [];
  renderHistory();
});

// ---- Tabs / pages ----
function setActivePage(page) {
  activePage = page;
  document.querySelectorAll('.tab').forEach((t) => {
    t.classList.toggle('active', t.getAttribute('data-page') === page);
  });
  document.querySelectorAll('.page').forEach((p) => {
    p.classList.toggle('is-active', p.getAttribute('data-page') === page);
  });
}

document.querySelectorAll('.tab[data-page]').forEach((t) => {
  t.addEventListener('click', () => setActivePage(t.getAttribute('data-page')));
});

// ---- Graph ----
function drawGraph(xs, ys) {
  if (!graphCanvas) return;
  const ctx = graphCanvas.getContext('2d');

  const rect = graphCanvas.getBoundingClientRect();
  const w = Math.max(10, Math.floor(rect.width));
  const h = Math.max(10, Math.floor(rect.height));
  graphCanvas.width = w * (window.devicePixelRatio || 1);
  graphCanvas.height = h * (window.devicePixelRatio || 1);
  ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

  ctx.clearRect(0, 0, w, h);

  // Compute y-range ignoring nulls
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const y of ys) {
    if (y === null || y === undefined) continue;
    if (y < yMin) yMin = y;
    if (y > yMax) yMax = y;
  }
  if (!isFinite(yMin) || !isFinite(yMax) || yMin === yMax) {
    yMin = -1;
    yMax = 1;
  }

  const xMin = xs[0];
  const xMax = xs[xs.length - 1];

  const pad = 12;
  const xToPx = (x) => pad + ((x - xMin) / (xMax - xMin)) * (w - pad * 2);
  const yToPx = (y) => pad + (1 - (y - yMin) / (yMax - yMin)) * (h - pad * 2);

  // Axes
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(0.5, 0.5, w - 1, h - 1);
  ctx.stroke();

  // Plot
  ctx.strokeStyle = 'rgba(45,107,255,0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath();

  let started = false;
  for (let i = 0; i < xs.length; i++) {
    const y = ys[i];
    if (y === null || y === undefined) {
      started = false;
      continue;
    }
    const px = xToPx(xs[i]);
    const py = yToPx(y);
    if (!started) {
      ctx.moveTo(px, py);
      started = true;
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
}

async function plotGraph() {
  const expr = (fx?.value || '').trim();
  if (!expr) return;
  const x0 = Number(xmin?.value ?? -10);
  const x1 = Number(xmax?.value ?? 10);

  try {
    const resp = await fetch('/api/evalfx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expr, deg: degToggle.checked, xmin: x0, xmax: x1, points: 220 }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.ok) return;
    drawGraph(data.xs, data.ys);
  } catch (_) {
    // ignore
  }
}

plotBtn?.addEventListener('click', plotGraph);
fx?.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') {
    ev.preventDefault();
    plotGraph();
  }
});

// ---- Programmer ----
let baseGuard = false;
function syncBases(from) {
  if (baseGuard) return;
  baseGuard = true;
  try {
    let n = null;
    if (from === 'dec') {
      const v = (dec.value || '').trim();
      n = v === '' ? null : parseInt(v, 10);
    } else if (from === 'bin') {
      const v = (bin.value || '').trim();
      n = v === '' ? null : parseInt(v, 2);
    } else if (from === 'oct') {
      const v = (oct.value || '').trim();
      n = v === '' ? null : parseInt(v, 8);
    } else if (from === 'hex') {
      const v = (hex.value || '').trim();
      n = v === '' ? null : parseInt(v, 16);
    }

    if (n === null || Number.isNaN(n)) {
      if (from !== 'dec') dec.value = '';
      if (from !== 'bin') bin.value = '';
      if (from !== 'oct') oct.value = '';
      if (from !== 'hex') hex.value = '';
      return;
    }

    if (from !== 'dec') dec.value = String(n);
    if (from !== 'bin') bin.value = (n >>> 0).toString(2);
    if (from !== 'oct') oct.value = (n >>> 0).toString(8);
    if (from !== 'hex') hex.value = (n >>> 0).toString(16).toUpperCase();
  } finally {
    baseGuard = false;
  }
}

dec?.addEventListener('input', () => syncBases('dec'));
bin?.addEventListener('input', () => syncBases('bin'));
oct?.addEventListener('input', () => syncBases('oct'));
hex?.addEventListener('input', () => syncBases('hex'));

// ---- Converter ----
let convGuard = false;
function setVal(el, v) {
  if (!el) return;
  el.value = v;
}

function onCelsius() {
  if (convGuard) return;
  convGuard = true;
  try {
    const c = Number(celsius.value);
    if (!Number.isFinite(c)) {
      setVal(fahrenheit, '');
      return;
    }
    setVal(fahrenheit, String((c * 9) / 5 + 32));
  } finally {
    convGuard = false;
  }
}

function onFahrenheit() {
  if (convGuard) return;
  convGuard = true;
  try {
    const f = Number(fahrenheit.value);
    if (!Number.isFinite(f)) {
      setVal(celsius, '');
      return;
    }
    setVal(celsius, String(((f - 32) * 5) / 9));
  } finally {
    convGuard = false;
  }
}

function onMeters() {
  if (convGuard) return;
  convGuard = true;
  try {
    const m = Number(meters.value);
    if (!Number.isFinite(m)) {
      setVal(feet, '');
      return;
    }
    setVal(feet, String(m * 3.280839895));
  } finally {
    convGuard = false;
  }
}

function onFeet() {
  if (convGuard) return;
  convGuard = true;
  try {
    const ft = Number(feet.value);
    if (!Number.isFinite(ft)) {
      setVal(meters, '');
      return;
    }
    setVal(meters, String(ft / 3.280839895));
  } finally {
    convGuard = false;
  }
}

celsius?.addEventListener('input', onCelsius);
fahrenheit?.addEventListener('input', onFahrenheit);
meters?.addEventListener('input', onMeters);
feet?.addEventListener('input', onFeet);

// Initial
syncExprLine();
syncExprLineStd();
renderHistory();
setActivePage('scientific');
