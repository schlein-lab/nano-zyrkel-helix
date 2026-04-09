// ── WASM Loading ────────────────────────────────────────────────
let wasm = null;

async function loadWasm() {
  try {
    const mod = await import('./pkg/helix.js');
    await mod.default();
    wasm = mod;
    console.log('Helix WASM loaded');
    initHwe();
  } catch (e) {
    console.warn('WASM not available, running in demo mode:', e.message);
    initHweDemo();
  }
}

// ── Navigation ──────────────────────────────────────────────────
const modules = [
  { id: 'home', name: 'Home', desc: 'Overview of all modules', status: 'live' },
  { id: 'hwe', name: 'Hardy-Weinberg', desc: 'Allele frequency calculator with real population data', status: 'live' },
  { id: 'mutations', name: 'Mutations', desc: 'DNA mutation simulator with protein impact', status: 'soon' },
  { id: 'mendel', name: 'Mendel Lab', desc: 'Multi-variant family builder with pedigrees', status: 'soon' },
  { id: 'evolution', name: 'Evolution', desc: 'Population genetics with Out-of-Africa sim', status: 'soon' },
  { id: 'meiosis', name: 'Meiosis', desc: 'Animated meiosis with crossing-over', status: 'soon' },
  { id: 'karyotype', name: 'Karyotype', desc: 'Drag & drop chromosome sorting', status: 'soon' },
  { id: 'tumor', name: 'Tumor Genetics', desc: 'Multi-hit cancer model with COSMIC data', status: 'soon' },
  { id: 'pharma', name: 'Pharmacogenetics', desc: 'Drug metabolism with CYP variants', status: 'soon' },
  { id: 'population', name: 'Population Map', desc: 'Global variant frequency comparator', status: 'soon' },
  { id: 'epigenetics', name: 'Epigenetics', desc: 'Methylation and imprinting sandbox', status: 'soon' },
];

function initNav() {
  // Embed mode
  if (new URLSearchParams(location.search).has('embed')) {
    document.body.classList.add('embed');
  }

  // Tab clicks
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchModule(tab.dataset.module));
  });

  // Module grid on home
  const grid = document.getElementById('module-grid');
  modules.filter(m => m.id !== 'home').forEach(m => {
    const card = document.createElement('div');
    card.className = 'module-card';
    card.innerHTML = `<h3>${m.name}</h3><p>${m.desc}</p><span class="badge ${m.status}">${m.status}</span>`;
    card.addEventListener('click', () => switchModule(m.id));
    grid.appendChild(card);
  });

  // URL hash navigation
  if (location.hash) {
    switchModule(location.hash.slice(1));
  }
}

function switchModule(id) {
  document.querySelectorAll('.module').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  const mod = document.getElementById('module-' + id);
  const tab = document.querySelector(`.tab[data-module="${id}"]`);
  if (mod) mod.classList.add('active');
  if (tab) tab.classList.add('active');
  location.hash = id === 'home' ? '' : id;
}

// ── Hardy-Weinberg (WASM) ───────────────────────────────────────
function initHwe() {
  const pSlider = document.getElementById('hwe-p');
  const fSlider = document.getElementById('hwe-f');
  const pVal = document.getElementById('hwe-p-val');
  const fVal = document.getElementById('hwe-f-val');

  function update() {
    const p = parseFloat(pSlider.value);
    const f = parseFloat(fSlider.value);
    pVal.textContent = p.toFixed(3);
    fVal.textContent = f.toFixed(2);

    const result = JSON.parse(wasm.hwe_inbreeding_calc(p, f));
    renderHweChart(result);
    renderHweFormula(result, f);
  }

  pSlider.addEventListener('input', update);
  fSlider.addEventListener('input', update);

  // Chi-squared
  ['chi-aa', 'chi-ab', 'chi-bb'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateChi);
  });

  update();
  updateChi();
}

function initHweDemo() {
  // Fallback without WASM — pure JS calculation
  const pSlider = document.getElementById('hwe-p');
  const fSlider = document.getElementById('hwe-f');
  const pVal = document.getElementById('hwe-p-val');
  const fVal = document.getElementById('hwe-f-val');

  function update() {
    const p = parseFloat(pSlider.value);
    const f = parseFloat(fSlider.value);
    const q = 1 - p;
    pVal.textContent = p.toFixed(3);
    fVal.textContent = f.toFixed(2);

    const result = {
      p, q,
      freq_aa: p * p + f * p * q,
      freq_ab: 2 * p * q * (1 - f),
      freq_bb: q * q + f * p * q,
    };
    renderHweChart(result);
    renderHweFormula(result, f);
  }

  pSlider.addEventListener('input', update);
  fSlider.addEventListener('input', update);
  ['chi-aa', 'chi-ab', 'chi-bb'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateChiDemo);
  });
  update();
  updateChiDemo();
}

function updateChi() {
  const aa = parseInt(document.getElementById('chi-aa').value) || 0;
  const ab = parseInt(document.getElementById('chi-ab').value) || 0;
  const bb = parseInt(document.getElementById('chi-bb').value) || 0;
  const result = JSON.parse(wasm.hwe_chi_squared_calc(aa, ab, bb));
  renderChiResult(result);
}

function updateChiDemo() {
  const aa = parseInt(document.getElementById('chi-aa').value) || 0;
  const ab = parseInt(document.getElementById('chi-ab').value) || 0;
  const bb = parseInt(document.getElementById('chi-bb').value) || 0;
  const n = aa + ab + bb;
  if (n === 0) { renderChiResult({ chi_squared: 0, in_equilibrium: true }); return; }
  const p = (2 * aa + ab) / (2 * n);
  const q = 1 - p;
  const eAA = p * p * n, eAb = 2 * p * q * n, eBB = q * q * n;
  const chi2 = (eAA > 0 ? (aa - eAA) ** 2 / eAA : 0)
    + (eAb > 0 ? (ab - eAb) ** 2 / eAb : 0)
    + (eBB > 0 ? (bb - eBB) ** 2 / eBB : 0);
  renderChiResult({ chi_squared: chi2, in_equilibrium: chi2 < 3.841 });
}

// ── SVG Rendering ───────────────────────────────────────────────
function renderHweChart(r) {
  const svg = document.getElementById('hwe-chart');
  const w = 400, h = 260, pad = 50, barW = 80, gap = 20;
  const maxH = h - pad - 30;

  const bars = [
    { label: 'AA', value: r.freq_aa, color: 'var(--aa-color)' },
    { label: 'Aa', value: r.freq_ab, color: 'var(--ab-color)' },
    { label: 'aa', value: r.freq_bb, color: 'var(--bb-color)' },
  ];

  const startX = (w - (bars.length * barW + (bars.length - 1) * gap)) / 2;

  let html = '';
  // Y axis
  for (let i = 0; i <= 4; i++) {
    const y = pad + maxH - (i / 4) * maxH;
    const val = (i * 25).toString();
    html += `<line x1="${startX - 5}" y1="${y}" x2="${startX + bars.length * barW + (bars.length-1) * gap}" y2="${y}" stroke="#1e293b" stroke-width="1"/>`;
    html += `<text x="${startX - 10}" y="${y + 4}" fill="#64748b" font-size="11" text-anchor="end">${val}%</text>`;
  }

  bars.forEach((b, i) => {
    const x = startX + i * (barW + gap);
    const barH = b.value * maxH;
    const y = pad + maxH - barH;
    html += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="${b.color}" rx="4" opacity="0.85"/>`;
    html += `<text x="${x + barW/2}" y="${pad + maxH + 18}" fill="#e2e8f0" font-size="13" text-anchor="middle" font-weight="600">${b.label}</text>`;
    html += `<text x="${x + barW/2}" y="${y - 6}" fill="${b.color}" font-size="12" text-anchor="middle" font-family="monospace">${(b.value * 100).toFixed(1)}%</text>`;
  });

  svg.innerHTML = html;
}

function renderHweFormula(r, f) {
  const el = document.getElementById('hwe-formula');
  const lines = [
    `p = ${r.p.toFixed(3)}  q = ${r.q.toFixed(3)}`,
    ``,
    `AA (p² + Fpq) = ${(r.freq_aa * 100).toFixed(2)}%`,
    `Aa (2pq(1-F))  = ${(r.freq_ab * 100).toFixed(2)}%`,
    `aa (q² + Fpq) = ${(r.freq_bb * 100).toFixed(2)}%`,
  ];
  if (f === 0) {
    lines[2] = `AA (p²)  = ${(r.freq_aa * 100).toFixed(2)}%`;
    lines[3] = `Aa (2pq) = ${(r.freq_ab * 100).toFixed(2)}%`;
    lines[4] = `aa (q²)  = ${(r.freq_bb * 100).toFixed(2)}%`;
  }
  el.textContent = lines.join('\n');
}

function renderChiResult(r) {
  const el = document.getElementById('chi-result');
  el.className = 'chi-result ' + (r.in_equilibrium ? 'equilibrium' : 'not-equilibrium');
  el.innerHTML = `χ² = <strong>${r.chi_squared.toFixed(4)}</strong> (df=1, critical=3.841)<br>`
    + (r.in_equilibrium
      ? '<span style="color:var(--success)">In Hardy-Weinberg equilibrium (p > 0.05)</span>'
      : '<span style="color:var(--danger)">NOT in equilibrium (p < 0.05)</span>');
}

// ── Init ────────────────────────────────────────────────────────
initNav();
loadWasm();
