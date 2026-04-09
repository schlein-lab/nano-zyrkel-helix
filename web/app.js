// ── Variant Database (gnomAD v4 data) ───────────────────────────
// [total_alleles, alt_allele_count, homozygote_count]
const VARIANTS = {
  rs334: {
    name: 'rs334', gene: 'HBB', hgvs: 'c.20A>T (p.Glu7Val)',
    note: 'Sickle cell trait — heterozygote advantage against malaria. Fewer homozygotes than HWE predicts in African populations due to severe disease in homozygous state.',
    populations: {
      'Global':  [152312, 1098, 18], 'African': [41378, 946, 16],
      'European': [64090, 28, 0], 'South Asian': [30596, 104, 2],
      'East Asian': [19468, 2, 0], 'Latino': [17480, 18, 0],
    }
  },
  rs1801133: {
    name: 'rs1801133', gene: 'MTHFR', hgvs: 'c.665C>T (p.Ala222Val)',
    note: 'Common thermolabile variant. Homozygotes have reduced enzyme activity but generally tolerable. A good example where HWE holds well.',
    populations: {
      'Global':  [152166, 49608, 8470], 'European': [63996, 22720, 4082],
      'East Asian': [19434, 5640, 832], 'South Asian': [30560, 7632, 1040],
      'African': [20764, 5196, 354], 'Latino': [17412, 8420, 2162],
    }
  },
  rs6025: {
    name: 'rs6025', gene: 'F5', hgvs: 'c.1601G>A (p.Arg534Gln)',
    note: 'Factor V Leiden — most common inherited thrombophilia. ~5% carriers in Europeans. In HWE despite causing disease — incomplete penetrance.',
    populations: {
      'Global':  [151704, 3680, 46], 'European': [64012, 3258, 42],
      'South Asian': [30548, 296, 2], 'African': [20780, 34, 0],
      'East Asian': [19452, 4, 0], 'Latino': [16912, 88, 2],
    }
  },
  rs75961395: {
    name: 'rs75961395', gene: 'CFTR', hgvs: 'c.1521_1523del (p.Phe508del)',
    note: 'Most common CF mutation. ~1:25 carrier rate in Europeans. Homozygotes have cystic fibrosis — expect fewer homozygotes than HWE predicts.',
    populations: {
      'Global':  [140628, 2842, 6], 'European': [63748, 2318, 5],
      'South Asian': [30312, 142, 0], 'African': [19632, 102, 0],
      'East Asian': [9860, 4, 0], 'Latino': [17076, 276, 1],
    }
  },
  rs80357906: {
    name: 'rs80357906', gene: 'BRCA1', hgvs: 'c.5266dupC (5382insC)',
    note: 'Ashkenazi Jewish founder mutation for breast/ovarian cancer. ~1% carriers in that population. Too rare for HWE deviation to be detectable.',
    populations: {
      'Global':  [151832, 182, 0], 'European': [63938, 136, 0],
      'South Asian': [30522, 8, 0], 'African': [20716, 4, 0],
      'East Asian': [19436, 2, 0], 'Latino': [17220, 32, 0],
    }
  },
};

// ── State ───────────────────────────────────────────────────────
let manualP = 0.5;
let inbreedingF = 0;
let activeVariant = null; // null = manual mode
let activePop = 'Global';

// ── Init ────────────────────────────────────────────────────────
function init() {
  if (new URLSearchParams(location.search).has('embed')) {
    document.body.classList.add('embed');
  }

  const pSlider = document.getElementById('p-slider');
  const fSlider = document.getElementById('f-slider');

  pSlider.addEventListener('input', () => {
    manualP = parseFloat(pSlider.value);
    document.getElementById('p-val').textContent = manualP.toFixed(3);
    render();
  });

  fSlider.addEventListener('input', () => {
    inbreedingF = parseFloat(fSlider.value);
    document.getElementById('f-val').textContent = inbreedingF.toFixed(3);
    render();
  });

  document.querySelectorAll('.preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const vid = btn.dataset.variant;
      if (activeVariant === vid) {
        // Deselect — back to manual
        activeVariant = null;
        btn.classList.remove('active');
        document.getElementById('variant-detail').style.display = 'none';
      } else {
        activeVariant = vid;
        activePop = 'Global';
        document.querySelectorAll('.preset').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Set sliders to match variant's global frequency
        const v = VARIANTS[vid];
        const [AN, AC] = v.populations['Global'];
        manualP = AC / AN;
        pSlider.value = manualP;
        document.getElementById('p-val').textContent = manualP.toFixed(3);

        document.getElementById('variant-detail').style.display = '';
      }
      render();
    });
  });

  initSearch();
  render();
}

// ── HWE Math ────────────────────────────────────────────────────
function hweCalc(p, F) {
  const q = 1 - p;
  return {
    p, q,
    aa: q * q + F * p * q,        // ref homozygote
    ab: 2 * p * q * (1 - F),      // heterozygote
    bb: p * p + F * p * q,         // alt homozygote
  };
}

// ── Render ──────────────────────────────────────────────────────
function render() {
  renderFormula();
  renderChart();
  renderStats();
  if (activeVariant) renderVariantDetail();
}

function renderFormula() {
  const h = hweCalc(manualP, inbreedingF);
  const el = document.getElementById('formula');
  if (inbreedingF === 0) {
    el.textContent =
      `p=${h.p.toFixed(4)}  q=${h.q.toFixed(4)}\n` +
      `AA = p²   = ${(h.aa * 100).toFixed(2)}%\n` +
      `Aa = 2pq  = ${(h.ab * 100).toFixed(2)}%\n` +
      `aa = q²   = ${(h.bb * 100).toFixed(2)}%`;
  } else {
    el.textContent =
      `p=${h.p.toFixed(4)}  q=${h.q.toFixed(4)}  F=${inbreedingF.toFixed(3)}\n` +
      `AA = p²+Fpq   = ${(h.aa * 100).toFixed(2)}%\n` +
      `Aa = 2pq(1-F) = ${(h.ab * 100).toFixed(2)}%\n` +
      `aa = q²+Fpq   = ${(h.bb * 100).toFixed(2)}%`;
  }
}

function renderChart() {
  const h = hweCalc(manualP, inbreedingF);
  const svg = document.getElementById('hwe-chart');
  const w = 500, ht = 190, padL = 10, padR = 10, padT = 8, padB = 28;
  const chartW = w - padL - padR;
  const chartH = ht - padT - padB;

  // Stacked bar style — one bar for expected proportions
  const groups = [
    { label: 'AA', frac: h.aa, color: '#3b82f6' },
    { label: 'Aa', frac: h.ab, color: '#8b5cf6' },
    { label: 'aa', frac: h.bb, color: '#f59e0b' },
  ];

  let html = '';
  const barY = padT;
  const barH = 40;
  let x = padL;

  // Expected bar
  html += `<text x="${padL}" y="${barY - 1}" fill="#475569" font-size="9">Expected (HWE)</text>`;
  groups.forEach(g => {
    const segW = g.frac * chartW;
    if (segW > 1) {
      html += `<rect x="${x}" y="${barY}" width="${segW}" height="${barH}" fill="${g.color}" opacity="0.6"/>`;
      if (segW > 30) {
        html += `<text x="${x + segW/2}" y="${barY + barH/2 + 4}" fill="#fff" font-size="10" text-anchor="middle" font-weight="600">${g.label} ${(g.frac*100).toFixed(1)}%</text>`;
      }
    }
    x += segW;
  });

  // If variant active: observed bar below
  if (activeVariant) {
    const v = VARIANTS[activeVariant];
    const [AN, AC, hom] = v.populations[activePop];
    const n = AN / 2;
    const obsAb = AC - 2 * hom;
    const obsAa = n - obsAb - hom;

    const obsGroups = [
      { label: 'AA', count: obsAa, frac: obsAa / n, color: '#3b82f6' },
      { label: 'Aa', count: obsAb, frac: obsAb / n, color: '#8b5cf6' },
      { label: 'aa', count: hom, frac: hom / n, color: '#f59e0b' },
    ];

    const bar2Y = barY + barH + 18;
    html += `<text x="${padL}" y="${bar2Y - 1}" fill="#475569" font-size="9">Observed (gnomAD — ${activePop})</text>`;
    let x2 = padL;
    obsGroups.forEach(g => {
      const segW = g.frac * chartW;
      if (segW > 0.5) {
        html += `<rect x="${x2}" y="${bar2Y}" width="${segW}" height="${barH}" fill="${g.color}" opacity="0.9"/>`;
        if (segW > 30) {
          html += `<text x="${x2 + segW/2}" y="${bar2Y + barH/2 + 4}" fill="#fff" font-size="10" text-anchor="middle" font-weight="600">${g.label} ${(g.frac*100).toFixed(1)}%</text>`;
        }
      }
      x2 += segW;
    });

    // Deviation arrows between bars
    const midY = barY + barH + 9;
    const expH = hweCalc(AC / AN, inbreedingF);
    [
      { label: 'AA', exp: expH.aa, obs: obsAa/n, expX: expH.aa/2 },
      { label: 'Aa', exp: expH.ab, obs: obsAb/n, expX: expH.aa + expH.ab/2 },
      { label: 'aa', exp: expH.bb, obs: hom/n, expX: expH.aa + expH.ab + expH.bb/2 },
    ].forEach(g => {
      if (g.exp > 0.005) {
        const dev = ((g.obs - g.exp) / g.exp * 100);
        if (Math.abs(dev) > 3) {
          const cx = padL + g.expX * chartW;
          const color = dev < 0 ? '#ef4444' : '#10b981';
          html += `<text x="${cx}" y="${midY + 3}" fill="${color}" font-size="8" text-anchor="middle" font-weight="700">${dev > 0 ? '+' : ''}${dev.toFixed(1)}%</text>`;
        }
      }
    });
  } else {
    // Manual-only: show percentage breakdown larger
    const bar2Y = barY + barH + 24;
    html += `<text x="${w/2}" y="${bar2Y + 10}" fill="#475569" font-size="10" text-anchor="middle">Click a variant below to compare with real population data</text>`;
  }

  svg.innerHTML = html;
}

function renderStats() {
  const h = hweCalc(manualP, inbreedingF);
  const row = document.getElementById('stats-row');

  if (!activeVariant) {
    row.innerHTML = `
      <div class="stat"><div class="stat-value">${(h.aa * 100).toFixed(1)}%</div><div class="stat-label">AA (p²)</div></div>
      <div class="stat"><div class="stat-value">${(h.ab * 100).toFixed(1)}%</div><div class="stat-label">Aa (2pq)</div></div>
      <div class="stat"><div class="stat-value">${(h.bb * 100).toFixed(1)}%</div><div class="stat-label">aa (q²)</div></div>
    `;
    return;
  }

  const v = VARIANTS[activeVariant];
  const [AN, AC, hom] = v.populations[activePop];
  const n = AN / 2;
  const p = AC / AN;
  const obsAb = AC - 2 * hom;
  const obsAa = n - obsAb - hom;
  const expH = hweCalc(p, inbreedingF);

  const chi2 =
    (expH.aa * n > 0 ? (obsAa - expH.aa * n) ** 2 / (expH.aa * n) : 0) +
    (expH.ab * n > 0 ? (obsAb - expH.ab * n) ** 2 / (expH.ab * n) : 0) +
    (expH.bb * n > 0 ? (hom - expH.bb * n) ** 2 / (expH.bb * n) : 0);
  const inHWE = chi2 < 3.841;
  const hetDev = expH.ab * n > 5 ? ((obsAb - expH.ab * n) / (expH.ab * n) * 100) : 0;

  row.innerHTML = `
    <div class="stat ${inHWE ? 'ok' : 'deviation'}">
      <div class="stat-value">${chi2.toFixed(2)}</div>
      <div class="stat-label">chi2 ${inHWE ? '(HWE)' : '(not HWE)'}</div>
    </div>
    <div class="stat ${Math.abs(hetDev) > 10 ? 'deviation' : 'ok'}">
      <div class="stat-value">${hetDev > 0 ? '+' : ''}${hetDev.toFixed(1)}%</div>
      <div class="stat-label">Het deviation</div>
    </div>
    <div class="stat">
      <div class="stat-value">${(p * 100).toFixed(2)}%</div>
      <div class="stat-label">Allele freq (${activePop})</div>
    </div>
  `;
}

function renderVariantDetail() {
  const v = VARIANTS[activeVariant];

  // Info
  document.getElementById('variant-info').innerHTML = `
    <span class="var-name">${v.name}</span>
    <span class="var-gene">${v.gene} — ${v.hgvs}</span>
    <div class="var-note">${v.note}</div>
  `;

  // Pop tabs
  const tabs = document.getElementById('pop-tabs');
  tabs.innerHTML = Object.keys(v.populations).map(pop =>
    `<button class="pop-tab ${pop === activePop ? 'active' : ''}" data-pop="${pop}">${pop}</button>`
  ).join('');
  tabs.querySelectorAll('.pop-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activePop = tab.dataset.pop;
      // Update p slider to this population
      const [AN, AC] = v.populations[activePop];
      manualP = AC / AN;
      document.getElementById('p-slider').value = manualP;
      document.getElementById('p-val').textContent = manualP.toFixed(3);
      render();
    });
  });

  // Obs vs Exp table
  const [AN, AC, hom] = v.populations[activePop];
  const n = AN / 2;
  const p = AC / AN;
  const obsAb = AC - 2 * hom;
  const obsAa = n - obsAb - hom;
  const exp = hweCalc(p, inbreedingF);

  function devCell(obs, exp) {
    if (exp < 1) return '<td>-</td>';
    const d = ((obs - exp) / exp * 100);
    const cls = d < -5 ? 'dev-neg' : d > 5 ? 'dev-pos' : '';
    return `<td class="${cls}">${d > 0 ? '+' : ''}${d.toFixed(1)}%</td>`;
  }

  const chi2 =
    (exp.aa * n > 0 ? (obsAa - exp.aa * n) ** 2 / (exp.aa * n) : 0) +
    (exp.ab * n > 0 ? (obsAb - exp.ab * n) ** 2 / (exp.ab * n) : 0) +
    (exp.bb * n > 0 ? (hom - exp.bb * n) ** 2 / (exp.bb * n) : 0);

  document.getElementById('obs-vs-exp').innerHTML = `
    <table class="obs-table">
      <tr><th></th><th>Observed</th><th>Expected</th><th>Dev</th></tr>
      <tr><td>AA</td><td>${Math.round(obsAa)}</td><td>${Math.round(exp.aa * n)}</td>${devCell(obsAa, exp.aa * n)}</tr>
      <tr><td>Aa</td><td>${Math.round(obsAb)}</td><td>${Math.round(exp.ab * n)}</td>${devCell(obsAb, exp.ab * n)}</tr>
      <tr><td>aa</td><td>${Math.round(hom)}</td><td>${Math.round(exp.bb * n)}</td>${devCell(hom, exp.bb * n)}</tr>
      <tr class="chi-row"><td>chi2</td><td colspan="2">${chi2.toFixed(4)}</td><td>${chi2 < 3.841 ? '<span class="dev-pos">HWE</span>' : '<span class="dev-neg">not HWE</span>'}</td></tr>
    </table>
    <div style="font-size:0.65rem;color:var(--text-dim);margin-top:0.3rem;">n=${fmtNum(Math.round(n))} individuals | AN=${fmtNum(AN)} alleles | Source: gnomAD v4</div>
  `;
}

// ── Search ──────────────────────────────────────────────────────
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
  input.addEventListener('blur', () => setTimeout(() => ac.classList.remove('open'), 200));
}

async function searchGene(query) {
  const ac = document.getElementById('autocomplete');
  try {
    const res = await fetch(`${VUS_API}/data/index.json`);
    const data = await res.json();
    // gene_breakdowns has all genes: { "BRCA1": { total: 1234, ... }, ... }
    const gb = data.gene_breakdowns || {};
    const genes = Object.entries(gb).map(([gene, info]) => ({ gene, total: info.total }));
    const q_lower = query.toLowerCase();
    const matches = genes
      .filter(g => g.gene.toLowerCase().includes(q_lower))
      .sort((a, b) => {
        // Prioritize starts-with, then by total variants
        const aStarts = a.gene.toLowerCase().startsWith(q_lower) ? 1 : 0;
        const bStarts = b.gene.toLowerCase().startsWith(q_lower) ? 1 : 0;
        return bStarts - aStarts || b.total - a.total;
      })
      .slice(0, 8);
    if (matches.length === 0) {
      ac.innerHTML = '<div class="ac-item"><span class="gene" style="color:var(--text-dim)">No results</span></div>';
    } else {
      ac.innerHTML = matches.map(g =>
        `<div class="ac-item" data-gene="${g.gene}"><span class="gene">${g.gene}</span><span class="count">${fmtNum(g.total)} variants</span></div>`
      ).join('');
      ac.querySelectorAll('.ac-item[data-gene]').forEach(item => {
        item.addEventListener('mousedown', () => {
          document.getElementById('gene-search').value = item.dataset.gene;
          ac.classList.remove('open');
          const match = Object.values(VARIANTS).find(v => v.gene === item.dataset.gene);
          if (match) {
            activeVariant = match.name;
            activePop = 'Global';
            document.querySelectorAll('.preset').forEach(b => b.classList.toggle('active', b.dataset.variant === match.name));
            const [AN, AC] = match.populations['Global'];
            manualP = AC / AN;
            document.getElementById('p-slider').value = manualP;
            document.getElementById('p-val').textContent = manualP.toFixed(3);
            document.getElementById('variant-detail').style.display = '';
            render();
          } else {
            openGnomadPanel(item.dataset.gene);
          }
        });
      });
    }
    ac.classList.add('open');
  } catch (e) {
    ac.innerHTML = '<div class="ac-item"><span style="color:var(--text-dim)">Search unavailable</span></div>';
    ac.classList.add('open');
  }
}

// ── Variant Finder Panel ────────────────────────────────────────
const GNOMAD_API = 'https://gnomad.broadinstitute.org/api';
const VUS_TRACKER_API = 'https://vus.zyrkel.com/api/v1';
const VUS_TRACKER_KEY = '781a2daba1bac1a74bcf3e58a630732fb3a63fec9dcb232b623e4cc5c8491ec4';

let panelVariants = []; // cached variants for current gene

function openGnomadPanel(gene) {
  const panel = document.getElementById('gnomad-panel');
  document.getElementById('gnomad-gene').textContent = gene + ' — Variant Finder';
  document.getElementById('gnomad-input').value = '';
  document.getElementById('gnomad-status').textContent = 'Loading variants from ClinVar...';
  document.getElementById('gnomad-status').className = 'gnomad-status';
  document.getElementById('gnomad-results').innerHTML = '';
  document.getElementById('variant-detail').style.display = 'none';
  panel.style.display = '';
  panel.dataset.gene = gene;
  panelVariants = [];

  document.getElementById('gnomad-close').onclick = () => { panel.style.display = 'none'; };

  // Filter input
  const input = document.getElementById('gnomad-input');
  input.oninput = () => renderPanelVariants(input.value.trim());
  input.onkeydown = (e) => {
    if (e.key === 'Enter') {
      const q = input.value.trim();
      if (q.startsWith('rs') || q.match(/^\d+-\d+-[ACGT]+-[ACGT]+$/)) {
        fetchGnomadDirect(q, gene);
      }
    }
  };

  // Fetch button for direct gnomAD queries
  document.getElementById('gnomad-fetch').onclick = () => {
    const q = input.value.trim();
    if (q.startsWith('rs') || q.match(/^\d+-\d+-[ACGT]+-[ACGT]+$/i)) {
      fetchGnomadDirect(q, gene);
    }
  };

  // Load variants from VUS Tracker
  loadVusTrackerVariants(gene);
}

async function loadVusTrackerVariants(gene) {
  const status = document.getElementById('gnomad-status');
  try {
    const res = await fetch(`${VUS_TRACKER_API}/genes/${gene}/variants?api_key=${VUS_TRACKER_KEY}&per_page=50`);
    const data = await res.json();
    panelVariants = (data.data || []).map(v => ({
      hgvs: v.hgvs || '',
      classification: v.classification || '',
      chr: v.chromosome,
      pos: v.position,
      ref: v.ref_allele,
      alt: v.alt_allele,
      condition: v.condition || '',
      gnomadId: v.chromosome && v.position ? `${v.chromosome}-${v.position}-${v.ref_allele}-${v.alt_allele}` : null,
    }));

    status.textContent = `${panelVariants.length} variants loaded. Filter by c. or p. nomenclature:`;
    status.className = 'gnomad-status ok';
    renderPanelVariants('');
  } catch (e) {
    status.textContent = `Could not load variants: ${e.message}`;
    status.className = 'gnomad-status error';
  }
}

function renderPanelVariants(filter) {
  const results = document.getElementById('gnomad-results');
  const gene = document.getElementById('gnomad-panel').dataset.gene;
  const f = filter.toLowerCase();

  let filtered = panelVariants;
  if (f) {
    filtered = panelVariants.filter(v =>
      v.hgvs.toLowerCase().includes(f) ||
      v.classification.toLowerCase().includes(f) ||
      v.condition.toLowerCase().includes(f)
    );
  }

  const shown = filtered.slice(0, 12);

  if (shown.length === 0 && f) {
    results.innerHTML = `<div style="font-size:0.75rem;color:var(--text-dim);padding:0.3rem 0;">
      No matches. ${f.startsWith('rs') || f.match(/^\d+-/) ? '<br>Press Enter or click Fetch to query gnomAD directly.' : ''}
    </div>`;
    return;
  }

  const classColors = {
    pathogenic: '#ef4444', likely_pathogenic: '#f97316',
    uncertain_significance: '#f59e0b', likely_benign: '#a3e635',
    benign: '#10b981', conflicting: '#8b5cf6',
  };

  results.innerHTML = shown.map((v, i) => {
    // Extract short HGVS (c. and p. parts)
    const hgvsShort = v.hgvs.replace(/^[^:]+:/, '');
    const clsColor = classColors[v.classification] || '#64748b';
    const clsLabel = v.classification.replace('_', ' ').replace('uncertain significance', 'VUS');

    return `<div class="gnomad-result-item" data-idx="${i}">
      <div style="min-width:0;overflow:hidden;">
        <div class="rsid" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${v.hgvs}">${hgvsShort}</div>
        <div class="consequence">
          <span style="color:${clsColor}">${clsLabel}</span>
          ${v.gnomadId ? ` · ${v.gnomadId}` : ''}
        </div>
      </div>
      <button class="use-btn" ${v.gnomadId ? '' : 'disabled title="No genomic coordinates"'}>gnomAD</button>
    </div>`;
  }).join('');

  if (filtered.length > 12) {
    results.innerHTML += `<div style="font-size:0.7rem;color:var(--text-dim);padding:0.2rem 0;text-align:center;">${filtered.length - 12} more — refine your search</div>`;
  }

  results.querySelectorAll('.use-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.closest('.gnomad-result-item').dataset.idx);
      const v = filtered[idx];
      if (v?.gnomadId) fetchGnomadByCoords(v.gnomadId, gene, v.hgvs);
    });
  });
}

async function fetchGnomadByCoords(variantId, gene, hgvsLabel) {
  const status = document.getElementById('gnomad-status');
  status.textContent = `Fetching ${variantId} from gnomAD...`;
  status.className = 'gnomad-status';

  const gqlQuery = `{
    variant(variantId: "${variantId}", dataset: gnomad_r4) {
      variant_id rsids pos ref alt
      exome { ac an homozygote_count populations { id ac an homozygote_count } }
      genome { ac an homozygote_count populations { id ac an homozygote_count } }
    }
  }`;

  try {
    const res = await fetch(GNOMAD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: gqlQuery }),
    });
    const data = await res.json();
    const v = data?.data?.variant;

    if (!v) {
      status.textContent = `Not found in gnomAD. Variant may be too rare or not in gnomAD v4.`;
      status.className = 'gnomad-status error';
      return;
    }

    const d = mergeExomeGenome(v);
    if (d.an === 0) {
      status.textContent = `Found but no allele count data.`;
      status.className = 'gnomad-status error';
      return;
    }

    status.textContent = `Loaded! ${fmtNum(d.an)} alleles.`;
    status.className = 'gnomad-status ok';
    loadGnomadVariant({ ...v, ...d, hgvsLabel }, gene);
  } catch (e) {
    status.textContent = `gnomAD error: ${e.message}`;
    status.className = 'gnomad-status error';
  }
}

async function fetchGnomadDirect(query, gene) {
  const status = document.getElementById('gnomad-status');
  const btn = document.getElementById('gnomad-fetch');
  btn.disabled = true;
  status.textContent = `Fetching ${query} from gnomAD...`;

  let field = query.startsWith('rs') ? 'rsid' : 'variantId';
  const gqlQuery = `{
    variant(${field}: "${query}", dataset: gnomad_r4) {
      variant_id rsids pos ref alt
      exome { ac an homozygote_count populations { id ac an homozygote_count } }
      genome { ac an homozygote_count populations { id ac an homozygote_count } }
    }
  }`;

  try {
    const res = await fetch(GNOMAD_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: gqlQuery }),
    });
    const data = await res.json();
    const v = data?.data?.variant;
    if (!v) { status.textContent = `"${query}" not found in gnomAD.`; status.className = 'gnomad-status error'; btn.disabled = false; return; }
    const d = mergeExomeGenome(v);
    if (d.an === 0) { status.textContent = `Found but no frequency data.`; status.className = 'gnomad-status error'; btn.disabled = false; return; }
    status.className = 'gnomad-status ok';
    status.textContent = `Loaded ${v.rsids?.[0] || v.variant_id}!`;
    loadGnomadVariant({ ...v, ...d }, gene);
  } catch (e) {
    status.textContent = `Error: ${e.message}`;
    status.className = 'gnomad-status error';
  }
  btn.disabled = false;
}

function mergeExomeGenome(v) {
  // Combine exome + genome data
  const ex = v.exome || { ac: 0, an: 0, homozygote_count: 0, populations: [] };
  const gn = v.genome || { ac: 0, an: 0, homozygote_count: 0, populations: [] };

  const ac = (ex.ac || 0) + (gn.ac || 0);
  const an = (ex.an || 0) + (gn.an || 0);
  const hom = (ex.homozygote_count || 0) + (gn.homozygote_count || 0);

  // Merge populations
  const popMap = {};
  const POP_NAMES = {
    afr: 'African', amr: 'Latino', eas: 'East Asian',
    nfe: 'European', sas: 'South Asian', fin: 'Finnish',
    asj: 'Ashkenazi', mid: 'Middle Eastern', ami: 'Amish',
  };

  [...(ex.populations || []), ...(gn.populations || [])].forEach(p => {
    const id = p.id.toLowerCase().replace('gnomad_', '');
    if (!POP_NAMES[id]) return;
    if (!popMap[id]) popMap[id] = { an: 0, ac: 0, hom: 0 };
    popMap[id].an += p.an || 0;
    popMap[id].ac += p.ac || 0;
    popMap[id].hom += p.homozygote_count || 0;
  });

  const populations = { Global: [an, ac, hom] };
  Object.entries(popMap).forEach(([id, d]) => {
    if (d.an > 0) populations[POP_NAMES[id]] = [d.an, d.ac, d.hom];
  });

  return { ac, an, hom, populations };
}

function loadGnomadVariant(v, gene) {
  const rsid = v.rsids?.[0] || v.variant_id;
  const vid = v.variant_id || '';
  const hgvs = v.hgvsLabel || vid;

  // Create a dynamic variant entry
  const key = '_gnomad_' + rsid;
  VARIANTS[key] = {
    name: rsid,
    gene: gene,
    hgvs: hgvs.replace(/^[^:]+:/, ''), // short form
    note: `Live data from gnomAD v4. ${fmtNum(v.an)} alleles, ${fmtNum(v.ac)} alternate, ${v.hom} homozygotes globally.`,
    populations: v.populations,
  };

  // Activate it
  activeVariant = key;
  activePop = 'Global';
  document.querySelectorAll('.preset').forEach(b => b.classList.remove('active'));

  const [AN, AC] = v.populations['Global'];
  manualP = AC / AN;
  document.getElementById('p-slider').value = manualP;
  document.getElementById('p-val').textContent = manualP.toFixed(3);

  document.getElementById('gnomad-panel').style.display = 'none';
  document.getElementById('variant-detail').style.display = '';
  render();
}

// ── Helpers ─────────────────────────────────────────────────────
function fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'k';
  return n.toString();
}

// ── Go ──────────────────────────────────────────────────────────
init();
