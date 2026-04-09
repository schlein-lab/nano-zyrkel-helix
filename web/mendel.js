// ── Mendel Lab ──────────────────────────────────────────────────

const DISEASE_PRESETS = {
  cf: {
    name: 'Cystic Fibrosis', gene: 'CFTR', variant: 'p.Phe508del',
    inheritance: 'ar', p1: 'Aa', p2: 'Aa',
    info: '~1:25 carrier rate in Europeans. Both parents carriers → 25% risk.',
  },
  sickle: {
    name: 'Sickle Cell Disease', gene: 'HBB', variant: 'p.Glu7Val',
    inheritance: 'ar', p1: 'Aa', p2: 'Aa',
    info: 'Carrier advantage against malaria. Aa × Aa → 25% SCD, 50% trait.',
  },
  huntington: {
    name: "Huntington's Disease", gene: 'HTT', variant: 'CAG expansion',
    inheritance: 'ad', p1: 'Aa', p2: 'AA',
    info: 'One affected parent (Aa) → 50% risk for each child. Full penetrance.',
  },
  brca1: {
    name: 'BRCA1 Cancer Risk', gene: 'BRCA1', variant: 'c.5266dupC',
    inheritance: 'ad', p1: 'Aa', p2: 'AA', penetrance: 70,
    info: 'Inherited cancer predisposition. ~70% penetrance for breast cancer by age 80.',
  },
  hemophilia: {
    name: 'Hemophilia A', gene: 'F8', variant: 'various',
    inheritance: 'xr', p1: 'Aa', p2: 'AA',
    info: 'X-linked recessive. Carrier mother → 50% sons affected, 50% daughters carriers.',
  },
  duchenne: {
    name: 'Duchenne MD', gene: 'DMD', variant: 'exon deletions',
    inheritance: 'xr', p1: 'Aa', p2: 'AA',
    info: 'X-linked recessive. ~1:3500 male births. Carrier mothers usually unaffected.',
  },
};

// ── State ───────────────────────────────────────────────────────
let inheritance = 'ar';
let p1geno = 'AA';
let p2geno = 'Aa';
let penetrance = 100;
let currentMode = 'cross';
let pedigreeChildren = [];
let quizIndex = 0;
let activePreset = null;
let mitoHeteroplasmy = 50; // 0-100% mother
let mitoFatherHetero = 30; // 0-100% father (irrelevant, educational)

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
      if (currentMode === 'pedigree') renderPedigree();
      if (currentMode === 'quiz') loadQuiz();
    });
  });

  // Inheritance
  document.getElementById('inheritance').addEventListener('change', (e) => {
    inheritance = e.target.value;
    updateGenoButtons();
    render();
  });

  // Parent genotype buttons
  ['parent1', 'parent2'].forEach((pid, idx) => {
    document.getElementById(pid).querySelectorAll('.geno-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById(pid).querySelectorAll('.geno-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (idx === 0) p1geno = btn.dataset.g;
        else p2geno = btn.dataset.g;
        activePreset = null;
        document.querySelectorAll('.vpreset').forEach(b => b.classList.remove('active'));
        render();
      });
    });
  });

  // Penetrance
  document.getElementById('pen-slider').addEventListener('input', (e) => {
    penetrance = parseInt(e.target.value);
    document.getElementById('pen-val').textContent = penetrance + '%';
    render();
  });

  // Variant presets
  document.querySelectorAll('.vpreset').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = DISEASE_PRESETS[btn.dataset.v];
      if (!d) return;
      activePreset = btn.dataset.v;
      document.querySelectorAll('.vpreset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      inheritance = d.inheritance;
      document.getElementById('inheritance').value = inheritance;
      p1geno = d.p1;
      p2geno = d.p2;
      penetrance = d.penetrance || 100;
      document.getElementById('pen-slider').value = penetrance;
      document.getElementById('pen-val').textContent = penetrance + '%';
      updateGenoButtons();
      render();
    });
  });

  // Pedigree buttons
  document.getElementById('ped-add').addEventListener('click', addPedigreeChild);
  document.getElementById('ped-reset').addEventListener('click', () => {
    pedigreeChildren = [];
    renderPedigree();
  });

  updateGenoButtons();
  render();
}

function updateGenoButtons() {
  const isX = inheritance === 'xr' || inheritance === 'xd';
  const isMito = inheritance === 'mito';

  // For X-linked: parent2 is father with hemizygous genotypes
  ['parent1', 'parent2'].forEach((pid, idx) => {
    const card = document.getElementById(pid);
    const btns = card.querySelectorAll('.geno-btn');
    if (isX && idx === 1) {
      // Father: only A or a (hemizygous)
      btns[0].textContent = 'XᴬY'; btns[0].dataset.g = 'XAY';
      btns[1].style.display = 'none';
      btns[2].textContent = 'XᵃY'; btns[2].dataset.g = 'XaY';
      card.querySelector('.parent-label').textContent = 'Father';
    } else if (isX && idx === 0) {
      btns[0].textContent = 'XᴬXᴬ'; btns[0].dataset.g = 'AA';
      btns[1].style.display = ''; btns[1].textContent = 'XᴬXᵃ'; btns[1].dataset.g = 'Aa';
      btns[2].textContent = 'XᵃXᵃ'; btns[2].dataset.g = 'aa';
      card.querySelector('.parent-label').textContent = 'Mother';
    } else if (isMito) {
      // Mitochondrial: show heteroplasmy slider for mother, nothing for father
      btns.forEach(b => b.style.display = 'none');
      if (idx === 0) {
        card.querySelector('.parent-label').textContent = 'Mother (mitochondrial)';
        if (!card.querySelector('.mito-slider')) {
          const sl = document.createElement('div');
          sl.className = 'mito-slider';
          sl.innerHTML = `
            <select id="mito-disease-select" style="width:100%;background:var(--bg-card);border:1px solid var(--border);color:var(--text);padding:0.2rem 0.4rem;border-radius:4px;font-size:0.72rem;font-family:inherit;margin-bottom:0.3rem;">
              ${Object.entries(MITO_DISEASES).map(([k, d]) => `<option value="${k}" ${k === mitoDisease ? 'selected' : ''}>${d.name}</option>`).join('')}
            </select>
            <label style="font-size:0.7rem;color:var(--text-muted);display:flex;justify-content:space-between;">Heteroplasmy (blood) <span class="val" id="hetero-val">${mitoHeteroplasmy}%</span></label>
            <input type="range" id="hetero-slider" min="0" max="100" step="1" value="${mitoHeteroplasmy}">
            <div style="display:flex;justify-content:space-between;font-size:0.6rem;color:var(--text-dim);"><span>0% wildtype</span><span>100% mutant</span></div>`;
          card.querySelector('.parent-geno').after(sl);
          document.getElementById('hetero-slider').addEventListener('input', (e) => {
            mitoHeteroplasmy = parseInt(e.target.value);
            document.getElementById('hetero-val').textContent = mitoHeteroplasmy + '%';
            render();
          });
          document.getElementById('mito-disease-select').addEventListener('change', (e) => {
            mitoDisease = e.target.value;
            render();
          });
        }
      } else {
        card.querySelector('.parent-label').textContent = 'Father (mitochondrial)';
        if (!card.querySelector('.mito-slider')) {
          const sl = document.createElement('div');
          sl.className = 'mito-slider';
          sl.innerHTML = `<label style="font-size:0.7rem;color:var(--text-muted);display:flex;justify-content:space-between;">Heteroplasmy <span class="val" id="hetero-father-val">${mitoFatherHetero}%</span></label>
            <input type="range" id="hetero-father-slider" min="0" max="100" step="1" value="${mitoFatherHetero}">
            <div style="font-size:0.6rem;color:var(--text-dim);font-style:italic;margin-top:0.15rem;">&#9432; Father's mt-DNA is not inherited by children</div>`;
          card.querySelector('.parent-geno').after(sl);
          document.getElementById('hetero-father-slider').addEventListener('input', (e) => {
            mitoFatherHetero = parseInt(e.target.value);
            document.getElementById('hetero-father-val').textContent = mitoFatherHetero + '%';
            render(); // re-render but outcome won't change — that's the point
          });
        }
      }
    } else {
      // Remove mito slider if switching away
      document.querySelectorAll('.mito-slider').forEach(s => s.remove());
      btns.forEach(b => b.style.display = '');
      btns[0].textContent = 'AA'; btns[0].dataset.g = 'AA';
      btns[1].style.display = ''; btns[1].textContent = 'Aa'; btns[1].dataset.g = 'Aa';
      btns[2].textContent = 'aa'; btns[2].dataset.g = 'aa';
      card.querySelector('.parent-label').textContent = idx === 0 ? 'Parent 1' : 'Parent 2';
    }

    // Re-select active
    const current = idx === 0 ? p1geno : p2geno;
    btns.forEach(b => b.classList.toggle('active', b.dataset.g === current));
  });
}

// ── Cross Calculation ───────────────────────────────────────────
function calcCross() {
  const isX = inheritance === 'xr' || inheritance === 'xd';
  const isDom = inheritance === 'ad' || inheritance === 'xd';

  if (isX) return calcXLinked();
  if (inheritance === 'mito') return calcMito();

  // Autosomal
  const g1 = genoAlleles(p1geno);
  const g2 = genoAlleles(p2geno);
  const outcomes = {};

  for (const a1 of g1) {
    for (const a2 of g2) {
      const g = [a1, a2].sort().join('');
      const normalized = g === 'Aa' || g === 'aA' ? 'Aa' : g;
      outcomes[normalized] = (outcomes[normalized] || 0) + 1;
    }
  }

  const total = Object.values(outcomes).reduce((a, b) => a + b, 0);
  const result = [];
  for (const [geno, count] of Object.entries(outcomes)) {
    const prob = count / total;
    const affected = isDom ? (geno !== 'AA' ? false : true) : true;
    // For recessive: aa = affected. For dominant: Aa or aa = affected
    let status;
    if (isDom) {
      status = (geno === 'Aa' || geno === 'aa') ? 'affected' : 'unaffected';
    } else {
      status = geno === 'aa' ? 'affected' : geno === 'Aa' ? 'carrier' : 'unaffected';
    }
    result.push({ geno, prob, status, count });
  }

  return { outcomes: result, total, punnett: { g1, g2 } };
}

function calcXLinked() {
  const isDom = inheritance === 'xd';
  const motherAlleles = genoAlleles(p1geno); // [X^A, X^a] etc
  const fatherX = p2geno === 'XAY' ? 'A' : 'a';

  const outcomes = {};
  // Daughters get X from father + X from mother
  // Sons get Y from father + X from mother
  for (const m of motherAlleles) {
    // Daughter
    const dg = [m, fatherX].sort().join('');
    const dk = 'X' + dg;
    outcomes[dk] = outcomes[dk] || { geno: dg, sex: 'F', count: 0 };
    outcomes[dk].count++;
    // Son
    const sk = m + 'Y';
    outcomes[sk] = outcomes[sk] || { geno: m, sex: 'M', count: 0 };
    outcomes[sk].count++;
  }

  const total = Object.values(outcomes).reduce((a, b) => a + b.count, 0);
  const result = [];
  for (const [key, v] of Object.entries(outcomes)) {
    const prob = v.count / total;
    let status;
    if (v.sex === 'M') {
      status = v.geno === 'a' ? 'affected' : 'unaffected';
    } else {
      if (isDom) status = (v.geno === 'Aa' || v.geno === 'aA' || v.geno === 'aa') ? 'affected' : 'unaffected';
      else status = v.geno === 'aa' ? 'affected' : v.geno.includes('a') ? 'carrier' : 'unaffected';
    }
    const label = v.sex === 'M' ? `${v.geno}Y ♂` : `X${v.geno} ♀`;
    result.push({ geno: label, prob, status, count: v.count });
  }

  return { outcomes: result, total, punnett: { g1: motherAlleles, g2: [fatherX, 'Y'] } };
}

// Mitochondrial disease models
// Threshold and severity relationship vary greatly between diseases
const MITO_DISEASES = {
  general: {
    name: 'General (no specific disease)',
    info: 'Threshold and severity vary widely between mt-DNA mutations. No single threshold applies to all mitochondrial diseases.',
    model: 'none', // no threshold line shown
  },
  melas: {
    name: 'MELAS (m.3243A>G)',
    info: 'Highly variable expressivity. Symptoms reported at heteroplasmy as low as 10-20%. Severity correlates roughly with heteroplasmy but with wide overlap between affected and unaffected.',
    model: 'gradual', // gradual increase, no sharp threshold
    riskAt: [[0, 0], [10, 0.05], [30, 0.3], [50, 0.6], [70, 0.85], [90, 0.95], [100, 1.0]],
  },
  narp: {
    name: 'NARP/Leigh (m.8993T>G)',
    info: 'Relatively sharp threshold. <70% heteroplasmy usually asymptomatic. 70-90% causes NARP. >90% causes severe Leigh syndrome.',
    model: 'threshold',
    riskAt: [[0, 0], [60, 0], [70, 0.2], [80, 0.7], [90, 0.95], [100, 1.0]],
  },
  lhon: {
    name: 'LHON (m.11778G>A)',
    info: 'Incomplete penetrance even at homoplasmy (100%). ~50% males, ~15% females affected at 100%. Threshold effect above ~70% but highly sex-dependent.',
    model: 'incomplete',
    riskAt: [[0, 0], [60, 0], [70, 0.05], [80, 0.15], [90, 0.25], [100, 0.35]], // averaged M+F
  },
  merrf: {
    name: 'MERRF (m.8344A>G)',
    info: 'Progressive severity with increasing heteroplasmy. Myoclonus and seizures typically above 50-60%, but mild symptoms can appear earlier.',
    model: 'gradual',
    riskAt: [[0, 0], [30, 0.05], [50, 0.2], [60, 0.5], [80, 0.8], [100, 1.0]],
  },
};

let mitoDisease = 'general';

// ── Mitochondrial Bottleneck Model ──────────────────────────────
// The mitochondrial genetic bottleneck (~100-200 mt-DNA copies in
// primordial germ cells) causes massive stochastic redistribution.
// A mother with 50% heteroplasmy can have children ranging from
// ~5% to ~95%. This is modeled as a Beta-Binomial distribution.
//
// Key parameter: bottleneck size (N). Smaller N = more variance.
// Empirical estimates: N ~ 100-200 (Cree et al. 2008, Wilson et al. 2016)

function betaBinomialChildDistribution(motherH, bottleneckN) {
  // Generate probability distribution of child heteroplasmy
  // given mother's heteroplasmy (h) and bottleneck size (N).
  //
  // Child heteroplasmy follows approximately Beta(h*N, (1-h)*N)
  // which we discretize into bins of 5%.
  const bins = 21; // 0%, 5%, 10%, ..., 100%
  const probs = new Array(bins).fill(0);

  if (motherH <= 0) { probs[0] = 1; return probs; }
  if (motherH >= 1) { probs[bins - 1] = 1; return probs; }

  const alpha = motherH * bottleneckN;
  const beta = (1 - motherH) * bottleneckN;

  // Compute Beta distribution PDF at each bin center
  let total = 0;
  for (let i = 0; i < bins; i++) {
    const x = i / (bins - 1);
    // Use log-beta PDF to avoid overflow
    const lp = (alpha - 1) * Math.log(Math.max(x, 1e-10)) +
               (beta - 1) * Math.log(Math.max(1 - x, 1e-10));
    probs[i] = Math.exp(lp);
    total += probs[i];
  }
  // Normalize
  if (total > 0) for (let i = 0; i < bins; i++) probs[i] /= total;
  return probs;
}

function calcMito() {
  const h = mitoHeteroplasmy / 100;
  const disease = MITO_DISEASES[mitoDisease];
  const bottleneckN = 150; // typical estimate

  // Get child heteroplasmy distribution
  const childDist = betaBinomialChildDistribution(h, bottleneckN);

  // Summary: any child with mutant mt-DNA > 0% is a carrier at minimum
  // Risk depends on disease model
  let pZero = childDist[0] || 0; // prob child gets 0% (only if mother ~0%)
  let pAny = 1 - pZero; // prob child has ANY mutant load

  // We do NOT calculate disease risk — it depends on tissue distribution,
  // nuclear modifiers, age, environment, and more. Only the heteroplasmy
  // transmission can be modeled genetically.
  const outcomes = [];
  if (pZero > 0.01) outcomes.push({ geno: 'homoplasmic wt', prob: pZero, status: 'unaffected', count: 1 });
  if (pAny > 0.01) outcomes.push({ geno: 'carries mutant mt-DNA', prob: pAny, status: 'carrier', count: 1 });

  if (outcomes.length === 0) {
    outcomes.push({ geno: `~${Math.round(h * 100)}%`, prob: 1, status: h > 0 ? 'carrier' : 'unaffected', count: 1 });
  }

  return {
    outcomes,
    total: 1,
    punnett: null,
    mitoInfo: disease.info,
    mitoDisease: disease,
    childDist,
  };
}

function interpolateRisk(curve, pct) {
  if (pct <= curve[0][0]) return curve[0][1];
  if (pct >= curve[curve.length - 1][0]) return curve[curve.length - 1][1];
  for (let i = 0; i < curve.length - 1; i++) {
    if (pct >= curve[i][0] && pct <= curve[i + 1][0]) {
      const t = (pct - curve[i][0]) / (curve[i + 1][0] - curve[i][0]);
      return curve[i][1] + t * (curve[i + 1][1] - curve[i][1]);
    }
  }
  return 0;
}

function genoAlleles(g) {
  if (g === 'AA') return ['A', 'A'];
  if (g === 'Aa') return ['A', 'a'];
  if (g === 'aa') return ['a', 'a'];
  if (g === 'XAY') return ['A'];
  if (g === 'XaY') return ['a'];
  return ['A', 'a'];
}

// ── Render ──────────────────────────────────────────────────────
function render() {
  const cross = calcCross();
  renderPhenotypes();
  renderPunnett(cross);
  renderOffspring(cross);
}

function renderPhenotypes() {
  const isDom = inheritance === 'ad' || inheritance === 'xd';
  const isMito = inheritance === 'mito';

  if (isMito) {
    const h = mitoHeteroplasmy;
    document.getElementById('p1-pheno').innerHTML = `<span style="color:var(--accent)">${h}% heteroplasmy</span><br><span style="color:var(--text-dim);font-size:0.6rem;">measured in blood (varies by tissue)</span>`;
    document.getElementById('p2-pheno').innerHTML = `<span style="color:var(--text-muted)">${mitoFatherHetero}% heteroplasmy</span><br><span style="color:var(--text-dim);font-size:0.6rem;">not passed to children</span>`;
    return;
  }

  function phenoText(g, isParent2) {
    const isX = inheritance === 'xr' || inheritance === 'xd';
    if (isX && isParent2) {
      return g === 'XaY' ? `<span style="color:var(--danger)">Affected ♂</span>` : `<span style="color:var(--success)">Unaffected ♂</span>`;
    }
    if (isDom) {
      return g === 'AA' ? `<span style="color:var(--success)">Unaffected</span>` : `<span style="color:var(--danger)">Affected</span>`;
    } else {
      if (g === 'aa') return `<span style="color:var(--danger)">Affected</span>`;
      if (g === 'Aa') return `<span style="color:var(--warning)">Carrier</span>`;
      return `<span style="color:var(--success)">Unaffected</span>`;
    }
  }

  document.getElementById('p1-pheno').innerHTML = phenoText(p1geno, false);
  document.getElementById('p2-pheno').innerHTML = phenoText(p2geno, true);
}

function renderPunnett(cross) {
  const svg = document.getElementById('punnett');
  if (!cross.punnett) {
    const childDist = cross.childDist || [];
    const w = 460, ht = 220;
    let html = '';

    // Title
    html += `<text x="${w/2}" y="14" fill="#94a3b8" font-size="10" text-anchor="middle" font-weight="600">Predicted child heteroplasmy distribution (bottleneck model)</text>`;

    // Histogram of child heteroplasmy
    const histX = 40, histY = 28, histW = w - 80, histH = 90;
    const maxP = Math.max(...childDist, 0.01);
    const barW = histW / childDist.length;

    // Background
    html += `<rect x="${histX}" y="${histY}" width="${histW}" height="${histH}" fill="#0a0e17" rx="3"/>`;

    // Bars
    childDist.forEach((p, i) => {
      const barH = (p / maxP) * histH * 0.9;
      const x = histX + i * barW;
      const y = histY + histH - barH;
      const pct = i * 5;
      const color = pct <= 25 ? '#10b981' : pct <= 75 ? '#f59e0b' : '#ef4444';
      if (barH > 0.5) {
        html += `<rect x="${x + 1}" y="${y}" width="${barW - 2}" height="${barH}" fill="${color}" opacity="0.7" rx="1"/>`;
      }
    });

    // X axis labels
    for (let i = 0; i <= 4; i++) {
      const pct = i * 25;
      const x = histX + (pct / 100) * histW;
      html += `<text x="${x}" y="${histY + histH + 12}" fill="#475569" font-size="8" text-anchor="middle">${pct}%</text>`;
    }
    html += `<text x="${histX + histW}" y="${histY + histH + 12}" fill="#475569" font-size="8" text-anchor="middle">100%</text>`;

    // Mother's level indicator
    const motherX = histX + (mitoHeteroplasmy / 100) * histW;
    html += `<line x1="${motherX}" y1="${histY - 2}" x2="${motherX}" y2="${histY + histH + 2}" stroke="var(--accent)" stroke-width="1.5" stroke-dasharray="3,2"/>`;
    html += `<text x="${motherX}" y="${histY - 5}" fill="var(--accent)" font-size="8" text-anchor="middle">mother ${mitoHeteroplasmy}%</text>`;

    // Info text below histogram
    const textY = histY + histH + 28;
    const lines = [
      'Mitochondrial bottleneck (~100-200 mt-DNA copies) causes',
      'stochastic redistribution. Child heteroplasmy can differ',
      'greatly from mother. Each tissue/cell can vary further.',
    ];
    lines.forEach((line, i) => {
      html += `<text x="${w/2}" y="${textY + i * 13}" fill="#475569" font-size="8.5" text-anchor="middle">${line}</text>`;
    });

    // Disease-specific note
    if (cross.mitoDisease && cross.mitoDisease.model !== 'none') {
      const noteY = textY + lines.length * 13 + 5;
      html += `<text x="${w/2}" y="${noteY}" fill="#94a3b8" font-size="8" text-anchor="middle" font-style="italic">Note: clinical thresholds vary by mutation, tissue, and individual.</text>`;
    }

    svg.innerHTML = html;
    svg.setAttribute('viewBox', `0 0 ${w} ${textY + 50}`);
    return;
  }

  const { g1, g2 } = cross.punnett;
  const w = 300, h = 200;
  const cellW = 60, cellH = 45;
  const startX = (w - (g2.length + 1) * cellW) / 2;
  const startY = 15;

  let html = '';
  const isDom = inheritance === 'ad' || inheritance === 'xd';

  // Header row (parent 2 alleles)
  g2.forEach((a, j) => {
    const x = startX + (j + 1) * cellW;
    html += `<text x="${x + cellW/2}" y="${startY + cellH/2 + 4}" fill="var(--accent)" font-size="14" text-anchor="middle" font-weight="700">${a}</text>`;
  });

  // Rows (parent 1 alleles)
  g1.forEach((a1, i) => {
    const y = startY + (i + 1) * cellH;
    html += `<text x="${startX + cellW/2}" y="${y + cellH/2 + 4}" fill="var(--accent)" font-size="14" text-anchor="middle" font-weight="700">${a1}</text>`;

    g2.forEach((a2, j) => {
      const x = startX + (j + 1) * cellW;
      const geno = [a1, a2].sort().join('');
      let color, bgOpacity;

      if (a2 === 'Y') {
        // Son
        color = a1 === 'a' ? 'var(--danger)' : 'var(--success)';
        bgOpacity = a1 === 'a' ? 0.15 : 0.08;
      } else if (isDom) {
        const aff = geno !== 'AA';
        color = aff ? 'var(--danger)' : 'var(--success)';
        bgOpacity = aff ? 0.15 : 0.08;
      } else {
        const isAff = geno === 'aa';
        const isCarrier = geno === 'Aa' || geno === 'aA';
        color = isAff ? 'var(--danger)' : isCarrier ? 'var(--warning)' : 'var(--success)';
        bgOpacity = isAff ? 0.15 : isCarrier ? 0.1 : 0.05;
      }

      html += `<rect x="${x + 2}" y="${y + 2}" width="${cellW - 4}" height="${cellH - 4}" fill="${color}" opacity="${bgOpacity}" rx="4"/>`;
      html += `<rect x="${x + 2}" y="${y + 2}" width="${cellW - 4}" height="${cellH - 4}" fill="none" stroke="${color}" stroke-width="1" opacity="0.3" rx="4"/>`;

      const label = a2 === 'Y' ? `${a1}Y` : geno;
      html += `<text x="${x + cellW/2}" y="${y + cellH/2 + 5}" fill="${color}" font-size="13" text-anchor="middle" font-family="monospace" font-weight="600">${label}</text>`;
    });
  });

  svg.innerHTML = html;
  svg.setAttribute('viewBox', `0 0 ${w} ${startY + (g1.length + 1) * cellH + 5}`);
}

function renderOffspring(cross) {
  const row = document.getElementById('offspring-row');
  const pen = penetrance / 100;
  const isMito = inheritance === 'mito';

  // For mitochondrial: risk includes both 'affected' and 'carrier' (variable heteroplasmy)
  // since carriers ARE at risk — heteroplasmy above zero means mutant mt-DNA is present
  let affectedRisk = 0;
  let atRiskTotal = 0; // affected + carrier (for mito: anyone with mutant load)
  cross.outcomes.forEach(o => {
    if (o.status === 'affected') affectedRisk += o.prob;
    if (o.status === 'affected' || o.status === 'carrier') atRiskTotal += o.prob;
  });

  // For non-mito: penetrance modifies the genotypic risk
  // For mito: penetrance doesn't apply in the same way — risk IS the heteroplasmy distribution
  const effectiveRisk = isMito ? affectedRisk : affectedRisk * pen;

  const preset = activePreset ? DISEASE_PRESETS[activePreset] : null;

  let html = cross.outcomes.map(o => {
    const pct = (o.prob * 100).toFixed(0);
    // For non-mito: show penetrance-adjusted phenotype
    let phenoLabel = o.status;
    if (!isMito && o.status === 'affected' && pen < 1) {
      phenoLabel = `affected (${penetrance}% pen.)`;
    }
    return `<div class="offspring-card ${o.status}">
      <div class="o-geno">${o.geno}</div>
      <div class="o-prob">${pct}%</div>
      <div class="o-pheno">${phenoLabel}</div>
    </div>`;
  }).join('');

  html += `<div class="risk-summary" style="width:100%;margin-top:0.3rem;">`;

  if (isMito) {
    // Mitochondrial: show transmission probability, NOT disease risk
    const mutCarrierProb = atRiskTotal;
    html += `<span class="risk-value" style="color:var(--accent);">${(mutCarrierProb * 100).toFixed(0)}%</span>`;
    html += `<div class="risk-label">probability child carries mutant mt-DNA</div>`;
    html += `<div class="risk-label" style="margin-top:0.2rem;color:var(--text-dim);font-size:0.63rem;line-height:1.35;">
      Heteroplasmy level in child varies due to bottleneck (see distribution above).
      Disease risk cannot be calculated from heteroplasmy alone — it depends on
      tissue distribution, mutation type, nuclear modifiers, age, and environment.
    </div>`;
    const disease = MITO_DISEASES[mitoDisease];
    if (disease && disease.model !== 'none') {
      html += `<div class="risk-label" style="margin-top:0.15rem;color:var(--text-muted);font-size:0.63rem;">${disease.info}</div>`;
    }
  } else {
    const riskClass = effectiveRisk >= 0.25 ? 'high' : effectiveRisk >= 0.05 ? 'medium' : 'low';
    html += `<span class="risk-value ${riskClass}">${(effectiveRisk * 100).toFixed(1)}%</span>`;
    html += `<div class="risk-label">risk per child${pen < 1 ? ` (${penetrance}% penetrance)` : ''}</div>`;
    if (preset) html += `<div class="risk-label" style="margin-top:0.2rem;color:var(--text-muted)">${preset.info}</div>`;
  }

  html += `</div>`;
  row.innerHTML = html;
}

// ── Pedigree Mode ───────────────────────────────────────────────
function addPedigreeChild() {
  const cross = calcCross();
  // Random child based on probabilities
  const r = Math.random();
  let cum = 0;
  let child = cross.outcomes[0];
  for (const o of cross.outcomes) {
    cum += o.prob;
    if (r <= cum) { child = o; break; }
  }
  // Apply penetrance
  if (child.status === 'affected' && Math.random() > penetrance / 100) {
    child = { ...child, status: 'unaffected', penetranceNote: true };
  }
  pedigreeChildren.push(child);
  renderPedigree();
}

function renderPedigree() {
  const svg = document.getElementById('pedigree-svg');
  const isDom = inheritance === 'ad' || inheritance === 'xd';
  const isX = inheritance === 'xr' || inheritance === 'xd';
  const w = 500, h = 320;

  let html = '';

  // Parents — generation I
  const p1x = 160, p2x = 340, py = 50, size = 24;

  // Parent 1 (circle = female if X-linked, else square)
  const p1shape = isX ? 'circle' : 'square';
  const p1color = getGenoColor(p1geno, isDom, false);
  html += drawPerson(p1x, py, size, p1shape, p1color, p1geno);

  // Parent 2
  const p2shape = isX ? 'square' : 'square';
  const p2color = getGenoColor(p2geno, isDom, isX);
  html += drawPerson(p2x, py, size, p2shape, p2color, p2geno);

  // Marriage line
  html += `<line x1="${p1x + size}" y1="${py}" x2="${p2x - size}" y2="${py}" stroke="#475569" stroke-width="1.5"/>`;

  // Descent line
  const midX = (p1x + p2x) / 2;
  html += `<line x1="${midX}" y1="${py}" x2="${midX}" y2="${py + 50}" stroke="#475569" stroke-width="1.5"/>`;

  // Children — generation II
  const nKids = pedigreeChildren.length || 0;
  if (nKids > 0) {
    const childSpacing = Math.min(70, (w - 60) / nKids);
    const startCX = midX - (nKids - 1) * childSpacing / 2;
    const cy = py + 100;

    // Horizontal line above children
    if (nKids > 1) {
      html += `<line x1="${startCX}" y1="${py + 50}" x2="${startCX + (nKids - 1) * childSpacing}" y2="${py + 50}" stroke="#475569" stroke-width="1.5"/>`;
    }

    pedigreeChildren.forEach((child, i) => {
      const cx = startCX + i * childSpacing;
      html += `<line x1="${cx}" y1="${py + 50}" x2="${cx}" y2="${cy - size}" stroke="#475569" stroke-width="1"/>`;

      const isMale = child.geno.includes('Y') || child.geno.includes('♂');
      const shape = isMale ? 'square' : (isX ? 'circle' : (Math.random() > 0.5 ? 'circle' : 'square'));
      const color = child.status === 'affected' ? '#ef4444' : child.status === 'carrier' ? '#f59e0b' : '#10b981';
      const filled = child.status === 'affected';
      html += drawPerson(cx, cy, 18, shape, color, '', filled);

      // Label
      html += `<text x="${cx}" y="${cy + 32}" fill="#94a3b8" font-size="8" text-anchor="middle">${child.geno}</text>`;
    });
  } else {
    html += `<text x="${midX}" y="${py + 80}" fill="#475569" font-size="10" text-anchor="middle">Click "+ Add child" to simulate offspring</text>`;
  }

  // Legend
  const ly = h - 30;
  html += `<circle cx="20" cy="${ly}" r="6" fill="none" stroke="#10b981" stroke-width="1.5"/>`;
  html += `<text x="32" y="${ly + 4}" fill="#64748b" font-size="8">Unaffected</text>`;
  html += `<circle cx="100" cy="${ly}" r="6" fill="none" stroke="#f59e0b" stroke-width="1.5"/>`;
  html += `<text x="112" y="${ly + 4}" fill="#64748b" font-size="8">Carrier</text>`;
  html += `<circle cx="165" cy="${ly}" r="6" fill="#ef4444" stroke="#ef4444" stroke-width="1.5"/>`;
  html += `<text x="177" y="${ly + 4}" fill="#64748b" font-size="8">Affected</text>`;

  // Stats
  if (nKids > 0) {
    const aff = pedigreeChildren.filter(c => c.status === 'affected').length;
    const carr = pedigreeChildren.filter(c => c.status === 'carrier').length;
    html += `<text x="${w - 10}" y="${ly + 4}" fill="#64748b" font-size="9" text-anchor="end">${aff}/${nKids} affected, ${carr}/${nKids} carriers</text>`;
  }

  svg.innerHTML = html;
  document.getElementById('ped-info').textContent = nKids > 0 ? `${nKids} children simulated` : '';
}

function drawPerson(x, y, size, shape, color, label, filled) {
  let html = '';
  if (shape === 'circle') {
    html += `<circle cx="${x}" cy="${y}" r="${size}" fill="${filled ? color : 'none'}" stroke="${color}" stroke-width="2"/>`;
  } else {
    html += `<rect x="${x - size}" y="${y - size}" width="${size * 2}" height="${size * 2}" fill="${filled ? color : 'none'}" stroke="${color}" stroke-width="2" rx="2"/>`;
  }
  if (label) {
    html += `<text x="${x}" y="${y + size + 14}" fill="#94a3b8" font-size="9" text-anchor="middle" font-family="monospace">${label}</text>`;
  }
  return html;
}

function getGenoColor(geno, isDom, isFatherXLinked) {
  if (isFatherXLinked) {
    return geno === 'XaY' ? '#ef4444' : '#10b981';
  }
  if (isDom) return geno === 'AA' ? '#10b981' : '#ef4444';
  if (geno === 'aa') return '#ef4444';
  if (geno === 'Aa') return '#f59e0b';
  return '#10b981';
}

// ── Quiz Mode ───────────────────────────────────────────────────
const QUIZZES = [
  {
    q: 'Two unaffected parents have an affected child. What is the most likely inheritance pattern?',
    opts: ['Autosomal Dominant', 'Autosomal Recessive', 'X-linked Dominant', 'Mitochondrial'],
    answer: 1,
    explain: 'Both parents must be carriers (Aa). The affected child is homozygous (aa). This is autosomal recessive inheritance.',
  },
  {
    q: 'An affected father and unaffected mother have 3 affected daughters and 2 unaffected sons. Most likely pattern?',
    opts: ['Autosomal Recessive', 'X-linked Recessive', 'Autosomal Dominant', 'X-linked Dominant'],
    answer: 3,
    explain: 'X-linked dominant: affected father passes X to all daughters (affected) and Y to all sons (unaffected).',
  },
  {
    q: 'A carrier mother (X-linked recessive) and unaffected father. What is the risk for each son?',
    opts: ['0%', '25%', '50%', '100%'],
    answer: 2,
    explain: 'Carrier mother (XᴬXᵃ) passes Xᵃ to 50% of sons. These sons (XᵃY) are affected.',
  },
  {
    q: 'Both parents are carriers for cystic fibrosis (Aa × Aa). What fraction of UNAFFECTED children are carriers?',
    opts: ['1/4', '1/3', '2/3', '3/4'],
    answer: 2,
    explain: 'Aa × Aa → 1 AA : 2 Aa : 1 aa. Among 3 unaffected (1 AA + 2 Aa), 2/3 are carriers.',
  },
  {
    q: 'Huntington disease has 100% penetrance and is autosomal dominant. One parent is Aa. What is the risk per child?',
    opts: ['25%', '50%', '75%', '100%'],
    answer: 1,
    explain: 'Aa × AA → 50% Aa (affected) and 50% AA (unaffected). Each child has 50% risk.',
  },
];

function loadQuiz() {
  const area = document.getElementById('quiz-area');
  const quiz = QUIZZES[quizIndex % QUIZZES.length];

  area.innerHTML = `
    <div class="quiz-question">${quiz.q}</div>
    <div class="quiz-options">
      ${quiz.opts.map((opt, i) => `<button class="quiz-opt" data-i="${i}">${opt}</button>`).join('')}
    </div>
  `;

  area.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = parseInt(btn.dataset.i);
      area.querySelectorAll('.quiz-opt').forEach(b => {
        b.classList.add(parseInt(b.dataset.i) === quiz.answer ? 'correct' : 'wrong');
        b.disabled = true;
      });
      const correct = i === quiz.answer;
      area.innerHTML += `
        <div class="quiz-feedback" style="background:${correct ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}">
          ${correct ? 'Correct!' : 'Not quite.'} ${quiz.explain}
        </div>
        <button class="quiz-next" id="quiz-next">Next question</button>
      `;
      document.getElementById('quiz-next').addEventListener('click', () => {
        quizIndex++;
        loadQuiz();
      });
    });
  });
}

// ── Go ──────────────────────────────────────────────────────────
init();
