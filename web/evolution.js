// ── Evolution Sandbox ────────────────────────────────────────────

let wasm = null;

async function loadWasm() {
  try {
    const mod = await import('./pkg/helix.js');
    await mod.default();
    wasm = mod;
    console.log('WASM loaded for evolution');
  } catch (e) {
    console.warn('WASM not available:', e.message);
  }
}

// ── Scenario Presets ────────────────────────────────────────────
const SCENARIOS = {
  sickle: {
    name: 'Malaria Resistance (HBB rs334)', gene: 'HBB',
    info: 'A classic example of environment-dependent selection. In regions with endemic malaria, carriers of the sickle cell variant have increased resistance to Plasmodium falciparum infection. This survival advantage in a specific environment (not an inherent quality of the allele) maintains the variant at ~5-20% in affected regions. In non-endemic areas, the same variant confers no advantage and homozygotes have sickle cell disease — demonstrating that "beneficial" and "harmful" are always relative to environment.',
    params: { p0: 0.06, n: 10000, s: 0.1, h: 1.5, gen: 500 },
    popFreqs: { AFR: 0.023, EUR: 0.0002, SAS: 0.0017, EAS: 0.0001, AMR: 0.0005 },
  },
  lactose: {
    name: 'Dairy Culture Co-evolution (LCT rs4988235)', gene: 'LCT',
    info: 'A textbook example of gene-culture co-evolution, not genetic superiority. Populations that domesticated cattle and consumed dairy ~8000 years ago independently evolved lactase persistence — in Europe, East Africa, and the Middle East through different mutations. This shows parallel adaptation to a shared cultural practice, not a hierarchy of populations. The "ancestral" state (lactose intolerance in adulthood) is the global majority and is completely normal.',
    params: { p0: 0.01, n: 10000, s: 0.04, h: 0.5, gen: 400 },
    popFreqs: { EUR: 0.75, AFR: 0.07, SAS: 0.30, EAS: 0.05, AMR: 0.40 },
  },
  skin: {
    name: 'UV Adaptation (SLC24A5 rs1426654)', gene: 'SLC24A5',
    info: 'Skin pigmentation varies as an adaptation to UV radiation intensity — not as a meaningful biological category. Darker pigmentation protects against UV damage and folate degradation near the equator. Lighter pigmentation allows more vitamin D synthesis at higher latitudes with less UV. Both are optimal adaptations to different environments. Multiple genes are involved, and the variation is clinal (gradual), not categorical. This variant explains only a fraction of pigmentation variation.',
    params: { p0: 0.01, n: 10000, s: 0.05, h: 0.5, gen: 500 },
    popFreqs: { EUR: 0.98, AFR: 0.02, SAS: 0.65, EAS: 0.02, AMR: 0.50 },
  },
  aldh2: {
    name: 'Acetaldehyde Metabolism (ALDH2 rs671)', gene: 'ALDH2',
    info: 'This variant causes the "alcohol flush reaction" and is common in East Asian populations (~20%). Its high frequency is debated: was there positive selection (possibly protective against alcoholism?), or is it the result of genetic drift in a population bottleneck? This illustrates an important principle: not every population difference is due to selection. Random drift in small founding populations can produce large frequency differences without any selective advantage.',
    params: { p0: 0.20, n: 5000, s: 0.0, h: 0.5, gen: 300 },
    popFreqs: { EAS: 0.20, EUR: 0.0, AFR: 0.0, SAS: 0.01, AMR: 0.02 },
  },
  founder: {
    name: 'Founder Effect (BRCA1 rs80357906)', gene: 'BRCA1',
    info: 'This cancer-predisposing variant is enriched in certain communities due to a population bottleneck — a small founding group happened to carry the variant, and random drift (not selection) increased its frequency. This demonstrates that population-specific variant frequencies reflect migration history and chance, not adaptation or fitness. Any small isolated population can accumulate disease-causing variants by drift alone.',
    params: { p0: 0.001, n: 500, s: 0.0, h: 0.5, gen: 40 },
    popFreqs: { EUR: 0.0009, AFR: 0.0001, SAS: 0.0001, EAS: 0.0001, AMR: 0.0009 },
  },
};

// ── State ───────────────────────────────────────────────────────
let currentMode = 'trajectory';
let trajData = null;   // batch result
let migData = null;    // migration result

// ── Log-scale slider helpers ────────────────────────────────────
function logVal(slider) { return Math.round(Math.pow(10, parseFloat(slider.value))); }

// ── Init ────────────────────────────────────────────────────────
function init() {
  if (new URLSearchParams(location.search).has('embed')) {
    document.body.classList.add('embed');
  }

  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentMode = tab.dataset.mode;
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.mode-panel').forEach(p => p.classList.remove('active'));
      document.getElementById('mode-' + currentMode).classList.add('active');
    });
  });

  initTrajectory();
  initMigration();
  initScenarios();
  loadWasm();
}

// ═══════════════════════════════════════════════════════════════
// TRAJECTORY MODE
// ═══════════════════════════════════════════════════════════════

function initTrajectory() {
  const sliders = {
    p0:   { el: 's-p0',   vEl: 'v-p0',   fmt: v => parseFloat(v).toFixed(3) },
    n:    { el: 's-n',    vEl: 'v-n',    fmt: v => fmtNum(logVal(document.getElementById('s-n'))) },
    s:    { el: 's-s',    vEl: 'v-s',    fmt: v => parseFloat(v).toFixed(3) },
    h:    { el: 's-h',    vEl: 'v-h',    fmt: v => parseFloat(v).toFixed(2) },
    gen:  { el: 's-gen',  vEl: 'v-gen',  fmt: v => fmtNum(logVal(document.getElementById('s-gen'))) },
    runs: { el: 's-runs', vEl: 'v-runs', fmt: v => v },
  };

  Object.values(sliders).forEach(s => {
    document.getElementById(s.el).addEventListener('input', () => {
      document.getElementById(s.vEl).textContent = s.fmt(document.getElementById(s.el).value);
    });
  });

  // Bottleneck toggle
  document.getElementById('bn-enable').addEventListener('change', (e) => {
    document.getElementById('bn-params').style.display = e.target.checked ? '' : 'none';
  });

  document.getElementById('btn-run').addEventListener('click', runTrajectory);
  document.getElementById('btn-reset').addEventListener('click', () => {
    trajData = null;
    document.getElementById('traj-chart').innerHTML = '';
    document.getElementById('traj-stats').innerHTML = '';
  });

  // Initialize display values
  Object.values(sliders).forEach(s => {
    document.getElementById(s.vEl).textContent = s.fmt(document.getElementById(s.el).value);
  });
}

function runTrajectory() {
  const p0 = parseFloat(document.getElementById('s-p0').value);
  const N = logVal(document.getElementById('s-n'));
  const s = parseFloat(document.getElementById('s-s').value);
  const h = parseFloat(document.getElementById('s-h').value);
  const gen = logVal(document.getElementById('s-gen'));
  const runs = parseInt(document.getElementById('s-runs').value);
  const bnEnabled = document.getElementById('bn-enable').checked;
  const seed = Math.floor(Math.random() * 1e9);

  try {
    if (wasm && !bnEnabled) {
      const json = wasm.evo_simulate_batch(p0, N, s, h, gen, runs, seed);
      trajData = JSON.parse(json);
    } else if (wasm && bnEnabled) {
      const bnAt = parseInt(document.getElementById('bn-at').value);
      const bnSize = parseInt(document.getElementById('bn-size').value);
      const bnDur = parseInt(document.getElementById('bn-dur').value);
      trajData = [];
      for (let i = 0; i < runs; i++) {
        const json = wasm.evo_simulate_bottleneck(p0, N, s, h, gen, bnAt, bnSize, bnDur, seed + i * 7919);
        trajData.push(JSON.parse(json));
      }
    } else {
      // JS fallback — cap N to avoid browser hang
      const cappedN = Math.min(N, 500);
      trajData = jsFallbackBatch(p0, cappedN, s, gen, runs, seed);
    }
  } catch (e) {
    console.error('Simulation error:', e);
    trajData = jsFallbackBatch(p0, Math.min(N, 200), s, gen, runs, seed);
  }

  renderTrajectory();
  renderTrajStats();
}

function renderTrajectory() {
  if (!trajData || trajData.length === 0) return;
  const svg = document.getElementById('traj-chart');
  const w = 500, ht = 250, padL = 40, padR = 10, padT = 15, padB = 25;
  const chartW = w - padL - padR;
  const chartH = ht - padT - padB;
  const maxGen = trajData[0].length - 1;

  let html = '';

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = padT + chartH - (i / 4) * chartH;
    html += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#1e293b" stroke-width="0.5"/>`;
    html += `<text x="${padL - 5}" y="${y + 3}" fill="#475569" font-size="8" text-anchor="end">${(i * 25)}%</text>`;
  }
  // X axis labels
  for (let i = 0; i <= 4; i++) {
    const x = padL + (i / 4) * chartW;
    html += `<text x="${x}" y="${ht - 3}" fill="#475569" font-size="8" text-anchor="middle">${fmtNum(Math.round(maxGen * i / 4))}</text>`;
  }

  // Bottleneck zone
  const bnEnabled = document.getElementById('bn-enable').checked;
  if (bnEnabled) {
    const bnAt = parseInt(document.getElementById('bn-at').value);
    const bnDur = parseInt(document.getElementById('bn-dur').value);
    const x1 = padL + (bnAt / maxGen) * chartW;
    const x2 = padL + ((bnAt + bnDur) / maxGen) * chartW;
    html += `<rect x="${x1}" y="${padT}" width="${x2 - x1}" height="${chartH}" fill="#ef4444" opacity="0.08" rx="2"/>`;
    html += `<text x="${(x1 + x2) / 2}" y="${padT + 10}" fill="#ef4444" font-size="7" text-anchor="middle" opacity="0.6">bottleneck</text>`;
  }

  // Trajectories
  trajData.forEach((traj, idx) => {
    const last = traj[traj.length - 1];
    const color = last >= 0.999 ? '#10b981' : last <= 0.001 ? '#ef4444' : '#06b6d4';
    const opacity = trajData.length > 20 ? 0.2 : trajData.length > 5 ? 0.3 : 0.5;
    const points = traj.map((f, i) => {
      const x = padL + (i / maxGen) * chartW;
      const y = padT + chartH - f * chartH;
      return `${x},${y}`;
    }).join(' ');
    html += `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.2" opacity="${opacity}"/>`;
  });

  // Mean line
  if (trajData.length > 1) {
    const meanPoints = [];
    for (let i = 0; i <= maxGen; i++) {
      let sum = 0;
      trajData.forEach(t => sum += (t[i] !== undefined ? t[i] : t[t.length - 1]));
      const mean = sum / trajData.length;
      const x = padL + (i / maxGen) * chartW;
      const y = padT + chartH - mean * chartH;
      meanPoints.push(`${x},${y}`);
    }
    html += `<polyline points="${meanPoints.join(' ')}" fill="none" stroke="#fff" stroke-width="1.5" opacity="0.7"/>`;
  }

  // Labels
  html += `<text x="${padL}" y="${padT - 4}" fill="#64748b" font-size="8">allele frequency</text>`;
  html += `<text x="${w - padR}" y="${ht - 3}" fill="#64748b" font-size="8" text-anchor="end">generations</text>`;

  // Legend
  const ly = padT + 2;
  html += `<line x1="${w - 130}" y1="${ly}" x2="${w - 115}" y2="${ly}" stroke="#10b981" stroke-width="2"/>`;
  html += `<text x="${w - 112}" y="${ly + 3}" fill="#64748b" font-size="7">fixed</text>`;
  html += `<line x1="${w - 85}" y1="${ly}" x2="${w - 70}" y2="${ly}" stroke="#ef4444" stroke-width="2"/>`;
  html += `<text x="${w - 67}" y="${ly + 3}" fill="#64748b" font-size="7">lost</text>`;
  html += `<line x1="${w - 48}" y1="${ly}" x2="${w - 33}" y2="${ly}" stroke="#06b6d4" stroke-width="2"/>`;
  html += `<text x="${w - 30}" y="${ly + 3}" fill="#64748b" font-size="7">poly</text>`;

  svg.innerHTML = html;
}

function renderTrajStats() {
  if (!trajData) return;
  let fixed = 0, lost = 0, poly = 0;
  trajData.forEach(t => {
    const last = t[t.length - 1];
    if (last >= 0.999) fixed++;
    else if (last <= 0.001) lost++;
    else poly++;
  });
  const total = trajData.length;
  const N = logVal(document.getElementById('s-n'));
  const s = parseFloat(document.getElementById('s-s').value);
  const p0 = parseFloat(document.getElementById('s-p0').value);
  const pFix = wasm ? wasm.fixation_prob(N, s, p0) : p0;

  document.getElementById('traj-stats').innerHTML = `
    <div class="stat ok"><div class="stat-value">${fixed}/${total}</div><div class="stat-label">fixed</div></div>
    <div class="stat deviation"><div class="stat-value">${lost}/${total}</div><div class="stat-label">lost</div></div>
    <div class="stat"><div class="stat-value">${(pFix * 100).toFixed(1)}%</div><div class="stat-label">P(fix) Kimura</div></div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// MIGRATION MODE
// ═══════════════════════════════════════════════════════════════

let migAnimFrame = null;
let migPlaying = false;
let migSpeed = 1;

function initMigration() {
  const migSliders = {
    nMig:     { el: 's-n-mig',    vEl: 'v-n-mig',    fmt: () => fmtNum(logVal(document.getElementById('s-n-mig'))) },
    genMig:   { el: 's-gen-mig',  vEl: 'v-gen-mig',  fmt: () => fmtNum(logVal(document.getElementById('s-gen-mig'))) },
    origin:   { el: 's-origin',   vEl: 'v-origin',   fmt: v => parseFloat(v).toFixed(3) },
    mig:      { el: 's-mig',      vEl: 'v-mig',      fmt: v => parseFloat(v).toFixed(3) },
    sOrigin:  { el: 's-s-origin', vEl: 'v-s-origin', fmt: v => parseFloat(v).toFixed(3) },
    sOther:   { el: 's-s-other',  vEl: 'v-s-other',  fmt: v => parseFloat(v).toFixed(3) },
    hMig:     { el: 's-h-mig',    vEl: 'v-h-mig',    fmt: v => parseFloat(v).toFixed(2) },
  };

  Object.values(migSliders).forEach(s => {
    document.getElementById(s.el).addEventListener('input', () => {
      document.getElementById(s.vEl).textContent = s.fmt(document.getElementById(s.el).value);
    });
  });

  // Time slider
  document.getElementById('mig-time').addEventListener('input', (e) => {
    if (!migData) return;
    const maxGen = migData[0].length - 1;
    const gen = Math.round((parseInt(e.target.value) / 100) * maxGen);
    document.getElementById('v-time').textContent = `gen ${fmtNum(gen)}`;
    updateMigMap(gen);
  });

  // Play button
  document.getElementById('mig-play').addEventListener('click', toggleMigPlay);

  // Speed buttons
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      migSpeed = parseFloat(btn.dataset.speed);
    });
  });

  document.getElementById('btn-run-mig').addEventListener('click', () => {
    runMigration();
    // Auto-play after simulation
    setTimeout(() => { if (migData && !migPlaying) toggleMigPlay(); }, 100);
  });

  // Render empty map
  renderWorldMap('mig-map', {}, { title: 'Click "Simulate spread" to start' });
}

function runMigration() {
  const nPop = 10; // Fixed: 10 OOA nodes
  const N = logVal(document.getElementById('s-n-mig'));
  const gen = logVal(document.getElementById('s-gen-mig'));
  const originFreq = parseFloat(document.getElementById('s-origin').value);
  const m = parseFloat(document.getElementById('s-mig').value);
  const sOrigin = parseFloat(document.getElementById('s-s-origin').value);
  const sOther = parseFloat(document.getElementById('s-s-other').value);
  const h = parseFloat(document.getElementById('s-h-mig').value);
  const seed = Math.floor(Math.random() * 1e9);

  // 10 populations: africa, mideast, europe, central_asia, south_asia, east_asia, se_asia, australia, siberia, americas
  const initFreqs = [originFreq, ...Array(nPop - 1).fill(0.0)];
  const selection = [sOrigin, ...Array(nPop - 1).fill(sOther)];

  try {
    if (wasm) {
      const json = wasm.evo_simulate_migration(
        nPop, N,
        JSON.stringify(initFreqs),
        JSON.stringify(selection),
        h, m, gen, seed
      );
      migData = JSON.parse(json);
    } else {
      migData = jsFallbackMigration(nPop, Math.min(N, 200), initFreqs, m, gen, seed);
    }
  } catch (e) {
    console.error('Migration sim error:', e);
    migData = jsFallbackMigration(nPop, Math.min(N, 100), initFreqs, m, gen, seed);
  }

  // Set time slider to end
  document.getElementById('mig-time').max = 100;
  document.getElementById('mig-time').value = 100;
  document.getElementById('v-time').textContent = `gen ${fmtNum(gen)}`;

  updateMigMap(migData[0].length - 1);
  renderMigrationChart();
  renderMigrationNote(nPop, N, gen, m);
}

function updateMigMap(genIndex) {
  if (!migData) return;
  const m = parseFloat(document.getElementById('s-mig').value);
  const freqs = simToNodeFreqs(migData, genIndex);
  const gen = genIndex;
  const maxGen = migData[0].length - 1;
  renderWorldMap('mig-map', freqs, {
    showEdges: true,
    animate: gen === maxGen,
    migrationRate: m,
    title: `Generation ${fmtNum(gen)} / ${fmtNum(maxGen)}`,
  });
}

function toggleMigPlay() {
  if (!migData) return;
  const btn = document.getElementById('mig-play');
  const slider = document.getElementById('mig-time');
  const maxGen = migData[0].length - 1;

  if (migPlaying) {
    migPlaying = false;
    btn.classList.remove('playing');
    btn.innerHTML = '&#9654;';
    if (migAnimFrame) cancelAnimationFrame(migAnimFrame);
    return;
  }

  migPlaying = true;
  btn.classList.add('playing');
  btn.innerHTML = '&#10074;&#10074;';

  // Start from current position or beginning
  let currentPct = parseFloat(slider.value);
  if (currentPct >= 99) currentPct = 0;

  let lastTime = null;
  function step(timestamp) {
    if (!migPlaying) return;
    if (!lastTime) lastTime = timestamp;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // Speed: at 1x, full animation takes ~5 seconds
    currentPct += (dt / 50) * migSpeed;

    if (currentPct > 100) {
      currentPct = 100;
      migPlaying = false;
      btn.classList.remove('playing');
      btn.innerHTML = '&#9654;';
    }

    slider.value = currentPct;
    const gen = Math.round((currentPct / 100) * maxGen);
    document.getElementById('v-time').textContent = `gen ${fmtNum(gen)}`;
    updateMigMap(gen);

    if (migPlaying) {
      migAnimFrame = requestAnimationFrame(step);
    }
  }
  migAnimFrame = requestAnimationFrame(step);
}

function renderMigrationChart() {
  if (!migData) return;
  const svg = document.getElementById('mig-chart');
  const w = 500, ht = 220, padL = 40, padR = 10, padT = 15, padB = 25;
  const chartW = w - padL - padR;
  const chartH = ht - padT - padB;
  const maxGen = migData[0].length - 1;
  const nPop = migData.length;

  let html = '';

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = padT + chartH - (i / 4) * chartH;
    html += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#1e293b" stroke-width="0.5"/>`;
    html += `<text x="${padL - 5}" y="${y + 3}" fill="#475569" font-size="8" text-anchor="end">${i * 25}%</text>`;
  }

  const popNames = ['Africa', 'MidEast', 'Europe', 'C.Asia', 'S.Asia', 'E.Asia', 'SE.Asia', 'Oceania', 'Siberia', 'Americas'];
  const popColors = ['#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#f97316', '#06b6d4', '#64748b', '#8b5cf6'];

  migData.forEach((traj, popIdx) => {
    const color = popColors[popIdx % popColors.length];
    const opacity = 0.6;

    const step = Math.max(1, Math.floor(maxGen / 500)); // subsample for performance
    const points = [];
    for (let i = 0; i <= maxGen; i += step) {
      const x = padL + (i / maxGen) * chartW;
      const y = padT + chartH - traj[i] * chartH;
      points.push(`${x},${y}`);
    }
    html += `<polyline points="${points.join(' ')}" fill="none" stroke="${color}" stroke-width="1" opacity="${opacity}"/>`;
  });

  // Origin line highlighted
  if (migData.length > 0) {
    const points = migData[0].map((f, i) => {
      const x = padL + (i / maxGen) * chartW;
      const y = padT + chartH - f * chartH;
      return `${x},${y}`;
    }).join(' ');
    html += `<polyline points="${points}" fill="none" stroke="#06b6d4" stroke-width="2" opacity="0.9"/>`;
  }

  html += `<text x="${padL}" y="${padT - 4}" fill="#64748b" font-size="8">frequency</text>`;
  html += `<text x="${w - padR}" y="${ht - 3}" fill="#64748b" font-size="8" text-anchor="end">generations</text>`;

  svg.innerHTML = html;
}

function renderMigrationNote(nPop, N, gen, m) {
  const note = document.getElementById('mig-note');
  const totalInds = nPop * N;
  note.textContent = `${nPop} populations × ${fmtNum(N)} individuals = ${fmtNum(totalInds)} total. Migration rate ${m}/gen. Stepping-stone model (chain topology).`;
}

// ═══════════════════════════════════════════════════════════════
// SCENARIO MODE
// ═══════════════════════════════════════════════════════════════

function initScenarios() {
  document.querySelectorAll('[data-sc]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-sc]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      runScenario(btn.dataset.sc);
    });
  });
}

function runScenario(id) {
  const sc = SCENARIOS[id];
  if (!sc) return;

  // Show detail
  const det = document.getElementById('scenario-detail');
  let popHtml = '';
  if (sc.popFreqs) {
    popHtml = '<div class="sc-pops">' +
      Object.entries(sc.popFreqs).map(([pop, f]) =>
        `<span class="sc-pop-chip">${pop}: ${(f * 100).toFixed(1)}%</span>`
      ).join('') + '</div>';
  }
  det.innerHTML = `
    <span class="sc-name">${sc.name}</span> <span class="sc-gene">${sc.gene}</span>
    <div class="sc-info">${sc.info}</div>
    ${popHtml}
  `;

  // Run simulation with preset params
  const { p0, n, s, h, gen } = sc.params;
  const runs = 15;
  const seed = Math.floor(Math.random() * 1e9);

  let data;
  if (wasm) {
    data = JSON.parse(wasm.evo_simulate_batch(p0, n, s, h, gen, runs, seed));
  } else {
    data = jsFallbackBatch(p0, n, s, gen, runs, seed);
  }

  // Render into scenario chart
  renderScenarioChart(data, sc);
}

function renderScenarioChart(data, sc) {
  const svg = document.getElementById('sc-chart');
  const w = 500, ht = 250, padL = 40, padR = 10, padT = 15, padB = 25;
  const chartW = w - padL - padR;
  const chartH = ht - padT - padB;
  const maxGen = data[0].length - 1;

  let html = '';

  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = padT + chartH - (i / 4) * chartH;
    html += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#1e293b" stroke-width="0.5"/>`;
    html += `<text x="${padL - 5}" y="${y + 3}" fill="#475569" font-size="8" text-anchor="end">${i * 25}%</text>`;
  }

  // Trajectories
  data.forEach(traj => {
    const last = traj[traj.length - 1];
    const color = last >= 0.999 ? '#10b981' : last <= 0.001 ? '#ef4444' : '#06b6d4';
    const points = traj.map((f, i) => `${padL + (i / maxGen) * chartW},${padT + chartH - f * chartH}`).join(' ');
    html += `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.2" opacity="0.35"/>`;
  });

  // Real population frequencies as horizontal lines on right side
  if (sc.popFreqs) {
    const popColors = { AFR: '#f59e0b', EUR: '#3b82f6', EAS: '#ef4444', SAS: '#10b981', AMR: '#8b5cf6' };
    let py = padT + 5;
    Object.entries(sc.popFreqs).forEach(([pop, f]) => {
      const y = padT + chartH - f * chartH;
      const color = popColors[pop] || '#64748b';
      html += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="${color}" stroke-width="0.8" stroke-dasharray="4,3" opacity="0.5"/>`;
      html += `<text x="${w - padR - 2}" y="${py}" fill="${color}" font-size="8" text-anchor="end">${pop} ${(f * 100).toFixed(1)}%</text>`;
      py += 11;
    });
  }

  html += `<text x="${padL}" y="${padT - 4}" fill="#64748b" font-size="8">frequency</text>`;
  html += `<text x="${w - padR}" y="${ht - 3}" fill="#64748b" font-size="8" text-anchor="end">generations</text>`;

  svg.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
// JS FALLBACKS
// ═══════════════════════════════════════════════════════════════

function jsFallbackBatch(p0, N, s, gen, runs, seed) {
  const results = [];
  for (let r = 0; r < runs; r++) {
    let p = p0;
    const traj = [p];
    let rng = seed + r * 7919;
    for (let g = 0; g < gen; g++) {
      // Simple WF with selection
      const pAdj = (p * (1 + s)) / (p * (1 + s) + (1 - p));
      // Pseudo-binomial
      let count = 0;
      for (let i = 0; i < 2 * N; i++) {
        rng = (rng * 1103515245 + 12345) & 0x7fffffff;
        if ((rng / 0x7fffffff) < pAdj) count++;
      }
      p = count / (2 * N);
      traj.push(p);
      if (p <= 0 || p >= 1) {
        while (traj.length <= gen) traj.push(p);
        break;
      }
    }
    results.push(traj);
  }
  return results;
}

function jsFallbackMigration(nPop, N, initFreqs, m, gen, seed) {
  let freqs = [...initFreqs];
  while (freqs.length < nPop) freqs.push(0);
  const histories = freqs.map(f => [f]);
  let rng = seed;

  for (let g = 0; g < gen; g++) {
    // Migration
    const newFreqs = [...freqs];
    for (let i = 0; i < nPop; i++) {
      let f = freqs[i];
      if (i > 0) f += m * (freqs[i - 1] - freqs[i]);
      if (i < nPop - 1) f += m * (freqs[i + 1] - freqs[i]);
      newFreqs[i] = Math.max(0, Math.min(1, f));
    }
    // Drift
    for (let i = 0; i < nPop; i++) {
      let count = 0;
      for (let j = 0; j < 2 * N; j++) {
        rng = (rng * 1103515245 + 12345) & 0x7fffffff;
        if ((rng / 0x7fffffff) < newFreqs[i]) count++;
      }
      freqs[i] = count / (2 * N);
      histories[i].push(freqs[i]);
    }
  }
  return histories;
}

// ── Helpers ─────────────────────────────────────────────────────
function fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return n.toString();
}

// ── Go ──────────────────────────────────────────────────────────
init();
