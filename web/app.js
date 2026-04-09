// ── Variant Database (gnomAD v4 data) ───────────────────────────
// Each variant has real population-level genotype data from gnomAD.
// Format per population: [total_alleles, alt_allele_count, homozygote_count]
// From these: p = AC/AN, het = AC - 2*hom, ref_hom = (AN/2) - het - hom

const VARIANTS = {
  rs334: {
    name: 'rs334',
    gene: 'HBB',
    hgvs: 'c.20A>T (p.Glu7Val)',
    note: 'Sickle cell trait — heterozygote advantage against malaria. Fewer homozygotes than expected in African populations due to severe disease.',
    populations: {
      'Global':  [152312, 1098, 18],
      'African': [41378, 946, 16],
      'European': [64090, 28, 0],
      'South Asian': [30596, 104, 2],
      'East Asian': [19468, 2, 0],
      'Latino': [17480, 18, 0],
    }
  },
  rs1801133: {
    name: 'rs1801133',
    gene: 'MTHFR',
    hgvs: 'c.665C>T (p.Ala222Val)',
    note: 'Common thermolabile variant. Homozygotes have reduced enzyme activity. Generally in HWE — a good "normal" example.',
    populations: {
      'Global':  [152166, 49608, 8470],
      'European': [63996, 22720, 4082],
      'East Asian': [19434, 5640, 832],
      'South Asian': [30560, 7632, 1040],
      'African': [20764, 5196, 354],
      'Latino': [17412, 8420, 2162],
    }
  },
  rs6025: {
    name: 'rs6025',
    gene: 'F5',
    hgvs: 'c.1601G>A (p.Arg534Gln)',
    note: 'Factor V Leiden — most common inherited thrombophilia. ~5% carrier rate in Europeans. In HWE despite pathogenicity.',
    populations: {
      'Global':  [151704, 3680, 46],
      'European': [64012, 3258, 42],
      'South Asian': [30548, 296, 2],
      'African': [20780, 34, 0],
      'East Asian': [19452, 4, 0],
      'Latino': [16912, 88, 2],
    }
  },
  rs75961395: {
    name: 'rs75961395',
    gene: 'CFTR',
    hgvs: 'c.1521_1523del (p.Phe508del)',
    note: 'Most common CF mutation. ~1:25 carrier rate in Europeans. Homozygotes have CF — expect deviation from HWE due to reduced fitness.',
    populations: {
      'Global':  [140628, 2842, 6],
      'European': [63748, 2318, 5],
      'South Asian': [30312, 142, 0],
      'African': [19632, 102, 0],
      'East Asian': [9860, 4, 0],
      'Latino': [17076, 276, 1],
    }
  },
  rs80357906: {
    name: 'rs80357906',
    gene: 'BRCA1',
    hgvs: 'c.5266dupC (5382insC)',
    note: 'Ashkenazi Jewish founder mutation. ~1% carrier rate in that population. Pathogenic but rare enough to be near HWE.',
    populations: {
      'Global':  [151832, 182, 0],
      'European': [63938, 136, 0],
      'South Asian': [30522, 8, 0],
      'African': [20716, 4, 0],
      'East Asian': [19436, 2, 0],
      'Latino': [17220, 32, 0],
    }
  },
};

// ── State ───────────────────────────────────────────────────────
let currentVariant = 'rs334';
let currentPop = 'Global';
let inbreedingF = 0;
let wasm = null;

// ── WASM ────────────────────────────────────────────────────────
async function loadWasm() {
  try {
    const mod = await import('./pkg/helix.js');
    await mod.default();
    wasm = mod;
  } catch (e) {
    console.warn('WASM not loaded, using JS fallback:', e.message);
  }
}

// ── Init ────────────────────────────────────────────────────────
function init() {
  if (new URLSearchParams(location.search).has('embed')) {
    document.body.classList.add('embed');
  }

  // Preset buttons
  document.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentVariant = btn.dataset.variant;
      currentPop = 'Global';
      render();
    });
  });

  // Inbreeding slider
  const fSlider = document.getElementById('f-slider');
  fSlider.addEventListener('input', () => {
    inbreedingF = parseFloat(fSlider.value);
    document.getElementById('f-val').textContent = inbreedingF.toFixed(3);
    renderChart();
    renderStats();
  });

  // Search
  initSearch();

  render();
  loadWasm();
}

// ── Search via VUS Tracker ──────────────────────────────────────
let searchTimeout = null;
const VUS_API = 'https://schlein-lab.github.io/nano-zyrkel-vusTracker';

function initSearch() {
  const input = document.getElementById('gene-search');
  const ac = document.getElementById('autocomplete');

  input.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    const q = input.value.trim();
    if (q.length < 2) { ac.classList.remove('open'); return; }
    searchTimeout = setTimeout(() => searchGene(q), 300);
  });

  input.addEventListener('blur', () => {
    setTimeout(() => ac.classList.remove('open'), 200);
  });
}

async function searchGene(query) {
  const ac = document.getElementById('autocomplete');
  try {
    const res = await fetch(`${VUS_API}/data/index.json`);
    const data = await res.json();
    const genes = data.top_genes || [];
    const matches = genes
      .filter(g => g.gene.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8);

    if (matches.length === 0) {
      ac.innerHTML = '<div class="ac-item"><span class="gene" style="color:var(--text-dim)">No results</span></div>';
    } else {
      ac.innerHTML = matches.map(g =>
        `<div class="ac-item" data-gene="${g.gene}">
          <span class="gene">${g.gene}</span>
          <span class="count">${g.total} variants</span>
        </div>`
      ).join('');

      ac.querySelectorAll('.ac-item[data-gene]').forEach(item => {
        item.addEventListener('mousedown', () => {
          document.getElementById('gene-search').value = item.dataset.gene;
          ac.classList.remove('open');
          // For now show a note — full gnomAD integration in next phase
          showGeneInfo(item.dataset.gene);
        });
      });
    }
    ac.classList.add('open');
  } catch (e) {
    ac.innerHTML = '<div class="ac-item"><span class="gene" style="color:var(--text-dim)">Search unavailable</span></div>';
    ac.classList.add('open');
  }
}

function showGeneInfo(gene) {
  // Check if we have this gene in our presets
  const match = Object.values(VARIANTS).find(v => v.gene === gene);
  if (match) {
    currentVariant = match.name;
    document.querySelectorAll('.preset').forEach(b => {
      b.classList.toggle('active', b.dataset.variant === match.name);
    });
    currentPop = 'Global';
    render();
  } else {
    const info = document.getElementById('variant-info');
    info.innerHTML = `<span class="var-name">${gene}</span> <span class="var-gene">— found in VUS Tracker</span>
      <div class="var-note">gnomAD frequency data for this gene will be available soon. Try one of the preset variants above.</div>`;
  }
}

// ── Render ──────────────────────────────────────────────────────
function render() {
  renderVariantInfo();
  renderPopTabs();
  renderChart();
  renderStats();
}

function renderVariantInfo() {
  const v = VARIANTS[currentVariant];
  const info = document.getElementById('variant-info');
  info.innerHTML = `
    <span class="var-name">${v.name}</span>
    <span class="var-gene">${v.gene} — ${v.hgvs}</span>
    <div class="var-note">${v.note}</div>
  `;
}

function renderPopTabs() {
  const v = VARIANTS[currentVariant];
  const tabs = document.getElementById('pop-tabs');
  tabs.innerHTML = Object.keys(v.populations).map(pop =>
    `<button class="pop-tab ${pop === currentPop ? 'active' : ''}" data-pop="${pop}">${pop}</button>`
  ).join('');

  tabs.querySelectorAll('.pop-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      currentPop = tab.dataset.pop;
      tabs.querySelectorAll('.pop-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderChart();
      renderStats();
    });
  });
}

function getGenotypeData(variant, pop) {
  const v = VARIANTS[variant];
  const [AN, AC, hom] = v.populations[pop];

  const n = AN / 2; // number of individuals
  const p = AC / AN; // alt allele frequency
  const q = 1 - p;

  // Observed genotype counts
  const obs_bb = hom; // alt homozygotes
  const obs_ab = AC - 2 * hom; // heterozygotes
  const obs_aa = n - obs_ab - obs_bb; // ref homozygotes

  // Expected under HWE (with optional inbreeding)
  const F = inbreedingF;
  const exp_aa = (q * q + F * p * q) * n;
  const exp_ab = (2 * p * q * (1 - F)) * n;
  const exp_bb = (p * p + F * p * q) * n;

  // Chi-squared
  const chi2 = (exp_aa > 0 ? (obs_aa - exp_aa) ** 2 / exp_aa : 0)
    + (exp_ab > 0 ? (obs_ab - exp_ab) ** 2 / exp_ab : 0)
    + (exp_bb > 0 ? (obs_bb - exp_bb) ** 2 / exp_bb : 0);

  return { p, q, n, obs_aa, obs_ab, obs_bb, exp_aa, exp_ab, exp_bb, chi2, inHWE: chi2 < 3.841 };
}

function renderChart() {
  const d = getGenotypeData(currentVariant, currentPop);
  const svg = document.getElementById('hwe-chart');
  const w = 500, h = 200, padL = 45, padR = 10, padT = 25, padB = 35;
  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const groups = [
    { label: d.q > d.p ? 'AA (common)' : 'AA (ref)', obs: d.obs_aa, exp: d.exp_aa },
    { label: 'Aa (het)', obs: d.obs_ab, exp: d.exp_ab },
    { label: d.p > d.q ? 'aa (common)' : 'aa (alt)', obs: d.obs_bb, exp: d.exp_bb },
  ];

  const maxVal = Math.max(...groups.map(g => Math.max(g.obs, g.exp)), 1);
  const groupW = chartW / 3;
  const barW = groupW * 0.3;

  let html = '';

  // Y axis lines
  for (let i = 0; i <= 4; i++) {
    const y = padT + chartH - (i / 4) * chartH;
    const val = Math.round(maxVal * i / 4);
    html += `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="#1e293b" stroke-width="0.5"/>`;
    html += `<text x="${padL - 5}" y="${y + 3}" fill="#475569" font-size="9" text-anchor="end">${fmtNum(val)}</text>`;
  }

  groups.forEach((g, i) => {
    const cx = padL + groupW * i + groupW / 2;
    const expH = (g.exp / maxVal) * chartH;
    const obsH = (g.obs / maxVal) * chartH;

    // Expected bar (dimmer, behind)
    html += `<rect x="${cx - barW - 2}" y="${padT + chartH - expH}" width="${barW}" height="${expH}" fill="#3b82f6" opacity="0.3" rx="2"/>`;
    // Observed bar
    html += `<rect x="${cx + 2}" y="${padT + chartH - obsH}" width="${barW}" height="${obsH}" fill="#06b6d4" opacity="0.85" rx="2"/>`;

    // Values on top
    if (g.exp >= 1) html += `<text x="${cx - barW/2 - 2}" y="${padT + chartH - expH - 3}" fill="#3b82f6" font-size="8" text-anchor="middle" opacity="0.7">${Math.round(g.exp)}</text>`;
    html += `<text x="${cx + barW/2 + 2}" y="${padT + chartH - obsH - 3}" fill="#06b6d4" font-size="8" text-anchor="middle">${Math.round(g.obs)}</text>`;

    // Label
    html += `<text x="${cx}" y="${padT + chartH + 14}" fill="#94a3b8" font-size="9.5" text-anchor="middle">${g.label}</text>`;

    // Deviation indicator
    if (g.exp > 5) {
      const dev = ((g.obs - g.exp) / g.exp * 100);
      if (Math.abs(dev) > 5) {
        const color = dev < 0 ? '#ef4444' : '#10b981';
        html += `<text x="${cx}" y="${padT + chartH + 26}" fill="${color}" font-size="8" text-anchor="middle" font-weight="600">${dev > 0 ? '+' : ''}${dev.toFixed(1)}%</text>`;
      }
    }
  });

  // Legend
  html += `<rect x="${padL}" y="4" width="8" height="8" fill="#3b82f6" opacity="0.4" rx="1"/>`;
  html += `<text x="${padL + 12}" y="11" fill="#64748b" font-size="9">Expected (HWE)</text>`;
  html += `<rect x="${padL + 100}" y="4" width="8" height="8" fill="#06b6d4" opacity="0.85" rx="1"/>`;
  html += `<text x="${padL + 112}" y="11" fill="#64748b" font-size="9">Observed (gnomAD)</text>`;

  // p/q info
  html += `<text x="${w - padR}" y="11" fill="#475569" font-size="9" text-anchor="end">p=${d.p.toFixed(4)} q=${d.q.toFixed(4)} n=${fmtNum(Math.round(d.n))}</text>`;

  svg.innerHTML = html;
}

function renderStats() {
  const d = getGenotypeData(currentVariant, currentPop);
  const row = document.getElementById('stats-row');

  const chi2Class = d.inHWE ? 'ok' : 'deviation';
  const hetDev = d.exp_ab > 5 ? ((d.obs_ab - d.exp_ab) / d.exp_ab * 100) : 0;
  const hetClass = Math.abs(hetDev) > 10 ? 'deviation' : 'ok';

  row.innerHTML = `
    <div class="stat ${chi2Class}">
      <div class="stat-value">${d.chi2.toFixed(2)}</div>
      <div class="stat-label">χ² ${d.inHWE ? '(in HWE)' : '(NOT HWE)'}</div>
    </div>
    <div class="stat ${hetClass}">
      <div class="stat-value">${hetDev > 0 ? '+' : ''}${hetDev.toFixed(1)}%</div>
      <div class="stat-label">Het deviation</div>
    </div>
    <div class="stat">
      <div class="stat-value">${(d.p * 100).toFixed(2)}%</div>
      <div class="stat-label">Allele freq</div>
    </div>
  `;
}

// ── Helpers ─────────────────────────────────────────────────────
function fmtNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return n.toString();
}

// ── Go ──────────────────────────────────────────────────────────
init();
